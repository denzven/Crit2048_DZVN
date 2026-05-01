#!/usr/bin/env python3
"""
Crit 2048 - Master Build System
Builds: Windows (EXE/MSI), Android (APK/AAB), Linux (AppImage/deb),
        macOS (dmg), iOS (ipa), Webview bundle

Usage:
    python build.py              # interactive menu
    python build.py --windows    # Windows only
    python build.py --android    # Android only
    python build.py --linux      # Linux AppImage + deb
    python build.py --macos      # macOS dmg
    python build.py --ios        # iOS IPA (requires macOS + Xcode)
    python build.py --webview    # Webview only
    python build.py --all        # all available targets
"""

import os, sys, json, shutil, subprocess, platform, zipfile, argparse
from pathlib import Path
from datetime import datetime

# Force UTF-8 output on Windows to avoid codec errors
if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

# ── Paths ─────────────────────────────────────────────────────────────────────
ROOT       = Path(__file__).parent.resolve()
DIST       = ROOT / "dist"
WEB_BUILD  = ROOT / ".web-build"
BACKUPS    = ROOT / ".build_backups"
LOG_FILE   = ROOT / "build_log.txt"
SCRIPTS    = ROOT / "scripts"
SRC_TAURI  = ROOT / "src-tauri"
ANDROID    = SRC_TAURI / "gen" / "android"
VENDOR     = ROOT / "vendor"

IS_WINDOWS = platform.system() == "Windows"
MAX_BACKUPS = 5

# ── ANSI colours (Windows 10+ supports VT natively) ───────────────────────────
def _ansi(*codes): return f"\033[{';'.join(str(c) for c in codes)}m"

class C:
    RESET  = _ansi(0)
    BOLD   = _ansi(1)
    DIM    = _ansi(2)
    RED    = _ansi(91)
    GREEN  = _ansi(92)
    YELLOW = _ansi(93)
    BLUE   = _ansi(94)
    CYAN   = _ansi(96)
    WHITE  = _ansi(97)

def enable_ansi():
    if IS_WINDOWS:
        try:
            import ctypes
            ctypes.windll.kernel32.SetConsoleMode(
                ctypes.windll.kernel32.GetStdHandle(-11), 7)
        except Exception:
            pass

# ── Logging ───────────────────────────────────────────────────────────────────
_log_fh = None

def log_open():
    global _log_fh
    _log_fh = open(LOG_FILE, "w", encoding="utf-8")
    _log_fh.write(f"Crit 2048 Build Log — {datetime.now()}\n{'='*60}\n")

def log(msg):
    if _log_fh:
        _log_fh.write(msg + "\n")
        _log_fh.flush()

def log_close():
    if _log_fh:
        _log_fh.close()

# ── Print helpers ─────────────────────────────────────────────────────────────
def header(title):
    print(f"\n{C.CYAN}{'='*60}{C.RESET}")
    print(f"{C.BOLD}{C.WHITE}  {title}{C.RESET}")
    print(f"{C.CYAN}{'='*60}{C.RESET}")
    log(f"\n{'='*60}\n  {title}\n{'='*60}")

def ok(msg):    print(f"  {C.GREEN}[OK]{C.RESET}  {msg}");  log(f"[OK] {msg}")
def info(msg):  print(f"  {C.BLUE}[..]{C.RESET}  {msg}");  log(f"[..] {msg}")
def warn(msg):  print(f"  {C.YELLOW}[!!]{C.RESET}  {msg}"); log(f"[!!] {msg}")
def err(msg):   print(f"  {C.RED}[ERROR]{C.RESET} {msg}"); log(f"[ERROR] {msg}")
def skip(msg):  print(f"  {C.DIM}[--]  {msg}{C.RESET}");   log(f"[--] {msg}")

def step(n, title):
    bar = '-' * 60
    print(f"\n{C.BOLD}{C.BLUE}{bar}{C.RESET}")
    print(f"{C.BOLD}  STEP {n}/8 -- {title}{C.RESET}")
    print(f"{C.BOLD}{C.BLUE}{bar}{C.RESET}\n")
    log(f"\nSTEP {n}/8 -- {title}\n{bar}")

