// ============================================================================
// ODE WORKS ADMIN - Dashboard: stat cards, charts, latest orders, appointments
// ============================================================================
import { supabase } from '../supabase-client.js';
import { requireAdminGuard, setPageTitle, initMobileSidebarToggle, onPartialsReady } from './admin-auth.js';
import { formatCurrency, formatDate } from '../utils.js';

onPartialsReady(async () => {
  const profile = await requireAdminGuard();
  if (!profile) return;
  setPageTitle('Dashboard');
  initMobileSidebarToggle();

  loadStatCards();
  loadSalesChart();
  loadInventoryChart();
  loadRevenueChart();
  loadNotifications();
  loadLatestOrders();
  loadAppointmentsOverview();

  document.getElementById('sales-range-select').addEventListener('change', loadSalesChart);
});

async function loadStatCards() {
  const el = document.getElementById('stat-cards');
  const [{ count: orderCount }, { data: orders }, { count: customerCount }, { count: motoCount }] = await Promise.all([
    supabase.from('orders').select('id', { count: 'exact', head: true }),
    supabase.from('orders').select('total'),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'customer'),
    supabase.from('motorcycles').select('id', { count: 'exact', head: true })
  ]);

  const revenue = (orders || []).reduce((sum, o) => sum + Number(o.total || 0), 0);

  const cards = [
    { label: 'Total Revenue', value: formatCurrency(revenue), icon: 'fa-solid fa-peso-sign', color: 'var(--color-accent)', delta: '+12.4%', up: true },
    { label: 'Total Orders', value: orderCount ?? 0, icon: 'fa-solid fa-bag-shopping', color: 'var(--color-info)', delta: '+8.1%', up: true },
    { label: 'Customers', value: customerCount ?? 0, icon: 'fa-regular fa-user', color: 'var(--color-success)', delta: '+5.6%', up: true },
    { label: 'Motorcycles Listed', value: motoCount ?? 0, icon: 'fa-solid fa-motorcycle', color: 'var(--color-warning)', delta: '-2.3%', up: false }
  ];

  el.innerHTML = cards.map(c => `
    <div class="card stat-card">
      <div class="top-row">
        <div class="icon-box" style="background:${c.color}22;color:${c.color};"><i class="${c.icon}"></i></div>
        <span class="delta ${c.up ? 'up' : 'down'}"><i class="fa-solid fa-arrow-${c.up ? 'up' : 'down'}"></i> ${c.delta}</span>
      </div>
      <div class="value">${c.value}</div>
      <div class="label">${c.label}</div>
    </div>
  `).join('');
}

let salesChartInstance = null;
async function loadSalesChart() {
  const days = Number(document.getElementById('sales-range-select').value);
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data } = await supabase.from('orders').select('total, created_at').gte('created_at', since.toISOString());

  const buckets = {};
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    buckets[d.toISOString().slice(0, 10)] = 0;
  }
  (data || []).forEach(o => {
    const key = o.created_at.slice(0, 10);
    if (key in buckets) buckets[key] += Number(o.total || 0);
  });

  const labels = Object.keys(buckets).map(k => new Date(k).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' }));
  const values = Object.values(buckets);

  if (salesChartInstance) salesChartInstance.destroy();
  salesChartInstance = new Chart(document.getElementById('sales-chart'), {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Sales', data: values, borderColor: '#00e0ff', backgroundColor: 'rgba(0,224,255,0.12)',
        fill: true, tension: 0.35, pointRadius: 0, borderWidth: 2
      }]
    },
    options: chartBaseOptions()
  });
}

async function loadInventoryChart() {
  const { data } = await supabase.from('motorcycles').select('category, stock_quantity');
  const totals = {};
  (data || []).forEach(m => { totals[m.category] = (totals[m.category] || 0) + (m.stock_quantity || 0); });

  const labels = Object.keys(totals).length ? Object.keys(totals) : ['sport', 'naked', 'adventure', 'cruiser', 'scooter'];
  const values = Object.keys(totals).length ? Object.values(totals) : [0, 0, 0, 0, 0];

  new Chart(document.getElementById('inventory-chart'), {
    type: 'doughnut',
    data: {
      labels: labels.map(l => l[0].toUpperCase() + l.slice(1)),
      datasets: [{ data: values, backgroundColor: ['#00e0ff', '#6366f1', '#ff6a1a', '#2ecc71', '#f5a623'], borderWidth: 0 }]
    },
    options: { ...chartBaseOptions(), plugins: { legend: { position: 'bottom', labels: { color: '#a3a3b0' } } } }
  });
}

