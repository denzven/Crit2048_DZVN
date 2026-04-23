const fs = require('fs');
const path = require('path');

const newVersion = process.argv[2];

if (!newVersion) {
    console.error('Error: No version provided. Usage: node update-version.js <version>');
    process.exit(1);
}

const packageJsonPath = path.join(__dirname, '..', 'package.json');
const tauriConfPath = path.join(__dirname, '..', 'src-tauri', 'tauri.conf.json');

// Update package.json
if (fs.existsSync(packageJsonPath)) {
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    pkg.version = newVersion;
    fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2), 'utf8');
    console.log(`Updated package.json version to ${newVersion}`);
}

// Update tauri.conf.json
if (fs.existsSync(tauriConfPath)) {
    const conf = JSON.parse(fs.readFileSync(tauriConfPath, 'utf8'));
    conf.version = newVersion;
    fs.writeFileSync(tauriConfPath, JSON.stringify(conf, null, 2), 'utf8');
    console.log(`Updated tauri.conf.json version to ${newVersion}`);
}
