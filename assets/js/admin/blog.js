// ============================================================================
// ODE WORKS ADMIN - Blog module
// ============================================================================
import { requireAdminGuard, setPageTitle, initMobileSidebarToggle, onPartialsReady } from './admin-auth.js';
import { initCrudTable } from './crud-table.js';
import { formatDate, slugify } from '../utils.js';

onPartialsReady(async () => {
  const profile = await requireAdminGuard();
  if (!profile) return;
  setPageTitle('Blog');
  initMobileSidebarToggle();

  initCrudTable({
    table: 'blog_posts',
    select: '*',
    title: 'Post',
    rootSelector: '#crud-root',
    searchFields: ['title', 'category'],
    orderBy: 'created_at',
    columns: [
      { key: 'cover', label: '', render: (r) => `<img class="row-thumb" src="${r.cover_image_url || 'https://placehold.co/100x100/1a1a1a/fff?text=OW'}" alt="">` },
      { key: 'title', label: 'Title' },
      { key: 'category', label: 'Category', render: (r) => r.category || '—' },
      { key: 'status', label: 'Status', render: (r) => `<span class="badge badge-${r.status === 'published' ? 'success' : 'warning'}">${r.status}</span>` },
      { key: 'view_count', label: 'Views' },
      { key: 'published_at', label: 'Published', render: (r) => r.published_at ? formatDate(r.published_at) : '—' }
    ],
    filters: [
      { key: 'status', label: 'Status', column: 'status', options: [{ value: 'draft', label: 'Draft' }, { value: 'published', label: 'Published' }] }
    ],
    formFields: [
      { name: 'title', label: 'Title', required: true, colSpan: 2 },
      { name: 'cover_image_url', label: 'Cover Image URL', colSpan: 2, default: 'https://placehold.co/1200x600/1a1a1a/fff?text=Blog' },
      { name: 'category', label: 'Category' },
      { name: 'status', label: 'Status', type: 'select', options: [{ value: 'draft', label: 'Draft' }, { value: 'published', label: 'Published' }] },
      { name: 'tags', label: 'Tags', type: 'tags', colSpan: 2 },
      { name: 'excerpt', label: 'Excerpt', type: 'textarea', colSpan: 2 },
      { name: 'content', label: 'Content', type: 'textarea', colSpan: 2, required: true }
    ],
    beforeSave: (payload, isEdit) => {
      if (!isEdit && payload.title) payload.slug = slugify(payload.title) + '-' + Date.now().toString().slice(-5);
      if (payload.status === 'published') payload.published_at = new Date().toISOString();
      return payload;
    }
  });
});
