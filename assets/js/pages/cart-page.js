// ============================================================================
// ODE WORKS - Shopping cart page
// ============================================================================
import { supabase } from '../supabase-client.js';
import { getCartItems, updateQuantity, removeFromCart } from '../cart.js';
import { formatCurrency } from '../utils.js';
import { toastSuccess, toastError } from '../toast.js';
import { confirmDialog } from '../modal.js';

const SHIPPING_FEE = 150;
let cartItems = [];
let appliedPromo = null;

async function render() {
  cartItems = await getCartItems();
  const col = document.getElementById('cart-items-col');
  const summaryBox = document.getElementById('summary-box');

  if (!cartItems.length) {
    col.innerHTML = `
      <div class="cart-empty">
        <i class="fa-solid fa-bag-shopping" style="font-size:2.6rem;color:var(--color-text-faint);"></i>
        <h3 class="mt-2">Your cart is empty</h3>
        <p class="mt-1">Looks like you haven't added anything yet.</p>
        <a href="motorcycles.html" class="btn btn-primary mt-3">Start Shopping</a>
      </div>
    `;
    summaryBox.style.display = 'none';
    return;
  }

  summaryBox.style.display = 'block';
  col.innerHTML = cartItems.map(item => `
    <div class="card cart-item">
      <img src="${item.image}" alt="${item.name}">
      <div class="info">
        <h4>${item.name}</h4>
        <div class="price-current">${formatCurrency(item.price)}</div>
      </div>
      <div class="qty-selector">
        <button class="qty-minus" data-id="${item.cartRowId}" data-type="${item.itemType}"><i class="fa-solid fa-minus"></i></button>
        <input type="text" value="${item.quantity}" readonly>
        <button class="qty-plus" data-id="${item.cartRowId}" data-type="${item.itemType}"><i class="fa-solid fa-plus"></i></button>
      </div>
      <div style="min-width:90px;text-align:right;font-weight:700;">${formatCurrency(item.price * item.quantity)}</div>
      <button class="remove-btn" data-id="${item.cartRowId}" data-type="${item.itemType}" title="Remove"><i class="fa-solid fa-trash"></i></button>
    </div>
  `).join('');

  col.querySelectorAll('.qty-minus').forEach(btn => btn.addEventListener('click', async () => {
    const item = cartItems.find(i => i.cartRowId == btn.dataset.id && i.itemType === btn.dataset.type);
    await updateQuantity(btn.dataset.id, Math.max(1, item.quantity - 1), btn.dataset.type);
    render();
  }));
  col.querySelectorAll('.qty-plus').forEach(btn => btn.addEventListener('click', async () => {
    const item = cartItems.find(i => i.cartRowId == btn.dataset.id && i.itemType === btn.dataset.type);
    await updateQuantity(btn.dataset.id, item.quantity + 1, btn.dataset.type);
    render();
  }));
  col.querySelectorAll('.remove-btn').forEach(btn => btn.addEventListener('click', async () => {
    const ok = await confirmDialog({ title: 'Remove item?', message: 'Remove this item from your cart?', confirmText: 'Remove' });
    if (!ok) return;
    await removeFromCart(btn.dataset.id, btn.dataset.type);
    render();
  }));

  updateSummary();
}

function updateSummary() {
  const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  let discount = 0;
  if (appliedPromo) {
    discount = appliedPromo.discount_type === 'percent' ? subtotal * (appliedPromo.discount_value / 100) : appliedPromo.discount_value;
    discount = Math.min(discount, subtotal);
  }
  const total = subtotal + SHIPPING_FEE - discount;

  document.getElementById('summary-subtotal').textContent = formatCurrency(subtotal);
  document.getElementById('summary-shipping').textContent = formatCurrency(SHIPPING_FEE);
  document.getElementById('discount-row').style.display = discount > 0 ? 'flex' : 'none';
  document.getElementById('summary-discount').textContent = `-${formatCurrency(discount)}`;
  document.getElementById('summary-total').textContent = formatCurrency(total);

  sessionStorage.setItem('ow_checkout_totals', JSON.stringify({ subtotal, shipping: SHIPPING_FEE, discount, total, promoCode: appliedPromo?.code || null }));
}

document.getElementById('apply-promo-btn').addEventListener('click', async () => {
  const code = document.getElementById('promo-input').value.trim().toUpperCase();
  if (!code) return;
  const { data, error } = await supabase.from('promotions').select('*').eq('code', code).eq('is_active', true).maybeSingle();
  if (error || !data) { toastError('Invalid or expired promo code.'); return; }
  appliedPromo = data;
  toastSuccess(`Promo "${code}" applied!`);
  updateSummary();
});

render();
document.addEventListener('cart:updated', render);
