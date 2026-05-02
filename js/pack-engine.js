/**
 * PACK ENGINE — Core Content Pack runtime.
 * Loads, validates, merges, and dispatches all installed Content Packs.
 *
 * Load order: after data.js (needs ENCOUNTERS, CLASSES), before main.js.
 * Boot:  PackEngine.init()  called inside  bootstrapGame()  in main.js.
 */
(function () {

  // ── Constants ─────────────────────────────────────────────────────────────
  const BLOCKED_KEYWORDS = ['window.location','window.localStorage','window.sessionStorage','document.cookie','document.location','fetch(','XMLHttpRequest','import(','eval(','Function(','__TAURI__'];
  const VALID_EFFECTS    = ['spawn_hazard','regen','damage_reduction','tile_shuffle','weapon_degrade','weapon_destroy','drain_slides','drain_gold','crit_immune','spell_cost_up','custom_spawn'];
  const VALID_TRIGGERS   = ['every_n_slides','on_damage','on_hp_below','on_slide_start','on_weapon_merge'];
  const VALID_TYPES      = ['dungeon','class','skin','mega','artifacts','weapon','hazard'];
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

  const _localPrngInt = (min, max) => {
    if (typeof prngInt === 'function') return prngInt(min, max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  // ── GameAPI builder ───────────────────────────────────────────────────────
  function _buildGameAPI(s) {
    const stateRef = s || window.state || {};
    return Object.freeze({
      get slides() { return stateRef.slidesTotalInEncounter || 0; },

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
      get gridArray() { return stateRef.grid || []; },
      clearTile(idx) { if (stateRef.grid && stateRef.grid[idx]) stateRef.grid[idx] = null; },
      setTile(idx, val) { 
        if (stateRef.grid) stateRef.grid[idx] = { id: (typeof tileIdCounter !== 'undefined' ? tileIdCounter++ : Date.now()), val, pop: true }; 
      },
      sfx(name) { if (typeof SFX !== 'undefined' && SFX[name]) SFX[name](); },
      playFx(name, r, c) { if (typeof playGridFx !== 'undefined') playGridFx(name, r, c); },
      shake() { if (typeof triggerScreenShake !== 'undefined') triggerScreenShake(); },
      getArtifact(id) { return typeof getArtifactLevel !== 'undefined' ? getArtifactLevel(id) : 0; },
      addSlides(n) { stateRef.slidesLeft += n; },
      setHunterMark(n) { stateRef.hunterMarkLeft = n; },
      timeout: (ms, cb) => setTimeout(cb, ms),
      render() {
        if (typeof renderGrid !== 'undefined') renderGrid();
        if (typeof renderHUD !== 'undefined') renderHUD();
        if (typeof checkGameState !== 'undefined') checkGameState();
      },

      log(msg) { if (typeof addLog === 'function') addLog(String(msg)); },

      shuffleTiles(n) {
        const filled = (stateRef.grid || []).map((t,i) => ({t,i})).filter(x => x.t);
        for (let i = 0; i < Math.min(n, filled.length); i++) {
          const a = _localPrngInt(0, filled.length - 1), b = _localPrngInt(0, filled.length - 1);
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

      prng: () => typeof prng === 'function' ? prng() : Math.random(),
      prngInt: (min, max) => _localPrngInt(min, max),
      
      injectCss: (id, css) => {
        let el = document.getElementById(`pack-css-${id}`);
        if (!el) {
          el = document.createElement('style');
          el.id = `pack-css-${id}`;
          document.head.appendChild(el);
        }
        el.textContent = css;
      },
      
      removeCss: (id) => {
        const el = document.getElementById(`pack-css-${id}`);
        if (el) el.remove();
      },

      dom: Object.freeze({
        create: (tag, id, className) => {
          const allowed = ['div','span','style','canvas'];
          if (!allowed.includes(tag)) return null;
          const el = document.createElement(tag);
          if (id) el.id = id;
          if (className) el.className = className;
          return el;
        },
        append: (parent, child) => {
          if (!child) return;
          if (parent === 'body') document.body.appendChild(child);
          else if (typeof parent === 'string') {
             const p = document.getElementById(parent);
             if (p) p.appendChild(child);
          } else if (parent && parent.appendChild) {
             parent.appendChild(child);
          }
        }
      }),

      utils: Object.freeze({
        wait: (ms) => new Promise(r => setTimeout(r, ms)),
        onInterval: (cb, ms) => setInterval(cb, ms),
        onFrame: (cb) => requestAnimationFrame(cb)
      }),
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
    weapons.forEach(w => { 
      const key = w.tileValue ?? w.value;
      if (key != null) _weaponOverrides[key] = w; 
    });
  }

  function _applyHazards(hazards) {
    hazards.forEach(hz => { 
      _customHazards[hz.id] = hz; 
      if (hz.tileValue != null) _hazardOverrides[hz.tileValue] = hz;
    });
  }

  function _applyArtifacts(artifacts) {
    if (typeof MASTER_ARTIFACTS === 'undefined') return;
    artifacts.forEach(art => {
      const pos = MASTER_ARTIFACTS.findIndex(a => a.id === art.id);
      const entry = { 
        ...art, 
        basePrice: Number(art.basePrice || art.price || 15) || 15,
        rarity: art.rarity || "Common",
        classReq: art.classReq ?? null,
        desc: (lvl) => {
          if (typeof art.desc === 'function') return art.desc(lvl);
          if (typeof art.desc === 'string') {
            try {
              if (art.desc.includes('${')) return new Function('lvl', `return \`${art.desc}\`;`)(lvl);
              return art.desc;
            } catch(e) { return art.desc; }
          }
          return '';
        }
      };
      if (pos >= 0) MASTER_ARTIFACTS[pos] = entry;
      else MASTER_ARTIFACTS.push(entry);
    });
  }

  function _applySkin(skin, stateRef) {
    if (!skin) return;
    const root = document.documentElement.style;
    
    // Support both direct cssVars and Forge properties
    if (skin.cssVars) {
      Object.entries(skin.cssVars).forEach(([k, v]) => root.setProperty(k, v));
    }
    
    // Map Forge properties to CSS variables
    if (skin.primaryColor) root.setProperty('--pack-primary', skin.primaryColor);
    if (skin.accentColor)  root.setProperty('--pack-accent', skin.accentColor);
    if (skin.bgColor)      root.setProperty('--pack-bg', skin.bgColor);
    if (skin.borderRadius) root.setProperty('--pack-tile-radius', skin.borderRadius);
    if (skin.bgImage)      root.setProperty('--pack-bg-image', `url('${skin.bgImage}')`);
    if (skin.hpBarColor)   root.setProperty('--pack-hp-bar', skin.hpBarColor);
    if (skin.loadingColor) root.setProperty('--pack-loading-bar', skin.loadingColor);
    if (skin.glowColor)    root.setProperty('--pack-glow', skin.glowColor);
    
    // Apply Logo Override
    if (skin.logoOverride) {
      const logoEl = document.querySelector('h1[onclick="confirmHome()"]');
      if (logoEl) logoEl.innerText = skin.logoOverride;
    }

    // Custom CSS Injection
    if (skin.customCss) {
      let style = document.getElementById('pack-css-skin');
      if (!style) {
        style = document.createElement('style');
        style.id = 'pack-css-skin';
        document.head.appendChild(style);
      }
      style.textContent = skin.customCss;
    }

    if (skin.fontUrl) {
      let link = document.getElementById('pack-font-link');
      if (!link) {
        link = document.createElement('link');
        link.id = 'pack-font-link';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }
      link.href = skin.fontUrl;
    }
    if (skin.fontFamily) root.setProperty('--pack-font', skin.fontFamily);
    
    if (skin.script && skin.script.onLoad) {
      _runScript(skin.script.onLoad, stateRef || window.state, {});
    }
  }

  function _resetSkin() {
    const root = document.documentElement.style;
    ['--pack-primary','--pack-accent','--pack-bg','--pack-surface','--pack-border','--pack-tile-radius','--pack-font', '--pack-bg-image', '--pack-hp-bar', '--pack-loading-bar', '--pack-glow'].forEach(v => root.removeProperty(v));
    const link = document.getElementById('pack-font-link');
    if (link) link.href = '';
    
    // Reset logo
    const logoEl = document.querySelector('h1[onclick="confirmHome()"]');
    if (logoEl) logoEl.innerText = "🐉 CRIT 2048";

    // Remove all pack-injected CSS
    document.querySelectorAll('[id^="pack-css-"]').forEach(el => el.remove());
  }

  // ── Sandboxed script runner ───────────────────────────────────────────────
  function _runScript(scriptStr, stateRef, extraArgs) {
    if (!scriptStr) return;
    if (BLOCKED_KEYWORDS.some(kw => scriptStr.includes(kw))) {
      console.warn('PackEngine: Blocked keyword in script — execution denied.');
      return;
    }
    try {
      const stateToUse = stateRef || window.state || {};
      const G = _buildGameAPI(stateToUse);
      const hardcoded = {
        G: G,
        roll: extraArgs?.roll !== undefined ? extraArgs.roll : 0,
        val: extraArgs?.val !== undefined ? extraArgs.val : 0,
        dir: extraArgs?.dir !== undefined ? extraArgs.dir : '',
        dmg: extraArgs?.dmg !== undefined ? extraArgs.dmg : 0,
        lvl: extraArgs?.lvl !== undefined ? extraArgs.lvl : 0
      };

      const customKeys = Object.keys(extraArgs || {}).filter(k => !Object.keys(hardcoded).includes(k));
      const keys = [...Object.keys(hardcoded), ...customKeys];
      const vals = [...Object.values(hardcoded), ...customKeys.map(k => extraArgs[k])];

      // eslint-disable-next-line no-new-func
      const fn = new Function(...keys, `"use strict";\n${scriptStr}`);
      fn(...vals);
    } catch (e) {
      console.warn('PackEngine: Script runtime error:', e);
    }
  }

  function _applyArtifactHooks(stateRef, hookName, extraArgs) {
    if (!stateRef.artifacts || typeof MASTER_ARTIFACTS === 'undefined') return;
    stateRef.artifacts.forEach(art => {
      const def = MASTER_ARTIFACTS.find(a => a.id === art.id);
      if (!def) return;
      
      // Advanced Script Mode
      if (def.scripts && def.scripts[hookName]) {
        _runScript(def.scripts[hookName], stateRef, { lvl: art.level, ...extraArgs });
      }
      
      // Simple Mode
      const triggerMap = {
        'onSlide': 'on_slide',
        'onMerge': 'on_merge',
        'onD20': 'on_d20',
        'onCrit': 'on_crit',
        'onEncounterStart': 'on_encounter_start',
        'onPurchase': 'on_purchase'
      };
      const simpleTrigger = triggerMap[hookName];
      if (def.mode !== 'advanced' && def.passiveTrigger === simpleTrigger && def.passiveEffect) {
         PackEngine._dispatchSimpleEffect(def, stateRef, art.level);
      }
    });
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
    async applyActivePacks(stateRef) {
      // Snapshot original game data on first boot if not already done
      if (!_baseEncounters || _baseEncounters.length === 0) {
        if (ENCOUNTERS.length > 0) _baseEncounters = ENCOUNTERS.map(e => ({ ...e }));
      }
      if (!_baseClassKeys) _baseClassKeys = Object.keys(CLASSES);

      // Reset game data to baseline snapshots
       if (_baseEncounters) {
         ENCOUNTERS.splice(0, ENCOUNTERS.length, ..._baseEncounters.map(e => ({ ...e })));
       }
       Object.keys(CLASSES).forEach(k => { if (_baseClassKeys && !_baseClassKeys.includes(k)) delete CLASSES[k]; });
       
       if (typeof MASTER_ARTIFACTS !== 'undefined') {
         MASTER_ARTIFACTS.splice(0, MASTER_ARTIFACTS.length);
       }
       
       _weaponOverrides = {};
       _hazardOverrides = {};
       _customHazards   = {};
       _damageReduction = 0;
       _activeSkin      = null;
      
      // Ensure getWeaponStats is patched to check overrides
      if (!window._origGetWeaponStats) {
        window._origGetWeaponStats = window.getWeaponStats;
        window.getWeaponStats = function(val) {
          if (_weaponOverrides[val]) {
            const o = _weaponOverrides[val];
            return { 
              name: o.name || "Weapon", 
              icon: o.icon || "⚔️", 
              bg: o.bg || "bg-slate-800", 
              text: o.text || "text-white", 
              dmg: o.dmg || 0 
            };
          }
          if (_hazardOverrides[val]) {
            const o = _hazardOverrides[val];
            return { 
              name: o.name || "Hazard", 
              icon: o.icon || "⚠️", 
              bg: o.bg || "bg-rose-900", 
              text: o.text || "text-white", 
              dmg: 0 
            };
          }
          
          // Fallback to original, but wrap in safe defaults
          const fallback = window._origGetWeaponStats(val);
          return {
            name: fallback.name || (val > 0 ? "Weapon" : "Hazard"),
            icon: fallback.icon || (val > 0 ? "⚔️" : "⚠️"),
            bg: fallback.bg || (val > 0 ? "bg-slate-800" : "bg-rose-900"),
            text: fallback.text || "text-white",
            dmg: fallback.dmg || 0
          };
        };
      }

      // Determine which packs to apply
      const s = stateRef || (typeof state !== 'undefined' ? state : (window.state || {}));
      const activeIds = (s.runStats && s.runStats.activePackIds) || [];
      const installed = await this.getInstalledPacks();
      
      const packsToApply = installed.filter(entry => {
        // Built-in default packs should always be applied unless we implement a way to specifically disable them
        if (entry.id && entry.id.startsWith('crit2048-default')) return true;
        
        if (activeIds.length > 0) return activeIds.includes(entry.id);
        return true; 
      });

      for (const entry of packsToApply) {
        let pack = await PackStorage.load(entry.id);
        
        // Check for built-in default packs
        if (!pack) {
          if (entry.id === 'crit2048-default-enemies') pack = typeof CRIT2048_DEFAULT_ENEMIES_PACK !== 'undefined' ? CRIT2048_DEFAULT_ENEMIES_PACK : null;
          else if (entry.id === 'crit2048-default-classes') pack = typeof CRIT2048_DEFAULT_CLASSES_PACK !== 'undefined' ? CRIT2048_DEFAULT_CLASSES_PACK : null;
          else if (entry.id === 'crit2048-default-artifacts') pack = typeof CRIT2048_DEFAULT_ARTIFACTS_PACK !== 'undefined' ? CRIT2048_DEFAULT_ARTIFACTS_PACK : null;
          else if (entry.id === 'crit2048-default-weapons') pack = typeof CRIT2048_DEFAULT_WEAPONS_PACK !== 'undefined' ? CRIT2048_DEFAULT_WEAPONS_PACK : null;
          else if (entry.id === 'crit2048-default-hazards') pack = typeof CRIT2048_DEFAULT_HAZARDS_PACK !== 'undefined' ? CRIT2048_DEFAULT_HAZARDS_PACK : null;
          else if (entry.id === 'crit2048-default-skin') pack = typeof CRIT2048_DEFAULT_SKIN_PACK !== 'undefined' ? CRIT2048_DEFAULT_SKIN_PACK : null;
          else if (entry.id === 'crit2048-default') pack = typeof CRIT2048_DEFAULT_PACK !== 'undefined' ? CRIT2048_DEFAULT_PACK : null;
        }

        if (!pack) continue;

        // Load Strategy Logic: applies to all types
        const strategy = pack.loadStrategy || (pack.type === 'mega' ? 'replace' : 'append');
        
        if (strategy === 'replace') {
          // Clear Monsters and Classes for a total conversion experience
          if (pack.enemies && pack.enemies.length > 0) {
            ENCOUNTERS.splice(0, ENCOUNTERS.length);
          }
          if (pack.classes && pack.classes.length > 0) {
            Object.keys(CLASSES).forEach(k => delete CLASSES[k]);
          }
          if (pack.artifacts && pack.artifacts.length > 0) {
            if (typeof MASTER_ARTIFACTS !== 'undefined') {
              MASTER_ARTIFACTS.splice(0, MASTER_ARTIFACTS.length);
            }
          }
          
          // Note: Weapons and Hazards are now ALWAYS slot-by-slot overrides.
          // This prevents 'glitched' tiles when a pack doesn't override the entire arsenal.
          
          // Special case: Mega packs and Dungeon packs should clear encounters if they are total conversions
          if (pack.type === 'mega' || pack.type === 'dungeon') {
             if (!pack.enemies || pack.enemies.length === 0) {
               ENCOUNTERS.splice(0, ENCOUNTERS.length);
             }
          }
        }
        
        // Apply categories
        if (pack.enemies)   _applyEnemies(pack.enemies);
        if (pack.classes)   _applyClasses(pack.classes);
        if (pack.weapons)   _applyWeapons(pack.weapons);
        if (pack.hazards)   _applyHazards(pack.hazards);
        if (pack.artifacts) _applyArtifacts(pack.artifacts);
        if (pack.skin)      _activeSkin = pack.skin;
      }

      if (_activeSkin) _applySkin(_activeSkin, stateRef); else _resetSkin();

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
      (pack.weapons || []).forEach((w, i) => {
        if ((w.tileValue === undefined && w.value === undefined) || !w.name || !w.icon) errors.push(`weapon[${i}]: missing required field`);
      });
      return { valid: errors.length === 0, errors };
    },

    // ── Public accessors ──────────────────────────────────────────────────
    async isInstalled(id)     { return await PackStorage.isInstalled(id); },
    getDamageReduction(){ return _damageReduction; },
    getCustomHazard(id) { return _customHazards[id] || null; },

    // ── Combat hooks (called from combat.js) ──────────────────────────────

    /** Called after every player slide. */
    onSlide(stateRef, direction) {
      _applyArtifactHooks(stateRef, 'onSlide', { dir: direction });
      const enc = ENCOUNTERS[stateRef.encounterIdx];
      if (!enc || enc.mode === 'builtin') return;

      if (enc.mode === 'simple') {
        const G = _buildGameAPI(stateRef);
        // Primary ability trigger check
        if (enc.primaryAbility && _checkTrigger(enc.primaryAbility, stateRef)) {
          _applyEffect(enc.primaryAbility, stateRef, G);
        }
        // Passive regen (always-on, but only if still alive)
        if (stateRef.monsterHp > 0 && enc.passiveAbility && enc.passiveAbility.effect === 'regen') {
          stateRef.monsterHp = Math.min(stateRef.monsterMaxHp, stateRef.monsterHp + (enc.passiveAbility.effectParam || 0));
        }
        // Passive damage_reduction — set flag for onDamage
        _damageReduction = (enc.passiveAbility && enc.passiveAbility.effect === 'damage_reduction')
          ? (enc.passiveAbility.effectParam || 0) : 0;
      } else if (enc.mode === 'advanced' && enc.script && enc.script.onSlide) {
        _runScript(enc.script.onSlide, stateRef, {});
      }
    },

    /** Called after applyDamage(). Damage is already reduced by getDamageReduction() hook. */
    onDamage(stateRef, dmg) {
      _applyArtifactHooks(stateRef, 'onDamage', { dmg });
      const enc = ENCOUNTERS[stateRef.encounterIdx];
      if (!enc) return;


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
      _applyArtifactHooks(stateRef, 'onEncounterStart', { enc });
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
      _applyArtifactHooks(stateRef, 'onEncounterEnd', { enc });
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
        this._dispatchSimpleEffect(def, stateRef);
      }
    },

    /** Called when a weapon tile merges. */
    onMerge(stateRef, newVal) {
      _applyArtifactHooks(stateRef, 'onMerge', { val: newVal });
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
          this._dispatchSimpleEffect(def, stateRef);
        }
      }
    },


    /** Called before D20 roll processing. Can modify the roll. */
    onD20(stateRef, roll) {
      let currentRoll = roll;
      if (stateRef.artifacts && typeof MASTER_ARTIFACTS !== 'undefined') {
        stateRef.artifacts.forEach(art => {
          const def = MASTER_ARTIFACTS.find(a => a.id === art.id);
          if (def && def.scripts && def.scripts.onD20) {
            const rollObj = { val: currentRoll };
            _runScript(def.scripts.onD20, stateRef, { roll: rollObj, lvl: art.level });
            currentRoll = rollObj.val;
          }
        });
      }
      return currentRoll;
    },

    /** Called on D20 natural 20 (crit). */
    onCrit(stateRef) {
      const cls = stateRef.playerClass;
      if (!cls || !cls._packDef) return;
      const def = cls._packDef;
      if (def.passiveTrigger === 'on_crit') this._dispatchSimpleEffect(def, stateRef);
    },

    _dispatchSimpleEffect(def, stateRef, lvl = 1) {
      const p = (def.passiveParam || 0) * lvl;
      const label = def.name || "Artifact";
      switch (def.passiveEffect) {
        case 'restore_slides':   stateRef.slidesLeft += p; if (window.addLog) addLog(`${label}: +${p} slides!`); break;
        case 'add_gold':         stateRef.gold += p; if (window.addLog) addLog(`${label}: +${p} gold!`); break;
        case 'add_multiplier':   stateRef.multiplier += p; if (window.addLog) addLog(`${label}: +${p.toFixed(1)} Mult!`); break;
        case 'deal_damage':      if (typeof applyDamage === 'function') applyDamage(p); break;
      }
    },
    
    /** Called for each merge to calculate damage. */
    calculateMergeDamage(stateRef, baseDmg, direction, newVal) {
      let finalDmg = baseDmg;
      if (stateRef.artifacts && typeof MASTER_ARTIFACTS !== 'undefined') {
        stateRef.artifacts.forEach(art => {
          const def = MASTER_ARTIFACTS.find(a => a.id === art.id);
          if (def && def.scripts && def.scripts.onMergeDamage) {
            const dmgObj = { val: finalDmg };
            _runScript(def.scripts.onMergeDamage, stateRef, { dmg: dmgObj, lvl: art.level, dir: direction, val: newVal });
            finalDmg = dmgObj.val;
          }
        });
      }
      return finalDmg;
    },

    /** Called when an artifact is purchased or upgraded. */
    onPurchase(stateRef, artifactId) {
      const art = stateRef.artifacts.find(a => a.id === artifactId);
      if (!art || typeof MASTER_ARTIFACTS === 'undefined') return;
      const def = MASTER_ARTIFACTS.find(a => a.id === artifactId);
      if (def && def.scripts && def.scripts.onPurchase) {
        _runScript(def.scripts.onPurchase, stateRef, { lvl: art.level });
      }
    },

    /** Public accessor for skin system (used by Forge for previews) */
    applySkin(skin, stateRef) {
      _applySkin(skin, stateRef);
    },
    resetSkin() {
      _resetSkin();
    },
    
    /** Called when entering the tavern. */
    onTavern(stateRef) {
      _applyArtifactHooks(stateRef, 'onTavern', {});
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
        const installed = await this.getInstalledPacks();
        activeIds = installed.map(p => p.id);
        stateRef.runStats.activePackIds = activeIds;
      }

      if (activeIds.length === 0) {
        stateRef.runStats.packRunLabel = "";
        return;
      }

      if (activeIds.length === 1) {
        let p = await PackStorage.load(activeIds[0]);
        // Fallback to built-in check
        if (!p) {
          const all = await this.getInstalledPacks();
          p = all.find(x => x.id === activeIds[0]);
        }
        stateRef.runStats.packRunLabel = p ? `${p.name} v${p.version}` : activeIds[0];
      } else {
        stateRef.runStats.packRunLabel = `Mixed Run (${activeIds.length} packs)`;
      }
    },

    /** Returns all packs available to the system, including built-in ones. */
    async getInstalledPacks() {
      const installed = await PackStorage.listInstalled();
      
      const defaults = [];
      if (typeof CRIT2048_DEFAULT_ENEMIES_PACK !== 'undefined') defaults.push(CRIT2048_DEFAULT_ENEMIES_PACK);
      if (typeof CRIT2048_DEFAULT_CLASSES_PACK !== 'undefined') defaults.push(CRIT2048_DEFAULT_CLASSES_PACK);
      if (typeof CRIT2048_DEFAULT_ARTIFACTS_PACK !== 'undefined') defaults.push(CRIT2048_DEFAULT_ARTIFACTS_PACK);
      if (typeof CRIT2048_DEFAULT_SKIN_PACK !== 'undefined') defaults.push(CRIT2048_DEFAULT_SKIN_PACK);
      if (typeof CRIT2048_DEFAULT_WEAPONS_PACK !== 'undefined') defaults.push(CRIT2048_DEFAULT_WEAPONS_PACK);
      if (typeof CRIT2048_DEFAULT_HAZARDS_PACK !== 'undefined') defaults.push(CRIT2048_DEFAULT_HAZARDS_PACK);
      if (typeof CRIT2048_SHADOWFELL_SKIN_PACK !== 'undefined') defaults.push(CRIT2048_SHADOWFELL_SKIN_PACK);
      if (typeof CRIT2048_DEFAULT_PACK !== 'undefined') defaults.push(CRIT2048_DEFAULT_PACK);
      
      return [...defaults.map(p => ({ ...p, isBuiltIn: true })), ...installed];
    }
  };

  window.PackEngine = PackEngine;
})();
