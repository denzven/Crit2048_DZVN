import os
import subprocess
import shutil
from pathlib import Path

def run(cmd):
    print(f"Running: {cmd}")
    subprocess.run(cmd, shell=True, check=True)

def main():
    # Define directories
    dist_dir = Path("dist")
    temp_dir = Path("temp_builds")
    
    print("Cleaning previous builds...")
    if dist_dir.exists(): shutil.rmtree(dist_dir)
    if temp_dir.exists(): shutil.rmtree(temp_dir)
    dist_dir.mkdir(exist_ok=True)
    temp_dir.mkdir(exist_ok=True)
    
    # 1. Build PWA (Absolute Paths)
    print("Building PWA (Web)...")
    run("npm run build")
    web_temp = temp_dir / "web"
    web_temp.mkdir(parents=True, exist_ok=True)
    for item in dist_dir.iterdir():
        if item.is_dir(): shutil.copytree(item, web_temp / item.name)
        else: shutil.copy(item, web_temp / item.name)
    
    # 2. Build Webview (Relative Paths)
    print("Cleaning dist for Webview build...")
    shutil.rmtree(dist_dir)
    dist_dir.mkdir(exist_ok=True)

    print("Building Webview (Relative Paths)...")
    run("npm run webview:build")
    webview_temp = temp_dir / "webview"
    webview_temp.mkdir(parents=True, exist_ok=True)
    for item in dist_dir.iterdir():
        if item.is_dir(): shutil.copytree(item, webview_temp / item.name)
        else: shutil.copy(item, webview_temp / item.name)

    # 3. Desktop Builds
    # Electron-builder expects the build assets in 'dist'
    # We already have the relative build in 'dist' from the previous step
    print("Building Desktop binaries...")
    run("npm run desktop:build")
    pc_temp = temp_dir / "pc"
    if Path("dist/binaries").exists():
        shutil.move("dist/binaries", pc_temp)
    
    # 4. Android Builds
    print("Building Android binaries...")
    android_temp = temp_dir / "android"
    try:
        # Note: This may be interactive. Consider providing passwords via env if possible.
        run("npm run android:build")
        android_temp.mkdir(parents=True, exist_ok=True)
        for f in Path(".").iterdir():
            if f.suffix in [".apk", ".aab"] and "release" in f.name:
                shutil.move(f, android_temp / f.name)
    except Exception as e:
        print(f"Android build failed: {e}")
        print("Note: Android build requires SDK/JDK and keystore passwords.")

    # 5. Final Assembly
    print("Assembling final dist directory...")
    shutil.rmtree(dist_dir)
    dist_dir.mkdir(exist_ok=True)
    
    if web_temp.exists(): shutil.move(web_temp, dist_dir / "web")
    if webview_temp.exists(): shutil.move(webview_temp, dist_dir / "webview")
    if pc_temp.exists(): shutil.move(pc_temp, dist_dir / "pc")
    if android_temp.exists(): shutil.move(android_temp, dist_dir / "android")

    # Cleanup temp
    if temp_dir.exists(): shutil.rmtree(temp_dir)

    print("\nBuild Process Complete!")
    print(f"Final files available in: {dist_dir.absolute()}")


if __name__ == "__main__":
    main()
