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
  mobileInventory: document.getElementById("mobile-inventory"),
  sidebarClassIcon: document.getElementById("sidebar-class-icon"),
  sidebarClassName: document.getElementById("sidebar-class-name"),
  sidebarClassUses: document.getElementById("sidebar-class-uses"),
  sidebarSpellInfo: document.getElementById("sidebar-spell-info"),
  btnAbility: document.getElementById("btn-ability"),
  btnAbilityMobile: document.getElementById("btn-ability-mobile"),
  mobileClassIcon: document.getElementById("mobile-class-icon"),
  mobileSpellUses: document.getElementById("mobile-spell-uses"),
  combatLogDesktop: document.getElementById("combat-log-desktop"),
  mobileInventoryModal: document.getElementById("mobile-inventory-modal"),
  mobileInventoryList: document.getElementById("mobile-inventory-list"),
  mobileLogModal: document.getElementById("mobile-log-modal"),
  mobileLogContent: document.getElementById("combat-log-modal-content"),
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
  endStatDate: document.getElementById("end-stat-date"),
  endStatTime: document.getElementById("end-stat-time"),
  endStatDuration: document.getElementById("end-stat-duration"),
  endStatLastDmg: document.getElementById("end-stat-last-dmg"),
  endStatMaxMult: document.getElementById("end-stat-max-mult"),
  endStatMoves: document.getElementById("end-stat-moves"),
  endStatSpent: document.getElementById("end-stat-spent"),
  endArtifactsList: document.getElementById("end-artifacts-list"),
  endCaptureArea: document.getElementById("end-capture-area"),
  modalSettings: document.getElementById("modal-settings"),
  inputSettingTurns: document.getElementById("input-setting-turns"),
  inputSettingGold: document.getElementById("input-setting-gold"),
  inputSettingTheme: document.getElementById("input-setting-theme"),
  inputSettingSFX: document.getElementById("input-setting-sfx"),
  inputSettingShake: document.getElementById("input-setting-shake"),
  inputSettingHapticsEnabled: document.getElementById("input-setting-haptics-enabled"),
  inputSettingHapticsIntensity: document.getElementById("input-setting-haptics-intensity"),
  inputSettingAtmosphere: document.getElementById("input-setting-atmosphere"),
  labelSettingTurns: document.getElementById("label-setting-turns"),
  labelSettingGold: document.getElementById("label-setting-gold"),
  labelSettingSfx: document.getElementById("label-setting-sfx"),
  labelSettingShake: document.getElementById("label-setting-shake"),
  labelSettingHaptics: document.getElementById("label-setting-haptics"),
  inputSettingUiScale: document.getElementById("input-setting-ui-scale"),
  labelSettingUiScale: document.getElementById("label-setting-ui-scale"),
  inputSettingFontScale: document.getElementById("input-setting-font-scale"),
  labelSettingFontScale: document.getElementById("label-setting-font-scale"),
  inputSettingDisplayScale: document.getElementById("input-setting-display-scale"),
  labelSettingDisplayScale: document.getElementById("label-setting-display-scale"),
  modalAttack: document.getElementById("modal-attack"),
  attackTitle: document.getElementById("attack-title"),
  attackDiceContainer: document.getElementById("attack-dice-container"),
  attackResult: document.getElementById("attack-result"),
  attackTotal: document.getElementById("attack-total"),
  btnAiOracle: document.getElementById("btn-ai-oracle"),
  btnRest: document.getElementById("btn-rest"),
  btnUpgrade: document.getElementById("btn-upgrade"),
  aiLoading: document.getElementById("ai-loading"),
  upgradeCost: document.getElementById("upgrade-cost"),
  modalHelp: document.getElementById("modal-help"),
  btnHome: document.getElementById("btn-home"),
  modalConfirm: document.getElementById("modal-confirm"),
  modalLeaderboard: document.getElementById("modal-leaderboard"),
  leaderboardList: document.getElementById("leaderboard-list"),
  btnStartLeaderboard: document.getElementById("btn-start-leaderboard"),
  btnResume: document.getElementById("btn-resume"),
  btnRespin: document.getElementById("btn-respin"),
  modalAlert: document.getElementById("modal-alert"),
  alertTitle: document.getElementById("alert-title"),
  alertMessage: document.getElementById("alert-message"),
  alertIcon: document.getElementById("alert-icon"),
  alertBtnOk: document.getElementById("alert-btn-ok"),
  confirmBtns: document.getElementById("confirm-btns"),
  confirmBtnOk: document.getElementById("confirm-btn-ok"),
  confirmBtnCancel: document.getElementById("confirm-btn-cancel"),
  modalShare: document.getElementById("modal-share"),
  sharePreviewContainer: document.getElementById("share-preview-container"),
  shareToggleSeed: document.getElementById("share-toggle-seed"),
  shareToggleArtifacts: document.getElementById("share-toggle-artifacts"),
  shareToggleExtra: document.getElementById("share-toggle-extra"),
};

