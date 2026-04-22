// --- DOM ELEMENT REFERENCES ---
const el = {
  mainContainer: document.getElementById("main-container"),
  modalBackdrop: document.getElementById("modal-backdrop"),
  headerAnte: document.getElementById("header-ante"),
  headerStats: document.getElementById("header-stats"),
  statGold: document.getElementById("stat-gold"),
  statMult: document.getElementById("stat-mult"),
  screenStart: document.getElementById("screen-start"),
  screenClass: document.getElementById("screen-class"),
  screenPlaying: document.getElementById("screen-playing"),
  screenTavern: document.getElementById("screen-tavern"),
  screenEnd: document.getElementById("screen-end"),
  modalDice: document.getElementById("modal-dice"),
  classContainer: document.getElementById("class-container"),
  inputSeed: document.getElementById("input-seed"),
  hudHpBar: document.getElementById("hud-hp-bar"),
  hudIcon: document.getElementById("hud-icon"),
  hudName: document.getElementById("hud-name"),
  hudHp: document.getElementById("hud-hp"),
  hudSlides: document.getElementById("hud-slides"),
  hudPower: document.getElementById("hud-power"),
  tilesLayer: document.getElementById("tiles-layer"),
  gridContainer: document.getElementById("grid-container"),
  sidebarArtifacts: document.getElementById("sidebar-artifacts"),
  sidebarClassIcon: document.getElementById("sidebar-class-icon"),
  sidebarClassName: document.getElementById("sidebar-class-name"),
  sidebarClassUses: document.getElementById("sidebar-class-uses"),
  sidebarSpellInfo: document.getElementById("sidebar-spell-info"),
  btnAbility: document.getElementById("btn-ability"),
  btnAbilityMobile: document.getElementById("btn-ability-mobile"),
  mobileClassIcon: document.getElementById("mobile-class-icon"),
  mobileSpellUses: document.getElementById("mobile-spell-uses"),
  combatLogDesktop: document.getElementById("combat-log-desktop"),
  combatLogMobile: document.getElementById("combat-log-mobile"),
  diceAnteLevel: document.getElementById("dice-mod-val"),
  diceActionBtn: document.getElementById("dice-action-btn"),
  dicePostRoll: document.getElementById("dice-post-roll"),
  diceResultMsg: document.getElementById("dice-result-msg"),
  d20Panel: document.getElementById("d20-panel"),
  tavernArtifacts: document.getElementById("tavern-artifacts"),
  btnDescend: document.getElementById("btn-descend"),
  endTitle: document.getElementById("end-title"),
  endDesc: document.getElementById("end-desc"),
  endStatClass: document.getElementById("end-stat-class"),
  endStatAnte: document.getElementById("end-stat-ante"),
  endStatDmg: document.getElementById("end-stat-dmg"),
  endStatMerges: document.getElementById("end-stat-merges"),
  endStatSeed: document.getElementById("end-stat-seed"),
  modalSettings: document.getElementById("modal-settings"),
  inputSettingTurns: document.getElementById("input-setting-turns"),
  inputSettingGold: document.getElementById("input-setting-gold"),
  inputSettingTheme: document.getElementById("input-setting-theme"),
  inputSettingSFX: document.getElementById("input-setting-sfx"),
  inputSettingShake: document.getElementById("input-setting-shake"),
  modalAttack: document.getElementById("modal-attack"),
  attackTitle: document.getElementById("attack-title"),
  attackDiceContainer: document.getElementById("attack-dice-container"),
  attackResult: document.getElementById("attack-result"),
  attackTotal: document.getElementById("attack-total"),
  btnAiOracle: document.getElementById("btn-ai-oracle"),
  aiLoading: document.getElementById("ai-loading"),
  upgradeCost: document.getElementById("upgrade-cost"),
  modalHelp: document.getElementById("modal-help"),
  btnHome: document.getElementById("btn-home"),
  modalConfirm: document.getElementById("modal-confirm"),
};

