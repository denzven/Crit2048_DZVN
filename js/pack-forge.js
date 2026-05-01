/**
 * PACK FORGE
 * Logic for the in-game Content Pack creator UI.
 */

(function() {

  const defaultPack = {
    id: "my-custom-pack",
    name: "My Custom Pack",
    version: "1.0.0",
    author: "Unknown Creator",
    description: "A custom pack forged in Crit 2048.",
    type: "mega",
    game_version: ">=1.0.0",
    icon: "📦",
    enemies: [],
    classes: [],
    weapons: [],
    hazards: []
  };

  let currentPack = JSON.parse(JSON.stringify(defaultPack));
  let currentMode = "simple";
  const ITEMS_PER_PAGE = 3;
  let currentPages = { enemies: 1, classes: 1, weapons: 1, hazards: 1, artifacts: 1 };

  const PackForge = {

    open() {
      currentPack = JSON.parse(JSON.stringify(defaultPack));
      currentMode = "simple";
      this.render();
      
      const forgeModal = document.getElementById("modal-forge");
      const backdrop = document.getElementById("modal-backdrop");
      if (forgeModal) forgeModal.classList.remove("hide");
      if (backdrop) backdrop.classList.remove("hide");
      this.setSection("meta");
    },

    close() {
      const forgeModal = document.getElementById("modal-forge");
      const backdrop = document.getElementById("modal-backdrop");
      if (forgeModal) forgeModal.classList.add("hide");
      if (backdrop) backdrop.classList.add("hide");
    },

    changePage(listName, delta) {
      if (!currentPages[listName]) currentPages[listName] = 1;
      currentPages[listName] += delta;
      const total = currentPack[listName] ? currentPack[listName].length : 0;
      const maxPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
      if (currentPages[listName] < 1) currentPages[listName] = 1;
      if (currentPages[listName] > maxPages) currentPages[listName] = maxPages;
      this.render();
    },

    async installAndPlay() {
      if (currentMode === "advanced") this.syncJsonToSimple();
      this.syncSimpleToJson();
      
      const validation = window.PackEngine.validatePack(currentPack);
      if (!validation.valid) {
        alert("Pack Validation Failed:\n" + validation.errors.join("\n"));
        return;
      }
      
      const ok = await window.PackStorage.save(currentPack);
      if (!ok) {
        alert("Failed to save pack locally.");
        return;
      }
      
      if (window.state && window.state.runStats) {
        window.state.runStats.activePackIds = [currentPack.id];
        window.state.runStats.packRunLabel = currentPack.name;
      }
      
      await window.PackEngine.applyActivePacks();
      this.close();
      if (window.resetGame) window.resetGame(true);
    },

    setMode(mode) {
      currentMode = mode;
      
      const simpleBtn = document.getElementById("forge-tab-simple");
      const advBtn = document.getElementById("forge-tab-advanced");
      const simpleView = document.getElementById("forge-simple-view");
      const advView = document.getElementById("forge-advanced-view");
      
      if (mode === "simple") {
        simpleBtn.className = "flex-1 py-2 px-4 rounded-lg font-bold text-xs uppercase tracking-wider transition-all bg-rose-600 text-white shadow-inner";
        advBtn.className = "flex-1 py-2 px-4 rounded-lg font-bold text-xs uppercase tracking-wider transition-all bg-slate-800 text-slate-400 hover:text-white";
        simpleView.classList.remove("hide");
        advView.classList.add("hide");
        this.syncJsonToSimple();
      } else {
        advBtn.className = "flex-1 py-2 px-4 rounded-lg font-bold text-xs uppercase tracking-wider transition-all bg-indigo-600 text-white shadow-inner";
        simpleBtn.className = "flex-1 py-2 px-4 rounded-lg font-bold text-xs uppercase tracking-wider transition-all bg-slate-800 text-slate-400 hover:text-white";
        advView.classList.remove("hide");
        simpleView.classList.add("hide");
        this.syncSimpleToJson();
      }
    },

    setSection(section) {
      const sections = ['meta', 'enemies', 'classes', 'weapons', 'hazards'];
      sections.forEach(s => {
        const btn = document.getElementById(`forge-nav-${s}`);
        const view = document.getElementById(`forge-section-${s}`);
        if (s === section) {
          btn.className = "w-full text-left px-3 py-2.5 rounded-md text-xs font-bold text-white bg-slate-800 transition-colors uppercase tracking-wide truncate";
          view.classList.remove("hide");
        } else {
          btn.className = "w-full text-left px-3 py-2.5 rounded-md text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors uppercase tracking-wide truncate";
          view.classList.add("hide");
        }
      });
      this.render();
    },

    updateMeta() {
      currentPack.id = document.getElementById("forge-meta-id").value;
      currentPack.name = document.getElementById("forge-meta-name").value;
      currentPack.author = document.getElementById("forge-meta-author").value;
      currentPack.version = document.getElementById("forge-meta-version").value;
      currentPack.type = document.getElementById("forge-meta-type").value;
      currentPack.icon = document.getElementById("forge-meta-icon").value;
      currentPack.description = document.getElementById("forge-meta-desc").value;
    },

    render() {
      document.getElementById("forge-meta-id").value = currentPack.id || "";
      document.getElementById("forge-meta-name").value = currentPack.name || "";
      document.getElementById("forge-meta-author").value = currentPack.author || "";
      document.getElementById("forge-meta-version").value = currentPack.version || "";
      document.getElementById("forge-meta-type").value = currentPack.type || "mega";
      document.getElementById("forge-meta-icon").value = currentPack.icon || "📦";
      document.getElementById("forge-meta-desc").value = currentPack.description || "";
      
      this.renderEnemies();
      this.renderClasses();
      this.renderWeapons();
      this.renderHazards();
    },

    // ── Generic List Handlers ───────────────────────────────────────────────

    addItem(listName, defaultObj) {
      if (!currentPack[listName]) currentPack[listName] = [];
      currentPack[listName].push(defaultObj);
      
      // Auto-navigate to the last page where the new item is
      const total = currentPack[listName].length;
      currentPages[listName] = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
      
      this.render();
    },

    removeItem(listName, idx) {
      if (currentPack[listName]) currentPack[listName].splice(idx, 1);
      this.render();
    },

    updateItem(listName, idx, field, value) {
      if (field.includes('.')) {
        const parts = field.split('.');
        if (!currentPack[listName][idx][parts[0]]) currentPack[listName][idx][parts[0]] = {};
        
        if (value === "" || value === null || (typeof value === 'number' && isNaN(value))) {
          delete currentPack[listName][idx][parts[0]][parts[1]];
        } else {
          currentPack[listName][idx][parts[0]][parts[1]] = value;
        }
      } else {
        currentPack[listName][idx][field] = value;
      }
      this.render();
    },

    // ── Enemies ─────────────────────────────────────────────────────────────

    addEnemy() {
      this.addItem('enemies', {
        id: `custom_enemy_${(currentPack.enemies?.length || 0) + 1}`,
        name: "New Enemy",
        icon: "👹",
        hp: 1000,
        slides: 30,
        lore: "",
        mode: "simple",
        primaryAbility: { trigger: "", effect: "" },
        passiveAbility: { effect: "" },
        deathReward: { goldBonus: 0 }
      });
    },

    renderEnemies() {
      const container = document.getElementById("forge-enemies-list");
      if (!container) return;
      if (!currentPack.enemies || currentPack.enemies.length === 0) {
        container.innerHTML = '<p class="text-[10px] text-slate-500 italic text-center py-4">No enemies defined yet.</p>';
        return;
      }
      
            let html = '';
      const page = currentPages.enemies || 1;
      const startIdx = (page - 1) * ITEMS_PER_PAGE;
      const endIdx = Math.min(startIdx + ITEMS_PER_PAGE, currentPack.enemies.length);

      for (let idx = startIdx; idx < endIdx; idx++) {
        const item = currentPack.enemies[idx];
        html += `
          <div class="bg-slate-900/50 border border-slate-700 rounded-lg p-3 relative space-y-2">
            <button onclick="PackForge.removeItem('enemies', ${idx})" class="absolute top-2 right-2 w-6 h-6 flex items-center justify-center bg-rose-900/50 text-rose-400 hover:bg-rose-600 hover:text-white rounded transition-colors text-xs">✕</button>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pr-8">
              <div class="col-span-2">
                <label class="block text-[9px] font-bold text-slate-500 uppercase">ID</label>
                <input type="text" value="${item.id || ''}" onchange="PackForge.updateItem('enemies', ${idx}, 'id', this.value)" class="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[10px] text-white">
              </div>
              <div class="col-span-2">
                <label class="block text-[9px] font-bold text-slate-500 uppercase">Name</label>
                <input type="text" value="${item.name || ''}" onchange="PackForge.updateItem('enemies', ${idx}, 'name', this.value)" class="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[10px] text-white">
              </div>
              <div>
                <label class="block text-[9px] font-bold text-slate-500 uppercase">Icon</label>
                <input type="text" value="${item.icon || ''}" onchange="PackForge.updateItem('enemies', ${idx}, 'icon', this.value)" class="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[10px] text-white text-center">
              </div>
              <div>
                <label class="block text-[9px] font-bold text-slate-500 uppercase">HP</label>
                <input type="number" value="${item.hp || ''}" onchange="PackForge.updateItem('enemies', ${idx}, 'hp', parseInt(this.value))" class="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[10px] text-amber-400 font-mono">
              </div>
              <div>
                <label class="block text-[9px] font-bold text-slate-500 uppercase">Slides</label>
                <input type="number" value="${item.slides || ''}" onchange="PackForge.updateItem('enemies', ${idx}, 'slides', parseInt(this.value))" class="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[10px] text-emerald-400 font-mono">
              </div>
              <div>
                <label class="block text-[9px] font-bold text-slate-500 uppercase">Mode</label>
                <select onchange="PackForge.updateItem('enemies', ${idx}, 'mode', this.value)" class="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[10px] text-indigo-300">
                  <option value="simple" ${item.mode === 'simple' ? 'selected' : ''}>Simple</option>
                  <option value="advanced" ${item.mode === 'advanced' ? 'selected' : ''}>Advanced (Script)</option>
                </select>
              </div>
              <div class="col-span-4">
                <label class="block text-[9px] font-bold text-slate-500 uppercase">Lore</label>
                <input type="text" value="${item.lore || ''}" onchange="PackForge.updateItem('enemies', ${idx}, 'lore', this.value)" class="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[10px] text-slate-300">
              </div>
            </div>
            
            <div class="border-t border-slate-800 pt-2 grid grid-cols-2 gap-2">
              <div class="col-span-2 text-[10px] text-indigo-400 font-bold uppercase tracking-widest mb-1">Primary Ability</div>
              <div>
                <label class="block text-[9px] font-bold text-slate-500 uppercase">Trigger</label>
                <select onchange="PackForge.updateItem('enemies', ${idx}, 'primaryAbility.trigger', this.value)" class="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[10px] text-white">
                  <option value="">None</option>
                  <option value="every_n_slides" ${item.primaryAbility?.trigger === 'every_n_slides' ? 'selected' : ''}>Every N Slides</option>
                  <option value="on_damage" ${item.primaryAbility?.trigger === 'on_damage' ? 'selected' : ''}>On Damage</option>
                  <option value="on_hp_below" ${item.primaryAbility?.trigger === 'on_hp_below' ? 'selected' : ''}>On HP Below</option>
                  <option value="on_slide_start" ${item.primaryAbility?.trigger === 'on_slide_start' ? 'selected' : ''}>On Slide Start</option>
                  <option value="on_weapon_merge" ${item.primaryAbility?.trigger === 'on_weapon_merge' ? 'selected' : ''}>On Weapon Merge</option>
                  <option value="on_death" ${item.primaryAbility?.trigger === 'on_death' ? 'selected' : ''}>On Death</option>
                </select>
              </div>
              <div>
                <label class="block text-[9px] font-bold text-slate-500 uppercase">Trigger Param</label>
                <input type="number" value="${item.primaryAbility?.triggerParam || ''}" onchange="PackForge.updateItem('enemies', ${idx}, 'primaryAbility.triggerParam', parseInt(this.value))" class="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[10px] text-white">
              </div>
              <div>
                <label class="block text-[9px] font-bold text-slate-500 uppercase">Effect</label>
                <select onchange="PackForge.updateItem('enemies', ${idx}, 'primaryAbility.effect', this.value)" class="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[10px] text-white">
                  <option value="">None</option>
                  <option value="spawn_hazard" ${item.primaryAbility?.effect === 'spawn_hazard' ? 'selected' : ''}>Spawn Hazard</option>
                  <option value="regen" ${item.primaryAbility?.effect === 'regen' ? 'selected' : ''}>Regen</option>
                  <option value="damage_reduction" ${item.primaryAbility?.effect === 'damage_reduction' ? 'selected' : ''}>Damage Reduction</option>
                  <option value="tile_shuffle" ${item.primaryAbility?.effect === 'tile_shuffle' ? 'selected' : ''}>Shuffle Tiles</option>
                  <option value="weapon_degrade" ${item.primaryAbility?.effect === 'weapon_degrade' ? 'selected' : ''}>Degrade Weapon</option>
                  <option value="weapon_destroy" ${item.primaryAbility?.effect === 'weapon_destroy' ? 'selected' : ''}>Destroy Weapon</option>
                  <option value="drain_slides" ${item.primaryAbility?.effect === 'drain_slides' ? 'selected' : ''}>Drain Slides</option>
                  <option value="drain_gold" ${item.primaryAbility?.effect === 'drain_gold' ? 'selected' : ''}>Drain Gold</option>
                  <option value="crit_immune" ${item.primaryAbility?.effect === 'crit_immune' ? 'selected' : ''}>Crit Immune</option>
                  <option value="spell_cost_up" ${item.primaryAbility?.effect === 'spell_cost_up' ? 'selected' : ''}>Spell Cost Up</option>
                  <option value="custom_spawn" ${item.primaryAbility?.effect === 'custom_spawn' ? 'selected' : ''}>Custom Spawn</option>
                </select>
              </div>
              <div>
                <label class="block text-[9px] font-bold text-slate-500 uppercase">Effect Param</label>
                <input type="text" value="${item.primaryAbility?.effectParam || ''}" onchange="PackForge.updateItem('enemies', ${idx}, 'primaryAbility.effectParam', this.value)" class="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[10px] text-white">
              </div>
              <div class="col-span-2">
                <label class="block text-[9px] font-bold text-slate-500 uppercase">Log Message</label>
                <input type="text" value="${item.primaryAbility?.logMessage || ''}" onchange="PackForge.updateItem('enemies', ${idx}, 'primaryAbility.logMessage', this.value)" class="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[10px] text-white">
              </div>
            </div>
            
            <div class="border-t border-slate-800 pt-2 grid grid-cols-2 gap-2">
              <div class="col-span-2 text-[10px] text-indigo-400 font-bold uppercase tracking-widest mb-1">Passive Ability</div>
              <div>
                <label class="block text-[9px] font-bold text-slate-500 uppercase">Effect</label>
                <select onchange="PackForge.updateItem('enemies', ${idx}, 'passiveAbility.effect', this.value)" class="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[10px] text-white">
                  <option value="">None</option>
                  <option value="regen" ${item.passiveAbility?.effect === 'regen' ? 'selected' : ''}>Regen</option>
                  <option value="damage_reduction" ${item.passiveAbility?.effect === 'damage_reduction' ? 'selected' : ''}>Damage Reduction</option>
                </select>
              </div>
              <div>
                <label class="block text-[9px] font-bold text-slate-500 uppercase">Effect Param</label>
                <input type="number" value="${item.passiveAbility?.effectParam || ''}" onchange="PackForge.updateItem('enemies', ${idx}, 'passiveAbility.effectParam', parseInt(this.value))" class="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[10px] text-white">
              </div>
              <div class="col-span-2">
                <label class="block text-[9px] font-bold text-slate-500 uppercase">Log Message</label>
                <input type="text" value="${item.passiveAbility?.logMessage || ''}" onchange="PackForge.updateItem('enemies', ${idx}, 'passiveAbility.logMessage', this.value)" class="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[10px] text-white">
              </div>
            </div>
            
            <div class="border-t border-slate-800 pt-2 grid grid-cols-2 gap-2">
              <div class="col-span-2 text-[10px] text-amber-400 font-bold uppercase tracking-widest mb-1">Death Reward</div>
              <div>
                <label class="block text-[9px] font-bold text-slate-500 uppercase">Gold Bonus</label>
                <input type="number" value="${item.deathReward?.goldBonus || ''}" onchange="PackForge.updateItem('enemies', ${idx}, 'deathReward.goldBonus', parseInt(this.value))" class="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[10px] text-white">
              </div>
              <div>
                <label class="block text-[9px] font-bold text-slate-500 uppercase">Log Message</label>
                <input type="text" value="${item.deathReward?.logMessage || ''}" onchange="PackForge.updateItem('enemies', ${idx}, 'deathReward.logMessage', this.value)" class="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[10px] text-white">
              </div>
            </div>
          </div>
        `;
      }

      if (currentPack.enemies.length > ITEMS_PER_PAGE) {
        const maxPages = Math.ceil(currentPack.enemies.length / ITEMS_PER_PAGE);
        html += `
          <div class="flex justify-between items-center mt-4 border-t border-slate-800 pt-3">
            <button onclick="PackForge.changePage('$enemies', -1)" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-300 font-bold uppercase transition-colors disabled:opacity-30 disabled:pointer-events-none" ${page <= 1 ? 'disabled' : ''}>Prev</button>
            <span class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Page ${page} of ${maxPages}</span>
            <button onclick="PackForge.changePage('$enemies', 1)" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-300 font-bold uppercase transition-colors disabled:opacity-30 disabled:pointer-events-none" ${page >= maxPages ? 'disabled' : ''}>Next</button>
          </div>
        `;
      }
      container.innerHTML = html;
    },

    // ── Classes ─────────────────────────────────────────────────────────────

    addClass() {
      this.addItem('classes', {
        id: `CustomClass${(currentPack.classes?.length || 0) + 1}`,
        icon: "👤",
        desc: "A custom class.",
        lore: "",
        mode: "simple",
        d20Mod: 0,
        passiveTrigger: "",
        passiveEffect: "",
        ability: { name: "", spellType: "fireball", count: 1, sides: 6, maxUses: 1 }
      });
    },

    renderClasses() {
      const container = document.getElementById("forge-classes-list");
      if (!container) return;
      if (!currentPack.classes || currentPack.classes.length === 0) {
        container.innerHTML = '<p class="text-[10px] text-slate-500 italic text-center py-4">No classes defined yet.</p>';
        return;
      }
      
            let html = '';
      const page = currentPages.classes || 1;
      const startIdx = (page - 1) * ITEMS_PER_PAGE;
      const endIdx = Math.min(startIdx + ITEMS_PER_PAGE, currentPack.classes.length);

      for (let idx = startIdx; idx < endIdx; idx++) {
        const item = currentPack.classes[idx];
        html += `
          <div class="bg-slate-900/50 border border-slate-700 rounded-lg p-3 relative space-y-2">
            <button onclick="PackForge.removeItem('classes', ${idx})" class="absolute top-2 right-2 w-6 h-6 flex items-center justify-center bg-rose-900/50 text-rose-400 hover:bg-rose-600 hover:text-white rounded transition-colors text-xs">✕</button>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pr-8">
              <div class="col-span-2">
                <label class="block text-[9px] font-bold text-slate-500 uppercase">ID / Name</label>
                <input type="text" value="${item.id || ''}" onchange="PackForge.updateItem('classes', ${idx}, 'id', this.value)" class="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[10px] text-white">
              </div>
              <div>
                <label class="block text-[9px] font-bold text-slate-500 uppercase">Icon</label>
                <input type="text" value="${item.icon || ''}" onchange="PackForge.updateItem('classes', ${idx}, 'icon', this.value)" class="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[10px] text-white text-center">
              </div>
              <div>
                <label class="block text-[9px] font-bold text-slate-500 uppercase">D20 Mod</label>
                <input type="number" value="${item.d20Mod || 0}" onchange="PackForge.updateItem('classes', ${idx}, 'd20Mod', parseInt(this.value))" class="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[10px] text-amber-400 font-mono">
              </div>
              <div class="col-span-2">
                <label class="block text-[9px] font-bold text-slate-500 uppercase">Description</label>
                <input type="text" value="${item.desc || ''}" onchange="PackForge.updateItem('classes', ${idx}, 'desc', this.value)" class="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[10px] text-slate-300">
              </div>
              <div class="col-span-2">
                <label class="block text-[9px] font-bold text-slate-500 uppercase">Lore</label>
                <input type="text" value="${item.lore || ''}" onchange="PackForge.updateItem('classes', ${idx}, 'lore', this.value)" class="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[10px] text-slate-300">
              </div>
            </div>
            
            <div class="border-t border-slate-800 pt-2 grid grid-cols-2 gap-2">
              <div class="col-span-2 text-[10px] text-emerald-400 font-bold uppercase tracking-widest mb-1">Passive Ability</div>
              <div>
                <label class="block text-[9px] font-bold text-slate-500 uppercase">Trigger</label>
                <select onchange="PackForge.updateItem('classes', ${idx}, 'passiveTrigger', this.value)" class="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[10px] text-white">
                  <option value="">None</option>
                  <option value="on_crit" ${item.passiveTrigger === 'on_crit' ? 'selected' : ''}>On Crit</option>
                  <option value="on_merge" ${item.passiveTrigger === 'on_merge' ? 'selected' : ''}>On Merge</option>
                  <option value="on_merge_t3" ${item.passiveTrigger === 'on_merge_t3' ? 'selected' : ''}>On Merge T3+</option>
                  <option value="on_slide" ${item.passiveTrigger === 'on_slide' ? 'selected' : ''}>On Slide</option>
                  <option value="on_gold_earn" ${item.passiveTrigger === 'on_gold_earn' ? 'selected' : ''}>On Gold Earn</option>
                  <option value="on_spell_cast" ${item.passiveTrigger === 'on_spell_cast' ? 'selected' : ''}>On Spell Cast</option>
                </select>
              </div>
              <div>
                <label class="block text-[9px] font-bold text-slate-500 uppercase">Effect</label>
                <select onchange="PackForge.updateItem('classes', ${idx}, 'passiveEffect', this.value)" class="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[10px] text-white">
                  <option value="">None</option>
                  <option value="restore_slides" ${item.passiveEffect === 'restore_slides' ? 'selected' : ''}>Restore Slides</option>
                  <option value="add_gold" ${item.passiveEffect === 'add_gold' ? 'selected' : ''}>Add Gold</option>
                  <option value="add_multiplier" ${item.passiveEffect === 'add_multiplier' ? 'selected' : ''}>Add Multiplier</option>
                  <option value="deal_damage" ${item.passiveEffect === 'deal_damage' ? 'selected' : ''}>Deal Damage</option>
                </select>
              </div>
              <div class="col-span-2">
                <label class="block text-[9px] font-bold text-slate-500 uppercase">Effect Param</label>
                <input type="number" step="0.01" value="${item.passiveParam || ''}" onchange="PackForge.updateItem('classes', ${idx}, 'passiveParam', parseFloat(this.value))" class="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[10px] text-white">
              </div>
            </div>
            
            <div class="border-t border-slate-800 pt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              <div class="col-span-2 md:col-span-4 text-[10px] text-purple-400 font-bold uppercase tracking-widest mb-1">Active Spell (Ability)</div>
              <div class="col-span-2">
                <label class="block text-[9px] font-bold text-slate-500 uppercase">Spell Name</label>
                <input type="text" value="${item.ability?.name || ''}" onchange="PackForge.updateItem('classes', ${idx}, 'ability.name', this.value)" class="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[10px] text-white">
              </div>
              <div class="col-span-2">
                <label class="block text-[9px] font-bold text-slate-500 uppercase">Spell Type (Visual)</label>
                <select onchange="PackForge.updateItem('classes', ${idx}, 'ability.spellType', this.value)" class="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[10px] text-white">
                  <option value="fireball" ${item.ability?.spellType === 'fireball' ? 'selected' : ''}>Fireball</option>
                  <option value="beam" ${item.ability?.spellType === 'beam' ? 'selected' : ''}>Beam</option>
                  <option value="smite" ${item.ability?.spellType === 'smite' ? 'selected' : ''}>Smite</option>
                  <option value="divine" ${item.ability?.spellType === 'divine' ? 'selected' : ''}>Divine</option>
                  <option value="song" ${item.ability?.spellType === 'song' ? 'selected' : ''}>Song</option>
                  <option value="entangle" ${item.ability?.spellType === 'entangle' ? 'selected' : ''}>Entangle</option>
                  <option value="blade_storm" ${item.ability?.spellType === 'blade_storm' ? 'selected' : ''}>Blade Storm</option>
                  <option value="ki_strike" ${item.ability?.spellType === 'ki_strike' ? 'selected' : ''}>Ki Strike</option>
                  <option value="hunter_mark" ${item.ability?.spellType === 'hunter_mark' ? 'selected' : ''}>Hunter Mark</option>
                  <option value="chaos" ${item.ability?.spellType === 'chaos' ? 'selected' : ''}>Chaos</option>
                  <option value="death_coil" ${item.ability?.spellType === 'death_coil' ? 'selected' : ''}>Death Coil</option>
                </select>
              </div>
              <div>
                <label class="block text-[9px] font-bold text-slate-500 uppercase">Dice Count</label>
                <input type="number" value="${item.ability?.count || 1}" onchange="PackForge.updateItem('classes', ${idx}, 'ability.count', parseInt(this.value))" class="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[10px] text-white">
              </div>
              <div>
                <label class="block text-[9px] font-bold text-slate-500 uppercase">Dice Sides</label>
                <input type="number" value="${item.ability?.sides || 6}" onchange="PackForge.updateItem('classes', ${idx}, 'ability.sides', parseInt(this.value))" class="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[10px] text-white">
              </div>
              <div class="col-span-2">
                <label class="block text-[9px] font-bold text-slate-500 uppercase">Max Uses</label>
                <input type="number" value="${item.ability?.maxUses || 1}" onchange="PackForge.updateItem('classes', ${idx}, 'ability.maxUses', parseInt(this.value))" class="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[10px] text-white">
              </div>
              <div class="col-span-2">
                <label class="block text-[9px] font-bold text-slate-500 uppercase">Simple Effect</label>
                <select onchange="PackForge.updateItem('classes', ${idx}, 'ability.simpleEffect', this.value)" class="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[10px] text-white">
                  <option value="">None / Custom</option>
                  <option value="deal_damage" ${item.ability?.simpleEffect === 'deal_damage' ? 'selected' : ''}>Deal Damage</option>
                </select>
              </div>
              <div class="col-span-2">
                <label class="block text-[9px] font-bold text-slate-500 uppercase">Simple Param (e.g. multiplier_x200)</label>
                <input type="text" value="${item.ability?.simpleParam || ''}" onchange="PackForge.updateItem('classes', ${idx}, 'ability.simpleParam', this.value)" class="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[10px] text-white">
              </div>
              <div class="col-span-4">
                <label class="block text-[9px] font-bold text-slate-500 uppercase">Spell Description</label>
                <input type="text" value="${item.ability?.description || ''}" onchange="PackForge.updateItem('classes', ${idx}, 'ability.description', this.value)" class="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[10px] text-white">
              </div>
            </div>
          </div>
        `;
      }

      if (currentPack.enemies.length > ITEMS_PER_PAGE) {
        const maxPages = Math.ceil(currentPack.enemies.length / ITEMS_PER_PAGE);
        html += `
          <div class="flex justify-between items-center mt-4 border-t border-slate-800 pt-3">
            <button onclick="PackForge.changePage('$enemies', -1)" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-300 font-bold uppercase transition-colors disabled:opacity-30 disabled:pointer-events-none" ${page <= 1 ? 'disabled' : ''}>Prev</button>
            <span class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Page ${page} of ${maxPages}</span>
            <button onclick="PackForge.changePage('$enemies', 1)" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-300 font-bold uppercase transition-colors disabled:opacity-30 disabled:pointer-events-none" ${page >= maxPages ? 'disabled' : ''}>Next</button>
          </div>
        `;
      }
      container.innerHTML = html;
    },

    // ── Weapons ─────────────────────────────────────────────────────────────

    addWeapon() {
      this.addItem('weapons', {
        value: 2,
        name: "New Weapon",
        icon: "🗡️",
        mode: "simple"
      });
    },

    renderWeapons() {
      const container = document.getElementById("forge-weapons-list");
      if (!container) return;
      if (!currentPack.weapons || currentPack.weapons.length === 0) {
        container.innerHTML = '<p class="text-[10px] text-slate-500 italic text-center py-4">No weapons defined yet.</p>';
        return;
      }
      
            let html = '';
      const page = currentPages.weapons || 1;
      const startIdx = (page - 1) * ITEMS_PER_PAGE;
      const endIdx = Math.min(startIdx + ITEMS_PER_PAGE, currentPack.weapons.length);

      for (let idx = startIdx; idx < endIdx; idx++) {
        const item = currentPack.weapons[idx];
        html += `
          <div class="bg-slate-900/50 border border-slate-700 rounded-lg p-3 relative space-y-2">
            <button onclick="PackForge.removeItem('weapons', ${idx})" class="absolute top-2 right-2 w-6 h-6 flex items-center justify-center bg-rose-900/50 text-rose-400 hover:bg-rose-600 hover:text-white rounded transition-colors text-xs">✕</button>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pr-8">
              <div>
                <label class="block text-[9px] font-bold text-slate-500 uppercase">Merge Value (e.g. 2, 4)</label>
                <input type="number" value="${item.value || ''}" onchange="PackForge.updateItem('weapons', ${idx}, 'value', parseInt(this.value))" class="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[10px] text-rose-400 font-mono">
              </div>
              <div class="col-span-2">
                <label class="block text-[9px] font-bold text-slate-500 uppercase">Name Override</label>
                <input type="text" value="${item.name || ''}" onchange="PackForge.updateItem('weapons', ${idx}, 'name', this.value)" class="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[10px] text-white">
              </div>
              <div>
                <label class="block text-[9px] font-bold text-slate-500 uppercase">Icon</label>
                <input type="text" value="${item.icon || ''}" onchange="PackForge.updateItem('weapons', ${idx}, 'icon', this.value)" class="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[10px] text-white text-center">
              </div>
            </div>
          </div>
        `;
      }

      if (currentPack.enemies.length > ITEMS_PER_PAGE) {
        const maxPages = Math.ceil(currentPack.enemies.length / ITEMS_PER_PAGE);
        html += `
          <div class="flex justify-between items-center mt-4 border-t border-slate-800 pt-3">
            <button onclick="PackForge.changePage('$enemies', -1)" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-300 font-bold uppercase transition-colors disabled:opacity-30 disabled:pointer-events-none" ${page <= 1 ? 'disabled' : ''}>Prev</button>
            <span class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Page ${page} of ${maxPages}</span>
            <button onclick="PackForge.changePage('$enemies', 1)" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-300 font-bold uppercase transition-colors disabled:opacity-30 disabled:pointer-events-none" ${page >= maxPages ? 'disabled' : ''}>Next</button>
          </div>
        `;
      }
      container.innerHTML = html;
    },

    // ── Hazards ─────────────────────────────────────────────────────────────

    addHazard() {
      this.addItem('hazards', {
        id: "custom_hazard",
        icon: "🔥",
        mode: "simple"
      });
    },

    renderHazards() {
      const container = document.getElementById("forge-hazards-list");
      if (!container) return;
      if (!currentPack.hazards || currentPack.hazards.length === 0) {
        container.innerHTML = '<p class="text-[10px] text-slate-500 italic text-center py-4">No hazards defined yet.</p>';
        return;
      }
      
            let html = '';
      const page = currentPages.hazards || 1;
      const startIdx = (page - 1) * ITEMS_PER_PAGE;
      const endIdx = Math.min(startIdx + ITEMS_PER_PAGE, currentPack.hazards.length);

      for (let idx = startIdx; idx < endIdx; idx++) {
        const item = currentPack.hazards[idx];
        html += `
          <div class="bg-slate-900/50 border border-slate-700 rounded-lg p-3 relative space-y-2">
            <button onclick="PackForge.removeItem('hazards', ${idx})" class="absolute top-2 right-2 w-6 h-6 flex items-center justify-center bg-rose-900/50 text-rose-400 hover:bg-rose-600 hover:text-white rounded transition-colors text-xs">✕</button>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pr-8">
              <div class="col-span-3">
                <label class="block text-[9px] font-bold text-slate-500 uppercase">Hazard ID</label>
                <input type="text" value="${item.id || ''}" onchange="PackForge.updateItem('hazards', ${idx}, 'id', this.value)" class="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[10px] text-white">
              </div>
              <div>
                <label class="block text-[9px] font-bold text-slate-500 uppercase">Icon</label>
                <input type="text" value="${item.icon || ''}" onchange="PackForge.updateItem('hazards', ${idx}, 'icon', this.value)" class="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[10px] text-white text-center">
              </div>
            </div>
          </div>
        `;
      }

      if (currentPack.enemies.length > ITEMS_PER_PAGE) {
        const maxPages = Math.ceil(currentPack.enemies.length / ITEMS_PER_PAGE);
        html += `
          <div class="flex justify-between items-center mt-4 border-t border-slate-800 pt-3">
            <button onclick="PackForge.changePage('$enemies', -1)" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-300 font-bold uppercase transition-colors disabled:opacity-30 disabled:pointer-events-none" ${page <= 1 ? 'disabled' : ''}>Prev</button>
            <span class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Page ${page} of ${maxPages}</span>
            <button onclick="PackForge.changePage('$enemies', 1)" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-300 font-bold uppercase transition-colors disabled:opacity-30 disabled:pointer-events-none" ${page >= maxPages ? 'disabled' : ''}>Next</button>
          </div>
        `;
      }
      container.innerHTML = html;
    },

    // ── Advanced Mode Sync ───────────────────────────────────────────────────

    syncSimpleToJson() {
      this.updateMeta();
      const editor = document.getElementById("forge-json-editor");
      editor.value = JSON.stringify(currentPack, null, 2);
      this.validateJson();
    },

    syncJsonToSimple() {
      const editor = document.getElementById("forge-json-editor");
      try {
        const parsed = JSON.parse(editor.value);
        currentPack = parsed;
        this.render();
      } catch (e) {
        console.warn("Forge: JSON parse failed, skipping sync to Simple mode.");
      }
    },

    onJsonInput() {
      this.validateJson();
      this.syncJsonToSimple(); // real-time sync back if valid
    },

    validateJson() {
      const editor = document.getElementById("forge-json-editor");
      const errBox = document.getElementById("forge-json-error");
      
      try {
        const parsed = JSON.parse(editor.value);
        if (window.PackEngine) {
          const res = window.PackEngine.validatePack(parsed);
          if (!res.valid) {
            errBox.innerText = res.errors.join('\n');
            errBox.classList.remove('hide');
            errBox.classList.replace('bg-emerald-900/90', 'bg-rose-900/90');
            errBox.classList.replace('border-emerald-500', 'border-rose-500');
          } else {
            errBox.innerText = "JSON is valid.";
            errBox.classList.remove('hide');
            errBox.classList.replace('bg-rose-900/90', 'bg-emerald-900/90');
            errBox.classList.replace('border-rose-500', 'border-emerald-500');
          }
        }
      } catch (e) {
        errBox.innerText = `JSON Syntax Error: ${e.message}`;
        errBox.classList.remove('hide');
        errBox.classList.replace('bg-emerald-900/90', 'bg-rose-900/90');
        errBox.classList.replace('border-emerald-500', 'border-rose-500');
      }
    },

    // ── Export ───────────────────────────────────────────────────────────────

    async exportPack() {
      if (currentMode === "advanced") this.syncJsonToSimple();
      else this.updateMeta();
      
      if (window.PackEngine) {
        const val = window.PackEngine.validatePack(currentPack);
        if (!val.valid) {
          alert(`Cannot export invalid pack:\n${val.errors.join('\n')}`, "Export Failed", "❌");
          return;
        }
      }

      const jsonStr = JSON.stringify(currentPack, null, 2);
      
      if (window.Plugins && window.Plugins.isTauri) {
        const dialog = window.__TAURI__.dialog || window.__TAURI__.pluginDialog;
        if (dialog && dialog.save) {
          try {
            const filePath = await dialog.save({
              title: 'Export Content Pack',
              defaultPath: `${currentPack.id}.json`,
              filters: [{ name: 'JSON', extensions: ['json'] }]
            });
            if (filePath) {
              const enc = new TextEncoder();
              const arr = enc.encode(jsonStr);
              await window.__TAURI__.core.invoke('plugin:fs|write_file', {
                path: filePath,
                data: Array.from(arr)
              });
              if(window.addLog) addLog("Pack exported successfully!");
              return;
            }
          } catch (e) {
            console.error("Export failed", e);
          }
        }
      }
      
      // Web fallback
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${currentPack.id || 'pack'}.json`;
      a.click();
      URL.revokeObjectURL(url);
      if(window.addLog) addLog("Pack exported via browser download.");
    }

  };

  window.PackForge = PackForge;
})();
