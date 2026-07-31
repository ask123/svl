# Volleyball Premier League (VPL) — project plan & handoff

A handoff doc so anyone (you, a future Claude session, or GitHub Copilot) can continue this
project with full context. Read this first.

---

## 1. What this is

**Volleyball Premier League (VPL)** — a friendly, auction-format volleyball tournament site
(rebranded from the old "Friendly VolleyBall League" / FVL).

- Players register on the site.
- Five team **owners** are drawn on auction night and build squads through a **live auction**.
- Each season has its own **theme**. **Season 1 = UNITY** (teams spell U-N-I-T-Y).

**Live site:** https://sydneyvbleague.netlify.app (Netlify project `sydneyvbleague`)
**Repo:** https://github.com/ask123/svl  (default branch `main`)
**Active work branch:** `season-1-unity` (open a PR → merge to `main` to deploy)

> The repo root **is** this `svl-main` folder (index.html sits at the site root).

---

## 2. Directory map

```
svl-main/                         ← repo root / Netlify publish dir
├── index.html                    Home (hero has a clickable Season 1 UNITY spotlight card)
├── register.html / register.js   Registration form → Netlify Forms
├── script.js                     Home: scroll-reveal + live player count on the S1 card
├── styles.css                    Base design system (shared)
├── netlify.toml                  publish=".", functions="netlify/functions"
├── package.json                  dep: @netlify/blobs (for photo storage)
├── .gitignore                    blocks *.csv, *.zip, .DS_Store, node_modules
├── plan.md                       ← this file
├── dev-local.mjs                 Zero-dep local server (static + auth) for testing Unlock
├── .env                          LOCAL ONLY, git-ignored: auction_unlock=... (create yourself)
├── netlify/functions/
│   ├── auth.mjs                  POST { password } → { ok, token } vs env var `auction_unlock`
│   ├── player-photo.mjs          GET/POST photo (open) + DELETE (token-gated), Netlify Blobs
│   └── schedule.mjs              GET fixtures state (public) + PUT (token-gated), Netlify Blobs
└── seasons/
    └── season-1-unity/           ← one folder per season (copy this pattern for S2)
        ├── index.html            Players & Teams page (public)
        ├── auction.html          Auction console (view-only; password unlocks editing)
        ├── rules.html            Rules & how-to-run-the-auction
        ├── schedule.html         Fixtures/timetable (reads live from schedule.mjs)
        ├── results.html          Standings + match results + knockout bracket (live, polls)
        ├── schedule-admin.html   Organiser editor: update times/venues/scores → Blobs
        ├── players.js            DATA: SEASON config, TEAMS, PLAYERS[], helpers
        ├── season.js             Renders the public players/teams page + photo upload UI
        ├── auction.js            Auction console logic (view/edit, budget, export)
        ├── schedule.js           DATA: fixtures (double RR) + standings/bracket + live sync
        ├── season.css            UNITY theme (extends ../../styles.css)
        ├── results.js            Published auction rosters (placeholder null until auction)
        └── assets/
            ├── *.jpeg            5 team logos + unity-all-teams.jpeg (combined)
            └── players/          uploaded photos live in Netlify Blobs, not here;
                                   README.md maps player id → name
```

---

## 3. Data model (`seasons/season-1-unity/players.js`)

- `SEASON` — id, name, theme, and **auction economics** (edit here to change rules everywhere):
  - `budget: 100000` per team
  - `baseSpiker: 15000`, `baseOther: 5000` (spiker = Outside Hitter OR Opposite/Right Side)
  - `minIncrement: 1000`, `squadTarget: 8`
- `TEAMS[]` — 5 teams (id, letter, name, animal, logo path, primary/accent colors).
- `PLAYERS[]` — the pool. Each: `{ id:'pNN', name, age, gender, positions:[...], fee, team:null }`.
  - Currently **40** entries: 38 real registrations + `p39`/`p40` placeholders for 2 expected sign-ups.
  - `positions` must use exact strings: `Setter`, `Outside Hitter`, `Opposite / Right Side`,
    `Middle Blocker`, `Libero`, `Defensive Specialist`.
- Helpers exposed on `window`: `getPlayers()`, `teamById()`, `basePrice()`, `isSpiker()`,
  `avatarHTML()`, `initials()`, `photoSrc()`, `loadAssignments()`, `saveAssignments()`.
- **Team assignments** are stored in `localStorage` under `vpl-season-1-unity-assignments`
  during the auction, and published to `results.js` afterward (see §6).

