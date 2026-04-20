# =========================================================
#  Crit 2048 — Android APK Build Script
#  Builds a debug APK (sideloadable) + release AAB (Play Store)
#
#  Prerequisites:
#    - Run scripts\setup.ps1 first
#    - Android Studio installed with SDK + NDK
#    - ANDROID_HOME environment variable set
#    - JAVA_HOME environment variable set (Android Studio ships one)
#
#  Usage: powershell -ExecutionPolicy Bypass -File scripts\build-android.ps1
# =========================================================

$ErrorActionPreference = "Stop"
$Root = Join-Path $PSScriptRoot ".."
$Root = Resolve-Path $Root

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   CRIT 2048 — Android APK Build           " -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

Set-Location $Root

# ── Check Android SDK ─────────────────────────────────────
Write-Host "--- Checking Android environment ---" -ForegroundColor Yellow

# Auto-detect Android Studio SDK location
if (-not $env:ANDROID_HOME) {
    $candidates = @(
        "$env:LOCALAPPDATA\Android\Sdk",
        "C:\Android\Sdk",
        "$env:USERPROFILE\AppData\Local\Android\Sdk"
    )
    foreach ($c in $candidates) {
        if (Test-Path $c) { $env:ANDROID_HOME = $c; break }
    }
}

if (-not $env:ANDROID_HOME -or -not (Test-Path $env:ANDROID_HOME)) {
    Write-Host "  ERROR: ANDROID_HOME not set or not found." -ForegroundColor Red
    Write-Host "         1. Install Android Studio: https://developer.android.com/studio" -ForegroundColor Yellow
    Write-Host "         2. Run SDK Manager and install 'Android SDK Platform-Tools'" -ForegroundColor Yellow
    Write-Host "         3. Set ANDROID_HOME environment variable and re-run." -ForegroundColor Yellow
    exit 1
}
Write-Host "  [OK] ANDROID_HOME = $env:ANDROID_HOME" -ForegroundColor Green

# Auto-detect JAVA_HOME from Android Studio bundled JDK
if (-not $env:JAVA_HOME) {
    $jdkCandidates = @(
        "${env:ProgramFiles}\Android\Android Studio\jbr",
        "${env:ProgramFiles}\Android\Android Studio\jre"
    )
    foreach ($c in $jdkCandidates) {
        if (Test-Path $c) { $env:JAVA_HOME = $c; break }
    }
}

if ($env:JAVA_HOME) {
    Write-Host "  [OK] JAVA_HOME = $env:JAVA_HOME" -ForegroundColor Green
} else {
    Write-Host "  [WARN] JAVA_HOME not set. Build may fail if Java isn't in PATH." -ForegroundColor DarkYellow
}

# Add SDK tools to PATH
$env:PATH += ";$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\tools\bin"

# ── Verify vendor assets ──────────────────────────────────
Write-Host ""
Write-Host "--- Verifying vendor assets ---" -ForegroundColor Yellow
if (-not (Test-Path "vendor\three.min.js") -or -not (Test-Path "vendor\tailwind.min.js")) {
    Write-Host "  Vendor assets missing. Running setup first..." -ForegroundColor DarkYellow
    & powershell -ExecutionPolicy Bypass -File "scripts\setup.ps1"
}
Write-Host "  [OK] Vendor assets present." -ForegroundColor Green

# ── init android if needed ───────────────────────────────
Write-Host ""
Write-Host "--- Checking Tauri Android project ---" -ForegroundColor Yellow
if (-not (Test-Path "src-tauri\gen\android")) {
    Write-Host "  Android project not found. Initializing..." -ForegroundColor Cyan
    tauri android init
    Write-Host "  [OK] Android project initialized." -ForegroundColor Green
} else {
    Write-Host "  [OK] Android project exists." -ForegroundColor Green
}

# ── Build ─────────────────────────────────────────────────
Write-Host ""
Write-Host "--- Building Android APK (debug) ---" -ForegroundColor Yellow
Write-Host "  This may take 10-20 minutes on first run." -ForegroundColor DarkGray
Write-Host ""

tauri android build --apk --debug

# ── Copy output to dist\android\ ──────────────────────────
Write-Host ""
Write-Host "--- Copying output to dist\android\ ---" -ForegroundColor Yellow

$destDir = "dist\android"
if (-not (Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir | Out-Null }

# Find the APK (typically in src-tauri/gen/android/app/build/outputs/apk/)
$apkSearch = Get-ChildItem -Path "src-tauri\gen\android" -Recurse -Filter "*.apk" -ErrorAction SilentlyContinue
foreach ($apk in $apkSearch) {
    $destName = "crit2048-$($apk.BaseName).apk"
    Copy-Item $apk.FullName "$destDir\$destName"
    Write-Host "  Copied: $destName" -ForegroundColor Green
}

# ── Done ──────────────────────────────────────────────────
Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "   Android build complete!                  " -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Output files in: dist\android\" -ForegroundColor White
Get-ChildItem $destDir -ErrorAction SilentlyContinue | ForEach-Object {
    Write-Host "    $($_.Name)  ($([math]::Round($_.Length/1MB, 2)) MB)" -ForegroundColor Cyan
}
Write-Host ""
Write-Host "  To sideload on your Android device:" -ForegroundColor White
Write-Host "    1. Enable Developer Options on your phone" -ForegroundColor DarkGray
Write-Host "    2. Enable 'Install unknown apps' for your file manager" -ForegroundColor DarkGray
Write-Host "    3. Transfer the APK and tap to install" -ForegroundColor DarkGray
Write-Host ""
