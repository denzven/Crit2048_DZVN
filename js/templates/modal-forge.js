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
        <div class="flex-grow flex flex-col md:flex-row overflow-hidden min-h-0">
          
          <!-- SIMPLE MODE WRAPPER -->
          <div id="forge-simple-view" class="flex-grow flex flex-col w-full h-full min-h-0 relative">
            
            <!-- Step Header -->
            <div class="px-4 py-3 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center shrink-0">
              <span id="forge-step-indicator" class="text-xs font-bold text-slate-300 uppercase tracking-widest">Step 1 of 7: Pack Info</span>
              <span class="text-[10px] text-slate-500 font-mono" id="forge-step-counter">1/7</span>
            </div>

            <!-- Form Area -->
            <div class="flex-grow p-4 md:p-6 overflow-y-auto custom-scrollbar relative" id="forge-form-area">
              <!-- Meta Section -->
              <div id="forge-section-meta" class="space-y-6 max-w-3xl mx-auto">
                <div class="flex items-center gap-3 mb-6">
                  <div class="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20 shadow-lg shadow-rose-900/20">
                    <span class="text-xl">📄</span>
                  </div>
                  <div>
                    <h3 class="text-white font-black uppercase tracking-widest text-sm leading-none">Pack Metadata</h3>
                    <p class="text-[9px] text-slate-500 uppercase tracking-widest mt-1 font-bold">Core identification & details</p>
                  </div>
                </div>

                <div class="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div class="space-y-1.5">
                      <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Pack Unique ID <span class="text-rose-500">*</span></label>
                      <input type="text" id="forge-meta-id" placeholder="e.g. dragon-expansion" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs font-mono focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none transition-all placeholder:text-slate-700" oninput="PackForge.onIdInput(this)">
                    </div>
                    <div class="space-y-1.5">
                      <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Display Name <span class="text-rose-500">*</span></label>
                      <input type="text" id="forge-meta-name" placeholder="e.g. The Dragon Expansion" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none transition-all placeholder:text-slate-700" oninput="PackForge.updateMeta()">
                    </div>
                    <div class="space-y-1.5">
                      <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Author Name <span class="text-rose-500">*</span></label>
                      <input type="text" id="forge-meta-author" placeholder="e.g. Unknown Creator" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none transition-all placeholder:text-slate-700" oninput="PackForge.updateMeta()">
                    </div>
                    <div class="space-y-1.5">
                      <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Version String <span class="text-rose-500">*</span></label>
                      <input type="text" id="forge-meta-version" placeholder="1.0.0" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs font-mono focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none transition-all placeholder:text-slate-700" oninput="PackForge.updateMeta()">
                    </div>
                    <div class="space-y-1.5">
                      <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Pack Category <span class="text-rose-500">*</span></label>
                      <select id="forge-meta-type" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs focus:border-rose-500 outline-none transition-all cursor-pointer" onchange="PackForge.updateMeta()">
                        <option value="mega">Mega Pack (Everything)</option>
                        <option value="dungeon">Dungeon (Enemies Only)</option>
                        <option value="class">Class (Heroes Only)</option>
                        <option value="skin">Skin (Visual Only)</option>
                      </select>
                    </div>
                    <div class="space-y-1.5">
                      <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Icon Emoji <span class="text-rose-500">*</span></label>
                      <input type="text" id="forge-meta-icon" placeholder="📦" maxlength="2" class="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none transition-all text-center" oninput="PackForge.updateMeta()">
                    </div>
                    <div class="md:col-span-2 space-y-1.5">
                      <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Description <span class="text-rose-500">*</span></label>
                      <textarea id="forge-meta-desc" rows="3" placeholder="Describe your expansion pack..." class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none transition-all placeholder:text-slate-700 resize-none" oninput="PackForge.updateMeta()"></textarea>
                    </div>
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
              <div id="forge-section-skin" class="hide space-y-6 max-w-3xl mx-auto">
                <div class="flex items-center gap-3 mb-6">
                  <div class="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-lg shadow-indigo-900/20">
                    <span class="text-xl">🎨</span>
                  </div>
                  <div>
                    <h3 class="text-white font-black uppercase tracking-widest text-sm leading-none">Visual Skin</h3>
                    <p class="text-[9px] text-slate-500 uppercase tracking-widest mt-1 font-bold">Theme & UI Customization</p>
                  </div>
                </div>

                <div class="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div class="space-y-1.5">
                      <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Theme Name</label>
                      <input type="text" id="forge-skin-theme" placeholder="e.g. Gothic Shadowfell" class="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs focus:border-rose-500 outline-none transition-all placeholder:text-slate-700" oninput="PackForge.updateSkin()">
                    </div>
                    <div class="space-y-1.5">
                      <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Logo Override</label>
                      <input type="text" id="forge-skin-logo" placeholder="e.g. 🌑 DARK 2048" class="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs focus:border-rose-500 outline-none transition-all placeholder:text-slate-700" oninput="PackForge.updateSkin()">
                    </div>
                    <div class="space-y-1.5">
                      <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Font Family</label>
                      <input type="text" id="forge-skin-fontFamily" placeholder="e.g. Cinzel Decorative" class="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs focus:border-rose-500 outline-none transition-all placeholder:text-slate-700" oninput="PackForge.updateSkin()">
                    </div>
                    <div class="space-y-1.5">
                      <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Google Font URL</label>
                      <input type="text" id="forge-skin-fontUrl" placeholder="https://fonts.googleapis.com/css2..." class="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white text-[10px] font-mono focus:border-rose-500 outline-none transition-all placeholder:text-slate-700" oninput="PackForge.updateSkin()">
                    </div>
                  </div>

                  <div class="pt-4 border-t border-slate-800/50">
                    <div class="flex items-center gap-2 mb-4">
                      <span class="w-1 h-3 bg-indigo-500 rounded-full"></span>
                      <h4 class="text-indigo-400 font-black uppercase tracking-widest text-[10px]">CSS Tokens</h4>
                    </div>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div class="space-y-1.5">
                        <label class="block text-[9px] font-bold text-slate-500 uppercase tracking-widest text-center">Primary</label>
                        <input type="text" id="forge-skin-primary" placeholder="#8b5cf6" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-2 text-[10px] text-white text-center focus:border-indigo-500 outline-none transition-all" oninput="PackForge.updateSkin()">
                      </div>
                      <div class="space-y-1.5">
                        <label class="block text-[9px] font-bold text-slate-500 uppercase tracking-widest text-center">Accent</label>
                        <input type="text" id="forge-skin-accent" placeholder="#4c1d95" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-2 text-[10px] text-white text-center focus:border-indigo-500 outline-none transition-all" oninput="PackForge.updateSkin()">
                      </div>
                      <div class="space-y-1.5">
                        <label class="block text-[9px] font-bold text-slate-500 uppercase tracking-widest text-center">Background</label>
                        <input type="text" id="forge-skin-bg" placeholder="#0d0015" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-2 text-[10px] text-white text-center focus:border-indigo-500 outline-none transition-all" oninput="PackForge.updateSkin()">
                      </div>
                      <div class="space-y-1.5">
                        <label class="block text-[9px] font-bold text-slate-500 uppercase tracking-widest text-center">Corner Radius</label>
                        <input type="text" id="forge-skin-radius" placeholder="4px" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-2 text-[10px] text-white text-center focus:border-indigo-500 outline-none transition-all" oninput="PackForge.updateSkin()">
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <!-- Wizard Footer -->
            <div class="p-3 border-t border-slate-800 bg-slate-950/90 shrink-0 flex justify-between items-center z-10">
              <button id="forge-btn-prev" onclick="PackForge.prevSection()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors hide">◀ Prev Step</button>
              <div class="flex-grow"></div>
              <button id="forge-btn-next" onclick="PackForge.nextSection()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-lg shadow-indigo-900/50">Next Step ▶</button>
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
