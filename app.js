// =============================================
//  SimulaParc — Simulador de Parcelas
//  Vanilla JS · Tabela Price · Exportar CSV
// =============================================

// ─── ESTADO ───────────────────────────────────
const state = {
  price: 0,
  down: 0,
  mode: 'none',     // 'none' | 'monthly' | 'annual'
  rate: 0,
  n: 1,
  schedule: [],
};

// ─── SELETORES ────────────────────────────────
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

const elPrice      = $('#price');
const elDown       = $('#down');
const elRate       = $('#rate');
const elCustomN    = $('#custom-n');
const elRateGroup  = $('#rate-group');
const elRateSuffix = $('#rate-suffix');
const elRateLabel  = $('#rate-label');
const elSimBtn     = $('#simulate-btn');
const elExportBtn  = $('#export-btn');
const elToast      = $('#toast');

// Preview
const elPrevPrice       = $('#prev-price');
const elPrevDown        = $('#prev-down');
const elPrevFinanced    = $('#prev-financed');
const elPrevInstallment = $('#prev-installment');
const elPrevTotal       = $('#prev-total');
const elPrevInterest    = $('#prev-interest');
const elBarPrincipal    = $('#bar-principal');
const elBarInterest     = $('#bar-interest');
const elPctPrincipal    = $('#pct-principal');
const elPctInterest     = $('#pct-interest');

// Hero
const elHeroInterest    = $('#hero-interest');
const elHeroInstallment = $('#hero-installment');

// Results
const elResultsEmpty   = $('#results-empty');
const elResultsContent = $('#results-content');
const elRcInstallment  = $('#rc-installment');
const elRcTotal        = $('#rc-total');
const elRcCet          = $('#rc-cet');
const elRcNLabel       = $('#rc-n-label');
const elRcInterestLabel = $('#rc-interest-label');
const elScheduleBody   = $('#schedule-body');
const elCompareGrid    = $('#compare-grid');

// ─── UTILS ────────────────────────────────────
function fmt(val) {
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function fmtPct(val) {
  return val.toFixed(2).replace('.', ',') + '%';
}

function parseBR(str) {
  if (!str) return 0;
  // accepts "1.234,56" or "1234.56" or "1234,56"
  const s = str.trim().replace(/\s/g, '');
  // if has comma and dot: remove dots (thousand), replace comma with dot
  if (s.includes(',') && s.includes('.')) {
    return parseFloat(s.replace(/\./g, '').replace(',', '.')) || 0;
  }
  // if only comma: treat as decimal separator
  if (s.includes(',')) {
    return parseFloat(s.replace(',', '.')) || 0;
  }
  return parseFloat(s) || 0;
}

function formatInput(input) {
  let raw = input.value.replace(/[^\d,]/g, '');
  input.value = raw;
}

function showToast(msg, duration = 2800) {
  elToast.textContent = msg;
  elToast.classList.add('show');
  setTimeout(() => elToast.classList.remove('show'), duration);
}

function isoDate(monthsFromNow) {
  const d = new Date();
  d.setMonth(d.getMonth() + monthsFromNow + 1);
  return d.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }).replace(' de ', '/');
}

