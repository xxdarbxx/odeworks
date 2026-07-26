// ============================================================================
// ODE WORKS - Login / Register page logic
// ============================================================================
import { signIn, signUp, getCurrentUser } from '../auth.js';
import { toastSuccess, toastError } from '../toast.js';
import { getQueryParam } from '../utils.js';

// If already logged in, bounce to profile
getCurrentUser().then((user) => { if (user) window.location.href = 'profile.html'; });

const tabs = document.querySelectorAll('.auth-tab');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const isLogin = tab.dataset.tab === 'login';
    loginForm.style.display = isLogin ? 'block' : 'none';
    registerForm.style.display = isLogin ? 'none' : 'block';
  });
});

function setLoading(form, loading) {
  const btn = form.querySelector('button[type="submit"]');
  btn.disabled = loading;
  btn.querySelector('.btn-label').innerHTML = loading ? '<span class="spinner"></span>' : (form === loginForm ? 'Sign In' : 'Create Account');
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(loginForm);
  setLoading(loginForm, true);
  try {
    await signIn({ email: fd.get('email'), password: fd.get('password') });
    toastSuccess('Welcome back!', 'Logged in');
    const redirect = getQueryParam('redirect');
    window.location.href = redirect || 'profile.html';
  } catch (err) {
    toastError(err.message || 'Invalid email or password.', 'Login failed');
  } finally {
    setLoading(loginForm, false);
  }
});

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(registerForm);
  setLoading(registerForm, true);
  try {
    await signUp({
      fullName: fd.get('fullName'),
      email: fd.get('email'),
      password: fd.get('password'),
      phone: fd.get('phone')
    });
    toastSuccess('Account created! Check your email to confirm, then log in.', 'Welcome to Ode Works');
    document.querySelector('[data-tab="login"]').click();
    registerForm.reset();
  } catch (err) {
    toastError(err.message || 'Could not create account.', 'Registration failed');
  } finally {
    setLoading(registerForm, false);
  }
});

document.getElementById('google-auth-btn')?.addEventListener('click', () => {
  toastError('Social login requires OAuth provider setup in your Supabase dashboard first.', 'Not configured yet');
});
document.getElementById('facebook-auth-btn')?.addEventListener('click', () => {
  toastError('Social login requires OAuth provider setup in your Supabase dashboard first.', 'Not configured yet');
});
