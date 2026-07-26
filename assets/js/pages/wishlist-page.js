// ============================================================================
// ODE WORKS - Standalone Wishlist page (works for guests via localStorage)
// ============================================================================
import { getWishlistItems, removeFromWishlist } from '../wishlist.js';
import { addToCart } from '../cart.js';
import { formatCurrency } from '../utils.js';
import { toastSuccess } from '../toast.js';

async function render() {
  const grid = document.getElementById('wishlist-grid');
  const items = await getWishlistItems();

  if (!items.length) {
    grid.innerHTML = `
      <div class="wishlist-empty" style="grid-column:1/-1;">
        <i class="fa-regular fa-heart" style="font-size:2.6rem;color:var(--color-text-faint);"></i>
        <h3 class="mt-2">Your wishlist is empty</h3>
        <p class="mt-1">Save motorcycles and gear you love for later.</p>
        <a href="motorcycles.html" class="btn btn-primary mt-3">Browse Motorcycles</a>
      </div>
    `;
    return;
  }

  grid.innerHTML = items.map(i => `
    <div class="card product-card">
      <a href="${i.itemType === 'motorcycle' ? 'motorcycle-details.html' : 'product-details.html'}?slug=${i.slug}" class="card-media"><img src="${i.image}" alt="${i.name}"></a>
      <div class="card-body">
        <h4>${i.name}</h4>
        <div class="card-price"><span class="price-current">${formatCurrency(i.price)}</span></div>
        <div class="flex gap-1 mt-2">
          <button class="btn btn-primary add-cart-btn" style="flex:1;" data-id="${i.itemId}" data-type="${i.itemType}" data-name="${i.name}" data-price="${i.price}" data-image="${i.image}" data-slug="${i.slug}"><i class="fa-solid fa-cart-plus"></i></button>
          <button class="btn btn-outline remove-btn" data-row-id="${i.rowId}" data-type="${i.itemType}"><i class="fa-solid fa-trash"></i></button>
        </div>
      </div>
    </div>
  `).join('');

  grid.querySelectorAll('.remove-btn').forEach(btn => btn.addEventListener('click', async () => {
    await removeFromWishlist(btn.dataset.rowId, btn.dataset.type);
    toastSuccess('Removed from wishlist.');
    render();
  }));

  grid.querySelectorAll('.add-cart-btn').forEach(btn => btn.addEventListener('click', async () => {
    await addToCart({ itemType: btn.dataset.type, itemId: btn.dataset.id, name: btn.dataset.name, price: btn.dataset.price, image: btn.dataset.image, slug: btn.dataset.slug });
    toastSuccess(`${btn.dataset.name} added to your cart.`);
  }));
}

render();
document.addEventListener('wishlist:updated', render);