// ─── CÁLCULOS ─────────────────────────────────
function calcInstallment(pv, i, n) {
  // Tabela Price
  if (i === 0) return pv / n;
  return pv * (i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
}

function buildSchedule(pv, i, n) {
  const rows = [];
  let balance = pv;

  if (i === 0) {
    const pmt = pv / n;
    for (let k = 1; k <= n; k++) {
      rows.push({
        n: k,
        date: isoDate(k - 1),
        pmt,
        interest: 0,
        amort: pmt,
        balance: Math.max(balance - pmt, 0),
      });
      balance -= pmt;
    }
  } else {
    const pmt = calcInstallment(pv, i, n);
    for (let k = 1; k <= n; k++) {
      const interest = balance * i;
      const amort = pmt - interest;
      balance = Math.max(balance - amort, 0);
      rows.push({
        n: k,
        date: isoDate(k - 1),
        pmt,
        interest,
        amort,
        balance: k === n ? 0 : balance,
      });
    }
  }
  return rows;
}

function getMonthlyRate() {
  const raw = parseBR(elRate.value) / 100;
  if (state.mode === 'annual') {
    return Math.pow(1 + raw, 1 / 12) - 1;
  }
  return raw;
}

// ─── PREVIEW ──────────────────────────────────
function updatePreview() {
  const price    = parseBR(elPrice.value);
  const down     = parseBR(elDown.value);
  const financed = Math.max(price - down, 0);
  const i        = state.mode === 'none' ? 0 : getMonthlyRate();
  const n        = state.n;

  state.price = price;
  state.down  = down;
  state.rate  = i;

  if (price === 0) {
    elPrevPrice.textContent       = '—';
    elPrevDown.textContent        = '—';
    elPrevFinanced.textContent    = '—';
    elPrevInstallment.textContent = '—';
    elPrevTotal.textContent       = '—';
    elPrevInterest.textContent    = '—';
    elBarPrincipal.style.width    = '100%';
    elBarInterest.style.width     = '0%';
    elPctPrincipal.textContent    = '100%';
    elPctInterest.textContent     = '0%';
    elHeroInterest.textContent    = 'R$ —';
    elHeroInstallment.textContent = 'R$ —';
    return;
  }

  const pmt      = calcInstallment(financed, i, n);
  const total    = pmt * n + down;
  const interest = Math.max(total - price, 0);
  const pctPrincipal = total > 0 ? (price / total * 100) : 100;
  const pctInterest  = 100 - pctPrincipal;

  elPrevPrice.textContent       = fmt(price);
  elPrevDown.textContent        = fmt(down);
  elPrevFinanced.textContent    = fmt(financed);
  elPrevInstallment.textContent = fmt(pmt);
  elPrevTotal.textContent       = fmt(total);
  elPrevInterest.textContent    = interest > 0 ? fmt(interest) : 'R$ 0,00';

  elBarPrincipal.style.width = pctPrincipal.toFixed(1) + '%';
  elBarInterest.style.width  = pctInterest.toFixed(1) + '%';
  elPctPrincipal.textContent = fmtPct(pctPrincipal);
  elPctInterest.textContent  = fmtPct(pctInterest);

  elHeroInterest.textContent    = interest > 0 ? fmt(interest) : 'R$ 0,00';
  elHeroInstallment.textContent = fmt(pmt);
}

// ─── SIMULATE ─────────────────────────────────
function simulate() {
  const price    = parseBR(elPrice.value);
  const down     = parseBR(elDown.value);
  const financed = Math.max(price - down, 0);

  if (price === 0) { showToast('⚠️ Informe o valor do produto.'); return; }
  if (down >= price) { showToast('⚠️ A entrada não pode ser maior ou igual ao valor.'); return; }
  if (state.mode !== 'none' && parseBR(elRate.value) === 0) {
    showToast('⚠️ Informe a taxa de juros.'); return;
  }

  const i   = state.mode === 'none' ? 0 : getMonthlyRate();
  const n   = state.n;
  const pmt = calcInstallment(financed, i, n);
  const schedule = buildSchedule(financed, i, n);
  state.schedule = schedule;

  const total    = pmt * n + down;
  const interest = Math.max(total - price, 0);
  const cet      = price > 0 ? ((total / price - 1) * 100) : 0;

  // Fill result cards
  elRcInstallment.textContent  = fmt(pmt);
  elRcNLabel.textContent       = `${n}x parcela${n > 1 ? 's' : ''}`;
  elRcTotal.textContent        = fmt(total);
  elRcInterestLabel.textContent = `+ ${fmt(interest)} em juros`;
  elRcCet.textContent          = fmtPct(cet);

  // Build table
  elScheduleBody.innerHTML = '';
  schedule.forEach(row => {
    const tr = document.createElement('tr');
    if (row.interest > 0.005) tr.classList.add('row-interest');
    tr.innerHTML = `
      <td>${row.n}</td>
      <td>${row.date}</td>
      <td>${fmt(row.pmt)}</td>
      <td>${fmt(row.interest)}</td>
      <td>${fmt(row.amort)}</td>
      <td>${fmt(row.balance)}</td>
    `;
    elScheduleBody.appendChild(tr);
  });

  // Show results
  elResultsEmpty.style.display   = 'none';
  elResultsContent.style.display = 'block';

  // Build compare
  buildCompare(financed, i, down, price);

  // Scroll
  setTimeout(() => {
    $('#results').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);

  showToast('✅ Simulação concluída!');
}

// ─── COMPARE ──────────────────────────────────
function buildCompare(financed, i, down, price) {
  const options = [1, 2, 3, 4, 5, 6, 8, 10, 12, 18, 24, 36].filter(x => x !== 0);
  const results = options.map(n => {
    const pmt   = calcInstallment(financed, i, n);
    const total = pmt * n + down;
    return { n, pmt, total, interest: Math.max(total - price, 0) };
  });

  const minTotal = Math.min(...results.map(r => r.total));

  elCompareGrid.innerHTML = '';
  results.forEach(r => {
    const isBest = r.total === minTotal;
    const card = document.createElement('div');
    card.className = 'compare-card' + (isBest ? ' best' : '');
    card.innerHTML = `
      <span class="cc-n">${r.n}x</span>
      <span class="cc-installment">${fmt(r.pmt)}</span>
      <span class="cc-total">Total: ${fmt(r.total)}</span>
      <span class="cc-interest">${r.interest > 0 ? '+ ' + fmt(r.interest) + ' juros' : 'Sem juros'}</span>
      ${isBest ? '<span class="cc-badge">✦ Menor custo</span>' : ''}
    `;
    elCompareGrid.appendChild(card);
  });
}

// ─── EXPORT CSV ───────────────────────────────
function exportCSV() {
  if (!state.schedule.length) { showToast('⚠️ Simule primeiro.'); return; }

  const header = ['Parcela','Vencimento','Valor (R$)','Juros (R$)','Amortização (R$)','Saldo Devedor (R$)'];
  const rows = state.schedule.map(r => [
    r.n, r.date,
    r.pmt.toFixed(2).replace('.', ','),
    r.interest.toFixed(2).replace('.', ','),
    r.amort.toFixed(2).replace('.', ','),
    r.balance.toFixed(2).replace('.', ','),
  ]);

  const csv = [header, ...rows].map(r => r.join(';')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'simulaparc_cronograma.csv';
  a.click();
  URL.revokeObjectURL(url);
  showToast('📄 CSV exportado com sucesso!');
}

// ─── EVENT LISTENERS ──────────────────────────

// Inputs → preview em tempo real
elPrice.addEventListener('input', () => { formatInput(elPrice); updatePreview(); });
elDown.addEventListener('input',  () => { formatInput(elDown);  updatePreview(); });
elRate.addEventListener('input',  () => { formatInput(elRate);  updatePreview(); });

// Toggle modo juros
$$('.toggle-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    $$('.toggle-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.mode = btn.dataset.mode;

    if (state.mode === 'none') {
      elRateGroup.style.display = 'none';
    } else {
      elRateGroup.style.display = 'flex';
      if (state.mode === 'monthly') {
        elRateLabel.textContent  = 'Taxa de juros ao mês';
        elRateSuffix.textContent = '% a.m.';
      } else {
        elRateLabel.textContent  = 'Taxa de juros ao ano';
        elRateSuffix.textContent = '% a.a.';
      }
    }
    updatePreview();
  });
});

// Botões de parcelas
$$('.inst-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    $$('.inst-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.n = parseInt(btn.dataset.n);
    elCustomN.value = '';
    updatePreview();
  });
});

// Campo customizado de parcelas
elCustomN.addEventListener('input', () => {
  const val = parseInt(elCustomN.value);
  if (val >= 1 && val <= 360) {
    $$('.inst-btn').forEach(b => b.classList.remove('active'));
    state.n = val;
    updatePreview();
  }
});

// Simular
elSimBtn.addEventListener('click', simulate);

// Exportar
elExportBtn && elExportBtn.addEventListener('click', exportCSV);

// Enter nos campos → simular
[elPrice, elDown, elRate, elCustomN].forEach(el => {
  el && el.addEventListener('keydown', e => {
    if (e.key === 'Enter') simulate();
  });
});

// ─── INIT ─────────────────────────────────────
updatePreview();
