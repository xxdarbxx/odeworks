// ============================================================================
// ODE WORKS - Customer profile page
// ============================================================================
import { supabase } from '../supabase-client.js';
import { requireAuth, signOut, getCurrentProfile } from '../auth.js';
import { getWishlistItems, removeFromWishlist } from '../wishlist.js';
import { toastSuccess, toastError } from '../toast.js';
import { confirmDialog } from '../modal.js';
import { formatCurrency, formatDate, formatDateTime } from '../utils.js';
import { productImage, motorcycleImage } from '../render.js';

const user = await requireAuth();
if (user) init();

async function init() {
  const profile = await getCurrentProfile();
  if (!profile) return;

  document.getElementById('profile-name').textContent = profile.full_name;
  document.getElementById('profile-email').textContent = profile.email;
  if (profile.avatar_url) document.getElementById('profile-avatar').src = profile.avatar_url;

  const form = document.getElementById('account-form');
  form.full_name.value = profile.full_name || '';
  form.phone.value = profile.phone || '';
  form.email.value = profile.email || '';
  form.address.value = profile.address || '';
  form.city.value = profile.city || '';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('profiles').update({
      full_name: form.full_name.value.trim(),
      phone: form.phone.value.trim(),
      address: form.address.value.trim(),
      city: form.city.value.trim()
    }).eq('id', user.id);
    if (error) { toastError(error.message, 'Update failed'); return; }
    toastSuccess('Your account details have been updated.');
    document.getElementById('profile-name').textContent = form.full_name.value.trim();
  });

  document.getElementById('logout-btn').addEventListener('click', async (e) => {
    e.preventDefault();
    const ok = await confirmDialog({ title: 'Log out?', message: 'You will need to sign in again to access your account.', confirmText: 'Log Out', danger: false });
    if (ok) signOut();
  });

  // Panel switching
  document.querySelectorAll('.profile-menu a[data-panel]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('.profile-menu a[data-panel]').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      document.querySelectorAll('.profile-panel').forEach(p => p.style.display = p.dataset.panelContent === link.dataset.panel ? 'block' : 'none');
      if (link.dataset.panel === 'orders') loadOrders();
      if (link.dataset.panel === 'wishlist') loadWishlist();
      if (link.dataset.panel === 'appointments') loadAppointments();
    });
  });
}

async function loadOrders() {
  const el = document.getElementById('orders-list');
  el.innerHTML = '<div class="spinner"></div>';
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error || !data || !data.length) {
    el.innerHTML = `<div class="empty-state"><i class="fa-solid fa-bag-shopping"></i><p>You haven't placed any orders yet.</p><a href="motorcycles.html" class="btn btn-primary mt-2">Start Shopping</a></div>`;
    return;
  }

  const statusBadge = { pending: 'warning', processing: 'info', shipped: 'accent', delivered: 'success', cancelled: 'danger' };

  el.innerHTML = data.map(o => `
    <div class="card order-row">
      <div class="order-head">
        <div><strong>#${o.order_number}</strong> <span class="text-muted" style="font-size:0.82rem;">${formatDate(o.created_at)}</span></div>
        <span class="badge badge-${statusBadge[o.status] || 'accent'}">${o.status}</span>
      </div>
      ${o.order_items.map(i => `<div class="flex-between" style="font-size:0.88rem;padding:6px 0;"><span>${i.item_name} × ${i.quantity}</span><span>${formatCurrency(i.subtotal)}</span></div>`).join('')}
      <hr class="divider" style="margin:12px 0;">
      <div class="flex-between"><strong>Total</strong><strong>${formatCurrency(o.total)}</strong></div>
    </div>
  `).join('');
}

async function loadWishlist() {
  const el = document.getElementById('wishlist-grid');
  el.innerHTML = '<div class="spinner"></div>';
  const items = await getWishlistItems();
  if (!items.length) {
    el.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><i class="fa-regular fa-heart"></i><p>Your wishlist is empty.</p></div>`;
    return;
  }
  el.innerHTML = items.map(i => `
    <div class="card product-card">
      <a href="${i.itemType === 'motorcycle' ? 'motorcycle-details.html' : 'product-details.html'}?slug=${i.slug}" class="card-media"><img src="${i.image}" alt="${i.name}"></a>
      <div class="card-body">
        <h4>${i.name}</h4>
        <div class="card-price"><span class="price-current">${formatCurrency(i.price)}</span></div>
        <button class="btn btn-outline btn-block mt-2 remove-wish-btn" data-row-id="${i.rowId}" data-type="${i.itemType}">Remove</button>
      </div>
    </div>
  `).join('');
  el.querySelectorAll('.remove-wish-btn').forEach(btn => btn.addEventListener('click', async () => {
    await removeFromWishlist(btn.dataset.rowId, btn.dataset.type);
    toastSuccess('Removed from wishlist.');
    loadWishlist();
  }));
}

async function loadAppointments() {
  const el = document.getElementById('appointments-list');
  el.innerHTML = '<div class="spinner"></div>';
  const { data, error } = await supabase
    .from('appointments')
    .select('*, mechanics(full_name)')
    .eq('user_id', user.id)
    .order('appointment_date', { ascending: false });

  if (error || !data || !data.length) {
    el.innerHTML = `<div class="empty-state"><i class="fa-regular fa-calendar-check"></i><p>No appointments booked yet.</p><a href="booking.html" class="btn btn-primary mt-2">Book a Service</a></div>`;
    return;
  }

  const statusBadge = { pending: 'warning', confirmed: 'info', completed: 'success', cancelled: 'danger' };

  el.innerHTML = data.map(a => `
    <div class="card order-row">
      <div class="order-head">
        <div><strong>${a.service_type}</strong> <span class="text-muted" style="font-size:0.82rem;">${formatDate(a.appointment_date)} · ${a.appointment_time?.slice(0,5)}</span></div>
        <span class="badge badge-${statusBadge[a.status] || 'accent'}">${a.status}</span>
      </div>
      <p class="text-muted" style="font-size:0.85rem;">${a.motorcycle_info || ''} ${a.mechanics ? `· Mechanic: ${a.mechanics.full_name}` : ''}</p>
      ${a.status === 'pending' ? `<button class="btn btn-outline btn-sm mt-2 cancel-appt-btn" data-id="${a.id}">Cancel Appointment</button>` : ''}
    </div>
  `).join('');

  el.querySelectorAll('.cancel-appt-btn').forEach(btn => btn.addEventListener('click', async () => {
    const ok = await confirmDialog({ title: 'Cancel appointment?', message: 'This cannot be undone.', confirmText: 'Cancel Appointment' });
    if (!ok) return;
    await supabase.from('appointments').update({ status: 'cancelled' }).eq('id', btn.dataset.id);
    toastSuccess('Appointment cancelled.');
    loadAppointments();
  }));
}