def mb(path):
    try: return round(Path(path).stat().st_size / 1048576, 1)
    except: return 0

# ── Run helper ────────────────────────────────────────────────────────────────
def run(cmd, cwd=None, capture=False, env=None):
    """Stream every output line to BOTH the terminal and the log file in real time.
    Returns (returncode, captured_stdout_str).
      capture=True  → suppress terminal echo (still logs everything)
      env           → dict of extra env vars to inject for this command only
    """
    import threading, io
    cwd = cwd or ROOT
    if IS_WINDOWS and isinstance(cmd, list):
        cmd = ["cmd", "/c"] + cmd
    cmd_str = " ".join(str(c) for c in cmd) if isinstance(cmd, list) else cmd
    log(f"$ {cmd_str}")

    merged_env = None
    if env:
        merged_env = os.environ.copy()
        merged_env.update(env)

    try:
        proc = subprocess.Popen(
            cmd,
            cwd=cwd,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,   # merge stderr into stdout pipe
            text=True,
            shell=not isinstance(cmd, list),
            env=merged_env,
            encoding="utf-8",
            errors="replace",
            bufsize=1,
        )
        collected = io.StringIO()

        def _stream():
            for line in proc.stdout:
                log(line.rstrip())
                collected.write(line)
                if not capture:
                    print(line, end="", flush=True)

        t = threading.Thread(target=_stream, daemon=True)
        t.start()
        proc.wait()
        t.join()
        return proc.returncode, collected.getvalue()
    except FileNotFoundError as e:
        log(f"FileNotFoundError: {e}")
        return 1, ""

def npm(args, cwd=None):
    cmd = ["npm"] + args if not IS_WINDOWS else ["npm.cmd"] + args
    return run(cmd, cwd=cwd)

def npx(args, cwd=None):
    cmd = ["npx"] + args if not IS_WINDOWS else ["npx.cmd"] + args
    return run(cmd, cwd=cwd)

def node(args, cwd=None, capture=False):
    cmd = ["node"] + args
    return run(cmd, cwd=cwd, capture=capture)

# ── Backup ────────────────────────────────────────────────────────────────────
def backup_dist():
    """Zip existing dist/ into .build_backups/ before cleaning."""
    BACKUPS.mkdir(exist_ok=True)
    existing = [f for d in [DIST/"windows", DIST/"android"]
                for f in d.glob("*") if f.is_file() and f.suffix in
                (".exe",".msi",".apk",".aab")]
    if not existing:
        return
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    zip_path = BACKUPS / f"dist_backup_{ts}.zip"
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for f in existing:
            zf.write(f, f.relative_to(ROOT))
    ok(f"Backup saved → {zip_path.name}  ({mb(zip_path)} MB)")
    # Prune old backups
    backups = sorted(BACKUPS.glob("dist_backup_*.zip"))
    for old in backups[:-MAX_BACKUPS]:
        old.unlink()
        info(f"Pruned old backup: {old.name}")

def list_backups():
    """List available backups."""
    backups = sorted(BACKUPS.glob("dist_backup_*.zip"))
    if not backups:
        print("  No backups found.")
        return []
    for i, b in enumerate(backups):
        print(f"  [{i}] {b.name}  ({mb(b)} MB)")
    return backups

def _is_jdk(java_home: Path) -> bool:
    """Return True if java_home contains a Java compiler (real JDK, not JRE)."""
    javac = java_home / "bin" / ("javac.exe" if IS_WINDOWS else "javac")
    return javac.exists()

