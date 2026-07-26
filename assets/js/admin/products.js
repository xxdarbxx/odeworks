// ============================================================================
// ODE WORKS ADMIN - Products (Parts & Accessories) module
// ============================================================================
import { supabase } from '../supabase-client.js';
import { requireAdminGuard, setPageTitle, initMobileSidebarToggle, onPartialsReady } from './admin-auth.js';
import { initCrudTable } from './crud-table.js';
import { formatCurrency, slugify } from '../utils.js';

onPartialsReady(async () => {
  const profile = await requireAdminGuard();
  if (!profile) return;
  setPageTitle('Products');
  initMobileSidebarToggle();

  let pendingImageUrl = null;

  initCrudTable({
    table: 'products',
    select: '*, product_categories(name), brands(name), product_images(image_url, is_primary)',
    title: 'Product',
    rootSelector: '#crud-root',
    orderBy: 'created_at',
    searchFields: ['name', 'sku'],
    columns: [
      { key: 'thumb', label: '', render: (r) => `<img class="row-thumb" src="${r.product_images?.find(i=>i.is_primary)?.image_url || r.product_images?.[0]?.image_url || 'https://placehold.co/100x100/1a1a1a/fff?text=OW'}" alt="">` },
      { key: 'name', label: 'Name', render: (r) => `<strong>${r.name}</strong><br><span class="text-muted" style="font-size:0.78rem;">${r.sku || ''}</span>` },
      { key: 'category', label: 'Category', render: (r) => r.product_categories?.name || '—' },
      { key: 'price', label: 'Price', render: (r) => formatCurrency(r.price) },
      { key: 'stock_quantity', label: 'Stock' },
      { key: 'status', label: 'Status', render: (r) => `<span class="badge badge-${r.status === 'active' ? 'success' : r.status === 'out_of_stock' ? 'danger' : 'warning'}">${r.status}</span>` },
      { key: 'is_featured', label: 'Featured', render: (r) => r.is_featured ? '<i class="fa-solid fa-star" style="color:var(--color-warning);"></i>' : '—' }
    ],
    filters: [
      { key: 'category_id', label: 'Category', column: 'category_id', options: async () => {
        const { data } = await supabase.from('product_categories').select('id, name');
        return (data || []).map(c => ({ value: c.id, label: c.name }));
      }},
      { key: 'status', label: 'Status', column: 'status', options: [
        { value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }, { value: 'out_of_stock', label: 'Out of Stock' }
      ]}
    ],
    formFields: [
      { name: 'name', label: 'Product Name', required: true, colSpan: 2 },
      { name: 'image_url', label: 'Primary Image URL', colSpan: 2, default: 'https://placehold.co/600x600/1a1a1a/fff?text=Ode+Works' },
      { name: 'sku', label: 'SKU' },
      { name: 'category_id', label: 'Category', type: 'select', includeEmpty: true, options: async () => {
        const { data } = await supabase.from('product_categories').select('id, name');
        return (data || []).map(c => ({ value: c.id, label: c.name }));
      }},
      { name: 'brand_id', label: 'Brand (optional)', type: 'select', includeEmpty: true, options: async () => {
        const { data } = await supabase.from('brands').select('id, name');
        return (data || []).map(b => ({ value: b.id, label: b.name }));
      }},
      { name: 'price', label: 'Price (₱)', type: 'number' },
      { name: 'compare_price', label: 'Compare-at Price (₱)', type: 'number' },
      { name: 'stock_quantity', label: 'Stock Quantity', type: 'number', default: 0 },
      { name: 'status', label: 'Status', type: 'select', options: [
        { value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }, { value: 'out_of_stock', label: 'Out of Stock' }
      ]},
      { name: 'is_featured', label: 'Featured Product', type: 'checkbox' },
      { name: 'description', label: 'Description', type: 'textarea', colSpan: 2 }
    ],
    beforeSave: (payload, isEdit) => {
      pendingImageUrl = payload.image_url;
      delete payload.image_url;
      if (!isEdit && payload.name) payload.slug = slugify(payload.name) + '-' + Date.now().toString().slice(-5);
      return payload;
    },
    afterSave: async (row, isEdit) => {
      if (!pendingImageUrl) return;
      if (isEdit) {
        const { data: existingImg } = await supabase.from('product_images').select('id').eq('product_id', row.id).eq('is_primary', true).maybeSingle();
        if (existingImg) await supabase.from('product_images').update({ image_url: pendingImageUrl }).eq('id', existingImg.id);
        else await supabase.from('product_images').insert({ product_id: row.id, image_url: pendingImageUrl, is_primary: true });
      } else {
        await supabase.from('product_images').insert({ product_id: row.id, image_url: pendingImageUrl, is_primary: true });
      }
    }
  });
});
