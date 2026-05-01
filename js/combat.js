// --- CORE GAME LOGIC ---
function processMove(direction) {
  // Prevent moves during transitions or after game-over is detected (race condition guard)
  if (state.gameState !== "PLAYING" || state.isRolling || state.isGameOver || state.isTransitioning) return;
  state.runStats.totalMoves++;
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
        combined.push({ id: tA.id, val: newVal, pop: true, merged: true });
        state.runStats.totalMerges++;
        state.runStats.mergeCounts[newVal] = (state.runStats.mergeCounts[newVal] || 0) + 1;
        if (state.runStats.mergeCounts[newVal] > (state.runStats.mergeCounts[state.runStats.mostMergedVal] || 0)) {
          state.runStats.mostMergedVal = newVal;
        }
        if (newVal > state.runStats.highestTileValue) state.runStats.highestTileValue = newVal;
        if (window.Plugins) window.Plugins.vibrate('impactMedium');
        if (window.PackEngine) window.PackEngine.onMerge(state, newVal);

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
        if (state.playerClass.id === "Fighter" && newVal >= 8) baseDmg += 15;

        let dirMult = 1;
        const bootsLvl = getArtifactLevel("GRAVITY_BOOTS");
        if (bootsLvl > 0) {
          if (direction === "DOWN") dirMult = 1 + 0.5 * bootsLvl;
          else if (direction === "UP") dirMult = 0.5;
        }

        let dmgForThisMerge = baseDmg * state.multiplier * dirMult;
        if (state.playerClass.id === "Ranger" && ENCOUNTERS[state.encounterIdx].power.toLowerCase().includes("spawn")) {
          dmgForThisMerge *= 1.25;
        }
        if (state.hunterMarkLeft > 0) {
          dmgForThisMerge *= 2;
          state.hunterMarkLeft--;
        }

        damageThisTurn += dmgForThisMerge;
        
        // Show individual damage text
        const tIdx = lineIndices[combined.length - 1];
        const r = Math.floor(tIdx / 4), c = tIdx % 4;
        const posX = `calc(var(--cell-size) * ${c} + var(--gap) * ${c} + var(--cell-size) * 0.5)`;
        const posY = `calc(var(--cell-size) * ${r} + var(--gap) * ${r} + var(--cell-size) * 0.5)`;
        playCombatText(`-${Math.floor(dmgForThisMerge)}`, "text-white", posX, posY);

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

  if (!changed) {
    triggerGridBump();
    return;
  }
  SFX.slide();
  if (window.Plugins) window.Plugins.vibrate('selection');

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
    state.runStats.lastRoundDamage = damageThisTurn;
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
    if (cleared) {
      addLog(`🟢 Slimes obliterated!`);
      state.runStats.totalHazardsCleared++;
    }
  }
  if (damageThisTurn >= 75) {
    let cleared = false;
    newGrid = newGrid.map((c) => {
      if (c && c.val === -5) {
        cleared = true;
        return null;
      }
      return c;
    });
    if (cleared) {
      addLog(`🕸️ Web cleared!`);
      state.runStats.totalHazardsCleared++;
    }
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
    if (cleared) {
      addLog(`👺 Goblins cleared!`);
      state.runStats.totalHazardsCleared++;
    }
  }

  state.grid = newGrid;

  if (state.playerClass.id === "Monk") {
    if (state.lastDirection && state.lastDirection !== direction) {
      multIncrease += 0.1;
    }
    state.lastDirection = direction;
  }
  if (state.playerClass.id === "Druid" && prng() < 0.2) {
    let hzIdx = state.grid.findIndex(t => t && t.val < 0);
    if (hzIdx !== -1) {
      state.grid[hzIdx] = null;
      addLog("🌿 Druid purified a hazard naturally!");
    }
  }

  if (state.grid.some(t => t && t.val === -6)) {
    state.slidesLeft -= 1;
    addLog("🔮 Curse drained 1 extra slide!");
  }

  spawnRandomTile();
  state.slidesLeft -= 1;
  state.slidesSinceRoll += 1;
  state.slidesTotalInEncounter += 1;
  applyBossPowersPostMove();
  checkGameState();
}