def _find_jdk_env() -> dict | None:
    """Return {'JAVA_HOME': '<jdk-path>'} for the best available JDK, or None.

    Priority:
      1. Existing JAVA_HOME if it already has javac (already a JDK — nothing to do)
      2. Android Studio's bundled JBR (auto-installed with Android Studio)
      3. Gradle toolchain cache  (~/.gradle/jdks/)
      4. Common Windows install roots (Adoptium, Microsoft, Zulu, Corretto, Oracle)
      5. Common Linux /usr/lib/jvm entries
      6. macOS /Library/Java/JavaVirtualMachines
    Prefers JDK 17+; falls back to any JDK with javac present.
    """
    # 1. Current JAVA_HOME is already a JDK
    current = os.environ.get("JAVA_HOME", "")
    if current and _is_jdk(Path(current)):
        return None  # nothing to change

    if current:
        warn(f"JAVA_HOME='{current}' has no javac (JRE, not JDK). Searching...")

    candidates: list[Path] = []

    if IS_WINDOWS:
        local = Path(os.environ.get("LOCALAPPDATA", "C:/Users/Public"))
        appdata = Path(os.environ.get("APPDATA", "C:/Users/Public"))
        home = Path(os.environ.get("USERPROFILE", "C:/Users/Public"))

        # Android Studio ships a bundled JBR (JetBrains Runtime = full JDK)
        for as_root in [
            local / "Programs" / "Android Studio" / "jbr",
            local / "Programs" / "Android Studio" / "jre",
            Path("C:/Program Files/Android/Android Studio/jbr"),
            Path("C:/Program Files/Android/Android Studio/jre"),
        ]:
            if as_root.exists():
                candidates.append(as_root)

        # Gradle auto-provisions JDKs here when toolchain resolution is used
        gradle_jdks = home / ".gradle" / "jdks"
        if gradle_jdks.exists():
            for sub in sorted(gradle_jdks.iterdir(), reverse=True):
                if sub.is_dir():
                    candidates.append(sub)

        # Standard install roots
        pf = Path("C:/Program Files")
        for vendor_dir in [
            pf / "Eclipse Adoptium",
            pf / "Microsoft",
            pf / "BellSoft",
            pf / "Amazon Corretto",
            pf / "Zulu",
            pf / "Java",
        ]:
            if vendor_dir.exists():
                for sub in sorted(vendor_dir.iterdir(), reverse=True):
                    if sub.is_dir() and "jdk" in sub.name.lower():
                        candidates.append(sub)

    elif platform.system() == "Linux":
        as_linux = Path.home() / ".local/share/Google/AndroidStudio/jbr"
        if as_linux.exists():
            candidates.append(as_linux)
        jvm_root = Path("/usr/lib/jvm")
        if jvm_root.exists():
            for sub in sorted(jvm_root.iterdir(), reverse=True):
                if sub.is_dir() and ("jdk" in sub.name.lower() or "java" in sub.name.lower()):
                    candidates.append(sub)

    elif platform.system() == "Darwin":
        for as_mac in [
            Path("/Applications/Android Studio.app/Contents/jbr/Contents/Home"),
            Path("/Applications/Android Studio.app/Contents/jre/Contents/Home"),
        ]:
            if as_mac.exists():
                candidates.append(as_mac)
        vm_root = Path("/Library/Java/JavaVirtualMachines")
        if vm_root.exists():
            for sub in sorted(vm_root.iterdir(), reverse=True):
                home_path = sub / "Contents/Home"
                if home_path.exists():
                    candidates.append(home_path)

    # Prefer JDK 17+
    preferred = [c for c in candidates if _is_jdk(c) and any(
        f"jdk-{v}" in c.name.lower() or f"jdk{v}" in c.name.lower() or f"-{v}" in c.name
        for v in range(17, 30)
    )]
    fallback = [c for c in candidates if _is_jdk(c)]
    chosen = (preferred or fallback or [None])[0]

    if chosen:
        ok(f"Using JDK for Gradle: {chosen}")
        return {"JAVA_HOME": str(chosen)}

    warn("No JDK with javac found anywhere.")
    warn("  AAB build will fail. Install JDK 17+ from: https://adoptium.net")
    warn("  Then set JAVA_HOME=<jdk-path> before running this script.")
    return None

def restore_backup():
    """Restore a previous dist/ backup."""
    header("Restore Backup")
    backups = list_backups()
    if not backups:
        return
    choice = input("\n  Enter backup number to restore (or Enter to cancel): ").strip()
    if not choice.isdigit() or int(choice) >= len(backups):
        print("  Cancelled.")
        return
    zip_path = backups[int(choice)]
    info(f"Restoring {zip_path.name} ...")
    with zipfile.ZipFile(zip_path) as zf:
        zf.extractall(ROOT)
    ok("Restore complete.")

