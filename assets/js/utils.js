// ============================================================================
// ODE WORKS - Shared utility helpers
// ============================================================================
import { CURRENCY } from './config.js';

export function formatCurrency(amount) {
  const n = Number(amount) || 0;
  return `${CURRENCY}${n.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function formatDate(dateStr, opts = {}) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric', ...opts });
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleString('en-PH', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function slugify(text) {
  return String(text).toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function qs(params) {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') usp.set(k, v);
  });
  return usp.toString();
}

export function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

export function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

export function starIcons(rating) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  let html = '';
  for (let i = 0; i < full; i++) html += '<i class="fa-solid fa-star"></i>';
  if (half) html += '<i class="fa-solid fa-star-half-stroke"></i>';
  for (let i = full + (half ? 1 : 0); i < 5; i++) html += '<i class="fa-regular fa-star"></i>';
  return html;
}

export function initials(name) {
  return String(name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

export function skeletonCards(count = 8) {
  return Array.from({ length: count }).map(() => `
    <div class="skeleton skeleton-card"></div>
  `).join('');
}

export function orderNumber() {
  const now = new Date();
  const y = now.getFullYear().toString().slice(-2);
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `OW${y}${(now.getMonth()+1).toString().padStart(2,'0')}${rand}`;
}
