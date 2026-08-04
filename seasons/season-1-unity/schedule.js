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
MATCHES.forEach(m => (m._def = {
  day: m.day || '', date: m.date || '', time: m.time || '', venue: m.venue || '',
  result: m.result != null ? m.result : null,
}));

function applyOverrides(ov) {
  MATCHES.forEach(m => {
    // reset to file defaults, then layer the live override (if any)
    m.day = m._def.day; m.date = m._def.date; m.time = m._def.time;
    m.venue = m._def.venue; m.result = m._def.result;
    const o = ov && ov[m.id];
    if (o) {
      if (o.day != null) m.day = o.day;
      if (o.date != null) m.date = o.date;
      if (o.time != null) m.time = o.time;
      if (o.venue != null) m.venue = o.venue;
      if (o.result !== undefined) m.result = o.result;
    }
  });
}
async function loadOverrides() {
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
