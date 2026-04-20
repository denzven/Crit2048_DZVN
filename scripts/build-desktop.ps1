# =========================================================
#  Crit 2048 — Desktop Build Script
#  Builds Windows EXE + MSI (on Windows)
#  macOS + Linux builds run automatically via GitHub Actions
#  
#  Prerequisites: Run scripts\setup.ps1 first
#  Usage: powershell -ExecutionPolicy Bypass -File scripts\build-desktop.ps1
# =========================================================

$ErrorActionPreference = "Stop"
$Root = Join-Path $PSScriptRoot ".."
$Root = Resolve-Path $Root

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   CRIT 2048 — Desktop Build (Windows)     " -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

Set-Location $Root

# ── Verify vendor assets ──────────────────────────────────
Write-Host "--- Verifying vendor assets ---" -ForegroundColor Yellow
if (-not (Test-Path "vendor\three.min.js") -or -not (Test-Path "vendor\tailwind.min.js")) {
    Write-Host "  Vendor assets missing. Running setup first..." -ForegroundColor DarkYellow
    & powershell -ExecutionPolicy Bypass -File "scripts\setup.ps1"
}
Write-Host "  [OK] Vendor assets present." -ForegroundColor Green

# ── Verify Tauri config ───────────────────────────────────
Write-Host ""
Write-Host "--- Verifying Tauri config ---" -ForegroundColor Yellow
if (-not (Test-Path "src-tauri\tauri.conf.json")) {
    Write-Host "  ERROR: Tauri not initialized. Run scripts\setup.ps1 first." -ForegroundColor Red
    exit 1
}
Write-Host "  [OK] Tauri config found." -ForegroundColor Green

# ── Apply tauri.conf.json overrides ──────────────────────
Write-Host ""
Write-Host "--- Patching tauri.conf.json for desktop build ---" -ForegroundColor Yellow
$confPath = "src-tauri\tauri.conf.json"
$conf = Get-Content $confPath | ConvertFrom-Json

# Ensure frontendDist points to project root
$conf.build.frontendDist = "../"
$conf.build.devUrl       = ""
$conf | ConvertTo-Json -Depth 10 | Set-Content $confPath
Write-Host "  [OK] Config updated." -ForegroundColor Green

# ── Build ─────────────────────────────────────────────────
Write-Host ""
Write-Host "--- Running tauri build ---" -ForegroundColor Yellow
Write-Host "  This may take 5-15 minutes on first run (compiling Rust)." -ForegroundColor DarkGray
Write-Host ""

tauri build

# ── Copy output to dist\ ──────────────────────────────────
Write-Host ""
Write-Host "--- Copying output to dist\windows\ ---" -ForegroundColor Yellow

$bundleDir = "src-tauri\target\release\bundle"
$destDir   = "dist\windows"
if (-not (Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir | Out-Null }

# Copy EXE installers (NSIS)
$nsisDir = Join-Path $bundleDir "nsis"
if (Test-Path $nsisDir) {
    Get-ChildItem "$nsisDir\*.exe" | ForEach-Object {
        Copy-Item $_.FullName "$destDir\$($_.Name)"
        Write-Host "  Copied: $($_.Name)" -ForegroundColor Green
    }
}

# Copy MSI installers
$msiDir = Join-Path $bundleDir "msi"
if (Test-Path $msiDir) {
    Get-ChildItem "$msiDir\*.msi" | ForEach-Object {
        Copy-Item $_.FullName "$destDir\$($_.Name)"
        Write-Host "  Copied: $($_.Name)" -ForegroundColor Green
    }
}

# ── Done ──────────────────────────────────────────────────
Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "   Build complete!                          " -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Output files in: dist\windows\" -ForegroundColor White
Get-ChildItem $destDir | ForEach-Object { Write-Host "    $($_.Name)  ($([math]::Round($_.Length/1MB, 2)) MB)" -ForegroundColor Cyan }
Write-Host ""