# ── Step 0: Target selection ──────────────────────────────────────────────────
def select_targets(args):
    # Returns (windows, android, webview, linux, macos, ios)
    if args.all:     return True, True, True, True, True, True
    if args.windows: return True, False, False, False, False, False
    if args.android: return False, True, False, False, False, False
    if args.webview: return False, False, True, False, False, False
    if args.linux:   return False, False, False, True, False, False
    if args.macos:   return False, False, False, False, True, False
    if args.ios:     return False, False, False, False, False, True

    header("Crit 2048 -- Master Build System")
    cur_os = platform.system()
    print(f"""
  {C.BOLD}Select build targets:{C.RESET}

    [1]  Windows only    (EXE + MSI)              {'[current OS]' if cur_os=='Windows' else ''}
    [2]  Android only    (APK + AAB)
    [3]  Webview only    (static HTML bundle)
    [4]  Linux only      (AppImage + .deb)         {'[current OS]' if cur_os=='Linux' else ''}
    [5]  macOS only      (DMG)                     {'[current OS]' if cur_os=='Darwin' else ''}
    [6]  iOS only        (IPA — requires macOS)    {'[current OS]' if cur_os=='Darwin' else ''}
    [7]  Windows + Android
    [8]  ALL available targets
    [b]  Restore a backup
    [q]  Quit
""")
    choice = input("  Enter choice [1-8/b/q] (default=8): ").strip().lower()

    if choice == "q":  sys.exit(0)
    if choice == "b":  restore_backup(); sys.exit(0)
    if choice in ("", "8"): return True, True, True, True, True, True
    if choice == "1": return True, False, False, False, False, False
    if choice == "2": return False, True, False, False, False, False
    if choice == "3": return False, False, True, False, False, False
    if choice == "4": return False, False, False, True, False, False
    if choice == "5": return False, False, False, False, True, False
    if choice == "6": return False, False, False, False, False, True
    if choice == "7": return True, True, False, False, False, False
    err(f"Invalid choice: {choice}"); sys.exit(1)

# ── Step 1: Version management ────────────────────────────────────────────────
def get_current_version():
    pkg = json.loads((ROOT / "package.json").read_text())
    return pkg.get("version", "0.0.0")

def step_version():
    step(1, "Version Management")
    current = get_current_version()
    ok(f"Current version: {current}")
    new_ver = input(f"\n  New version (semver) or Enter to keep [{current}]: ").strip()
    if new_ver:
        rc, _ = node(["scripts/update-version.js", new_ver])
        if rc != 0:
            err("Version update failed."); sys.exit(1)
        ok(f"Version bumped to {new_ver}")
        return new_ver
    ok(f"Keeping version: {current}")
    return current

# ── Step 2: Prerequisites ─────────────────────────────────────────────────────
def check_cmd(name, cmd, install_hint=""):
    rc, out = run(cmd, capture=True)
    if rc == 0:
        ver = out.strip().split("\n")[0][:60]
        ok(f"{name}: {ver}")
        return True
    else:
        err(f"{name} not found.  {install_hint}")
        return False

