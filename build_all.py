import os
import subprocess
import shutil
from pathlib import Path

def run(cmd):
    print(f"🚀 Running: {cmd}")
    subprocess.run(cmd, shell=True, check=True)

def main():
    # 1. Clean and Build PWA
    print("🧹 Cleaning previous builds...")
    if os.path.exists("dist"):
        shutil.rmtree("dist")
    
    run("npm run build")
    
    # 2. Desktop Builds (MSI, EXE, DMG, AppImage, DEB)
    print("🖥️ Building Desktop binaries...")
    run("npm run desktop:build")
    
    # 3. Android Builds (APK, AAB)
    # Note: Bubblewrap requires 'init' if not done, but we'll try build first
    print("📱 Building Android binaries...")
    try:
        run("npm run android:build")
    except Exception as e:
        print("⚠️ Android build failed. You may need to run 'npm run android:init' first to set up signing keys.")
    
    # 4. Collection
    final_dist = Path("dist/delivery")
    final_dist.mkdir(parents=True, exist_ok=True)
    
    print(f"📦 Collecting all binaries into {final_dist}...")
    
    # Collect Desktop
    binaries_dir = Path("dist/binaries")
    if binaries_dir.exists():
        for f in binaries_dir.iterdir():
            if f.is_file():
                shutil.copy(f, final_dist / f.name)
                
    # Collect Android (Bubblewrap defaults to current dir)
    for f in Path(".").iterdir():
        if f.suffix in [".apk", ".aab"] and "release" in f.name:
            shutil.copy(f, final_dist / f.name)

    print("\n✅ Build Process Complete!")
    print(f"📂 Final files available in: {final_dist.absolute()}")

if __name__ == "__main__":
    main()
