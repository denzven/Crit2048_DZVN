@echo off
setlocal EnableDelayedExpansion

:: ============================================================
::  CRIT 2048 - Master Build Script
::  Builds: Windows (EXE/MSI) + Android (APK/AAB) + Webview
::  Outputs named deliverables to dist/ with full metadata.
::  Run from the project root directory.
:: ============================================================

set "SCRIPT_START_TIME=%time%"
set "BUILD_LOG=build_log.txt"

echo.
echo ============================================================
echo   CRIT 2048 -- MASTER BUILD SYSTEM
echo   Windows + Android + Webview Deliverables
echo ============================================================
echo.
echo [INFO] Build started at %time%
echo [INFO] Writing log to %BUILD_LOG%
echo.

:: Clear previous log
echo Crit 2048 Build Log -- %date% %time% > "%BUILD_LOG%"
echo ============================================================ >> "%BUILD_LOG%"

:: ============================================================
::  STEP 0 - BUILD TARGET SELECTION
:: ============================================================
echo +----------------------------------------------------------+
echo ^|  SELECT BUILD TARGETS                                    ^|
echo ^|                                                          ^|
echo ^|  [1]  Windows only    (EXE + MSI)                        ^|
echo ^|  [2]  Android only    (APK + AAB)                        ^|
echo ^|  [3]  Webview only    (static HTML bundle)               ^|
echo ^|  [4]  Windows + Android  (full native builds)            ^|
echo ^|  [5]  ALL targets     (Windows + Android + Webview)      ^|
echo +----------------------------------------------------------+
echo.
set /p BUILD_TARGET="  Enter choice [1-5] (default=5, press Enter for ALL): "
if "!BUILD_TARGET!"=="" set "BUILD_TARGET=5"
echo.

set "DO_WINDOWS=0"
set "DO_ANDROID=0"
set "DO_WEBVIEW=0"

if "!BUILD_TARGET!"=="1" ( set "DO_WINDOWS=1" )
if "!BUILD_TARGET!"=="2" ( set "DO_ANDROID=1" )
if "!BUILD_TARGET!"=="3" ( set "DO_WEBVIEW=1" )
if "!BUILD_TARGET!"=="4" ( set "DO_WINDOWS=1" & set "DO_ANDROID=1" )
if "!BUILD_TARGET!"=="5" ( set "DO_WINDOWS=1" & set "DO_ANDROID=1" & set "DO_WEBVIEW=1" )

if "!DO_WINDOWS!!DO_ANDROID!!DO_WEBVIEW!"=="000" (
    echo [ERROR] Invalid choice. Please enter 1-5.
    pause & exit /b 1
)

echo [INFO] Targets selected: Windows=!DO_WINDOWS!  Android=!DO_ANDROID!  Webview=!DO_WEBVIEW!
echo [INFO] Targets: Windows=!DO_WINDOWS! Android=!DO_ANDROID! Webview=!DO_WEBVIEW! >> "%BUILD_LOG%"
echo.

:: ============================================================
::  STEP 1 - VERSION MANAGEMENT
:: ============================================================
echo ============================================================
echo   STEP 1/8 -- Version Management
echo ============================================================

:: Read current version from package.json
for /f "tokens=* usebackq" %%v in (`node -e "process.stdout.write(require('./package.json').version)"`) do set "CURRENT_VERSION=%%v"

if "!CURRENT_VERSION!"=="" (
    echo [ERROR] Could not read version from package.json. Is Node.js installed?
    pause & exit /b 1
)

echo [INFO] Current version: !CURRENT_VERSION!
echo.

set /p NEW_VERSION="  Enter new version (e.g. 1.3.0) or press Enter to keep [!CURRENT_VERSION!]: "
if not "!NEW_VERSION!"=="" (
    echo [INFO] Bumping version to !NEW_VERSION! ...
    node scripts/update-version.js !NEW_VERSION!
    if !ERRORLEVEL! neq 0 (
        echo [ERROR] Version update failed. Check the output above.
        pause & exit /b 1
    )
    set "CURRENT_VERSION=!NEW_VERSION!"
    echo [OK] Version bumped to !CURRENT_VERSION! in all 4 config files.
) else (
    echo [OK] Keeping version: !CURRENT_VERSION!
)

echo.
echo [INFO] Build version: v!CURRENT_VERSION!
echo Build version: v!CURRENT_VERSION! >> "%BUILD_LOG%"
echo.