def step_prereqs(do_android):
    step(2, "Prerequisite Checks")
    fail = False

    if not check_cmd("Node.js",    ["node", "--version"],   "https://nodejs.org"):       fail = True
    if not check_cmd("npm",        ["npm",  "--version"],   "bundled with Node.js"):     fail = True
    if not check_cmd("Rust/Cargo", ["cargo","--version"],   "https://rustup.rs"):        fail = True

    # Tauri CLI
    rc, _ = run(["npm", "list", "--depth=0", "@tauri-apps/cli"], capture=True)
    if rc == 0: ok("Tauri CLI found in node_modules")
    else: err("Tauri CLI missing — run: npm install -D @tauri-apps/cli"); fail = True

    # Tailwind
    tw = ROOT/"node_modules/.bin/tailwindcss"
    tw_cmd = ROOT/"node_modules/.bin/tailwindcss.cmd"
    if tw.exists() or tw_cmd.exists(): ok("Tailwind CLI found")
    else: err("Tailwind CLI missing — run: npm install -D @tailwindcss/cli"); fail = True

    # Vendor files
    for vfile in ["vendor/three.min.js", "vendor/html2canvas.min.js",
                  "vendor/fonts/Cinzel-Regular.ttf"]:
        p = ROOT / vfile
        if p.exists(): ok(f"{vfile} present")
        else: err(f"Missing: {vfile}"); fail = True

    if do_android:
        print()
        info("Android SDK environment...")
        android_home = os.environ.get("ANDROID_HOME", "")
        if android_home: ok(f"ANDROID_HOME = {android_home}")
        else:            warn("ANDROID_HOME not set — Gradle may fail")

        java_home = os.environ.get("JAVA_HOME", "")
        if java_home: ok(f"JAVA_HOME = {java_home}")
        else:         warn("JAVA_HOME not set — need JDK 17+ (https://adoptium.net)")

        jks = SRC_TAURI / "gen/android/app/release.jks"
        kp  = SRC_TAURI / "gen/android/app/keystore.properties"
        if jks.exists():  ok("Keystore found: release.jks")
        else:             err(f"Keystore missing: {jks}"); fail = True
        if kp.exists():   ok("keystore.properties found")
        else:             err(f"keystore.properties missing: {kp}"); fail = True

    if fail:
        err("Fix prerequisites above, then re-run.")
        sys.exit(1)
    ok("All prerequisites satisfied.")

# ── Step 3: Clean dist ────────────────────────────────────────────────────────
def step_clean(do_windows, do_android, do_webview, version):
    step(3, "Backup + Clean Previous Deliverables")
    backup_dist()
    targets = []
    if do_windows: targets.append("windows")
    if do_android: targets.append("android")
    if do_webview: targets.append("webview")
    for t in targets:
        d = DIST / t
        d.mkdir(parents=True, exist_ok=True)
        for f in d.iterdir():
            if f.is_file() and f.name not in (".gitkeep", ".gitignore"):
                f.unlink()
        ok(f"Cleaned dist/{t}/")

# ── Step 4: Web assets ────────────────────────────────────────────────────────
def step_web_assets():
    step(4, "Prepare Web Assets (Tailwind + .web-build)")
    info("Running: npm run prebuild ...")
    rc, _ = npm(["run", "prebuild"])
    # Tailwind exits non-zero on Windows due to ANSI codes — check files instead
    index = WEB_BUILD / "index.html"
    tw_css = WEB_BUILD / "css/tailwind.css"
    vendor = WEB_BUILD / "vendor/three.min.js"
    if not index.exists():
        err(f".web-build/index.html missing. Check {LOG_FILE}"); sys.exit(1)
    if not tw_css.exists():
        err("tailwind.css not generated."); sys.exit(1)
    if not vendor.exists():
        err("vendor/ not copied."); sys.exit(1)
    ok("Web assets prepared — Tailwind CSS built, vendor/ bundled, fonts included.")

# ── Step 5: Windows build ─────────────────────────────────────────────────────
def step_windows(version):
    step(5, "Windows Build  [EXE + MSI]")
    info("Running: npx tauri build  (3–10 min first build)...")
    rc, _ = npx(["tauri", "build"])
    if rc != 0:
        err(f"Windows build failed. Check {LOG_FILE}")
        err("Common causes:")
        err("  - Developer Mode OFF (Settings > Privacy > For Developers > On)")
        err("  - Missing MSVC Build Tools: https://aka.ms/vs/buildtools")
        sys.exit(rc)

    bundle = SRC_TAURI / "target/release/bundle"
    copied = 0

    for src in (bundle / "nsis").glob("*.exe"):
        dst = DIST / "windows" / f"Crit2048_v{version}_Windows_Installer.exe"
        shutil.copy2(src, dst)
        ok(f"EXE  -->  {dst.name}  ({mb(dst)} MB)")
        log(f"Windows EXE: {dst}  ({mb(dst)} MB)")
        copied += 1

    for src in (bundle / "msi").glob("*.msi"):
        dst = DIST / "windows" / f"Crit2048_v{version}_Windows.msi"
        shutil.copy2(src, dst)
        ok(f"MSI  -->  {dst.name}  ({mb(dst)} MB)")
        log(f"Windows MSI: {dst}  ({mb(dst)} MB)")
        copied += 1

    if copied == 0:
        err("Build succeeded but no EXE/MSI found in target/release/bundle/")
        sys.exit(1)

