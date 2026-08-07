/* ============================================================
   VPL Season 1 · UNITY — live roster overrides (Netlify Blobs).

   GET  /.netlify/functions/roster           → { roster: {...} }   (public)
   PUT  /.netlify/functions/roster           → save                (organiser only)
        headers: x-vpl-token: <token from /auth>
        body:    { roster: { reassign:{id:teamId}, added:[player], removed:[id] } }

   Layered on top of the auction results (results.js) so players can be moved,
   removed (unavailable) or added (new registrations) live — no code changes.
   ============================================================ */
import { getStore } from '@netlify/blobs';
import { deleteToken } from './auth.mjs';

const STORE = 'season-1-rosters';
const KEY = 'state';

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

export default async (req) => {
  const store = getStore({ name: STORE, consistency: 'strong' });

  if (req.method === 'GET') {
    const data = await store.get(KEY, { type: 'json' });
    return json({ roster: (data && data.roster) ? data.roster : { reassign: {}, added: [], removed: [] } });
  }

  if (req.method === 'PUT' || req.method === 'POST') {
    const secret = process.env.auction_unlock;
    if (!secret) return json({ error: 'auth not configured' }, 500);
    if ((req.headers.get('x-vpl-token') || '') !== deleteToken(secret)) {
      return json({ error: 'unauthorized' }, 401);
    }
    let body;
    try { body = await req.json(); } catch { return json({ error: 'invalid json' }, 400); }
    const r = body && body.roster ? body.roster : {};
    const roster = {
      reassign: r.reassign && typeof r.reassign === 'object' ? r.reassign : {},
      added: Array.isArray(r.added) ? r.added : [],
      removed: Array.isArray(r.removed) ? r.removed : [],
    };
    await store.setJSON(KEY, { roster, updatedAt: new Date().toISOString() });
    return json({ ok: true });
  }

  return json({ error: 'method not allowed' }, 405);
};
