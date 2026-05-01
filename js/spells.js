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
  state.runStats.totalCoinsSpent += 30;
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
  state.runStats.totalCoinsSpent += cost;
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
  state.runStats.abilityUses++;
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
  triggerEntrance(el.modalAttack.children[0]);
  renderHUD();
}

async function executeAttackRoll(ab) {
  state.isRolling = true;
  state.runStats.totalSpellsCast++;
  el.attackDiceContainer.innerHTML = "";
  let diceArray = [];
  for (let i = 0; i < ab.count; i++) diceArray.push(ab.sides);
  let results = [];
  for (let i = 0; i < ab.count; i++) results.push(prngInt(1, ab.sides));
  let sum = results.reduce((a, b) => a + b, 0);
  await FixedDiceEngine.roll("attack-dice-container", diceArray, results);
  SFX.hit();
  if (window.Plugins) window.Plugins.vibrate('notificationSuccess');
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
  state.runStats.spellDamageDealt += totalDmg;
  const ab = state.playerClass.ability;
  const spellType = ab ? ab.spellType : null;

  if (window.PackEngine) {
    if (window.PackEngine.runPackSpell(state, ab, info.sum)) {
      state.currentAttackInfo = null;
      renderGrid(); renderHUD(); checkGameState();
      return;
    }
    window.PackEngine.onSpellCast(state, spellType);
  }

  switch (spellType) {
    case "fireball":
      SFX.explosion();
      triggerScreenShake();
      let rF = prngInt(0, 2), cF = prngInt(0, 2);
      playGridFx("fireball", rF, cF);
      setTimeout(() => {
        for (let i = 0; i < 2; i++) {
          for (let j = 0; j < 2; j++) {
            let idx = (rF + i) * 4 + (cF + j);
            if (state.grid[idx] && state.grid[idx].val < 8) state.grid[idx] = null;
          }
        }
        applyDamage(totalDmg);
        renderGrid(); renderHUD(); checkGameState();
      }, 300);
      break;

    case "beam":
      SFX.beam();
      let rB = prngInt(0, 3);
      playGridFx("beam", rB, 0);
      setTimeout(() => {
        for (let c = 0; c < 4; c++) {
          let idx = rB * 4 + c;
          if (state.grid[idx] && state.grid[idx].val < 0) state.grid[idx] = null;
        }
        applyDamage(totalDmg);
        renderGrid(); renderHUD(); checkGameState();
      }, 300);
      break;

    case "smite":
      SFX.smite();
      let maxV = 2, maxI = 0;
      state.grid.forEach((c, i) => {
        if (c && c.val > maxV) { maxV = c.val; maxI = i; }
      });
      totalDmg = info.sum * maxV * state.multiplier;
      if (getArtifactLevel("HOLY_AVENGER") > 0) totalDmg *= 2 * getArtifactLevel("HOLY_AVENGER");
      let rS = Math.floor(maxI / 4), cS = maxI % 4;
      playGridFx("smite", rS, cS);
      setTimeout(() => {
        addLog(`🛡️ Smite amplified by x${maxV}!`);
        if (getArtifactLevel("HOLY_AVENGER") > 0) {
          state.grid.forEach((t, i) => { if (t && t.val < 0) state.grid[i] = null; });
          addLog("✨ Holy Avenger cleansed all hazards!");
        }
        applyDamage(totalDmg);
        renderGrid(); renderHUD(); checkGameState();
      }, 300);
      break;

    case "divine":
      SFX.powerUp();
      playGridFx("divine", 0, 0);
      setTimeout(() => {
        let slidesRes = info.sum + 3 * getArtifactLevel("MOON_SICKLE");
        state.slidesLeft += slidesRes;
        addLog(`✨ Restored ${slidesRes} slides!`);
        let hIdx = state.grid.findIndex((t) => t && t.val < 0);
        if (hIdx !== -1) {
          state.grid[hIdx] = { id: tileIdCounter++, val: 2, pop: true };
          addLog("✨ Purified a hazard!");
        }
        renderGrid(); renderHUD(); checkGameState();
      }, 400);
      break;

    case "song":
      SFX.powerUp();
      playGridFx("song", 0, 0);
      setTimeout(() => {
        let lThump = getArtifactLevel("LUTE_THUNDER");
        if (lThump > 0) totalDmg *= (1 + 0.5 * lThump);
        state.grid.forEach((t, i) => {
          if (t && t.val < 0) {
            if (t.val === -1) state.grid[i] = null;
            else t.val += 1;
          }
        });
        addLog(`🎵 Weakened all hazards!`);
        applyDamage(totalDmg);
        renderGrid(); renderHUD(); checkGameState();
      }, 300);
      break;

    case "entangle":
      SFX.powerUp();
      playGridFx("entangle", 0, 0);
      setTimeout(() => {
        let slidesRes = info.sum + 3 * getArtifactLevel("MOON_SICKLE");
        state.slidesLeft += slidesRes;
        addLog(`🌿 Restored ${slidesRes} slides!`);
        let hz = state.grid.map((t, i) => ({t, i})).filter(x => x.t && x.t.val < 0);
        if (hz.length > 0) {
          let target = hz[prngInt(0, hz.length - 1)].i;
          state.grid[target] = { id: tileIdCounter++, val: 2, pop: true };
          addLog("🌿 Entangled and purified a hazard!");
        }
        renderGrid(); renderHUD(); checkGameState();
      }, 300);
      break;

    case "blade_storm":
      SFX.hit();
      let cC = prngInt(0, 3);
      playGridFx("blade_storm", 0, cC);
      setTimeout(() => {
        for (let r = 0; r < 4; r++) {
          let idx = r * 4 + cC;
          if (state.grid[idx] && state.grid[idx].val < 0) state.grid[idx] = null;
        }
        applyDamage(totalDmg);
        renderGrid(); renderHUD(); checkGameState();
      }, 300);
      break;

    case "ki_strike":
      SFX.hit();
      playGridFx("ki_strike", 0, 0);
      setTimeout(() => {
        for (let k = 0; k < 4; k++) {
          let idx = prngInt(0, 15);
          if (state.grid[idx] && state.grid[idx].val < 0) state.grid[idx] = null;
        }
        applyDamage(totalDmg);
        renderGrid(); renderHUD(); checkGameState();
      }, 300);
      break;

    case "hunter_mark":
      SFX.powerUp();
      playGridFx("hunter_mark", 0, 0);
      setTimeout(() => {
        let dur = 3 + 2 * getArtifactLevel("QUIVER_PLENTY");
        state.hunterMarkLeft = dur;
        addLog(`🏹 Marked the boss for ${dur} merges!`);
        applyDamage(totalDmg);
        renderGrid(); renderHUD(); checkGameState();
      }, 300);
      break;

    case "chaos":
      SFX.explosion();
      playGridFx("chaos", 0, 0);
      setTimeout(() => {
        let effect = prngInt(0, 3);
        if (getArtifactLevel("STAFF_POWER") > 0) effect = 0;
        if (effect === 0) {
          totalDmg *= 3;
          addLog("🌀 Chaos: Triple Damage!");
          applyDamage(totalDmg);
        } else if (effect === 1) {
          state.slidesLeft += 15;
          addLog("🌀 Chaos: +15 Slides!");
          applyDamage(totalDmg);
        } else if (effect === 2) {
          let empty = state.grid.findIndex(t => t === null);
          if (empty !== -1) state.grid[empty] = { id: tileIdCounter++, val: 16, pop: true };
          addLog("🌀 Chaos: Spawned a Battleaxe!");
          applyDamage(totalDmg);
        } else {
          state.multiplier += 1.0;
          addLog("🌀 Chaos: +1.0 Multiplier this turn!");
          applyDamage(totalDmg);
        }
        renderGrid(); renderHUD(); checkGameState();
      }, 300);
      break;

    default:
      applyDamage(totalDmg);
      renderGrid(); renderHUD(); checkGameState();
      break;
  }
  state.currentAttackInfo = null;
}
