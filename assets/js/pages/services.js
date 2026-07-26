// ============================================================================
// ODE WORKS - Services page: mechanics list
// ============================================================================
import { supabase } from '../supabase-client.js';

async function loadMechanics() {
  const grid = document.getElementById('mechanics-grid');
  const { data, error } = await supabase.from('mechanics').select('*').eq('is_active', true).order('years_experience', { ascending: false });

  if (error || !data || !data.length) {
    grid.innerHTML = '<p class="text-muted">Mechanic profiles will appear here once connected to Supabase.</p>';
    return;
  }

  grid.innerHTML = data.map(m => `
    <div class="card mechanic-card">
      <img src="${m.photo_url}" alt="${m.full_name}">
      <h4>${m.full_name}</h4>
      <p class="text-muted" style="font-size:0.85rem;">${m.specialty || ''}</p>
      <p class="mt-1" style="font-size:0.8rem;">${m.years_experience} years experience</p>
    </div>
  `).join('');
}

loadMechanics();
