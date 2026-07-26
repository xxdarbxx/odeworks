// ============================================================================
// ODE WORKS ADMIN - Product Categories module
// ============================================================================
import { supabase } from '../supabase-client.js';
import { requireAdminGuard, setPageTitle, initMobileSidebarToggle, onPartialsReady } from './admin-auth.js';
import { initCrudTable } from './crud-table.js';
import { slugify } from '../utils.js';

onPartialsReady(async () => {
  const profile = await requireAdminGuard();
  if (!profile) return;
  setPageTitle('Categories');
  initMobileSidebarToggle();

  initCrudTable({
    table: 'product_categories',
    select: '*',
    title: 'Category',
    rootSelector: '#crud-root',
    searchFields: ['name'],
    orderBy: 'display_order',
    orderAsc: true,
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'slug', label: 'Slug' },
      { key: 'display_order', label: 'Order' },
      { key: 'is_active', label: 'Status', render: (r) => `<span class="badge badge-${r.is_active ? 'success' : 'danger'}">${r.is_active ? 'Active' : 'Inactive'}</span>` }
    ],
    formFields: [
      { name: 'name', label: 'Category Name', required: true, colSpan: 2 },
      { name: 'image_url', label: 'Image URL', colSpan: 2, default: 'https://placehold.co/400x300/1a1a1a/fff?text=Category' },
      { name: 'display_order', label: 'Display Order', type: 'number', default: 0 },
      { name: 'is_active', label: 'Active', type: 'checkbox', default: true },
      { name: 'description', label: 'Description', type: 'textarea', colSpan: 2 }
    ],
    beforeSave: (payload, isEdit) => {
      if (!isEdit && payload.name) payload.slug = slugify(payload.name);
      return payload;
    }
  });
});
