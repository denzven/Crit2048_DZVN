const fs = require('fs');
const path = require('path');

const BUILD_DIR = path.join(__dirname, '..', '.web-build');

if (fs.existsSync(BUILD_DIR)) {
  fs.rmSync(BUILD_DIR, { recursive: true, force: true });
}
fs.mkdirSync(BUILD_DIR, { recursive: true });

const toCopy = ['index.html', 'original.html', 'js', 'css'];

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
  const src = path.join(__dirname, '..', item);
  const dest = path.join(BUILD_DIR, item);
  console.log(`Copying ${item} to .web-build...`);
  copyRecursiveSync(src, dest);
});

console.log('Web build complete.');
