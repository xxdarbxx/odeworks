// ============================================================================
// ODE WORKS - Wishlist module (mirrors cart.js pattern)
// ============================================================================
import { supabase } from './supabase-client.js';

const LOCAL_KEY = 'ow_wishlist';

function readLocal() {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY)) || []; } catch { return []; }
}
function writeLocal(items) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
  document.dispatchEvent(new CustomEvent('wishlist:updated'));
}

async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getWishlistItems() {
  const user = await getUser();
  if (!user) return readLocal();

  const { data, error } = await supabase
    .from('wishlist')
    .select(`
      id, item_type, motorcycle_id, product_id,
      motorcycles ( id, name, slug, price, compare_price, motorcycle_images ( image_url, is_primary ) ),
      products ( id, name, slug, price, compare_price, product_images ( image_url, is_primary ) )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) { console.error(error); return []; }

  return data.map((row) => {
    const item = row.item_type === 'motorcycle' ? row.motorcycles : row.products;
    const images = item?.motorcycle_images || item?.product_images || [];
    const primary = images.find(i => i.is_primary) || images[0];
    return {
      rowId: row.id,
      itemType: row.item_type,
      itemId: item?.id,
      slug: item?.slug,
      name: item?.name,
      price: item?.price,
      comparePrice: item?.compare_price,
      image: primary?.image_url || 'https://placehold.co/200x200/1a1a1a/fff?text=Ode+Works'
    };
  });
}

export async function isWishlisted(itemType, itemId) {
  const items = await getWishlistItems();
  return items.some(i => i.itemType === itemType && i.itemId === itemId);
}

export async function toggleWishlist({ itemType, itemId, name, price, image, slug }) {
  const user = await getUser();
  if (!user) {
    const items = readLocal();
    const idx = items.findIndex(i => i.itemType === itemType && i.itemId === itemId);
    if (idx > -1) items.splice(idx, 1);
    else items.push({ itemType, itemId, name, price, image, slug });
    writeLocal(items);
    return idx === -1;
  }

  const col = itemType === 'motorcycle' ? 'motorcycle_id' : 'product_id';
  const { data: existing } = await supabase.from('wishlist').select('id').eq('user_id', user.id).eq(col, itemId).maybeSingle();
  if (existing) {
    await supabase.from('wishlist').delete().eq('id', existing.id);
    document.dispatchEvent(new CustomEvent('wishlist:updated'));
    return false;
  }
  await supabase.from('wishlist').insert({ user_id: user.id, item_type: itemType, [col]: itemId });
  document.dispatchEvent(new CustomEvent('wishlist:updated'));
  return true;
}

export async function removeFromWishlist(rowId, itemType) {
  const user = await getUser();
  if (!user) {
    const items = readLocal().filter(i => !(i.itemType === itemType && i.itemId === rowId));
    writeLocal(items);
    return;
  }
  await supabase.from('wishlist').delete().eq('id', rowId);
  document.dispatchEvent(new CustomEvent('wishlist:updated'));
}

export async function getWishlistCount() {
  const items = await getWishlistItems();
  return items.length;
}

export async function mergeGuestWishlist() {
  const local = readLocal();
  if (!local.length) return;
  const user = await getUser();
  if (!user) return;
  for (const item of local) {
    const col = item.itemType === 'motorcycle' ? 'motorcycle_id' : 'product_id';
    const { data: existing } = await supabase.from('wishlist').select('id').eq('user_id', user.id).eq(col, item.itemId).maybeSingle();
    if (!existing) {
      await supabase.from('wishlist').insert({ user_id: user.id, item_type: item.itemType, [col]: item.itemId });
    }
  }
  localStorage.removeItem(LOCAL_KEY);
}
