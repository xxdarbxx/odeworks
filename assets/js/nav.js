// ============================================================================
// ODE WORKS - Navigation behavior: sticky header, mobile menu, active link,
// cart/wishlist badges, auth-aware nav actions, back-to-top.
// ============================================================================
import { getCurrentProfile } from './auth.js';
import { getCartCount } from './cart.js';
import { getWishlistCount } from './wishlist.js';
import { initials } from './utils.js';

function setActiveLink() {
  const current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.main-nav a').forEach((a) => {
    const href = a.getAttribute('href');
    if (href === current || (current === '' && href === 'index.html')) a.classList.add('active');
  });
}

function initStickyHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 20);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

function initMobileToggle() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.main-nav');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', () => {
    nav.classList.toggle('open');
    toggle.querySelector('i')?.classList.toggle('fa-bars');
    toggle.querySelector('i')?.classList.toggle('fa-xmark');
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));
}

function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', () => btn.classList.toggle('visible', window.scrollY > 500), { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

async function updateBadges() {
  const cartBadge = document.querySelector('[data-cart-count]');
  const wishBadge = document.querySelector('[data-wishlist-count]');
  const [cartCount, wishCount] = await Promise.all([getCartCount(), getWishlistCount()]);
  if (cartBadge) { cartBadge.textContent = cartCount; cartBadge.style.display = cartCount ? 'flex' : 'none'; }
  if (wishBadge) { wishBadge.textContent = wishCount; wishBadge.style.display = wishCount ? 'flex' : 'none'; }
}

async function updateAuthArea() {
  const authArea = document.querySelector('[data-auth-area]');
  if (!authArea) return;
  const profile = await getCurrentProfile();
  if (profile) {
    authArea.innerHTML = `
      <a href="profile.html" class="icon-btn" title="${profile.full_name}">
        ${profile.avatar_url
          ? `<img src="${profile.avatar_url}" alt="" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`
          : `<span style="font-weight:700;font-size:0.8rem;">${initials(profile.full_name)}</span>`}
      </a>`;
  } else {
    authArea.innerHTML = `<a href="login.html" class="icon-btn" title="Login"><i class="fa-regular fa-user"></i></a>`;
  }
}

function initNav() {
  setActiveLink();
  initStickyHeader();
  initMobileToggle();
  initBackToTop();
  updateBadges();
  updateAuthArea();
  document.addEventListener('cart:updated', updateBadges);
  document.addEventListener('wishlist:updated', updateBadges);
}

if (document.querySelector('.site-header')) {
  initNav();
} else {
  document.addEventListener('partials:loaded', initNav, { once: true });
}
