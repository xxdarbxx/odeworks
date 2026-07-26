// ============================================================================
// ODE WORKS - Motorcycle comparison page (localStorage-backed, max 3 slots)
// ============================================================================
import { supabase } from '../supabase-client.js';
import { formatCurrency, getQueryParam, starIcons } from '../utils.js';
import { motorcycleImage } from '../render.js';

const LOCAL_KEY = 'ow_compare';
const MAX_SLOTS = 3;

function getIds() {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY)) || []; } catch { return []; }
}
function setIds(ids) { localStorage.setItem(LOCAL_KEY, JSON.stringify(ids)); }

const addId = getQueryParam('add');
if (addId) {
  const ids = getIds();
  if (!ids.includes(addId) && ids.length < MAX_SLOTS) ids.push(addId);
  setIds(ids);
  history.replaceState(null, '', 'compare.html');
}

const SPEC_ROWS = [
  { key: 'price', label: 'Price', fmt: (m) => formatCurrency(m.price) },
  { key: 'category', label: 'Category', fmt: (m) => `<span style="text-transform:capitalize;">${m.category}</span>` },
  { key: 'engine_displacement', label: 'Engine Displacement', fmt: (m) => m.engine_displacement || '—' },
  { key: 'engine_type', label: 'Engine Type', fmt: (m) => m.engine_type || '—' },
  { key: 'transmission', label: 'Transmission', fmt: (m) => m.transmission || '—' },
  { key: 'top_speed', label: 'Top Speed', fmt: (m) => m.top_speed || '—' },
  { key: 'weight', label: 'Weight', fmt: (m) => m.weight || '—' },
  { key: 'seat_height', label: 'Seat Height', fmt: (m) => m.seat_height || '—' },
  { key: 'fuel_capacity', label: 'Fuel Capacity', fmt: (m) => m.fuel_capacity || '—' },
  { key: 'rating', label: 'Rating', fmt: (m) => `${starIcons(m.rating)} (${m.review_count})` }
];

async function render() {
  const ids = getIds();
  const slotsEl = document.getElementById('compare-slots');
  const tableEl = document.getElementById('compare-table');

  let motos = [];
  if (ids.length) {
    const { data } = await supabase.from('motorcycles').select('*, brands(name), motorcycle_images(image_url, is_primary)').in('id', ids);
    motos = ids.map(id => data?.find(m => m.id === id)).filter(Boolean);
  }

  const slotHtml = [];
  for (let i = 0; i < MAX_SLOTS; i++) {
    const m = motos[i];
    if (m) {
      slotHtml.push(`
        <div class="card compare-slot" style="padding:20px;text-align:center;">
          <img src="${motorcycleImage(m)}" alt="${m.name}" style="width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:12px;margin-bottom:12px;">
          <h4>${m.name}</h4>
          <p class="text-muted" style="font-size:0.85rem;">${m.brands?.name || ''}</p>
          <button class="compare-remove" data-id="${m.id}">Remove</button>
        </div>
      `);
    } else {
      slotHtml.push(`
        <a href="motorcycles.html" class="card compare-slot flex-center" style="padding:20px;min-height:220px;flex-direction:column;gap:10px;color:var(--color-text-faint);">
          <i class="fa-solid fa-plus" style="font-size:1.6rem;"></i>
          <span>Add a motorcycle</span>
        </a>
      `);
    }
  }
  slotsEl.innerHTML = slotHtml.join('');
  slotsEl.querySelectorAll('.compare-remove').forEach(btn => btn.addEventListener('click', () => {
    setIds(getIds().filter(id => id !== btn.dataset.id));
    render();
  }));

  if (!motos.length) {
    tableEl.innerHTML = `<tr><td><div class="empty-state"><i class="fa-solid fa-code-compare"></i><p>Add motorcycles from the Motorcycles page to start comparing.</p></div></td></tr>`;
    return;
  }

  tableEl.innerHTML = `
    <tr><th>Specification</th>${motos.map(m => `<th>${m.name}</th>`).join('')}</tr>
    ${SPEC_ROWS.map(row => `<tr><td>${row.label}</td>${motos.map(m => `<td>${row.fmt(m)}</td>`).join('')}</tr>`).join('')}
  `;
}

render();
