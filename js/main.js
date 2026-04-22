// --- STATE MANAGEMENT & GAME BOOTSTRAP ---
function startGameFlow() {
  try {
    SFX.init();
  } catch (e) {
    console.warn(e);
  }
  setSeed(el.inputSeed.value);
  Object.keys(CLASSES).forEach((k) => {
    if (CLASSES[k].ability) CLASSES[k].ability.count = 1;
  });
  changeState("CLASS_SELECT");
}

function changeState(newState) {
  state.gameState = newState;
  [
    el.screenStart,
    el.screenClass,
    el.screenPlaying,
    el.screenTavern,
    el.screenEnd,
  ].forEach((s) => s.classList.add("hide"));

  if (["START", "CLASS_SELECT"].includes(newState)) {
    el.headerStats.classList.add("hide");
    el.headerAnte.classList.add("hide");
    el.btnHome.classList.add("hide");
  } else {
    el.headerStats.classList.remove("hide");
    el.headerAnte.classList.remove("hide");
    el.btnHome.classList.remove("hide");
  }

  switch (newState) {
    case "START":
      el.screenStart.classList.remove("hide");
      break;

    case "CLASS_SELECT":
      el.classContainer.innerHTML = Object.entries(CLASSES)
        .map(
          ([key, cls]) => `
        <div onclick="selectClass('${key}')" class="bg-slate-900 border border-slate-700 hover:border-rose-500 p-4 rounded-2xl cursor-pointer transition-all flex flex-col items-center text-center shadow-lg">
          <span class="text-4xl mb-2">${cls.icon}</span><h3 class="text-lg font-black text-white uppercase tracking-wider">${cls.id}</h3><p class="text-slate-400 text-xs mt-1 leading-tight">${cls.desc}</p>
        </div>`,
        )
        .join("");
      el.screenClass.classList.remove("hide");
      break;

    case "PLAYING":
    case "DICE":
      el.screenPlaying.classList.remove("hide");
      if (newState === "DICE") {
        el.modalBackdrop.classList.remove("hide");
        el.modalDice.classList.remove("hide");
        document.getElementById("instruction-turns").innerText =
          config.turnsBeforeDice;
        el.diceActionBtn.classList.remove("hide");
        el.dicePostRoll.classList.add("hide");
        let m = state.playerClass.d20Mod || 0;
        el.diceAnteLevel.innerText = m >= 0 ? `+${m}` : m;
      } else {
        el.modalBackdrop.classList.add("hide");
        el.modalDice.classList.add("hide");
      }
      renderHUD();
      renderGrid();
      renderSidebar();
      break;

    case "TAVERN":
      renderTavern();
      el.screenTavern.classList.remove("hide");
      break;

    case "GAME_OVER":
    case "VICTORY":
      el.endTitle.innerText = newState === "VICTORY" ? "VICTORY!" : "RUN OVER";
      el.endTitle.className = `text-4xl md:text-5xl font-black mb-2 font-serif ${newState === "VICTORY" ? "text-amber-400" : "text-white"}`;
      el.endDesc.innerText =
        newState === "VICTORY"
          ? "You conquered the dungeon."
          : "The dungeon claims another soul.";

      el.endStatClass.innerText = `${state.playerClass.icon} ${state.playerClass.id}`;
      el.endStatAnte.innerText = state.encounterIdx + 1;
      el.endStatDmg.innerText = Math.floor(state.runStats.maxDamage);
      el.endStatMerges.innerText = state.runStats.totalMerges;
      el.endStatSeed.innerText = el.inputSeed.value || "RANDOM";

      el.modalBackdrop.classList.remove("hide");
      el.screenEnd.classList.remove("hide");
      break;
  }
}

function selectClass(clsKey) {
  state.playerClass = CLASSES[clsKey];
  const giantLvl = getArtifactLevel("GIANT_POTION");
  state.multiplier = 1.0 + 0.3 * giantLvl;
  initEncounter(0, false);
}