---

## 4. Auction rules (also on `rules.html`)

- 5 owners drawn by chit on the day; **owner is part of their team** (owner + 6–7 bought).
- Budget **$100k** per team. Base price **$15k spiker / $5k others**. Min raise **$1k**.
- **Max-bid cap:** max bid = remaining budget − ($5k × slots still to fill) — guarantees a team
  can always complete a legal squad. Shown live per team in the console.
- Target even squads (with 38–40 players → 8/8/8/7/7). Surplus player → team with most budget left.
- **Junior players** may be placed directly with a team (e.g. a family member) instead of auctioned.
- **Unsold ladder:** pass → $5k flat re-auction round → chit draw among teams with space + budget.

---

## 5. Auction console (`auction.html` + `auction.js`)

- **View-only by default** — anyone (players) can see teams, base prices, budgets, max-bid and a
  "how it works" explainer. No controls; mutators no-op.
- **Organiser unlocks editing** via "🔓 Unlock to run auction" → enters the password, which is
  verified **server-side** by `/.netlify/functions/auth` against the Netlify env var
  **`auction_unlock`**. The password is NOT in the repo or client bundle. Session flag on success:
  `sessionStorage['vpl-s1-auction-auth']`.
- In edit mode: put a player "on the block", click the winning team + type the price (auto-advances),
  drop players back, adjust squad target, **Export results / Copy JSON / Import / Reset**.
- **Import** = restore/move auction state (a previously exported file); it does NOT add players.
- The same password also unlocks **photo delete** on the players page ("Admin" link in footer).

---

## 6. AFTER the auction — publish rosters (quick)

1. In the console (edit mode) click **Export results** → downloads `results.js`.
2. **Replace the contents** of `seasons/season-1-unity/results.js` with that file. The
   `<script src="results.js">` include is already live on both pages (a placeholder
   `window.RESULTS = null` ships by default), so there's no HTML change to make.
3. Commit + push + merge → Netlify deploys. The players page auto-switches to **roster view**
   (teams + drafted players + prices) and the console shows final teams read-only.
4. Share the Season 1 page link with players:
   `https://sydneyvbleague.netlify.app/seasons/season-1-unity/`
5. **TODO (planned):** design a nicer post-auction reveal — team roster cards, sold prices,
   "most expensive pick", etc. (Not built yet.)

---

## 6b. Fixtures, live scores & standings

- **Format:** double round robin — 5 teams, each plays every other twice → **8 matches each, 20
  league matches** (rounds 1–10, one team byes per round). Then **top 4 → semifinals, 5th
  eliminated**; semis & final are **best of 3 sets** (league matches are a single set).
- **Fixtures** are defined statically in `schedule.js` (`MATCHES`, ids L01–L20 + SF1/SF2/F).
- **Live data lives in Netlify Blobs**, not the file: `schedule.mjs` stores an `overrides` object
  keyed by match id — `{ day, date, time, venue, result }`. Pages fetch it (public GET) and layer
  it over the static fixtures, so day/time/venue and scores update live.
  - `schedule.html` polls every 30s; `results.html` polls every 15s.
- **Updating during the season:** open **`schedule-admin.html`**, click **Unlock** (organiser
  password → token), edit any match's day/date/time/venue and score, click **Save all** → PUT to
  `schedule.mjs` (token-gated) → everyone's Schedule/Results pages reflect it within seconds.
  - League score = single set `{home, away}`. Knockout score = `sets` like `25-20, 23-25, 15-11`.
- **Standings** (`results.html`) are computed from league results: P/W/L, points-for/against, diff,
  Pts (win = `SCHEDULE.pointsPerWin`, default 3). Top 4 highlighted green, 5th red. The **bracket**
  resolves seeds (1v4, 2v3) once the league is complete, then the final from the semi winners.
- Requires Netlify (Blobs). Locally, pages fall back to static fixtures with "TBD" everywhere.

## 7. Player photos (Netlify Blobs)

- Players upload from the Season 1 page (📷 badge on each avatar). Image is centre-cropped +
  compressed to a ~400px JPEG in the browser, then POSTed to `/.netlify/functions/player-photo`
  and stored in a Netlify **Blobs** store keyed by player id.
- No photo → the avatar shows the player's **first+last initial**.
- Organiser can **delete** a photo: Season 1 page footer → "Admin" → password → 🗑 on a card.
- ⚠️ Only works on a deployed Netlify site (or `netlify dev`), not a plain local file server.

---

## 8. Local dev & deploy