# ── Step 6: Android build ─────────────────────────────────────────────────────
def step_android(version):
    step(6, "Android Build  [APK + AAB]")

    if not ANDROID.exists():
        info("Android project not initialised — running: npx tauri android init")
        rc, _ = npx(["tauri", "android", "init"])
        if rc != 0: err("Android init failed."); sys.exit(1)

    # APK
    info("Building signed APK  (5–15 min first build)...")
    rc, _ = npx(["tauri", "android", "build"])
    if rc != 0:
        err(f"Android APK build failed. Check {LOG_FILE}")
        err("Common: ANDROID_HOME/JAVA_HOME not set, NDK missing, keystore mismatch")
        sys.exit(rc)

    copied = 0

    # Find and copy APK (multiple fallback paths)
    apk_paths = [
        ANDROID / "app/build/outputs/apk/universal/release/app-universal-release.apk",
        ANDROID / "app/build/outputs/apk/universal/release/app-universal-release-unsigned.apk",
    ]
    # Also check arm64 folder
    apk_paths += list((ANDROID / "app/build/outputs/apk/release").glob("*.apk"))

    for src in apk_paths:
        if src.exists():
            suffix = "_unsigned" if "unsigned" in src.name else ""
            dst = DIST / "android" / f"Crit2048_v{version}_Android{suffix}.apk"
            shutil.copy2(src, dst)
            ok(f"APK  -->  {dst.name}  ({mb(dst)} MB)")
            log(f"Android APK: {dst}  ({mb(dst)} MB)")
            copied += 1
            break

    # ── AAB via Gradle ─────────────────────────────────────────────────────────
    info("Building AAB for Play Store  (gradlew bundleRelease)...")
    gradlew = "gradlew.bat" if IS_WINDOWS else "./gradlew"

    # Gradle needs a full JDK (javac). If JAVA_HOME points at a bare JRE
    # (jre1.8 / jre...) the build fails with "Toolchain does not provide JAVA_COMPILER".
    # Auto-detect the best available JDK and inject it only for this call.
    gradle_env = _find_jdk_env()

    rc2, _ = run([gradlew, "bundleRelease"], cwd=ANDROID, env=gradle_env)
    if rc2 != 0:
        warn("AAB build failed — APK still available. Fix: install JDK 17+ and set")
        warn("  JAVA_HOME=<path-to-jdk>  (not a JRE).  Adoptium: https://adoptium.net")
        warn(f"  Manual retry: cd \"{ANDROID}\"  &&  {gradlew} bundleRelease")
    else:
        aab_paths = [
            ANDROID / "app/build/outputs/bundle/universalRelease/app-universal-release.aab",
            ANDROID / "app/build/outputs/bundle/release/app-release.aab",
        ]
        # Wildcard fallback — catches any Gradle variant name
        if (ANDROID / "app/build/outputs/bundle").exists():
            aab_paths += list((ANDROID / "app/build/outputs/bundle").rglob("*.aab"))
        aab_found = False
        for src in aab_paths:
            if src.exists():
                dst = DIST / "android" / f"Crit2048_v{version}_Android_PlayStore.aab"
                shutil.copy2(src, dst)
                ok(f"AAB  -->  {dst.name}  ({mb(dst)} MB)")
                log(f"Android AAB: {dst}  ({mb(dst)} MB)")
                copied += 1
                aab_found = True
                break
        if not aab_found:
            warn("AAB not found after bundleRelease — check Gradle output above.")

    if copied == 0:
        err("Android build finished but no APK/AAB found.")
        sys.exit(1)


