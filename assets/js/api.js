// ============================================================================
// ODE WORKS - Data API layer
//
// Every page talks to the "backend" only through the functions in this file.
// Today that backend is `localStorage` (so the site works with zero setup).
// When a real database is ready, each function below can be swapped for a
// network call without touching any page's HTML/JS — that's the whole point
// of routing everything through here instead of writing storage code inline.
//
// Example future swap (Supabase):
//   export async function submitBooking(payload) {
//     const { data, error } = await supabase.from('appointments').insert(payload).select().single();
//     if (error) return { success: false, error: error.message };
//     return { success: true, id: data.id };
//   }
// ============================================================================

const BOOKINGS_KEY = 'ow_bookings';
const CONTACT_KEY = 'ow_contact_messages';

function readList(key) {
  try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; }
}

function writeList(key, list) {
  localStorage.setItem(key, JSON.stringify(list));
}

function fakeLatency(ms = 500) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

/**
 * Persists a service appointment booking.
 * @param {{serviceId:string, serviceName:string, mechanicId:string|null, mechanicName:string,
 *          date:string, time:string, motorcycleInfo:string, name:string, phone:string,
 *          email:string, notes:string}} payload
 */
export async function submitBooking(payload) {
  await fakeLatency();
  const bookings = readList(BOOKINGS_KEY);
  const record = { id: generateId('booking'), status: 'pending', createdAt: new Date().toISOString(), ...payload };
  bookings.push(record);
  writeList(BOOKINGS_KEY, bookings);
  return { success: true, id: record.id };
}

/** Returns already-booked time slots for a given date (client-side conflict check). */
export async function getBookedSlots(date) {
  await fakeLatency(150);
  return readList(BOOKINGS_KEY).filter(b => b.date === date && b.status !== 'cancelled').map(b => b.time);
}

/**
 * Persists a contact form message.
 * @param {{name:string, email:string, subject:string, message:string}} payload
 */
export async function submitContactMessage(payload) {
  await fakeLatency();
  const messages = readList(CONTACT_KEY);
  messages.push({ id: generateId('msg'), createdAt: new Date().toISOString(), ...payload });
  writeList(CONTACT_KEY, messages);
  return { success: true };
}
