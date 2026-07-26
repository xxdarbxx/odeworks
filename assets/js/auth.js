// ============================================================================
// ODE WORKS - Auth helpers shared across pages
// ============================================================================
import { supabase } from './supabase-client.js';
import { mergeGuestCart } from './cart.js';
import { mergeGuestWishlist } from './wishlist.js';

let cachedUser = null;
let cachedProfile = null;

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  cachedUser = user;
  return user;
}

export async function getCurrentProfile() {
  const user = await getCurrentUser();
  if (!user) { cachedProfile = null; return null; }
  const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  if (error) { console.error(error); return null; }
  cachedProfile = data;
  return data;
}

export function getCachedProfile() { return cachedProfile; }

export async function signUp({ fullName, email, password, phone }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, phone } }
  });
  if (error) throw error;
  return data;
}

export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  await Promise.all([mergeGuestCart(), mergeGuestWishlist()]);
  return data;
}

export async function signOut() {
  await supabase.auth.signOut();
  cachedUser = null;
  cachedProfile = null;
  window.location.href = 'login.html';
}

export function requireAuth(redirectTo = 'login.html') {
  return getCurrentUser().then((user) => {
    if (!user) {
      window.location.href = `${redirectTo}?redirect=${encodeURIComponent(window.location.pathname)}`;
      return null;
    }
    return user;
  });
}

export async function requireAdmin(redirectTo = 'login.html') {
  const profile = await getCurrentProfile();
  if (!profile || (profile.role !== 'admin' && profile.role !== 'staff')) {
    window.location.href = redirectTo;
    return null;
  }
  return profile;
}

export function onAuthChange(callback) {
  supabase.auth.onAuthStateChange((_event, session) => callback(session?.user || null));
}
