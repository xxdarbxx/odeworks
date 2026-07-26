// ============================================================================
// ODE WORKS ADMIN - Brands module
// ============================================================================
import { requireAdminGuard, setPageTitle, initMobileSidebarToggle, onPartialsReady } from './admin-auth.js';
import { initCrudTable } from './crud-table.js';
import { slugify } from '../utils.js';

onPartialsReady(async () => {
  const profile = await requireAdminGuard();
  if (!profile) return;
  setPageTitle('Brands');
  initMobileSidebarToggle();

  initCrudTable({
    table: 'brands',
    select: '*',
    title: 'Brand',
    rootSelector: '#crud-root',
    searchFields: ['name', 'country'],
    orderBy: 'name',
    orderAsc: true,
    columns: [
      { key: 'logo', label: '', render: (r) => `<img class="row-thumb" src="${r.logo_url || 'https://placehold.co/100x100/1a1a1a/fff?text=OW'}" alt="">` },
      { key: 'name', label: 'Name' },
      { key: 'country', label: 'Country' },
      { key: 'is_active', label: 'Status', render: (r) => `<span class="badge badge-${r.is_active ? 'success' : 'danger'}">${r.is_active ? 'Active' : 'Inactive'}</span>` }
    ],
    formFields: [
      { name: 'name', label: 'Brand Name', required: true, colSpan: 2 },
      { name: 'logo_url', label: 'Logo URL', colSpan: 2, default: 'https://placehold.co/200x100/1a1a1a/fff?text=Logo' },
      { name: 'country', label: 'Country of Origin' },
      { name: 'is_active', label: 'Active', type: 'checkbox', default: true },
      { name: 'description', label: 'Description', type: 'textarea', colSpan: 2 }
    ],
    beforeSave: (payload, isEdit) => {
      if (!isEdit && payload.name) payload.slug = slugify(payload.name);
      return payload;
    }
  });
});
