(function () {
  const form = document.getElementById('regForm');
  const positionGroup = document.getElementById('positionGroup');
  const posNote = document.getElementById('posNote');
  const posCheckboxes = () => Array.from(positionGroup.querySelectorAll('input[type="checkbox"]'));
  const MAX_POSITIONS = 3;

  // ---------- Position max-3 enforcement ----------
  function refreshPositionState() {
    const checked = posCheckboxes().filter(cb => cb.checked);
    posNote.textContent = `${checked.length} of ${MAX_POSITIONS} selected`;
    posNote.classList.toggle('err', checked.length >= MAX_POSITIONS);
    posCheckboxes().forEach(cb => {
      if (!cb.checked && checked.length >= MAX_POSITIONS) {
        cb.disabled = true;
        cb.closest('.pill-option').style.opacity = '0.45';
      } else {
        cb.disabled = false;
        cb.closest('.pill-option').style.opacity = '1';
      }
    });
  }
  posCheckboxes().forEach(cb => cb.addEventListener('change', refreshPositionState));
  refreshPositionState();

  // ---------- Field-level validation helpers ----------
  function setInvalid(fieldId, invalid) {
    const el = document.getElementById(fieldId);
    if (el) el.classList.toggle('invalid', invalid);
  }

  function validate(data) {
    let ok = true;

    if (!data.fullName.trim()) { setInvalid('field-name', true); ok = false; } else setInvalid('field-name', false);

    const phoneDigits = data.phone.replace(/[^0-9]/g, '');
    if (phoneDigits.length < 6) { setInvalid('field-phone', true); ok = false; } else setInvalid('field-phone', false);

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim());
    if (!emailOk) { setInvalid('field-email', true); ok = false; } else setInvalid('field-email', false);

    if (!data.ageRange) { setInvalid('field-age', true); ok = false; } else setInvalid('field-age', false);
    if (!data.gender) { setInvalid('field-gender', true); ok = false; } else setInvalid('field-gender', false);
    if (!data.position.length) { setInvalid('field-position', true); ok = false; } else setInvalid('field-position', false);

    const consentOk = data.consent1 && data.consent2 && data.consent3;
    if (!consentOk) { setInvalid('field-consent', true); ok = false; } else setInvalid('field-consent', false);

    return ok;
  }

  function makeId() {
    const n = Math.floor(1000 + Math.random() * 9000);
    return 'MXC-' + n + '-' + new Date().getFullYear();
  }

  // ---------- Netlify Forms submission ----------
  function encodeForNetlify(obj) {
    return Object.keys(obj)
      .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k]))
      .join('&');
  }

  function submitToNetlify(record) {
    const payload = {
      'form-name': 'registration',
      id: record.id,
      fullName: record.fullName,
      phone: record.phone,
      email: record.email,
      ageRange: record.ageRange,
      gender: record.gender,
      position: record.position.join(', '),
      consent1: record.consent1 ? 'yes' : 'no',
      consent2: record.consent2 ? 'yes' : 'no',
      consent3: record.consent3 ? 'yes' : 'no',
      registeredAt: record.registeredAt,
    };
    return fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: encodeForNetlify(payload),
    });
  }

  // ---------- Submit ----------
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const data = {
      fullName: document.getElementById('fullName').value,
      phone: document.getElementById('phone').value,
      email: document.getElementById('email').value,
      ageRange: (form.querySelector('input[name="ageRange"]:checked') || {}).value || '',
      gender: (form.querySelector('input[name="gender"]:checked') || {}).value || '',
      position: posCheckboxes().filter(cb => cb.checked).map(cb => cb.value),
      consent1: document.getElementById('consent1').checked,
      consent2: document.getElementById('consent2').checked,
      consent3: document.getElementById('consent3').checked,
    };

    // Honeypot check — if the hidden bot-field got filled, silently drop it.
    const honeypot = form.querySelector('input[name="bot-field"]');
    if (honeypot && honeypot.value) return;

    if (!validate(data)) {
      const firstInvalid = form.querySelector('.invalid');
      if (firstInvalid) firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const id = makeId();
    const record = Object.assign({ id, registeredAt: new Date().toISOString() }, data);

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Registering…';

    submitToNetlify(record)
      .catch(() => { /* still show success below — see form-note about following up if needed */ })
      .then(() => {
        document.getElementById('successId').textContent = id;
        document.getElementById('successName').textContent =
          `Thanks, ${data.fullName.split(' ')[0]} — you're in the Mixer Cup player pool. ` +
          `Your team gets decided on auction night, and we'll follow up about the $50 entry fee.`;

        document.getElementById('formView').style.display = 'none';
        document.getElementById('successView').style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });

        submitBtn.disabled = false;
        submitBtn.textContent = 'Register — pay $50 to confirm';
      });
  });

  document.getElementById('registerAnotherBtn').addEventListener('click', function () {
    form.reset();
    posCheckboxes().forEach(cb => { cb.disabled = false; cb.closest('.pill-option').style.opacity = '1'; });
    refreshPositionState();
    form.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
    document.getElementById('successView').style.display = 'none';
    document.getElementById('formView').style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

})();
