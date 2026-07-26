// ============================================================================
// ODE WORKS ADMIN - Motorcycle Inventory module
// ============================================================================
import { supabase } from '../supabase-client.js';
import { requireAdminGuard, setPageTitle, initMobileSidebarToggle, onPartialsReady } from './admin-auth.js';
import { initCrudTable } from './crud-table.js';
import { formatCurrency, slugify } from '../utils.js';

onPartialsReady(async () => {
  const profile = await requireAdminGuard();
  if (!profile) return;
  setPageTitle('Motorcycle Inventory');
  initMobileSidebarToggle();

  let pendingImageUrl = null;
  const CATEGORY_OPTIONS = ['sport', 'naked', 'adventure', 'cruiser', 'scooter', 'touring'].map(c => ({ value: c, label: c[0].toUpperCase() + c.slice(1) }));

  initCrudTable({
    table: 'motorcycles',
    select: '*, brands(name), motorcycle_images(image_url, is_primary)',
    title: 'Motorcycle',
    rootSelector: '#crud-root',
    searchFields: ['name'],
    columns: [
      { key: 'thumb', label: '', render: (r) => `<img class="row-thumb" src="${r.motorcycle_images?.find(i=>i.is_primary)?.image_url || r.motorcycle_images?.[0]?.image_url || 'https://placehold.co/100x100/1a1a1a/fff?text=OW'}" alt="">` },
      { key: 'name', label: 'Model', render: (r) => `<strong>${r.name}</strong><br><span class="text-muted" style="font-size:0.78rem;">${r.brands?.name || ''} · ${r.model_year}</span>` },
      { key: 'category', label: 'Category', render: (r) => `<span style="text-transform:capitalize;">${r.category}</span>` },
      { key: 'price', label: 'Price', render: (r) => formatCurrency(r.price) },
      { key: 'stock_quantity', label: 'Stock' },
      { key: 'status', label: 'Status', render: (r) => `<span class="badge badge-${r.status === 'available' ? 'success' : r.status === 'sold_out' ? 'danger' : 'warning'}">${r.status.replace('_',' ')}</span>` }
    ],
    filters: [
      { key: 'brand_id', label: 'Brand', column: 'brand_id', options: async () => {
        const { data } = await supabase.from('brands').select('id, name');
        return (data || []).map(b => ({ value: b.id, label: b.name }));
      }},
      { key: 'category', label: 'Category', column: 'category', options: CATEGORY_OPTIONS },
      { key: 'status', label: 'Status', column: 'status', options: [
        { value: 'available', label: 'Available' }, { value: 'sold_out', label: 'Sold Out' }, { value: 'coming_soon', label: 'Coming Soon' }
      ]}
    ],
    formFields: [
      { name: 'name', label: 'Model Name', required: true, colSpan: 2 },
      { name: 'image_url', label: 'Primary Image URL', colSpan: 2, default: 'https://placehold.co/1200x800/1a1a1a/fff?text=Ode+Works' },
      { name: 'brand_id', label: 'Brand', type: 'select', includeEmpty: true, options: async () => {
        const { data } = await supabase.from('brands').select('id, name');
        return (data || []).map(b => ({ value: b.id, label: b.name }));
      }},
      { name: 'model_year', label: 'Model Year', type: 'number', default: new Date().getFullYear() },
      { name: 'category', label: 'Category', type: 'select', options: CATEGORY_OPTIONS },
      { name: 'status', label: 'Status', type: 'select', options: [
        { value: 'available', label: 'Available' }, { value: 'sold_out', label: 'Sold Out' }, { value: 'coming_soon', label: 'Coming Soon' }
      ]},
      { name: 'price', label: 'Price (₱)', type: 'number' },
      { name: 'compare_price', label: 'Compare-at Price (₱)', type: 'number' },
      { name: 'stock_quantity', label: 'Stock Quantity', type: 'number', default: 0 },
      { name: 'engine_displacement', label: 'Engine Displacement' },
      { name: 'engine_type', label: 'Engine Type' },
      { name: 'transmission', label: 'Transmission' },
      { name: 'top_speed', label: 'Top Speed' },
      { name: 'weight', label: 'Weight' },
      { name: 'seat_height', label: 'Seat Height' },
      { name: 'fuel_capacity', label: 'Fuel Capacity' },
      { name: 'is_featured', label: 'Featured Motorcycle', type: 'checkbox' },
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
        const { data: existingImg } = await supabase.from('motorcycle_images').select('id').eq('motorcycle_id', row.id).eq('is_primary', true).maybeSingle();
        if (existingImg) await supabase.from('motorcycle_images').update({ image_url: pendingImageUrl }).eq('id', existingImg.id);
        else await supabase.from('motorcycle_images').insert({ motorcycle_id: row.id, image_url: pendingImageUrl, is_primary: true });
      } else {
        await supabase.from('motorcycle_images').insert({ motorcycle_id: row.id, image_url: pendingImageUrl, is_primary: true });
      }
    }
  });
});