function initEncounter(eIdx, maintainStats = false) {
  const enc = ENCOUNTERS[eIdx];
  state.grid = Array(16).fill(null);
  spawnRandomTile();
  spawnRandomTile();
  state.encounterIdx = eIdx;
  state.monsterMaxHp = enc.hp;
  state.monsterHp = enc.hp;
  state.slidesLeft = enc.slides + 3 * getArtifactLevel("BOOTS_HASTE");
  if (enc.name === "The Lich") state.slidesLeft -= 10;
  state.slidesSinceRoll = 0;
  state.slidesTotalInEncounter = 0;
  state.usesLeft = state.playerClass.ability
    ? state.playerClass.ability.maxUses
    : 0;
  el.headerAnte.innerText = `Ante ${eIdx + 1}`;
  if (!maintainStats) state.logs = [];
  addLog(`Encountered ${enc.name}!`);
  changeState("PLAYING");
}

function checkGameState() {
  if (state.gameState !== "PLAYING") return;
  renderHUD();
  renderGrid();
  renderSidebar();

  if (state.monsterHp <= 0) {
    setTimeout(() => {
      if (state.encounterIdx >= ENCOUNTERS.length - 1) changeState("VICTORY");
      else {
        state.gold +=
          20 + prngInt(0, 10) + 30 * getArtifactLevel("RING_WEALTH");
        generateShop();
        changeState("TAVERN");
      }
    }, 300);
    return;
  }
  if (state.slidesLeft <= 0) {
    setTimeout(() => {
      changeState("GAME_OVER");
    }, 300);
    return;
  }
  if (checkGridlock()) {
    setTimeout(() => {
      changeState("GAME_OVER");
    }, 500);
    return;
  }
  if (state.slidesSinceRoll >= config.turnsBeforeDice) {
    setTimeout(() => changeState("DICE"), 300);
  }
}

function resetGame() {
  state.gold = config.startingGold;
  state.multiplier = 1.0;
  state.artifacts = [];
  state.runStats = { maxDamage: 0, totalMerges: 0 };
  el.inputSeed.value = "";
  changeState("START");
  el.modalBackdrop.classList.add("hide");
  el.modalDice.classList.add("hide");
  el.modalAttack.classList.add("hide");
}

// --- CONTROLS ---
window.addEventListener("keydown", (e) => {
  if (state.gameState !== "PLAYING") return;
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key))
    e.preventDefault();
  if (e.key === "ArrowLeft") processMove("LEFT");
  if (e.key === "ArrowRight") processMove("RIGHT");
  if (e.key === "ArrowUp") processMove("UP");
  if (e.key === "ArrowDown") processMove("DOWN");
});

let startX = 0,
  startY = 0;
el.gridContainer.addEventListener(
  "touchstart",
  (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  },
  { passive: true },
);
el.gridContainer.addEventListener("touchmove", (e) => e.preventDefault(), {
  passive: false,
});
el.gridContainer.addEventListener(
  "touchend",
  (e) => {
    if (state.gameState !== "PLAYING") return;
    let dx = e.changedTouches[0].clientX - startX,
      dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) > Math.abs(dy)) {
      if (Math.abs(dx) > 30) processMove(dx > 0 ? "RIGHT" : "LEFT");
    } else {
      if (Math.abs(dy) > 30) processMove(dy > 0 ? "DOWN" : "UP");
    }
  },
  { passive: false },
);

// --- GLOBAL FUNCTION EXPORTS (for inline onclick attributes) ---
window.openHelp = openHelp;
window.closeHelp = closeHelp;
window.confirmHome = confirmHome;
window.closeConfirm = closeConfirm;
window.executeHome = executeHome;
window.openSettings = openSettings;
window.closeSettings = closeSettings;
window.saveSettings = saveSettings;
window.startGameFlow = startGameFlow;
window.changeState = changeState;
window.selectClass = selectClass;
window.processMove = processMove;
window.useClassAbility = useClassAbility;
window.resolveAttack = resolveAttack;
window.rollD20 = rollD20;
window.closeD20Modal = closeD20Modal;
window.callGeminiOracle = callGeminiOracle;
window.nextEncounter = nextEncounter;
window.resetGame = resetGame;
window.buyArtifact = buyArtifact;
window.executeAttackRoll = executeAttackRoll;
window.upgradeSpell = upgradeSpell;
window.restoreSpells = restoreSpells;

// --- BOOT ---
changeState("START");
