// ============================================================================
// ODE WORKS ADMIN - Login
// ============================================================================
import { supabase } from '../supabase-client.js';
import { toastError } from '../toast.js';

const form = document.getElementById('admin-login-form');

// If already logged in as staff/admin, go straight to dashboard.
supabase.auth.getUser().then(async ({ data: { user } }) => {
  if (!user) return;
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile && (profile.role === 'admin' || profile.role === 'staff')) window.location.href = 'index.html';
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(form);
  const btn = form.querySelector('button[type="submit"]');
  const label = btn.querySelector('.btn-label');
  btn.disabled = true;
  label.innerHTML = '<span class="spinner"></span>';

  const { data, error } = await supabase.auth.signInWithPassword({ email: fd.get('email'), password: fd.get('password') });
  if (error) {
    toastError(error.message, 'Login failed');
    btn.disabled = false;
    label.textContent = 'Sign In';
    return;
  }

  const { data: profile, error: profileError } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
  if (profileError || !profile || (profile.role !== 'admin' && profile.role !== 'staff')) {
    await supabase.auth.signOut();
    toastError('This account does not have admin access.', 'Access denied');
    btn.disabled = false;
    label.textContent = 'Sign In';
    return;
  }

  window.location.href = 'index.html';
});
