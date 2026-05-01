/**
 * PACK FORGE
 * Logic for the in-game Content Pack creator UI.
 */

(function() {

  const defaultPack = {
    id: "",
    name: "",
    version: "1.0.0",
    author: "",
    description: "",
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
  
  const FORGE_SECTIONS = [
    { id: 'meta', label: 'Pack Info' },
    { id: 'enemies', label: 'Enemies' },
    { id: 'classes', label: 'Classes' },
    { id: 'weapons', label: 'Weapons' },
    { id: 'hazards', label: 'Hazards' },
    { id: 'artifacts', label: 'Artifacts' },
    { id: 'skin', label: 'Skin' }
  ];
  let currentSectionIdx = 0;

  const PackForge = {

    open() {
      currentPack = JSON.parse(JSON.stringify(defaultPack));
      currentMode = "simple";
      this.render();
      
      const forgeModal = document.getElementById("modal-forge");
      const backdrop = document.getElementById("modal-backdrop");
      if (forgeModal) forgeModal.classList.remove("hide");
      if (backdrop) backdrop.classList.remove("hide");
      
      currentSectionIdx = 0;
      this.setSection(FORGE_SECTIONS[currentSectionIdx].id);
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
      else {
        this.updateMeta();
        if (!this.validateWizard()) return;
      }
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
      
      if (window.resetGame) window.resetGame();
      if (window.startGameFlow) await window.startGameFlow();
      if (window.showScreen) window.showScreen("screen-game");
    },

    onIdInput(el) {
      el.value = this.purifyId(el.value);
      this.updateMeta();
    },

    purifyId(str) {
      return str.toLowerCase().replace(/[\s_]+/g, '-');
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

    getAvailableSections() {
      const type = currentPack.type || 'mega';
      return FORGE_SECTIONS.filter(s => {
        if (s.id === 'meta') return true;
        if (type === 'mega') return true;
        if (type === 'dungeon') return ['enemies', 'hazards', 'artifacts'].includes(s.id);
        if (type === 'class') return ['classes'].includes(s.id);
        if (type === 'skin') return ['skin'].includes(s.id);
        return false;
      });
    },

    render() {
      const avail = this.getAvailableSections();
      
      // Sync meta fields
      document.getElementById("forge-meta-id").value = currentPack.id || "";
      document.getElementById("forge-meta-name").value = currentPack.name || "";
      document.getElementById("forge-meta-author").value = currentPack.author || "";
      document.getElementById("forge-meta-version").value = currentPack.version || "";
      document.getElementById("forge-meta-type").value = currentPack.type || "mega";
      document.getElementById("forge-meta-icon").value = currentPack.icon || "📦";
      document.getElementById("forge-meta-desc").value = currentPack.description || "";
      
      // Update wizard state
      const section = avail[currentSectionIdx] || avail[0];
      const sectionIdx = avail.indexOf(section);
      
      document.getElementById("forge-step-indicator").innerText = `Step ${sectionIdx + 1} of ${avail.length}: ${section.label}`;
      document.getElementById("forge-step-counter").innerText = `${sectionIdx + 1}/${avail.length}`;

      const btnPrev = document.getElementById("forge-btn-prev");
      const btnNext = document.getElementById("forge-btn-next");
      if (btnPrev) {
        if (sectionIdx === 0) btnPrev.classList.add("hide");
        else btnPrev.classList.remove("hide");
      }
      if (btnNext) {
        if (sectionIdx === avail.length - 1) btnNext.classList.add("hide");
        else btnNext.classList.remove("hide");
      }

      this.renderEnemies();
      this.renderClasses();
      this.renderWeapons();
      this.renderHazards();
      this.renderArtifacts();
    },

    nextSection() {
      const avail = this.getAvailableSections();
      if (currentSectionIdx < avail.length - 1) {
        currentSectionIdx++;
        this.setSection(avail[currentSectionIdx].id);
      }
    },

    prevSection() {
      const avail = this.getAvailableSections();
      if (currentSectionIdx > 0) {
        currentSectionIdx--;
        this.setSection(avail[currentSectionIdx].id);
      }
    },

    setSection(sectionId) {
      const avail = this.getAvailableSections();
      currentSectionIdx = avail.findIndex(s => s.id === sectionId);
      if (currentSectionIdx < 0) currentSectionIdx = 0;
      
      FORGE_SECTIONS.forEach(s => {
        const view = document.getElementById(`forge-section-${s.id}`);
        if (view) {
          if (s.id === sectionId) view.classList.remove("hide");
          else view.classList.add("hide");
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
      
      // Clear highlights on input
      const fields = ['id', 'name', 'author', 'version', 'icon', 'desc'];
      fields.forEach(f => {
        const el = document.getElementById(`forge-meta-${f}`);
        if (el) el.classList.remove('border-rose-500', 'ring-1', 'ring-rose-500');
      });

      // Real-time sync to advanced editor
      this.syncSimpleToJson();
    },

    render() {
      const avail = this.getAvailableSections();
      
      // Sync meta fields
      document.getElementById("forge-meta-id").value = currentPack.id || "";
      document.getElementById("forge-meta-name").value = currentPack.name || "";
      document.getElementById("forge-meta-author").value = currentPack.author || "";
      document.getElementById("forge-meta-version").value = currentPack.version || "";
      document.getElementById("forge-meta-type").value = currentPack.type || "mega";
      document.getElementById("forge-meta-icon").value = currentPack.icon || "📦";
      document.getElementById("forge-meta-desc").value = currentPack.description || "";
      
      // Update wizard state
      const section = avail[currentSectionIdx] || avail[0];
      const sectionIdx = avail.indexOf(section);
      
      const stepInd = document.getElementById("forge-step-indicator");
      const stepCount = document.getElementById("forge-step-counter");
      if (stepInd) stepInd.innerText = `Step ${sectionIdx + 1} of ${avail.length}: ${section.label}`;
      if (stepCount) stepCount.innerText = `${sectionIdx + 1}/${avail.length}`;

      const btnPrev = document.getElementById("forge-btn-prev");
      const btnNext = document.getElementById("forge-btn-next");
      if (btnPrev) {
        if (sectionIdx === 0) btnPrev.classList.add("hide");
        else btnPrev.classList.remove("hide");
      }
      if (btnNext) {
        if (sectionIdx === avail.length - 1) btnNext.classList.add("hide");
        else btnNext.classList.remove("hide");
      }

      this.renderEnemies();
      this.renderClasses();
      this.renderWeapons();
      this.renderHazards();
      this.renderArtifacts();
    },

    validateWizard() {
      const required = [
        { id: 'forge-meta-id', val: currentPack.id },
        { id: 'forge-meta-name', val: currentPack.name },
        { id: 'forge-meta-author', val: currentPack.author },
        { id: 'forge-meta-desc', val: currentPack.description }
      ];

      let firstInvalid = null;
      required.forEach(field => {
        const el = document.getElementById(field.id);
        if (!field.val || field.val.trim() === "") {
          if (el) {
            el.classList.add('border-rose-500', 'ring-1', 'ring-rose-500');
            if (!firstInvalid) firstInvalid = el;
          }
        } else {
          if (el) el.classList.remove('border-rose-500', 'ring-1', 'ring-rose-500');
        }
      });

      if (firstInvalid) {
        // Go to first section (meta) if needed
        if (currentSectionIdx !== 0) this.setSection('meta');
        firstInvalid.focus();
        return false;
      }

      // 2. Validate Items in Available Sections
      const avail = this.getAvailableSections();
      for (const section of avail) {
        const listName = section.id;
        const items = currentPack[listName];
        if (!items) continue;

        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          // Required fields for items: usually just 'id' (and 'name' for enemies)
          const itemReqs = [{ field: 'id', label: 'ID' }];
          if (['enemies', 'classes', 'hazards', 'artifacts'].includes(listName)) {
            itemReqs.push({ field: 'name', label: 'Name' });
          }
          if (listName === 'classes' || listName === 'artifacts') {
            itemReqs.push({ field: 'desc', label: 'Description' });
          }
          if (listName === 'classes' || listName === 'artifacts') {
            itemReqs.push({ field: 'icon', label: 'Icon' });
          }

          for (const req of itemReqs) {
            if (!item[req.field] || item[req.field].trim() === "") {
              // Go to this section and page
              this.setSection(listName);
              const page = Math.ceil((i + 1) / ITEMS_PER_PAGE);
              this.changePage(listName, page - currentPages[listName]);
              
              // Highlight and focus
              setTimeout(() => {
                const el = document.getElementById(`forge-${listName}-${i}-${req.field}`);
                if (el) {
                  el.classList.add('border-rose-500', 'ring-1', 'ring-rose-500');
                  el.focus();
                }
              }, 10);
              return false;
            }
          }
        }
      }

      return true;
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

    updateItem(listName, idx, fieldPath, value) {
      if (!currentPack[listName]) currentPack[listName] = [];
      if (!currentPack[listName][idx]) return;

      // Deep set logic for fieldPath (e.g. 'ability.name')
      const parts = fieldPath.split('.');
      let obj = currentPack[listName][idx];
      for (let i = 0; i < parts.length - 1; i++) {
        if (!obj[parts[i]]) obj[parts[i]] = {};
        obj = obj[parts[i]];
      }
      obj[parts[parts.length - 1]] = value;

      // Clear highlights on input
      const safePath = fieldPath.replace(/\./g, '-');
      const el = document.getElementById(`forge-${listName}-${idx}-${safePath}`);
      if (el) el.classList.remove('border-rose-500', 'ring-1', 'ring-rose-500');

      // Real-time sync to advanced editor
      this.syncSimpleToJson();
    },

    // ── Enemies ─────────────────────────────────────────────────────────────

    addEnemy() {
      this.addItem('enemies', {
        id: "",
        name: "",
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
          <div class="bg-slate-900/80 border border-slate-700/50 rounded-xl p-5 relative shadow-xl">
            <div class="flex justify-between items-center mb-4 pb-2 border-b border-slate-800/50">
              <div class="flex items-center gap-2">
                <span class="text-xs">👹</span>
                <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Enemy Slot #${idx + 1}</span>
              </div>
              <button onclick="PackForge.removeItem('enemies', ${idx})" class="flex items-center gap-1 px-2 py-1 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg transition-all text-[9px] font-black uppercase tracking-widest border border-rose-500/20">
                <span>✕</span> <span>Remove</span>
              </button>
            </div>
            
            <div class="space-y-4">
              <!-- Basic Info -->
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div class="col-span-2">
                  <label class="block text-[10px] font-black text-slate-500 uppercase tracking-tighter mb-1">Enemy Identifier</label>
                  <input type="text" id="forge-enemies-${idx}-id" value="${item.id || ''}" placeholder="e.g. shadow-stalker" oninput="this.value = PackForge.purifyId(this.value); PackForge.updateItem('enemies', ${idx}, 'id', this.value)" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white transition-all focus:border-rose-500 outline-none">
                </div>
                <div class="col-span-2">
                  <label class="block text-[10px] font-black text-slate-500 uppercase tracking-tighter mb-1">Display Name</label>
                  <input type="text" id="forge-enemies-${idx}-name" value="${item.name || ''}" placeholder="e.g. Shadow Stalker" oninput="PackForge.updateItem('enemies', ${idx}, 'name', this.value)" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white transition-all focus:border-rose-500 outline-none">
                </div>
                <div>
                  <label class="block text-[10px] font-black text-slate-500 uppercase tracking-tighter mb-1">Icon</label>
                  <input type="text" value="${item.icon || ''}" oninput="PackForge.updateItem('enemies', ${idx}, 'icon', this.value)" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white text-center focus:border-rose-500 outline-none">
                </div>
                <div>
                  <label class="block text-[10px] font-black text-slate-500 uppercase tracking-tighter mb-1">Health Points</label>
                  <input type="number" value="${item.hp || ''}" oninput="PackForge.updateItem('enemies', ${idx}, 'hp', parseInt(this.value))" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-amber-400 font-mono focus:border-rose-500 outline-none">
                </div>
                <div>
                  <label class="block text-[10px] font-black text-slate-500 uppercase tracking-tighter mb-1">Spawn Slides</label>
                  <input type="number" value="${item.slides || ''}" oninput="PackForge.updateItem('enemies', ${idx}, 'slides', parseInt(this.value))" class="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-3 py-2 text-xs text-emerald-400 font-mono focus:border-rose-500 outline-none">
                </div>
                <div>
                  <label class="block text-[10px] font-black text-slate-500 uppercase tracking-tighter mb-1">Logic Mode</label>
                  <select oninput="PackForge.updateItem('enemies', ${idx}, 'mode', this.value)" class="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-3 py-2 text-xs text-indigo-300 focus:border-rose-500 outline-none cursor-pointer">
                    <option value="simple" ${item.mode === 'simple' ? 'selected' : ''}>Simple</option>
                    <option value="advanced" ${item.mode === 'advanced' ? 'selected' : ''}>Advanced (Script)</option>
                  </select>
                </div>
              </div>

              <!-- Lore Bar -->
              <div class="bg-slate-950/30 p-3 rounded-lg border border-slate-800/50">
                <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 opacity-50">Enemy Lore / Flavor Text</label>
                <input type="text" value="${item.lore || ''}" oninput="PackForge.updateItem('enemies', ${idx}, 'lore', this.value)" class="w-full bg-transparent border-none p-0 text-xs text-slate-300 outline-none italic placeholder:text-slate-700" placeholder="He haunts the dark corridors...">
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Primary Ability Group -->
                <div class="bg-indigo-500/5 p-4 rounded-xl border border-indigo-500/10 space-y-3">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                    <span class="text-[10px] text-indigo-400 font-black uppercase tracking-widest">Primary Ability</span>
                  </div>
                  <div class="grid grid-cols-2 gap-3">
                    <div class="col-span-1">
                      <label class="block text-[9px] font-bold text-slate-500 uppercase mb-1">Trigger</label>
                      <select oninput="PackForge.updateItem('enemies', ${idx}, 'primaryAbility.trigger', this.value)" class="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-[10px] text-white">
                        <option value="">None</option>
                        <option value="every_n_slides" ${item.primaryAbility?.trigger === 'every_n_slides' ? 'selected' : ''}>Every N Slides</option>
                        <option value="on_damage" ${item.primaryAbility?.trigger === 'on_damage' ? 'selected' : ''}>On Damage</option>
                        <option value="on_hp_below" ${item.primaryAbility?.trigger === 'on_hp_below' ? 'selected' : ''}>On HP Below</option>
                        <option value="on_slide_start" ${item.primaryAbility?.trigger === 'on_slide_start' ? 'selected' : ''}>On Slide Start</option>
                        <option value="on_weapon_merge" ${item.primaryAbility?.trigger === 'on_weapon_merge' ? 'selected' : ''}>On Weapon Merge</option>
                        <option value="on_death" ${item.primaryAbility?.trigger === 'on_death' ? 'selected' : ''}>On Death</option>
                      </select>
                    </div>
                    <div class="col-span-1">
                      <label class="block text-[9px] font-bold text-slate-500 uppercase mb-1">Trigger Param</label>
                      <input type="number" value="${item.primaryAbility?.triggerParam || ''}" oninput="PackForge.updateItem('enemies', ${idx}, 'primaryAbility.triggerParam', parseInt(this.value))" class="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-[10px] text-white font-mono">
                    </div>
                    <div class="col-span-1">
                      <label class="block text-[9px] font-bold text-slate-500 uppercase mb-1">Effect</label>
                      <select oninput="PackForge.updateItem('enemies', ${idx}, 'primaryAbility.effect', this.value)" class="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-[10px] text-white">
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
                    <div class="col-span-1">
                      <label class="block text-[9px] font-bold text-slate-500 uppercase mb-1">Effect Param</label>
                      <input type="text" value="${item.primaryAbility?.effectParam || ''}" oninput="PackForge.updateItem('enemies', ${idx}, 'primaryAbility.effectParam', this.value)" class="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-[10px] text-white">
                    </div>
                  </div>
                </div>

                <!-- Passive Ability Group -->
                <div class="bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/10 space-y-3">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span class="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Passive Effect</span>
                  </div>
                  <div class="grid grid-cols-2 gap-3">
                    <div class="col-span-1">
                      <label class="block text-[9px] font-bold text-slate-500 uppercase mb-1">Effect Type</label>
                      <select oninput="PackForge.updateItem('enemies', ${idx}, 'passiveAbility.effect', this.value)" class="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-[10px] text-white">
                        <option value="">None</option>
                        <option value="regen" ${item.passiveAbility?.effect === 'regen' ? 'selected' : ''}>Regen</option>
                        <option value="damage_reduction" ${item.passiveAbility?.effect === 'damage_reduction' ? 'selected' : ''}>Damage Reduction</option>
                        <option value="crit_immune" ${item.passiveAbility?.effect === 'crit_immune' ? 'selected' : ''}>Crit Immune</option>
                      </select>
                    </div>
                    <div class="col-span-1">
                      <label class="block text-[9px] font-bold text-slate-500 uppercase mb-1">Value</label>
                      <input type="number" value="${item.passiveAbility?.effectParam || ''}" oninput="PackForge.updateItem('enemies', ${idx}, 'passiveAbility.effectParam', parseInt(this.value))" class="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-[10px] text-white font-mono">
                    </div>
                    <div class="col-span-2">
                      <label class="block text-[9px] font-bold text-slate-500 uppercase mb-1">Gold Reward</label>
                      <input type="number" value="${item.deathReward?.goldBonus || ''}" placeholder="Bonus Gold on Death" oninput="PackForge.updateItem('enemies', ${idx}, 'deathReward.goldBonus', parseInt(this.value))" class="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-[10px] text-amber-500 font-mono">
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
      }

      if (currentPack.enemies.length > ITEMS_PER_PAGE) {
        const maxPages = Math.ceil(currentPack.enemies.length / ITEMS_PER_PAGE);
        html += `
          <div class="flex justify-between items-center mt-4 border-t border-slate-800 pt-3">
            <button onclick="PackForge.changePage('enemies', -1)" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-300 font-bold uppercase transition-colors disabled:opacity-30 disabled:pointer-events-none" ${page <= 1 ? 'disabled' : ''}>Prev</button>
            <span class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Page ${page} of ${maxPages}</span>
            <button onclick="PackForge.changePage('enemies', 1)" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-300 font-bold uppercase transition-colors disabled:opacity-30 disabled:pointer-events-none" ${page >= maxPages ? 'disabled' : ''}>Next</button>
          </div>
        `;
      }
      container.innerHTML = html;
    },

    // ── Classes ─────────────────────────────────────────────────────────────

    addClass() {
      this.addItem('classes', {
        id: "",
        name: "",
        icon: "👤",
        desc: "",
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
          <div class="bg-slate-900/80 border border-slate-700/50 rounded-xl p-5 relative shadow-xl">
            <div class="flex justify-between items-center mb-4 pb-2 border-b border-slate-800/50">
              <div class="flex items-center gap-2">
                <span class="text-xs">👤</span>
                <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Class Slot #${idx + 1}</span>
              </div>
              <button onclick="PackForge.removeItem('classes', ${idx})" class="flex items-center gap-1 px-2 py-1 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg transition-all text-[9px] font-black uppercase tracking-widest border border-rose-500/20">
                <span>✕</span> <span>Remove</span>
              </button>
            </div>
            
            <div class="space-y-4">
              <!-- Basic Info -->
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div class="col-span-2">
                  <label class="block text-[10px] font-black text-slate-500 uppercase tracking-tighter mb-1">Class Identifier</label>
                  <input type="text" id="forge-classes-${idx}-id" value="${item.id || ''}" placeholder="e.g. dragon-slayer" oninput="this.value = PackForge.purifyId(this.value); PackForge.updateItem('classes', ${idx}, 'id', this.value)" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white transition-all focus:border-rose-500 outline-none">
                </div>
                <div class="col-span-2">
                  <label class="block text-[10px] font-black text-slate-500 uppercase tracking-tighter mb-1">Display Name</label>
                  <input type="text" id="forge-classes-${idx}-name" value="${item.name || ''}" placeholder="e.g. Dragon Slayer" oninput="PackForge.updateItem('classes', ${idx}, 'name', this.value)" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white transition-all focus:border-rose-500 outline-none">
                </div>
                <div>
                  <label class="block text-[10px] font-black text-slate-500 uppercase tracking-tighter mb-1">Icon</label>
                  <input type="text" id="forge-classes-${idx}-icon" value="${item.icon || ''}" oninput="PackForge.updateItem('classes', ${idx}, 'icon', this.value)" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white text-center focus:border-rose-500 outline-none">
                </div>
                <div>
                  <label class="block text-[10px] font-black text-slate-500 uppercase tracking-tighter mb-1">D20 Modifier</label>
                  <input type="number" value="${item.d20Mod || 0}" oninput="PackForge.updateItem('classes', ${idx}, 'd20Mod', parseInt(this.value))" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-amber-400 font-mono focus:border-rose-500 outline-none">
                </div>
                <div class="col-span-2">
                  <label class="block text-[10px] font-black text-slate-500 uppercase tracking-tighter mb-1">Brief Description</label>
                  <input type="text" id="forge-classes-${idx}-desc" value="${item.desc || ''}" oninput="PackForge.updateItem('classes', ${idx}, 'desc', this.value)" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 transition-all focus:border-rose-500 outline-none" placeholder="Master of fire and steel.">
                </div>
                <div class="col-span-2">
                  <label class="block text-[10px] font-black text-slate-500 uppercase tracking-tighter mb-1">Lore / Flavor Text</label>
                  <input type="text" value="${item.lore || ''}" oninput="PackForge.updateItem('classes', ${idx}, 'lore', this.value)" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-400 italic transition-all focus:border-rose-500 outline-none" placeholder="Born in the ashes of the old world...">
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Passive Ability Group -->
                <div class="bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/10 space-y-3">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981]"></span>
                    <span class="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Passive Ability</span>
                  </div>
                  <div class="grid grid-cols-2 gap-3">
                    <div class="col-span-1">
                      <label class="block text-[9px] font-bold text-slate-500 uppercase mb-1">Trigger</label>
                      <select oninput="PackForge.updateItem('classes', ${idx}, 'passiveTrigger', this.value)" class="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-[10px] text-white">
                        <option value="">None</option>
                        <option value="on_crit" ${item.passiveTrigger === 'on_crit' ? 'selected' : ''}>On Crit</option>
                        <option value="on_merge" ${item.passiveTrigger === 'on_merge' ? 'selected' : ''}>On Merge</option>
                        <option value="on_merge_t3" ${item.passiveTrigger === 'on_merge_t3' ? 'selected' : ''}>On Merge T3+</option>
                        <option value="on_slide" ${item.passiveTrigger === 'on_slide' ? 'selected' : ''}>On Slide</option>
                        <option value="on_gold_earn" ${item.passiveTrigger === 'on_gold_earn' ? 'selected' : ''}>On Gold Earn</option>
                        <option value="on_spell_cast" ${item.passiveTrigger === 'on_spell_cast' ? 'selected' : ''}>On Spell Cast</option>
                      </select>
                    </div>
                    <div class="col-span-1">
                      <label class="block text-[9px] font-bold text-slate-500 uppercase mb-1">Effect</label>
                      <select oninput="PackForge.updateItem('classes', ${idx}, 'passiveEffect', this.value)" class="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-[10px] text-white">
                        <option value="">None</option>
                        <option value="restore_slides" ${item.passiveEffect === 'restore_slides' ? 'selected' : ''}>Restore Slides</option>
                        <option value="add_gold" ${item.passiveEffect === 'add_gold' ? 'selected' : ''}>Add Gold</option>
                        <option value="add_multiplier" ${item.passiveEffect === 'add_multiplier' ? 'selected' : ''}>Add Multiplier</option>
                        <option value="deal_damage" ${item.passiveEffect === 'deal_damage' ? 'selected' : ''}>Deal Damage</option>
                      </select>
                    </div>
                    <div class="col-span-2">
                      <label class="block text-[9px] font-bold text-slate-500 uppercase mb-1">Effect Parameter</label>
                      <input type="number" step="0.01" value="${item.passiveParam || ''}" oninput="PackForge.updateItem('classes', ${idx}, 'passiveParam', parseFloat(this.value))" class="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-[10px] text-white font-mono">
                    </div>
                  </div>
                </div>

                <!-- Active Spell Group -->
                <div class="bg-purple-500/5 p-4 rounded-xl border border-purple-500/10 space-y-3">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_5px_#a855f7]"></span>
                    <span class="text-[10px] text-purple-400 font-black uppercase tracking-widest">Active Spell</span>
                  </div>
                  <div class="grid grid-cols-2 gap-3">
                    <div class="col-span-1">
                      <label class="block text-[9px] font-bold text-slate-500 uppercase mb-1">Spell Name</label>
                      <input type="text" value="${item.ability?.name || ''}" oninput="PackForge.updateItem('classes', ${idx}, 'ability.name', this.value)" class="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-[10px] text-white">
                    </div>
                    <div class="col-span-1">
                      <label class="block text-[9px] font-bold text-slate-500 uppercase mb-1">Type</label>
                      <select oninput="PackForge.updateItem('classes', ${idx}, 'ability.spellType', this.value)" class="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-[10px] text-white">
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
                    <div class="col-span-2 grid grid-cols-3 gap-2">
                      <div>
                        <label class="block text-[8px] font-bold text-slate-600 uppercase mb-1 text-center">Dice</label>
                        <input type="number" value="${item.ability?.count || 1}" oninput="PackForge.updateItem('classes', ${idx}, 'ability.count', parseInt(this.value))" class="w-full bg-slate-950 border border-slate-800 rounded px-1 py-1 text-[10px] text-white text-center">
                      </div>
                      <div>
                        <label class="block text-[8px] font-bold text-slate-600 uppercase mb-1 text-center">Sides</label>
                        <input type="number" value="${item.ability?.sides || 6}" oninput="PackForge.updateItem('classes', ${idx}, 'ability.sides', parseInt(this.value))" class="w-full bg-slate-950 border border-slate-800 rounded px-1 py-1 text-[10px] text-white text-center">
                      </div>
                      <div>
                        <label class="block text-[8px] font-bold text-slate-600 uppercase mb-1 text-center">Uses</label>
                        <input type="number" value="${item.ability?.maxUses || 1}" oninput="PackForge.updateItem('classes', ${idx}, 'ability.maxUses', parseInt(this.value))" class="w-full bg-slate-950 border border-slate-800 rounded px-1 py-1 text-[10px] text-white text-center">
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
      }

      if (currentPack.classes.length > ITEMS_PER_PAGE) {
        const maxPages = Math.ceil(currentPack.classes.length / ITEMS_PER_PAGE);
        html += `
          <div class="flex justify-between items-center mt-4 border-t border-slate-800 pt-3">
            <button onclick="PackForge.changePage('classes', -1)" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-300 font-bold uppercase transition-colors disabled:opacity-30 disabled:pointer-events-none" ${page <= 1 ? 'disabled' : ''}>Prev</button>
            <span class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Page ${page} of ${maxPages}</span>
            <button onclick="PackForge.changePage('classes', 1)" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-300 font-bold uppercase transition-colors disabled:opacity-30 disabled:pointer-events-none" ${page >= maxPages ? 'disabled' : ''}>Next</button>
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
          <div class="bg-slate-900/80 border border-slate-700/50 rounded-xl p-5 relative shadow-xl">
            <div class="flex justify-between items-center mb-4 pb-2 border-b border-slate-800/50">
              <div class="flex items-center gap-2">
                <span class="text-xs">🗡️</span>
                <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Weapon Slot #${idx + 1}</span>
              </div>
              <button onclick="PackForge.removeItem('weapons', ${idx})" class="flex items-center gap-1 px-2 py-1 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg transition-all text-[9px] font-black uppercase tracking-widest border border-rose-500/20">
                <span>✕</span> <span>Remove</span>
              </button>
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label class="block text-[10px] font-black text-slate-500 uppercase tracking-tighter mb-1">Merge Value</label>
                <input type="number" id="forge-weapons-${idx}-value" value="${item.value || ''}" oninput="PackForge.updateItem('weapons', ${idx}, 'value', parseInt(this.value))" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-rose-400 font-mono focus:border-rose-500 outline-none transition-all">
              </div>
              <div class="col-span-2">
                <label class="block text-[10px] font-black text-slate-500 uppercase tracking-tighter mb-1">Name Override</label>
                <input type="text" id="forge-weapons-${idx}-name" value="${item.name || ''}" oninput="PackForge.updateItem('weapons', ${idx}, 'name', this.value)" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 outline-none transition-all">
              </div>
              <div>
                <label class="block text-[10px] font-black text-slate-500 uppercase tracking-tighter mb-1">Icon</label>
                <input type="text" id="forge-weapons-${idx}-icon" value="${item.icon || ''}" oninput="PackForge.updateItem('weapons', ${idx}, 'icon', this.value)" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white text-center focus:border-rose-500 outline-none transition-all">
              </div>
            </div>
          </div>
        `;
      }

      if (currentPack.weapons.length > ITEMS_PER_PAGE) {
        const maxPages = Math.ceil(currentPack.weapons.length / ITEMS_PER_PAGE);
        html += `
          <div class="flex justify-between items-center mt-4 border-t border-slate-800 pt-3">
            <button onclick="PackForge.changePage('weapons', -1)" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-300 font-bold uppercase transition-colors disabled:opacity-30 disabled:pointer-events-none" ${page <= 1 ? 'disabled' : ''}>Prev</button>
            <span class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Page ${page} of ${maxPages}</span>
            <button onclick="PackForge.changePage('weapons', 1)" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-300 font-bold uppercase transition-colors disabled:opacity-30 disabled:pointer-events-none" ${page >= maxPages ? 'disabled' : ''}>Next</button>
          </div>
        `;
      }
      container.innerHTML = html;
    },

    // ── Hazards ─────────────────────────────────────────────────────────────

    addHazard() {
      this.addItem('hazards', {
        id: "",
        name: "",
        icon: "🔥",
        tileValue: -8,
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
          <div class="bg-slate-900/80 border border-slate-700/50 rounded-xl p-5 relative shadow-xl">
            <div class="flex justify-between items-center mb-4 pb-2 border-b border-slate-800/50">
              <div class="flex items-center gap-2">
                <span class="text-xs">🔥</span>
                <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Hazard Slot #${idx + 1}</span>
              </div>
              <button onclick="PackForge.removeItem('hazards', ${idx})" class="flex items-center gap-1 px-2 py-1 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg transition-all text-[9px] font-black uppercase tracking-widest border border-rose-500/20">
                <span>✕</span> <span>Remove</span>
              </button>
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div class="col-span-2">
                <label class="block text-[10px] font-black text-slate-500 uppercase tracking-tighter mb-1">Hazard Identifier</label>
                <input type="text" id="forge-hazards-${idx}-id" value="${item.id || ''}" oninput="this.value = PackForge.purifyId(this.value); PackForge.updateItem('hazards', ${idx}, 'id', this.value)" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 outline-none transition-all">
              </div>
              <div class="col-span-2">
                <label class="block text-[10px] font-black text-slate-500 uppercase tracking-tighter mb-1">Display Name</label>
                <input type="text" id="forge-hazards-${idx}-name" value="${item.name || ''}" placeholder="e.g. Hellfire" oninput="PackForge.updateItem('hazards', ${idx}, 'name', this.value)" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 outline-none transition-all">
              </div>
              <div>
                <label class="block text-[10px] font-black text-slate-500 uppercase tracking-tighter mb-1">Icon</label>
                <input type="text" id="forge-hazards-${idx}-icon" value="${item.icon || ''}" oninput="PackForge.updateItem('hazards', ${idx}, 'icon', this.value)" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white text-center focus:border-rose-500 outline-none transition-all">
              </div>
              <div>
                <label class="block text-[10px] font-black text-slate-500 uppercase tracking-tighter mb-1">Tile Value (≤ -8)</label>
                <input type="number" id="forge-hazards-${idx}-tileValue" value="${item.tileValue || -8}" oninput="PackForge.updateItem('hazards', ${idx}, 'tileValue', parseInt(this.value))" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-amber-500 font-mono focus:border-rose-500 outline-none transition-all">
              </div>
            </div>
          </div>
        `;
      }

      if (currentPack.hazards.length > ITEMS_PER_PAGE) {
        const maxPages = Math.ceil(currentPack.hazards.length / ITEMS_PER_PAGE);
        html += `
          <div class="flex justify-between items-center mt-4 border-t border-slate-800 pt-3">
            <button onclick="PackForge.changePage('hazards', -1)" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-300 font-bold uppercase transition-colors disabled:opacity-30 disabled:pointer-events-none" ${page <= 1 ? 'disabled' : ''}>Prev</button>
            <span class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Page ${page} of ${maxPages}</span>
            <button onclick="PackForge.changePage('hazards', 1)" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-300 font-bold uppercase transition-colors disabled:opacity-30 disabled:pointer-events-none" ${page >= maxPages ? 'disabled' : ''}>Next</button>
          </div>
        `;
      }
      container.innerHTML = html;
    },

    // ── Artifacts ───────────────────────────────────────────────────────────

    addArtifact() {
      this.addItem('artifacts', {
        id: "",
        name: "",
        icon: "🏺",
        desc: "",
        rarity: "common",
        price: 50
      });
    },

    renderArtifacts() {
      const container = document.getElementById("forge-artifacts-list");
      if (!container) return;
      if (!currentPack.artifacts || currentPack.artifacts.length === 0) {
        container.innerHTML = '<p class="text-[10px] text-slate-500 italic text-center py-4">No artifacts defined yet.</p>';
        return;
      }
      
      let html = '';
      const page = currentPages.artifacts || 1;
      const startIdx = (page - 1) * ITEMS_PER_PAGE;
      const endIdx = Math.min(startIdx + ITEMS_PER_PAGE, currentPack.artifacts.length);

      for (let idx = startIdx; idx < endIdx; idx++) {
        const item = currentPack.artifacts[idx];
        html += `
          <div class="bg-slate-900/80 border border-slate-700/50 rounded-xl p-5 relative shadow-xl">
            <div class="flex justify-between items-center mb-4 pb-2 border-b border-slate-800/50">
              <div class="flex items-center gap-2">
                <span class="text-xs">🏺</span>
                <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Artifact Slot #${idx + 1}</span>
              </div>
              <button onclick="PackForge.removeItem('artifacts', ${idx})" class="flex items-center gap-1 px-2 py-1 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg transition-all text-[9px] font-black uppercase tracking-widest border border-rose-500/20">
                <span>✕</span> <span>Remove</span>
              </button>
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div class="col-span-2">
                <label class="block text-[10px] font-black text-slate-500 uppercase tracking-tighter mb-1">Artifact Identifier</label>
                <input type="text" id="forge-artifacts-${idx}-id" value="${item.id || ''}" placeholder="e.g. golden-goblet" oninput="this.value = PackForge.purifyId(this.value); PackForge.updateItem('artifacts', ${idx}, 'id', this.value)" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 outline-none transition-all">
              </div>
              <div class="col-span-2">
                <label class="block text-[10px] font-black text-slate-500 uppercase tracking-tighter mb-1">Display Name</label>
                <input type="text" id="forge-artifacts-${idx}-name" value="${item.name || ''}" placeholder="e.g. Golden Goblet" oninput="PackForge.updateItem('artifacts', ${idx}, 'name', this.value)" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 outline-none transition-all">
              </div>
              <div>
                <label class="block text-[10px] font-black text-slate-500 uppercase tracking-tighter mb-1">Icon</label>
                <input type="text" id="forge-artifacts-${idx}-icon" value="${item.icon || ''}" oninput="PackForge.updateItem('artifacts', ${idx}, 'icon', this.value)" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white text-center focus:border-rose-500 outline-none transition-all">
              </div>
              <div>
                <label class="block text-[10px] font-black text-slate-500 uppercase tracking-tighter mb-1">Purchase Price</label>
                <input type="number" id="forge-artifacts-${idx}-price" value="${item.price || 0}" oninput="PackForge.updateItem('artifacts', ${idx}, 'price', parseInt(this.value))" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-amber-500 font-mono focus:border-rose-500 outline-none transition-all">
              </div>
              <div class="col-span-2">
                <label class="block text-[10px] font-black text-slate-500 uppercase tracking-tighter mb-1">Description</label>
                <input type="text" id="forge-artifacts-${idx}-desc" value="${item.desc || ''}" placeholder="Artifact effect description" oninput="PackForge.updateItem('artifacts', ${idx}, 'desc', this.value)" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:border-rose-500 outline-none transition-all">
              </div>
            </div>
          </div>
        `;
      }

      if (currentPack.artifacts.length > ITEMS_PER_PAGE) {
        const maxPages = Math.ceil(currentPack.artifacts.length / ITEMS_PER_PAGE);
        html += `
          <div class="flex justify-between items-center mt-4 border-t border-slate-800 pt-3">
            <button onclick="PackForge.changePage('artifacts', -1)" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-300 font-bold uppercase transition-colors disabled:opacity-30 disabled:pointer-events-none" ${page <= 1 ? 'disabled' : ''}>Prev</button>
            <span class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Page ${page} of ${maxPages}</span>
            <button onclick="PackForge.changePage('artifacts', 1)" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-300 font-bold uppercase transition-colors disabled:opacity-30 disabled:pointer-events-none" ${page >= maxPages ? 'disabled' : ''}>Next</button>
          </div>
        `;
      }
      container.innerHTML = html;
    },

    // ── Advanced Mode Sync ───────────────────────────────────────────────────

    syncSimpleToJson() {
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
      // 1. Ensure state is synced
      if (currentMode === "advanced") {
        this.syncJsonToSimple();
      } else {
        this.updateMeta();
        if (!this.validateWizard()) return;
      }

      // 2. Final validation check
      if (window.PackEngine) {
        const val = window.PackEngine.validatePack(currentPack);
        if (!val.valid) {
          alert(`Cannot export invalid pack:\n${val.errors.join('\n')}`, "Export Failed", "❌");
          return;
        }
      }

      // 3. Generate JSON string
      const jsonStr = JSON.stringify(currentPack, null, 2);
      if (!jsonStr || jsonStr === "{}" || jsonStr.length < 10) {
        alert("Export failed: Pack data is empty or invalid.");
        return;
      }
      
      // 4. Platform-specific export
      if (window.__TAURI__ && window.__TAURI__.core) {
        const dialog = window.__TAURI__.dialog || window.__TAURI__.pluginDialog;
        if (dialog && dialog.save) {
          try {
            const filePath = await dialog.save({
              title: 'Export Content Pack',
              defaultPath: `${currentPack.id || 'pack'}.json`,
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
            console.error("Tauri export failed", e);
          }
        }
      }
      
      // Web fallback (Browser/Mobile)
      try {
        if(window.addLog) addLog("Generating browser download...");
        
        // Data URI approach is often more reliable in mobile WebViews than Blob URLs
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(jsonStr);
        
        const a = document.createElement("a");
        a.setAttribute('href', dataUri);
        a.setAttribute('download', `${currentPack.id || 'pack'}.json`);
        a.style.display = 'none';
        
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
          if (document.body.contains(a)) document.body.removeChild(a);
        }, 500);

        if(window.addLog) addLog("Download triggered. If nothing happened, try copying the raw JSON from the Advanced tab.");
      } catch (err) {
        console.error("Web export failed", err);
        alert("Browser download failed. Please switch to 'Advanced Mode' and copy the JSON manually.");
      }
    }

  };

  window.PackForge = PackForge;
})();