// --- UI HELPERS ---
function addLog(msg) {
  state.logs.push(msg);
  if (state.logs.length > 20) state.logs.shift(); // Keep more for the modal
  const html = state.logs
    .map(
      (log) =>
        `<div class="mb-1">> <span class="text-slate-200">${log}</span></div>`,
    )
    .join("");
  el.combatLogDesktop.innerHTML = html;
  el.combatLogDesktop.scrollTop = el.combatLogDesktop.scrollHeight;
  if (el.mobileLogContent) {
    el.mobileLogContent.innerHTML = html;
    el.mobileLogContent.scrollTop = el.mobileLogContent.scrollHeight;
  }
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
  if (el.mobileInventoryList) el.mobileInventoryList.innerHTML = "";
  state.artifacts.forEach((a) => {
    const html = `<div class="bg-slate-800 p-2.5 rounded-xl border border-slate-700 flex items-center gap-3 mb-1" title="${a.desc(a.level)}">
        <span class="text-xl">${a.icon}</span> 
        <div class="flex flex-col">
          <span class="text-xs font-bold text-white uppercase leading-tight">${a.name}</span>
          <span class="text-[10px] text-amber-400 font-mono">Lvl ${a.level}</span>
        </div>
      </div>`;
    el.sidebarArtifacts.innerHTML += html;
    if (el.mobileInventoryList) el.mobileInventoryList.innerHTML += html;
  });
}

function toggleMobileInventory() {
  if (!el.mobileInventoryModal) return;
  const isHidden = el.mobileInventoryModal.classList.contains('hide');
  el.mobileLogModal?.classList.add('hide'); // Close other modal
  if (isHidden) {
    el.mobileInventoryModal.classList.remove('hide');
    el.mobileInventoryModal.classList.add('fx-entrance-pop');
  } else {
    el.mobileInventoryModal.classList.add('hide');
  }
}

function toggleMobileLog() {
  if (!el.mobileLogModal) return;
  const isHidden = el.mobileLogModal.classList.contains('hide');
  el.mobileInventoryModal?.classList.add('hide'); // Close other modal
  if (isHidden) {
    el.mobileLogModal.classList.remove('hide');
    el.mobileLogModal.classList.add('fx-entrance-pop');
  } else {
    el.mobileLogModal.classList.add('hide');
  }
}

function renderEndScreenStats() {
  const rs = state.runStats;
  const start = new Date(rs.startTime);
  const end = new Date(rs.endTime);
  const diff = rs.endTime - rs.startTime;
  const mins = Math.floor(diff / 60000);
  const secs = Math.floor((diff % 60000) / 1000);

  el.endStatClass.innerText = `${state.playerClass.icon} ${state.playerClass.id}`;
  el.endStatAnte.innerText = state.encounterIdx + 1;
  el.endStatDate.innerText = start.toLocaleDateString();
  el.endStatTime.innerText = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  el.endStatDuration.innerText = `${mins}m ${secs}s`;
  el.endStatSeed.innerText = rs.seedUsed;
  
  el.endStatDmg.innerText = Math.floor(rs.maxDamage);
  el.endStatLastDmg.innerText = Math.floor(rs.lastRoundDamage);
  el.endStatMaxMult.innerText = `x${rs.maxMultiplier.toFixed(1)}`;
  el.endStatMoves.innerText = rs.totalMoves;
  el.endStatMerges.innerText = rs.totalMerges;
  el.endStatSpent.innerText = `💰 ${rs.totalCoinsSpent}`;

  // Artifacts list
  if (state.artifacts.length > 0) {
    el.endArtifactsList.innerHTML = state.artifacts.map(a => `
      <div class="bg-slate-800 px-2 py-1 rounded-lg border border-slate-700 flex items-center gap-1.5 shadow-sm">
        <span class="text-sm">${a.icon}</span>
        <div class="flex flex-col">
          <span class="text-[8px] font-bold text-white uppercase leading-tight">${a.name}</span>
          <span class="text-[7px] text-amber-400 font-mono">LVL ${a.level}</span>
        </div>
      </div>
    `).join("");
  } else {
    el.endArtifactsList.innerHTML = '<p class="text-[10px] text-slate-600 italic">No artifacts found.</p>';
  }
}

