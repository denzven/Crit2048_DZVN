// --- STATE MANAGEMENT & GAME BOOTSTRAP ---
function startGameFlow() {
  try {
    SFX.init();
  } catch (e) {
    console.warn(e);
  }
  const seed = el.inputSeed.value || ((Math.random() * 4294967296) >>> 0).toString();
  setSeed(seed);
  state.runStats.seedUsed = seed;
  state.runStats.startTime = Date.now();
  state.runStats.totalMoves = 0;
  state.runStats.totalCoinsSpent = 0;
  state.runStats.maxMultiplier = 1.0;
  state.runStats.totalMerges = 0;
  state.runStats.maxDamage = 0;
  clearSave();

  Object.keys(CLASSES).forEach((k) => {
    if (CLASSES[k].ability) CLASSES[k].ability.count = 1;
  });
  changeState("CLASS_SELECT");
}

function resumeGame() {
  if (loadGameState()) {
    changeState(state.gameState, true);
  }
}

function changeState(newState, triggerEntrance = false) {
  const oldState = state.gameState;
  const updateState = () => {
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

    // Update Discord Presence
    if (window.Plugins) {
      let details = "Main Menu";
      let stateStr = "Preparing for a run...";
      
      if (newState === "PLAYING" || newState === "DICE") {
        const enc = ENCOUNTERS[state.encounterIdx];
        details = `Fighting ${enc.name}`;
        stateStr = `${state.playerClass.id} (Ante ${state.encounterIdx + 1}) - Score: ${state.score}`;
      } else if (newState === "TAVERN") {
        details = "Resting at the Tavern";
        stateStr = `Preparing for Ante ${state.encounterIdx + 2}`;
      } else if (newState === "GAME_OVER" || newState === "VICTORY") {
        details = newState === "VICTORY" ? "Victory!" : "Run Over";
        stateStr = `Final Score: ${state.score}`;
      } else if (newState === "CLASS_SELECT") {
        details = "Choosing a Class";
        stateStr = "Preparing for the dungeon...";
      }
      
      window.Plugins.updatePresence(details, stateStr);
    }

    switch (newState) {
      case "START":
        el.screenStart.classList.remove("hide");
        if (getLeaderboard().length > 0) {
          el.btnStartLeaderboard.classList.remove("hide");
        } else {
          el.btnStartLeaderboard.classList.add("hide");
        }
        if (localStorage.getItem("crit2048_save")) {
          el.btnResume.classList.remove("hide");
        } else {
          el.btnResume.classList.add("hide");
        }
        break;

      case "CLASS_SELECT":
        el.classContainer.innerHTML = Object.entries(CLASSES)
          .map(
            ([key, cls]) => `
          <div tabindex="0" onclick="selectClass('${key}')" onkeydown="if(event.key==='Enter') selectClass('${key}')" class="bg-slate-900 border border-slate-700 hover:border-rose-500 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500 p-4 rounded-2xl cursor-pointer transition-all flex flex-col items-center text-center shadow-lg">
            <span class="text-4xl mb-2">${cls.icon}</span><h3 class="text-lg font-black text-white uppercase tracking-wider">${cls.id}</h3><p class="text-slate-400 text-xs mt-1 leading-tight">${cls.desc}</p>
          </div>`,
          )
          .join("");
        el.screenClass.classList.remove("hide");
        setTimeout(() => {
          const first = el.classContainer.querySelector("div");
          if (first) first.focus();
        }, 50);
        break;

      case "PLAYING":
      case "DICE":
        el.screenPlaying.classList.remove("hide");
        if (newState === "DICE") {
          el.diceActionBtn.classList.remove("hide");
          el.dicePostRoll.classList.add("hide");
          el.diceResultMsg.innerHTML = "";
          el.modalBackdrop.classList.remove("hide");
          el.modalDice.classList.remove("hide");
          triggerEntrance(el.modalDice.children[0]);
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
        if (triggerEntrance) triggerSetupTransition();
        break;

      case "TAVERN":
        renderTavern();
        el.screenTavern.classList.remove("hide");
        break;

      case "GAME_OVER":
      case "VICTORY":
        state.runStats.endTime = Date.now();
        el.endTitle.innerText = newState === "VICTORY" ? "VICTORY!" : "RUN OVER";
        el.endTitle.className = `text-4xl md:text-5xl font-black mb-2 font-serif ${newState === "VICTORY" ? "text-amber-400" : "text-white"}`;
        el.endDesc.innerText =
          newState === "VICTORY"
            ? "You conquered the dungeon."
            : (state.runStats.endReason || "The dungeon claims another soul.");

        renderEndScreenStats();
        saveRunToLeaderboard(state.runStats, state.playerClass, state.encounterIdx);
        clearSave();

        el.modalBackdrop.classList.remove("hide");
        el.screenEnd.classList.remove("hide");
        break;
    }
    
    // Add Tavern Pull-up effect
    if (newState === "TAVERN") {
      el.screenTavern.classList.remove("pull-up");
      void el.screenTavern.offsetWidth;
      el.screenTavern.classList.add("pull-up");
    }
  };

  if (document.startViewTransition) {
    document.startViewTransition(updateState);
  } else {
    updateState();
  }
}

function selectClass(clsKey) {
  state.playerClass = CLASSES[clsKey];
  const giantLvl = getArtifactLevel("GIANT_POTION");
  state.multiplier = 1.0 + 0.3 * giantLvl;
  initEncounter(0, false);
  saveGameState();
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
  changeState("PLAYING", true);
  saveGameState();
}

function checkGameState() {
  if (state.gameState !== "PLAYING") return;
  renderHUD();
  renderGrid();
  renderSidebar();

  if (state.monsterHp <= 0) {
    const enc = ENCOUNTERS[state.encounterIdx];
    playAnnouncementText(`${enc.name}`, "Defeated!");
    triggerScreenShake(3.5);
    if (window.Plugins) window.Plugins.vibrate('impactHeavy');
    setTimeout(() => {
      if (state.encounterIdx >= ENCOUNTERS.length - 1) {
        state.runStats.endReason = "Conquered all bosses!";
        changeState("VICTORY");
      }
      else {
        state.gold +=
          20 + prngInt(0, 10) + 30 * getArtifactLevel("RING_WEALTH");
        generateShop();
        changeState("TAVERN");
      }
    }, 1800);
    return;
  }
  if (state.slidesLeft <= 0) {
    setTimeout(() => {
      state.runStats.endReason = "Out of slides!";
      changeState("GAME_OVER");
    }, 300);
    return;
  }
  if (checkGridlock()) {
    setTimeout(() => {
      state.runStats.endReason = "Gridlock: No more moves!";
      changeState("GAME_OVER");
    }, 500);
    return;
  }
  if (state.slidesSinceRoll >= config.turnsBeforeDice) {
    setTimeout(() => changeState("DICE"), 300);
  }
  saveGameState();
}

function resetGame() {
  clearSave();
  state.gold = config.startingGold;
  state.multiplier = 1.0;
  state.artifacts = [];
  state.runStats = { 
    maxDamage: 0, 
    totalMerges: 0,
    totalMoves: 0,
    totalCoinsSpent: 0,
    maxMultiplier: 1.0,
    lastRoundDamage: 0,
    startTime: 0,
    endTime: 0,
    seedUsed: "",
    endReason: ""
  };
  el.inputSeed.value = "";
  changeState("START");
  el.modalBackdrop.classList.add("hide");
  el.modalDice.classList.add("hide");
  el.modalAttack.classList.add("hide");
}

function triggerSetupTransition() {
  const hud = document.getElementById("playing-hud");
  const left = document.getElementById("playing-sidebar-left");
  const right = document.getElementById("playing-sidebar-right");
  const grid = document.getElementById("grid-container");

  const trigger = (el, cls) => {
    if (!el) return;
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
  };

  trigger(hud, "fx-entrance-pop");
  trigger(grid, "fx-entrance-pop");
  trigger(left, "fx-entrance-left");
  trigger(right, "fx-entrance-right");
}

// --- CONTROLS ---
window.addEventListener("keydown", (e) => {
  if (state.gameState === "CLASS_SELECT") {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d", "W", "A", "S", "D"].includes(e.key)) {
      e.preventDefault();
      const items = Array.from(el.classContainer.querySelectorAll("div"));
      if (!items.length) return;
      let idx = items.indexOf(document.activeElement);
      if (idx === -1) idx = 0;
      
      if (["ArrowLeft", "a", "A", "ArrowUp", "w", "W"].includes(e.key)) {
        idx = (idx - 1 + items.length) % items.length;
      } else {
        idx = (idx + 1) % items.length;
      }
      items[idx].focus();
    }
  }

  if (e.key === "Enter") {
    if (state.gameState === "START") {
      startGameFlow();
      return;
    }
    if (state.gameState === "TAVERN") {
      if (document.activeElement && document.activeElement.tagName === "BUTTON" && document.activeElement.id !== "btn-descend") {
        return; // Allow the user to press Enter on Buy/Upgrade buttons without skipping the tavern!
      }
      nextEncounter();
      return;
    }
    if (!el.modalDice.classList.contains("hide")) {
      if (!state.isRolling) {
        if (!el.diceActionBtn.classList.contains("hide")) rollD20();
        else if (!el.dicePostRoll.classList.contains("hide")) closeD20Modal();
      }
      return;
    }
    if (!el.modalAttack.classList.contains("hide")) {
      if (!el.attackResult.classList.contains("hide")) {
        // The roll has finished, waiting for Strike
        resolveAttack();
      } else if (!state.isRolling) {
        // Not rolling yet, roll button is visible
        const rollBtn = el.attackDiceContainer.querySelector("button");
        if (rollBtn) rollBtn.click();
      }
      return;
    }
    if (state.gameState === "GAME_OVER" || state.gameState === "VICTORY") {
      resetGame();
      return;
    }
  }

  // Help Modal Navigation
  if (!el.modalHelp.classList.contains("hide")) {
    if (["ArrowLeft", "a", "A", "ArrowUp", "w", "W"].includes(e.key)) {
      prevHelpPage();
      return;
    }
    if (["ArrowRight", "d", "D", "ArrowDown", "s", "S"].includes(e.key)) {
      nextHelpPage();
      return;
    }
    if (e.key === "Escape") {
      closeHelp();
      return;
    }
  }

  // Global Escape to go home
  if (e.key === "Escape") {
    confirmHome();
    return;
  }

  if (state.gameState !== "PLAYING") return;
  
  // Prevent movement or spell casts if any interaction modal is open
  if (!el.modalDice.classList.contains("hide") || !el.modalAttack.classList.contains("hide") || !el.modalSettings.classList.contains("hide") || !el.modalHelp.classList.contains("hide") || !el.modalConfirm.classList.contains("hide")) {
    return;
  }
  
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " ", "w", "a", "s", "d", "W", "A", "S", "D"].includes(e.key)) {
    e.preventDefault();
  }

  if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") processMove("LEFT");
  if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") processMove("RIGHT");
  if (e.key === "ArrowUp" || e.key.toLowerCase() === "w") processMove("UP");
  if (e.key === "ArrowDown" || e.key.toLowerCase() === "s") processMove("DOWN");

  if (e.key === " ") {
    useClassAbility();
  }
  saveGameState();
});

