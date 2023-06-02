import path from 'path';
import fs from 'fs-extra';

if (process.argv.length !== 3) {
  console.error('Usage: node copy-lite.ts <target-path>');
  process.exit(1);
}

const pathToThebeLiteLib = path.dirname(require.resolve('thebe-lite'));

fs.copySync(pathToThebeLiteLib, process.argv[2]);
console.log(`Copied thebe-lite/dist/lib to ${process.argv[2]}`);
