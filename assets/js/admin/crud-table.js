// ============================================================================
// ODE WORKS ADMIN - Generic CRUD table engine
// Powers every admin module: search, filter, paginate, create/edit modal,
// delete confirmation, and toast feedback, driven entirely by a config object.
// ============================================================================
import { supabase } from '../supabase-client.js';
import { toastSuccess, toastError } from '../toast.js';
import { confirmDialog, openModal, closeModal } from '../modal.js';
import { debounce } from '../utils.js';

/**
 * @param {Object} config
 * @param {string} config.table - Supabase table name
 * @param {string} [config.select] - select string (joins), defaults to '*'
 * @param {string} config.title - singular entity name, e.g. "Product"
 * @param {string} config.rootSelector - CSS selector for the container to render into
 * @param {Array}  config.columns - [{ key, label, render(row) => html }]
 * @param {Array}  [config.searchFields] - column names for ilike search
 * @param {Array}  [config.filters] - [{ key, label, column, options: [{value,label}] | async fn }]
 * @param {Array}  [config.formFields] - [{ name, label, type, required, options, default, colSpan }]
 * @param {string} [config.orderBy] - column to order by (default created_at)
 * @param {boolean}[config.orderAsc]
 * @param {number} [config.pageSize]
 * @param {Function}[config.beforeSave] - (formData, isEdit) => transformed payload
 * @param {Function}[config.afterLoad] - (rows) => rows, for client-side postprocessing
 * @param {boolean} [config.readOnlyDelete] - hide delete button
 */
