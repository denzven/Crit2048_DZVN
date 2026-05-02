// --- TAVERN (SHOP) LOGIC ---
function generateShop() {
  const available = MASTER_ARTIFACTS.filter(
    (a) => a.classReq === null || a.classReq === state.playerClass.id,
  );
  state.shopPool = [];
  const poolSize = 4 + getArtifactLevel("BAG_HOLDING");
  while (state.shopPool.length < poolSize && available.length > 0) {
    let idx = prngInt(0, available.length - 1);
    state.shopPool.push(available[idx]);
    available.splice(idx, 1);
  }
}

function renderTavern(skipAnimation = false) {
  const respinCost = getRespinCost();
  const canAffordRespin = state.gold >= respinCost;
  
  const respinBtn = document.getElementById("btn-respin");
  if (respinBtn) {
    respinBtn.innerHTML = `Respin (💰${respinCost})`;
    respinBtn.disabled = !canAffordRespin;
    respinBtn.className = `shrink-0 px-3 py-1.5 rounded-lg font-black text-[10px] transition-all uppercase tracking-widest border ` + 
      (canAffordRespin ? "bg-slate-800 hover:bg-slate-700 text-amber-400 border-amber-600/30" : "bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed");
  }

  // Sort by rarity: Common < Rare < Epic < Legendary < Artifact
  const rarityOrder = { "Common": 1, "Rare": 2, "Epic": 3, "Legendary": 4, "Artifact": 5 };
  const sortedPool = [...state.shopPool].sort((a, b) => rarityOrder[a.rarity] - rarityOrder[b.rarity]);

  el.tavernArtifacts.innerHTML = sortedPool
    .map((art, index) => {
      const currentLvl = getArtifactLevel(art.id);
      const nextLvl = currentLvl + 1;
      const cost = art.basePrice * nextLvl;
      const canAfford = state.gold >= cost;
      
      let btnCls = `w-full px-4 py-3 rounded-2xl font-black text-[10px] transition-all uppercase tracking-widest border ` +
        (canAfford
          ? "bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-950/20 active:scale-95 border-amber-400/20"
          : "bg-slate-900/50 text-slate-600 cursor-not-allowed border-slate-800 opacity-60 grayscale-[0.5]");
      
      const rC = getRarityColor(art.rarity);
      const glowClass = `glow-${art.rarity.toLowerCase()}`;
      const delay = 0.08 * index;
      const animClass = skipAnimation ? "" : "tavern-item";
      
      // Premium Flair: Shimmer for Legendary/Artifact
      const hasShimmer = art.rarity === "Legendary" || art.rarity === "Artifact";
      const shimmerHtml = hasShimmer ? '<div class="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 -translate-x-full animate-[shimmer_2s_infinite]"></div>' : '';

      return `
      <div class="${animClass} ${glowClass} h-full bg-slate-900/40 border border-slate-800/80 rounded-[2rem] p-6 flex flex-col gap-5 relative overflow-hidden group backdrop-blur-md shadow-2xl transition-all duration-300 hover:border-slate-700/50" style="animation-delay: ${delay}s">
        ${shimmerHtml}
        
        <div class="flex justify-between items-center z-10">
          <div class="text-4xl bg-slate-950/80 p-5 rounded-3xl border-2 ${rC.split(" ")[1]} shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 ease-out">${art.icon}</div>
          <div class="flex flex-col items-end gap-1.5">
             <span class="text-[11px] ${rC.split(" ")[0]} uppercase font-black border-b-2 ${rC.split(" ")[1]} pb-0.5 tracking-widest">${art.rarity}</span>
             <span class="text-[10px] text-slate-400 font-mono font-bold tracking-tight">Level ${currentLvl}</span>
          </div>
        </div>

        <div class="flex-grow flex flex-col z-10">
          <h3 class="font-black text-sm text-white uppercase tracking-tight mb-2 group-hover:text-amber-400 transition-colors">${art.name}</h3>
          <p class="text-[11px] text-slate-400/80 leading-relaxed mb-6 flex-grow font-medium">${art.desc(nextLvl)}</p>
          
          <div class="flex flex-col gap-4 mt-auto">
            <div class="flex justify-between items-center bg-slate-950/60 rounded-2xl px-4 py-3 border border-slate-800/50 shadow-inner">
              <span class="text-[10px] text-slate-500 uppercase font-black tracking-widest">Investment</span>
              <span class="font-mono ${canAfford ? "text-amber-400" : "text-rose-500/70"} text-sm font-black flex items-center gap-1.5">
                <span class="text-xs">💰</span> ${cost}
              </span>
            </div>
            <button id="buy-${art.id}" class="${btnCls}" ${!canAfford ? "disabled" : `onclick="buyArtifact('${art.id}')"`}>
              ${currentLvl > 0 ? "Enhance Power" : "Acquire"}
            </button>
          </div>
        </div>
      </div>`;
    })
    .join("");
  
  if (state.playerClass && state.playerClass.ability) {
    const upgradeCost = 100 * state.playerClass.ability.count;
    el.upgradeCost.innerText = upgradeCost;
    
    // Grey out Rest/Upgrade
    const canRest = state.gold >= 30;
    const canUpgrade = state.gold >= upgradeCost;
    const canOracle = state.gold >= 50;

    if (el.btnRest) {
      el.btnRest.disabled = !canRest;
      el.btnRest.className = `py-4 font-bold rounded-2xl transition-all flex flex-col items-center justify-center gap-1 border transition-all duration-300 ` +
        (canRest ? "bg-slate-950/40 hover:bg-emerald-950/20 text-emerald-400 border-slate-800 hover:border-emerald-500/30 group active:scale-95" : "bg-slate-900/50 text-slate-600 border-slate-800 opacity-60 grayscale-[0.5] cursor-not-allowed");
    }

    if (el.btnUpgrade) {
      el.btnUpgrade.disabled = !canUpgrade;
      el.btnUpgrade.className = `py-4 font-bold rounded-2xl transition-all flex flex-col items-center justify-center gap-1 border transition-all duration-300 ` +
        (canUpgrade ? "bg-slate-950/40 hover:bg-blue-950/20 text-blue-400 border-slate-800 hover:border-blue-500/30 group active:scale-95" : "bg-slate-900/50 text-slate-600 border-slate-800 opacity-60 grayscale-[0.5] cursor-not-allowed");
    }

    if (el.btnAiOracle) {
      el.btnAiOracle.disabled = !canOracle;
      el.btnAiOracle.className = `w-full py-4 font-black rounded-2xl transition-all uppercase tracking-widest text-xs border shadow-lg transition-all duration-300 ` +
        (canOracle ? "bg-indigo-600/90 hover:bg-indigo-500 text-white border-indigo-400/20 shadow-indigo-950/40 active:scale-95" : "bg-slate-900/50 text-slate-600 border-slate-800 opacity-60 grayscale-[0.5] cursor-not-allowed shadow-none");
    }
  }

  el.btnDescend.innerText = ENCOUNTERS[state.encounterIdx + 1]
    ? `Next Ante`
    : `Final Boss`;
  renderHUD();
}

