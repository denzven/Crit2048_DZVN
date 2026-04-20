
<div align="center">

# ⚔️ CRIT 2048 ⚔️

### *The Roguelike Dungeon Crawler wrapped inside a sliding tile puzzle*

[![License: GPL-3.0](https://img.shields.io/badge/License-GPL--3.0-crimson?style=for-the-badge)](LICENSE)
[![Stack: Vanilla JS](https://img.shields.io/badge/Stack-Vanilla%20JS-f7df1e?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![3D Dice: Three.js](https://img.shields.io/badge/3D%20Dice-Three.js-black?style=for-the-badge&logo=threedotjs)](https://threejs.org/)
[![Inspired by: Balatro × D&D 5e](https://img.shields.io/badge/Inspired%20by-Balatro%20%C3%97%20D%26D%205e-8b5cf6?style=for-the-badge)](https://www.dndbeyond.com/)

> *"Every slide is a swing. Every merge is a kill. Roll the d20 — and pray."*

</div>

---

## 🎲 What is Crit 2048?

**Crit 2048** is a **roguelike dungeon crawler** built on the foundation of the classic 2048 sliding puzzle. Instead of chasing a number, you are a **D&D adventurer** fighting your way through a six-boss dungeon with nothing but your wits, a 4×4 grid of weapons, and a twenty-sided die.

Inspired by the **deck-building chaos of Balatro** and the **tactical depth of D&D 5e (2024 edition)**, every run is shaped by class selection, artifact acquisitions, critical hit luck, and boss abilities that actively work against you. No two runs are the same. No run is safe.

---

## 🗺️ Core Concept

The 2048 grid is your **battlefield**. Tiles represent weapons — sliding two matching weapons together **merges** them into a more powerful weapon and deals **damage** to the boss. When the boss hits zero HP, you advance. If your slides run out first, the dungeon claims your soul.

```
Dagger (2) + Dagger (2)   = Longsword  (4)    →  8 dmg
Longsword  + Longsword    = Crossbow   (8)    →  20 dmg
Crossbow   + Crossbow     = Battleaxe  (16)   →  50 dmg
Battleaxe  + Battleaxe    = Magic Staff(32)   →  120 dmg
Magic Staff + Magic Staff = Holy Sword (64)   →  300 dmg
Holy Sword + Holy Sword   = Relic      (128+) →  val × 10 dmg
```

Every merge deals `weapon_base_dmg × your_multiplier` damage. The multiplier is the engine that makes everything scale — build it up, and a single merge can delete an Ancient Dragon.

---

## 🧬 Game Loop

```
START → CLASS SELECT → ENCOUNTER (Ante 1–6) → TAVERN → → → FINAL BOSS (Ante 6) → VICTORY
                                    ↑                     ↓
                               [D20 Roll]           [Buy Artifacts]
                                    ↑                     ↓
                               [Spell Cast]          [Upgrade Spells]
```

1. **Choose your Class** — each class changes your modifiers, gold generation, and grants a unique spell.
2. **Fight the Boss** — slide tiles on the grid to merge weapons and deal damage. You have a limited number of slides per boss (the "Ante").
3. **Roll the D20** — every 5 slides, you are interrupted by a mandatory D20 roll. The outcome can be devastating or divine.
4. **Use your Spell** — if your class has one, activate it anytime during combat.
5. **Visit the Tavern** — after each boss kill, spend gold on artifacts that permanently alter your run.
6. **Descend** — repeat until you conquer all 6 bosses, or the grid locks.

---

## 🛡️ Classes

Each class is built around one D&D 5e archetype and plays distinctly differently:

| Icon | Class | D20 Mod | Passive Ability | Class Spell |
|------|-------|---------|-----------------|-------------|
| 😡 | **Barbarian** | −1 | +10 damage to Dagger & Longsword merges (T1 & T2) | — |
| 🥷 | **Rogue** | +2 | +1 Gold per every merge | — |
| 🧙‍♂️ | **Wizard** | +1 | — | **Fireball** — Roll 1d6 × Mult. Burns a 2×2 tile zone. |
| 👁️ | **Warlock** | +1 | — | **Eldritch Blast** — Roll 1d10 × Mult. Clears an entire row of hazard tiles. |
| ✨ | **Cleric** | 0 | — | **Divine Aid** — Roll 1d8. Restores that many slides. Purifies one hazard tile. |
| 🛡️ | **Paladin** | 0 | — | **Divine Smite** — Roll 1d8 × your highest weapon tile. Enormous spike damage. |

### Class Spell Details

- **Spells have limited uses per Ante** (Warlock gets 3; others get 1–2)
- **Spells can be upgraded** in the Tavern (costs 100g × current rank): each upgrade adds +1 die to the roll (e.g., `1d10` → `2d10` → `3d10`)
- **Spell uses can be restored** in the Tavern for **30 gold**
- Spells launch the **3D dice engine** with the appropriate die type displayed in a full-screen modal

---

## 🐉 The Six Bosses (Antas)

| Ante | Boss | HP | Slides | Special Power |
|------|------|----|--------|---------------|
| 1 | 👺 **Goblin Scout** | 150 | 25 | **Ambush** — Spawns a Goblin tile every 12 slides. Goblins steal gold on contact. |
| 2 | 👹 **Orc Brute** | 500 | 30 | **Tough** — All damage you deal is reduced by 10%. |
| 3 | 🟢 **Slime King** | 1,200 | 35 | **Ooze** — Spawns a Slime tile every 8 slides, clogging your grid. |
| 4 | 🧌 **Troll King** | 3,500 | 40 | **Regen** — Heals 30 HP after every single slide you make. |
| 5 | 💀 **The Lich** | 8,000 | 30* | **Necromancy** — Spawns a Skeleton every 12 slides AND starts with 10 fewer slides. |
| 6 | 🐉 **Ancient Dragon** | 20,000 | 45 | **Inferno** — Burns (deletes) your highest-value weapon tile every 10 slides. |

> *The Lich reduces your starting slides from 40 → 30, making it one of the most punishing encounters in the dungeon.*

### Hazard Tiles

Bosses don't just have high HP — they deploy **tile hazards** onto your grid:

| Tile | Name | Mechanic |
|------|------|----------|
| 🟢 | Slime | Blocks merges. Cleared if you deal ≥100 damage in one move. |
| 👺 | Goblin | Steals 1 gold per tile per slide. Cleared if you deal ≥50 damage. |
| 💀 | Skeleton | Blocks merges. Raised by The Lich. |

---

## 🎲 The D20 System

The D20 is the heartbeat of **Crit 2048**'s roguelike identity. Every **5 slides**, the game pauses for a mandatory D20 roll — rendered as a fully animated **3D physics-based die** using Three.js.

```
┌─────────────────────────────────────────────────────────────────┐
│  Roll Result       │   Outcome                                  │
│────────────────────│────────────────────────────────────────────│
│  20+ (Nat 20)      │  CRITICAL HIT — Mult +1 & upgrade a tile   │
│  10–19 (Success)   │  SUCCESS — A Crossbow tile spawns           │
│  2–9 (Miss)        │  MISS — A Slime tiles spawns               │
│  1 (Nat 1)         │  CRITICAL FAILURE — Your best weapon breaks │
└─────────────────────────────────────────────────────────────────┘
```

Your **class modifier** applies to every roll:
- Rogue gets +2 (consistently succeeds), Barbarian gets −1 (lives dangerously)
- The **Weighted Dice artifact** sets a minimum roll floor

The D20 sequences are determined by a **seeded PRNG** — meaning runs are fully **reproducible** by entering the same seed.

---

## 🏺 The Tavern (Between-Boss Shop)

After defeating each boss (except the last), you are transported to the **Tavern** — a shop where you spend your hard-earned gold on magical artifacts. The shop randomly offers **4 items** from the master pool (class-specific items appear only for the right class).

Artifacts are **upgradeable** — buying the same artifact again increases its level and potency (at an increasing price).

### Artifact Catalog

| Icon | Artifact | Rarity | Effect (Scales per Level) |
|------|----------|--------|---------------------------|
| 🎲 | **Weighted Dice** | Rare | D20 rolls below `4+lvl` are automatically raised to `4+lvl`. Floor protection. |
| 🎯 | **Assassin's Mark** | Epic | *(Rogue only)* Each Dagger merge grants +0.1 Mult permanently. |
| 🥾 | **Gravity Boots** | Common | Sliding DOWN deals `1+0.5×lvl` damage multiplier. Sliding UP deals 0.5×. |
| 📖 | **Necronomicon** | Legendary | Slime spawns backfire — each Slime tile deals `50×lvl` damage to the boss. |
| 💍 | **Ring of Wealth** | Rare | Enter the Tavern with `30×lvl` bonus gold. |
| ⚡ | **Boots of Haste** | Epic | Gain `3×lvl` extra slides at the start of every Ante. |
| 🧪 | **Giant's Potion** | Rare | Permanently raises your base multiplier by `+0.3×lvl`. Applied immediately. |
| 🔪 | **Vorpal Edge** | Legendary | 2% chance per slide to deal `200×lvl` True Damage (ignores all reductions). |

### Tavern Services

| Service | Gold Cost | Effect |
|---------|-----------|--------|
| **Buy Artifact** | Varies by rarity | Purchase a new artifact or upgrade an existing one |
| **Upgrade Spell** | 100g × current rank | Add +1 die to your class spell (e.g. 1d10 → 2d10) |
| **Restore Spell Uses** | 30g | Refill your class spell to max uses |
| **☯️ Gemini Oracle** | 50g | AI-generated legendary artifact with +1.0 Mult bonus |

---

## 🤖 The Gemini Oracle

A unique feature powered by **Google's Gemini AI**. Spend 50 gold in the Tavern to consult the Oracle — it generates a **one-of-a-kind, flavor-rich legendary artifact** with a custom name and description, tailored to your current class and progress. The artifact rewards **+1.0 multiplier** on top of its narrative effects.

```json
{ "name": "Chalice of the Fallen Paladin", "desc": "An ancient goblet that weeps silver tears. Grants +1.0 Multiplier." }
```

> Requires a Gemini API key set in `js/config.js`.

---

## 🎰 The Multiplier — Balatro's Influence

The **Multiplier** is **Crit 2048's** direct homage to Balatro's chip × mult scoring system. Every point of damage is calculated as:

```
damage = weapon_base_damage × multiplier
```

The multiplier starts at 1.0× and is amplified by:

| Source | Gain |
|--------|------|
| D20 Critical Hit | +1.0 |
| Assassin's Mark (Rogue) | +0.1 per Dagger merge |
| Giant's Potion (artifact) | +0.3 per level |
| Gemini Oracle | +1.0 |

A late-game multiplier of 5×–8× transforms a basic Dagger merge into a significant hit. Landing a Nat 20 at the right moment can completely turn the tide of a dungeon fight.

---

## 🎬 3D Physics Dice Engine

All dice in Crit 2048 — from the D20 to class spell rolls — are rendered using a fully custom **Three.js physics simulation**:

- **Dice types**: d6, d8, d10, d20 rendered with accurate geometry (Box, Octahedron, Icosahedron)
- **Physics**: Gravity, bounce, wall collisions, friction, and angular velocity — all simulated per-frame
- **Deterministic**: Outcome is pre-seeded by the PRNG then animated. The die **always lands on the correct face**.
- **Face alignment**: After physics settle, dice perform a cinematic "float up" animation with `slerp` quaternion rotation to face the camera perfectly upright
- **Toon shading**: `MeshToonMaterial` with Canvas-generated face textures gives a stylized, cel-shaded tabletop aesthetic
- **Themes**: 4 visual themes — `default`, `blood`, `bone`, `neon` — selectable in settings

---

## 🔊 Sound & Feel

Crit 2048 is built with micro-feedback at every interaction point:

- 🎵 Tile slide, merge, critical hit, dice clatter, coin, explosion, beam, smite, power-up SFX
- 📳 **Screen shake** on damage, critical hits, and spell casts (adjustable in settings)
- ✨ **Grid visual effects** — Fireball (AoE zone glow), Eldritch Beam (row sweep), Divine Light (screen-wide)
- 🏆 **Battle Log** — A live scrolling terminal-style log of every dungeon event

---

## 🌱 Seeded Runs (Speedrunner-Friendly)

Every random event — tile spawns, D20 rolls, hazard spawns, shop selection — is driven by a **Mulberry32 seeded PRNG**. Enter the same seed at the start screen to get a **100% reproducible run**, enabling:

- Seed sharing between players
- Challenge runs and community seeds
- Consistent performance comparison

---

## 📊 Run Statistics

At the end of every run (win or loss) the game displays:

| Stat | Description |
|------|-------------|
| **Class** | The class you played |
| **Ante Reached** | How deep into the dungeon you got |
| **Max Single Damage** | The biggest single-move damage you dealt |
| **Total Merges** | Total number of tile combinations performed |
| **Seed** | The seed used for this run |

---

## 🗂️ Project Architecture

Crit 2048 is built as a **modular Vanilla JS** application with ES-style separation of concerns. All modules are loaded as classic scripts in dependency order.

```
Crit2048/
├── index.html          # Single-page HTML shell, Tailwind utility classes, all DOM structure
├── css/
│   └── main.css        # Core CSS variables, animations, grid layout, custom effects
└── js/
    ├── config.js       # API key, game constants, dice theme definitions
    ├── prng.js         # Mulberry32 seeded PRNG implementation
    ├── state.js        # Central mutable game state object
    ├── data.js         # CLASSES, ENCOUNTERS, MASTER_ARTIFACTS, weapon/rarity helpers
    ├── sfx.js          # Web Audio API sound effects engine
    ├── dice.js         # Three.js 3D physics dice renderer (FixedDiceEngine)
    ├── grid.js         # Grid mutation: spawnRandomTile, checkGridlock
    ├── ui.js           # Rendering: renderHUD, renderGrid, renderSidebar, visual FX
    ├── combat.js       # processMove, applyDamage, applyBossPowersPostMove
    ├── d20.js          # D20 roll flow, processD20Result, outcome branching
    ├── spells.js       # useClassAbility, executeAttackRoll, resolveAttack
    ├── tavern.js       # generateShop, renderTavern, buyArtifact, nextEncounter
    ├── modals.js       # Help overlay, settings, confirm-home dialog
    ├── api.js          # Gemini API integration (Oracle)
    └── main.js         # Game bootstrap, state machine, input handling (keyboard + touch)
```

---

## 🚀 Getting Started

### Play Instantly

Open `index.html` directly in any modern browser. **No build step required.**

> ⚠️ The Gemini Oracle feature requires a free API key from [Google AI Studio](https://aistudio.google.com/). Paste it into `js/config.js` on line 2.

### Config Options (`js/config.js`)

```js
const config = {
  turnsBeforeDice: 5,   // Slides between mandatory D20 rolls
  startingGold:    0,   // Gold you begin each run with
  sfxVolume:       1.0, // 0.0 → 1.0
  screenShake:     1.0, // 0.0 = off, 1.0 = full
  diceTheme:       'default' // 'default' | 'blood' | 'bone' | 'neon'
};
```

### Controls

| Input | Action |
|-------|--------|
| `←` `→` `↑` `↓` Arrow Keys | Slide all tiles in that direction |
| Touch Swipe | Slide in swipe direction (mobile) |
| **ROLL D20** button | Trigger the D20 roll (when prompted) |
| **⚡ Spell** button | Activate class ability (when available) |

---

## 🧠 Strategy Tips

> "Rolling a Nat 20 when your Multiplier is already at 6× and you have a Paladin Smite in reserve... that's the dream."

- 🥷 **Rogue** scales hardest in long runs — every merge generates gold and Multiplier if you have Assassin's Mark.
- 🛡️ **Paladin** is the single-turn burst king. Save Divine Smite for the moment a Holy Sword tile lands on the board.
- 📖 **Necronomicon** completely flips the Slime King fight — every Slime the boss spawns deals 50+ damage *to itself*.
- ⚡ **Boots of Haste** are nearly always worth buying — the Lich fight especially benefits from the extra slides.
- 🥾 **Gravity Boots** reward building a "downward sweep" strategy. Aim to merge exclusively on DOWN slides for 1.5× damage.
- 🎲 **Weighted Dice** is a defensive anchor — ensuring you never nat-1 and lose your best weapon at a critical moment.
- 🐉 Against the **Ancient Dragon**, prioritize merging quickly. The Inferno burns your highest tile every 10 slides — never let a Holy Sword sit idle.

---

## 🛠️ Tech Stack

| Technology | Role |
|------------|------|
| **HTML5 / Vanilla JS** | Core game engine & UI rendering |
| **Tailwind CSS** (CDN) | Utility classes for layout and styling |
| **Three.js** (CDN) | 3D dice physics renderer (`MeshToonMaterial`, orthographic camera) |
| **Web Audio API** | Procedural sound effects (no audio files needed) |
| **Gemini 2.5 Flash** | AI Oracle artifact generation |
| **Mulberry32 PRNG** | Seedable pseudo-random number generator |

---

## 📜 License

This project is licensed under the **GNU General Public License v3.0**. See the [LICENSE](LICENSE) file for details.

---

<div align="center">

*Built with equal parts dice rolls, merges, and chaos. May your multiplier be high and your Nat 1s be few.*

**⚔️ Roll for initiative. ⚔️**

</div>
