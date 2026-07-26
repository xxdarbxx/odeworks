// ============================================================================
// ODE WORKS - Partial loader (header/footer includes, no framework)
// Usage: <div data-include="partials/header.html"></div>
// ============================================================================

async function loadPartial(el) {
  const path = el.getAttribute('data-include');
  try {
    const res = await fetch(path);
    const html = await res.text();
    el.innerHTML = html;
    el.querySelectorAll('script').forEach((oldScript) => {
      const newScript = document.createElement('script');
      [...oldScript.attributes].forEach(attr => newScript.setAttribute(attr.name, attr.value));
      newScript.textContent = oldScript.textContent;
      oldScript.replaceWith(newScript);
    });
  } catch (err) {
    console.error('Failed to load partial', path, err);
  }
}

export async function loadAllPartials() {
  const nodes = [...document.querySelectorAll('[data-include]')];
  await Promise.all(nodes.map(loadPartial));
  document.dispatchEvent(new CustomEvent('partials:loaded'));
}

loadAllPartials();
