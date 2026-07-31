/* ============================================================
   VPL — player photo upload/serve, backed by Netlify Blobs.

   GET  /.netlify/functions/player-photo?id=p01   → returns the JPEG (or 404)
   POST /.netlify/functions/player-photo           → { id, dataUrl } stores it

   The client sends a small square JPEG data URL (compressed in the browser),
   so blobs stay tiny. Store name: "player-photos", key: the player id.
   ============================================================ */
import { getStore } from '@netlify/blobs';
import { deleteToken } from './auth.mjs';

const MAX_BYTES = 3 * 1024 * 1024;          // 3 MB safety cap
const ID_RE = /^p\d{2,3}$/;                 // player ids look like p01 … p138

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export default async (req) => {
  // strong consistency → an uploaded photo reads back immediately (no ~60s lag)
  const store = getStore({ name: 'player-photos', consistency: 'strong' });
  const url = new URL(req.url);

  // ---------- serve a photo ----------
  if (req.method === 'GET') {
    const id = url.searchParams.get('id');
    if (!id || !ID_RE.test(id)) return json({ error: 'bad id' }, 400);
    const data = await store.get(id, { type: 'arrayBuffer' });
    if (!data) return new Response('not found', { status: 404, headers: { 'Cache-Control': 'no-store' } });
    return new Response(data, {
      status: 200,
      headers: {
        'Content-Type': 'image/jpeg',
        // no-store so uploads/deletes reflect immediately on every page (no stale cache)
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  }

  // ---------- store a photo ----------
  if (req.method === 'POST') {
    let body;
    try { body = await req.json(); } catch { return json({ error: 'invalid json' }, 400); }
    const { id, dataUrl } = body || {};
    if (!id || !ID_RE.test(id)) return json({ error: 'bad id' }, 400);
    if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) {
      return json({ error: 'expected an image data URL' }, 400);
    }
    const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1);
    const bytes = Buffer.from(base64, 'base64');
    if (bytes.length === 0) return json({ error: 'empty image' }, 400);
    if (bytes.length > MAX_BYTES) return json({ error: 'image too large (max 3 MB)' }, 413);
    await store.set(id, bytes, { metadata: { contentType: 'image/jpeg' } });
    return json({ ok: true, id, bytes: bytes.length });
  }

  // ---------- delete a photo (organiser only) ----------
  if (req.method === 'DELETE') {
    const secret = process.env.auction_unlock;
    if (!secret) return json({ error: 'auth not configured' }, 500);
    const supplied = req.headers.get('x-vpl-token') || '';
    if (supplied !== deleteToken(secret)) return json({ error: 'unauthorized' }, 401);

    const id = url.searchParams.get('id');
    if (!id || !ID_RE.test(id)) return json({ error: 'bad id' }, 400);
    await store.delete(id);
    return json({ ok: true });
  }

  return json({ error: 'method not allowed' }, 405);
};
