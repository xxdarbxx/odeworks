// ============================================================================
// ODE WORKS ADMIN - Customers module (profiles with role = customer)
// ============================================================================
import { requireAdminGuard, setPageTitle, initMobileSidebarToggle, onPartialsReady } from './admin-auth.js';
import { initCrudTable } from './crud-table.js';
import { formatDate } from '../utils.js';

onPartialsReady(async () => {
  const profile = await requireAdminGuard();
  if (!profile) return;
  setPageTitle('Customers');
  initMobileSidebarToggle();

  initCrudTable({
    table: 'profiles',
    select: '*',
    title: 'Customer',
    rootSelector: '#crud-root',
    searchFields: ['full_name', 'email', 'phone'],
    baseFilter: { column: 'role', value: 'customer' },
    hideAddButton: true,
    readOnlyDelete: true,
    columns: [
      { key: 'full_name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone', render: (r) => r.phone || '—' },
      { key: 'city', label: 'City', render: (r) => r.city || '—' },
      { key: 'created_at', label: 'Joined', render: (r) => formatDate(r.created_at) }
    ],
    formFields: [
      { name: 'full_name', label: 'Full Name', required: true, colSpan: 2 },
      { name: 'phone', label: 'Phone' },
      { name: 'city', label: 'City' },
      { name: 'address', label: 'Address', colSpan: 2 }
    ]
  });
});
