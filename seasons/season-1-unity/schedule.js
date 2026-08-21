/* ============================================================
   VPL Season 1 · UNITY — fixtures, standings & knockout.

   ── HOW TO UPDATE ──────────────────────────────────────────
   • Times/venue:  fill day/date/time/venue on each match below when decided.
                   (Leave '' to show "TBD".) e.g.
                   day:'Tuesday', date:'12 Aug 2026', time:'7:00 PM', venue:'Court 3'
   • League result (single set): set  result:{ home:25, away:22 }
   • Semis/Final (best of 3):     set  result:{ sets:[[25,20],[23,25],[15,11]] }
   Standings, qualification (top 4) and the bracket update automatically.
   ============================================================ */

const SCHEDULE = {
  format: 'Double round robin · each team plays every other twice (8 matches each)',
  leagueSets: 1,          // league matches are a single set
  knockoutBestOf: 3,      // semis & final are best of 3 sets
  pointsPerWin: 3,
  pointsPerLoss: 0,
  qualifiers: 4,          // top 4 advance to semis; 5th is eliminated
};

/* team ids: ultra-eagles, nitro-kangaroos, ignite-emus, thunder-tigers, young-yaks */
const MATCHES = [
  // ---- League · Leg 1 (rounds 1–5) ----
  { id:'L01', phase:'league', round:1, home:'nitro-kangaroos', away:'young-yaks',    day:'', date:'', time:'', venue:'', result:null },
  { id:'L02', phase:'league', round:1, home:'ignite-emus',     away:'thunder-tigers',day:'', date:'', time:'', venue:'', result:null },
  { id:'L03', phase:'league', round:2, home:'ultra-eagles',    away:'young-yaks',    day:'', date:'', time:'', venue:'', result:null },
  { id:'L04', phase:'league', round:2, home:'nitro-kangaroos', away:'ignite-emus',   day:'', date:'', time:'', venue:'', result:null },
  { id:'L05', phase:'league', round:3, home:'ultra-eagles',    away:'thunder-tigers',day:'', date:'', time:'', venue:'', result:null },
  { id:'L06', phase:'league', round:3, home:'young-yaks',      away:'ignite-emus',   day:'', date:'', time:'', venue:'', result:null },
  { id:'L07', phase:'league', round:4, home:'ultra-eagles',    away:'ignite-emus',   day:'', date:'', time:'', venue:'', result:null },
  { id:'L08', phase:'league', round:4, home:'thunder-tigers',  away:'nitro-kangaroos',day:'', date:'', time:'', venue:'', result:null },
  { id:'L09', phase:'league', round:5, home:'ultra-eagles',    away:'nitro-kangaroos',day:'', date:'', time:'', venue:'', result:null },
  { id:'L10', phase:'league', round:5, home:'thunder-tigers',  away:'young-yaks',    day:'', date:'', time:'', venue:'', result:null },
  // ---- League · Leg 2 (rounds 6–10, home/away reversed) ----
  { id:'L11', phase:'league', round:6, home:'young-yaks',      away:'nitro-kangaroos',day:'', date:'', time:'', venue:'', result:null },
  { id:'L12', phase:'league', round:6, home:'thunder-tigers',  away:'ignite-emus',   day:'', date:'', time:'', venue:'', result:null },
  { id:'L13', phase:'league', round:7, home:'young-yaks',      away:'ultra-eagles',  day:'', date:'', time:'', venue:'', result:null },
  { id:'L14', phase:'league', round:7, home:'ignite-emus',     away:'nitro-kangaroos',day:'', date:'', time:'', venue:'', result:null },
  { id:'L15', phase:'league', round:8, home:'thunder-tigers',  away:'ultra-eagles',  day:'', date:'', time:'', venue:'', result:null },
  { id:'L16', phase:'league', round:8, home:'ignite-emus',     away:'young-yaks',    day:'', date:'', time:'', venue:'', result:null },
  { id:'L17', phase:'league', round:9, home:'ignite-emus',     away:'ultra-eagles',  day:'', date:'', time:'', venue:'', result:null },
  { id:'L18', phase:'league', round:9, home:'nitro-kangaroos', away:'thunder-tigers',day:'', date:'', time:'', venue:'', result:null },
  { id:'L19', phase:'league', round:10,home:'nitro-kangaroos', away:'ultra-eagles',  day:'', date:'', time:'', venue:'', result:null },
  { id:'L20', phase:'league', round:10,home:'young-yaks',      away:'thunder-tigers',day:'', date:'', time:'', venue:'', result:null },

  // ---- Knockouts (teams resolve from final standings) ----
  { id:'SF1', phase:'semifinal', label:'Semi-final 1', src:{ home:{seed:1}, away:{seed:4} }, bestOf:3, day:'', date:'', time:'', venue:'', result:null },
  { id:'SF2', phase:'semifinal', label:'Semi-final 2', src:{ home:{seed:2}, away:{seed:3} }, bestOf:3, day:'', date:'', time:'', venue:'', result:null },
  { id:'F',   phase:'final',     label:'Grand Final',  src:{ home:{winnerOf:'SF1'}, away:{winnerOf:'SF2'} }, bestOf:3, day:'', date:'', time:'', venue:'', result:null },
];

