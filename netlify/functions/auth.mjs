/* ============================================================
   VPL — organiser password check.

   POST /.netlify/functions/auth   body: { "password": "..." }
   → { ok: true } if it matches the Netlify env var `auction_unlock`.

   The real password lives ONLY in Netlify (Site settings → Environment
   variables → key `auction_unlock`). It is never in the repo or the
   client bundle. Set it in the Netlify dashboard for the site.
   ============================================================ */

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
  return json({ ok });
};