export function initCrudTable(config) {
  const {
    table, select = '*', title, rootSelector,
    columns, searchFields = [], filters = [], formFields = [],
    orderBy = 'created_at', orderAsc = false, pageSize = 10,
    beforeSave, afterLoad, readOnlyDelete = false
  } = config;

  const root = document.querySelector(rootSelector);
  const state = { search: '', page: 1, filterValues: {}, sortBy: orderBy, sortAsc: orderAsc };

  root.innerHTML = `
    <div class="crud-toolbar">
      <div class="filters-row">
        <div class="search-box"><i class="fa-solid fa-magnifying-glass"></i><input type="text" class="form-control" id="crud-search" placeholder="Search ${title.toLowerCase()}s..."></div>
        ${filters.map(f => `
          <div class="select-wrap"><select class="form-control" data-filter-key="${f.key}"><option value="">${f.label}: All</option></select></div>
        `).join('')}
      </div>
      ${!config.hideAddButton ? `<button class="btn btn-primary" id="crud-add-btn"><i class="fa-solid fa-plus"></i> Add ${title}</button>` : ''}
    </div>
    <div class="table-wrap">
      <table class="data-table">
        <thead><tr>${columns.map(c => `<th>${c.label}</th>`).join('')}<th>Actions</th></tr></thead>
        <tbody id="crud-tbody"><tr><td colspan="${columns.length + 1}"><div class="spinner"></div></td></tr></tbody>
      </table>
    </div>
    <div class="pagination" id="crud-pagination"></div>
  `;

  // Wire filter dropdowns (static or async options)
  filters.forEach(async (f) => {
    const sel = root.querySelector(`[data-filter-key="${f.key}"]`);
    let options = f.options;
    if (typeof options === 'function') options = await options();
    (options || []).forEach(o => sel.insertAdjacentHTML('beforeend', `<option value="${o.value}">${o.label}</option>`));
    sel.addEventListener('change', () => { state.filterValues[f.key] = sel.value; state.page = 1; loadRows(); });
  });

  root.querySelector('#crud-search')?.addEventListener('input', debounce((e) => {
    state.search = e.target.value.trim();
    state.page = 1;
    loadRows();
  }, 350));

  root.querySelector('#crud-add-btn')?.addEventListener('click', () => openForm());

  async function loadRows() {
    const tbody = root.querySelector('#crud-tbody');
    tbody.innerHTML = `<tr><td colspan="${columns.length + 1}"><div class="spinner"></div></td></tr>`;

    let query = supabase.from(table).select(select, { count: 'exact' });

    if (state.search && searchFields.length) {
      const orExpr = searchFields.map(f => `${f}.ilike.%${state.search}%`).join(',');
      query = query.or(orExpr);
    }
    filters.forEach(f => {
      const val = state.filterValues[f.key];
      if (val) query = query.eq(f.column, val);
    });
    if (config.baseFilter) {
      const bf = config.baseFilter;
      query = Array.isArray(bf) ? bf.reduce((q, f) => q.eq(f.column, f.value), query) : query.eq(bf.column, bf.value);
    }

    query = query.order(state.sortBy, { ascending: state.sortAsc });
    const from = (state.page - 1) * pageSize;
    query = query.range(from, from + pageSize - 1);

    const { data, error, count } = await query;

    if (error) {
      tbody.innerHTML = `<tr><td colspan="${columns.length + 1}"><div class="empty-state"><i class="fa-solid fa-triangle-exclamation"></i><p>${error.message}</p></div></td></tr>`;
      root.querySelector('#crud-pagination').innerHTML = '';
      return;
    }

    let rows = data || [];
    if (afterLoad) rows = afterLoad(rows);

    if (!rows.length) {
      tbody.innerHTML = `<tr><td colspan="${columns.length + 1}"><div class="empty-state"><i class="fa-solid fa-inbox"></i><p>No ${title.toLowerCase()}s found.</p></div></td></tr>`;
      root.querySelector('#crud-pagination').innerHTML = '';
      return;
    }

    tbody.innerHTML = rows.map(row => `
      <tr>
        ${columns.map(c => `<td>${c.render ? c.render(row) : (row[c.key] ?? '—')}</td>`).join('')}
        <td class="row-actions">
          ${config.viewRenderer ? `<button class="btn-icon crud-view-btn" data-id="${row.id}" title="View"><i class="fa-solid fa-eye"></i></button>` : ''}
          <button class="btn-icon crud-edit-btn" data-id="${row.id}" title="Edit"><i class="fa-solid fa-pen"></i></button>
          ${!readOnlyDelete ? `<button class="btn-icon crud-delete-btn" data-id="${row.id}" title="Delete"><i class="fa-solid fa-trash"></i></button>` : ''}
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.crud-view-btn').forEach(btn => btn.addEventListener('click', () => {
      const row = rows.find(r => String(r.id) === btn.dataset.id);
      openModal(config.viewRenderer(row), { size: 'modal-lg' });
    }));
    tbody.querySelectorAll('.crud-edit-btn').forEach(btn => btn.addEventListener('click', () => {
      const row = rows.find(r => String(r.id) === btn.dataset.id);
      openForm(row);
    }));
    tbody.querySelectorAll('.crud-delete-btn').forEach(btn => btn.addEventListener('click', async () => {
      const ok = await confirmDialog({ title: `Delete this ${title.toLowerCase()}?`, message: 'This action cannot be undone.', confirmText: 'Delete' });
      if (!ok) return;
      const { error: delError } = await supabase.from(table).delete().eq('id', btn.dataset.id);
      if (delError) { toastError(delError.message, 'Delete failed'); return; }
      toastSuccess(`${title} deleted.`);
      loadRows();
    }));

    renderPagination(count ?? rows.length);
  }

  function renderPagination(total) {
    const pages = Math.ceil(total / pageSize);
    const el = root.querySelector('#crud-pagination');
    if (pages <= 1) { el.innerHTML = ''; return; }
    let html = `<button ${state.page === 1 ? 'disabled' : ''} data-page="${state.page - 1}"><i class="fa-solid fa-chevron-left"></i></button>`;
    for (let i = 1; i <= pages; i++) html += `<button class="${i === state.page ? 'active' : ''}" data-page="${i}">${i}</button>`;
    html += `<button ${state.page === pages ? 'disabled' : ''} data-page="${state.page + 1}"><i class="fa-solid fa-chevron-right"></i></button>`;
    el.innerHTML = html;
    el.querySelectorAll('button').forEach(btn => btn.addEventListener('click', () => { state.page = Number(btn.dataset.page); loadRows(); }));
  }

  async function openForm(existing = null) {
    const isEdit = !!existing;
    const fieldsHtml = await Promise.all(formFields.map(async (f) => {
      const value = existing ? existing[f.name] : (f.default ?? '');
      const span = f.colSpan === 2 ? 'grid-column:1/-1;' : '';
      if (f.type === 'textarea') {
        return `<div class="form-group" style="${span}"><label>${f.label}</label><textarea class="form-control" name="${f.name}" ${f.required ? 'required' : ''}>${value ?? ''}</textarea></div>`;
      }
      if (f.type === 'select') {
        let options = f.options;
        if (typeof options === 'function') options = await options();
        return `<div class="form-group" style="${span}"><label>${f.label}</label>
          <div class="select-wrap"><select class="form-control" name="${f.name}" ${f.required ? 'required' : ''}>
            ${f.includeEmpty ? '<option value="">—</option>' : ''}
            ${(options || []).map(o => `<option value="${o.value}" ${String(o.value) === String(value) ? 'selected' : ''}>${o.label}</option>`).join('')}
          </select></div>
        </div>`;
      }
      if (f.type === 'checkbox') {
        return `<div class="form-group" style="${span}"><label class="checkbox-row"><input type="checkbox" name="${f.name}" ${value ? 'checked' : ''}> ${f.label}</label></div>`;
      }
      if (f.type === 'tags') {
        const tagVal = Array.isArray(value) ? value.join(', ') : (value || '');
        return `<div class="form-group" style="${span}"><label>${f.label} <span class="form-hint">(comma-separated)</span></label><input class="form-control" name="${f.name}" value="${tagVal}"></div>`;
      }
      return `<div class="form-group" style="${span}"><label>${f.label}</label><input type="${f.type || 'text'}" class="form-control" name="${f.name}" value="${value ?? ''}" ${f.step ? `step="${f.step}"` : ''} ${f.required ? 'required' : ''}></div>`;
    }));

    openModal(`
      <h3>${isEdit ? `Edit ${title}` : `Add ${title}`}</h3>
      <form id="crud-form" class="mt-3">
        <div class="form-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:0 16px;">${fieldsHtml.join('')}</div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" id="crud-cancel-btn">Cancel</button>
          <button type="submit" class="btn btn-primary">${isEdit ? 'Save Changes' : `Create ${title}`}</button>
        </div>
      </form>
    `, { size: 'modal-lg' });

    document.getElementById('crud-cancel-btn').addEventListener('click', closeModal);
    document.getElementById('crud-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const payload = {};
      formFields.forEach(f => {
        if (f.type === 'checkbox') { payload[f.name] = fd.get(f.name) === 'on'; return; }
        if (f.type === 'number') { payload[f.name] = fd.get(f.name) === '' ? null : Number(fd.get(f.name)); return; }
        if (f.type === 'tags') { payload[f.name] = String(fd.get(f.name) || '').split(',').map(s => s.trim()).filter(Boolean); return; }
        payload[f.name] = fd.get(f.name);
      });

      const finalPayload = beforeSave ? beforeSave(payload, isEdit, existing) : payload;

      const submitBtn = e.target.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner"></span>';

      const { data: savedRow, error } = isEdit
        ? await supabase.from(table).update(finalPayload).eq('id', existing.id).select().single()
        : await supabase.from(table).insert(finalPayload).select().single();

      if (error) {
        toastError(error.message, 'Save failed');
        submitBtn.disabled = false;
        submitBtn.textContent = isEdit ? 'Save Changes' : `Create ${title}`;
        return;
      }

      if (config.afterSave) await config.afterSave(savedRow, isEdit, payload);

      closeModal();
      toastSuccess(`${title} ${isEdit ? 'updated' : 'created'} successfully.`);
      loadRows();
    });
  }

  loadRows();
  return { reload: loadRows };
}
