// ============================================================================
// ODE WORKS - About page: render team/mechanics grid
// ============================================================================
import { MECHANICS } from '../data.js';
import { mechanicCard } from '../render.js';

document.getElementById('mechanics-grid').innerHTML = MECHANICS.map(mechanicCard).join('');
