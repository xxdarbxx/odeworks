// ============================================================================
// ODE WORKS ADMIN - Users module (manage roles for all profiles)
// New admin/staff accounts are created by having the user register normally,
// then promoting their role here (or via SQL — see README).
// ============================================================================
import { requireAdminGuard, setPageTitle, initMobileSidebarToggle, onPartialsReady } from './admin-auth.js';
import { initCrudTable } from './crud-table.js';
import { formatDate } from '../utils.js';

onPartialsReady(async () => {
  const profile = await requireAdminGuard();
  if (!profile) return;
  setPageTitle('Users');
  initMobileSidebarToggle();

  initCrudTable({
    table: 'profiles',
    select: '*',
    title: 'User',
    rootSelector: '#crud-root',
    searchFields: ['full_name', 'email'],
    hideAddButton: true,
    columns: [
      { key: 'full_name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'role', label: 'Role', render: (r) => `<span class="badge badge-${r.role === 'admin' ? 'accent' : r.role === 'staff' ? 'warning' : 'success'}" style="text-transform:capitalize;">${r.role}</span>` },
      { key: 'created_at', label: 'Joined', render: (r) => formatDate(r.created_at) }
    ],
    filters: [
      { key: 'role', label: 'Role', column: 'role', options: [
        { value: 'customer', label: 'Customer' }, { value: 'staff', label: 'Staff' }, { value: 'admin', label: 'Admin' }
      ]}
    ],
    formFields: [
      { name: 'full_name', label: 'Full Name', required: true, colSpan: 2 },
      { name: 'role', label: 'Role', type: 'select', options: [
        { value: 'customer', label: 'Customer' }, { value: 'staff', label: 'Staff' }, { value: 'admin', label: 'Admin' }
      ]},
      { name: 'phone', label: 'Phone' }
    ]
  });
});
