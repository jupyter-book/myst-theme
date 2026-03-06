const fs = require('fs');
const path = require('path');

if (process.argv.length < 3) {
  console.error('Usage: bun run copyThebeAssets.cjs <output_dir>');
  process.exit(1);
}

const outputDir = process.argv[2];

if (!fs.existsSync(outputDir)) {
  console.log(`Output directory ${outputDir} does not exist, creating...`);
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('Copying thebe assets...');

// Resolve thebe-core and thebe-lite via @myst-theme/jupyter, where they are
// direct dependencies. This avoids pinning transitive dep versions in themes.
let jupyterDir;
try {
  jupyterDir = path.dirname(require.resolve('@myst-theme/jupyter/package.json', { paths: [process.cwd()] }));
} catch (err) {
  console.error('@myst-theme/jupyter not found, please run `bun install` in the theme directory.');
  process.exit(1);
}

const resolveFromJupyter = (pkg) => {
  try {
    return require.resolve(pkg, { paths: [jupyterDir] });
  } catch (err) {
    console.error(`${pkg} not found, please run \`bun install\` in the theme directory.`);
    process.exit(1);
  }
};

const pathToThebeCoreLibFolder = path.resolve(
  path.dirname(resolveFromJupyter('thebe-core')),
  '..',
  'lib',
);
const thebeCoreFiles = fs.readdirSync(pathToThebeCoreLibFolder)
  .filter((f) => f.endsWith('.js'))
  .map((f) => path.join(pathToThebeCoreLibFolder, f));

const pathToThebeLite = path.dirname(resolveFromJupyter('thebe-lite'));
const thebeLiteFiles = fs.readdirSync(pathToThebeLite)
  .filter((f) => f.endsWith('.js'))
  .map((f) => path.join(pathToThebeLite, f));

const assets = [
  ...thebeCoreFiles,
  path.join(pathToThebeCoreLibFolder, 'thebe-core.css'),
  ...thebeLiteFiles,
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
