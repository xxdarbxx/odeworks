// ============================================================================
// ODE WORKS - Sample content
//
// Shaped like rows from a future database table (flat objects with an `id`)
// so this file is a drop-in stand-in for a real backend. When Supabase (or
// any other DB) is wired up, each of these arrays becomes a `SELECT *` call
// instead — see assets/js/api.js for where that swap happens.
// ============================================================================

export const SERVICES = [
  {
    id: 'svc-01',
    slug: 'engine-diagnostics',
    name: 'Engine Diagnostics',
    icon: 'fa-solid fa-magnifying-glass-chart',
    category: 'Diagnostics',
    shortDescription: 'Computerized engine scan to pinpoint performance issues before they become breakdowns.',
    description: 'Our diagnostic bay uses OEM-grade scan tools to read fault codes, check sensor data, and trace intermittent issues that a visual inspection would miss. You get a clear, itemized report before any repair work begins.',
    priceFrom: 450
  },
  {
    id: 'svc-02',
    slug: 'periodic-maintenance',
    name: 'Periodic Maintenance Service (PMS)',
    icon: 'fa-solid fa-gears',
    category: 'Maintenance',
    shortDescription: 'Oil change, filter replacement, chain adjustment, and a full multi-point inspection.',
    description: 'Regular PMS keeps small issues from becoming expensive ones. We check fluids, brakes, chain tension, tire condition, lights, and battery health on every visit, and log everything to your service history.',
    priceFrom: 850
  },
  {
    id: 'svc-03',
    slug: 'engine-overhaul',
    name: 'Engine Overhaul & Rebuild',
    icon: 'fa-solid fa-screwdriver-wrench',
    category: 'Repair',
    shortDescription: 'Full teardown, part replacement, and reassembly for major engine issues.',
    description: 'For engines with excessive wear, knocking, or persistent oil consumption, our mechanics perform a complete overhaul — piston/ring replacement, valve work, and gasket renewal — bringing performance back to spec.',
    priceFrom: 4500
  },
  {
    id: 'svc-04',
    slug: 'electrical-ecu-tuning',
    name: 'Electrical & ECU Diagnostics',
    icon: 'fa-solid fa-bolt',
    category: 'Diagnostics',
    shortDescription: 'Wiring repair, battery service, and ECU fault clearing/remapping.',
    description: 'From dead batteries to intermittent electrical faults and check-engine lights, we trace wiring issues down to the connector and can read/clear/reflash ECU data on supported models.',
    priceFrom: 1200
  },
  {
    id: 'svc-05',
    slug: 'suspension-handling',
    name: 'Suspension & Handling',
    icon: 'fa-solid fa-arrows-left-right-to-line',
    category: 'Repair',
    shortDescription: 'Fork seal replacement, shock rebuilds, and alignment for a bike that handles right.',
    description: 'A soft, leaking, or misaligned suspension changes how your bike handles under braking and cornering. We rebuild forks and shocks, replace seals, and true up alignment to factory tolerances.',
    priceFrom: 1800
  },
  {
    id: 'svc-06',
    slug: 'tire-brake-service',
    name: 'Tire & Brake Service',
    icon: 'fa-solid fa-circle-dot',
    category: 'Maintenance',
    shortDescription: 'Tire mounting/balancing and brake pad, disc, and fluid service.',
    description: 'We stock a range of tire brands and sizes for street and touring use, and handle brake pad replacement, disc resurfacing/replacement, and full fluid bleeds to keep your stopping power sharp.',
    priceFrom: 300
  },
  {
    id: 'svc-07',
    slug: 'detailing-paint',
    name: 'Detailing & Paint Touch-Up',
    icon: 'fa-solid fa-paint-roller',
    category: 'Cosmetic',
    shortDescription: 'Deep cleaning, ceramic coating, and minor paint/scratch touch-ups.',
    description: 'Beyond a wash — we deep-clean engine bays and wheels, apply protective ceramic coating, and blend minor paint chips and scratches so your bike looks as good as it runs.',
    priceFrom: 1000
  },
  {
    id: 'svc-08',
    slug: 'pre-ride-inspection',
    name: 'Pre-Ride Safety Inspection',
    icon: 'fa-solid fa-clipboard-check',
    category: 'Diagnostics',
    shortDescription: 'A fast, thorough safety check before a long trip or after a long layoff.',
    description: 'Planning a long ride or waking a bike up after months in storage? This inspection covers tires, brakes, lights, fluids, and battery so you head out with confidence.',
    priceFrom: 400
  }
];

export const MECHANICS = [
  {
    id: 'mech-01',
    name: 'Marco Villanueva',
    specialty: 'Engine Overhaul & Diagnostics',
    photo: 'https://placehold.co/400x400/1a1a1a/fff?text=Marco',
    bio: 'Factory-trained technician specializing in Japanese inline engines, with over a decade rebuilding high-mileage motors.',
    yearsExperience: 12
  },
  {
    id: 'mech-02',
    name: 'Rico Domingo',
    specialty: 'Suspension & Handling',
    photo: 'https://placehold.co/400x400/1a1a1a/fff?text=Rico',
    bio: 'Suspension tuning specialist for sport and adventure bikes, dialing in ride quality for street and track use.',
    yearsExperience: 8
  },
  {
    id: 'mech-03',
    name: 'Ella Santos',
    specialty: 'Electrical & ECU Diagnostics',
    photo: 'https://placehold.co/400x400/1a1a1a/fff?text=Ella',
    bio: 'Our go-to for stubborn electrical gremlins and ECU fault tracing across most major brands.',
    yearsExperience: 6
  },
  {
    id: 'mech-04',
    name: 'Jomari Cruz',
    specialty: 'General Maintenance & PMS',
    photo: 'https://placehold.co/400x400/1a1a1a/fff?text=Jomari',
    bio: 'Fast, thorough, and detail-obsessed — Jomari keeps our PMS turnaround times the best in the metro.',
    yearsExperience: 10
  }
];

