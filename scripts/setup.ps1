# =========================================================
#  Crit 2048 — Step 0: One-Time Setup Script
#  Downloads vendor assets + checks all prerequisites
#  Run this ONCE before building.
#  Usage: powershell -ExecutionPolicy Bypass -File scripts\setup.ps1
# =========================================================

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  CRIT 2048 — Setup & Prerequisites Check  " -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# ── Helper ──────────────────────────────────────────────
function Check-Command($name) {
    return (Get-Command $name -ErrorAction SilentlyContinue) -ne $null
}

function Require-Command($name, $installHint) {
    if (-not (Check-Command $name)) {
        Write-Host "  [MISSING] $name — $installHint" -ForegroundColor Red
        return $false
    }
    Write-Host "  [OK] $name found." -ForegroundColor Green
    return $true
}

# ── 1. Node.js ───────────────────────────────────────────
Write-Host "--- Checking Node.js ---" -ForegroundColor Yellow
$nodeOk = Require-Command "node" "Install from https://nodejs.org or run: winget install OpenJS.NodeJS"
$npmOk  = Require-Command "npm"  "Should ship with Node.js"

if (-not $nodeOk) {
    Write-Host ""
    Write-Host "ACTION NEEDED: Install Node.js 18+ then re-run this script." -ForegroundColor Red
    exit 1
}

# ── 2. Rust ──────────────────────────────────────────────
Write-Host ""
Write-Host "--- Checking Rust / Cargo ---" -ForegroundColor Yellow
$rustOk = Require-Command "cargo" "Install from https://rustup.rs/ or run: winget install Rustlang.Rustup"

if (-not $rustOk) {
    Write-Host ""
    Write-Host "ACTION NEEDED: Installing Rust via rustup..." -ForegroundColor Yellow
    Write-Host "Downloading rustup-init.exe..." -ForegroundColor Cyan
    $rustupUrl = "https://win.rustup.rs/x86_64"
    $rustupPath = "$env:TEMP\rustup-init.exe"
    Invoke-WebRequest -Uri $rustupUrl -OutFile $rustupPath -UseBasicParsing
    Start-Process -FilePath $rustupPath -ArgumentList "-y" -Wait
    $env:PATH += ";$env:USERPROFILE\.cargo\bin"
    Write-Host "Rust installed. You may need to restart your terminal." -ForegroundColor Green
}

# ── 3. Tauri CLI ─────────────────────────────────────────
Write-Host ""
Write-Host "--- Checking Tauri CLI ---" -ForegroundColor Yellow
$tauriOk = Require-Command "tauri" "Will install now via cargo..."
if (-not $tauriOk) {
    Write-Host "  Installing Tauri CLI (this takes a few minutes)..." -ForegroundColor Cyan
    cargo install tauri-cli --version "^2"
    Write-Host "  [OK] Tauri CLI installed." -ForegroundColor Green
}

# ── 4. Android Studio / SDK (optional) ──────────────────
Write-Host ""
Write-Host "--- Checking Android SDK (for APK builds) ---" -ForegroundColor Yellow
$androidOk = $false
if (Test-Path "$env:LOCALAPPDATA\Android\Sdk") {
    Write-Host "  [OK] Android SDK found at $env:LOCALAPPDATA\Android\Sdk" -ForegroundColor Green
    $env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
    $androidOk = $true
} elseif ($env:ANDROID_HOME -and (Test-Path $env:ANDROID_HOME)) {
    Write-Host "  [OK] Android SDK at ANDROID_HOME=$env:ANDROID_HOME" -ForegroundColor Green
    $androidOk = $true
} else {
    Write-Host "  [SKIP] Android SDK not found. APK builds won't work." -ForegroundColor DarkYellow
    Write-Host "         To enable Android: Install Android Studio from https://developer.android.com/studio" -ForegroundColor DarkGray
    Write-Host "         Then set ANDROID_HOME env variable." -ForegroundColor DarkGray
}

# ── 5. Vendor Assets ─────────────────────────────────────
Write-Host ""
Write-Host "--- Downloading vendor assets ---" -ForegroundColor Yellow

$vendorDir = Join-Path $Root "vendor"
if (-not (Test-Path $vendorDir)) { New-Item -ItemType Directory -Path $vendorDir | Out-Null }

# Three.js r128
$threeJs = Join-Path $vendorDir "three.min.js"
if (-not (Test-Path $threeJs)) {
    Write-Host "  Downloading Three.js r128..." -ForegroundColor Cyan
    Invoke-WebRequest -Uri "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js" -OutFile $threeJs -UseBasicParsing
    Write-Host "  [OK] three.min.js saved." -ForegroundColor Green
} else {
    Write-Host "  [OK] three.min.js already exists." -ForegroundColor Green
}

# Tailwind CSS (standalone Play CDN)
$tailwindJs = Join-Path $vendorDir "tailwind.min.js"
if (-not (Test-Path $tailwindJs)) {
    Write-Host "  Downloading Tailwind CSS Play CDN..." -ForegroundColor Cyan
    Invoke-WebRequest -Uri "https://cdn.tailwindcss.com" -OutFile $tailwindJs -UseBasicParsing
    Write-Host "  [OK] tailwind.min.js saved." -ForegroundColor Green
} else {
    Write-Host "  [OK] tailwind.min.js already exists." -ForegroundColor Green
}

# ── 6. Tauri Init ────────────────────────────────────────
Write-Host ""
Write-Host "--- Checking Tauri project init ---" -ForegroundColor Yellow
$tauriConf = Join-Path $Root "src-tauri\tauri.conf.json"
if (-not (Test-Path $tauriConf)) {
    Write-Host "  Tauri not yet initialized. Running tauri init..." -ForegroundColor Cyan
    Set-Location $Root
    tauri init --app-name "Crit 2048" --window-title "Crit 2048 — Roguelike D&D" --dist-dir "../" --dev-url "http://localhost:3000" --before-dev-command "" --before-build-command "" --force --yes 2>$null
    Write-Host "  [OK] Tauri initialized." -ForegroundColor Green
} else {
    Write-Host "  [OK] Tauri already initialized." -ForegroundColor Green
}

# ── 7. npm install ───────────────────────────────────────
Write-Host ""
Write-Host "--- Installing npm dependencies ---" -ForegroundColor Yellow
Set-Location $Root
npm install --silent 2>$null
Write-Host "  [OK] npm dependencies installed." -ForegroundColor Green

# ── Summary ──────────────────────────────────────────────
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!                          " -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Next steps:" -ForegroundColor White
Write-Host "    Build for Windows:  powershell scripts\build-desktop.ps1" -ForegroundColor Yellow
if ($androidOk) {
    Write-Host "    Build for Android:  powershell scripts\build-android.ps1" -ForegroundColor Yellow
}
Write-Host "    Build everything:   powershell scripts\build-all.ps1" -ForegroundColor Yellow
Write-Host ""
