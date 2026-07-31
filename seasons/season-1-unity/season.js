/* ============================================================
   VPL Season 1 · UNITY — public players & teams page renderer
   ============================================================ */
(function () {
  const players = getPlayers();
  const anyAssigned = players.some(p => p.team);

  function posBadge(pos) {
    const code = POSITIONS[pos] || pos;
    return `<span class="pos-badge pos-${code}" title="${pos}">${code}</span>`;
  }

  /* ---------- UNITY strip (hero) ---------- */
  document.getElementById('unityStrip').innerHTML = TEAMS.map(t =>
    `<span class="unity-letter"><b style="color:${t.accent}">${t.letter}</b> ${t.animal} ${t.name}</span>`
  ).join('');

  /* ---------- Teams grid ---------- */
  function renderTeams() {
    const grid = document.getElementById('teamsGrid');
    grid.innerHTML = TEAMS.map(t => {
      const count = players.filter(p => p.team === t.id).length;
      const countLine = anyAssigned
        ? `<div class="tc-count"><b>${count}</b> player${count === 1 ? '' : 's'} drafted</div>`
        : `<div class="tc-count">Roster revealed on auction night</div>`;
      return `
      <a class="team-card" href="#players" data-team="${t.id}" style="--tc-primary:${t.primary}; --tc-accent:${t.accent};">
        <div class="tc-logo"><img src="${t.logo}" alt="${t.name} logo"></div>
        <div class="tc-body">
          <span class="tc-letter">${t.letter}</span>
          <h3>${t.name}</h3>
          ${countLine}
        </div>
      </a>`;
    }).join('');
  }

  /* ---------- Player card ---------- */
  function playerCard(p) {
    const team = p.team ? teamById(p.team) : null;
    const teamTag = team
      ? `<span class="pc-team-tag" style="--pc-team:${team.primary}; background:${team.primary};"><img src="${team.logo}" alt="">${team.name}</span>`
      : '';
    const strip = team ? `<span class="pc-team-strip" style="--pc-team:${team.primary}; background:${team.primary};"></span>` : '';
    return `
      <div class="player-card ${team ? 'assigned' : ''}" data-id="${p.id}" data-name="${p.name.toLowerCase()}" data-team="${p.team || ''}" data-pos="${p.positions.join('|')}">
        ${strip}
        <div class="pc-top">
          <span class="pc-avatar-wrap">
            ${avatarHTML(p)}
            <button class="pc-upload" data-upload="${p.id}" title="Upload / change ${p.name}'s photo" aria-label="Upload photo">📷</button>
            ${isAdmin() ? `<button class="pc-delete" data-delete="${p.id}" title="Delete ${p.name}'s photo" aria-label="Delete photo">🗑</button>` : ''}
          </span>
          <div>
            <div class="pc-name">${p.name}</div>
            <div class="pc-meta">${p.age} · ${p.gender}</div>
          </div>
        </div>
        <div class="pc-pos">${p.positions.map(posBadge).join('')}</div>
        ${teamTag}
      </div>`;
  }

  /* ---------- Pool view ---------- */
  let activePos = 'all';
  let query = '';

  function positionsList() {
    const set = new Set();
    players.forEach(p => p.positions.forEach(pos => set.add(pos)));
    return Array.from(set);
  }

  function renderFilters() {
    const wrap = document.getElementById('poolFilters');
    const buttons = ['all', ...positionsList()];
    wrap.innerHTML = buttons.map(pos => {
      const label = pos === 'all' ? 'All positions' : pos;
      return `<button class="fbtn ${pos === activePos ? 'active' : ''}" data-pos="${pos}">${label}</button>`;
    }).join('');
    wrap.querySelectorAll('.fbtn').forEach(b => b.addEventListener('click', () => {
      activePos = b.dataset.pos;
      renderFilters();
      renderPool();
    }));
  }

  function renderPool() {
    const grid = document.getElementById('playerGrid');
    const filtered = players.filter(p => {
      const posOk = activePos === 'all' || p.positions.includes(activePos);
      const nameOk = !query || p.name.toLowerCase().includes(query);
      return posOk && nameOk;
    });
    grid.innerHTML = filtered.map(playerCard).join('') ||
      `<p class="roster-empty">No players match your filters.</p>`;
    document.getElementById('poolCount').textContent =
      `Showing ${filtered.length} of ${players.length} registered players`;
  }

  /* ---------- Roster view (post-auction) ---------- */
  function renderRosters() {
    const wrap = document.getElementById('rostersView');
    let html = '';
    TEAMS.forEach(t => {
      const roster = players.filter(p => p.team === t.id);
      html += `
        <div class="roster-block">
          <div class="roster-head" style="--rb-primary:${t.primary}; background:${t.primary};">
            <img src="${t.logo}" alt="${t.name} logo">
            <h3>${t.name}</h3>
            <span class="rb-count">${roster.length} player${roster.length === 1 ? '' : 's'}</span>
          </div>
          ${roster.length
            ? `<div class="roster-players">${roster.map(playerCard).join('')}</div>`
            : `<div class="roster-empty">No players drafted yet.</div>`}
        </div>`;
    });
    const unsold = players.filter(p => !p.team);
    if (unsold.length) {
      html += `
        <div class="roster-block">
          <div class="roster-head" style="background:#6E6E73;">
            <h3 style="font-size:20px;">Still in the pool</h3>
            <span class="rb-count">${unsold.length}</span>
          </div>
          <div class="roster-players">${unsold.map(playerCard).join('')}</div>
        </div>`;
    }
    wrap.innerHTML = html;
  }

  /* ---------- View switching ---------- */
  function setupViews() {
    if (!anyAssigned) return;
    const sw = document.getElementById('viewSwitch');
    sw.style.display = 'inline-flex';
    document.getElementById('poolHeading').textContent = 'Season 1 rosters';
    document.getElementById('poolSubtitle').textContent =
      'Teams are set! Browse every player or switch to the team view to see the full rosters.';
    sw.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
      sw.querySelectorAll('button').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      const rosters = b.dataset.view === 'rosters';
      document.getElementById('rostersView').style.display = rosters ? 'block' : 'none';
      document.getElementById('poolView').style.display = rosters ? 'none' : 'block';
    }));
  }

  /* ---------- Team-card click filters the pool ---------- */
  function setupTeamJump() {
    document.querySelectorAll('.team-card').forEach(card => {
      card.addEventListener('click', () => {
        if (!anyAssigned) return;
        const sw = document.getElementById('viewSwitch');
        if (sw) {
          sw.querySelector('[data-view="rosters"]').click();
          const blocks = document.querySelectorAll('.roster-block');
          const idx = TEAMS.findIndex(t => t.id === card.dataset.team);
          if (blocks[idx]) blocks[idx].scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  /* ---------- init ---------- */
  renderTeams();
  renderFilters();
  renderPool();
  if (anyAssigned) renderRosters();
  setupViews();
  setupTeamJump();

  document.getElementById('poolSearch').addEventListener('input', (e) => {
    query = e.target.value.trim().toLowerCase();
    renderPool();
  });

  /* ---------- photo upload (Netlify Blobs) ---------- */
  function toast(msg) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove('show'), 2600);
  }

  // shared hidden file input
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  fileInput.style.display = 'none';
  document.body.appendChild(fileInput);
  let uploadTargetId = null;

  // centre-crop to a square JPEG in the browser so uploads stay tiny
  function compressToSquareJpeg(file, size, quality) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        const img = new Image();
        img.onerror = reject;
        img.onload = () => {
          const s = Math.min(img.width, img.height);
          const sx = (img.width - s) / 2, sy = (img.height - s) / 2;
          const c = document.createElement('canvas');
          c.width = c.height = size;
          c.getContext('2d').drawImage(img, sx, sy, s, s, 0, 0, size, size);
          resolve(c.toDataURL('image/jpeg', quality));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function setCardPhoto(id, url) {
    document.querySelectorAll('.player-card[data-id="' + id + '"] .player-avatar').forEach(av => {
      let img = av.querySelector('img');
      if (!img) { img = document.createElement('img'); img.alt = ''; av.appendChild(img); }
      img.onerror = () => img.remove();
      img.src = url;
    });
  }

  async function uploadPhoto(id, file) {
    const name = (PLAYERS.find(p => p.id === id) || {}).name || 'player';
    if (!/^image\//.test(file.type)) { toast('Please choose an image file'); return; }
    toast('Uploading ' + name + "'s photo…");
    try {
      const dataUrl = await compressToSquareJpeg(file, 400, 0.85);
      const res = await fetch(PHOTO_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, dataUrl }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error || ('HTTP ' + res.status));
      }
      setCardPhoto(id, PHOTO_ENDPOINT + '?id=' + id + '&t=' + Date.now());
      toast('Photo updated for ' + name + ' ✓');
    } catch (err) {
      toast('Upload failed: ' + err.message + (location.hostname === 'localhost' ? ' (needs Netlify)' : ''));
    }
  }

  fileInput.addEventListener('change', () => {
    const f = fileInput.files[0];
    if (f && uploadTargetId) uploadPhoto(uploadTargetId, f);
    fileInput.value = '';
  });

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.pc-upload');
    if (!btn) return;
    uploadTargetId = btn.dataset.upload;
    fileInput.click();
  });

  /* ---------- admin mode (organiser) — enables photo delete ---------- */
  let adminToken = sessionStorage.getItem('vpl-s1-token') || null;
  function isAdmin() { return sessionStorage.getItem('vpl-s1-admin') === '1'; }
  // Verify against the Netlify env var `auction_unlock` (server-side).
  // Returns a derived token on success (used to authorise photo deletes), else null.
  async function authenticate(pw) {
    try {
      const res = await fetch('/.netlify/functions/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw }),
      });
      const d = await res.json().catch(() => ({}));
      return (res.ok && d.ok === true) ? (d.token || '') : null;
    } catch (e) { return null; }
  }
  function rerender() { renderPool(); if (anyAssigned) renderRosters(); }
  async function enterAdmin() {
    const pw = prompt('Organiser password to manage photos:');
    if (pw == null) return;
    toast('Checking…');
    const token = await authenticate(pw);
    if (token !== null) {
      adminToken = token;
      sessionStorage.setItem('vpl-s1-admin', '1');
      sessionStorage.setItem('vpl-s1-token', token);
      toast('Admin mode on — 🗑 delete buttons enabled');
      rerender();
    } else {
      toast('Incorrect password (or run it on the deployed Netlify site)');
    }
  }
  function exitAdmin() {
    adminToken = null;
    sessionStorage.removeItem('vpl-s1-admin');
    sessionStorage.removeItem('vpl-s1-token');
    toast('Admin mode off');
    rerender();
  }

  async function deletePhoto(id) {
    const name = (PLAYERS.find(p => p.id === id) || {}).name || 'player';
    if (!isAdmin() || !adminToken) { toast('Enable admin mode first'); return; }
    if (!confirm('Remove ' + name + "'s photo?")) return;
    try {
      const res = await fetch(PHOTO_ENDPOINT + '?id=' + id, {
        method: 'DELETE',
        headers: { 'x-vpl-token': adminToken },
      });
      if (res.status === 401) { toast('Session expired — unlock admin again'); exitAdmin(); return; }
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || ('HTTP ' + res.status)); }
      document.querySelectorAll('.player-card[data-id="' + id + '"] .player-avatar img').forEach(img => img.remove());
      toast('Photo removed for ' + name);
    } catch (err) { toast('Delete failed: ' + err.message); }
  }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.pc-delete');
    if (!btn) return;
    deletePhoto(btn.dataset.delete);
  });

  // admin toggle in the footer
  const adminLink = document.getElementById('adminToggle');
  if (adminLink) {
    const refresh = () => { adminLink.textContent = isAdmin() ? 'Admin ✓' : 'Admin'; };
    refresh();
    adminLink.addEventListener('click', async (e) => {
      e.preventDefault();
      if (isAdmin()) exitAdmin(); else await enterAdmin();
      refresh();
    });
  }

  /* reveal-on-scroll (matches base site) */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => { if (en.isIntersecting) en.target.classList.add('in'); });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
})();