export const TESTIMONIALS = [
  {
    id: 'test-01',
    name: 'Jomar D.',
    location: 'Quezon City',
    rating: 5,
    quote: 'My bike wouldn’t start and three other shops couldn’t figure it out. Ode Works found a corroded connector in twenty minutes. Honest, fast, and fair pricing.'
  },
  {
    id: 'test-02',
    name: 'Maricel R.',
    location: 'Manila',
    rating: 5,
    quote: 'Booked my PMS online, dropped off in the morning, picked up same day. The itemized report they give you is something I wish every shop did.'
  },
  {
    id: 'test-03',
    name: 'Anton T.',
    location: 'Marikina',
    rating: 5,
    quote: 'Had my engine rebuilt here after a long-distance ride destroyed it. Runs better now than when I bought the bike. Worth every peso.'
  },
  {
    id: 'test-04',
    name: 'Divine P.',
    location: 'Pasig',
    rating: 5,
    quote: 'Suspension rebuild made a huge difference in how my bike handles corners. Rico walked me through exactly what was worn and why.'
  }
];

export const GALLERY = [
  {
    id: 'gal-01',
    category: 'Engine',
    title: 'Full Engine Rebuild — Yamaha 150cc',
    before: 'https://placehold.co/800x600/2a2015/f97316?text=Before',
    after: 'https://placehold.co/800x600/0d0d0d/00e0ff?text=After'
  },
  {
    id: 'gal-02',
    category: 'Cosmetic',
    title: 'Paint & Panel Restoration',
    before: 'https://placehold.co/800x600/2a2015/f97316?text=Before',
    after: 'https://placehold.co/800x600/0d0d0d/00e0ff?text=After'
  },
  {
    id: 'gal-03',
    category: 'Electrical',
    title: 'Wiring Harness Repair',
    before: 'https://placehold.co/800x600/2a2015/f97316?text=Before',
    after: 'https://placehold.co/800x600/0d0d0d/00e0ff?text=After'
  },
  {
    id: 'gal-04',
    category: 'Suspension',
    title: 'Fork Seal & Oil Rebuild',
    before: 'https://placehold.co/800x600/2a2015/f97316?text=Before',
    after: 'https://placehold.co/800x600/0d0d0d/00e0ff?text=After'
  },
  {
    id: 'gal-05',
    category: 'Engine',
    title: 'Carburetor Overhaul',
    before: 'https://placehold.co/800x600/2a2015/f97316?text=Before',
    after: 'https://placehold.co/800x600/0d0d0d/00e0ff?text=After'
  },
  {
    id: 'gal-06',
    category: 'Cosmetic',
    title: 'Full Detailing & Ceramic Coat',
    before: 'https://placehold.co/800x600/2a2015/f97316?text=Before',
    after: 'https://placehold.co/800x600/0d0d0d/00e0ff?text=After'
  }
];

export const BLOG_POSTS = [
  {
    id: 'post-01',
    slug: 'how-often-change-motorcycle-oil',
    title: 'How Often Should You Change Your Motorcycle Oil?',
    excerpt: 'A practical maintenance guide to keep your engine running smoothly for years.',
    content: 'Oil change intervals depend on engine type, riding conditions, and oil quality.\n\nMost manufacturers recommend a change every 3,000-5,000 km for conventional oil, or up to 8,000 km for full synthetic — but stop-and-go city riding shortens that interval. Watch for darkening oil, a burnt smell, or a louder-than-usual engine as early warning signs.\n\nBring your bike in and we will check your oil condition for free during any visit, even if you are not due for a full PMS yet.',
    coverImage: 'https://placehold.co/1200x600/0d0d0d/f97316?text=Oil+Change+Guide',
    category: 'Maintenance',
    tags: ['maintenance', 'tips'],
    publishedAt: '2026-07-06'
  },
  {
    id: 'post-02',
    slug: 'signs-your-motorcycle-needs-a-checkup',
    title: '5 Warning Signs Your Motorcycle Needs a Checkup',
    excerpt: 'Catch small problems before they turn into expensive repairs.',
    content: 'Strange noises, a rougher idle, delayed braking response, unusual vibration, or a check-engine light are the five most common signs riders ignore until a small issue becomes a big one.\n\nOur diagnostic bay can usually identify the root cause in under 30 minutes. If something feels off, it is almost always cheaper to check it early.',
    coverImage: 'https://placehold.co/1200x600/0d0d0d/00e0ff?text=Warning+Signs',
    category: 'Diagnostics',
    tags: ['diagnostics', 'safety'],
    publishedAt: '2026-06-18'
  },
  {
    id: 'post-03',
    slug: 'ode-works-new-service-bay',
    title: 'Ode Works Adds Two New Service Bays',
    excerpt: 'We are expanding our Galas, Quezon City shop to cut wait times in half.',
    content: 'To keep up with demand, we have added two new service bays and a dedicated diagnostics station. Average turnaround for routine maintenance is now same-day for morning drop-offs.\n\nBook online any time — walk-ins are still welcome, but booking guarantees your slot.',
    coverImage: 'https://placehold.co/1200x600/0d0d0d/84cc16?text=New+Service+Bay',
    category: 'News',
    tags: ['announcement', 'shop-news'],
    publishedAt: '2026-05-30'
  }
];