// --- UI HELPERS ---
function addLog(msg) {
  state.logs.push(msg);
  if (state.logs.length > 6) state.logs.shift();
  const html = state.logs
    .map(
      (log) =>
        `<div class="mb-1">> <span class="text-slate-200">${log}</span></div>`,
    )
    .join("");
  el.combatLogDesktop.innerHTML = html;
  el.combatLogDesktop.scrollTop = el.combatLogDesktop.scrollHeight;
  el.combatLogMobile.innerHTML = html;
  el.combatLogMobile.scrollTop = el.combatLogMobile.scrollHeight;
}

function getArtifactLevel(id) {
  const f = state.artifacts.find((a) => a.id === id);
  return f ? f.level : 0;
}
function hasArtifact(id) {
  return state.artifacts.some((a) => a.id === id);
}

function renderHUD() {
  el.hudHpBar.style.width = `${state.monsterMaxHp > 0 ? Math.max(0, (state.monsterHp / state.monsterMaxHp) * 100) : 0}%`;
  el.hudHp.innerText = `${Math.floor(state.monsterHp)} / ${state.monsterMaxHp}`;
  const enc = ENCOUNTERS[state.encounterIdx];
  el.hudIcon.innerText = enc.icon;
  el.hudName.innerText = enc.name;
  el.hudPower.innerText = enc.power;
  el.hudSlides.innerText = state.slidesLeft;
  el.hudSlides.className = `text-3xl md:text-4xl font-black font-mono drop-shadow-md ${state.slidesLeft < 5 ? "text-red-500 animate-pulse" : "text-white"}`;
  el.statGold.innerText = state.gold;
  el.statMult.innerText = state.multiplier.toFixed(1);
}

function renderSidebar() {
  el.sidebarClassIcon.innerText = state.playerClass.icon;
  el.sidebarClassName.innerText = state.playerClass.id + (state.hunterMarkLeft > 0 ? ` (Mark: ${state.hunterMarkLeft})` : "");
  el.mobileClassIcon.innerText = state.playerClass.icon;

  if (state.playerClass.ability) {
    el.btnAbility.classList.remove("hide");
    el.btnAbilityMobile.classList.remove("hide");
    el.sidebarSpellInfo.classList.remove("hide");
    el.sidebarClassUses.classList.remove("hide");
    el.sidebarSpellInfo.innerText = `Spell: ${state.playerClass.ability.count}d${state.playerClass.ability.sides}`;
    el.sidebarClassUses.innerText = `Uses: ${state.usesLeft} / ${state.playerClass.ability.maxUses}`;
    el.mobileSpellUses.innerText = `${state.usesLeft}/${state.playerClass.ability.maxUses}`;
    const dis =
      "relative z-10 w-full py-3 rounded-xl text-sm font-black bg-slate-700 text-slate-500 cursor-not-allowed uppercase tracking-widest";
    const act =
      "relative z-10 w-full py-3 rounded-xl text-sm font-black transition-all bg-blue-600 hover:bg-blue-500 text-white shadow-lg uppercase tracking-widest";
    if (state.usesLeft <= 0) {
      el.btnAbility.className = dis;
      el.btnAbilityMobile.disabled = true;
      el.btnAbilityMobile.style.opacity = 0.5;
    } else {
      el.btnAbility.className = act;
      el.btnAbilityMobile.disabled = false;
      el.btnAbilityMobile.style.opacity = 1;
    }
  } else {
    el.btnAbility.classList.add("hide");
    el.btnAbilityMobile.classList.add("hide");
    el.sidebarClassUses.classList.add("hide");
    el.sidebarSpellInfo.classList.add("hide");
  }

  el.sidebarArtifacts.innerHTML = state.artifacts.length
    ? ""
    : '<p class="text-[10px] text-slate-600">None equipped</p>';
  state.artifacts.forEach(
    (a) =>
      (el.sidebarArtifacts.innerHTML += `<div class="bg-slate-800 p-2 rounded-lg border border-slate-700 flex items-center gap-2 mb-1" title="${a.desc(a.level)}"><span>${a.icon}</span> <div class="flex flex-col"><span class="text-[10px] font-bold truncate leading-tight">${a.name}</span><span class="text-[9px] text-amber-400 font-mono">Lvl ${a.level}</span></div></div>`),
  );
}
