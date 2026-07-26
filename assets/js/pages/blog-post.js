// ============================================================================
// ODE WORKS - Single blog post page
// ============================================================================
import { BLOG_POSTS } from '../data.js';
import { blogCard } from '../render.js';
import { getQueryParam, formatDate, escapeHtml } from '../utils.js';

const slug = getQueryParam('slug');
const post = BLOG_POSTS.find(p => p.slug === slug);

if (!post) {
  document.querySelector('.blog-post-body').innerHTML = `<div class="empty-state"><i class="fa-solid fa-newspaper"></i><p>Article not found.</p></div>`;
} else {
  document.title = `${post.title} | Ode Works`;
  document.getElementById('page-title').textContent = `${post.title} | Ode Works`;
  document.getElementById('breadcrumb-title').textContent = post.title;
  document.getElementById('post-hero').style.backgroundImage = `url('${post.coverImage}')`;
  document.getElementById('post-category').textContent = post.category;
  document.getElementById('post-title').textContent = post.title;
  document.getElementById('post-meta').innerHTML = `<span><i class="fa-regular fa-calendar"></i> ${formatDate(post.publishedAt)}</span>`;
  document.getElementById('post-content').innerHTML = post.content.split('\n\n').map(p => `<p>${escapeHtml(p)}</p>`).join('');
  document.getElementById('post-tags').innerHTML = post.tags.map(t => `<span class="tag-pill">#${t}</span>`).join('');

  const related = BLOG_POSTS.filter(p => p.category === post.category && p.id !== post.id).slice(0, 3);
  const grid = document.getElementById('related-posts');
  grid.innerHTML = related.length ? related.map(blogCard).join('') : '<p class="text-muted">No related articles found.</p>';
}
