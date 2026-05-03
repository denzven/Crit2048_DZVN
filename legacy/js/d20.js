// --- D20 ROLL LOGIC ---
async function rollD20() {
  if (state.isRolling) return;
  state.isRolling = true;
  el.diceActionBtn.classList.add("hide");
  if (window.Plugins) window.Plugins.vibrate('impactHeavy');
  let roll = prngInt(1, 20);
  await FixedDiceEngine.roll("d20-render-target", [20], [roll]);
  processD20Result(roll);
}

function trackRoll(val) {
  state.runStats.totalRolls = (state.runStats.totalRolls || 0) + 1;
  state.runStats.rollSum = (state.runStats.rollSum || 0) + val;
  state.runStats.luckFactor = state.runStats.rollSum / state.runStats.totalRolls;
}

function processD20Result(roll) {
  trackRoll(roll);
  if (state.playerClass.id === "Bard") {
    state.gold += 5;
    addLog("🎵 Bard gained 5 gold from performing!");
  }
  let mod = state.playerClass.d20Mod || 0;
  roll += mod;
  if (window.PackEngine) roll = window.PackEngine.onD20(state, roll);
  
  let rawRoll = roll - mod;
  // Hardcoded artifact check removed - now handled via PackEngine.onD20 scripts


  let msg = "";
  let color = "#fff";
  
  let isCrit = roll >= 20 || (state.playerClass.id === "Sorcerer" && roll >= 19);

  if (isCrit) {
    msg = "Critical Hit! Mult +1. Upgraded a tile!";
    color = "#facc15";
    state.multiplier += 1;
    const valid = state.grid
      .map((c, i) => (c && c.val > 0 ? i : null))
      .filter((c) => c !== null);
    if (valid.length > 0)
      state.grid[valid[prngInt(0, valid.length - 1)]].val *= 2;
    SFX.crit();
    if (window.PackEngine) window.PackEngine.onCrit(state);
  } else if (roll >= 10) {
    msg = "Success! High-tier weapon spawned.";
    spawnRandomTile(8);
    SFX.slide();
  } else if (roll > 1) {
    msg = "Miss! A Slime blocked your path.";
    color = "#4ade80";
    spawnRandomTile(-1);
    SFX.fail();
    // Hardcoded Necronomicon removed - now handled via PackEngine.onD20 or onDamage scripts

  } else {
    msg = "Critical Failure! Highest weapon broken.";
    color = "#e11d48";
    let maxV = 0,
      maxI = -1;
    state.grid.forEach((c, i) => {
      if (c && c.val > maxV) {
        maxV = c.val;
        maxI = i;
      }
    });
    if (maxI !== -1) state.grid[maxI] = null;
    SFX.fail();
  }

  triggerScreenShake(isCrit ? 2.5 : 1);

  // Prominently display the rolled number in the modal
  el.diceResultMsg.innerHTML = `<span class="block text-5xl font-black mb-2 font-mono" style="color: ${color}">${rawRoll}</span><span class="text-sm font-bold text-white">${msg}</span>`;

  setTimeout(() => {
    el.dicePostRoll.classList.remove("hide");
  }, 100);
  state.isRolling = false;
}

function closeD20Modal() {
  FixedDiceEngine.clear("d20-render-target");
  el.dicePostRoll.classList.add("hide");
  el.modalBackdrop.classList.add("hide");
  el.modalDice.classList.add("hide");
  state.slidesSinceRoll = 0;
  changeState("PLAYING");
  checkGameState();
}