/* ---------- helpers ---------- */
function matchById(id) { return MATCHES.find(m => m.id === id) || null; }
function leagueMatches() { return MATCHES.filter(m => m.phase === 'league'); }
function knockoutMatches() { return MATCHES.filter(m => m.phase !== 'league'); }

/* single-set league result → { home, away, winner, loser } or null */
function leagueResult(m) {
  const r = m.result;
  if (!r || r.home == null || r.away == null) return null;
  const winner = r.home > r.away ? m.home : m.away;
  const loser  = r.home > r.away ? m.away : m.home;
  return { home: r.home, away: r.away, winner, loser };
}

function standings() {
  const row = {};
  TEAMS.forEach(t => (row[t.id] = { id: t.id, P: 0, W: 0, L: 0, PF: 0, PA: 0, Pts: 0 }));
  const played = leagueMatches().filter(m => leagueResult(m));
  played.forEach(m => {
    const r = leagueResult(m);
    const H = row[m.home], A = row[m.away];
    H.P++; A.P++;
    H.PF += r.home; H.PA += r.away;
    A.PF += r.away; A.PA += r.home;
    if (r.winner === m.home) { H.W++; A.L++; H.Pts += SCHEDULE.pointsPerWin; A.Pts += SCHEDULE.pointsPerLoss; }
    else                     { A.W++; H.L++; A.Pts += SCHEDULE.pointsPerWin; H.Pts += SCHEDULE.pointsPerLoss; }
  });

  // head-to-head record among a set of tied teams (only their mutual matches)
  function headToHead(ids) {
    const set = new Set(ids);
    const h = {};
    ids.forEach(id => (h[id] = { W: 0, diff: 0, PF: 0 }));
    played.forEach(m => {
      if (!set.has(m.home) || !set.has(m.away)) return;
      const r = leagueResult(m);
      h[m.home].PF += r.home; h[m.away].PF += r.away;
      h[m.home].diff += (r.home - r.away); h[m.away].diff += (r.away - r.home);
      if (r.winner === m.home) h[m.home].W++; else h[m.away].W++;
    });
    return h;
  }

  const arr = Object.values(row);
  arr.sort((a, b) => b.Pts - a.Pts);   // group by points first
  // resolve each group of equal points: head-to-head → h2h diff → overall diff → points for → name
  const out = [];
  for (let i = 0; i < arr.length;) {
    let j = i;
    while (j < arr.length && arr[j].Pts === arr[i].Pts) j++;
    const group = arr.slice(i, j);
    if (group.length > 1) {
      const h = headToHead(group.map(g => g.id));
      // sporting keys (highest wins); name is NOT included here — it's the last resort
      const keys = (x) => [h[x.id].W, h[x.id].diff, h[x.id].PF, x.PF - x.PA, x.PF];
      group.sort((a, b) => {
        const ka = keys(a), kb = keys(b);
        for (let k = 0; k < ka.length; k++) { if (kb[k] !== ka[k]) return kb[k] - ka[k]; }
        return a.id.localeCompare(b.id);   // last resort → flagged below as a tie
      });
      // dead heat: adjacent teams equal on EVERY sporting key → only the name separated them.
      // Only flag once the league is complete (before then, 0-0 "ties" are meaningless).
      if (leagueComplete()) {
        for (let k = 0; k < group.length - 1; k++) {
          const ka = keys(group[k]), kb = keys(group[k + 1]);
          if (ka.every((v, idx) => v === kb[idx])) { group[k].tie = true; group[k + 1].tie = true; }
        }
      }
    }
    out.push(...group);
    i = j;
  }
  out.forEach((r, i) => (r.rank = i + 1));
  return out;
}

function leagueComplete() { return leagueMatches().every(m => leagueResult(m)); }

