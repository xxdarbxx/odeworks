// ============================================================================
// ODE WORKS - Blog listing page
// ============================================================================
import { supabase } from '../supabase-client.js';
import { blogCard } from '../render.js';
import { debounce, skeletonCards } from '../utils.js';

const gridEl = document.getElementById('blog-grid');
const paginationEl = document.getElementById('pagination');
const searchInput = document.getElementById('search-input');
const categoryScrollerEl = document.getElementById('category-scroller');

const PAGE_SIZE = 6;
const state = { search: '', category: '', page: 1 };

async function loadPosts() {
  gridEl.innerHTML = skeletonCards(6);

  let query = supabase.from('blog_posts').select('*', { count: 'exact' }).eq('status', 'published');
  if (state.search) query = query.ilike('title', `%${state.search}%`);
  if (state.category) query = query.eq('category', state.category);
  query = query.order('published_at', { ascending: false });

  const from = (state.page - 1) * PAGE_SIZE;
  query = query.range(from, from + PAGE_SIZE - 1);

  const { data, error, count } = await query;

  if (error || !data || !data.length) {
    gridEl.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><i class="fa-solid fa-newspaper"></i><p>No articles found. Connect Supabase to load blog content.</p></div>`;
    paginationEl.innerHTML = '';
    return;
  }

  gridEl.innerHTML = data.map(blogCard).join('');
  renderPagination(count ?? data.length);
}

function renderPagination(total) {
  const pages = Math.ceil(total / PAGE_SIZE);
  if (pages <= 1) { paginationEl.innerHTML = ''; return; }
  let html = '';
  for (let i = 1; i <= pages; i++) html += `<button class="${i === state.page ? 'active' : ''}" data-page="${i}">${i}</button>`;
  paginationEl.innerHTML = html;
  paginationEl.querySelectorAll('button').forEach(btn => btn.addEventListener('click', () => {
    state.page = Number(btn.dataset.page);
    loadPosts();
    window.scrollTo({ top: 300, behavior: 'smooth' });
  }));
}

searchInput.addEventListener('input', debounce((e) => { state.search = e.target.value.trim(); state.page = 1; loadPosts(); }, 350));

categoryScrollerEl.querySelectorAll('.category-pill').forEach((pill) => {
  pill.addEventListener('click', () => {
    categoryScrollerEl.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    state.category = pill.dataset.cat;
    state.page = 1;
    loadPosts();
  });
});

loadPosts();
