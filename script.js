/* =====================================================
   KYIV URBAN POSTER — JavaScript
   ===================================================== */

// =====================================================
// 💰 PRICING CONFIG — edit prices here (EUR)
// =====================================================
const PRICES = {
  printPerUnit: {
    A2: 0.22,   // € per piece
    A1: 0.38,   // € per piece
  },
  pasteBase:        340,  // € base pasting cost (up to 1 000 pcs)
  pasteExtraPer500:  80,  // € extra per each +500 pcs above 1 000
  pasteMinQty:     1000,
  photoPrice:        25,  // € photo report (fixed)
};
// =====================================================

// ─── State ─────────────────────────────────────────
let currentFormat = 'A2';
let currentQty    = 1000;
let currentTotal  = 0;

// ─── Format buttons ────────────────────────────────
function setFormat(fmt) {
  currentFormat = fmt;
  document.getElementById('fmtA2').classList.toggle('active', fmt === 'A2');
  document.getElementById('fmtA1').classList.toggle('active', fmt === 'A1');
  document.getElementById('sumFormat').textContent = fmt;
  updateCalc();
}

// ─── Slider badge ──────────────────────────────────
const slider = document.getElementById('qtySlider');
const badge  = document.getElementById('sliderBadge');

function updateSliderBadge() {
  const min = Number(slider.min);
  const max = Number(slider.max);
  const val = Number(slider.value);
  const pct = (val - min) / (max - min);
  const thumbW  = 22;
  const trackW  = slider.offsetWidth;
  const offset  = pct * (trackW - thumbW) + thumbW / 2;
  badge.style.left    = offset + 'px';
  badge.textContent   = val.toLocaleString('en-EU');
}

slider.addEventListener('input', () => {
  currentQty = Number(slider.value);
  updateSliderBadge();
  updateCalc();
});
window.addEventListener('resize', updateSliderBadge);

// ─── Calculator ────────────────────────────────────
function updateCalc() {
  currentQty = Number(slider.value);

  const printOn = document.getElementById('chkPrint').checked;
  const pasteOn = document.getElementById('chkPaste').checked;
  const photoOn = document.getElementById('chkPhoto').checked;

  const printCost = printOn
    ? Math.round(currentQty * PRICES.printPerUnit[currentFormat])
    : 0;

  let pasteCost = 0;
  if (pasteOn) {
    pasteCost = PRICES.pasteBase;
    if (currentQty > PRICES.pasteMinQty) {
      const extra = Math.ceil((currentQty - PRICES.pasteMinQty) / 500);
      pasteCost  += extra * PRICES.pasteExtraPer500;
    }
  }

  const photoCost = photoOn ? PRICES.photoPrice : 0;
  currentTotal    = printCost + pasteCost + photoCost;

  // Update summary panel
  document.getElementById('sumQty').textContent    = currentQty.toLocaleString('en-EU') + ' pcs';
  document.getElementById('sumFormat').textContent = currentFormat;
  toggleRow('rowPrint', printOn);
  toggleRow('rowPaste', pasteOn);
  toggleRow('rowPhoto', photoOn);
  document.getElementById('sumPrint').textContent  = '€ ' + printCost.toLocaleString('en-EU');
  document.getElementById('sumPaste').textContent  = '€ ' + pasteCost.toLocaleString('en-EU');
  document.getElementById('sumPhoto').textContent  = '€ ' + photoCost.toLocaleString('en-EU');
  document.getElementById('sumTotal').textContent  = '€ ' + currentTotal.toLocaleString('en-EU');
}

function toggleRow(id, show) {
  document.getElementById(id).style.display = show ? '' : 'none';
}

function scrollToCalc() {
  document.getElementById('calculator').scrollIntoView({ behavior: 'smooth' });
}

// ─── FAQ accordion ─────────────────────────────────
function toggleFaq(btn) {
  const item   = btn.closest('.faq-item');
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item.open').forEach(el => el.classList.remove('open'));
  if (!isOpen) item.classList.add('open');
}

