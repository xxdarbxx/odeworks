// ============================================================================
// ODE WORKS ADMIN - Promotions module
// ============================================================================
import { requireAdminGuard, setPageTitle, initMobileSidebarToggle, onPartialsReady } from './admin-auth.js';
import { initCrudTable } from './crud-table.js';
import { formatCurrency, formatDate } from '../utils.js';

onPartialsReady(async () => {
  const profile = await requireAdminGuard();
  if (!profile) return;
  setPageTitle('Promotions');
  initMobileSidebarToggle();

  initCrudTable({
    table: 'promotions',
    select: '*',
    title: 'Promotion',
    rootSelector: '#crud-root',
    searchFields: ['title', 'code'],
    orderBy: 'created_at',
    columns: [
      { key: 'title', label: 'Title' },
      { key: 'code', label: 'Code', render: (r) => r.code ? `<span class="badge badge-accent">${r.code}</span>` : '—' },
      { key: 'discount', label: 'Discount', render: (r) => r.discount_type === 'percent' ? `${r.discount_value}%` : formatCurrency(r.discount_value) },
      { key: 'ends_at', label: 'Ends', render: (r) => r.ends_at ? formatDate(r.ends_at) : 'No expiry' },
      { key: 'is_active', label: 'Status', render: (r) => `<span class="badge badge-${r.is_active ? 'success' : 'danger'}">${r.is_active ? 'Active' : 'Inactive'}</span>` }
    ],
    formFields: [
      { name: 'title', label: 'Title', required: true, colSpan: 2 },
      { name: 'code', label: 'Promo Code' },
      { name: 'discount_type', label: 'Discount Type', type: 'select', options: [{ value: 'percent', label: 'Percentage' }, { value: 'fixed', label: 'Fixed Amount (₱)' }] },
      { name: 'discount_value', label: 'Discount Value', type: 'number', required: true },
      { name: 'starts_at', label: 'Starts At', type: 'datetime-local' },
      { name: 'ends_at', label: 'Ends At', type: 'datetime-local' },
      { name: 'is_active', label: 'Active', type: 'checkbox', default: true },
      { name: 'description', label: 'Description', type: 'textarea', colSpan: 2 }
    ],
    beforeSave: (payload) => {
      if (payload.code) payload.code = payload.code.toUpperCase();
      return payload;
    }
  });
});
