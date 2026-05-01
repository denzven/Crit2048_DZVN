/**
 * PACK ENGINE — Core Content Pack runtime.
 * Loads, validates, merges, and dispatches all installed Content Packs.
 *
 * Load order: after data.js (needs ENCOUNTERS, CLASSES), before main.js.
 * Boot:  PackEngine.init()  called inside  bootstrapGame()  in main.js.
 */
(function () {

  // ── Constants ─────────────────────────────────────────────────────────────
  const BLOCKED_KEYWORDS = ['window.','document.','fetch(','XMLHttpRequest','import(','eval(','Function(','__TAURI__'];
  const VALID_EFFECTS    = ['spawn_hazard','regen','damage_reduction','tile_shuffle','weapon_degrade','weapon_destroy','drain_slides','drain_gold','crit_immune','spell_cost_up','custom_spawn'];
  const VALID_TRIGGERS   = ['every_n_slides','on_damage','on_hp_below','on_slide_start','on_weapon_merge'];
  const VALID_TYPES      = ['dungeon','class','skin','mega'];
  const BUILTIN_HAZARDS  = { slime:-1, goblin:-2, skeleton:-3, mimic:-4, web:-5, curse:-6, spore:-7 };

  // ── Snapshots of original game data (taken once at init) ─────────────────
  let _baseEncounters = null;
  let _baseClassKeys  = null;

  // ── Runtime state ─────────────────────────────────────────────────────────
  let _weaponOverrides = {}; // tileValue → weaponStats object
  let _customHazards   = {}; // hazard id → hazard def
  let _activeSkin      = null;
  let _damageReduction = 0;  // % from current encounter passive

  // ── Helpers ───────────────────────────────────────────────────────────────
  function _scanForAdvanced(pack) {
    const haystack = JSON.stringify(pack);
    return haystack.includes('"mode":"advanced"') || haystack.includes('"mode": "advanced"');
  }

  // ── GameAPI builder ───────────────────────────────────────────────────────
  function _buildGameAPI(stateRef) {
    return Object.freeze({
      get slides() { return stateRef.slidesTotalInEncounter; },

      enemy: Object.freeze({
        get hp()    { return stateRef.monsterHp; },
        get maxHp() { return stateRef.monsterMaxHp; },
        healHp(n)     { stateRef.monsterHp = Math.min(stateRef.monsterMaxHp, stateRef.monsterHp + n); },
        dealDamage(n) { if (typeof applyDamage === 'function') applyDamage(n); }
      }),

      player: Object.freeze({
        get gold()       { return stateRef.gold; },
        get multiplier() { return stateRef.multiplier; },
        get classId()    { return stateRef.playerClass ? stateRef.playerClass.id : ''; },
        addGold(n)       { stateRef.gold += n; },
        drainSlides(n)   { stateRef.slidesLeft = Math.max(0, stateRef.slidesLeft - n); },
        addMultiplier(n) { stateRef.multiplier += n; }
      }),

      spawnHazard(id) {
        const val = BUILTIN_HAZARDS[id] ?? (_customHazards[id] ? _customHazards[id].tileValue : null);
        if (val != null && typeof spawnRandomTile === 'function') spawnRandomTile(val);
      },

      get grid() { return (stateRef.grid || []).map(t => t ? { val: t.val } : null); },

      log(msg) { if (typeof addLog === 'function') addLog(String(msg)); },

      shuffleTiles(n) {
        const filled = (stateRef.grid || []).map((t,i) => ({t,i})).filter(x => x.t);
        for (let i = 0; i < Math.min(n, filled.length); i++) {
          const a = prngInt(0, filled.length - 1), b = prngInt(0, filled.length - 1);
          const tmp = stateRef.grid[filled[a].i];
          stateRef.grid[filled[a].i] = stateRef.grid[filled[b].i];
          stateRef.grid[filled[b].i] = tmp;
        }
      },

      degradeWeapon(sel) {
        let best = sel === 'best' ? 0 : Infinity, idx = -1;
        (stateRef.grid || []).forEach((t,i) => {
          if (!t || t.val <= 0) return;
          if ((sel === 'best' && t.val > best) || (sel === 'worst' && t.val < best)) { best = t.val; idx = i; }
        });
        if (idx >= 0) { stateRef.grid[idx].val = Math.max(2, stateRef.grid[idx].val / 2); addLog(`Enemy degraded your ${sel} weapon!`); }
      },

      destroyWeapon(sel) {
        let best = sel === 'best' ? 0 : Infinity, idx = -1;
        (stateRef.grid || []).forEach((t,i) => {
          if (!t || t.val <= 0) return;
          if ((sel === 'best' && t.val > best) || (sel === 'worst' && t.val < best)) { best = t.val; idx = i; }
        });
        if (idx >= 0) { stateRef.grid[idx] = null; addLog(`Enemy destroyed your ${sel} weapon!`); }
      },

      prng: () => typeof prng === 'function' ? prng() : Math.random()
    });
  }

  // ── Trigger evaluator (Simple Mode) ──────────────────────────────────────
  function _checkTrigger(ability, stateRef) {
    const n = ability.triggerParam || 10;
    switch (ability.trigger) {
      case 'every_n_slides':   return stateRef.slidesTotalInEncounter > 0 && stateRef.slidesTotalInEncounter % n === 0;
      case 'on_hp_below':      return (stateRef.monsterHp / stateRef.monsterMaxHp) * 100 < n;
      case 'on_slide_start':   return true;
      case 'on_damage':        return false; // handled in onDamage
      case 'on_weapon_merge':  return false; // handled in onMerge
      default:                 return false;
    }
  }

  // ── Effect dispatcher (Simple Mode) ──────────────────────────────────────
  function _applyEffect(ability, stateRef, G) {
    const p = ability.effectParam;
    const name = ability.name || 'Enemy';
    switch (ability.effect) {
      case 'spawn_hazard':    G.spawnHazard(p); break;
      case 'regen':           stateRef.monsterHp = Math.min(stateRef.monsterMaxHp, stateRef.monsterHp + (p || 0)); break;
      case 'tile_shuffle':    G.shuffleTiles(p || 2); break;
      case 'weapon_degrade':  G.degradeWeapon(p || 'best'); break;
      case 'weapon_destroy':  G.destroyWeapon(p || 'best'); break;
      case 'drain_slides':    G.player.drainSlides(p || 1); break;
      case 'drain_gold': {
        const stolen = Math.min(stateRef.gold, p || 0);
        stateRef.gold -= stolen;
        if (stolen > 0) addLog(`${name} stole ${stolen} gold!`);
        break;
      }
      case 'custom_spawn': {
        const hz = _customHazards[p];
        if (hz && typeof spawnRandomTile === 'function') spawnRandomTile(hz.tileValue);
        break;
      }
      case 'crit_immune':     break; // flagged on encounter, checked in d20.js
      case 'spell_cost_up':   break; // flagged on encounter, checked in spells.js
    }
    if (ability.logMessage) addLog(ability.logMessage.replace('${amount}', p || ''));
  }

  // ── Apply sub-systems ─────────────────────────────────────────────────────
  function _applyEnemies(enemies) {
    enemies.forEach(enemy => {
      const pos = ENCOUNTERS.findIndex(e => e.id === enemy.id);
      if (pos >= 0) ENCOUNTERS[pos] = { ...enemy };
      else ENCOUNTERS.push({ ...enemy });
    });
  }

  function _applyClasses(classes) {
    classes.forEach(cls => {
      CLASSES[cls.id.toUpperCase()] = {
        id: cls.name,
        icon: cls.icon,
        desc: cls.desc,
        d20Mod: cls.d20Mod || 0,
        ability: cls.ability || null,
        _packDef: cls
      };
    });
  }

  function _applyWeapons(weapons) {
    weapons.forEach(w => { _weaponOverrides[w.tileValue] = w; });
    // Patch getWeaponStats to check overrides first
    if (!window._origGetWeaponStats) {
      window._origGetWeaponStats = window.getWeaponStats;
      window.getWeaponStats = function(val) {
        if (_weaponOverrides[val]) {
          const o = _weaponOverrides[val];
          return { name: o.name, icon: o.icon, bg: o.bg, text: o.text, dmg: o.dmg || 0 };
        }
        return window._origGetWeaponStats(val);
      };
    }
  }

  function _applyHazards(hazards) {
    hazards.forEach(hz => { _customHazards[hz.id] = hz; });
  }

  function _applyArtifacts(artifacts) {
    if (!window.MASTER_ARTIFACTS) return;
    artifacts.forEach(art => {
      const pos = MASTER_ARTIFACTS.findIndex(a => a.id === art.id);
      const entry = { ...art, desc: () => art.desc || '' };
      if (pos >= 0) MASTER_ARTIFACTS[pos] = entry;
      else MASTER_ARTIFACTS.push(entry);
    });
  }

  function _applySkin(skin) {
    if (!skin) return;
    const root = document.documentElement.style;
    if (skin.cssVars) Object.entries(skin.cssVars).forEach(([k, v]) => root.setProperty(k, v));
    if (skin.fontUrl) {
      let link = document.getElementById('pack-font-link');
      if (!link) { link = document.createElement('link'); link.id = 'pack-font-link'; link.rel = 'stylesheet'; document.head.appendChild(link); }
      link.href = skin.fontUrl;
    }
    if (skin.fontFamily) root.setProperty('--pack-font', skin.fontFamily);
  }

  function _resetSkin() {
    const root = document.documentElement.style;
    ['--pack-primary','--pack-accent','--pack-bg','--pack-surface','--pack-border','--pack-tile-radius','--pack-font'].forEach(v => root.removeProperty(v));
    const link = document.getElementById('pack-font-link');
    if (link) link.href = '';
  }

  // ── Sandboxed script runner ───────────────────────────────────────────────
  function _runScript(scriptStr, stateRef, extraArgs) {
    if (!scriptStr) return;
    if (BLOCKED_KEYWORDS.some(kw => scriptStr.includes(kw))) {
      console.warn('PackEngine: Blocked keyword in script — execution denied.');
      return;
    }
    try {
      const G = _buildGameAPI(stateRef);
      const keys = ['G', ...Object.keys(extraArgs || {})];
      const vals = [G,  ...Object.values(extraArgs || {})];
      // eslint-disable-next-line no-new-func
      const fn = new Function(...keys, `"use strict";\n${scriptStr}`);
      fn(...vals);
    } catch (e) {
      console.warn('PackEngine: Script runtime error:', e.message);
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  const PackEngine = {

    // ── Lifecycle ──────────────────────────────────────────────────────────
    async init() {
      // Snapshot original game data on first boot
      if (!_baseEncounters) _baseEncounters = ENCOUNTERS.map(e => ({ ...e }));
      if (!_baseClassKeys)  _baseClassKeys  = Object.keys(CLASSES);
      await this.applyActivePacks();
    },

    // ── Apply all installed packs to game globals ─────────────────────────
    async applyActivePacks() {
      // Reset game data to baseline snapshots
      if (!_baseEncounters) _baseEncounters = ENCOUNTERS.map(e => ({ ...e }));
      if (!_baseClassKeys)  _baseClassKeys  = Object.keys(CLASSES);

      ENCOUNTERS.splice(0, ENCOUNTERS.length, ..._baseEncounters.map(e => ({ ...e })));
      Object.keys(CLASSES).forEach(k => { if (!_baseClassKeys.includes(k)) delete CLASSES[k]; });
      
      _weaponOverrides = {};
      _customHazards   = {};
      _damageReduction = 0;
      _activeSkin      = null;

      // Determine which packs to apply
      // Use activePackIds if defined (e.g. specialized run), otherwise apply all installed (Expansion mode)
      const activeIds = (window.state && state.runStats && state.runStats.activePackIds) || [];
      const installed = await PackStorage.listInstalled();
      
      const packsToApply = installed.filter(entry => {
        if (activeIds.length > 0) return activeIds.includes(entry.id);
        return true; 
      });

      for (const entry of packsToApply) {
        const pack = await PackStorage.load(entry.id);
        if (!pack) continue;

        // Apply Enemies: Mega packs replace the whole dungeon run
        if (pack.type === 'mega' && pack.enemies && pack.enemies.length > 0) {
          ENCOUNTERS.splice(0, ENCOUNTERS.length, ...pack.enemies.map(e => ({...e})));
        } else if (pack.enemies) {
          _applyEnemies(pack.enemies);
        }

        if (pack.classes)   _applyClasses(pack.classes);
        if (pack.weapons)   _applyWeapons(pack.weapons);
        if (pack.hazards)   _applyHazards(pack.hazards);
        if (pack.artifacts) _applyArtifacts(pack.artifacts);
        if (pack.skin)      _activeSkin = pack.skin;
      }

      if (_activeSkin) _applySkin(_activeSkin); else _resetSkin();

      console.log(`PackEngine: Applied ${packsToApply.length} pack(s). Encounters: ${ENCOUNTERS.length}`);
    },

    // ── Install a pack ────────────────────────────────────────────────────
    async installPack(packJson) {
      const validation = this.validatePack(packJson);
      if (!validation.valid) return { success: false, errors: validation.errors };

      // Auto-detect advanced scripting
      packJson.hasAdvancedScripts = _scanForAdvanced(packJson);

      const ok = await PackStorage.save(packJson);
      if (ok) await this.applyActivePacks();
      return { success: ok, errors: ok ? [] : ['Storage failed'] };
    },

    // ── Remove a pack ─────────────────────────────────────────────────────
    async removePack(packId) {
      const ok = await PackStorage.delete(packId);
      if (ok) await this.applyActivePacks();
      return ok;
    },

    // ── Validate a pack object ────────────────────────────────────────────
    validatePack(pack) {
      const errors = [];
      const req = ['id','name','version','author','description','type','game_version','icon'];
      req.forEach(f => { if (!pack[f]) errors.push(`Missing required field: "${f}"`); });
      if (pack.type && !VALID_TYPES.includes(pack.type)) errors.push(`Invalid type: "${pack.type}"`);
      if (pack.id && !/^[a-z0-9-]+$/.test(pack.id)) errors.push('ID must be lowercase letters, numbers, and hyphens only');

      const checkScript = (script, ctx) => {
        if (!script) return;
        Object.values(script).forEach(s => {
          BLOCKED_KEYWORDS.forEach(kw => { if (s.includes(kw)) errors.push(`${ctx}: blocked keyword "${kw}"`); });
        });
      };

      (pack.enemies || []).forEach((e, i) => {
        if (!e.id || !e.name || !e.hp || !e.slides || !e.mode) errors.push(`enemy[${i}]: missing required field`);
        if (e.mode === 'advanced') checkScript(e.script, `enemy "${e.id}"`);
      });
      (pack.classes || []).forEach((c, i) => {
        if (!c.id || !c.name || !c.icon || !c.desc) errors.push(`class[${i}]: missing required field`);
        if (c.ability?.mode === 'advanced') checkScript(c.ability.script, `class "${c.id}" ability`);
      });
      (pack.hazards || []).forEach((h, i) => {
        if (h.tileValue >= -7) errors.push(`hazard[${i}]: tileValue must be ≤ -8`);
      });
      (pack.artifacts || []).forEach((a, i) => {
        if (!a.id || !a.name || !a.icon || !a.desc) errors.push(`artifact[${i}]: missing required field`);
      });
      return { valid: errors.length === 0, errors };
    },

    // ── Public accessors ──────────────────────────────────────────────────
    async getInstalledPacks() { return await PackStorage.listInstalled(); },
    async isInstalled(id)     { return await PackStorage.isInstalled(id); },
    getDamageReduction(){ return _damageReduction; },
    getCustomHazard(id) { return _customHazards[id] || null; },

    // ── Combat hooks (called from combat.js) ──────────────────────────────

    /** Called after every player slide. */
    onSlide(stateRef) {
      const enc = ENCOUNTERS[stateRef.encounterIdx];
      if (!enc || enc.mode === 'builtin') return;

      if (enc.mode === 'simple') {
        const G = _buildGameAPI(stateRef);
        // Primary ability trigger check
        if (enc.primaryAbility && _checkTrigger(enc.primaryAbility, stateRef)) {
          _applyEffect(enc.primaryAbility, stateRef, G);
        }
        // Passive regen (always-on)
        if (enc.passiveAbility && enc.passiveAbility.effect === 'regen') {
          stateRef.monsterHp = Math.min(stateRef.monsterMaxHp, stateRef.monsterHp + (enc.passiveAbility.effectParam || 0));
        }
        // Passive damage_reduction — set flag for onDamage
        _damageReduction = (enc.passiveAbility && enc.passiveAbility.effect === 'damage_reduction')
          ? (enc.passiveAbility.effectParam || 0) : 0;
      } else if (enc.mode === 'advanced' && enc.script && enc.script.onSlide) {
        _runScript(enc.script.onSlide, stateRef, {});
      }
    },

    /** Called after applyDamage(). Raw pre-reduction damage passed in. */
    onDamage(stateRef, dmg) {
      const enc = ENCOUNTERS[stateRef.encounterIdx];
      if (!enc) return;

      // Apply passive damage reduction for simple enemies
      if (enc.mode === 'simple' && enc.passiveAbility && enc.passiveAbility.effect === 'damage_reduction') {
        const reduction = (enc.passiveAbility.effectParam || 0) / 100;
        const restored = Math.floor(dmg * reduction);
        if (restored > 0) {
          stateRef.monsterHp = Math.min(stateRef.monsterMaxHp, stateRef.monsterHp + restored);
          const msg = (enc.passiveAbility.logMessage || 'Enemy resists!').replace('${amount}', restored);
          addLog(msg);
        }
      }

      // Check on_damage triggers for primary ability
      if (enc.mode === 'simple' && enc.primaryAbility && enc.primaryAbility.trigger === 'on_damage') {
        const threshold = enc.primaryAbility.triggerParam || 0;
        if (dmg >= threshold) {
          const G = _buildGameAPI(stateRef);
          _applyEffect(enc.primaryAbility, stateRef, G);
        }
      } else if (enc.mode === 'advanced' && enc.script && enc.script.onDamage) {
        _runScript(enc.script.onDamage, stateRef, { dmg });
      }
    },

    /** Called at the start of an encounter. */
    onEncounterStart(stateRef, enc) {
      if (!enc || enc.mode === 'builtin') return;
      if (enc.mode === 'advanced' && enc.script && enc.script.onEncounterStart) {
        _runScript(enc.script.onEncounterStart, stateRef, {});
      }
      // Track custom enemies
      if (enc.mode !== 'builtin') {
        stateRef.runStats = stateRef.runStats || {};
      }
    },

    /** Called when an enemy is defeated. */
    onEncounterEnd(stateRef, enc) {
      if (!enc || enc.mode === 'builtin') return;

      // Death reward for simple enemies
      if (enc.mode === 'simple' && enc.deathReward) {
        const bonus = enc.deathReward.goldBonus || 0;
        if (bonus > 0) { stateRef.gold += bonus; }
        if (enc.deathReward.logMessage) addLog(enc.deathReward.logMessage);
      } else if (enc.mode === 'advanced' && enc.script && enc.script.onDeath) {
        _runScript(enc.script.onDeath, stateRef, {});
      }

      if (stateRef.runStats) stateRef.runStats.customEnemiesDefeated = (stateRef.runStats.customEnemiesDefeated || 0) + 1;
    },

    /** Called when player casts a spell (for pack class passives). */
    onSpellCast(stateRef, spellType) {
      const cls = stateRef.playerClass;
      if (!cls || !cls._packDef) return;
      const def = cls._packDef;
      if (def.passiveTrigger === 'on_spell_cast') {
        this._dispatchClassPassive(def, stateRef);
      }
    },

    /** Called when a weapon tile merges. */
    onMerge(stateRef, newVal) {
      const enc = ENCOUNTERS[stateRef.encounterIdx];
      if (enc && enc.mode === 'simple' && enc.primaryAbility && enc.primaryAbility.trigger === 'on_weapon_merge') {
        if (enc.primaryAbility.triggerParam === newVal) {
          const G = _buildGameAPI(stateRef);
          _applyEffect(enc.primaryAbility, stateRef, G);
        }
      }
      // Class passive
      const cls = stateRef.playerClass;
      if (cls && cls._packDef) {
        const def = cls._packDef;
        if (def.passiveTrigger === 'on_merge' || (def.passiveTrigger === 'on_merge_t3' && newVal >= 8)) {
          this._dispatchClassPassive(def, stateRef);
        }
      }
    },

    /** Called on D20 natural 20 (crit). */
    onCrit(stateRef) {
      const cls = stateRef.playerClass;
      if (!cls || !cls._packDef) return;
      const def = cls._packDef;
      if (def.passiveTrigger === 'on_crit') this._dispatchClassPassive(def, stateRef);
    },

    _dispatchClassPassive(def, stateRef) {
      const p = def.passiveParam || 0;
      switch (def.passiveEffect) {
        case 'restore_slides':   stateRef.slidesLeft += p; addLog(`${def.name}: +${p} slides!`); break;
        case 'add_gold':         stateRef.gold += p; addLog(`${def.name}: +${p} gold!`); break;
        case 'add_multiplier':   stateRef.multiplier += p; break;
        case 'deal_damage':      if (typeof applyDamage === 'function') applyDamage(p); break;
      }
    },

    /** Run a pack spell's advanced onCast script. Returns true if handled. */
    runPackSpell(stateRef, abilityDef, rollResult) {
      if (!abilityDef || abilityDef.mode !== 'advanced') return false;
      if (abilityDef.script && abilityDef.script.onCast) {
        _runScript(abilityDef.script.onCast, stateRef, { roll: rollResult });
        return true;
      }
      return false;
    },

    /** Update runStats pack labels — call at start of each new run. */
    async refreshRunStats(stateRef) {
      if (!stateRef.runStats) return;

      // Use current selection if set, otherwise default to all installed (Expansion mode)
      let activeIds = stateRef.runStats.activePackIds || [];
      
      if (activeIds.length === 0) {
        const installed = await PackStorage.listInstalled();
        activeIds = installed.map(p => p.id);
        stateRef.runStats.activePackIds = activeIds;
      }

      if (activeIds.length === 0) {
        stateRef.runStats.packRunLabel = "";
        return;
      }

      if (activeIds.length === 1) {
        const p = await PackStorage.load(activeIds[0]);
        stateRef.runStats.packRunLabel = p ? `${p.name} v${p.version}` : activeIds[0];
      } else {
        stateRef.runStats.packRunLabel = `Mixed Run (${activeIds.length} packs)`;
      }
    }
  };

  window.PackEngine = PackEngine;
})();
