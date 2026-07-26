// ============================================================================
// ODE WORKS - Appointment booking (multi-step wizard)
// ============================================================================
import { supabase } from '../supabase-client.js';
import { getCurrentUser, getCurrentProfile } from '../auth.js';
import { toastSuccess, toastError } from '../toast.js';
import { formatDate } from '../utils.js';

const TIME_SLOTS = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

const state = { step: 1, service: '', motoInfo: '', mechanicId: null, mechanicName: 'No preference', date: null, time: null };
let calendarViewDate = new Date();
let mechanics = [];

function goToStep(step) {
  state.step = step;
  document.querySelectorAll('.booking-panel').forEach(p => p.style.display = Number(p.dataset.stepPanel) === step ? 'block' : 'none');
  document.querySelectorAll('.booking-step').forEach(s => {
    const n = Number(s.dataset.step);
    s.classList.toggle('active', n === step);
    s.classList.toggle('done', n < step);
  });
  if (step === 4) renderSummary();
}

async function loadMechanics() {
  const { data } = await supabase.from('mechanics').select('*').eq('is_active', true);
  mechanics = data || [];
  const grid = document.getElementById('mechanic-select-grid');
  grid.innerHTML = `
    <div class="card mechanic-card mechanic-option selected" data-id="" data-name="No preference" style="cursor:pointer;">
      <div class="icon-wrap flex-center" style="margin-inline:auto;border-radius:50%;"><i class="fa-solid fa-user-group"></i></div>
      <h4 style="font-size:0.9rem;">No preference</h4>
    </div>
    ${mechanics.map(m => `
      <div class="card mechanic-card mechanic-option" data-id="${m.id}" data-name="${m.full_name}" style="cursor:pointer;">
        <img src="${m.photo_url}" alt="${m.full_name}">
        <h4 style="font-size:0.9rem;">${m.full_name}</h4>
        <p class="text-muted" style="font-size:0.78rem;">${m.specialty || ''}</p>
      </div>
    `).join('')}
  `;
  grid.querySelectorAll('.mechanic-option').forEach(card => card.addEventListener('click', () => {
    grid.querySelectorAll('.mechanic-option').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    state.mechanicId = card.dataset.id || null;
    state.mechanicName = card.dataset.name;
  }));
}

document.getElementById('step1-next').addEventListener('click', () => {
  state.service = document.getElementById('service-select').value;
  state.motoInfo = document.getElementById('moto-info-input').value.trim();
  if (!state.service) { toastError('Please select a service type.'); return; }
  goToStep(2);
  renderCalendar();
});

// ---------------------------------------------------------------------------
// Calendar
// ---------------------------------------------------------------------------
function renderCalendar() {
  const year = calendarViewDate.getFullYear();
  const month = calendarViewDate.getMonth();
  document.getElementById('calendar-month-label').textContent = calendarViewDate.toLocaleDateString('en-PH', { month: 'long', year: 'numeric' });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date(); today.setHours(0,0,0,0);

  const dows = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  let html = dows.map(d => `<div class="dow">${d}</div>`).join('');
  for (let i = 0; i < firstDay; i++) html += `<div class="calendar-day empty"></div>`;

  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, month, d);
    const isPast = dateObj < today;
    const isSunday = dateObj.getDay() === 0;
    const isSelected = state.date && dateObj.toDateString() === state.date.toDateString();
    html += `<div class="calendar-day ${isPast || isSunday ? 'disabled' : ''} ${isSelected ? 'selected' : ''}" data-date="${dateObj.toISOString().slice(0,10)}">${d}</div>`;
  }
  document.getElementById('calendar-grid').innerHTML = html;

  document.querySelectorAll('.calendar-day[data-date]').forEach(cell => {
    cell.addEventListener('click', () => {
      if (cell.classList.contains('disabled')) return;
      state.date = new Date(cell.dataset.date + 'T00:00:00');
      state.time = null;
      renderCalendar();
      renderTimeSlots();
    });
  });
}

