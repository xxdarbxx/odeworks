// ============================================================================
// ODE WORKS - Contact form
// ============================================================================
import { submitContactMessage } from '../api.js';
import { toastSuccess, toastError } from '../toast.js';

const form = document.getElementById('contact-form');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = form.querySelector('button[type="submit"]');
  const label = btn.querySelector('.btn-label');
  btn.disabled = true;
  label.innerHTML = '<span class="spinner"></span>';

  const fd = new FormData(form);
  const result = await submitContactMessage({
    name: fd.get('name'),
    email: fd.get('email'),
    subject: fd.get('subject'),
    message: fd.get('message')
  });

  btn.disabled = false;
  label.textContent = 'Send Message';

  if (!result.success) { toastError('Something went wrong. Please try again.'); return; }

  toastSuccess('Thanks for reaching out! Our team will get back to you within 24 hours.', 'Message Sent');
  form.reset();
});
