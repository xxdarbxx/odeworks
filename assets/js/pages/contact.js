// ============================================================================
// ODE WORKS - Contact form
// ============================================================================
import { toastSuccess } from '../toast.js';

const form = document.getElementById('contact-form');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = form.querySelector('button[type="submit"]');
  const label = btn.querySelector('.btn-label');
  btn.disabled = true;
  label.innerHTML = '<span class="spinner"></span>';

  // Simulated send (no backend endpoint configured). To persist messages,
  // add a `contact_messages` table in Supabase and insert here instead.
  await new Promise(r => setTimeout(r, 600));

  toastSuccess('Thanks for reaching out! Our team will get back to you within 24 hours.', 'Message Sent');
  form.reset();
  btn.disabled = false;
  label.textContent = 'Send Message';
});
