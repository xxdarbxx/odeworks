// ============================================================================
// ODE WORKS - Toast notifications
// ============================================================================

const ICONS = {
  success: 'fa-solid fa-circle-check',
  error: 'fa-solid fa-circle-xmark',
  info: 'fa-solid fa-circle-info',
  warning: 'fa-solid fa-triangle-exclamation'
};

function ensureContainer() {
  let el = document.getElementById('toast-container');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast-container';
    document.body.appendChild(el);
  }
  return el;
}

export function showToast({ type = 'info', title, message, duration = 4200 }) {
  const container = ensureContainer();
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div class="toast-icon"><i class="${ICONS[type] || ICONS.info}"></i></div>
    <div class="toast-content">
      ${title ? `<div class="toast-title">${title}</div>` : ''}
      ${message ? `<div class="toast-message">${message}</div>` : ''}
    </div>
    <button class="toast-close" aria-label="Close"><i class="fa-solid fa-xmark"></i></button>
  `;
  container.appendChild(toast);

  const remove = () => {
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 300);
  };
  toast.querySelector('.toast-close').addEventListener('click', remove);
  if (duration) setTimeout(remove, duration);
  return toast;
}

export const toastSuccess = (message, title = 'Success') => showToast({ type: 'success', title, message });
export const toastError = (message, title = 'Something went wrong') => showToast({ type: 'error', title, message });
export const toastInfo = (message, title = 'Heads up') => showToast({ type: 'info', title, message });
export const toastWarning = (message, title = 'Warning') => showToast({ type: 'warning', title, message });