function applyDamage(dmg) {
  if (dmg > state.runStats.maxDamage) state.runStats.maxDamage = dmg;
  state.runStats.totalDamageDealt += dmg;
  if (state.multiplier > state.runStats.maxMultiplier) state.runStats.maxMultiplier = state.multiplier;
  state.monsterHp = Math.max(0, state.monsterHp - dmg);
  addLog(`Dealt ${Math.floor(dmg)} dmg!`);
  // If damage is huge, show a special total text
  if (dmg > 500) {
    playCombatText(`TOTAL: ${Math.floor(dmg)}`, "text-amber-400 text-2xl md:text-4xl", "50%", "30%");
  }
  SFX.hit();
  triggerScreenShake(dmg > 300 ? 1.5 : 0.7);
  if (window.PackEngine) window.PackEngine.onDamage(state, dmg);
}

function applyBossPowersPostMove() {
  const enc = ENCOUNTERS[state.encounterIdx];
  if (enc.mode && enc.mode !== "builtin") {
    if (window.PackEngine) window.PackEngine.onSlide(state);
    return;
  }

  const applyPower = (powerName, chanceMult = 1.0) => {
    if (prng() > chanceMult) return;
    if (powerName.includes("Troll") && state.monsterHp > 0)
      state.monsterHp = Math.min(state.monsterMaxHp, state.monsterHp + 30);
    if (powerName.includes("Slime") && state.slidesTotalInEncounter % 8 === 0) {
      addLog("Boss Power: Slime spawned!");
      spawnRandomTile(-1);
    }
    if (powerName.includes("Goblin") && state.slidesTotalInEncounter % 12 === 0) {
      addLog("Ambush: Goblin spawned!");
      spawnRandomTile(-2);
    }
    if (powerName.includes("Mimic") && state.slidesTotalInEncounter % 10 === 0) {
      addLog("Shapechanger: Mimic spawned!");
      spawnRandomTile(-4);
    }
    if (powerName.includes("Mind") && state.slidesTotalInEncounter % 8 === 0) {
      addLog("Mind Blast: Tiles shuffled!");
      let filled = state.grid.map((t,i)=>({t,i})).filter(x=>x.t);
      for(let i=0; i<Math.min(4, filled.length); i++) {
        let i1 = prngInt(0, filled.length-1);
        let i2 = prngInt(0, filled.length-1);
        let temp = state.grid[filled[i1].i];
        state.grid[filled[i1].i] = state.grid[filled[i2].i];
        state.grid[filled[i2].i] = temp;
      }
    }
    if (powerName.includes("Lich") && state.slidesTotalInEncounter % 12 === 0) {
      addLog("Necromancy: Skeleton raised!");
      spawnRandomTile(-3);
    }
    if (powerName.includes("Beholder") && state.slidesTotalInEncounter % 10 === 0) {
      addLog("Eye Ray: Web spawned!");
      spawnRandomTile(-5);
    }
    if (powerName.includes("Vampire")) {
      state.monsterHp = Math.min(state.monsterMaxHp, state.monsterHp + 50);
      if (state.slidesTotalInEncounter % 15 === 0) {
        let maxV = 0, maxI = -1;
        state.grid.forEach((c, i) => { if (c && c.val > maxV) { maxV = c.val; maxI = i; } });
        if (maxI !== -1 && maxV > 2) {
          state.grid[maxI].val /= 2;
          addLog("Charm: Best weapon degraded!");
        }
      }
    }
    if (powerName.includes("Dragon") && state.slidesTotalInEncounter % 10 === 0) {
      let maxV = 0, maxI = -1;
      state.grid.forEach((c, i) => { if (c && c.val > maxV) { maxV = c.val; maxI = i; } });
      if (maxI !== -1) {
        state.grid[maxI] = null;
        addLog("Boss Power: Inferno burned highest weapon!");
      }
    }
  };

  if (enc.name === "Tiamat") {
    // 50% chance to apply ALL other boss powers
    ["Troll", "Slime", "Goblin", "Mimic", "Mind", "Lich", "Beholder", "Vampire", "Dragon"].forEach(n => applyPower(n, 0.5));
  } else {
    applyPower(enc.name, 1.0);
  }
}
