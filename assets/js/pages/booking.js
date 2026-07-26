// ============================================================================
// ODE WORKS - Appointment booking (multi-step wizard)
// Persists through assets/js/api.js (localStorage today, swappable for a real
// backend later — see the comment at the top of that file).
// ============================================================================
import { SERVICES, MECHANICS } from '../data.js';
import { submitBooking, getBookedSlots } from '../api.js';
import { toastError } from '../toast.js';
import { formatDate, getQueryParam } from '../utils.js';

const TIME_SLOTS = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

const state = { step: 1, serviceId: '', serviceName: '', motoInfo: '', mechanicId: null, mechanicName: 'No preference', date: null, time: null };
let calendarViewDate = new Date();

function goToStep(step) {
  state.step = step;
  document.querySelectorAll('.booking-panel').forEach(p => p.style.display = p.dataset.stepPanel === String(step) ? 'block' : 'none');
  document.querySelectorAll('.booking-step').forEach(s => {
    const n = Number(s.dataset.step);
    s.classList.toggle('active', n === step);
    s.classList.toggle('done', n < step);
  });
  if (step === 4) renderSummary();
}

function renderServiceGrid() {
  const grid = document.getElementById('service-select-grid');
  const preselect = getQueryParam('service');
  grid.innerHTML = SERVICES.map(s => `
    <div class="service-select-card ${s.slug === preselect ? 'selected' : ''}" data-id="${s.id}" data-name="${s.name}">
      <i class="${s.icon}"></i>
      <div style="font-weight:600;font-size:0.9rem;">${s.name}</div>
    </div>
  `).join('');
  if (preselect) {
    const match = SERVICES.find(s => s.slug === preselect);
    if (match) { state.serviceId = match.id; state.serviceName = match.name; }
  }
  grid.querySelectorAll('.service-select-card').forEach(card => card.addEventListener('click', () => {
    grid.querySelectorAll('.service-select-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    state.serviceId = card.dataset.id;
    state.serviceName = card.dataset.name;
  }));
}

function renderMechanicGrid() {
  const grid = document.getElementById('mechanic-select-grid');
  grid.innerHTML = `
    <div class="card mechanic-card mechanic-option selected" data-id="" data-name="No preference">
      <div class="icon-wrap flex-center" style="margin-inline:auto;border-radius:50%;"><i class="fa-solid fa-user-group"></i></div>
      <h4 style="font-size:0.9rem;">No preference</h4>
    </div>
    ${MECHANICS.map(m => `
      <div class="card mechanic-card mechanic-option" data-id="${m.id}" data-name="${m.name}">
        <img src="${m.photo}" alt="${m.name}">
        <h4 style="font-size:0.9rem;">${m.name}</h4>
        <p class="text-muted" style="font-size:0.78rem;">${m.specialty}</p>
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
  state.motoInfo = document.getElementById('moto-info-input').value.trim();
  if (!state.serviceId) { toastError('Please select a service type.'); return; }
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
  const booked = new Set(await getBookedSlots(dateStr));

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
document.getElementById('step2-next').addEventListener('click', () => {
  if (!state.date || !state.time) { toastError('Please select a date and time.'); return; }
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
    <div class="booking-summary-row"><span>Service</span><strong>${state.serviceName}</strong></div>
    <div class="booking-summary-row"><span>Motorcycle</span><strong>${state.motoInfo || '—'}</strong></div>
    <div class="booking-summary-row"><span>Mechanic</span><strong>${state.mechanicName}</strong></div>
    <div class="booking-summary-row"><span>Date</span><strong>${formatDate(state.date)}</strong></div>
    <div class="booking-summary-row"><span>Time</span><strong>${formatTime(state.time)}</strong></div>
    <hr class="divider">
    <div class="booking-summary-row"><span>Name</span><strong>${document.getElementById('contact-name').value}</strong></div>
    <div class="booking-summary-row"><span>Phone</span><strong>${document.getElementById('contact-phone').value}</strong></div>
    <div class="booking-summary-row"><span>Email</span><strong>${document.getElementById('contact-email').value}</strong></div>
  `;
}

document.getElementById('confirm-booking-btn').addEventListener('click', async () => {
  const btn = document.getElementById('confirm-booking-btn');
  const label = btn.querySelector('.btn-label');
  btn.disabled = true;
  label.innerHTML = '<span class="spinner"></span>';

  const result = await submitBooking({
    serviceId: state.serviceId,
    serviceName: state.serviceName,
    mechanicId: state.mechanicId,
    mechanicName: state.mechanicName,
    date: state.date.toISOString().slice(0, 10),
    time: state.time,
    motorcycleInfo: state.motoInfo,
    name: document.getElementById('contact-name').value.trim(),
    phone: document.getElementById('contact-phone').value.trim(),
    email: document.getElementById('contact-email').value.trim(),
    notes: document.getElementById('contact-notes').value.trim()
  });

  btn.disabled = false;
  label.textContent = 'Confirm Appointment';

  if (!result.success) { toastError('Something went wrong. Please try again.', 'Booking failed'); return; }

  document.getElementById('success-booking-id').textContent = result.id;
  document.querySelectorAll('.booking-panel').forEach(p => p.style.display = 'none');
  document.querySelector('[data-step-panel="success"]').style.display = 'block';
  document.querySelector('.booking-steps').style.display = 'none';
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

renderServiceGrid();
renderMechanicGrid();
goToStep(1);
