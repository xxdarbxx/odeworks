// ============================================================================
// ODE WORKS ADMIN - Settings module (key/value store)
// ============================================================================
import { supabase } from '../supabase-client.js';
import { requireAdminGuard, setPageTitle, initMobileSidebarToggle, onPartialsReady } from './admin-auth.js';
import { toastSuccess, toastError } from '../toast.js';

const FIELD_CONFIG = {
  store_info: [
    { name: 'name', label: 'Store Name' },
    { name: 'address', label: 'Address' },
    { name: 'phone', label: 'Phone Number' },
    { name: 'email', label: 'Email' },
    { name: 'hours', label: 'Business Hours' }
  ],
  social_links: [
    { name: 'facebook', label: 'Facebook URL' },
    { name: 'instagram', label: 'Instagram URL' },
    { name: 'tiktok', label: 'TikTok URL' },
    { name: 'youtube', label: 'YouTube URL' }
  ],
  map_embed: [
    { name: 'lat', label: 'Latitude', type: 'number' },
    { name: 'lng', label: 'Longitude', type: 'number' },
    { name: 'query', label: 'Map Search Query' }
  ],
  financing_defaults: [
    { name: 'min_down_payment_percent', label: 'Minimum Down Payment (%)', type: 'number' },
    { name: 'interest_rate_annual', label: 'Default Annual Interest Rate (%)', type: 'number' },
    { name: 'terms_months', label: 'Available Terms (comma-separated months)' }
  ]
};

const TITLES = { store_info: 'Store Info', social_links: 'Social Links', map_embed: 'Map Location', financing_defaults: 'Financing Defaults' };

let settingsCache = {};
let activeTab = 'store_info';

onPartialsReady(async () => {
  const profile = await requireAdminGuard();
  if (!profile) return;
  setPageTitle('Settings');
  initMobileSidebarToggle();

  await loadSettings();
  renderForm(activeTab);

  document.querySelectorAll('#settings-tabs a').forEach((tab) => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('#settings-tabs a').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeTab = tab.dataset.tab;
      renderForm(activeTab);
    });
  });
});

async function loadSettings() {
  const { data, error } = await supabase.from('settings').select('*');
  if (error) { toastError(error.message, 'Could not load settings'); return; }
  settingsCache = {};
  (data || []).forEach(row => { settingsCache[row.key] = row.value; });
}

function renderForm(key) {
  const fields = FIELD_CONFIG[key];
  const values = settingsCache[key] || {};
  const root = document.getElementById('settings-form-root');

  root.innerHTML = `
    <h3 class="mb-3">${TITLES[key]}</h3>
    <form id="settings-form">
      ${fields.map(f => {
        let val = values[f.name] ?? '';
        if (Array.isArray(val)) val = val.join(', ');
        return `<div class="form-group"><label>${f.label}</label><input type="${f.type || 'text'}" class="form-control" name="${f.name}" value="${val}"></div>`;
      }).join('')}
      <button type="submit" class="btn btn-primary mt-2">Save Changes</button>
    </form>
  `;

  document.getElementById('settings-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const newValue = {};
    fields.forEach(f => {
      let v = fd.get(f.name);
      if (f.name === 'terms_months') v = v.split(',').map(s => Number(s.trim())).filter(Boolean);
      else if (f.type === 'number') v = Number(v);
      newValue[f.name] = v;
    });

    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span>';

    const { error } = await supabase.from('settings').upsert({ key, value: newValue, updated_at: new Date().toISOString() });

    btn.disabled = false;
    btn.textContent = 'Save Changes';

    if (error) { toastError(error.message, 'Save failed'); return; }
    settingsCache[key] = newValue;
    toastSuccess('Settings updated successfully.');
  });
}