# ── Step 6b: Linux build ────────────────────────────────────────────────────
def step_linux(version):
    step(6, "Linux Build  [AppImage + .deb]")
    if platform.system() != "Linux":
        warn("Skipping Linux build — not running on Linux.")
        warn("To build: run this script on a Linux machine or CI runner.")
        return
    info("Running: npx tauri build ...")
    rc, _ = npx(["tauri", "build"])
    if rc != 0:
        err(f"Linux build failed. Check {LOG_FILE}"); return
    bundle = SRC_TAURI / "target/release/bundle"
    copied = 0
    if (bundle / "appimage").exists():
        for src in (bundle / "appimage").glob("*.AppImage"):
            dst = DIST / "linux" / f"Crit2048_v{version}_Linux.AppImage"
            shutil.copy2(src, dst); ok(f"AppImage --> {dst.name}  ({mb(dst)} MB)"); copied += 1; break
    if (bundle / "deb").exists():
        for src in (bundle / "deb").glob("*.deb"):
            dst = DIST / "linux" / f"Crit2048_v{version}_Linux.deb"
            shutil.copy2(src, dst); ok(f"deb      --> {dst.name}  ({mb(dst)} MB)"); copied += 1; break
    if copied == 0:
        warn("Linux build succeeded but no AppImage/deb found.")


# ── Step 6c: macOS build ────────────────────────────────────────────────────
def step_macos(version):
    step(6, "macOS Build  [DMG]")
    if platform.system() != "Darwin":
        warn("Skipping macOS build — not running on macOS.")
        warn("Requires: macOS + Xcode Command Line Tools (xcode-select --install)")
        return
    info("Running: npx tauri build ...")
    rc, _ = npx(["tauri", "build"])
    if rc != 0:
        err(f"macOS build failed. Check {LOG_FILE}"); return
    bundle = SRC_TAURI / "target/release/bundle"
    if (bundle / "dmg").exists():
        for src in (bundle / "dmg").glob("*.dmg"):
            dst = DIST / "macos" / f"Crit2048_v{version}_macOS.dmg"
            shutil.copy2(src, dst); ok(f"DMG --> {dst.name}  ({mb(dst)} MB)"); break
    else:
        warn("macOS build done but no DMG found.")


# ── Step 6d: iOS build ────────────────────────────────────────────────────────
def step_ios(version):
    step(6, "iOS Build  [IPA]")
    if platform.system() != "Darwin":
        err("iOS builds require macOS with Xcode installed.")
        err("Install Xcode from the App Store then re-run on macOS.")
        return
    ios_project = SRC_TAURI / "gen/apple"
    if not ios_project.exists():
        info("iOS project not initialised — running: npx tauri ios init")
        rc, _ = npx(["tauri", "ios", "init"])
        if rc != 0: err("iOS init failed."); return
    info("Building iOS IPA  (requires Apple Developer provisioning)...")
    rc, _ = npx(["tauri", "ios", "build"])
    if rc != 0:
        err(f"iOS build failed. Check {LOG_FILE}")
        err("Ensure: Apple Developer account, provisioning profile, code signing cert.")
        return
    found = False
    for src in (SRC_TAURI / "gen/apple").rglob("*.ipa"):
        dst = DIST / "ios" / f"Crit2048_v{version}_iOS.ipa"
        shutil.copy2(src, dst); ok(f"IPA --> {dst.name}  ({mb(dst)} MB)"); found = True; break
    if not found:
        warn("iOS build done but IPA not found — check Xcode Organizer for the archive.")

# ── Step 7: Webview bundle ────────────────────────────────────────────────────
def step_webview():
    step(7, "Webview Bundle  [static offline HTML]")
    dst = DIST / "webview"
    dst.mkdir(parents=True, exist_ok=True)
    info("Copying .web-build --> dist/webview/ ...")
    shutil.copytree(WEB_BUILD, dst, dirs_exist_ok=True)
    icon = ROOT / "app_icon.png"
    if icon.exists(): shutil.copy2(icon, dst)
    total = sum(f.stat().st_size for f in dst.rglob("*") if f.is_file())
    ok(f"Webview bundle  -->  dist/webview/  ({round(total/1048576,1)} MB total)")
    ok("Open dist/webview/index.html in any browser to play offline.")