/* winner team id of a knockout match (best of N sets), or null if undecided */
function knockoutWinner(m) {
  const t = resolveTeams(m);
  const r = m.result;
  if (!t.home || !t.away || !r || !Array.isArray(r.sets) || !r.sets.length) return null;
  let sh = 0, sa = 0;
  r.sets.forEach(([h, a]) => { if (h > a) sh++; else if (a > h) sa++; });
  const need = Math.ceil((m.bestOf || SCHEDULE.knockoutBestOf) / 2);
  if (sh >= need) return t.home;
  if (sa >= need) return t.away;
  return null;
}
function knockoutSetsWon(m) {
  const r = m.result;
  let sh = 0, sa = 0;
  if (r && Array.isArray(r.sets)) r.sets.forEach(([h, a]) => { if (h > a) sh++; else if (a > h) sa++; });
  return { sh, sa };
}

/* resolve a knockout match's teams from seeds / prior winners → {home, away} ids (or null) */
function resolveTeams(m) {
  if (m.phase === 'league') return { home: m.home, away: m.away };
  const pick = (ref) => {
    if (!ref) return null;
    if (ref.seed != null) {
      if (!leagueComplete()) return null;         // seeds known only once league is done
      const s = standings();
      return s[ref.seed - 1] ? s[ref.seed - 1].id : null;
    }
    if (ref.winnerOf) return knockoutWinner(matchById(ref.winnerOf));
    return null;
  };
  return { home: pick(m.src.home), away: pick(m.src.away) };
}

/* label for an unresolved knockout slot, e.g. "1st place" / "Winner · Semi-final 1" */
function slotLabel(ref) {
  if (!ref) return 'TBD';
  if (ref.seed != null) return ['1st place', '2nd place', '3rd place', '4th place'][ref.seed - 1] || ('Seed ' + ref.seed);
  if (ref.winnerOf) { const src = matchById(ref.winnerOf); return 'Winner · ' + (src ? src.label : ref.winnerOf); }
  return 'TBD';
}

/* team not playing in a given league round (the bye) */
function byeTeam(round) {
  const playing = new Set();
  leagueMatches().filter(m => m.round === round).forEach(m => { playing.add(m.home); playing.add(m.away); });
  const t = TEAMS.find(x => !playing.has(x.id));
  return t ? t.id : null;
}

/* ---------- live sync (Netlify Blobs) ----------
   The static fields above are defaults; live day/date/time/venue/result come from
   the schedule function and are layered on top so everyone sees updates. */
