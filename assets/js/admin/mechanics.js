// ============================================================================
// ODE WORKS ADMIN - Mechanics module
// ============================================================================
import { requireAdminGuard, setPageTitle, initMobileSidebarToggle, onPartialsReady } from './admin-auth.js';
import { initCrudTable } from './crud-table.js';

onPartialsReady(async () => {
  const profile = await requireAdminGuard();
  if (!profile) return;
  setPageTitle('Mechanics');
  initMobileSidebarToggle();

  initCrudTable({
    table: 'mechanics',
    select: '*',
    title: 'Mechanic',
    rootSelector: '#crud-root',
    searchFields: ['full_name', 'specialty'],
    orderBy: 'years_experience',
    columns: [
      { key: 'photo', label: '', render: (r) => `<img class="row-thumb" style="border-radius:50%;" src="${r.photo_url || 'https://placehold.co/100x100/1a1a1a/fff?text=OW'}" alt="">` },
      { key: 'full_name', label: 'Name' },
      { key: 'specialty', label: 'Specialty', render: (r) => r.specialty || '—' },
      { key: 'years_experience', label: 'Experience', render: (r) => `${r.years_experience} yrs` },
      { key: 'is_active', label: 'Status', render: (r) => `<span class="badge badge-${r.is_active ? 'success' : 'danger'}">${r.is_active ? 'Active' : 'Inactive'}</span>` }
    ],
    formFields: [
      { name: 'full_name', label: 'Full Name', required: true, colSpan: 2 },
      { name: 'photo_url', label: 'Photo URL', colSpan: 2, default: 'https://placehold.co/400x400/1a1a1a/fff?text=Mechanic' },
      { name: 'specialty', label: 'Specialty' },
      { name: 'years_experience', label: 'Years of Experience', type: 'number', default: 0 },
      { name: 'is_active', label: 'Active', type: 'checkbox', default: true },
      { name: 'bio', label: 'Bio', type: 'textarea', colSpan: 2 }
    ]
  });
});