Unlock (auction/admin) and photos call Netlify functions, so a plain static server can't
test them. **First set a local password:** create `svl-main/.env` (git-ignored) with
`auction_unlock=your-local-password` — that's what you type into "Unlock" locally.
(Production uses the Netlify dashboard env var of the same name.)

**Option 1 — lite dev server (quick; Unlock + full UI, no install):**
```
node dev-local.mjs      # → http://localhost:8899/seasons/season-1-unity/index.html
```
Serves the site + the `auth` function, so Unlock and Admin work. Photos fall back to
initials (they need Blobs). Zero dependencies — just Node.

**Option 2 — full Netlify Dev (adds photos / Blobs):**
```
npm install                         # gets @netlify/blobs
npm install -g netlify-cli          # or: npm install --no-save netlify-cli  → npx netlify dev
netlify dev                         # → http://localhost:8888
```
If you `netlify link` the site, Dev pulls `auction_unlock` from Netlify (no .env needed).
(Note: `netlify dev` sets up an Edge Functions runtime on boot; in a locked-down network it
may fail there — the lite server in Option 1 avoids that.)

**To unlock locally:** open the auction page → "🔓 Unlock to run auction" → type the `.env`
password. Sanity check the endpoint directly:
```
curl -s -X POST localhost:8899/.netlify/functions/auth \
  -H 'Content-Type: application/json' -d '{"password":"your-local-password"}'
# → {"ok":true,"token":"..."}
```

**Deploy:** push to GitHub; Netlify builds from `netlify.toml` and auto-installs `@netlify/blobs`.
Set the `auction_unlock` env var in the Netlify dashboard and redeploy. Merge
`season-1-unity` → `main` to publish to production.

---

## 9. How to do common tasks

- **Add / edit a player:** edit `PLAYERS[]` in `players.js`. New id = next free `pNN`
  (format `p` + 2–3 digits). `team:null`. Rebuild not needed — it's static JS.
- **Rename the 2 placeholders (p39/p40):** update their `name/age/gender/positions` when the
  real players register.
- **Change budget / base prices / squad size:** edit the `SEASON` object in `players.js`.
- **Change a team name / color / logo:** edit `TEAMS[]` and drop a new logo in `assets/`.
- **Change the org password:** update the **`auction_unlock`** env var in Netlify
  (Site settings → Environment variables) and redeploy. No code change needed.
- **Start Season 2:** copy `seasons/season-1-unity/` → `seasons/season-2-<theme>/`, swap logos,
  team names/colors, theme CSS, and reset `PLAYERS[]`. Link it from the home nav.

---

## 10. Backlog / next steps

- [ ] **Post-auction:** receive `results.js`, publish rosters (§6), design the reveal.
- [ ] **Season 2:** wire the **registration form → season player list automatically** (Netlify
      Function or build step reading Netlify Forms submissions) instead of hand-editing `PLAYERS[]`.
      Then repeat the per-season folder pattern once the S2 theme/teams are decided.
- [ ] **Optional live-sync:** so players watch picks fill in **real time** on their phones —
      sync auction state to a Netlify Blobs store; the view-only page polls it. Writes must be
      password-checked (ideally server-side via an env var, not just the client hash).
- [ ] Optional: "photos uploaded: X of N" counter for the organiser.

---

## 11. Security notes

- The auction/admin password is verified **server-side** against the Netlify env var
  `auction_unlock` (via `functions/auth.mjs`), so the password is never in the repo or client bundle.
  On success `auth` returns a **derived HMAC token** (not the password); the client stores it and
  sends it as the `x-vpl-token` header when **deleting** a photo, and `player-photo.mjs` verifies it
  server-side (401 otherwise). So the real password never touches the browser storage.
- **Photo uploads (POST) are intentionally open** so any player can add their own photo; **deletes are
  authenticated** (organiser token only). Auction-console edit controls are still gated client-side
  (they only mutate local state, nothing server-side).
- **Never commit** the registration CSV / exports (they hold phones, emails, IPs). `.gitignore`
  blocks `*.csv` / `*.zip`. `players.js` intentionally holds only name/age/gender/positions.
- If you push with a GitHub token, **rotate it afterward** — don't leave it in chats or configs.

---

## 12. Hosting / cost

Netlify **Free** plan covers this use case (Forms are free & unlimited on credit plans; Functions +
Blobs usage for ~40 players is negligible; ~15 GB bandwidth is plenty). The **$9 Personal** plan is
optional headroom, not required.