const SCHEDULE_ENDPOINT = '/.netlify/functions/schedule';
// Default "order" = the slot a match plays in. League defaults to its round
// (2 matches per round = the 2 courts); knockouts sit after. Organisers can
// override this per-match from the schedule admin to arrange the running order.
const _koDefaultOrder = { SF1: 11, SF2: 11, F: 12 };
const _koDefaultCourt = { SF1: 1, SF2: 2, F: 1 };
// Default running order for the single day (2 courts). Fair-play optimised so no
// team plays more than 4 slots in a row, with:
//   Slot 1  rests Nitro Kangaroos
//   Slot 9  = Nitro Kangaroos v Thunder Tigers (Court 1)
//   Slot 10 = Nitro Kangaroos v Young Yaks     (Court 1)
// [order, court] per league match id. Organisers can still override in the admin.
const DEFAULT_SLOTS = {
  L05: [1, 1], L06: [1, 2],    // Slot 1 · rests Nitro Kangaroos
  L03: [2, 1], L04: [2, 2],
  L09: [3, 1], L10: [3, 2],
  L07: [4, 1], L08: [4, 2],
  L01: [5, 1], L02: [5, 2],
  L15: [6, 1], L16: [6, 2],
  L13: [7, 1], L14: [7, 2],
  L19: [8, 1], L20: [8, 2],
  L18: [9, 1], L17: [9, 2],    // Slot 9 · Court 1 = Nitro v Thunder
  L11: [10, 1], L12: [10, 2],  // Slot 10 · Court 1 = Nitro v Young Yaks
};
function _defaultCourt(m) {
  if (DEFAULT_SLOTS[m.id]) return DEFAULT_SLOTS[m.id][1];
  if (m.phase !== 'league') return _koDefaultCourt[m.id] || 1;
  const n = parseInt(String(m.id).replace(/\D/g, ''), 10);
  return (n % 2 === 1) ? 1 : 2;
}
function _defaultOrder(m) {
  if (DEFAULT_SLOTS[m.id]) return DEFAULT_SLOTS[m.id][0];
  return (m.phase === 'league' ? m.round : (_koDefaultOrder[m.id] || 99));
}
// Single-day event at one venue (court booked 1–6 PM). Rough slots:
//   League 1:00–4:00 PM (10 slots ≈ 18 min), Semifinals 4:00–5:00, Grand Final 5:00–6:00.
const DEFAULT_VENUE = 'Hawkesbury Indoor Stadium';
// Knockout / fallback slot times (used for knockouts and for any day that has
// no explicit day-schedule below).
const SLOT_TIMES = {
  1: '1:00 PM', 2: '1:18 PM', 3: '1:36 PM', 4: '1:54 PM', 5: '2:12 PM',
  6: '2:30 PM', 7: '2:48 PM', 8: '3:06 PM', 9: '3:24 PM', 10: '3:42 PM',
  11: '4:00 PM',   // Semifinals (best of 3) · 4–5 PM
  12: '5:00 PM',   // Grand Final (best of 3) · 5–6 PM
};
// Per-day league slot times. A league match's time comes from its slot's
// position WITHIN its day (not the global running order), so every day of play
// starts fresh at 1:00 PM. The main event day plays 8 slots of 20 min starting
// 1:00 PM, with a 15-min break after the 4th slot (2:20–2:35 PM); the league
// wraps ~3:55 PM, then Semifinals (4 PM) and Grand Final (5 PM).
// Knockouts keep SLOT_TIMES. Explicit per-match time overrides always win.
const DAY_SLOT_TIMES = {
  // Played early on Wednesday evening (single court), 7:00–9:00 PM.
  Wednesday: ['7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM'],
  // Main event day, 1:00–4:00 PM, 15-min break after the 4th slot.
  Saturday: ['1:00 PM', '1:20 PM', '1:40 PM', '2:00 PM',
             '2:35 PM', '2:55 PM', '3:15 PM', '3:35 PM'],
};
// Distinct league slot orders used on a given day, ascending → slot positions.
function _dayOrders(day) {
  return [...new Set(leagueMatches().filter(m => m.day === day).map(m => m.order))]
    .sort((a, b) => a - b);
}
// Time for one match: knockouts are fixed (Slot 14 semis 4 PM, Slot 15 final
// 5 PM); league → its day's schedule by slot position; else SLOT_TIMES.
function _matchTime(m) {
  if (m.phase === 'semifinal') return '4:00 PM';
  if (m.phase === 'final')     return '5:00 PM';
  const tbl = DAY_SLOT_TIMES[m.day];
  if (!tbl) return SLOT_TIMES[m.order] || '';
  const idx = _dayOrders(m.day).indexOf(m.order);
  return (idx >= 0 && tbl[idx]) ? tbl[idx] : (SLOT_TIMES[m.order] || '');
}
// Global slot number across the whole event (league + knockouts), by ascending
// running order — so the two semis read as Slot 14 and the final as Slot 15.
function slotNumberOf(m) {
  const orders = [...new Set(MATCHES.map(x => x.order))].sort((a, b) => a - b);
  return orders.indexOf(m.order) + 1;
}
MATCHES.forEach(m => {
  const ord = (m.order != null ? m.order : _defaultOrder(m));
  m._def = {
    day: m.day || '', date: m.date || '',
    time: m.time || '',          // explicit file time only; slot time is applied by position
    venue: m.venue || DEFAULT_VENUE,
    result: m.result != null ? m.result : null,
    order: ord,
    court: (m.court != null ? m.court : _defaultCourt(m)),
  };
  m.order = m._def.order;   // ensure defined even before live overrides load
  m.court = m._def.court;
  m.day   = m._def.day;     // day is needed to resolve the slot time
});
// Second pass: day-based slot times need every match's day/order set first.
MATCHES.forEach(m => { m.time = m._def.time || _matchTime(m); });