:: ============================================================
::  STEP 2 - PREREQUISITE CHECKS
:: ============================================================
echo ============================================================
echo   STEP 2/8 -- Prerequisite Checks
echo ============================================================

set "PREREQ_FAIL=0"

:: -- Node.js
node --version >nul 2>&1
if !ERRORLEVEL! neq 0 (
    echo [MISSING] Node.js -- Install from https://nodejs.org/
    set "PREREQ_FAIL=1"
) else (
    for /f "tokens=*" %%v in ('node --version') do echo [OK] Node.js %%v
)

:: -- Rust / Cargo
cargo --version >nul 2>&1
if !ERRORLEVEL! neq 0 (
    echo [MISSING] Rust/Cargo -- Install from https://rustup.rs/
    set "PREREQ_FAIL=1"
) else (
    for /f "tokens=*" %%v in ('cargo --version') do echo [OK] %%v
)

:: -- Tauri CLI (via npx)
call npm list --depth=0 @tauri-apps/cli >nul 2>&1
if !ERRORLEVEL! neq 0 (
    echo [MISSING] Tauri CLI -- Run: npm install -D @tauri-apps/cli
    set "PREREQ_FAIL=1"
) else (
    echo [OK] Tauri CLI found in node_modules
)

:: -- Tailwind CLI
if exist "node_modules\.bin\tailwindcss" (
    echo [OK] Tailwind CLI found in node_modules/.bin/
) else if exist "node_modules\.bin\tailwindcss.cmd" (
    echo [OK] Tailwind CLI found in node_modules/.bin/
) else (
    echo [MISSING] Tailwind CLI -- Run: npm install --save-dev tailwindcss @tailwindcss/cli
    set "PREREQ_FAIL=1"
)

:: -- Vendor files (must exist for offline build)
if not exist "vendor\three.min.js" (
    echo [MISSING] vendor\three.min.js -- Download from cdnjs or re-run setup
    set "PREREQ_FAIL=1"
) else (
    echo [OK] vendor\three.min.js present
)

if not exist "vendor\html2canvas.min.js" (
    echo [MISSING] vendor\html2canvas.min.js -- Download from cdnjs or re-run setup
    set "PREREQ_FAIL=1"
) else (
    echo [OK] vendor\html2canvas.min.js present
)

if not exist "vendor\fonts\Cinzel-Regular.ttf" (
    echo [MISSING] vendor\fonts\  ^(Cinzel font files^) -- Check git clone or re-download
    set "PREREQ_FAIL=1"
) else (
    echo [OK] vendor\fonts\  ^(Cinzel font files^) present
)

