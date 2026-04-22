// --- CORE GAME LOGIC ---
function processMove(direction) {
  if (state.gameState !== "PLAYING" || state.isRolling) return;
  let newGrid = [...state.grid];
  let changed = false,
    damageThisTurn = 0,
    goldEarnedThisTurn = 0,
    multIncrease = 0;

  const processLine = (lineIndices) => {
    let line = lineIndices.map((i) => newGrid[i]).filter((v) => v !== null);
    let combined = [];
    for (let i = 0; i < line.length; i++) {
      if (
        i < line.length - 1 &&
        line[i].val > 0 &&
        line[i].val === line[i + 1].val
      ) {
        let tA = line[i],
          tB = line[i + 1],
          newVal = tA.val * 2;
        combined.push({ id: tA.id, val: newVal, pop: true });
        state.runStats.totalMerges++;

        let tB_el = document.getElementById(`tile-${tB.id}`);
        if (tB_el) {
          let tIdx = lineIndices[combined.length - 1];
          tB_el.style.left = `calc(var(--cell-size) * ${tIdx % 4} + var(--gap) * ${tIdx % 4})`;
          tB_el.style.top = `calc(var(--cell-size) * ${Math.floor(tIdx / 4)} + var(--gap) * ${Math.floor(tIdx / 4)})`;
          tB_el.style.zIndex = "5";
        }

        let baseDmg = getWeaponStats(newVal).dmg;
        if (
          state.playerClass.id === "Barbarian" &&
          (newVal === 4 || newVal === 8)
        )
          baseDmg += 10;

        let dirMult = 1;
        const bootsLvl = getArtifactLevel("GRAVITY_BOOTS");
        if (bootsLvl > 0) {
          if (direction === "DOWN") dirMult = 1 + 0.5 * bootsLvl;
          else if (direction === "UP") dirMult = 0.5;
        }

        damageThisTurn += baseDmg * state.multiplier * dirMult;
        if (state.playerClass.id === "Rogue") goldEarnedThisTurn += 1;
        const assLvl = getArtifactLevel("ASSASSIN_MARK");
        if (assLvl > 0 && newVal === 4) multIncrease += 0.1 * assLvl;
        i++;
      } else {
        combined.push(line[i]);
      }
    }
    while (combined.length < 4) combined.push(null);
    for (let i = 0; i < 4; i++) {
      if (
        newGrid[lineIndices[i]]?.id !== combined[i]?.id ||
        newGrid[lineIndices[i]]?.val !== combined[i]?.val
      )
        changed = true;
      newGrid[lineIndices[i]] = combined[i];
    }
  };

  if (direction === "LEFT") {
    for (let r = 0; r < 4; r++)
      processLine([r * 4, r * 4 + 1, r * 4 + 2, r * 4 + 3]);
  } else if (direction === "RIGHT") {
    for (let r = 0; r < 4; r++)
      processLine([r * 4 + 3, r * 4 + 2, r * 4 + 1, r * 4]);
  } else if (direction === "UP") {
    for (let c = 0; c < 4; c++) processLine([c, c + 4, c + 8, c + 12]);
  } else if (direction === "DOWN") {
    for (let c = 0; c < 4; c++) processLine([c + 12, c + 8, c + 4, c]);
  }

  if (!changed) return;
  SFX.slide();

  let goblinCount = newGrid.filter((t) => t && t.val === -2).length;
  if (goblinCount > 0) {
    let stolen = Math.min(state.gold, goblinCount);
    if (stolen > 0) {
      state.gold -= stolen;
      addLog(`👺 Goblins stole ${stolen} gold!`);
    }
  }

  const vorpalLvl = getArtifactLevel("VORPAL_BLADE");
  if (
    vorpalLvl > 0 &&
    state.encounterIdx < ENCOUNTERS.length - 1 &&
    prng() < 0.02
  ) {
    damageThisTurn += 200 * vorpalLvl;
    addLog("⚔️ VORPAL STRIKE!");
  }
  if (ENCOUNTERS[state.encounterIdx].name === "Orc Brute")
    damageThisTurn *= 0.9;

  if (damageThisTurn > 0) {
    SFX.merge();
    applyDamage(damageThisTurn);
  }
  if (goldEarnedThisTurn > 0) state.gold += goldEarnedThisTurn;
  if (multIncrease > 0) state.multiplier += multIncrease;

  if (damageThisTurn >= 100) {
    let cleared = false;
    newGrid = newGrid.map((c) => {
      if (c && c.val === -1) {
        cleared = true;
        return null;
      }
      return c;
    });
    if (cleared) addLog(`🟢 Slimes obliterated!`);
  }
  if (damageThisTurn >= 50) {
    let cleared = false;
    newGrid = newGrid.map((c) => {
      if (c && c.val === -2) {
        cleared = true;
        return null;
      }
      return c;
    });
    if (cleared) addLog(`👺 Goblins cleared!`);
  }

  state.grid = newGrid;
  spawnRandomTile();
  state.slidesLeft -= 1;
  state.slidesSinceRoll += 1;
  state.slidesTotalInEncounter += 1;
  applyBossPowersPostMove();
  checkGameState();
}

function applyDamage(dmg) {
  if (dmg > state.runStats.maxDamage) state.runStats.maxDamage = dmg;
  state.monsterHp = Math.max(0, state.monsterHp - dmg);
  addLog(`Dealt ${Math.floor(dmg)} dmg!`);
  SFX.hit();
  triggerScreenShake();
}

function applyBossPowersPostMove() {
  const enc = ENCOUNTERS[state.encounterIdx];
  if (enc.name === "Troll King" && state.monsterHp > 0)
    state.monsterHp = Math.min(state.monsterMaxHp, state.monsterHp + 30);
  if (enc.name === "Slime King" && state.slidesTotalInEncounter % 8 === 0) {
    addLog("Boss Power: Slime spawned!");
    spawnRandomTile(-1);
  }
  if (enc.name === "Goblin Scout" && state.slidesTotalInEncounter % 12 === 0) {
    addLog("Ambush: Goblin spawned!");
    spawnRandomTile(-2);
  }
  if (enc.name === "The Lich" && state.slidesTotalInEncounter % 12 === 0) {
    addLog("Necromancy: Skeleton raised!");
    spawnRandomTile(-3);
  }
  if (
    enc.name === "Ancient Dragon" &&
    state.slidesTotalInEncounter % 10 === 0
  ) {
    let maxV = 0,
      maxI = -1;
    state.grid.forEach((c, i) => {
      if (c && c.val > maxV) {
        maxV = c.val;
        maxI = i;
      }
    });
    if (maxI !== -1) {
      state.grid[maxI] = null;
      addLog("Boss Power: Inferno burned highest weapon!");
    }
  }
}
