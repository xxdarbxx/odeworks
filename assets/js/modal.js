// ============================================================================
// ODE WORKS - Modal helper (confirm dialogs + generic modal)
// ============================================================================

function ensureOverlay() {
  let el = document.getElementById('modal-overlay');
  if (!el) {
    el = document.createElement('div');
    el.id = 'modal-overlay';
    el.className = 'modal-overlay';
    el.innerHTML = '<div class="modal-box" id="modal-box"></div>';
    document.body.appendChild(el);
    el.addEventListener('click', (e) => { if (e.target === el) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
  }
  return el;
}

export function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  if (overlay) overlay.classList.remove('open');
}

export function openModal(html, { size = '' } = {}) {
  const overlay = ensureOverlay();
  const box = overlay.querySelector('#modal-box');
  box.className = `modal-box ${size}`;
  box.innerHTML = html;
  requestAnimationFrame(() => overlay.classList.add('open'));
  return overlay;
}

export function confirmDialog({ title = 'Are you sure?', message = '', confirmText = 'Confirm', cancelText = 'Cancel', danger = true }) {
  return new Promise((resolve) => {
    const html = `
      <div class="modal-icon ${danger ? 'danger' : ''}"><i class="fa-solid ${danger ? 'fa-triangle-exclamation' : 'fa-circle-question'}"></i></div>
      <h3>${title}</h3>
      <p class="mt-2">${message}</p>
      <div class="modal-footer">
        <button class="btn btn-secondary" id="modal-cancel-btn">${cancelText}</button>
        <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" id="modal-confirm-btn">${confirmText}</button>
      </div>
    `;
    const overlay = openModal(html);
    overlay.querySelector('#modal-cancel-btn').addEventListener('click', () => { closeModal(); resolve(false); });
    overlay.querySelector('#modal-confirm-btn').addEventListener('click', () => { closeModal(); resolve(true); });
  });
}
