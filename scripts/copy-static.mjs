import { cpSync, copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const output = resolve(root, 'dist');
const directories = ['images', 'css', 'js', 'Track', 'poc', 'server'];
const files = ['robots.txt', 'sitemap.xml', 'manifest.json', 'browserconfig.xml', 'CNAME', 'sw.js'];

mkdirSync(output, { recursive: true });

for (const directory of directories) {
  const source = resolve(root, directory);
  if (existsSync(source)) cpSync(source, resolve(output, directory), { recursive: true });
}

for (const file of files) {
  const source = resolve(root, file);
  if (existsSync(source)) copyFileSync(source, resolve(output, file));
}
