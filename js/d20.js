// --- D20 ROLL LOGIC ---
async function rollD20() {
  if (state.isRolling) return;
  state.isRolling = true;
  el.diceActionBtn.classList.add("hide");
  let roll = prngInt(1, 20);
  await FixedDiceEngine.roll("d20-render-target", [20], [roll]);
  processD20Result(roll);
}

function processD20Result(roll) {
  let mod = state.playerClass.d20Mod || 0;
  roll += mod;
  let rawRoll = roll - mod;
  const weightLvl = getArtifactLevel("WEIGHTED_DICE");
  if (weightLvl > 0 && roll < 4 + weightLvl) roll = 4 + weightLvl;

  let msg = "";
  let color = "#fff";
  if (roll >= 20) {
    msg = "Critical Hit! Mult +1. Upgraded a tile!";
    color = "#facc15";
    state.multiplier += 1;
    const valid = state.grid
      .map((c, i) => (c && c.val > 0 ? i : null))
      .filter((c) => c !== null);
    if (valid.length > 0)
      state.grid[valid[prngInt(0, valid.length - 1)]].val *= 2;
    SFX.crit();
  } else if (roll >= 10) {
    msg = "Success! High-tier weapon spawned.";
    spawnRandomTile(8);
    SFX.slide();
  } else if (roll > 1) {
    msg = "Miss! A Slime blocked your path.";
    color = "#4ade80";
    spawnRandomTile(-1);
    SFX.fail();
    const necroLvl = getArtifactLevel("NECRONOMICON");
    if (necroLvl > 0) {
      applyDamage(50 * necroLvl);
      addLog(`Necronomicon burned boss for ${50 * necroLvl}!`);
    }
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

  triggerScreenShake();

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
