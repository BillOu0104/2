import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
if (!process.argv.includes('--dist')) { const result = spawnSync(process.execPath, ['tools/build.mjs'], { cwd: root, stdio: 'inherit' }); if (result.status) process.exit(result.status); }
const dir = path.join(root, 'dist');
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webp': 'image/webp', '.otf': 'font/otf', '.ttf': 'font/ttf', '.flac': 'audio/flac' };
const server = createServer(async (req, res) => {
  try {
    const target = path.resolve(dir, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    if (target !== dir && !target.startsWith(dir + path.sep)) { res.writeHead(403); res.end(); return; }
    const file = (await stat(target)).isDirectory() ? path.join(target, 'index.html') : target;
    const data = await readFile(file); res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' }); res.end(data);
  } catch { res.writeHead(404); res.end('Not found'); }
});
const port = Number(process.env.PORT || 4173); server.listen(port, '0.0.0.0', () => console.log(`Local: http://localhost:${port}`));
