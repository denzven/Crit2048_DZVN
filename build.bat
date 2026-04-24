@echo off
setlocal EnableDelayedExpansion

echo ========================================
echo.

echo [Step 0] Optional version update...
set /p NEW_VERSION="Enter new version (e.g. 0.1.1) or press Enter to keep current: "
if not "!NEW_VERSION!"=="" (
    node scripts/update-version.js !NEW_VERSION!
    if !ERRORLEVEL! neq 0 (
        echo [ERROR] Version update failed.
        pause
        exit /b !ERRORLEVEL!
    )
)
echo.

echo [Step 1] Preparing web assets...
call npm run prebuild
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Web prebuild failed. Check the logs above.
    pause
    exit /b %ERRORLEVEL%
)
echo [OK] Web assets prepared successfully.
echo.

echo [Step 2] Building Windows executable...
echo Running Tauri build in verbose mode...
call npx tauri build --verbose
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Windows build failed. 
    echo ----------------------------------------
    echo If you see a symbolic link error above, you must enable Windows Developer Mode!
    echo Tauri/Cargo requires this to create symbolic links during compilation.
    echo See: https://docs.microsoft.com/en-us/windows/apps/get-started/enable-your-device-for-development
    echo ----------------------------------------
    pause
    exit /b %ERRORLEVEL%
)

echo [Step 3] Moving Windows installers to dist/windows...
if not exist "dist\windows" mkdir "dist\windows"

set "WINDOWS_BUILD_SUCCESS=0"

:: Try to copy NSIS installer
if exist "src-tauri\target\release\bundle\nsis\*.exe" (
    copy /Y "src-tauri\target\release\bundle\nsis\*.exe" "dist\windows\"
    echo [OK] Windows NSIS Installer moved to dist/windows/
    set "WINDOWS_BUILD_SUCCESS=1"
)

:: Try to copy MSI installer
if exist "src-tauri\target\release\bundle\msi\*.msi" (
    copy /Y "src-tauri\target\release\bundle\msi\*.msi" "dist\windows\"
    echo [OK] Windows MSI Installer moved to dist/windows/
    set "WINDOWS_BUILD_SUCCESS=1"
)

if "!WINDOWS_BUILD_SUCCESS!"=="0" (
    echo [ERROR] Expected Windows installers not found in src-tauri\target\release\bundle\
    pause
    exit /b 1
)
echo.

echo [Step 4] Checking Android prerequisites...
if not exist "src-tauri\gen\android" (
    echo Notice: Android project not initialized. Attempting to initialize...
    call npx tauri android init --verbose
)

if not exist "src-tauri\gen\android" (
    echo [WARNING] Android initialization failed or skipped.
    echo This usually means Android SDK Command-line Tools are missing.
    echo Open Android Studio -^> SDK Manager -^> SDK Tools and check "Android SDK Command-line Tools".
    echo After installing it, run 'npx tauri android init' manually to create the project.
    echo Skipping Android build.
    goto end
)

echo.
echo [Step 5] Building Android APK...
call npx tauri android build --verbose
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Android build failed. Check the logs above.
    pause
    exit /b %ERRORLEVEL%
)

echo [Step 6] Moving Android outputs to dist/android...
if not exist "dist\android" mkdir "dist\android"

set "ANDROID_BUILD_SUCCESS=0"

:: Try to copy universal APKs (signed or unsigned)
if exist "src-tauri\gen\android\app\build\outputs\apk\universal\release\*.apk" (
    copy /Y "src-tauri\gen\android\app\build\outputs\apk\universal\release\*.apk" "dist\android\"
    echo [OK] Android Universal APK moved to dist/android/
    set "ANDROID_BUILD_SUCCESS=1"
)

:: Try to copy specific release APKs
if exist "src-tauri\gen\android\app\build\outputs\apk\release\*.apk" (
    copy /Y "src-tauri\gen\android\app\build\outputs\apk\release\*.apk" "dist\android\"
    echo [OK] Android Release APK moved to dist/android/
    set "ANDROID_BUILD_SUCCESS=1"
)

:: Try to copy AAB (Android App Bundle)
if exist "src-tauri\gen\android\app\build\outputs\bundle\universalRelease\*.aab" (
    copy /Y "src-tauri\gen\android\app\build\outputs\bundle\universalRelease\*.aab" "dist\android\"
    echo [OK] Android AAB Bundle moved to dist/android/
    set "ANDROID_BUILD_SUCCESS=1"
)

if "!ANDROID_BUILD_SUCCESS!"=="0" (
    echo [ERROR] Android build succeeded but APK/AAB was not found in expected output directories.
    pause
    exit /b 1
)

echo [Step 7] Creating Webview distribution in dist/webview...
if not exist "dist\webview" mkdir "dist\webview"
copy /Y "index.html" "dist\webview\"
if exist "css" (
    if not exist "dist\webview\css" mkdir "dist\webview\css"
    xcopy /E /I /Y "css" "dist\webview\css" >nul
)
if exist "js" (
    if not exist "dist\webview\js" mkdir "dist\webview\js"
    xcopy /E /I /Y "js" "dist\webview\js" >nul
)
if exist "app_icon.png" copy /Y "app_icon.png" "dist\webview\"
echo [OK] Webview distribution created successfully.

:end
echo.
echo ========================================
echo Build process finished! Check the dist/ folder.
echo ========================================
pause
