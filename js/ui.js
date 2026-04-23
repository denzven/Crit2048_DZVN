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
  modalLeaderboard: document.getElementById("modal-leaderboard"),
  leaderboardList: document.getElementById("leaderboard-list"),
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
    alert("Seed copied to clipboard!");
  });
}

async function shareRun() {
  const area = el.endCaptureArea;
  try {
    const canvas = await html2canvas(area, {
      backgroundColor: "#0f172a", // Match slate-950
      scale: 2, // Higher quality
      logging: false,
      useCORS: true
    });
    
    canvas.toBlob(async (blob) => {
      const file = new File([blob], `crit2048_run_${state.runStats.seedUsed}.png`, { type: 'image/png' });
      
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: 'Crit 2048 Run Summary',
            text: `Check out my ${state.playerClass.id} run in Crit 2048! Ante ${state.encounterIdx + 1}, Seed: ${state.runStats.seedUsed}`
          });
        } catch (err) {
          if (err.name !== 'AbortError') console.error('Share failed:', err);
        }
      } else {
        // Fallback: Download the image
        const link = document.createElement('a');
        link.download = `crit2048_run_${state.runStats.seedUsed}.png`;
        link.href = URL.createObjectURL(blob);
        link.click();
        alert("Sharing not supported on this browser. Image downloaded instead!");
      }
    });
  } catch (e) {
    console.error("Screenshot failed", e);
    alert("Failed to generate screenshot.");
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

window.renderEndScreenStats = renderEndScreenStats;
window.copySeed = copySeed;
window.shareRun = shareRun;
window.renderLeaderboard = renderLeaderboard;

