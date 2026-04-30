/**
 * update-version.js — Crit 2048 Version Synchronizer
 *
 * Updates the version string across all four files that need it:
 *   - package.json
 *   - src-tauri/tauri.conf.json
 *   - src-tauri/Cargo.toml
 *   - src-tauri/gen/android/app/tauri.properties (versionCode + versionName)
 *
 * Usage: node scripts/update-version.js <semver>
 * Example: node scripts/update-version.js 1.3.0
 */

const fs   = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

// ── Helpers ──────────────────────────────────────────────────────────────────

function semverToAndroidCode(semver) {
  // Convert "1.2.3" → 1002003 (standard Android versionCode convention)
  const parts = semver.split('.').map(Number);
  const major = parts[0] || 0;
  const minor = parts[1] || 0;
  const patch = parts[2] || 0;
  return major * 1000000 + minor * 1000 + patch;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, obj) {
  fs.writeFileSync(filePath, JSON.stringify(obj, null, 2) + '\n', 'utf8');
}

function patchToml(filePath, newVersion) {
  let content = fs.readFileSync(filePath, 'utf8');
  // Replace the version line inside [package] block only
  content = content.replace(/^version\s*=\s*"[^"]*"/m, `version = "${newVersion}"`);
  fs.writeFileSync(filePath, content, 'utf8');
}

function patchProperties(filePath, newVersion, newCode) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content
    .replace(/tauri\.android\.versionName\s*=\s*.*/,  `tauri.android.versionName=${newVersion}`)
    .replace(/tauri\.android\.versionCode\s*=\s*.*/,  `tauri.android.versionCode=${newCode}`);
  fs.writeFileSync(filePath, content, 'utf8');
}

// ── Entry ─────────────────────────────────────────────────────────────────────

const newVersion = process.argv[2];

if (!newVersion) {
  console.error('ERROR: No version provided.');
  console.error('Usage: node scripts/update-version.js <semver>');
  console.error('Example: node scripts/update-version.js 1.3.0');
  process.exit(1);
}

if (!/^\d+\.\d+\.\d+$/.test(newVersion)) {
  console.error(`ERROR: Version "${newVersion}" is not valid semver (expected X.Y.Z).`);
  process.exit(1);
}

const androidCode = semverToAndroidCode(newVersion);

console.log(`\n  Crit 2048 — Version Update → ${newVersion} (Android code: ${androidCode})\n`);

// 1. package.json
const pkgPath = path.join(ROOT, 'package.json');
if (fs.existsSync(pkgPath)) {
  const pkg = readJson(pkgPath);
  const prev = pkg.version;
  pkg.version = newVersion;
  writeJson(pkgPath, pkg);
  console.log(`  [OK] package.json          ${prev} → ${newVersion}`);
} else {
  console.warn(`  [SKIP] package.json not found`);
}

// 2. tauri.conf.json
const tauriConfPath = path.join(ROOT, 'src-tauri', 'tauri.conf.json');
if (fs.existsSync(tauriConfPath)) {
  const conf = readJson(tauriConfPath);
  const prev = conf.version;
  conf.version = newVersion;
  writeJson(tauriConfPath, conf);
  console.log(`  [OK] tauri.conf.json       ${prev} → ${newVersion}`);
} else {
  console.warn(`  [SKIP] tauri.conf.json not found`);
}

// 3. Cargo.toml
const cargoPath = path.join(ROOT, 'src-tauri', 'Cargo.toml');
if (fs.existsSync(cargoPath)) {
  patchToml(cargoPath, newVersion);
  console.log(`  [OK] Cargo.toml            → ${newVersion}`);
} else {
  console.warn(`  [SKIP] Cargo.toml not found`);
}

// 4. tauri.properties (Android versionName + versionCode)
const tauriPropsPath = path.join(ROOT, 'src-tauri', 'gen', 'android', 'app', 'tauri.properties');
if (fs.existsSync(tauriPropsPath)) {
  patchProperties(tauriPropsPath, newVersion, androidCode);
  console.log(`  [OK] tauri.properties      versionName=${newVersion}, versionCode=${androidCode}`);
} else {
  console.warn(`  [SKIP] tauri.properties not found (Android project not initialized?)`);
}

console.log('\n  All version files updated successfully.\n');