// ─── Hamburger menu ────────────────────────────────
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('mobile-open');
});
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('mobile-open');
  });
});

// Navbar scroll tint
window.addEventListener('scroll', () => {
  document.getElementById('navbar').style.borderBottomColor =
    window.scrollY > 60 ? 'rgba(242,201,76,0.15)' : '';
});

// ─── MODAL ─────────────────────────────────────────
const overlay = document.getElementById('modalOverlay');

function openModal() {
  // Sync campaign summary into modal
  const qtyLabel = currentQty.toLocaleString('en-EU');
  document.getElementById('calcSummaryPill').textContent =
    currentFormat + ' · ' + qtyLabel + ' pcs · € ' + currentTotal.toLocaleString('en-EU');

  // Sync hidden fields
  document.getElementById('hiddenQty').value    = qtyLabel + ' pcs';
  document.getElementById('hiddenFormat').value = currentFormat;
  document.getElementById('hiddenTotal').value  = '€ ' + currentTotal.toLocaleString('en-EU');

  // Reset form state
  resetModal();

  overlay.classList.add('open');
  document.body.classList.add('modal-open');

  // Focus first field after animation
  setTimeout(() => document.getElementById('fieldName').focus(), 300);
}

function closeModal() {
  overlay.classList.remove('open');
  document.body.classList.remove('modal-open');
}

function handleOverlayClick(e) {
  if (e.target === overlay) closeModal();
}

// Close on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

function resetModal() {
  document.getElementById('modalForm').style.display    = '';
  document.getElementById('modalSuccess').style.display = 'none';
  document.getElementById('contactForm').reset();
  document.querySelectorAll('.form-group.has-error').forEach(g => g.classList.remove('has-error'));
  const btn = document.getElementById('btnSubmit');
  btn.classList.remove('loading');
  btn.textContent = 'Send request →';
}

// ─── Form validation & submit ──────────────────────
document.getElementById('contactForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const nameEl  = document.getElementById('fieldName');
  const phoneEl = document.getElementById('fieldPhone');
  const emailEl = document.getElementById('fieldEmail');

  let valid = true;

  // Name — required
  if (!nameEl.value.trim()) {
    setError('fieldName', true);
    valid = false;
  } else {
    setError('fieldName', false);
  }

  // Phone — required, at least 7 digits
  const phoneClean = phoneEl.value.replace(/\D/g, '');
  if (phoneClean.length < 7) {
    setError('fieldPhone', true);
    valid = false;
  } else {
    setError('fieldPhone', false);
  }

  // Email — optional, but validate if filled
  if (emailEl.value.trim() && !emailEl.value.includes('@')) {
    setError('fieldEmail', true);
    valid = false;
  } else {
    setError('fieldEmail', false);
  }

  if (!valid) return;

  // ── Submit via Formsubmit.co (AJAX, no redirect) ──
  const btn = document.getElementById('btnSubmit');
  btn.classList.add('loading');
  btn.textContent = 'Sending…';

  const formData = new FormData(this);

  try {
    const res = await fetch('https://formsubmit.co/ajax/2294598@gmail.com', {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: formData,
    });

    if (res.ok) {
      // Show success state
      document.getElementById('modalForm').style.display    = 'none';
      document.getElementById('modalSuccess').style.display = 'flex';
    } else {
      throw new Error('Server error');
    }
  } catch (err) {
    btn.classList.remove('loading');
    btn.textContent = 'Send request →';
    alert('Something went wrong. Please try again or contact us directly.');
  }
});

function setError(fieldId, hasError) {
  const group = document.getElementById(fieldId).closest('.form-group');
  group.classList.toggle('has-error', hasError);
}

// ─── Init ──────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  updateCalc();
  updateSliderBadge();
});
updateCalc();
setTimeout(updateSliderBadge, 50);
