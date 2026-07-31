/* ============================================================
   VPL Season 1 · UNITY — Auction console
   Assign players to teams live; state persists to localStorage.
   ============================================================ */
(function () {
  const PASS_HASH = '33ebdbc951c231a047a2b913f4fbf2dc7d11bedea0481eb624fbb27ee195bd92';
  const AUTH_KEY = 'vpl-s1-auction-auth';
  let editing = sessionStorage.getItem(AUTH_KEY) === '1';   // view-only until unlocked

  let assignments = loadAssignments();   // { p01: { team:'ultra-eagles', price:120 }, ... }
  // If nothing is saved locally but results have been published, seed a display copy
  // so view-only visitors (and other devices) still see the final rosters.
  if (Object.keys(assignments).length === 0 && typeof RESULTS !== 'undefined' && RESULTS) {
    assignments = JSON.parse(JSON.stringify(RESULTS));
  }
  let spotlightId = null;
  let query = '';
  let squadTarget = SEASON.squadTarget;

  const $ = (id) => document.getElementById(id);
  const money = (n) => '$' + Number(n).toLocaleString();
  async function sha256(str) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /* ---------- budget maths ---------- */
  function teamRoster(id) { return PLAYERS.filter(p => teamOf(p.id) === id); }
  function teamSpent(id) { return teamRoster(id).reduce((s, p) => s + (priceOf(p.id) || 0), 0); }
  function teamRemaining(id) { return SEASON.budget - teamSpent(id); }
  /* Max a team can bid on the NEXT player and still fill its remaining slots at base. */
  function teamMaxBid(id) {
    const filled = teamRoster(id).length;
    const slotsLeft = Math.max(0, squadTarget - filled);
    if (slotsLeft <= 0) return 0;                       // squad full
    const reserveForOthers = (slotsLeft - 1) * SEASON.baseOther;
    return Math.max(0, teamRemaining(id) - reserveForOthers);
  }

  function persist() { saveAssignments(assignments); }

  function posCodes(p) {
    return p.positions.map(pos => {
      const c = POSITIONS[pos] || pos;
      return `<span class="pos-badge pos-${c}" title="${pos}">${c}</span>`;
    }).join('');
  }
  function playerById(id) { return PLAYERS.find(p => p.id === id); }
  function teamOf(id) { return (assignments[id] || {}).team || null; }
  function priceOf(id) { return (assignments[id] || {}).price; }

  function toast(msg) {
    const t = $('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove('show'), 1800);
  }

  /* ---------- assignment mutators (no-op unless editing) ---------- */
  function assign(playerId, teamId) {
    if (!editing) return;
    if (!teamId) { delete assignments[playerId]; }
    else {
      assignments[playerId] = Object.assign({}, assignments[playerId], { team: teamId });
    }
    persist();
    renderAll();
    const p = playerById(playerId);
    if (teamId) toast(`${p.name} → ${teamById(teamId).name}`);
    else toast(`${p.name} returned to the pool`);
  }
  function setPrice(playerId, price) {
    if (!editing) return;
    if (!assignments[playerId]) return;
    const n = parseInt(price, 10);
    assignments[playerId].price = isNaN(n) ? undefined : n;
    persist();
    renderStats();
    renderBoards();
  }

  /* ---------- stats ---------- */
  function renderStats() {
    const total = PLAYERS.length;
    const assigned = Object.values(assignments).filter(a => a.team).length;
    const spend = Object.values(assignments).reduce((s, a) => s + (a.price || 0), 0);
    $('aucStats').innerHTML = `
      <div class="auc-stat"><div class="n">${total}</div><div class="l">Registered players</div></div>
      <div class="auc-stat"><div class="n">${assigned}</div><div class="l">Drafted</div></div>
      <div class="auc-stat"><div class="n">${total - assigned}</div><div class="l">Still in pool</div></div>
      <div class="auc-stat"><div class="n">${spend ? '$' + spend.toLocaleString() : '—'}</div><div class="l">Total spend</div></div>`;
  }

  /* ---------- on the block ---------- */
  function renderBlock() {
    const box = $('onBlock');
    if (!editing) {
      box.className = 'on-block empty';
      box.innerHTML = `<div><strong>How the auction works:</strong> the organiser puts a player “on the block”, the five team owners bid from their $100k purse, and the winning team &amp; price are recorded — the player then appears on that team's board on the right. Spikers start at $15k, everyone else at $5k.</div>`;
      return;
    }
    if (!spotlightId) {
      box.className = 'on-block empty';
      box.innerHTML = `<div>Pick a player below (or “Next unsold”) to put them on the block.</div>`;
      return;
    }
    const p = playerById(spotlightId);
    const current = teamOf(p.id);
    const teamBtns = TEAMS.map(t => {
      const active = current === t.id;
      return `<button class="ob-team-btn" data-team="${t.id}"
                style="background:${active ? t.accent : t.primary}; color:${active ? '#111' : '#fff'}; border-color:${t.accent};">
                <img src="${t.logo}" alt="">${t.name}</button>`;
    }).join('');
    box.className = 'on-block';
    box.innerHTML = `
      <div class="ob-head">
        ${avatarHTML(p, 'av-lg')}
        <div>
          <div class="ob-label">On the block${isSpiker(p) ? ' · <span style="color:#FFB088;">SPIKER</span>' : ''}</div>
          <div class="ob-name">${p.name}</div>
          <div class="ob-meta">${p.age} · ${p.gender} · base ${money(basePrice(p))}</div>
        </div>
      </div>
      <div class="ob-pos">${posCodes(p)}</div>
      <div class="ob-actions">
        ${teamBtns}
        <button class="ob-team-btn unsold" data-team="">↩ Unsold</button>
        <input class="ob-price" id="obPrice" type="number" min="0" step="${SEASON.minIncrement}"
               placeholder="${money(basePrice(p))}"
               value="${priceOf(p.id) != null ? priceOf(p.id) : ''}">
      </div>`;
    box.querySelectorAll('.ob-team-btn').forEach(b => b.addEventListener('click', () => {
      assign(p.id, b.dataset.team);
      // auto-advance to next unsold after a sale
      if (b.dataset.team) gotoNextUnsold();
    }));
    const priceInput = $('obPrice');
    if (priceInput) priceInput.addEventListener('change', e => setPrice(p.id, e.target.value));
  }

  /* ---------- player list ---------- */
  function renderRows() {
    const wrap = $('rows');
    const teamOptions = (sel) => TEAMS.map(t =>
      `<option value="${t.id}" ${sel === t.id ? 'selected' : ''}>${t.name}</option>`).join('');
    const filtered = PLAYERS.filter(p => !query || p.name.toLowerCase().includes(query));
    wrap.innerHTML = filtered.map(p => {
      const tId = teamOf(p.id);
      const t = tId ? teamById(tId) : null;
      return `
        <div class="auc-row ${t ? 'is-assigned' : ''} ${spotlightId === p.id ? 'spotlight-now' : ''}"
             data-id="${p.id}" style="--ar-team:${t ? t.primary : ''};">
          <div class="ar-main">
            <span class="ar-strip"></span>
            ${avatarHTML(p, 'av-sm')}
            <div style="min-width:0;">
              <div class="ar-name">${p.name}</div>
              <div class="ar-meta">${p.age} · ${p.positions.map(x => POSITIONS[x] || x).join(' / ')} · base ${money(basePrice(p))}</div>
            </div>
          </div>
          ${editing ? `
          <button class="pick-btn" data-pick="${p.id}">Block</button>
          <select data-assign="${p.id}">
            <option value="">— Pool —</option>
            ${teamOptions(tId)}
          </select>` : `
          <span class="ar-status">${t ? t.name + (priceOf(p.id) != null ? ' · ' + money(priceOf(p.id)) : '') : 'In pool'}</span>`}
        </div>`;
    }).join('') || `<div style="padding:20px; color:var(--ink-faint);">No players match.</div>`;

    wrap.querySelectorAll('[data-pick]').forEach(b => b.addEventListener('click', () => {
      spotlightId = b.dataset.pick;
      renderBlock(); renderRows();
      $('onBlock').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }));
    wrap.querySelectorAll('[data-assign]').forEach(s => s.addEventListener('change', e => {
      assign(s.dataset.assign, e.target.value);
    }));
  }

  /* ---------- team boards ---------- */
  function renderBoards() {
    const wrap = $('teamBoards');
    wrap.innerHTML = TEAMS.map(t => {
      const roster = PLAYERS.filter(p => teamOf(p.id) === t.id);
      const remaining = teamRemaining(t.id);
      const maxBid = teamMaxBid(t.id);
      const full = roster.length >= squadTarget;
      const rows = roster.length
        ? roster.map(p => {
            const pr = priceOf(p.id);
            return `<div class="tb-player">
                <span>${p.name}</span>
                ${pr != null ? `<span class="pr">${money(pr)}</span>` : `<span class="pr">—</span>`}
                ${editing ? `<button class="x" data-drop="${p.id}" title="Return to pool">×</button>` : ''}
              </div>`;
          }).join('')
        : `<div class="tb-empty">No players yet.</div>`;
      return `
        <div class="tb" style="--tb-primary:${t.primary};">
          <div class="tb-head" style="background:${t.primary};">
            <img src="${t.logo}" alt="">
            <span class="tb-name">${t.name}</span>
            <span class="tb-count">${roster.length}/${squadTarget}</span>
          </div>
          <div class="tb-budget">
            <span>Left <b>${money(remaining)}</b></span>
            <span class="${full ? 'is-full' : ''}">${full ? 'Squad full' : 'Max bid <b>' + money(maxBid) + '</b>'}</span>
          </div>
          <div class="tb-body">${rows}</div>
        </div>`;
    }).join('');
    wrap.querySelectorAll('[data-drop]').forEach(b => b.addEventListener('click', () => assign(b.dataset.drop, '')));
  }

  /* ---------- next unsold ---------- */
  function gotoNextUnsold() {
    const next = PLAYERS.find(p => !teamOf(p.id));
    spotlightId = next ? next.id : null;
    renderBlock(); renderRows();
    if (!next) toast('All players drafted 🎉');
  }

  function renderAll() { renderStats(); renderBlock(); renderRows(); renderBoards(); }

  /* ---------- export / import ---------- */
  function buildResultsObject() {
    const out = {};
    PLAYERS.forEach(p => {
      const a = assignments[p.id];
      if (a && a.team) out[p.id] = { team: a.team, price: a.price };
    });
    return out;
  }
  function exportResults() {
    const obj = buildResultsObject();
    const js = `/* VPL Season 1 · UNITY — published auction results.
   Generated from the auction console. Load this file after players.js
   on index.html to publish the final rosters. */
const RESULTS = ${JSON.stringify(obj, null, 2)};
window.RESULTS = RESULTS;
`;
    const blob = new Blob([js], { type: 'text/javascript' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'results.js';
    a.click();
    URL.revokeObjectURL(a.href);
    toast('Downloaded results.js — drop it in the season folder');
  }
  function copyJSON() {
    const txt = JSON.stringify(buildResultsObject(), null, 2);
    navigator.clipboard.writeText(txt).then(() => toast('Results JSON copied'))
      .catch(() => toast('Copy failed — use Export instead'));
  }
  function importResults(text) {
    try {
      // accept raw JSON or a results.js file containing `const RESULTS = {...}`
      const m = text.match(/\{[\s\S]*\}/);
      const obj = JSON.parse(m ? m[0] : text);
      assignments = {};
      Object.keys(obj).forEach(id => {
        if (playerById(id)) assignments[id] = { team: obj[id].team, price: obj[id].price };
      });
      persist(); renderAll();
      toast('Imported ' + Object.keys(assignments).length + ' assignments');
    } catch (e) {
      toast('Could not read that file');
    }
  }

  /* ---------- view / edit mode ---------- */
  async function unlockEditing() {
    const pw = prompt('Enter the organiser password to run the auction:');
    if (pw == null) return;
    try {
      if ((await sha256(pw)) === PASS_HASH) {
        editing = true;
        sessionStorage.setItem(AUTH_KEY, '1');
        applyMode(); renderAll();
        toast('Edit mode on — you can run the auction');
      } else { toast('Incorrect password'); }
    } catch (e) { toast('Password check needs https:// or localhost'); }
  }
  function lockEditing() {
    editing = false;
    sessionStorage.removeItem(AUTH_KEY);
    spotlightId = null;
    applyMode(); renderAll();
    toast('Locked — view only');
  }
  function renderModeBar() {
    const bar = $('modeBar');
    bar.className = 'mode-bar ' + (editing ? 'editing' : 'viewing');
    bar.innerHTML = editing
      ? `<span class="mode-tag">✏️ Edit mode — you're running the auction</span>
         <button class="auc-btn" id="lockBtn">🔒 Lock (view only)</button>`
      : `<span class="mode-tag">👀 View only — this is how the auction works</span>
         <button class="auc-btn primary" id="unlockBtn">🔓 Unlock to run auction</button>`;
    const u = $('unlockBtn'); if (u) u.addEventListener('click', unlockEditing);
    const l = $('lockBtn'); if (l) l.addEventListener('click', lockEditing);
  }
  function applyMode() {
    document.body.classList.toggle('editing', editing);
    $('editActions').style.display = editing ? 'contents' : 'none';
    $('nextBtn').style.display = editing ? '' : 'none';
    $('setSquad').disabled = !editing;
    renderModeBar();
  }

  /* ---------- settings bar ---------- */
  function initSettings() {
    $('setBudget').textContent = money(SEASON.budget);
    $('setBase').textContent = money(SEASON.baseSpiker) + ' spiker / ' + money(SEASON.baseOther);
    const sel = $('setSquad');
    sel.value = String(squadTarget);
    sel.addEventListener('change', () => { squadTarget = parseInt(sel.value, 10); renderStats(); renderBoards(); });
  }

  /* ---------- wire up ---------- */
  $('search').addEventListener('input', e => { query = e.target.value.trim().toLowerCase(); renderRows(); });
  $('nextBtn').addEventListener('click', gotoNextUnsold);
  $('exportBtn').addEventListener('click', exportResults);
  $('copyBtn').addEventListener('click', copyJSON);
  $('importBtn').addEventListener('click', () => $('importFile').click());
  $('importFile').addEventListener('change', e => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => importResults(r.result);
    r.readAsText(f);
    e.target.value = '';
  });
  $('resetBtn').addEventListener('click', () => {
    if (!editing) return;
    if (confirm('Clear ALL team assignments for Season 1? This cannot be undone.')) {
      assignments = {}; spotlightId = null; persist(); renderAll();
      toast('All assignments cleared');
    }
  });

  initSettings();
  applyMode();
  renderAll();
})();