def _ensure_dist_dirs(do_windows, do_android, do_webview, do_linux, do_macos, do_ios):
    """Create all required dist subdirectories."""
    dirs = []
    if do_windows: dirs.append("windows")
    if do_android: dirs.append("android")
    if do_webview: dirs.append("webview")
    if do_linux:   dirs.append("linux")
    if do_macos:   dirs.append("macos")
    if do_ios:     dirs.append("ios")
    for d in dirs:
        (DIST / d).mkdir(parents=True, exist_ok=True)

# ── Step 8: Summary ───────────────────────────────────────────────────────────
def step_summary(version, do_windows, do_android, do_webview, do_linux, do_macos, do_ios, t_start):
    step(8, "Build Summary")
    elapsed = round(datetime.now().timestamp() - t_start, 1)
    print(f"\n  {C.BOLD}{C.WHITE}Crit 2048 v{version} -- Build Complete{C.RESET}")
    print(f"  Elapsed: {elapsed}s\n")

    for label, flag, subdir, exts in [
        ("Windows", do_windows, "windows", (".exe",".msi")),
        ("Android", do_android, "android", (".apk",".aab")),
        ("Linux",   do_linux,   "linux",   (".AppImage",".deb")),
        ("macOS",   do_macos,   "macos",   (".dmg",)),
        ("iOS",     do_ios,     "ios",     (".ipa",)),
    ]:
        if not flag: continue
        d = DIST / subdir
        if not d.exists(): continue
        files = [f for f in d.iterdir() if f.is_file() and f.suffix in exts]
        if files:
            print(f"  {C.CYAN}dist/{subdir}/{C.RESET}")
            for f in files:
                print(f"    {C.GREEN}[OK]{C.RESET}  {f.name}  {C.DIM}({mb(f)} MB){C.RESET}")
        else:
            print(f"  {C.YELLOW}dist/{subdir}/{C.RESET}  (no artifacts — may have been skipped on this OS)")

    if do_webview:
        print(f"  {C.CYAN}dist/webview/{C.RESET}  (open index.html in any browser)")

    print(f"\n  {C.DIM}Full log: {LOG_FILE}{C.RESET}")
    print(f"  {C.DIM}Backups:  {BACKUPS}{C.RESET}\n")

# ── Entry point ───────────────────────────────────────────────────────────────
def main():
    enable_ansi()

    parser = argparse.ArgumentParser(description="Crit 2048 Build System")
    parser.add_argument("--windows", action="store_true")
    parser.add_argument("--android", action="store_true")
    parser.add_argument("--webview", action="store_true")
    parser.add_argument("--linux",   action="store_true", help="Linux AppImage + deb (Linux only)")
    parser.add_argument("--macos",   action="store_true", help="macOS DMG (macOS only)")
    parser.add_argument("--ios",     action="store_true", help="iOS IPA (macOS + Xcode only)")
    parser.add_argument("--all",     action="store_true")
    parser.add_argument("--restore", action="store_true", help="Restore a backup")
    args = parser.parse_args()

    log_open()
    t_start = datetime.now().timestamp()

    if args.restore:
        restore_backup(); log_close(); return

    do_windows, do_android, do_webview, do_linux, do_macos, do_ios = select_targets(args)
    version = step_version()
    step_prereqs(do_android)

    # Clean and create all dist subdirs
    step_clean(do_windows, do_android, do_webview, version)
    _ensure_dist_dirs(do_windows, do_android, do_webview, do_linux, do_macos, do_ios)

    step_web_assets()
    if do_windows: step_windows(version)
    if do_android: step_android(version)
    if do_linux:   step_linux(version)
    if do_macos:   step_macos(version)
    if do_ios:     step_ios(version)
    if do_webview: step_webview()
    step_summary(version, do_windows, do_android, do_webview, do_linux, do_macos, do_ios, t_start)

    log_close()

if __name__ == "__main__":
    main()