function copySeed() {
  const seed = state.runStats.seedUsed;
  navigator.clipboard.writeText(seed).then(() => {
    addLog("Seed copied to clipboard!");
    alert("Seed copied to clipboard!", "Success", "📋");
  });
}

async function shareRun() {
  openShareModal();
}

let currentShareTheme = 'classic';
let currentShareBytes = null;

async function openShareModal() {
  if (!el.modalShare) return;
  el.modalShare.classList.remove('hide');
  refreshSharePreview();
}

function closeShareModal() {
  el.modalShare?.classList.add('hide');
}

function updateShareTheme(theme) {
  currentShareTheme = theme;
  // Update UI active state
  document.querySelectorAll('.share-theme-btn').forEach(btn => {
    const dot = btn.querySelector('div');
    const label = btn.querySelector('span');
    if (dot) {
      dot.classList.remove('ring-2', 'ring-rose-500', 'ring-offset-2', 'ring-offset-slate-900');
      dot.classList.add('ring-1', 'ring-white/10');
    }
    if (label) {
      label.classList.remove('text-white', 'opacity-100');
      label.classList.add('text-slate-500', 'opacity-60');
    }
  });

  const activeBtn = event.currentTarget;
  const activeDot = activeBtn.querySelector('div');
  const activeLabel = activeBtn.querySelector('span');
  if (activeDot) {
    activeDot.classList.add('ring-2', 'ring-rose-500', 'ring-offset-2', 'ring-offset-slate-900');
    activeDot.classList.remove('ring-1', 'ring-white/10');
  }
  if (activeLabel) {
    activeLabel.classList.add('text-white', 'opacity-100');
    activeLabel.classList.remove('text-slate-500', 'opacity-60');
  }
  
  refreshSharePreview();
}

async function refreshSharePreview() {
  const container = el.sharePreviewContainer;
  if (!container) return;
  
  // Show loading
  const loading = document.getElementById('share-preview-loading');
  if (loading) loading.classList.remove('hide');

  try {
    const rs = state.runStats;
    const diff = rs.endTime - rs.startTime;
    const mins = Math.floor(diff / 60000);
    const secs = Math.floor((diff % 60000) / 1000);

    const shareData = {
      ante: state.encounterIdx + 1,
      classIcon: state.playerClass.icon,
      className: state.playerClass.id,
      maxDamage: rs.maxDamage,
      lastRoundDamage: rs.lastRoundDamage,
      totalMoves: rs.totalMoves,
      maxMultiplier: rs.maxMultiplier,
      totalMerges: rs.totalMerges,
      totalCoinsSpent: rs.totalCoinsSpent,
      totalDamageDealt: rs.totalDamageDealt || 0,
      highestTileValue: rs.highestTileValue || 2,
      totalHazardsCleared: rs.totalHazardsCleared || 0,
      mostMergedVal: rs.mostMergedVal || 2,
      spellDamageDealt: rs.spellDamageDealt || 0,
      hazardsSpawned: rs.hazardsSpawned || 0,
      luckFactor: rs.luckFactor || 10,
      duration: `${mins}m ${secs}s`,
      startTime: rs.startTime,
      seedUsed: rs.seedUsed,
      artifacts: state.artifacts
    };

    const options = {
      theme: currentShareTheme,
      showSeed: el.shareToggleSeed?.checked,
      showArtifacts: el.shareToggleArtifacts?.checked,
      showExtraStats: el.shareToggleExtra?.checked
    };

    currentShareBytes = await ImageGenerator.generate(shareData, options);
    
    // Create preview image
    const blob = new Blob([currentShareBytes], { type: 'image/png' });
    const url = URL.createObjectURL(blob);
    
    container.innerHTML = `<img src="${url}" class="w-full h-full object-contain fx-entrance-pop">`;
  } catch (e) {
    console.error("Preview failed", e);
  } finally {
    if (loading) loading.classList.add('hide');
  }
}

async function executeFinalShare() {
  if (!currentShareBytes) return;
  
  const btn = event.currentTarget;
  const originalText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<span>⏳ Opening Share...</span>';

  try {
    if (window.Plugins && window.Plugins.isTauri) {
      await window.Plugins.share({
        title: 'Crit 2048 Run Summary',
        text: `Check out my ${state.playerClass.id} run in Crit 2048!`,
        files: [currentShareBytes]
      });
    } else {
      executeFinalSave();
    }
  } catch (e) {
    alert("Share failed: " + e.message, "Error", "❌");
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalText;
  }
}

