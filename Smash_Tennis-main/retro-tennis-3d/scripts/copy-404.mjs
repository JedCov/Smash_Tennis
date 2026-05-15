import {copyFile, access} from 'node:fs/promises';
import path from 'node:path';

const distDir = path.resolve('dist');
const indexFile = path.join(distDir, 'index.html');
const fallbackFile = path.join(distDir, '404.html');

try {
  await access(indexFile);
  await copyFile(indexFile, fallbackFile);
  console.log('Created dist/404.html fallback for GitHub Pages.');
} catch (error) {
  console.error('Could not create GitHub Pages 404 fallback:', error);
  process.exit(1);
}
