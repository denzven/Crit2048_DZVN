// --- GRID RENDERING & TILE MANAGEMENT ---
function spawnRandomTile(valOverride = null) {
  const emptyIndices = state.grid
    .map((v, i) => (v === null ? i : null))
    .filter((v) => v !== null);
  if (emptyIndices.length > 0) {
    const rIdx = emptyIndices[prngInt(0, emptyIndices.length - 1)];
    const val = valOverride !== null ? valOverride : prng() > 0.9 ? 4 : 2;
    state.grid[rIdx] = { id: tileIdCounter++, val: val, pop: true };
  }
}

function renderGrid() {
  const activeIds = new Set();
  state.grid.forEach((tile, idx) => {
    if (!tile) return;
    activeIds.add(tile.id);
    let r = Math.floor(idx / 4),
      c = idx % 4;
    let tileEl = document.getElementById(`tile-${tile.id}`);
    if (!tileEl) {
      tileEl = document.createElement("div");
      tileEl.id = `tile-${tile.id}`;
      el.tilesLayer.appendChild(tileEl);
    }
    const stats = getWeaponStats(tile.val);
    tileEl.className = `tile shadow-inner ${stats.bg} ${stats.text}`;
    tileEl.style.left = `calc(var(--cell-size) * ${c} + var(--gap) * ${c})`;
    tileEl.style.top = `calc(var(--cell-size) * ${r} + var(--gap) * ${r})`;
    tileEl.style.zIndex = "10";
    tileEl.style.opacity = "1";
    tileEl.style.transform = "scale(1)";
    tileEl.innerHTML =
      `<span class="text-2xl md:text-3xl">${stats.icon}</span>` +
      (stats.val !== -1 && stats.val !== -2 && stats.val !== -3
        ? `<span class="font-bold text-sm mt-1">${tile.val}</span>`
        : "");
    if (tile.pop) {
      tileEl.classList.remove("pop-in");
      void tileEl.offsetWidth;
      tileEl.classList.add("pop-in");
      tile.pop = false;
    }
  });

  Array.from(el.tilesLayer.children).forEach((child) => {
    const id = parseInt(child.id.replace("tile-", ""));
    if (
      !activeIds.has(id) &&
      child.dataset.dying !== "true" &&
      !child.classList.contains("fx-fireball") &&
      !child.classList.contains("fx-beam") &&
      !child.classList.contains("fx-smite") &&
      !child.classList.contains("fx-divine") &&
      !child.classList.contains("fx-song") &&
      !child.classList.contains("fx-entangle") &&
      !child.classList.contains("fx-blade_storm") &&
      !child.classList.contains("fx-ki_strike") &&
      !child.classList.contains("fx-hunter_mark") &&
      !child.classList.contains("fx-chaos")
    ) {
      child.dataset.dying = "true";
      setTimeout(() => {
        child.style.opacity = "0";
        setTimeout(() => {
          if (child.parentNode) child.remove();
        }, 100);
      }, 80);
    }
  });
}

function triggerScreenShake() {
  if (config.screenShake <= 0) return;
  if (window.Plugins) window.Plugins.vibrate('impactHeavy');
  el.mainContainer.classList.remove("shake");
  void el.mainContainer.offsetWidth;
  el.mainContainer.classList.add("shake");
  setTimeout(() => el.mainContainer.classList.remove("shake"), 400);
}

function playGridFx(type, r, c) {
  const fx = document.createElement("div");
  const size = `var(--cell-size)`;
  const gap = `var(--gap)`;

  if (type === "fireball") {
    fx.className = "fx-fireball";
    fx.style.width = `calc((${size} * 2) + ${gap})`;
    fx.style.height = `calc((${size} * 2) + ${gap})`;
    fx.style.left = `calc((${size} * ${c}) + (${gap} * ${c}))`;
    fx.style.top = `calc((${size} * ${r}) + (${gap} * ${r}))`;
    el.gridContainer.appendChild(fx);
    setTimeout(() => {
      if (fx.parentNode) fx.remove();
    }, 600);
  } else if (type === "beam") {
    fx.className = "fx-beam";
    fx.style.height = size;
    fx.style.top = `calc((${size} * ${r}) + (${gap} * ${r}))`;
    fx.style.left = "2%";
    fx.style.width = "96%";
    el.gridContainer.appendChild(fx);
    setTimeout(() => {
      if (fx.parentNode) fx.remove();
    }, 500);
  } else if (type === "smite") {
    fx.className = "fx-smite";
    fx.style.width = size;
    fx.style.height = `calc((${size} * 4) + (${gap} * 3))`;
    fx.style.left = `calc((${size} * ${c}) + (${gap} * ${c}))`;
    fx.style.top = "2%";
    el.gridContainer.appendChild(fx);
    setTimeout(() => {
      if (fx.parentNode) fx.remove();
    }, 600);
  } else if (type === "divine") {
    fx.className = "fx-divine";
    el.gridContainer.appendChild(fx);
    setTimeout(() => {
      if (fx.parentNode) fx.remove();
    }, 800);
  } else if (type === "song") {
    fx.className = "fx-song";
    el.gridContainer.appendChild(fx);
    setTimeout(() => { if (fx.parentNode) fx.remove(); }, 800);
  } else if (type === "entangle") {
    fx.className = "fx-entangle";
    el.gridContainer.appendChild(fx);
    setTimeout(() => { if (fx.parentNode) fx.remove(); }, 800);
  } else if (type === "blade_storm") {
    fx.className = "fx-blade_storm";
    fx.style.width = size;
    fx.style.height = `calc((${size} * 4) + (${gap} * 3))`;
    fx.style.left = `calc((${size} * ${c}) + (${gap} * ${c}))`;
    fx.style.top = "2%";
    el.gridContainer.appendChild(fx);
    setTimeout(() => { if (fx.parentNode) fx.remove(); }, 600);
  } else if (type === "ki_strike") {
    fx.className = "fx-ki_strike";
    el.gridContainer.appendChild(fx);
    setTimeout(() => { if (fx.parentNode) fx.remove(); }, 500);
  } else if (type === "hunter_mark") {
    fx.className = "fx-hunter_mark";
    el.gridContainer.appendChild(fx);
    setTimeout(() => { if (fx.parentNode) fx.remove(); }, 800);
  } else if (type === "chaos") {
    fx.className = "fx-chaos";
    el.gridContainer.appendChild(fx);
    setTimeout(() => { if (fx.parentNode) fx.remove(); }, 800);
  }
}

function checkGridlock() {
  if (state.grid.some((t) => t === null)) return false;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 3; c++) {
      let i1 = r * 4 + c,
        i2 = r * 4 + c + 1;
      if (state.grid[i1].val > 0 && state.grid[i1].val === state.grid[i2].val)
        return false;
    }
  }
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 3; r++) {
      let i1 = r * 4 + c,
        i2 = (r + 1) * 4 + c;
      if (state.grid[i1].val > 0 && state.grid[i1].val === state.grid[i2].val)
        return false;
    }
  }
  return true;
}
