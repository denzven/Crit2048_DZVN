// --- MODAL & OVERLAY HELPERS ---
function openHelp()  { el.modalHelp.classList.remove('hide'); }
function closeHelp() { el.modalHelp.classList.add('hide'); }

function confirmHome() {
  if (['PLAYING', 'TAVERN', 'DICE'].includes(state.gameState)) { el.modalConfirm.classList.remove('hide'); }
  else { resetGame(); }
}
function closeConfirm() { el.modalConfirm.classList.add('hide'); }
function executeHome()  { closeConfirm(); resetGame(); }

function openSettings() {
  el.inputSettingTurns.value = config.turnsBeforeDice;
  el.inputSettingGold.value  = config.startingGold;
  el.inputSettingTheme.value = config.diceTheme;
  el.inputSettingSFX.value   = config.sfxVolume;
  el.inputSettingShake.value = config.screenShake;
  el.modalSettings.classList.remove('hide');
}
function closeSettings() { el.modalSettings.classList.add('hide'); }

function saveSettings() {
  const t = parseInt(el.inputSettingTurns.value), g = parseInt(el.inputSettingGold.value),
        vol = parseFloat(el.inputSettingSFX.value), shake = parseFloat(el.inputSettingShake.value);
  if (!isNaN(t)     && t     > 0) config.turnsBeforeDice = t;
  if (!isNaN(g)     && g    >= 0) config.startingGold    = g;
  if (!isNaN(vol)   && vol  >= 0) config.sfxVolume        = vol;
  if (!isNaN(shake) && shake >= 0) {
    config.screenShake = shake;
    document.documentElement.style.setProperty('--shake-px', `${4 * shake}px`);
  }
  config.diceTheme = el.inputSettingTheme.value;
  if (state.gameState === 'START' || state.gameState === 'CLASS_SELECT') state.gold = config.startingGold;
  document.getElementById('instruction-turns').innerText = config.turnsBeforeDice;
  closeSettings();
}
