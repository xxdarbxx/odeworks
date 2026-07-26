// ============================================================================
// ODE WORKS ADMIN - Reports: revenue trend, order status, top sellers
// ============================================================================
import { supabase } from '../supabase-client.js';
import { requireAdminGuard, setPageTitle, initMobileSidebarToggle, onPartialsReady } from './admin-auth.js';
import { formatCurrency } from '../utils.js';

onPartialsReady(async () => {
  const profile = await requireAdminGuard();
  if (!profile) return;
  setPageTitle('Reports');
  initMobileSidebarToggle();

  loadKpis();
  loadRevenueTrend();
  loadOrderStatusChart();
  loadTopSellers();
});

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

async function loadKpis() {
  const { data: orders } = await supabase.from('orders').select('total, status');
  const { count: reviewCount } = await supabase.from('reviews').select('id', { count: 'exact', head: true });
  const { count: appointmentCount } = await supabase.from('appointments').select('id', { count: 'exact', head: true });

  const revenue = (orders || []).reduce((s, o) => s + Number(o.total || 0), 0);
  const avgOrder = orders?.length ? revenue / orders.length : 0;
  const cancelled = (orders || []).filter(o => o.status === 'cancelled').length;
  const cancelRate = orders?.length ? (cancelled / orders.length * 100).toFixed(1) : 0;

  document.getElementById('report-kpis').innerHTML = `
    <div class="kpi-pill glass"><span class="text-muted" style="font-size:0.78rem;">Total Revenue</span><b>${formatCurrency(revenue)}</b></div>
    <div class="kpi-pill glass"><span class="text-muted" style="font-size:0.78rem;">Avg Order Value</span><b>${formatCurrency(avgOrder)}</b></div>
    <div class="kpi-pill glass"><span class="text-muted" style="font-size:0.78rem;">Cancellation Rate</span><b>${cancelRate}%</b></div>
    <div class="kpi-pill glass"><span class="text-muted" style="font-size:0.78rem;">Total Reviews</span><b>${reviewCount ?? 0}</b></div>
    <div class="kpi-pill glass"><span class="text-muted" style="font-size:0.78rem;">Total Appointments</span><b>${appointmentCount ?? 0}</b></div>
  `;
}

async function loadRevenueTrend() {
  const since = new Date();
  since.setMonth(since.getMonth() - 11);
  since.setDate(1);
  const { data } = await supabase.from('orders').select('total, created_at').gte('created_at', since.toISOString());

  const buckets = {};
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    buckets[`${d.getFullYear()}-${d.getMonth()}`] = 0;
  }
  (data || []).forEach(o => {
    const d = new Date(o.created_at);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (key in buckets) buckets[key] += Number(o.total || 0);
  });

  const labels = Object.keys(buckets).map(k => {
    const [y, m] = k.split('-').map(Number);
    return new Date(y, m, 1).toLocaleDateString('en-PH', { month: 'short', year: '2-digit' });
  });

  new Chart(document.getElementById('revenue-trend-chart'), {
    type: 'line',
    data: { labels, datasets: [{ data: Object.values(buckets), borderColor: '#00e0ff', backgroundColor: 'rgba(0,224,255,0.12)', fill: true, tension: 0.35, pointRadius: 0, borderWidth: 2 }] },
    options: chartBaseOptions()
  });
}

async function loadOrderStatusChart() {
  const { data } = await supabase.from('orders').select('status');
  const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  const counts = statuses.map(s => (data || []).filter(o => o.status === s).length);

  new Chart(document.getElementById('order-status-chart'), {
    type: 'doughnut',
    data: { labels: statuses.map(s => s[0].toUpperCase() + s.slice(1)), datasets: [{ data: counts, backgroundColor: ['#f5a623', '#6366f1', '#00e0ff', '#2ecc71', '#ff4d4f'], borderWidth: 0 }] },
    options: { ...chartBaseOptions(), plugins: { legend: { position: 'bottom', labels: { color: '#a3a3b0' } } } }
  });
}

async function loadTopSellers() {
  const { data: items } = await supabase.from('order_items').select('item_type, item_name, quantity, subtotal');

  const motoTotals = {};
  const productTotals = {};
  (items || []).forEach(i => {
    const bucket = i.item_type === 'motorcycle' ? motoTotals : productTotals;
    if (!bucket[i.item_name]) bucket[i.item_name] = { qty: 0, revenue: 0 };
    bucket[i.item_name].qty += i.quantity;
    bucket[i.item_name].revenue += Number(i.subtotal || 0);
  });

  renderTopTable('top-motos-body', motoTotals);
  renderTopTable('top-products-body', productTotals);
}

function renderTopTable(elId, totals) {
  const entries = Object.entries(totals).sort((a, b) => b[1].revenue - a[1].revenue).slice(0, 8);
  const el = document.getElementById(elId);
  if (!entries.length) {
    el.innerHTML = `<tr><td colspan="3"><div class="empty-state"><i class="fa-solid fa-chart-simple"></i><p>No sales data yet.</p></div></td></tr>`;
    return;
  }
  el.innerHTML = entries.map(([name, t]) => `<tr><td>${name}</td><td>${t.qty}</td><td>${formatCurrency(t.revenue)}</td></tr>`).join('');
}
