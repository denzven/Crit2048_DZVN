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

function renderTavern() {
  el.tavernArtifacts.innerHTML = state.shopPool
    .map((art, index) => {
      const currentLvl = getArtifactLevel(art.id);
      const nextLvl = currentLvl + 1;
      const cost = art.basePrice * nextLvl;
      const canAfford = state.gold >= cost;
      let btnCls =
        `px-4 py-2 rounded-xl font-bold text-xs transition-colors uppercase tracking-widest ` +
        (canAfford
          ? "bg-amber-600 hover:bg-amber-500 text-white shadow-lg"
          : "bg-slate-800 text-slate-500");
      const rC = getRarityColor(art.rarity);
      const delay = 0.1 * index;
      return `<div class="tavern-item bg-slate-900 border border-slate-700 rounded-2xl p-4 flex gap-3 items-center shadow-lg" style="animation-delay: ${delay}s"><div class="text-3xl bg-slate-950 p-3 rounded-xl shrink-0 border ${rC.split(" ")[1]}">${art.icon}</div>
      <div class="flex-grow flex flex-col justify-between h-full"><div><div class="flex justify-between items-start"><h3 class="font-black text-sm text-white uppercase tracking-wider">${art.name}</h3>
      <span class="text-[9px] ${rC.split(" ")[0]} uppercase font-bold border px-1 rounded ${rC.split(" ")[1]}">${art.rarity}</span></div><p class="text-[10px] text-slate-400 mb-2 mt-1 leading-tight h-6 overflow-hidden">${art.desc(nextLvl)}</p></div>
      <div class="flex justify-between items-center mt-1"><span class="font-mono text-amber-400 text-xs bg-slate-950 px-2 py-1 rounded-md">💰 ${cost}</span>
      <button id="buy-${art.id}" class="${btnCls}" ${!canAfford ? "disabled" : `onclick="buyArtifact('${art.id}')"`}>${currentLvl > 0 ? "Upgrade" : "Buy"}</button></div></div></div>`;
    })
    .join("");
  if (state.playerClass && state.playerClass.ability)
    el.upgradeCost.innerText = 100 * state.playerClass.ability.count;
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
    if (id === "GIANT_POTION") state.multiplier = 1.0 + 0.3 * (currentLvl + 1);
    renderTavern();
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