function buyArtifact(id) {
  const artDef = MASTER_ARTIFACTS.find((a) => a.id === id);
  const currentLvl = getArtifactLevel(id);
  const cost = artDef.basePrice * (currentLvl + 1);
  if (state.gold >= cost) {
    SFX.coin();
    state.gold -= cost;
    state.runStats.totalCoinsSpent += cost;
    let existing = state.artifacts.find((a) => a.id === id);
    if (existing) existing.level++;
    else
      state.artifacts.push({
        id: artDef.id,
        name: artDef.name,
        icon: artDef.icon,
        rarity: artDef.rarity,
        level: 1,
        basePrice: artDef.basePrice,
        desc: artDef.desc,
      });
    if (window.PackEngine) window.PackEngine.onPurchase(state, artDef.id);
    renderTavern(true);
  }
}

function getRespinCost() {
  const costs = [5, 10, 15, 30, 45, 60, 75, 100];
  return costs[Math.min(state.tavernRespinCount, costs.length - 1)];
}

function respinTavern() {
  const cost = getRespinCost();
  if (state.gold >= cost) {
    SFX.coin();
    state.gold -= cost;
    state.runStats.totalCoinsSpent += cost;
    state.tavernRespinCount++;
    generateShop();
    renderTavern();
    if (window.Plugins) window.Plugins.vibrate('impactLight');
  }
}

function nextEncounter() {
  const overlay = document.createElement("div");
  overlay.className = "fixed inset-0 bg-slate-950 z-[150] flex flex-col items-center justify-center transition-all duration-1000 p-8";
  overlay.innerHTML = `
    <h2 class="text-3xl font-black text-rose-500 font-serif mb-4 tracking-widest uppercase">Descending to Ante ${state.encounterIdx + 2}</h2>
    <div class="w-64 h-1 bg-slate-800 rounded-full overflow-hidden">
      <div class="descend-bar"></div>
    </div>
  `;
  document.body.appendChild(overlay);
  
  el.mainContainer.classList.add("fx-descend");
  
  setTimeout(() => {
    initEncounter(state.encounterIdx + 1, true);
    setTimeout(() => {
      overlay.style.opacity = "0";
      el.mainContainer.classList.remove("fx-descend");
      setTimeout(() => overlay.remove(), 1000);
    }, 500);
  }, 1000);
}

function initTavernScroll() {
  const scrollArea = document.getElementById("tavern-scroll-area");
  const header = document.getElementById("tavern-header");
  const title = document.getElementById("tavern-title");
  const subtitle = document.getElementById("tavern-subtitle");
  
  if (!scrollArea || !header || !title || !subtitle) return;
  
  // Reset on init
  scrollArea.scrollTop = 0;
  header.style.marginBottom = "";
  title.style.transform = "";
  subtitle.style.opacity = "";
  subtitle.style.transform = "";
}
