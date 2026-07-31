/* ============================================================
   VPL Season 1 · UNITY — live schedule/results state (Netlify Blobs).

   GET  /.netlify/functions/schedule            → { overrides: {...} }   (public)
   PUT  /.netlify/functions/schedule            → save overrides         (organiser only)
        headers: x-vpl-token: <token from /auth>
        body:    { overrides: { L01:{day,date,time,venue,result}, ... } }

   "overrides" is keyed by match id and layered on top of the static fixtures in
   schedule.js, so dates/times/venues and scores can be updated live during the season.
   ============================================================ */
import { getStore } from '@netlify/blobs';
import { deleteToken } from './auth.mjs';

const STORE = 'season-1-schedule';
const KEY = 'state';

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

export default async (req) => {
  // strong consistency → saved scores/times show to everyone immediately
  const store = getStore({ name: STORE, consistency: 'strong' });

  if (req.method === 'GET') {
    const data = await store.get(KEY, { type: 'json' });
    return json({ overrides: data && data.overrides ? data.overrides : {} });
  }

  if (req.method === 'PUT' || req.method === 'POST') {
    const secret = process.env.auction_unlock;
    if (!secret) return json({ error: 'auth not configured' }, 500);
    if ((req.headers.get('x-vpl-token') || '') !== deleteToken(secret)) {
      return json({ error: 'unauthorized' }, 401);
    }
    let body;
    try { body = await req.json(); } catch { return json({ error: 'invalid json' }, 400); }
    const overrides = body && body.overrides && typeof body.overrides === 'object' ? body.overrides : {};
    await store.setJSON(KEY, { overrides, updatedAt: new Date().toISOString() });
    return json({ ok: true, count: Object.keys(overrides).length });
  }

  return json({ error: 'method not allowed' }, 405);
};