:: -- Android-specific checks
if "!DO_ANDROID!"=="1" (
    echo(
    echo [CHECK] Android SDK environment...

    if not defined ANDROID_HOME (
        echo [WARNING] ANDROID_HOME is not set. Android build may fail.
        echo          Set it to your SDK path, e.g.:
        echo          C:\Users\YOU\AppData\Local\Android\Sdk
        echo          ^(This is a warning, not a hard stop -- Gradle may find it anyway^)
    ) else (
        echo [OK] ANDROID_HOME = !ANDROID_HOME!
    )

    if not defined JAVA_HOME (
        echo [WARNING] JAVA_HOME is not set. Gradle requires JDK 17+.
        echo          Download from https://adoptium.net/
    ) else (
        echo [OK] JAVA_HOME = !JAVA_HOME!
    )

    if not exist "src-tauri\gen\android\app\release.jks" (
        echo [ERROR] Keystore missing: src-tauri\gen\android\app\release.jks
        echo         Run setup or check git clone integrity.
        set "PREREQ_FAIL=1"
    ) else (
        echo [OK] Android keystore found: release.jks
    )

    if not exist "src-tauri\gen\android\app\keystore.properties" (
        echo [ERROR] keystore.properties missing.
        set "PREREQ_FAIL=1"
    ) else (
        echo [OK] keystore.properties found
    )
)

if "!PREREQ_FAIL!"=="1" (
    echo(
    echo [ERROR] Prerequisites check failed. Resolve the issues above, then re-run.
    pause & exit /b 1
)

echo.
echo [OK] All prerequisites satisfied.
echo.

:: ============================================================
::  STEP 3 - CLEAN PREVIOUS DELIVERABLES
:: ============================================================
echo ============================================================
echo   STEP 3/8 -- Clean Previous Deliverables
echo ============================================================

:: Ensure dist subdirs exist (they may not after a fresh clone if gitkeep missing)
if not exist "dist"          mkdir "dist"
if not exist "dist\windows"  mkdir "dist\windows"
if not exist "dist\android"  mkdir "dist\android"
if not exist "dist\webview"  mkdir "dist\webview"

if "!DO_WINDOWS!"=="1" (
    del /Q "dist\windows\*.*" 2>nul
    echo [OK] Cleaned dist\windows\
)
if "!DO_ANDROID!"=="1" (
    del /Q "dist\android\*.*" 2>nul
    echo [OK] Cleaned dist\android\
)
if "!DO_WEBVIEW!"=="1" (
    for /d %%d in ("dist\webview\*") do rd /s /q "%%d" 2>nul
    del /Q "dist\webview\*.*" 2>nul
    echo [OK] Cleaned dist\webview\
)
echo.

:: ============================================================
::  STEP 4 - PREPARE WEB ASSETS
:: ============================================================
echo ============================================================
echo   STEP 4/8 -- Prepare Web Assets (Tailwind + .web-build)
echo ============================================================
echo [INFO] Rebuilding Tailwind CSS + copying assets to .web-build...
echo.

call npm run prebuild >> "%BUILD_LOG%" 2>&1
if !ERRORLEVEL! neq 0 (
    rem npm run prebuild can exit 1 on Windows due to Tailwind ANSI codes
    rem Check if the actual output files exist before failing
    if not exist ".web-build\index.html" (
        echo [ERROR] Web prebuild failed. Check %BUILD_LOG% for details.
        pause & exit /b 1
    )
    echo [WARNING] prebuild exited non-zero ^(likely Tailwind ANSI issue^) but files exist. Continuing.
)

if not exist ".web-build\index.html" (
    echo [ERROR] .web-build\index.html missing after prebuild. Check %BUILD_LOG%.
    pause & exit /b 1
)

if not exist ".web-build\css\tailwind.css" (
    echo [ERROR] .web-build\css\tailwind.css missing. Tailwind CSS was not generated.
    pause & exit /b 1
)

if not exist ".web-build\vendor\three.min.js" (
    echo [ERROR] .web-build\vendor\ missing. Vendor files were not copied.
    pause & exit /b 1
)

echo [OK] Web assets prepared successfully.
echo [OK] Tailwind CSS regenerated and bundled (offline, no CDN).
echo [OK] vendor/ (Three.js, html2canvas, Cinzel fonts) bundled.
echo.

:: ============================================================
::  STEP 5 - BUILD WINDOWS (EXE + MSI)
:: ============================================================
if "!DO_WINDOWS!"=="1" (
    echo ============================================================
    echo   STEP 5/8 -- Windows Build  [EXE + MSI]
    echo ============================================================
    echo [INFO] Compiling Rust + packaging WebView2 installer...
    echo [INFO] This typically takes 3-10 minutes on first build.
    echo [INFO] Subsequent builds are much faster (Rust incremental cache).
    echo(

    echo Windows Build Start: %time% >> "%BUILD_LOG%"
    call npx tauri build >> "%BUILD_LOG%" 2>&1
    if !ERRORLEVEL! neq 0 (
        echo(
        echo [ERROR] Windows build FAILED. Check %BUILD_LOG% for full details.
        echo(
        echo  Common causes:
        echo  - Windows Developer Mode is OFF (required for Cargo symlinks)
        echo    Settings > Privacy and Security > For Developers > On
        echo  - Missing Visual C++ Build Tools
        echo    Install from: https://aka.ms/vs/buildtools
        echo  - Missing WebView2 runtime
        echo    Install from: https://developer.microsoft.com/microsoft-edge/webview2/
        echo(
        pause & exit /b !ERRORLEVEL!
    )

    echo Windows Build End: %time% >> "%BUILD_LOG%"

    set "WIN_BUILD_OK=0"

    rem -- Copy + rename NSIS EXE Installer
    for %%f in ("src-tauri\target\release\bundle\nsis\*.exe") do (
        set "EXE_SRC=%%~f"
        set "EXE_DST=dist\windows\Crit2048_v!CURRENT_VERSION!_Windows_Installer.exe"
        copy /Y "!EXE_SRC!" "!EXE_DST!" >nul
        if !ERRORLEVEL!==0 (
            for %%s in ("!EXE_DST!") do set "EXE_BYTES=%%~zs"
            set /a "EXE_MB=!EXE_BYTES! / 1048576"
            echo [OK] Windows EXE Installer  -->  !EXE_DST!  ^(!EXE_MB! MB^)
            echo Windows EXE: !EXE_DST! (!EXE_MB! MB) >> "%BUILD_LOG%"
            set "WIN_BUILD_OK=1"
        )
    )

    rem -- Copy + rename MSI Installer
    for %%f in ("src-tauri\target\release\bundle\msi\*.msi") do (
        set "MSI_SRC=%%~f"
        set "MSI_DST=dist\windows\Crit2048_v!CURRENT_VERSION!_Windows.msi"
        copy /Y "!MSI_SRC!" "!MSI_DST!" >nul
        if !ERRORLEVEL!==0 (
            for %%s in ("!MSI_DST!") do set "MSI_BYTES=%%~zs"
            set /a "MSI_MB=!MSI_BYTES! / 1048576"
            echo [OK] Windows MSI Installer  -->  !MSI_DST!  ^(!MSI_MB! MB^)
            echo Windows MSI: !MSI_DST! (!MSI_MB! MB) >> "%BUILD_LOG%"
            set "WIN_BUILD_OK=1"
        )
    )

    if "!WIN_BUILD_OK!"=="0" (
        echo [ERROR] Windows build succeeded but no installers found in:
        echo         src-tauri\target\release\bundle\nsis\
        echo         src-tauri\target\release\bundle\msi\
        pause & exit /b 1
    )
    echo(
) else (
    echo [SKIP] Step 5 -- Windows build skipped.
    echo(
)

:: ============================================================
::  STEP 6 - BUILD ANDROID (APK + AAB)
:: ============================================================
if "!DO_ANDROID!"=="1" (
    echo ============================================================
    echo   STEP 6/8 -- Android Build  [APK + AAB]
    echo ============================================================

    rem -- Initialize Android project if needed
    if not exist "src-tauri\gen\android" (
        echo [INFO] Android project not found. Initializing...
        call npx tauri android init >> "%BUILD_LOG%" 2>&1
        if !ERRORLEVEL! neq 0 (
            echo [ERROR] Android init failed. Check %BUILD_LOG%.
            echo         Ensure Android SDK Command-line Tools are installed in Android Studio.
            pause & exit /b 1
        )
        echo [OK] Android project initialized.
        echo(
    )

    rem -- Build Signed APK (universal)
    echo [INFO] Building signed Android APK (universal, arm64 + armeabi-v7a)...
    echo [INFO] This typically takes 5-15 minutes on first build.
    echo(

    echo Android APK Build Start: %time% >> "%BUILD_LOG%"
    call npx tauri android build >> "%BUILD_LOG%" 2>&1
    if !ERRORLEVEL! neq 0 (
        echo(
        echo [ERROR] Android APK build FAILED. Check %BUILD_LOG% for details.
        echo(
        echo  Common causes:
        echo  - ANDROID_HOME not set (point to Android SDK root)
        echo  - JAVA_HOME not set or JDK version too old (need 17+)
        echo  - Android NDK not installed (install via SDK Manager)
        echo  - Keystore password mismatch in keystore.properties
        echo  - Missing SDK platform or Build-Tools version
        echo(
        pause & exit /b !ERRORLEVEL!
    )
    echo Android APK Build End: %time% >> "%BUILD_LOG%"

    rem -- Build AAB for Play Store (via Gradle directly)
    echo(
    echo [INFO] Building Android App Bundle (AAB) for Play Store submission...
    echo [INFO] Using: gradlew bundleRelease
    echo(

    echo Android AAB Build Start: %time% >> "%BUILD_LOG%"
    cd src-tauri\gen\android
    call gradlew bundleRelease >> "..\..\..\%BUILD_LOG%" 2>&1
    set "GRADLE_EXIT=!ERRORLEVEL!"
    cd ..\..\..
    echo Android AAB Build End: %time% >> "%BUILD_LOG%"

    if !GRADLE_EXIT! neq 0 (
        echo [WARNING] AAB (gradlew bundleRelease) failed (exit !GRADLE_EXIT!).
        echo          APK is still available. You can manually build AAB later:
        echo          cd src-tauri\gen\android ^&^& gradlew bundleRelease
        set "AAB_OK=0"
    ) else (
        echo [OK] AAB build completed.
        set "AAB_OK=1"
    )

    set "AND_BUILD_OK=0"

    rem -- Copy + rename Signed APK
    if exist "src-tauri\gen\android\app\build\outputs\apk\universal\release\app-universal-release.apk" (
        set "APK_SRC=src-tauri\gen\android\app\build\outputs\apk\universal\release\app-universal-release.apk"
        set "APK_DST=dist\android\Crit2048_v!CURRENT_VERSION!_Android.apk"
        copy /Y "!APK_SRC!" "!APK_DST!" >nul
        for %%s in ("!APK_DST!") do set "APK_BYTES=%%~zs"
        set /a "APK_MB=!APK_BYTES! / 1048576"
        echo [OK] Android APK (signed)  -->  !APK_DST!  ^(!APK_MB! MB^)
        echo Android APK: !APK_DST! (!APK_MB! MB) >> "%BUILD_LOG%"
        set "AND_BUILD_OK=1"
    )

    rem -- Fallback: unsigned APK
    if "!AND_BUILD_OK!"=="0" (
        if exist "src-tauri\gen\android\app\build\outputs\apk\universal\release\app-universal-release-unsigned.apk" (
            set "APK_SRC=src-tauri\gen\android\app\build\outputs\apk\universal\release\app-universal-release-unsigned.apk"
            set "APK_DST=dist\android\Crit2048_v!CURRENT_VERSION!_Android_unsigned.apk"
            copy /Y "!APK_SRC!" "!APK_DST!" >nul
            for %%s in ("!APK_DST!") do set "APK_BYTES=%%~zs"
            set /a "APK_MB=!APK_BYTES! / 1048576"
            echo [OK] Android APK (unsigned)  -->  !APK_DST!  ^(!APK_MB! MB^)
            echo [NOTE] This APK is unsigned. Sign manually before distribution.
            echo Android APK (unsigned): !APK_DST! (!APK_MB! MB) >> "%BUILD_LOG%"
            set "AND_BUILD_OK=1"
        )
    )

    rem -- Fallback: arm release APK
    if "!AND_BUILD_OK!"=="0" (
        for %%f in ("src-tauri\gen\android\app\build\outputs\apk\release\*.apk") do (
            set "APK_SRC=%%~f"
            set "APK_DST=dist\android\Crit2048_v!CURRENT_VERSION!_Android.apk"
            copy /Y "!APK_SRC!" "!APK_DST!" >nul
            for %%s in ("!APK_DST!") do set "APK_BYTES=%%~zs"
            set /a "APK_MB=!APK_BYTES! / 1048576"
            echo [OK] Android APK (arm release)  -->  !APK_DST!  ^(!APK_MB! MB^)
            echo Android APK: !APK_DST! (!APK_MB! MB) >> "%BUILD_LOG%"
            set "AND_BUILD_OK=1"
        )
    )

    rem -- Copy + rename AAB (check both known output paths, use flag to avoid goto inside block)
    set "AAB_COPIED=0"
    if "!AAB_OK!"=="1" (
        if exist "src-tauri\gen\android\app\build\outputs\bundle\universalRelease\app-universal-release.aab" (
            if "!AAB_COPIED!"=="0" (
                set "AAB_SRC=src-tauri\gen\android\app\build\outputs\bundle\universalRelease\app-universal-release.aab"
                set "AAB_DST=dist\android\Crit2048_v!CURRENT_VERSION!_Android_PlayStore.aab"
                copy /Y "!AAB_SRC!" "!AAB_DST!" >nul
                for %%s in ("!AAB_DST!") do set "AAB_BYTES=%%~zs"
                set /a "AAB_MB=!AAB_BYTES! / 1048576"
                echo [OK] Android AAB ^(Play Store^)  -->  !AAB_DST!  ^(!AAB_MB! MB^)
                echo Android AAB: !AAB_DST! (!AAB_MB! MB) >> "%BUILD_LOG%"
                set "AND_BUILD_OK=1"
                set "AAB_COPIED=1"
            )
        )
        if exist "src-tauri\gen\android\app\build\outputs\bundle\release\app-release.aab" (
            if "!AAB_COPIED!"=="0" (
                set "AAB_SRC=src-tauri\gen\android\app\build\outputs\bundle\release\app-release.aab"
                set "AAB_DST=dist\android\Crit2048_v!CURRENT_VERSION!_Android_PlayStore.aab"
                copy /Y "!AAB_SRC!" "!AAB_DST!" >nul
                for %%s in ("!AAB_DST!") do set "AAB_BYTES=%%~zs"
                set /a "AAB_MB=!AAB_BYTES! / 1048576"
                echo [OK] Android AAB ^(Play Store^)  -->  !AAB_DST!  ^(!AAB_MB! MB^)
                echo Android AAB: !AAB_DST! (!AAB_MB! MB) >> "%BUILD_LOG%"
                set "AND_BUILD_OK=1"
                set "AAB_COPIED=1"
            )
        )
    )

    if "!AND_BUILD_OK!"=="0" (
        echo [ERROR] Android build succeeded but no APK or AAB was found.
        echo         Check these paths:
        echo           src-tauri\gen\android\app\build\outputs\apk\
        echo           src-tauri\gen\android\app\build\outputs\bundle\
        pause & exit /b 1
    )
    echo(
) else (
    echo [SKIP] Step 6 -- Android build skipped.
    echo(
)

:: ============================================================
::  STEP 7 - WEBVIEW BUNDLE (static offline HTML)
:: ============================================================
if "!DO_WEBVIEW!"=="1" (
    echo ============================================================
    echo   STEP 7/8 -- Webview Bundle  [static HTML]
    echo ============================================================
    echo [INFO] Packaging fully-offline static HTML bundle from .web-build...

    if not exist ".web-build\index.html" (
        echo [ERROR] .web-build\index.html missing. Re-run Step 4 (prebuild).
        pause & exit /b 1
    )

    rem Copy from .web-build (guaranteed to have Tailwind + vendor + fonts)
    xcopy /E /I /Y ".web-build\*" "dist\webview\" >nul 2>&1
    if !ERRORLEVEL! neq 0 (
        echo [ERROR] Failed to copy webview bundle.
        pause & exit /b 1
    )

    rem Include app icon if present
    if exist "app_icon.png" copy /Y "app_icon.png" "dist\webview\" >nul

    rem Estimate total size
    set "WV_TOTAL=0"
    for /r "dist\webview\" %%f in (*) do (
        set "FSIZE=%%~zf"
        set /a "WV_TOTAL=WV_TOTAL + FSIZE" 2>nul
    )
    set /a "WV_MB=!WV_TOTAL! / 1048576"

    echo [OK] Webview bundle created  -->  dist\webview\  ^(!WV_MB! MB^)
    echo [OK] Includes: index.html, css/tailwind.css, vendor/ (Three.js, html2canvas, Cinzel fonts)
    echo Webview bundle: dist\webview\ (!WV_MB! MB) >> "%BUILD_LOG%"
    echo(
) else (
    echo [SKIP] Step 7 -- Webview bundle skipped.
    echo(
)

:: ============================================================
::  STEP 8 - BUILD SUMMARY
:: ============================================================
echo ============================================================
echo   STEP 8/8 -- Build Summary
echo ============================================================
echo.
echo +----------------------------------------------------------+
echo ^|  CRIT 2048 v!CURRENT_VERSION! -- BUILD COMPLETE
echo ^|
echo ^|  Started:  %SCRIPT_START_TIME%
echo ^|  Finished: %time%
echo +----------------------------------------------------------+
echo.
echo  Deliverables in dist\:
echo.

if "!DO_WINDOWS!"=="1" (
    echo  dist\windows\
    for %%f in ("dist\windows\*.*") do (
        set "FSIZE=%%~zf"
        set /a "FMB=!FSIZE! / 1048576"
        echo    [EXE/MSI]  %%~nxf  (!FMB! MB^)
    )
    echo(
)

if "!DO_ANDROID!"=="1" (
    echo  dist\android\
    for %%f in ("dist\android\*.*") do (
        set "FSIZE=%%~zf"
        set /a "FMB=!FSIZE! / 1048576"
        echo    [APK/AAB]  %%~nxf  (!FMB! MB^)
    )
    echo(
)

if "!DO_WEBVIEW!"=="1" (
    echo  dist\webview\  (open index.html to play offline in any browser)
    echo(
)

echo  Full build log: %BUILD_LOG%
echo.
echo ============================================================
echo.

echo. >> "%BUILD_LOG%"
echo Build complete at %time% >> "%BUILD_LOG%"
pause
