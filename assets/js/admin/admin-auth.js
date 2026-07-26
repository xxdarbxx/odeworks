// ============================================================================
// ODE WORKS ADMIN - Auth guard + shared topbar wiring
// ============================================================================
import { supabase } from '../supabase-client.js';
import { initials } from '../utils.js';

export async function requireAdminGuard() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) { window.location.href = 'login.html'; return null; }

  const { data: profile, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  if (error || !profile || (profile.role !== 'admin' && profile.role !== 'staff')) {
    window.location.href = 'login.html';
    return null;
  }
  paintAuthArea(profile);
  return profile;
}

function paintAuthArea(profile) {
  const el = document.querySelector('[data-admin-auth-area]');
  if (!el) return;
  el.innerHTML = `
    <div style="text-align:right;">
      <div style="font-size:0.85rem;font-weight:600;">${profile.full_name}</div>
      <div style="font-size:0.72rem;color:var(--color-text-faint);text-transform:capitalize;">${profile.role}</div>
    </div>
    <div class="icon-btn" style="pointer-events:none;">${initials(profile.full_name)}</div>
  `;
}

export async function signOutAdmin() {
  await supabase.auth.signOut();
  window.location.href = 'login.html';
}

export function setPageTitle(title) {
  const el = document.getElementById('topbar-title');
  if (el) el.textContent = title;
  document.title = `${title} | Ode Works Admin`;
}

export function initMobileSidebarToggle() {
  document.getElementById('mobile-menu-trigger')?.addEventListener('click', () => {
    document.getElementById('admin-sidebar')?.classList.toggle('open');
  });
}

// Partials (sidebar/topbar) are injected asynchronously by includes.js. Because
// this module's own import chain (auth -> supabase-client -> CDN) can resolve
// slower than the same-origin partial fetches, the 'partials:loaded' event may
// already have fired before a listener is attached here. Guard against that
// race by checking synchronously first, falling back to the event otherwise.
export function onPartialsReady(callback) {
  if (document.getElementById('admin-sidebar')) callback();
  else document.addEventListener('partials:loaded', callback, { once: true });
}
