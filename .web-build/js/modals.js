let currentHelpPage = 1;
const totalHelpPages = 6;

function triggerEntrance(element) {
  if (!element) return;
  element.classList.remove("fx-modal-entrance");
  void element.offsetWidth;
  element.classList.add("fx-modal-entrance");
}

// --- MODAL & OVERLAY HELPERS ---
function openHelp() {
  currentHelpPage = 1;
  updateHelpPagination();
  el.modalHelp.classList.remove("hide");
  triggerEntrance(el.modalHelp.children[0]);
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
    triggerEntrance(el.modalConfirm.children[0]);
  } else {
    resetGame();
  }
}
function closeConfirm() {
  el.modalConfirm.classList.add("hide");
}
function executeHome() {
  closeConfirm();
  clearSave();
  state.runStats.endReason = "Forfeit: You left the dungeon midway.";
  changeState("GAME_OVER");
}

function openLeaderboard() {
  renderLeaderboard();
  el.modalLeaderboard.classList.remove("hide");
  triggerEntrance(el.modalLeaderboard.children[0]);
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
  el.inputSettingAtmosphere.checked = config.showAtmosphere;
  el.inputSettingUiScale.value = config.uiScale || 1.0;
  el.inputSettingFontScale.value = config.fontScale || 1.0;
  el.inputSettingDisplayScale.value = config.displayScale || 1.0;
  
  updateSettingLabels();
  el.modalSettings.classList.remove("hide");
  triggerEntrance(el.modalSettings.children[0]);
}

function updateSettingLabels() {
  if (el.labelSettingTurns) el.labelSettingTurns.innerText = el.inputSettingTurns.value;
  if (el.labelSettingGold) el.labelSettingGold.innerText = el.inputSettingGold.value;
  if (el.labelSettingSfx) el.labelSettingSfx.innerText = `${Math.round(el.inputSettingSFX.value * 100)}%`;
  if (el.labelSettingShake) el.labelSettingShake.innerText = parseFloat(el.inputSettingShake.value).toFixed(1);
  if (el.labelSettingHaptics) el.labelSettingHaptics.innerText = parseFloat(el.inputSettingHapticsIntensity.value).toFixed(1);
  if (el.labelSettingUiScale) el.labelSettingUiScale.innerText = `${Math.round(el.inputSettingUiScale.value * 100)}%`;
  if (el.labelSettingFontScale) el.labelSettingFontScale.innerText = `${Math.round(el.inputSettingFontScale.value * 100)}%`;
  if (el.labelSettingDisplayScale) el.labelSettingDisplayScale.innerText = `${Math.round(el.inputSettingDisplayScale.value * 100)}%`;
}

// Add live listeners
["input-setting-turns", "input-setting-gold", "input-setting-sfx", "input-setting-shake", "input-setting-haptics-intensity", "input-setting-ui-scale", "input-setting-font-scale", "input-setting-display-scale"].forEach(id => {
  const input = document.getElementById(id);
  if (input) input.addEventListener("input", updateSettingLabels);
});

function closeSettings() {
  el.modalSettings.classList.add("hide");
}

function resetSettingsToDefault() {
  showConfirm("Reset all settings to factory defaults?", (confirmed) => {
    if (confirmed) {
      Object.assign(config, DEFAULT_CONFIG);
      openSettings();
    }
  });
}

function saveSettings() {
  const t = parseInt(el.inputSettingTurns.value),
    g = parseInt(el.inputSettingGold.value),
    vol = parseFloat(el.inputSettingSFX.value),
    shake = parseFloat(el.inputSettingShake.value),
    hapticEnabled = el.inputSettingHapticsEnabled.checked,
    hapticIntensity = parseFloat(el.inputSettingHapticsIntensity.value),
    atmosphere = el.inputSettingAtmosphere.checked,
    uiScale = parseFloat(el.inputSettingUiScale.value),
    fontScale = parseFloat(el.inputSettingFontScale.value),
    displayScale = parseFloat(el.inputSettingDisplayScale.value);

  if (!isNaN(t) && t > 0) config.turnsBeforeDice = t;
  if (!isNaN(g) && g >= 0) config.startingGold = g;
  if (!isNaN(vol) && vol >= 0) config.sfxVolume = vol;
  if (!isNaN(shake) && shake >= 0) {
    config.screenShake = shake;
    document.documentElement.style.setProperty("--shake-px", `${4 * shake}px`);
  }
  config.hapticsEnabled = hapticEnabled;
  if (!isNaN(hapticIntensity)) config.hapticsIntensity = hapticIntensity;
  config.showAtmosphere = atmosphere;
  config.uiScale = uiScale;
  config.fontScale = fontScale;
  config.displayScale = displayScale;
  
  document.documentElement.style.setProperty("--ui-scale", uiScale);
  document.documentElement.style.setProperty("--font-scale", fontScale);
  document.documentElement.style.setProperty("--display-scale", displayScale);
  
  // Toggle atmosphere visibility immediately
  const canvas = document.getElementById("atmosphere-canvas");
  if (canvas) canvas.style.display = atmosphere ? "block" : "none";

  config.diceTheme = el.inputSettingTheme.value;
  if (state.gameState === "START" || state.gameState === "CLASS_SELECT")
    state.gold = config.startingGold;
  document.getElementById("instruction-turns").innerText =
    config.turnsBeforeDice;
  
  saveGameState(); // Persist settings too
  closeSettings();
}

// --- CUSTOM DIALOGS (Alert/Confirm) ---
let dialogCallback = null;

window.alert = function(message, title = "Notice", icon = "⚠️") {
  showDialog(message, title, icon, false);
};

// NOTE: window.confirm cannot be truly overridden synchronously.
// We provide showConfirm for asynchronous usage.
window.showConfirm = function(message, callback, title = "Confirm", icon = "❓") {
  showDialog(message, title, icon, true, callback);
};

function showDialog(message, title, icon, isConfirm, callback = null) {
  if (!el.modalAlert) {
    if (isConfirm) {
      const res = window.confirm(message);
      if (callback) callback(res);
    } else {
      window.alert(message);
    }
    return;
  }

  el.alertTitle.innerText = title;
  el.alertMessage.innerText = message;
  el.alertIcon.innerText = icon;
  dialogCallback = callback;

  if (isConfirm) {
    el.alertBtnOk.classList.add("hide");
    el.confirmBtns.classList.remove("hide");
  } else {
    el.alertBtnOk.classList.remove("hide");
    el.confirmBtns.classList.add("hide");
  }

  el.modalAlert.classList.remove("hide");
  triggerEntrance(el.modalAlert.children[0]);
  
  if (window.Plugins) {
    window.Plugins.vibrate(isConfirm ? 'impactMedium' : 'notificationWarning');
  }
}

function closeAlert() {
  if (el.modalAlert) el.modalAlert.classList.add("hide");
  if (dialogCallback) dialogCallback(false);
  dialogCallback = null;
}

function onDialogConfirm() {
  if (el.modalAlert) el.modalAlert.classList.add("hide");
  if (dialogCallback) dialogCallback(true);
  dialogCallback = null;
}

function onDialogCancel() {
  if (el.modalAlert) el.modalAlert.classList.add("hide");
  if (dialogCallback) dialogCallback(false);
  dialogCallback = null;
}