async function renderTimeSlots() {
  const container = document.getElementById('time-slots');
  if (!state.date) { container.innerHTML = ''; return; }
  container.innerHTML = '<div class="spinner"></div>';

  const dateStr = state.date.toISOString().slice(0, 10);
  let query = supabase.from('appointments').select('appointment_time').eq('appointment_date', dateStr).neq('status', 'cancelled');
  if (state.mechanicId) query = query.eq('mechanic_id', state.mechanicId);
  const { data } = await query;
  const booked = new Set((data || []).map(r => r.appointment_time.slice(0,5)));

  container.innerHTML = TIME_SLOTS.map(t => `
    <div class="time-slot ${booked.has(t) ? 'disabled' : ''} ${state.time === t ? 'selected' : ''}" data-time="${t}">${formatTime(t)}</div>
  `).join('');

  container.querySelectorAll('.time-slot:not(.disabled)').forEach(slot => slot.addEventListener('click', () => {
    state.time = slot.dataset.time;
    container.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
    slot.classList.add('selected');
  }));
}

function formatTime(t) {
  const [h, m] = t.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2,'0')} ${period}`;
}

document.getElementById('cal-prev').addEventListener('click', () => { calendarViewDate.setMonth(calendarViewDate.getMonth() - 1); renderCalendar(); });
document.getElementById('cal-next').addEventListener('click', () => { calendarViewDate.setMonth(calendarViewDate.getMonth() + 1); renderCalendar(); });

document.getElementById('step2-back').addEventListener('click', () => goToStep(1));
document.getElementById('step2-next').addEventListener('click', async () => {
  if (!state.date || !state.time) { toastError('Please select a date and time.'); return; }
  const profile = await getCurrentProfile();
  if (profile) {
    document.getElementById('contact-name').value = profile.full_name || '';
    document.getElementById('contact-phone').value = profile.phone || '';
    document.getElementById('contact-email').value = profile.email || '';
  }
  goToStep(3);
});

document.getElementById('step3-back').addEventListener('click', () => goToStep(2));
document.getElementById('step3-next').addEventListener('click', () => {
  const name = document.getElementById('contact-name').value.trim();
  const phone = document.getElementById('contact-phone').value.trim();
  const email = document.getElementById('contact-email').value.trim();
  if (!name || !phone || !email) { toastError('Please fill in all required fields.'); return; }
  goToStep(4);
});

document.getElementById('step4-back').addEventListener('click', () => goToStep(3));

function renderSummary() {
  document.getElementById('booking-summary').innerHTML = `
    <h3 class="mb-3">Review Your Appointment</h3>
    <div class="summary-row"><span>Service</span><strong>${state.service}</strong></div>
    <div class="summary-row"><span>Motorcycle</span><strong>${state.motoInfo || '—'}</strong></div>
    <div class="summary-row"><span>Mechanic</span><strong>${state.mechanicName}</strong></div>
    <div class="summary-row"><span>Date</span><strong>${formatDate(state.date)}</strong></div>
    <div class="summary-row"><span>Time</span><strong>${formatTime(state.time)}</strong></div>
    <hr class="divider">
    <div class="summary-row"><span>Name</span><strong>${document.getElementById('contact-name').value}</strong></div>
    <div class="summary-row"><span>Phone</span><strong>${document.getElementById('contact-phone').value}</strong></div>
    <div class="summary-row"><span>Email</span><strong>${document.getElementById('contact-email').value}</strong></div>
  `;
}

document.getElementById('confirm-booking-btn').addEventListener('click', async () => {
  const user = await getCurrentUser();
  if (!user) {
    sessionStorage.setItem('ow_pending_booking', JSON.stringify({ ...state, date: state.date?.toISOString() }));
    toastError('Please log in to confirm your appointment.', 'Login required');
    window.location.href = 'login.html?redirect=%2Fbooking.html';
    return;
  }

  const btn = document.getElementById('confirm-booking-btn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Booking...';

  const { error } = await supabase.from('appointments').insert({
    user_id: user.id,
    mechanic_id: state.mechanicId,
    service_type: state.service,
    motorcycle_info: state.motoInfo,
    appointment_date: state.date.toISOString().slice(0, 10),
    appointment_time: state.time,
    notes: document.getElementById('contact-notes').value.trim()
  });

  if (error) {
    toastError(error.message, 'Booking failed');
    btn.disabled = false;
    btn.textContent = 'Confirm Appointment';
    return;
  }

  toastSuccess('Your appointment has been booked. We\'ll see you soon!', 'Appointment Confirmed');
  setTimeout(() => window.location.href = 'profile.html', 1200);
});

loadMechanics();
goToStep(1);
