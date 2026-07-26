// ============================================================================
// ODE WORKS - Blog listing page
// ============================================================================
import { BLOG_POSTS } from '../data.js';
import { blogCard } from '../render.js';
import { debounce } from '../utils.js';

const gridEl = document.getElementById('blog-grid');
const searchInput = document.getElementById('search-input');
const filterEl = document.getElementById('category-filter');
const categories = ['All', ...new Set(BLOG_POSTS.map(p => p.category))];

filterEl.innerHTML = categories.map((c, i) => `<button class="filter-pill ${i === 0 ? 'active' : ''}" data-cat="${c}">${c}</button>`).join('');

const state = { search: '', category: 'All' };

function render() {
  const filtered = BLOG_POSTS
    .filter(p => state.category === 'All' || p.category === state.category)
    .filter(p => !state.search || p.title.toLowerCase().includes(state.search.toLowerCase()))
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

  if (!filtered.length) {
    gridEl.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><i class="fa-solid fa-newspaper"></i><p>No articles found.</p></div>`;
    return;
  }
  gridEl.innerHTML = filtered.map(blogCard).join('');
}

searchInput.addEventListener('input', debounce((e) => { state.search = e.target.value.trim(); render(); }, 300));

filterEl.querySelectorAll('.filter-pill').forEach((pill) => {
  pill.addEventListener('click', () => {
    filterEl.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    state.category = pill.dataset.cat;
    render();
  });
});

render();
