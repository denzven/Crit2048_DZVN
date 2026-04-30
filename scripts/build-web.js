const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const BUILD_DIR = path.join(ROOT, '.web-build');

// 1. Clean and recreate build directory
if (fs.existsSync(BUILD_DIR)) {
  fs.rmSync(BUILD_DIR, { recursive: true, force: true });
}
fs.mkdirSync(BUILD_DIR, { recursive: true });

// 2. Regenerate Tailwind static CSS from source (fully offline, Play Store safe)
console.log('Rebuilding Tailwind static CSS...');
try {
  const tailwindBin = path.join(ROOT, 'node_modules', '.bin', 'tailwindcss');
  const inputCss = path.join(ROOT, 'css', 'tailwind-input.css');
  const outputCss = path.join(ROOT, 'css', 'tailwind.css');
  execSync(`"${tailwindBin}" -i "${inputCss}" -o "${outputCss}" --minify`, {
    cwd: ROOT,
    stdio: 'inherit'
  });
  console.log('Tailwind CSS built successfully.');
} catch (e) {
  // Non-fatal: Tailwind CLI exits 1 on Windows with ANSI codes but still writes output
  if (!fs.existsSync(path.join(ROOT, 'css', 'tailwind.css'))) {
    console.error('WARNING: Tailwind CSS build failed and output file not found!');
  } else {
    console.log('Tailwind CSS output confirmed.');
  }
}

// 3. Copy all required source directories/files to .web-build
const toCopy = ['index.html', 'original.html', 'js', 'css', 'vendor'];

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else if (exists) {
    fs.copyFileSync(src, dest);
  }
}

toCopy.forEach((item) => {
  const src = path.join(ROOT, item);
  const dest = path.join(BUILD_DIR, item);
  if (fs.existsSync(src)) {
    console.log(`Copying ${item} to .web-build...`);
    copyRecursiveSync(src, dest);
  } else {
    console.warn(`WARNING: Source not found, skipping: ${item}`);
  }
});

console.log('Web build complete.');

