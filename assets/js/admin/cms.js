// ============================================================================
// ODE WORKS ADMIN - CMS module (homepage banners / promo slides)
// ============================================================================
import { requireAdminGuard, setPageTitle, initMobileSidebarToggle, onPartialsReady } from './admin-auth.js';
import { initCrudTable } from './crud-table.js';

onPartialsReady(async () => {
  const profile = await requireAdminGuard();
  if (!profile) return;
  setPageTitle('CMS / Banners');
  initMobileSidebarToggle();

  initCrudTable({
    table: 'banners',
    select: '*',
    title: 'Banner',
    rootSelector: '#crud-root',
    searchFields: ['title'],
    orderBy: 'display_order',
    orderAsc: true,
    columns: [
      { key: 'image', label: '', render: (r) => `<img class="row-thumb" src="${r.image_url}" alt="">` },
      { key: 'title', label: 'Title' },
      { key: 'placement', label: 'Placement', render: (r) => `<span style="text-transform:capitalize;">${r.placement}</span>` },
      { key: 'display_order', label: 'Order' },
      { key: 'is_active', label: 'Status', render: (r) => `<span class="badge badge-${r.is_active ? 'success' : 'danger'}">${r.is_active ? 'Active' : 'Inactive'}</span>` }
    ],
    filters: [
      { key: 'placement', label: 'Placement', column: 'placement', options: [
        { value: 'hero', label: 'Hero' }, { value: 'promo', label: 'Promo' }, { value: 'announcement', label: 'Announcement' }
      ]}
    ],
    formFields: [
      { name: 'title', label: 'Title', required: true, colSpan: 2 },
      { name: 'image_url', label: 'Image URL', required: true, colSpan: 2, default: 'https://placehold.co/1920x900/1a1a1a/fff?text=Banner' },
      { name: 'subtitle', label: 'Subtitle', colSpan: 2 },
      { name: 'link_url', label: 'Link URL' },
      { name: 'button_text', label: 'Button Text' },
      { name: 'placement', label: 'Placement', type: 'select', options: [
        { value: 'hero', label: 'Hero' }, { value: 'promo', label: 'Promo' }, { value: 'announcement', label: 'Announcement' }
      ]},
      { name: 'display_order', label: 'Display Order', type: 'number', default: 0 },
      { name: 'is_active', label: 'Active', type: 'checkbox', default: true }
    ]
  });
});
