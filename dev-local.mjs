/* ============================================================
   Lightweight local dev server (zero dependencies).

   Serves the static site AND the /.netlify/functions/auth function, so you can
   test the auction/admin "Unlock" flow locally without the full Netlify CLI.

   Photo upload/delete use Netlify Blobs, which only work under `netlify dev`
   (or on the deployed site) — here they return 404/501 and avatars fall back
   to initials. For full photo testing, use `netlify dev` instead.

   Run:  node dev-local.mjs        (reads .env for `auction_unlock`)
   Open: http://localhost:8899/seasons/season-1-unity/index.html
   ============================================================ */
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 8899;

// Load .env (simple KEY=VALUE; lines starting with # are comments)
const envPath = path.join(ROOT, '.env');
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    if (line.trim().startsWith('#')) continue;
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2];
  }
}

const TYPES = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.mjs': 'text/javascript', '.json': 'application/json', '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon', '.md': 'text/markdown', '.webp': 'image/webp',
};

async function readBody(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  return Buffer.concat(chunks);
}
function toWebRequest(req, bodyBuf) {
  const init = { method: req.method, headers: req.headers };
  if (!['GET', 'HEAD'].includes(req.method)) init.body = bodyBuf;
  return new Request('http://localhost:' + PORT + req.url, init);
}
async function sendWeb(res, wr) {
  const buf = Buffer.from(await wr.arrayBuffer());
  const headers = {}; wr.headers.forEach((v, k) => (headers[k] = v));
  res.writeHead(wr.status, headers);
  res.end(buf);
}

const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://localhost:' + PORT);

  // --- Netlify functions ---
  if (u.pathname.startsWith('/.netlify/functions/')) {
    const name = u.pathname.split('/').pop();
    const bodyBuf = await readBody(req);
    try {
      if (name === 'auth') {
        const mod = await import('./netlify/functions/auth.mjs');
        return sendWeb(res, await mod.default(toWebRequest(req, bodyBuf)));
      }
      // player-photo needs Netlify Blobs — not available in this lite server
      res.writeHead(req.method === 'GET' ? 404 : 501, { 'content-type': 'application/json' });
      return res.end(JSON.stringify({ error: 'photos need `netlify dev` (Netlify Blobs)' }));
    } catch (e) {
      res.writeHead(500, { 'content-type': 'application/json' });
      return res.end(JSON.stringify({ error: String(e) }));
    }
  }

  // --- static files ---
  let p = decodeURIComponent(u.pathname);
  if (p.endsWith('/')) p += 'index.html';
  const file = path.normalize(path.join(ROOT, p));
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end('forbidden'); }
  try {
    const data = await readFile(file);
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  } catch { res.writeHead(404); res.end('not found'); }
});

server.listen(PORT, () => {
  const ok = process.env.auction_unlock ? 'set' : 'MISSING (create .env with auction_unlock=...)';
  console.log(`Local dev → http://localhost:${PORT}`);
  console.log(`  auction_unlock: ${ok}`);
  console.log(`  Unlock works here; photos need \`netlify dev\`.`);
});
