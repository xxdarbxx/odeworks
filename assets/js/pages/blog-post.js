// ============================================================================
// ODE WORKS - Single blog post page
// ============================================================================
import { supabase } from '../supabase-client.js';
import { blogCard } from '../render.js';
import { getQueryParam, formatDate, escapeHtml } from '../utils.js';

const slug = getQueryParam('slug');

async function loadPost() {
  if (!slug) return;
  const { data, error } = await supabase.from('blog_posts').select('*').eq('slug', slug).eq('status', 'published').single();

  if (error || !data) {
    document.querySelector('.blog-post-body').innerHTML = `<div class="empty-state"><i class="fa-solid fa-newspaper"></i><p>Article not found.</p></div>`;
    return;
  }

  document.title = `${data.title} | Ode Works`;
  document.getElementById('page-title').textContent = `${data.title} | Ode Works`;
  document.getElementById('breadcrumb-title').textContent = data.title;
  document.getElementById('post-hero').style.backgroundImage = `url('${data.cover_image_url}')`;
  document.getElementById('post-category').textContent = data.category || 'Article';
  document.getElementById('post-title').textContent = data.title;
  document.getElementById('post-meta').innerHTML = `<span><i class="fa-regular fa-calendar"></i> ${formatDate(data.published_at)}</span><span><i class="fa-regular fa-eye"></i> ${data.view_count} views</span>`;
  document.getElementById('post-content').innerHTML = String(data.content || '').split('\n\n').map(p => `<p>${escapeHtml(p)}</p>`).join('');
  document.getElementById('post-tags').innerHTML = (data.tags || []).map(t => `<span class="tag-pill">#${t}</span>`).join('');

  supabase.from('blog_posts').update({ view_count: data.view_count + 1 }).eq('id', data.id).then(() => {});

  loadRelated(data.category, data.id);
}

async function loadRelated(category, excludeId) {
  const { data } = await supabase.from('blog_posts').select('*').eq('status', 'published').eq('category', category).neq('id', excludeId).limit(3);
  const grid = document.getElementById('related-posts');
  if (!data || !data.length) { grid.innerHTML = '<p class="text-muted">No related articles found.</p>'; return; }
  grid.innerHTML = data.map(blogCard).join('');
}

loadPost();
