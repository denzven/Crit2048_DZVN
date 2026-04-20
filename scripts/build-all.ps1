# =========================================================
#  Crit 2048 — Build All (Windows + Android)
#  
#  For macOS DMG + Linux AppImage, push a git tag.
#  GitHub Actions builds those for free automatically.
#  See .github/workflows/build.yml
#
#  Prerequisites: Run scripts\setup.ps1 first
#  Usage: powershell -ExecutionPolicy Bypass -File scripts\build-all.ps1
# =========================================================

$ErrorActionPreference = "Stop"
$Root = Join-Path $PSScriptRoot ".."
$Root = Resolve-Path $Root
Set-Location $Root

Write-Host ""
Write-Host "##############################################" -ForegroundColor Magenta
Write-Host "#   CRIT 2048 — FULL BUILD (LOCAL)          #" -ForegroundColor Magenta
Write-Host "##############################################" -ForegroundColor Magenta
Write-Host ""
Write-Host "  Building for all locally-supported targets:" -ForegroundColor White
Write-Host "    Windows:  EXE + MSI installer" -ForegroundColor Cyan
Write-Host "    Android:  APK (debug sideload)" -ForegroundColor Cyan
Write-Host ""
Write-Host "  macOS DMG + Linux AppImage are built" -ForegroundColor DarkGray
Write-Host "  automatically via GitHub Actions (free)" -ForegroundColor DarkGray
Write-Host "  when you push a tag:  git tag v1.0.0 && git push --tags" -ForegroundColor DarkGray
Write-Host ""

$start = Get-Date

# ── Desktop ───────────────────────────────────────────────
Write-Host "=== [1/2] BUILDING DESKTOP (Windows) ===" -ForegroundColor Yellow
& powershell -ExecutionPolicy Bypass -File "scripts\build-desktop.ps1"
if ($LASTEXITCODE -ne 0) { Write-Host "Desktop build failed!" -ForegroundColor Red; exit 1 }

# ── Android ───────────────────────────────────────────────
Write-Host ""
Write-Host "=== [2/2] BUILDING ANDROID (APK) ===" -ForegroundColor Yellow
$skipAndroid = $false

# Check if Android SDK available before attempting
if (-not $env:ANDROID_HOME) {
    $androidSdkPath = "$env:LOCALAPPDATA\Android\Sdk"
    if (Test-Path $androidSdkPath) { $env:ANDROID_HOME = $androidSdkPath }
}

if (-not $env:ANDROID_HOME -or -not (Test-Path $env:ANDROID_HOME)) {
    Write-Host "  [SKIP] Android SDK not found. Skipping APK build." -ForegroundColor DarkYellow
    Write-Host "         Install Android Studio and re-run to enable Android builds." -ForegroundColor DarkGray
    $skipAndroid = $true
}

if (-not $skipAndroid) {
    & powershell -ExecutionPolicy Bypass -File "scripts\build-android.ps1"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  Android build failed — check Android Studio installation." -ForegroundColor DarkYellow
    }
}

# ── Summary ───────────────────────────────────────────────
$elapsed = (Get-Date) - $start
Write-Host ""
Write-Host "##############################################" -ForegroundColor Green
Write-Host "#   ALL LOCAL BUILDS COMPLETE               #" -ForegroundColor Green
Write-Host "##############################################" -ForegroundColor Green
Write-Host ""
Write-Host "  Total time: $([math]::Round($elapsed.TotalMinutes, 1)) minutes" -ForegroundColor White
Write-Host ""
Write-Host "  Files produced:" -ForegroundColor White

$targets = @("dist\windows", "dist\android")
foreach ($t in $targets) {
    if (Test-Path $t) {
        $files = Get-ChildItem $t | Where-Object { $_.Name -ne ".gitkeep" }
        if ($files) {
            Write-Host "    $t\" -ForegroundColor Cyan
            $files | ForEach-Object {
                Write-Host "      $($_.Name)  ($([math]::Round($_.Length/1MB, 2)) MB)" -ForegroundColor White
            }
        }
    }
}

Write-Host ""
Write-Host "  To also get macOS + Linux builds:" -ForegroundColor Yellow
Write-Host "    git add . && git commit -m 'Release v1.0.0'" -ForegroundColor DarkGray
Write-Host "    git tag v1.0.0 && git push origin main --tags" -ForegroundColor DarkGray
Write-Host "    → GitHub Actions will build DMG + AppImage for free!" -ForegroundColor DarkGray
Write-Host ""