async function executeFinalSave() {
  if (!currentShareBytes) return;
  
  const fileName = `crit2048_run_${state.runStats.seedUsed || Date.now()}.png`;

  try {
    if (window.Plugins && window.Plugins.isTauri) {
      if (window.Plugins.isMobile()) {
        const storageDir = await window.__TAURI__.path.downloadDir();
        const filePath = await window.__TAURI__.path.join(storageDir, fileName);
        const fs = window.__TAURI__.fs || window.__TAURI__.pluginFs;
        if (fs && fs.writeFile) {
          await fs.writeFile(filePath, currentShareBytes);
        } else {
          await window.__TAURI__.core.invoke('plugin:fs|write_file', { path: filePath, data: currentShareBytes });
        }
        alert("Saved to Downloads!", "Success", "💾");
      } else {
        await window.Plugins.saveWithDialog(currentShareBytes, fileName);
      }
    } else {
      const blob = new Blob([currentShareBytes], { type: 'image/png' });
      const link = document.createElement('a');
      link.download = fileName;
      link.href = URL.createObjectURL(blob);
      link.click();
    }
  } catch (e) {
    alert("Save failed", "Error", "❌");
  }
}

function renderLeaderboard() {
  const leaderboard = getLeaderboard();
  if (!el.leaderboardList) return;

  if (leaderboard.length === 0) {
    el.leaderboardList.innerHTML = '<p class="text-slate-600 italic text-center py-10">No legends recorded yet. Descend into the dungeon to make history!</p>';
    return;
  }

  el.leaderboardList.innerHTML = leaderboard.map((entry, index) => {
    const date = new Date(entry.date).toLocaleDateString();
    const durationMins = Math.floor(entry.duration / 60000);
    const durationSecs = Math.floor((entry.duration % 60000) / 1000);
    
    return `
      <div class="bg-slate-950/50 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3 relative group hover:border-indigo-500/50 transition-all shadow-inner">
        <div class="flex justify-between items-start">
          <div class="flex items-center gap-3">
            <span class="text-3xl">${entry.icon}</span>
            <div>
              <h4 class="text-white font-black uppercase text-sm">${entry.class}</h4>
              <p class="text-[9px] text-slate-500 font-bold uppercase tracking-widest">${date} • ${durationMins}m ${durationSecs}s</p>
            </div>
          </div>
          <div class="flex flex-col items-end">
            <span class="text-rose-500 font-black text-xl leading-none">ANTE ${entry.ante}</span>
            <span class="text-[9px] text-slate-600 font-mono uppercase">Rank #${index + 1}</span>
          </div>
        </div>
        
        <div class="grid grid-cols-3 gap-2">
          <div class="bg-slate-900/80 rounded-lg p-2 border border-slate-800/50">
            <span class="block text-[8px] text-slate-500 uppercase font-black">Max DMG</span>
            <span class="text-amber-400 font-bold text-xs">${Math.floor(entry.maxDamage)}</span>
          </div>
          <div class="bg-slate-900/80 rounded-lg p-2 border border-slate-800/50">
            <span class="block text-[8px] text-slate-500 uppercase font-black">Moves</span>
            <span class="text-indigo-400 font-bold text-xs">${entry.totalMoves}</span>
          </div>
          <div class="bg-slate-900/80 rounded-lg p-2 border border-slate-800/50">
            <span class="block text-[8px] text-slate-500 uppercase font-black">Multiplier</span>
            <span class="text-rose-400 font-bold text-xs">x${entry.maxMultiplier.toFixed(1)}</span>
          </div>
        </div>

        <div class="flex justify-between items-center pt-1">
          <span class="text-[8px] text-slate-600 font-mono italic truncate max-w-[70%]">Reason: ${entry.reason || "Unknown"}</span>
          <button onclick="removeLeaderboardEntry(${entry.id})" class="text-slate-700 hover:text-rose-500 transition-colors text-[10px] font-black uppercase tracking-widest">
            Remove
          </button>
        </div>
      </div>
    `;
  }).join("");
}

async function downloadRunSummary() {
  openShareModal();
}

window.renderEndScreenStats = renderEndScreenStats;
window.copySeed = copySeed;
window.shareRun = shareRun;
window.downloadRunSummary = downloadRunSummary;
window.renderLeaderboard = renderLeaderboard;
window.openShareModal = openShareModal;
window.closeShareModal = closeShareModal;
window.updateShareTheme = updateShareTheme;
window.refreshSharePreview = refreshSharePreview;
window.executeFinalShare = executeFinalShare;
window.executeFinalSave = executeFinalSave;

