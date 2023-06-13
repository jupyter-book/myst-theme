const fs = require('fs');
const path = require('path');

if (process.argv.length < 3) {
  console.error('Usage: node copyThebeAssets.cjs <output_dir>');
  process.exit(1);
}

const outputDir = process.argv[2];

if (!fs.existsSync(outputDir)) {
  console.log(`Output directory ${outputDir} does not exist, creating...`);
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('Copying thebe assets...');

try {
  require.resolve('thebe-core');
} catch (err) {
  console.error('thebe-core not found, please run `npm install` in the theme directory.');
  process.exit(1);
}

try {
  require.resolve('thebe-lite');
} catch (err) {
  console.error('thebe-lite not found, please run `npm install` in the theme directory.');
  process.exit(1);
}

const pathToThebeCore = path.resolve(
  path.join(path.dirname(require.resolve('thebe-core')), '..', 'lib', 'thebe-core.min.js'),
);

const assets = [
  pathToThebeCore,
  path.join(path.dirname(pathToThebeCore), 'thebe-core.css'),
  require.resolve('thebe-lite'),
];

console.log('Found thebe assets:');
console.log(assets);
console.log(`Copying assets to ${outputDir} now...`);

for (const asset of assets) {
  const basename = path.basename(asset);
  const dest = path.join(outputDir, basename);
  fs.copyFileSync(asset, dest);
  console.log(`Copied ${basename} to ${dest}`);
}

console.log('Done.');
