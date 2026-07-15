// ---------- Scroll reveal ----------
(function(){
  const items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  items.forEach(el => io.observe(el));
})();

// ---------- Signature scoreboard: plays out the 25pt / deuce / 30-cap rule ----------
(function(){
  const scoreAEl = document.getElementById('scoreA');
  const scoreBEl = document.getElementById('scoreB');
  const statusEl = document.getElementById('sbStatus');
  const meterEl = document.getElementById('sbMeter');
  const nameAEl = document.getElementById('teamAName');
  const nameBEl = document.getElementById('teamBName');
  if (!scoreAEl) return;

  const NAMES = ['Team A', 'Team B'];

  // Scripted point sequence: races to 24-24, hits deuce, then plays to 30.
  function buildSequence(){
    const seq = [];
    let a = 0, b = 0;
    // Race up to 24-24
    const path = [];
    while (a < 24 || b < 24) {
      if (a <= b && a < 24) { a++; path.push('A'); }
      else if (b < 24) { b++; path.push('B'); }
      else { a++; path.push('A'); }
    }
    seq.push(...path.map(x => ({ team: x })));
    // Deuce phase -> race to 30
    let da = 24, db = 24;
    const deucePath = ['B','A','B','A','A','B','A']; // scripted tight finish, capped at 30
    for (const t of deucePath) {
      if (t === 'A' && da < 30) da++;
      if (t === 'B' && db < 30) db++;
      seq.push({ team: t });
      if (da === 30 || db === 30) break;
    }
    return seq;
  }

  let sequence = buildSequence();
  let idx = 0;
  let a = 0, b = 0;

  function reset(){
    a = 0; b = 0; idx = 0;
    scoreAEl.textContent = '0';
    scoreBEl.textContent = '0';
    statusEl.innerHTML = 'Racing to 25 · win by 2';
    meterEl.style.width = '0%';
  }

  function tick(){
    if (idx >= sequence.length) {
      const winner = a > b ? NAMES[0] : NAMES[1];
      statusEl.innerHTML = `<strong>${winner} wins</strong> ${a}–${b}`;
      meterEl.style.width = '100%';
      setTimeout(() => { reset(); setTimeout(tick, 900); }, 2200);
      return;
    }
    const pt = sequence[idx];
    if (pt.team === 'A') a++; else b++;
    scoreAEl.textContent = a;
    scoreBEl.textContent = b;

    if (a >= 24 && b >= 24) {
      statusEl.innerHTML = `<strong>Deuce</strong> — first to 30 wins`;
    } else {
      statusEl.textContent = 'Racing to 25 · win by 2';
    }
    const progress = Math.min(100, (Math.max(a, b) / 30) * 100);
    meterEl.style.width = progress + '%';

    idx++;
    const delay = (a >= 24 && b >= 24) ? 650 : 420;
    setTimeout(tick, delay);
  }

  reset();
  setTimeout(tick, 900);
})();
