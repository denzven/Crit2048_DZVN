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
  
  if (window.PackEngine) {
    if (window.PackEngine.runPackSpell(state, ab, info.sum)) {
      state.currentAttackInfo = null;
      return; // Pack engine advanced scripts handle their own rendering via G.render()
    }
    // Fallback for simple packs if needed
    window.PackEngine.onSpellCast(state, ab ? ab.spellType : null);
  }

  // If no advanced script handled it, just deal damage
  applyDamage(totalDmg);
  renderGrid(); renderHUD(); checkGameState();
  state.currentAttackInfo = null;
}
