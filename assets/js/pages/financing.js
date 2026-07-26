// ============================================================================
// ODE WORKS - Financing calculator
// ============================================================================
import { supabase } from '../supabase-client.js';
import { formatCurrency } from '../utils.js';

const priceInput = document.getElementById('price-input');
const motoSelect = document.getElementById('moto-select');
const downRange = document.getElementById('down-payment-range');
const termSelect = document.getElementById('term-select');
const rateRange = document.getElementById('rate-range');

async function loadMotorcycles() {
  const { data } = await supabase.from('motorcycles').select('name, price').order('name');
  if (!data) return;
  motoSelect.innerHTML += data.map(m => `<option value="${m.price}">${m.name} — ${formatCurrency(m.price)}</option>`).join('');
}
motoSelect.addEventListener('change', () => { if (motoSelect.value) priceInput.value = motoSelect.value; calculate(); });

function calculate() {
  const price = Number(priceInput.value) || 0;
  const downPct = Number(downRange.value);
  const term = Number(termSelect.value);
  const annualRate = Number(rateRange.value);

  document.getElementById('down-payment-label').textContent = `${downPct}%`;
  document.getElementById('rate-label').textContent = `${annualRate}% per year`;
  document.getElementById('term-echo').textContent = term;

  const downAmount = price * (downPct / 100);
  const loanAmount = price - downAmount;
  const monthlyRate = annualRate / 100 / 12;

  let monthly;
  if (monthlyRate === 0) {
    monthly = loanAmount / term;
  } else {
    monthly = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, term)) / (Math.pow(1 + monthlyRate, term) - 1);
  }
  monthly = Number.isFinite(monthly) ? monthly : 0;
  const totalPayable = monthly * term;
  const totalInterest = totalPayable - loanAmount;

  document.getElementById('monthly-payment').textContent = formatCurrency(monthly);
  document.getElementById('breakdown-price').textContent = formatCurrency(price);
  document.getElementById('breakdown-down').textContent = formatCurrency(downAmount);
  document.getElementById('breakdown-loan').textContent = formatCurrency(loanAmount);
  document.getElementById('breakdown-interest').textContent = formatCurrency(totalInterest);
  document.getElementById('breakdown-total').textContent = formatCurrency(totalPayable + downAmount);
}

[priceInput, downRange, termSelect, rateRange].forEach(el => el.addEventListener('input', calculate));
loadMotorcycles();
calculate();
