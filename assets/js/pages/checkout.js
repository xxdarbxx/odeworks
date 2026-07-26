// ============================================================================
// ODE WORKS - Checkout: order-placement only (no live payment gateway).
// Creates an `orders` + `order_items` record with payment_status='pending'.
// ============================================================================
import { supabase } from '../supabase-client.js';
import { requireAuth, getCurrentProfile } from '../auth.js';
import { getCartItems, clearCart } from '../cart.js';
import { formatCurrency, orderNumber } from '../utils.js';
import { toastSuccess, toastError } from '../toast.js';

const SHIPPING_FEE = 150;
const user = await requireAuth();
let cartItems = [];
let totals = { subtotal: 0, shipping: SHIPPING_FEE, discount: 0, total: 0, promoCode: null };

if (user) init();

async function init() {
  cartItems = await getCartItems();
  if (!cartItems.length) {
    toastError('Your cart is empty.', 'Nothing to check out');
    window.location.href = 'cart.html';
    return;
  }

  const stored = sessionStorage.getItem('ow_checkout_totals');
  if (stored) {
    try { totals = JSON.parse(stored); } catch { /* ignore */ }
  } else {
    totals.subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
    totals.total = totals.subtotal + SHIPPING_FEE;
  }

  renderItems();
  renderTotals();
  prefillForm();
}

function renderItems() {
  document.getElementById('checkout-items-list').innerHTML = cartItems.map(i => `
    <div class="flex-between" style="font-size:0.88rem;padding:8px 0;">
      <span>${i.name} <span class="text-muted">× ${i.quantity}</span></span>
      <strong>${formatCurrency(i.price * i.quantity)}</strong>
    </div>
  `).join('');
}

function renderTotals() {
  document.getElementById('co-subtotal').textContent = formatCurrency(totals.subtotal);
  document.getElementById('co-shipping').textContent = formatCurrency(totals.shipping);
  document.getElementById('co-discount-row').style.display = totals.discount > 0 ? 'flex' : 'none';
  document.getElementById('co-discount').textContent = `-${formatCurrency(totals.discount)}`;
  document.getElementById('co-total').textContent = formatCurrency(totals.total);
}

async function prefillForm() {
  const profile = await getCurrentProfile();
  const form = document.getElementById('checkout-form');
  if (profile) {
    form.full_name.value = profile.full_name || '';
    form.phone.value = profile.phone || '';
    form.street.value = profile.address || '';
    form.city.value = profile.city || 'Quezon City';
  }
}

document.querySelectorAll('input[name="payment_method"]').forEach((radio) => {
  radio.addEventListener('change', () => {
    document.querySelectorAll('.payment-option').forEach(el => el.classList.remove('selected'));
    radio.closest('.payment-option').classList.add('selected');
    document.getElementById('payment-ref-group').style.display = radio.value === 'gcash' ? 'block' : 'none';
  });
});

document.getElementById('place-order-btn').addEventListener('click', async () => {
  const form = document.getElementById('checkout-form');
  if (!form.reportValidity()) return;

  const btn = document.getElementById('place-order-btn');
  const label = btn.querySelector('.btn-label');
  btn.disabled = true;
  label.innerHTML = '<span class="spinner"></span> Placing order...';

  const fd = new FormData(form);
  const shippingAddress = {
    street: fd.get('street'),
    city: fd.get('city'),
    postal_code: fd.get('postal_code'),
    full_name: fd.get('full_name')
  };

  const { data: order, error: orderError } = await supabase.from('orders').insert({
    user_id: user.id,
    order_number: orderNumber(),
    payment_method: fd.get('payment_method'),
    payment_status: 'pending',
    payment_reference: fd.get('payment_reference') || null,
    subtotal: totals.subtotal,
    shipping_fee: totals.shipping,
    discount_amount: totals.discount,
    total: totals.total,
    shipping_address: shippingAddress,
    contact_phone: fd.get('phone'),
    notes: fd.get('notes') || null
  }).select().single();

  if (orderError) {
    toastError(orderError.message, 'Could not place order');
    btn.disabled = false;
    label.textContent = 'Place Order';
    return;
  }

  const orderItems = cartItems.map(i => ({
    order_id: order.id,
    item_type: i.itemType,
    motorcycle_id: i.itemType === 'motorcycle' ? i.itemId : null,
    product_id: i.itemType === 'product' ? i.itemId : null,
    item_name: i.name,
    item_image: i.image,
    unit_price: i.price,
    quantity: i.quantity,
    subtotal: i.price * i.quantity
  }));

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
  if (itemsError) {
    toastError(itemsError.message, 'Order created but items failed to save');
    btn.disabled = false;
    label.textContent = 'Place Order';
    return;
  }

  await clearCart();
  sessionStorage.removeItem('ow_checkout_totals');
  toastSuccess(`Order #${order.order_number} placed! We'll contact you to confirm payment.`, 'Order Placed');
  setTimeout(() => window.location.href = 'profile.html', 1200);
});
