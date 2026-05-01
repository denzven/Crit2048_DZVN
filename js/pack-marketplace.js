/**
 * PACK MARKETPLACE (The Grimoire)
 * Fetches the community registry and handles pack installation.
 */

(function() {
  const REGISTRY_URL = "https://raw.githubusercontent.com/denzven/Crit2048-grimoire/main/registry.json";
  
  let _registryCache = null;
  let _isOffline = false;
  let _currentTab = "browse"; // 'browse' or 'installed'

  const PackMarketplace = {

    async open() {
      const modal = document.getElementById("modal-marketplace");
      const backdrop = document.getElementById("modal-backdrop");
      if (modal) modal.classList.remove("hide");
      if (backdrop) backdrop.classList.remove("hide");
      
      this.setTab("browse");
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
    },

    async setTab(tabId) {
      _currentTab = tabId;
      
      const tabB = document.getElementById("market-tab-browse");
      const tabI = document.getElementById("market-tab-installed");
      const viewB = document.getElementById("market-view-browse");
      const viewI = document.getElementById("market-view-installed");
      
      if (tabId === "browse") {
        tabB.className = "px-5 py-3 rounded-t-lg font-black text-[10px] uppercase tracking-widest transition-colors bg-slate-800 text-white border-t border-x border-slate-700";
        tabI.className = "px-5 py-3 rounded-t-lg font-black text-[10px] uppercase tracking-widest transition-colors text-slate-500 hover:text-white hover:bg-slate-800/50 border-t border-x border-transparent";
        viewB.classList.remove("hide");
        viewI.classList.add("hide");
      } else {
        tabI.className = "px-5 py-3 rounded-t-lg font-black text-[10px] uppercase tracking-widest transition-colors bg-slate-800 text-white border-t border-x border-slate-700";
        tabB.className = "px-5 py-3 rounded-t-lg font-black text-[10px] uppercase tracking-widest transition-colors text-slate-500 hover:text-white hover:bg-slate-800/50 border-t border-x border-transparent";
        viewI.classList.remove("hide");
        viewB.classList.add("hide");
      }
      await this.renderGrid();
    },

    
    async openLocalFolder() {
      if (window.__TAURI__ && window.__TAURI__.core) {
        try {
          const platform = await window.__TAURI__.core.invoke('plugin:os|platform');
          if (platform === 'android' || platform === 'ios') {
            alert('File explorer access is not available on mobile devices.');
            return;
          }
          const dir = await window.PackStorage.getPacksDir();
          if (dir) {
            await window.__TAURI__.core.invoke('plugin:opener|open_path', { path: dir });
          }
        } catch (e) {
          alert('Failed to open folder. Make sure you are on a desktop OS.');
        }
      } else {
        alert('Local folders are only available in the desktop app. Web versions use browser storage.');
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
            alert(`Successfully imported pack: ${json.name}`);
            if (_currentTab === 'installed') this.renderGrid();
          } else {
            alert(`Failed to install pack:\n${res.errors.join('\n')}`);
          }
        } catch (err) {
          alert("Invalid JSON file. Ensure it is a valid Crit2048 Pack format.");
        }
        event.target.value = ''; // Reset input
      };
      reader.readAsText(file);
    },

    async refresh() {
      _registryCache = null;
      await this.fetchRegistry();
    },

    async fetchRegistry() {
      const loader = document.getElementById("market-loading");
      const grid = document.getElementById("market-browse-grid");
      const badge = document.getElementById("market-status-badge");
      
      if (loader) loader.classList.remove("hide");
      if (grid) grid.classList.add("hide");
      
      try {
        const resp = await fetch(REGISTRY_URL, { cache: 'no-store' });
        if (!resp.ok) throw new Error("Network response was not ok");
        _registryCache = await resp.json();
        _isOffline = false;
        
        badge.innerText = "Online";
        badge.className = "px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest bg-emerald-900/50 text-emerald-400 border border-emerald-500/30";
      } catch (e) {
        console.warn("Grimoire: Failed to fetch registry, falling back to offline mode", e);
        _isOffline = true;
        _registryCache = { packs: [] };
        
        badge.innerText = "Offline";
        badge.className = "px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest bg-rose-900/50 text-rose-400 border border-rose-500/30";
        // Force switch to installed tab since we can't browse
        this.setTab('installed');
      }
      
      if (loader) loader.classList.add("hide");
      if (grid) grid.classList.remove("hide");
      await this.renderGrid();
    },

    async renderGrid() {
      if (_currentTab === "browse") await this.renderBrowseGrid();
      else await this.renderInstalledGrid();
    },

    _buildCardHtml(pack, isInstalled, localMeta = null) {
      const isAdvanced = pack.hasAdvancedScripts;
      const advBadge = isAdvanced 
        ? `<span class="px-2 py-0.5 bg-rose-900/80 text-rose-300 border border-rose-500/50 rounded text-[8px] font-bold uppercase tracking-widest" title="Contains Advanced Scripts">⚠️ Advanced</span>`
        : '';
        
      const typeColors = {
        mega: 'bg-purple-900/50 text-purple-300 border-purple-500/30',
        dungeon: 'bg-rose-900/50 text-rose-300 border-rose-500/30',
        class: 'bg-emerald-900/50 text-emerald-300 border-emerald-500/30',
        skin: 'bg-blue-900/50 text-blue-300 border-blue-500/30'
      };
      const tColor = typeColors[pack.type] || 'bg-slate-800 text-slate-300 border-slate-700';
      
      const author = pack.author || 'Unknown';
      const version = localMeta ? localMeta.version : pack.version;
      const desc = pack.description || 'No description provided.';
      
      let actionBtn = '';
      if (isInstalled) {
        actionBtn = `<button onclick="PackMarketplace.uninstallPack('${pack.id}')" class="w-full py-2 bg-rose-900/50 hover:bg-rose-600 text-rose-200 hover:text-white border border-rose-500/30 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors mt-2">Uninstall</button>`;
      } else {
        actionBtn = `<button onclick="PackMarketplace.installPack('${pack.packUrl}')" class="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500/50 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors mt-2 shadow-lg shadow-indigo-900/20">Install Pack</button>`;
      }
      
      return `
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col hover:border-slate-600 transition-colors relative overflow-hidden">
          ${isInstalled ? '<div class="absolute top-0 right-0 bg-emerald-600 text-white text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-bl-lg">Installed</div>' : ''}
          <div class="flex gap-3 mb-3">
            <div class="w-12 h-12 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-2xl shrink-0">${pack.icon || '📦'}</div>
            <div class="flex-grow overflow-hidden">
              <h3 class="text-sm font-bold text-white truncate">${pack.name}</h3>
              <p class="text-[10px] text-slate-400 truncate">by ${author} • v${version}</p>
              <div class="flex gap-1 mt-1">
                <span class="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest ${tColor} border">${pack.type}</span>
                ${advBadge}
              </div>
            </div>
          </div>
          <p class="text-xs text-slate-400 mb-4 flex-grow line-clamp-2">${desc}</p>
          ${actionBtn}
        </div>
      `;
    },

    async renderBrowseGrid() {
      const grid = document.getElementById("market-browse-grid");
      if (!grid) return;
      if (!_registryCache || !_registryCache.packs) {
        grid.innerHTML = '<p class="text-slate-500 col-span-full text-center py-10">No packs found in registry.</p>';
        return;
      }
      
      const installedPacks = await PackEngine.getInstalledPacks();
      let html = '';
      _registryCache.packs.forEach(pack => {
        if (pack.id === 'default') return; // Hide default reference pack
        const isInstalled = installedPacks.some(p => p.id === pack.id);
        html += this._buildCardHtml(pack, isInstalled);
      });
      
      grid.innerHTML = html || '<p class="text-slate-500 col-span-full text-center py-10">No community packs available yet.</p>';
    },

    async renderInstalledGrid() {
      const grid = document.getElementById("market-installed-grid");
      const empty = document.getElementById("market-installed-empty");
      if (!grid || !empty) return;
      
      const installed = await PackEngine.getInstalledPacks();
      
      if (installed.length === 0) {
        grid.classList.add("hide");
        empty.classList.remove("hide");
        return;
      }
      
      grid.classList.remove("hide");
      empty.classList.add("hide");
      
      let html = '';
      installed.forEach(localMeta => {
        // Try to find full meta from registry if online, else use local
        let packInfo = _registryCache?.packs?.find(p => p.id === localMeta.id);
        if (!packInfo) packInfo = localMeta; // fallback to index data
        
        html += this._buildCardHtml(packInfo, true, localMeta);
      });
      grid.innerHTML = html;
    },

    async installPack(packUrl) {
      if (!packUrl) return;
      
      // Attempt to load the raw pack.json
      try {
        const resp = await fetch(packUrl);
        if (!resp.ok) throw new Error("Failed to fetch pack json");
        const packJson = await resp.json();
        
        // Security Check
        if (packJson.hasAdvancedScripts) {
          const proceed = confirm(
            "⚠️ ADVANCED PACK WARNING ⚠️\\n\\n" +
            "This pack contains custom scripting that may significantly alter gameplay mechanics.\\n\\n" +
            "Are you sure you want to install it?"
          );
          if (!proceed) return;
        }
        
        const res = await PackEngine.installPack(packJson);
        if (res.success) {
          addLog(`Grimoire: Installed "${packJson.name}"`);
          await this.renderGrid();
        } else {
          alert("Installation failed:\\n" + res.errors.join('\\n'));
        }
      } catch (e) {
        alert("Network error during installation.\\n" + e.message);
      }
    },

    async uninstallPack(packId) {
      if (confirm("Remove this pack? It will be disabled immediately.")) {
        if (await PackEngine.removePack(packId)) {
          addLog("Grimoire: Pack uninstalled.");
          await this.renderGrid();
        }
      }
    }

  };

  window.PackMarketplace = PackMarketplace;
})();
