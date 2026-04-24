let currentHelpPage = 1;
const totalHelpPages = 6;

// --- MODAL & OVERLAY HELPERS ---
function openHelp() {
  currentHelpPage = 1;
  updateHelpPagination();
  el.modalHelp.classList.remove("hide");
}

function closeHelp() {
  el.modalHelp.classList.add("hide");
}

function nextHelpPage() {
  if (currentHelpPage < totalHelpPages) {
    currentHelpPage++;
    updateHelpPagination();
  }
}

function prevHelpPage() {
  if (currentHelpPage > 1) {
    currentHelpPage--;
    updateHelpPagination();
  }
}

function updateHelpPagination() {
  for (let i = 1; i <= totalHelpPages; i++) {
    const page = document.getElementById(`help-page-${i}`);
    const dot = document.getElementById(`dot-${i}`);
    if (page) {
      if (i === currentHelpPage) {
        page.classList.remove("hidden");
      } else {
        page.classList.add("hidden");
      }
    }
    if (dot) {
      if (i === currentHelpPage) {
        dot.classList.remove("bg-slate-700");
        dot.classList.add("bg-rose-500");
      } else {
        dot.classList.remove("bg-rose-500");
        dot.classList.add("bg-slate-700");
      }
    }
  }
  
  const btnPrev = document.getElementById("btn-help-prev");
  const btnNext = document.getElementById("btn-help-next");
  if (btnPrev) btnPrev.disabled = currentHelpPage === 1;
  if (btnNext) btnNext.disabled = currentHelpPage === totalHelpPages;
}

function confirmHome() {
  if (["PLAYING", "TAVERN", "DICE"].includes(state.gameState)) {
    el.modalConfirm.classList.remove("hide");
  } else {
    resetGame();
  }
}
function closeConfirm() {
  el.modalConfirm.classList.add("hide");
}
function executeHome() {
  closeConfirm();
  state.runStats.endReason = "Forfeit: You left the dungeon midway.";
  changeState("GAME_OVER");
}

function openLeaderboard() {
  renderLeaderboard();
  el.modalLeaderboard.classList.remove("hide");
}
function closeLeaderboard() {
  el.modalLeaderboard.classList.add("hide");
}

function openSettings() {
  el.inputSettingTurns.value = config.turnsBeforeDice;
  el.inputSettingGold.value = config.startingGold;
  el.inputSettingTheme.value = config.diceTheme;
  el.inputSettingSFX.value = config.sfxVolume;
  el.inputSettingShake.value = config.screenShake;
  el.inputSettingHapticsEnabled.checked = config.hapticsEnabled;
  el.inputSettingHapticsIntensity.value = config.hapticsIntensity;
  el.modalSettings.classList.remove("hide");
}
function closeSettings() {
  el.modalSettings.classList.add("hide");
}

function saveSettings() {
  const t = parseInt(el.inputSettingTurns.value),
    g = parseInt(el.inputSettingGold.value),
    vol = parseFloat(el.inputSettingSFX.value),
    shake = parseFloat(el.inputSettingShake.value),
    hapticEnabled = el.inputSettingHapticsEnabled.checked,
    hapticIntensity = parseFloat(el.inputSettingHapticsIntensity.value);
  if (!isNaN(t) && t > 0) config.turnsBeforeDice = t;
  if (!isNaN(g) && g >= 0) config.startingGold = g;
  if (!isNaN(vol) && vol >= 0) config.sfxVolume = vol;
  if (!isNaN(shake) && shake >= 0) {
    config.screenShake = shake;
    document.documentElement.style.setProperty("--shake-px", `${4 * shake}px`);
  }
  config.hapticsEnabled = hapticEnabled;
  if (!isNaN(hapticIntensity)) config.hapticsIntensity = hapticIntensity;
  
  config.diceTheme = el.inputSettingTheme.value;
  if (state.gameState === "START" || state.gameState === "CLASS_SELECT")
    state.gold = config.startingGold;
  document.getElementById("instruction-turns").innerText =
    config.turnsBeforeDice;
  closeSettings();
}

