/**
 * UI TEMPLATE: MODAL-FORGE
 * In-game creator for Content Packs.
 */

window.ViewTemplates = window.ViewTemplates || {};

window.ViewTemplates["modal-forge"] = `
    <!-- FORGE MODAL -->
    <div id="modal-forge" class="hide absolute inset-0 bg-slate-950/95 z-[120] flex items-center justify-center p-2 md:p-4">
      <div class="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col h-full max-h-[95vh] overflow-hidden">
        
        <!-- Header -->
        <div class="p-4 border-b border-slate-800 flex justify-between items-center shrink-0 bg-slate-900/50">
          <div class="flex items-center gap-3">
            <span class="text-2xl">⚒️</span>
            <div>
              <h2 class="text-xl font-black tracking-widest text-white uppercase font-serif leading-none">The Forge</h2>
              <p class="text-slate-400 text-[10px] uppercase tracking-wider mt-1">Content Pack Creator</p>
            </div>
          </div>
          <div class="flex gap-2">
            <button onclick="PackForge.installAndPlay()" class="px-3 py-1.5 md:px-4 md:py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] md:text-xs uppercase tracking-widest rounded-lg transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              ▶️ <span class="hidden sm:inline">Play Pack</span>
            </button>
            <button onclick="PackForge.exportPack()" class="px-3 py-1.5 md:px-4 md:py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[10px] md:text-xs uppercase tracking-widest rounded-lg transition-colors shadow-lg shadow-indigo-900/50">
              <span class="hidden sm:inline">💾 Export Pack</span>
              <span class="sm:hidden">💾</span>
            </button>
            <button onclick="PackForge.close()" class="w-10 h-10 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700">
              ✕
            </button>
          </div>
        </div>

        <!-- Mode Toggle -->
        <div class="flex border-b border-slate-800 shrink-0 bg-slate-950/50 p-2 gap-2">
          <button id="forge-tab-simple" onclick="PackForge.setMode('simple')" class="flex-1 py-2 px-4 rounded-lg font-bold text-xs uppercase tracking-wider transition-all bg-rose-600 text-white shadow-inner">
            Wizard Mode
          </button>
          <button id="forge-tab-advanced" onclick="PackForge.setMode('advanced')" class="flex-1 py-2 px-4 rounded-lg font-bold text-xs uppercase tracking-wider transition-all bg-slate-800 text-slate-400 hover:text-white">
            Raw JSON (Advanced)
          </button>
        </div>
        
        <!-- Main Content Area -->
        <div class="flex-grow flex flex-col md:flex-row overflow-hidden">
          
          <!-- SIMPLE MODE WRAPPER -->
          <div id="forge-simple-view" class="flex-grow flex flex-col md:flex-row w-full h-full">
            
            <div class="w-full md:w-48 border-b md:border-r md:border-b-0 border-slate-800 bg-slate-900/30 flex flex-row md:flex-col shrink-0 overflow-x-auto md:overflow-y-auto p-2 gap-1 custom-scrollbar whitespace-nowrap md:whitespace-normal">
              <button onclick="PackForge.setSection('meta')" id="forge-nav-meta" class="w-auto md:w-full text-left px-3 py-2.5 rounded-md text-xs font-bold text-white bg-slate-800 transition-colors uppercase tracking-wide shrink-0">Pack Info</button>
              <button onclick="PackForge.setSection('enemies')" id="forge-nav-enemies" class="w-auto md:w-full text-left px-3 py-2.5 rounded-md text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors uppercase tracking-wide shrink-0">Enemies</button>
              <button onclick="PackForge.setSection('classes')" id="forge-nav-classes" class="w-auto md:w-full text-left px-3 py-2.5 rounded-md text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors uppercase tracking-wide shrink-0">Classes</button>
              <button onclick="PackForge.setSection('weapons')" id="forge-nav-weapons" class="w-auto md:w-full text-left px-3 py-2.5 rounded-md text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors uppercase tracking-wide shrink-0">Weapons</button>
              <button onclick="PackForge.setSection('hazards')" id="forge-nav-hazards" class="w-auto md:w-full text-left px-3 py-2.5 rounded-md text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors uppercase tracking-wide shrink-0">Hazards</button>
              <button onclick="PackForge.setSection('artifacts')" id="forge-nav-artifacts" class="w-auto md:w-full text-left px-3 py-2.5 rounded-md text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors uppercase tracking-wide shrink-0">Artifacts</button>
              <button onclick="PackForge.setSection('skin')" id="forge-nav-skin" class="w-auto md:w-full text-left px-3 py-2.5 rounded-md text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors uppercase tracking-wide shrink-0">Skin</button>
            </div>

            <!-- Form Area -->
            <div class="flex-grow p-4 overflow-y-auto custom-scrollbar relative" id="forge-form-area">
              <!-- Meta Section -->
              <div id="forge-section-meta" class="space-y-4 max-w-2xl">
                <h3 class="text-rose-500 font-black uppercase tracking-widest text-sm border-b border-slate-800 pb-2 mb-4">Pack Metadata</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Pack ID *</label>
                    <input type="text" id="forge-meta-id" placeholder="my-awesome-pack" class="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-xs font-mono focus:border-rose-500 outline-none" oninput="PackForge.updateMeta()">
                  </div>
                  <div>
                    <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Display Name *</label>
                    <input type="text" id="forge-meta-name" placeholder="Awesome Expansion" class="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-xs focus:border-rose-500 outline-none" oninput="PackForge.updateMeta()">
                  </div>
                  <div>
                    <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Author *</label>
                    <input type="text" id="forge-meta-author" placeholder="Your Name" class="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-xs focus:border-rose-500 outline-none" oninput="PackForge.updateMeta()">
                  </div>
                  <div>
                    <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Version *</label>
                    <input type="text" id="forge-meta-version" value="1.0.0" class="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-xs font-mono focus:border-rose-500 outline-none" oninput="PackForge.updateMeta()">
                  </div>
                  <div>
                    <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Pack Type *</label>
                    <select id="forge-meta-type" class="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-xs focus:border-rose-500 outline-none" onchange="PackForge.updateMeta()">
                      <option value="mega">Mega Pack (All Content)</option>
                      <option value="dungeon">Dungeon Pack (Enemies)</option>
                      <option value="class">Class Pack (Classes)</option>
                      <option value="skin">Skin Pack (Visuals)</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Icon Emoji *</label>
                    <input type="text" id="forge-meta-icon" placeholder="📦" maxlength="2" class="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-xs focus:border-rose-500 outline-none text-center" oninput="PackForge.updateMeta()">
                  </div>
                  <div class="md:col-span-2">
                    <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Description *</label>
                    <textarea id="forge-meta-desc" rows="2" placeholder="Describe your pack..." class="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-xs focus:border-rose-500 outline-none" oninput="PackForge.updateMeta()"></textarea>
                  </div>
                </div>
              </div>

              <!-- Enemies Section -->
              <div id="forge-section-enemies" class="hide space-y-4">
                <div class="flex justify-between items-center border-b border-slate-800 pb-2 mb-4">
                  <h3 class="text-rose-500 font-black uppercase tracking-widest text-sm">Enemies</h3>
                  <button onclick="PackForge.addEnemy()" class="px-3 py-1.5 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/40 border border-emerald-500/30 rounded text-[10px] font-bold uppercase tracking-wider transition-colors">+ Add Enemy</button>
                </div>
                <div id="forge-enemies-list" class="space-y-3">
                  <!-- Dynamic enemies injected here -->
                </div>
              </div>

              <!-- Classes Section -->
              <div id="forge-section-classes" class="hide space-y-4">
                <div class="flex justify-between items-center border-b border-slate-800 pb-2 mb-4">
                  <h3 class="text-rose-500 font-black uppercase tracking-widest text-sm">Classes</h3>
                  <button onclick="PackForge.addClass()" class="px-3 py-1.5 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/40 border border-emerald-500/30 rounded text-[10px] font-bold uppercase tracking-wider transition-colors">+ Add Class</button>
                </div>
                <div id="forge-classes-list" class="space-y-3">
                  <!-- Dynamic classes injected here -->
                </div>
              </div>
              
              <!-- Weapons Section -->
              <div id="forge-section-weapons" class="hide space-y-4">
                <div class="flex justify-between items-center border-b border-slate-800 pb-2 mb-4">
                  <h3 class="text-rose-500 font-black uppercase tracking-widest text-sm">Weapon Overrides</h3>
                  <button onclick="PackForge.addWeapon()" class="px-3 py-1.5 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/40 border border-emerald-500/30 rounded text-[10px] font-bold uppercase tracking-wider transition-colors">+ Override Weapon</button>
                </div>
                <div id="forge-weapons-list" class="space-y-3">
                  <!-- Dynamic weapons injected here -->
                </div>
              </div>

              <!-- Hazards Section -->
              <div id="forge-section-hazards" class="hide space-y-4">
                <div class="flex justify-between items-center border-b border-slate-800 pb-2 mb-4">
                  <h3 class="text-rose-500 font-black uppercase tracking-widest text-sm">Custom Hazards</h3>
                  <button onclick="PackForge.addHazard()" class="px-3 py-1.5 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/40 border border-emerald-500/30 rounded text-[10px] font-bold uppercase tracking-wider transition-colors">+ Add Hazard</button>
                </div>
                <div id="forge-hazards-list" class="space-y-3">
                  <!-- Dynamic hazards injected here -->
                </div>
              </div>

              <!-- Artifacts Section -->
              <div id="forge-section-artifacts" class="hide space-y-4">
                <div class="flex justify-between items-center border-b border-slate-800 pb-2 mb-4">
                  <h3 class="text-rose-500 font-black uppercase tracking-widest text-sm">Artifacts</h3>
                  <button onclick="PackForge.addArtifact()" class="px-3 py-1.5 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/40 border border-emerald-500/30 rounded text-[10px] font-bold uppercase tracking-wider transition-colors">+ Add Artifact</button>
                </div>
                <div id="forge-artifacts-list" class="space-y-3">
                  <!-- Dynamic artifacts injected here -->
                </div>
              </div>

              <!-- Skin Section -->
              <div id="forge-section-skin" class="hide space-y-4 max-w-2xl">
                <h3 class="text-rose-500 font-black uppercase tracking-widest text-sm border-b border-slate-800 pb-2 mb-4">Visual Skin</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Theme Name</label>
                    <input type="text" id="forge-skin-theme" placeholder="e.g. Gothic Shadowfell" class="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-xs focus:border-rose-500 outline-none" oninput="PackForge.updateSkin()">
                  </div>
                  <div>
                    <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Logo Override Text</label>
                    <input type="text" id="forge-skin-logo" placeholder="e.g. 🌑 DARK 2048" class="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-xs focus:border-rose-500 outline-none" oninput="PackForge.updateSkin()">
                  </div>
                  <div>
                    <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Font Family</label>
                    <input type="text" id="forge-skin-fontFamily" placeholder="e.g. Cinzel Decorative" class="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-xs focus:border-rose-500 outline-none" oninput="PackForge.updateSkin()">
                  </div>
                  <div>
                    <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Font URL (Google Fonts)</label>
                    <input type="text" id="forge-skin-fontUrl" placeholder="https://fonts.googleapis.com/css2..." class="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-xs focus:border-rose-500 outline-none" oninput="PackForge.updateSkin()">
                  </div>
                  <div class="md:col-span-2 border-t border-slate-800 pt-4 mt-2">
                    <h4 class="text-indigo-400 font-bold uppercase tracking-widest text-[10px] mb-3">CSS Variables</h4>
                    <div class="grid grid-cols-2 gap-2">
                      <div>
                        <label class="block text-[9px] font-bold text-slate-500 uppercase">--pack-primary</label>
                        <input type="text" id="forge-skin-primary" placeholder="#8b5cf6" class="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[10px] text-white" oninput="PackForge.updateSkin()">
                      </div>
                      <div>
                        <label class="block text-[9px] font-bold text-slate-500 uppercase">--pack-accent</label>
                        <input type="text" id="forge-skin-accent" placeholder="#4c1d95" class="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[10px] text-white" oninput="PackForge.updateSkin()">
                      </div>
                      <div>
                        <label class="block text-[9px] font-bold text-slate-500 uppercase">--pack-bg</label>
                        <input type="text" id="forge-skin-bg" placeholder="#0d0015" class="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[10px] text-white" oninput="PackForge.updateSkin()">
                      </div>
                      <div>
                        <label class="block text-[9px] font-bold text-slate-500 uppercase">--pack-tile-radius</label>
                        <input type="text" id="forge-skin-radius" placeholder="4px" class="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[10px] text-white" oninput="PackForge.updateSkin()">
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
          
          <!-- ADVANCED MODE WRAPPER -->
          <div id="forge-advanced-view" class="hide flex-grow flex flex-col w-full h-full bg-slate-950 relative">
            <textarea id="forge-json-editor" class="w-full h-full bg-slate-950 text-emerald-400 font-mono text-[10px] md:text-xs p-4 outline-none resize-none custom-scrollbar" spellcheck="false" oninput="PackForge.onJsonInput()"></textarea>
            
            <div id="forge-json-error" class="absolute bottom-0 left-0 right-0 bg-rose-900/90 text-white text-[10px] p-2 border-t border-rose-500 hide backdrop-blur-sm font-mono overflow-x-auto whitespace-pre">
              Error message here
            </div>
          </div>
        </div>
      </div>
    </div>
`;
