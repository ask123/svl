/* ============================================================
   VPL — organiser password check.

   POST /.netlify/functions/auth   body: { "password": "..." }
   → { ok: true } if it matches the Netlify env var `auction_unlock`.

   The real password lives ONLY in Netlify (Site settings → Environment
   variables → key `auction_unlock`). It is never in the repo or the
   client bundle. Set it in the Netlify dashboard for the site.
   ============================================================ */

import { createHmac } from 'node:crypto';

/* Shared with player-photo.mjs — a token derived from the secret, so the client
   can prove it authenticated (for privileged calls like photo delete) without
   ever storing the real password. */
export const DELETE_MESSAGE = 'vpl-photo-delete';
export function deleteToken(secret) {
  return createHmac('sha256', secret).update(DELETE_MESSAGE).digest('hex');
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

export default async (req) => {
  if (req.method !== 'POST') return json({ ok: false, error: 'method not allowed' }, 405);

  const expected = process.env.auction_unlock;
  if (!expected) return json({ ok: false, error: 'password not configured on the server' }, 500);

  let body;
  try { body = await req.json(); } catch { return json({ ok: false, error: 'invalid json' }, 400); }

  const supplied = body && typeof body.password === 'string' ? body.password : '';
  const ok = supplied.length > 0 && supplied === expected;
  // On success, return a derived token the client can present for privileged calls.
  return json(ok ? { ok: true, token: deleteToken(expected) } : { ok: false });
};