function applyOverrides(ov) {
  MATCHES.forEach(m => {
    const o = ov && ov[m.id];
    m.order = (o && o.order != null) ? Number(o.order) : m._def.order;
    m.court = (o && o.court != null) ? Number(o.court) : m._def.court;
    m.day   = (o && o.day   != null) ? o.day   : m._def.day;
    m.date  = (o && o.date  != null) ? o.date  : m._def.date;
    m.venue = (o && o.venue != null) ? o.venue : m._def.venue;
    m.result = (o && o.result !== undefined) ? o.result : m._def.result;
    // remember an explicit time override; the slot time is resolved in the 2nd pass
    m._timeOv = (o && o.time != null) ? o.time : (m._def.time || null);
  });
  // second pass: day-based slot times need every match's day/order set first
  MATCHES.forEach(m => { m.time = m._timeOv || _matchTime(m); });
}
// Local test mode: on localhost / file:// there is no Netlify auth/functions,
// so the admin password is bypassed and overrides are read/written to this
// browser's localStorage. On the deployed site IS_LOCAL is false → password +
// Blobs as normal. (Keeps production admin protected even if this is pushed.)
const IS_LOCAL = (typeof location !== 'undefined') &&
  (location.protocol === 'file:' || ['localhost', '127.0.0.1', '::1'].includes(location.hostname));
const SCHEDULE_LS_KEY = 'vpl-s1-schedule-overrides';

async function loadOverrides() {
  if (IS_LOCAL) {
    try { const raw = localStorage.getItem(SCHEDULE_LS_KEY); return raw ? JSON.parse(raw) : {}; }
    catch (e) { return {}; }
  }
  try {
    const res = await fetch(SCHEDULE_ENDPOINT, { cache: 'no-store' });
    if (!res.ok) return null;
    const d = await res.json().catch(() => null);
    return d ? (d.overrides || {}) : null;
  } catch (e) { return null; }
}
/* fetch latest and apply; returns true if live data was loaded (false → using defaults) */
async function refreshSchedule() {
  const ov = await loadOverrides();
  if (ov) applyOverrides(ov);
  return ov != null;
}
async function saveOverrides(overrides, token) {
  if (IS_LOCAL) {
    try { localStorage.setItem(SCHEDULE_LS_KEY, JSON.stringify(overrides)); return true; }
    catch (e) { return false; }
  }
  const res = await fetch(SCHEDULE_ENDPOINT, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'x-vpl-token': token },
    body: JSON.stringify({ overrides }),
  });
  return res.ok;
}

/* current season stage (auto-derived from data): registration → auction → league → semis → final */
function seasonStage() {
  const players = (typeof getPlayers === 'function') ? getPlayers() : [];
  const auctionDone = players.some(p => p.team);
  const lm = leagueMatches();
  const played = lm.filter(m => leagueResult(m)).length;
  const leagueDone = leagueComplete();
  const sf = MATCHES.filter(m => m.phase === 'semifinal');
  const semisDone = sf.length > 0 && sf.every(m => knockoutWinner(m));
  const finalM = matchById('F');
  const champion = knockoutWinner(finalM);
  const finalDone = !!champion;

  const stages = [
    { key: 'registration', label: 'Registration', icon: '📝', done: true,
      detail: players.length + ' players' },
    { key: 'auction', label: 'Auction', icon: '🔨', done: auctionDone,
      detail: auctionDone ? 'Teams drafted' : 'Coming up' },
    { key: 'league', label: 'League', icon: '📅', done: leagueDone,
      detail: leagueDone ? 'Complete' : (played ? played + '/' + lm.length + ' played' : 'Double round robin') },
    { key: 'semis', label: 'Semifinals', icon: '🥈', done: semisDone,
      detail: semisDone ? 'Finalists set' : 'Top 4 advance' },
    { key: 'final', label: 'Grand Final', icon: '🏆', done: finalDone,
      detail: champion && teamById(champion) ? '🏆 ' + teamById(champion).name : 'The decider' },
  ];
  let current = stages.findIndex(s => !s.done);
  if (current === -1) current = stages.length - 1;
  return { stages, current, champion };
}

window.SCHEDULE = SCHEDULE;
window.MATCHES = MATCHES;
window.seasonStage = seasonStage;
window.SCHEDULE_ENDPOINT = SCHEDULE_ENDPOINT;
window.applyOverrides = applyOverrides;
window.loadOverrides = loadOverrides;
window.refreshSchedule = refreshSchedule;
window.saveOverrides = saveOverrides;
window.matchById = matchById;
window.leagueMatches = leagueMatches;
window.knockoutMatches = knockoutMatches;
window.leagueResult = leagueResult;
window.standings = standings;
window.leagueComplete = leagueComplete;
window.knockoutWinner = knockoutWinner;
window.knockoutSetsWon = knockoutSetsWon;
window.resolveTeams = resolveTeams;
window.slotLabel = slotLabel;
window.byeTeam = byeTeam;
window.slotNumberOf = slotNumberOf;