// Global Button Haptics
document.addEventListener("click", (e) => {
  const target = e.target.closest("button") || e.target.closest("[onclick]");
  if (target && window.Plugins) {
    window.Plugins.vibrate('impactLight');
  }
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
    saveGameState();
  },
  { passive: false },
);

// --- HELP MODAL SWIPE CONTROLS ---
let helpStartX = 0, helpStartY = 0;
el.modalHelp.addEventListener("touchstart", (e) => {
  helpStartX = e.touches[0].clientX;
  helpStartY = e.touches[0].clientY;
}, { passive: true });

el.modalHelp.addEventListener("touchend", (e) => {
  if (el.modalHelp.classList.contains("hide")) return;
  let dx = e.changedTouches[0].clientX - helpStartX;
  let dy = e.changedTouches[0].clientY - helpStartY;
  
  // Horizontal swipe detection
  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
    if (dx > 0) {
      prevHelpPage();
    } else {
      nextHelpPage();
    }
  }
}, { passive: true });

// --- GLOBAL FUNCTION EXPORTS (for inline onclick attributes) ---
window.openHelp = openHelp;
window.closeHelp = closeHelp;
window.nextHelpPage = nextHelpPage;
window.prevHelpPage = prevHelpPage;
window.confirmHome = confirmHome;
window.closeConfirm = closeConfirm;
window.executeHome = executeHome;
window.openLeaderboard = openLeaderboard;
window.closeLeaderboard = closeLeaderboard;
window.openSettings = openSettings;
window.closeSettings = closeSettings;
window.saveSettings = saveSettings;
window.resetSettingsToDefault = resetSettingsToDefault;
window.startGameFlow = startGameFlow;
window.resumeGame = resumeGame;
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
async function bootstrapGame() {
  if (config.uiScale) document.documentElement.style.setProperty("--ui-scale", config.uiScale);
  if (config.fontScale) document.documentElement.style.setProperty("--font-scale", config.fontScale);
  if (config.displayScale) document.documentElement.style.setProperty("--display-scale", config.displayScale);
  // Pre-load check: Fonts
  try {
    if (document.fonts) await document.fonts.ready;
  } catch (e) {}

  // Snappy delay to ensure DOM is ready
  setTimeout(() => {
    const preloader = document.getElementById("preloader");
    if (preloader) {
      preloader.style.opacity = "0";
      setTimeout(() => preloader.remove(), 300);
    }
    if (window.Plugins) window.Plugins.init();
    changeState("START");
  }, 400);
}

bootstrapGame();
