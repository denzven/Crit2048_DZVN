/**
 * PACK MARKETPLACE (The Grimoire) - FORGE STYLE
 * Logic for the community registry, designed to match the Forge UI.
 */

(function() {
  const REGISTRY_URL = "https://raw.githubusercontent.com/denzven/Crit2048-grimoire/main/registry.json";
  
  let _registryCache = null;
  let _isOffline = false;
  let _searchTerm = "";
  let _currentTab = "all";
  let _touchStartX = 0;
  let _touchStartY = 0;

  const PackMarketplace = {

    async open() {
      const modal = document.getElementById("modal-marketplace");
      const backdrop = document.getElementById("modal-backdrop");
      if (modal) modal.classList.remove("hide");
      if (backdrop) backdrop.classList.remove("hide");
      document.body.classList.add("separate-page-active");
      
      this.setTab("all");
      this.initTouch();
      if (!_registryCache) {
        await this.fetchRegistry();
      } else {
        await this.renderGrid();
      }
    },

    close() {
      const modal = document.getElementById("modal-marketplace");
      const backdrop = document.getElementById("modal-backdrop");
      if (modal) modal.classList.add("hide");
      if (backdrop) backdrop.classList.add("hide");
      document.body.classList.remove("separate-page-active");
    },

    async setTab(tabId) {
      _currentTab = tabId;
      const tabs = ['all', 'mega', 'dungeon', 'class', 'weapon', 'artifacts', 'hazard', 'skin'];
      tabs.forEach(id => {
        const btn = document.getElementById(`market-tab-${id}`);
        if (btn) {
          if (id === tabId) {
            btn.className = "py-2 px-2 md:px-10 rounded-lg font-bold text-[9px] md:text-xs uppercase tracking-tight md:tracking-widest transition-all bg-rose-600 text-white shadow-inner truncate";
          } else {
            btn.className = "py-2 px-2 md:px-10 rounded-lg font-bold text-[9px] md:text-xs uppercase tracking-tight md:tracking-widest transition-all bg-slate-800 text-slate-400 hover:text-white truncate";
          }
        }
      });
      this.renderGrid();
      this.scrollToActiveTab(tabId);
    },

    scrollToActiveTab(tabId) {
      const el = document.getElementById(`market-tab-${tabId}`);
      const container = document.getElementById("market-tabs-container");
      if (el && container) {
        const offset = el.offsetLeft - (container.offsetWidth / 2) + (el.offsetWidth / 2);
        container.scrollTo({ left: offset, behavior: 'smooth' });
      }
    },

    initTouch() {
      const area = document.getElementById("market-content-area");
      if (!area || area.dataset.touchInit === "true") return;
      
      area.addEventListener("touchstart", (e) => {
        _touchStartX = e.touches[0].clientX;
        _touchStartY = e.touches[0].clientY;
      }, { passive: true });

      area.addEventListener("touchend", (e) => {
        const dx = e.changedTouches[0].clientX - _touchStartX;
        const dy = e.changedTouches[0].clientY - _touchStartY;
        
        // Only trigger if horizontal swipe is dominant and significant
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 60) {
          const tabs = ['all', 'mega', 'dungeon', 'class', 'weapon', 'artifacts', 'hazard', 'skin'];
          const currentIdx = tabs.indexOf(_currentTab);
          if (dx > 0 && currentIdx > 0) {
            this.setTab(tabs[currentIdx - 1]);
          } else if (dx < 0 && currentIdx < tabs.length - 1) {
            this.setTab(tabs[currentIdx + 1]);
          }
        }
      }, { passive: true });
      
      area.dataset.touchInit = "true";
    },

    onSearch(term) {
      _searchTerm = term.toLowerCase();
      this.renderGrid();
    },

    async refresh() {
      _registryCache = null;
      await this.fetchRegistry();
    },

    async fetchRegistry() {
      const loader = document.getElementById("market-loading");
      const grid = document.getElementById("market-grid");
      const badge = document.getElementById("market-status-badge");
      
      if (loader) loader.classList.remove("hide");
      if (grid) grid.classList.add("hide");
      
      try {
        const resp = await fetch(REGISTRY_URL, { cache: 'no-store' });
        if (!resp.ok) throw new Error("Network response was not ok");
        _registryCache = await resp.json();
        _isOffline = false;
        
        if (badge) {
          badge.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Online';
        }
      } catch (e) {
        console.warn("Grimoire: Failed to fetch registry, falling back to offline mode", e);
        _isOffline = true;
        _registryCache = { packs: [] };
        
        if (badge) {
          badge.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Offline';
        }
      }
      
      if (loader) loader.classList.add("hide");
      if (grid) grid.classList.remove("hide");
      await this.renderGrid();
    },

    async renderGrid() {
      const grid = document.getElementById("market-grid");
      const empty = document.getElementById("market-empty");
      if (!grid || !empty) return;

      const installed = await window.PackEngine.getInstalledPacks();
      const registryPacks = _registryCache?.packs || [];
      
      const allPacksMap = new Map();
      installed.forEach(p => {
        allPacksMap.set(p.id, { ...p, isInstalled: true });
      });

      registryPacks.forEach(p => {
        if (!allPacksMap.has(p.id)) {
          allPacksMap.set(p.id, { ...p, isInstalled: false });
        } else {
          const local = allPacksMap.get(p.id);
          allPacksMap.set(p.id, { ...p, ...local });
        }
      });

      let list = Array.from(allPacksMap.values());

      // Filter by category
      if (_currentTab !== "all") {
        list = list.filter(p => {
          if (_currentTab === 'mega') return p.type === 'mega';
          if (_currentTab === 'dungeon') return (p.enemies && p.enemies.length > 0);
          if (_currentTab === 'class') return p.type === 'class' || (p.classes && p.classes.length > 0);
          if (_currentTab === 'weapon') return (p.weapons && p.weapons.length > 0);
          if (_currentTab === 'artifacts') return p.type === 'artifacts' || (p.artifacts && p.artifacts.length > 0);
          if (_currentTab === 'hazard') return (p.hazards && p.hazards.length > 0);
          if (_currentTab === 'skin') return p.type === 'skin' || p.skin;
          return p.type === _currentTab;
        });
      }

      // Filter by search term
      if (_searchTerm) {
        list = list.filter(p => 
          p.name.toLowerCase().includes(_searchTerm) || 
          p.description.toLowerCase().includes(_searchTerm) ||
          (p.author && p.author.toLowerCase().includes(_searchTerm))
        );
      }

      if (list.length === 0) {
        grid.classList.add("hide");
        empty.classList.remove("hide");
        return;
      }

      grid.classList.remove("hide");
      empty.classList.add("hide");

      let html = '';
      list.forEach(pack => {
        html += this._buildCardHtml(pack, pack.isInstalled);
      });
      grid.innerHTML = html;
    },

    _buildCardHtml(pack, isInstalled) {
      const typeColors = {
        mega: 'bg-purple-950/30 text-purple-400 border-purple-500/20',
        dungeon: 'bg-rose-950/30 text-rose-400 border-rose-500/20',
        class: 'bg-indigo-950/30 text-indigo-400 border-indigo-500/20',
        artifacts: 'bg-amber-950/30 text-amber-400 border-amber-500/20',
        skin: 'bg-blue-950/30 text-blue-400 border-blue-500/20',
        weapon: 'bg-emerald-950/30 text-emerald-400 border-emerald-500/20',
        hazard: 'bg-orange-950/30 text-orange-400 border-orange-500/20'
      };
      const tColor = typeColors[pack.type] || 'bg-slate-800 text-slate-400 border-slate-700/50';
      
      const author = pack.author || 'Unknown';
      const version = pack.version || '1.0.0';
      const desc = pack.description || 'No description provided.';
      
      let actionBtns = '';
      if (isInstalled) {
        if (pack.isBuiltIn) {
          actionBtns = `
            <div class="grid grid-cols-2 gap-2 mt-auto pt-4 border-t border-slate-800">
              <button onclick="PackMarketplace.duplicatePack('${pack.id}')" class="py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors border border-slate-700">Clone</button>
              <button disabled class="py-2 bg-slate-900 text-slate-600 rounded-lg text-[9px] font-black uppercase tracking-widest cursor-not-allowed border border-slate-800/50">Core</button>
            </div>`;
        } else {
          actionBtns = `
            <div class="space-y-2 mt-auto pt-4 border-t border-slate-800">
              <div class="grid grid-cols-2 gap-2">
                <button onclick="PackForge.editInstalledPack('${pack.id}')" class="py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors border border-slate-700">Edit</button>
                <button onclick="PackMarketplace.duplicatePack('${pack.id}')" class="py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors border border-slate-700">Clone</button>
              </div>
              <button onclick="PackMarketplace.uninstallPack('${pack.id}')" class="w-full py-2 bg-slate-900 hover:bg-rose-900/50 text-slate-500 hover:text-rose-400 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border border-slate-800 hover:border-rose-500/30">Uninstall</button>
            </div>`;
        }
      } else {
        actionBtns = `
          <div class="mt-auto pt-4 border-t border-slate-800">
            <button onclick="PackMarketplace.installPack('${pack.packUrl}')" class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-900/50 border border-indigo-400/20">
              Install Archive
            </button>
          </div>`;
      }
      
      const advBadge = pack.hasAdvancedScripts 
        ? `<span class="px-1.5 py-0.5 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded text-[7px] font-black uppercase tracking-widest">ADV</span>`
        : '';

      const installedBadge = isInstalled 
        ? `<div class="absolute top-4 right-4 px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md text-[7px] font-black uppercase tracking-widest shadow-sm z-20">Installed</div>`
        : '';

      return `
        <div class="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 flex flex-col hover:border-slate-700 transition-all relative group overflow-hidden">
          ${installedBadge}
          
          <div class="flex gap-4 mb-4 relative">
            <div class="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-2xl shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-300">
              ${pack.icon || '📦'}
            </div>
            <div class="flex-grow min-w-0 pr-16">
              <h3 class="text-xs font-black text-white truncate uppercase tracking-wider mb-1">${pack.name}</h3>
              <p class="text-[9px] text-slate-500 truncate font-bold uppercase tracking-widest">by <span class="text-slate-400">${author}</span></p>
            </div>
          </div>
          
          <div class="flex flex-wrap gap-1.5 mb-4">
            <span class="px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-widest ${tColor} border">${pack.type}</span>
            ${advBadge}
            <span class="px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-widest bg-slate-800 text-slate-500 border border-slate-700/50">v${version}</span>
          </div>
          
          <p class="text-[10px] leading-relaxed text-slate-400 line-clamp-3 italic opacity-60 mb-5 flex-grow font-medium">${desc}</p>
          
          ${actionBtns}
        </div>
      `;
    },

    async installPack(packUrl) {
      if (!packUrl) return;
      try {
        const resp = await fetch(packUrl);
        if (!resp.ok) throw new Error("Failed to fetch pack json");
        const packJson = await resp.json();
        
        if (packJson.hasAdvancedScripts) {
          const proceed = confirm("⚠️ ADVANCED PACK WARNING ⚠️\n\nThis pack contains custom scripting. Install only if you trust the source.");
          if (!proceed) return;
        }
        
        const res = await PackEngine.installPack(packJson);
        if (res.success) {
          if(window.addLog) addLog(`Grimoire: Installed "${packJson.name}"`);
          await this.renderGrid();
        } else {
          alert("Installation failed:\n" + res.errors.join('\n'));
        }
      } catch (e) {
        alert("Network error during installation.\n" + e.message);
      }
    },

    async uninstallPack(packId) {
      if (confirm("Remove this pack?")) {
        if (await PackEngine.removePack(packId)) {
          if(window.addLog) addLog("Grimoire: Pack uninstalled.");
          await this.renderGrid();
        }
      }
    },

    async duplicatePack(packId) {
      const ok = await window.PackStorage.duplicate(packId);
      if (ok) {
        if(window.addLog) addLog("Grimoire: Pack duplicated.");
        await this.renderGrid();
      } else {
        alert("Duplication failed.");
      }
    },

    toggleSearch() {
      const row = document.getElementById("market-search-row");
      const input = document.getElementById("market-search-input");
      if (row) {
        row.classList.toggle("hide");
        if (!row.classList.contains("hide") && input) {
          input.focus();
        }
      }
    },

    async importPack(event) {
      const file = event.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const json = JSON.parse(e.target.result);
          const res = await window.PackEngine.installPack(json);
          if (res.success) {
            if(window.addLog) addLog(`Grimoire: Imported "${json.name}"`);
            await this.renderGrid();
          } else {
            alert("Import failed:\n" + res.errors.join('\n'));
          }
        } catch (err) {
          alert("Invalid JSON file.");
        }
      };
      reader.readAsText(file);
      // Reset input so the same file can be imported again if needed
      event.target.value = '';
    }

  };

  window.PackMarketplace = PackMarketplace;
})();
