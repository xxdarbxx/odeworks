// ============================================================================
// ODE WORKS ADMIN - Orders module
// ============================================================================
import { requireAdminGuard, setPageTitle, initMobileSidebarToggle, onPartialsReady } from './admin-auth.js';
import { initCrudTable } from './crud-table.js';
import { formatCurrency, formatDateTime } from '../utils.js';

onPartialsReady(async () => {
  const profile = await requireAdminGuard();
  if (!profile) return;
  setPageTitle('Orders');
  initMobileSidebarToggle();

  const statusColor = { pending: 'warning', processing: 'info', shipped: 'accent', delivered: 'success', cancelled: 'danger' };
  const payColor = { pending: 'warning', paid: 'success', failed: 'danger', refunded: 'accent' };

  initCrudTable({
    table: 'orders',
    select: '*, profiles(full_name, email), order_items(*)',
    title: 'Order',
    rootSelector: '#crud-root',
    searchFields: ['order_number'],
    orderBy: 'created_at',
    hideAddButton: true,
    columns: [
      { key: 'order_number', label: 'Order #', render: (r) => `#${r.order_number}` },
      { key: 'customer', label: 'Customer', render: (r) => r.profiles?.full_name || 'Guest' },
      { key: 'total', label: 'Total', render: (r) => formatCurrency(r.total) },
      { key: 'payment_status', label: 'Payment', render: (r) => `<span class="badge badge-${payColor[r.payment_status]}">${r.payment_status}</span>` },
      { key: 'status', label: 'Status', render: (r) => `<span class="badge badge-${statusColor[r.status]}">${r.status}</span>` },
      { key: 'created_at', label: 'Date', render: (r) => formatDateTime(r.created_at) }
    ],
    filters: [
      { key: 'status', label: 'Status', column: 'status', options: [
        { value: 'pending', label: 'Pending' }, { value: 'processing', label: 'Processing' },
        { value: 'shipped', label: 'Shipped' }, { value: 'delivered', label: 'Delivered' }, { value: 'cancelled', label: 'Cancelled' }
      ]},
      { key: 'payment_status', label: 'Payment', column: 'payment_status', options: [
        { value: 'pending', label: 'Pending' }, { value: 'paid', label: 'Paid' }, { value: 'failed', label: 'Failed' }, { value: 'refunded', label: 'Refunded' }
      ]}
    ],
    viewRenderer: (r) => `
      <h3>Order #${r.order_number}</h3>
      <p class="text-muted mt-1">${formatDateTime(r.created_at)} · ${r.profiles?.full_name || 'Guest'} (${r.profiles?.email || '—'})</p>
      <hr class="divider">
      <h4 class="mb-2">Items</h4>
      ${r.order_items.map(i => `<div class="flex-between" style="padding:6px 0;"><span>${i.item_name} × ${i.quantity}</span><strong>${formatCurrency(i.subtotal)}</strong></div>`).join('')}
      <hr class="divider">
      <div class="summary-row"><span>Subtotal</span><strong>${formatCurrency(r.subtotal)}</strong></div>
      <div class="summary-row"><span>Shipping</span><strong>${formatCurrency(r.shipping_fee)}</strong></div>
      <div class="summary-row"><span>Discount</span><strong>-${formatCurrency(r.discount_amount)}</strong></div>
      <div class="summary-row total"><span>Total</span><strong>${formatCurrency(r.total)}</strong></div>
      <hr class="divider">
      <h4 class="mb-2">Shipping Address</h4>
      <p>${r.shipping_address?.full_name || ''}<br>${r.shipping_address?.street || ''}<br>${r.shipping_address?.city || ''} ${r.shipping_address?.postal_code || ''}<br>${r.contact_phone}</p>
      <p class="mt-2"><strong>Payment Method:</strong> ${r.payment_method}${r.payment_reference ? ` (Ref: ${r.payment_reference})` : ''}</p>
      ${r.notes ? `<p class="mt-1"><strong>Notes:</strong> ${r.notes}</p>` : ''}
    `,
    formFields: [
      { name: 'status', label: 'Order Status', type: 'select', options: [
        { value: 'pending', label: 'Pending' }, { value: 'processing', label: 'Processing' },
        { value: 'shipped', label: 'Shipped' }, { value: 'delivered', label: 'Delivered' }, { value: 'cancelled', label: 'Cancelled' }
      ]},
      { name: 'payment_status', label: 'Payment Status', type: 'select', options: [
        { value: 'pending', label: 'Pending' }, { value: 'paid', label: 'Paid' }, { value: 'failed', label: 'Failed' }, { value: 'refunded', label: 'Refunded' }
      ]},
      { name: 'payment_reference', label: 'Payment Reference', colSpan: 2 }
    ]
  });
});