async function loadRevenueChart() {
  const { data } = await supabase.from('orders').select('status, total');
  const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  const totals = statuses.map(s => (data || []).filter(o => o.status === s).reduce((sum, o) => sum + Number(o.total || 0), 0));

  new Chart(document.getElementById('revenue-chart'), {
    type: 'bar',
    data: {
      labels: statuses.map(s => s[0].toUpperCase() + s.slice(1)),
      datasets: [{ data: totals, backgroundColor: '#00e0ff', borderRadius: 6 }]
    },
    options: { ...chartBaseOptions(), plugins: { legend: { display: false } } }
  });
}

function chartBaseOptions() {
  return {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: '#a3a3b0' }, grid: { color: 'rgba(255,255,255,0.06)' } },
      y: { ticks: { color: '#a3a3b0' }, grid: { color: 'rgba(255,255,255,0.06)' } }
    }
  };
}

async function loadNotifications() {
  const el = document.getElementById('notifications-list');
  const { data: appts } = await supabase.from('appointments').select('*').eq('status', 'pending').order('created_at', { ascending: false }).limit(3);
  const { data: orders } = await supabase.from('orders').select('*').eq('status', 'pending').order('created_at', { ascending: false }).limit(2);

  const notifs = [
    ...(appts || []).map(a => ({ icon: 'fa-solid fa-calendar', color: 'var(--color-warning)', text: `New appointment request: ${a.service_type}`, time: a.created_at })),
    ...(orders || []).map(o => ({ icon: 'fa-solid fa-bag-shopping', color: 'var(--color-accent)', text: `New order #${o.order_number} awaiting confirmation`, time: o.created_at }))
  ].sort((a, b) => new Date(b.time) - new Date(a.time));

  if (!notifs.length) {
    el.innerHTML = '<p class="text-muted" style="padding:20px 0;">No new notifications.</p>';
    return;
  }

  el.innerHTML = notifs.map(n => `
    <div class="notif-item">
      <div class="icon-box" style="background:${n.color}22;color:${n.color};"><i class="${n.icon}"></i></div>
      <div><div>${n.text}</div><div class="time">${formatDate(n.time)}</div></div>
    </div>
  `).join('');
}

async function loadLatestOrders() {
  const tbody = document.getElementById('latest-orders-body');
  const { data, error } = await supabase.from('orders').select('*, profiles(full_name)').order('created_at', { ascending: false }).limit(6);

  if (error || !data || !data.length) {
    tbody.innerHTML = `<tr><td colspan="4"><div class="empty-state"><i class="fa-solid fa-bag-shopping"></i><p>No orders yet.</p></div></td></tr>`;
    return;
  }

  const badge = { pending: 'warning', processing: 'info', shipped: 'accent', delivered: 'success', cancelled: 'danger' };
  tbody.innerHTML = data.map(o => `
    <tr>
      <td>#${o.order_number}</td>
      <td>${o.profiles?.full_name || 'Guest'}</td>
      <td>${formatCurrency(o.total)}</td>
      <td><span class="badge badge-${badge[o.status] || 'accent'}">${o.status}</span></td>
    </tr>
  `).join('');
}

async function loadAppointmentsOverview() {
  const el = document.getElementById('appointments-overview');
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase.from('appointments').select('*').gte('appointment_date', today).order('appointment_date', { ascending: true }).limit(6);

  if (error || !data || !data.length) {
    el.innerHTML = '<p class="text-muted" style="padding:20px 0;">No upcoming appointments.</p>';
    return;
  }

  el.innerHTML = data.map(a => `
    <div class="appt-mini-row">
      <span>${a.service_type}</span>
      <span class="text-muted">${formatDate(a.appointment_date)} · ${a.appointment_time?.slice(0,5)}</span>
    </div>
  `).join('');
}
