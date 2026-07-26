// ============================================================================
// ODE WORKS - Cart module
// Guests: stored in localStorage under 'ow_cart'. Logged-in users: Supabase
// `cart` table (RLS-scoped to auth.uid()). Guest cart merges into Supabase
// automatically on sign-in via mergeGuestCart().
// ============================================================================
import { supabase } from './supabase-client.js';

const LOCAL_KEY = 'ow_cart';

function readLocal() {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY)) || []; } catch { return []; }
}
function writeLocal(items) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
  document.dispatchEvent(new CustomEvent('cart:updated'));
}

async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getCartItems() {
  const user = await getUser();
  if (!user) return readLocal().map(item => ({ ...item, cartRowId: item.itemId }));

  const { data, error } = await supabase
    .from('cart')
    .select(`
      id, quantity, item_type, motorcycle_id, product_id,
      motorcycles ( id, name, slug, price, compare_price, stock_quantity, motorcycle_images ( image_url, is_primary ) ),
      products ( id, name, slug, price, compare_price, stock_quantity, product_images ( image_url, is_primary ) )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (error) { console.error(error); return []; }

  return data.map((row) => {
    const item = row.item_type === 'motorcycle' ? row.motorcycles : row.products;
    const images = item?.motorcycle_images || item?.product_images || [];
    const primary = images.find(i => i.is_primary) || images[0];
    return {
      cartRowId: row.id,
      itemType: row.item_type,
      itemId: item?.id,
      slug: item?.slug,
      name: item?.name,
      price: item?.price,
      comparePrice: item?.compare_price,
      stock: item?.stock_quantity,
      image: primary?.image_url || 'https://placehold.co/200x200/1a1a1a/fff?text=Ode+Works',
      quantity: row.quantity
    };
  });
}

export async function addToCart({ itemType, itemId, name, price, image, slug }, quantity = 1) {
  const user = await getUser();
  if (!user) {
    const items = readLocal();
    const existing = items.find(i => i.itemType === itemType && i.itemId === itemId);
    if (existing) existing.quantity += quantity;
    else items.push({ itemType, itemId, name, price, image, slug, quantity });
    writeLocal(items);
    return;
  }

  const col = itemType === 'motorcycle' ? 'motorcycle_id' : 'product_id';
  const { data: existing } = await supabase.from('cart').select('id, quantity').eq('user_id', user.id).eq(col, itemId).maybeSingle();
  if (existing) {
    await supabase.from('cart').update({ quantity: existing.quantity + quantity }).eq('id', existing.id);
  } else {
    await supabase.from('cart').insert({ user_id: user.id, item_type: itemType, [col]: itemId, quantity });
  }
  document.dispatchEvent(new CustomEvent('cart:updated'));
}

export async function updateQuantity(refId, quantity, itemType) {
  const user = await getUser();
  if (!user) {
    const items = readLocal();
    const item = items.find(i => i.itemType === itemType && i.itemId === refId);
    if (item) item.quantity = Math.max(1, quantity);
    writeLocal(items);
    return;
  }
  await supabase.from('cart').update({ quantity: Math.max(1, quantity) }).eq('id', refId);
  document.dispatchEvent(new CustomEvent('cart:updated'));
}

export async function removeFromCart(refId, itemType) {
  const user = await getUser();
  if (!user) {
    const items = readLocal().filter(i => !(i.itemType === itemType && i.itemId === refId));
    writeLocal(items);
    return;
  }
  await supabase.from('cart').delete().eq('id', refId);
  document.dispatchEvent(new CustomEvent('cart:updated'));
}

export async function clearCart() {
  const user = await getUser();
  if (!user) { writeLocal([]); return; }
  await supabase.from('cart').delete().eq('user_id', user.id);
  document.dispatchEvent(new CustomEvent('cart:updated'));
}

export async function getCartCount() {
  const items = await getCartItems();
  return items.reduce((sum, i) => sum + i.quantity, 0);
}

export async function mergeGuestCart() {
  const local = readLocal();
  if (!local.length) return;
  const user = await getUser();
  if (!user) return;
  for (const item of local) {
    const col = item.itemType === 'motorcycle' ? 'motorcycle_id' : 'product_id';
    const { data: existing } = await supabase.from('cart').select('id, quantity').eq('user_id', user.id).eq(col, item.itemId).maybeSingle();
    if (existing) {
      await supabase.from('cart').update({ quantity: existing.quantity + item.quantity }).eq('id', existing.id);
    } else {
      await supabase.from('cart').insert({ user_id: user.id, item_type: item.itemType, [col]: item.itemId, quantity: item.quantity });
    }
  }
  localStorage.removeItem(LOCAL_KEY);
}
