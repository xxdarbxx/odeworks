// ============================================================================
// ODE WORKS ADMIN - Appointments module
// ============================================================================
import { supabase } from '../supabase-client.js';
import { requireAdminGuard, setPageTitle, initMobileSidebarToggle, onPartialsReady } from './admin-auth.js';
import { initCrudTable } from './crud-table.js';
import { formatDate } from '../utils.js';

onPartialsReady(async () => {
  const profile = await requireAdminGuard();
  if (!profile) return;
  setPageTitle('Appointments');
  initMobileSidebarToggle();

  const statusColor = { pending: 'warning', confirmed: 'info', completed: 'success', cancelled: 'danger' };

  initCrudTable({
    table: 'appointments',
    select: '*, profiles(full_name, phone), mechanics(full_name)',
    title: 'Appointment',
    rootSelector: '#crud-root',
    searchFields: ['service_type', 'motorcycle_info'],
    orderBy: 'appointment_date',
    hideAddButton: true,
    columns: [
      { key: 'customer', label: 'Customer', render: (r) => r.profiles?.full_name || 'Guest' },
      { key: 'service_type', label: 'Service' },
      { key: 'mechanic', label: 'Mechanic', render: (r) => r.mechanics?.full_name || 'No preference' },
      { key: 'appointment_date', label: 'Date', render: (r) => `${formatDate(r.appointment_date)} · ${r.appointment_time?.slice(0,5)}` },
      { key: 'status', label: 'Status', render: (r) => `<span class="badge badge-${statusColor[r.status]}">${r.status}</span>` }
    ],
    filters: [
      { key: 'status', label: 'Status', column: 'status', options: [
        { value: 'pending', label: 'Pending' }, { value: 'confirmed', label: 'Confirmed' }, { value: 'completed', label: 'Completed' }, { value: 'cancelled', label: 'Cancelled' }
      ]}
    ],
    formFields: [
      { name: 'status', label: 'Status', type: 'select', options: [
        { value: 'pending', label: 'Pending' }, { value: 'confirmed', label: 'Confirmed' }, { value: 'completed', label: 'Completed' }, { value: 'cancelled', label: 'Cancelled' }
      ]},
      { name: 'mechanic_id', label: 'Assigned Mechanic', type: 'select', includeEmpty: true, options: async () => {
        const { data } = await supabase.from('mechanics').select('id, full_name').eq('is_active', true);
        return (data || []).map(m => ({ value: m.id, label: m.full_name }));
      }},
      { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2 }
    ]
  });
});
