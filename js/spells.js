// --- SPELLS & CLASS ABILITIES ---
function restoreSpells() {
  if (state.gold < 30) {
    SFX.fail();
    return;
  }
  const ab = state.playerClass.ability;
  if (!ab || state.usesLeft >= ab.maxUses) return;
  SFX.coin();
  state.gold -= 30;
  state.usesLeft = ab.maxUses;
  renderHUD();
  addLog("Restored spell uses.");
}

function upgradeSpell() {
  const cost =
    100 * (state.playerClass.ability ? state.playerClass.ability.count : 1);
  if (state.gold < cost) {
    SFX.fail();
    return;
  }
  const ab = state.playerClass.ability;
  if (!ab) return;
  SFX.powerUp();
  state.gold -= cost;
  ab.count += 1;
  renderTavern();
  renderHUD();
  addLog(`Spell Enhanced: Now rolls ${ab.count}d${ab.sides}!`);
}

function useClassAbility() {
  if (
    state.gameState !== "PLAYING" ||
    state.isRolling ||
    !state.playerClass.ability ||
    state.usesLeft <= 0
  )
    return;
  const ab = state.playerClass.ability;
  state.usesLeft--;
  el.attackTitle.innerText = `Casting ${ab.name}...`;
  FixedDiceEngine.clear("attack-dice-container");
  el.attackResult.classList.add("hide");

  const rollBtn = document.createElement("button");
  rollBtn.className =
    "px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl shadow-lg transition-transform hover:scale-105 uppercase tracking-widest text-xl z-[100] absolute";
  rollBtn.innerText = `ROLL ${ab.count}d${ab.sides}`;
  rollBtn.onclick = () => executeAttackRoll(ab);
  document.getElementById("attack-dice-container").appendChild(rollBtn);
  el.modalBackdrop.classList.remove("hide");
  el.modalAttack.classList.remove("hide");
  renderHUD();
}

async function executeAttackRoll(ab) {
  state.isRolling = true;
  el.attackDiceContainer.innerHTML = "";
  let diceArray = [];
  for (let i = 0; i < ab.count; i++) diceArray.push(ab.sides);
  let results = [];
  for (let i = 0; i < ab.count; i++) results.push(prngInt(1, ab.sides));
  let sum = results.reduce((a, b) => a + b, 0);
  await FixedDiceEngine.roll("attack-dice-container", diceArray, results);
  SFX.hit();
  triggerScreenShake();
  state.currentAttackInfo = { sum, type: ab.type || "damage" };
  el.attackTotal.innerText = sum;
  el.attackResult.classList.remove("hide");
}

function resolveAttack() {
  FixedDiceEngine.clear("attack-dice-container");
  el.modalBackdrop.classList.add("hide");
  el.modalAttack.classList.add("hide");
  state.isRolling = false;
  const info = state.currentAttackInfo;
  if (!info) return;

  let totalDmg = info.sum * state.multiplier;
  const cid = state.playerClass.id;

  if (cid === "Wizard") {
    SFX.explosion();
    triggerScreenShake();
    let r = prngInt(0, 2),
      c = prngInt(0, 2);
    playGridFx("fireball", r, c);
    setTimeout(() => {
      for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
          let idx = (r + i) * 4 + (c + j);
          if (state.grid[idx] && state.grid[idx].val < 8)
            state.grid[idx] = null;
        }
      }
      applyDamage(totalDmg);
      renderGrid();
      renderHUD();
      checkGameState();
    }, 300);
    state.currentAttackInfo = null;
    return;
  }
  if (cid === "Warlock") {
    SFX.beam();
    let r = prngInt(0, 3);
    playGridFx("beam", r, 0);
    setTimeout(() => {
      for (let c = 0; c < 4; c++) {
        let idx = r * 4 + c;
        if (state.grid[idx] && state.grid[idx].val < 0) state.grid[idx] = null;
      }
      applyDamage(totalDmg);
      renderGrid();
      renderHUD();
      checkGameState();
    }, 300);
    state.currentAttackInfo = null;
    return;
  }
  if (cid === "Paladin") {
    SFX.smite();
    let maxV = 2,
      maxI = 0;
    state.grid.forEach((c, i) => {
      if (c && c.val > maxV) {
        maxV = c.val;
        maxI = i;
      }
    });
    totalDmg = info.sum * maxV * state.multiplier;
    let r = Math.floor(maxI / 4),
      c = maxI % 4;
    playGridFx("smite", r, c);
    setTimeout(() => {
      addLog(`🛡️ Smite amplified by x${maxV}!`);
      applyDamage(totalDmg);
      renderGrid();
      renderHUD();
      checkGameState();
    }, 300);
    state.currentAttackInfo = null;
    return;
  }
  if (cid === "Cleric") {
    SFX.powerUp();
    playGridFx("divine", 0, 0);
    setTimeout(() => {
      state.slidesLeft += info.sum;
      addLog(`✨ Restored ${info.sum} slides!`);
      let hIdx = state.grid.findIndex((t) => t && t.val < 0);
      if (hIdx !== -1) {
        state.grid[hIdx] = { id: tileIdCounter++, val: 2, pop: true };
        addLog("✨ Purified a hazard!");
      }
      renderGrid();
      renderHUD();
      checkGameState();
    }, 400);
    state.currentAttackInfo = null;
    return;
  }
  applyDamage(totalDmg);
  state.currentAttackInfo = null;
  renderGrid();
  renderHUD();
  checkGameState();
}
