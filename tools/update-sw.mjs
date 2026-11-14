#!/usr/bin/env node
// Regenerates the precache list + version hash inside sw.js. Run before every deploy (CI does it).
import fs from 'node:fs'; import path from 'node:path'; import crypto from 'node:crypto'; import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// data/ is NOT precached wholesale: only the file the public app needs (the graph/directory files are for the internal viewer)
const INCLUDE = ['index.html', 'manifest.webmanifest', 'css/app.css', 'js', 'vendor', 'data/sheba.json', 'data/topology.json', 'data/clinics-directory.json', 'data/tests-directory.json', 'icons', 'photos'];
const SKIP = /js\/graph\//;
const files = [];
const walk = rel => {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) return;
  if (fs.statSync(abs).isDirectory()) for (const f of fs.readdirSync(abs).sort()) walk(path.posix.join(rel, f));
  else if (!/\.(md|map)$/.test(rel) && !/LICENSE/.test(rel) && !SKIP.test(rel)) files.push(rel);
};
INCLUDE.forEach(walk);
const hash = crypto.createHash('sha1');
for (const f of files) { hash.update(f); hash.update(fs.readFileSync(path.join(ROOT, f))); }
const version = hash.digest('hex').slice(0, 10);
const list = ['./', ...files.map(f => './' + f)];
const sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
const out = sw.replace(/\/\/ BEGIN GENERATED[\s\S]*?\/\/ END GENERATED/, `// BEGIN GENERATED\nconst VERSION = '${version}';\nconst PRECACHE = ${JSON.stringify(list, null, 1)};\n// END GENERATED`);
fs.writeFileSync(path.join(ROOT, 'sw.js'), out);
console.log(`sw.js: version ${version}, ${list.length} files precached`);
