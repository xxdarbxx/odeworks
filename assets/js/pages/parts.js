// ============================================================================
// ODE WORKS - Parts & Accessories listing page
// ============================================================================
import { supabase } from '../supabase-client.js';
import { productCard } from '../render.js';
import { debounce, skeletonCards, getQueryParam, formatCurrency } from '../utils.js';

const gridEl = document.getElementById('product-grid');
const resultsCountEl = document.getElementById('results-count');
const paginationEl = document.getElementById('pagination');
const categoryFiltersEl = document.getElementById('category-filters');
const categoryScrollerEl = document.getElementById('category-scroller');
const searchInput = document.getElementById('search-input');
const sortSelect = document.getElementById('sort-select');
const priceRange = document.getElementById('price-range');
const priceRangeValue = document.getElementById('price-range-value');
const clearFiltersBtn = document.getElementById('clear-filters-btn');

const PAGE_SIZE = 9;
const state = {
  search: '',
  categoryIds: new Set(getQueryParam('category') ? [getQueryParam('category')] : []),
  maxPrice: 40000,
  sort: 'newest',
  page: 1
};

async function loadCategories() {
  const { data } = await supabase.from('product_categories').select('id, name, slug').eq('is_active', true).order('display_order');
  if (!data) return;

  categoryScrollerEl.innerHTML = `<button class="category-pill active" data-id="">All</button>` +
    data.map(c => `<button class="category-pill" data-id="${c.id}">${c.name}</button>`).join('');
  categoryScrollerEl.querySelectorAll('.category-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      categoryScrollerEl.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.categoryIds = pill.dataset.id ? new Set([pill.dataset.id]) : new Set();
      document.querySelectorAll('.cat-cb').forEach(cb => cb.checked = state.categoryIds.has(cb.value));
      state.page = 1;
      loadProducts();
    });
  });

  categoryFiltersEl.innerHTML = data.map(c => `
    <label class="filter-option"><span><input type="checkbox" class="cat-cb" value="${c.id}"> ${c.name}</span></label>
  `).join('');
  categoryFiltersEl.querySelectorAll('.cat-cb').forEach((cb) => {
    if (state.categoryIds.has(cb.value)) cb.checked = true;
    cb.addEventListener('change', () => {
      cb.checked ? state.categoryIds.add(cb.value) : state.categoryIds.delete(cb.value);
      state.page = 1;
      loadProducts();
    });
  });
}

async function loadProducts() {
  gridEl.innerHTML = skeletonCards(6);

  let query = supabase.from('products').select('*, product_categories(name), product_images(image_url, is_primary)', { count: 'exact' });

  if (state.search) query = query.ilike('name', `%${state.search}%`);
  if (state.categoryIds.size) query = query.in('category_id', [...state.categoryIds]);
  query = query.lte('price', state.maxPrice);

  switch (state.sort) {
    case 'price-asc': query = query.order('price', { ascending: true }); break;
    case 'price-desc': query = query.order('price', { ascending: false }); break;
    case 'rating': query = query.order('rating', { ascending: false }); break;
    default: query = query.order('created_at', { ascending: false });
  }

  const from = (state.page - 1) * PAGE_SIZE;
  query = query.range(from, from + PAGE_SIZE - 1);

  const { data, error, count } = await query;

  if (error || !data || !data.length) {
    gridEl.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><i class="fa-solid fa-helmet-safety"></i><p>No products found. Try adjusting your filters, or connect Supabase to load live inventory.</p></div>`;
    resultsCountEl.textContent = '0 results';
    paginationEl.innerHTML = '';
    return;
  }

  gridEl.innerHTML = data.map(productCard).join('');
  resultsCountEl.textContent = `${count ?? data.length} product${(count ?? data.length) === 1 ? '' : 's'} found`;
  renderPagination(count ?? data.length);
}

function renderPagination(total) {
  const pages = Math.ceil(total / PAGE_SIZE);
  if (pages <= 1) { paginationEl.innerHTML = ''; return; }
  let html = `<button ${state.page === 1 ? 'disabled' : ''} data-page="${state.page - 1}"><i class="fa-solid fa-chevron-left"></i></button>`;
  for (let i = 1; i <= pages; i++) html += `<button class="${i === state.page ? 'active' : ''}" data-page="${i}">${i}</button>`;
  html += `<button ${state.page === pages ? 'disabled' : ''} data-page="${state.page + 1}"><i class="fa-solid fa-chevron-right"></i></button>`;
  paginationEl.innerHTML = html;
  paginationEl.querySelectorAll('button').forEach(btn => btn.addEventListener('click', () => {
    state.page = Number(btn.dataset.page);
    loadProducts();
    window.scrollTo({ top: 300, behavior: 'smooth' });
  }));
}

searchInput.addEventListener('input', debounce((e) => { state.search = e.target.value.trim(); state.page = 1; loadProducts(); }, 350));
sortSelect.addEventListener('change', (e) => { state.sort = e.target.value; state.page = 1; loadProducts(); });
priceRange.addEventListener('input', (e) => { state.maxPrice = Number(e.target.value); priceRangeValue.textContent = formatCurrency(state.maxPrice); });
priceRange.addEventListener('change', () => { state.page = 1; loadProducts(); });

clearFiltersBtn.addEventListener('click', () => {
  state.search = ''; state.categoryIds.clear(); state.maxPrice = 40000; state.sort = 'newest'; state.page = 1;
  searchInput.value = ''; sortSelect.value = 'newest'; priceRange.value = 40000; priceRangeValue.textContent = formatCurrency(40000);
  document.querySelectorAll('.cat-cb').forEach(cb => cb.checked = false);
  categoryScrollerEl.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
  categoryScrollerEl.querySelector('.category-pill')?.classList.add('active');
  loadProducts();
});

loadCategories();
loadProducts();
