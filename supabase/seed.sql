-- ============================================================================
-- ODE WORKS - Sample Data
-- Run AFTER schema.sql and rls_policies.sql
-- Note: orders/appointments/reviews/wishlist/cart reference real auth.users,
-- so they are not seeded here. Create a test account via the site's
-- Register page, then use the Admin dashboard to place sample orders etc.
-- ============================================================================

-- BRANDS
insert into brands (id, name, slug, logo_url, description, country, is_active) values
  ('11111111-0000-0000-0000-000000000001', 'Yamaha', 'yamaha', 'https://placehold.co/200x100/1a1a1a/fff?text=Yamaha', 'Legendary Japanese engineering, built for riders who demand performance.', 'Japan', true),
  ('11111111-0000-0000-0000-000000000002', 'Honda', 'honda', 'https://placehold.co/200x100/1a1a1a/fff?text=Honda', 'The power of dreams — reliability and innovation since 1948.', 'Japan', true),
  ('11111111-0000-0000-0000-000000000003', 'Kawasaki', 'kawasaki', 'https://placehold.co/200x100/1a1a1a/fff?text=Kawasaki', 'Let the good times roll. Bold, powerful, uncompromising.', 'Japan', true),
  ('11111111-0000-0000-0000-000000000004', 'Ducati', 'ducati', 'https://placehold.co/200x100/1a1a1a/fff?text=Ducati', 'Italian passion, race-derived technology.', 'Italy', true),
  ('11111111-0000-0000-0000-000000000005', 'KTM', 'ktm', 'https://placehold.co/200x100/1a1a1a/fff?text=KTM', 'Ready to Race. Austrian engineering for the extreme.', 'Austria', true),
  ('11111111-0000-0000-0000-000000000006', 'Royal Enfield', 'royal-enfield', 'https://placehold.co/200x100/1a1a1a/fff?text=Royal+Enfield', 'Timeless design, pure motorcycling since 1901.', 'India', true);

-- PRODUCT CATEGORIES
insert into product_categories (id, name, slug, parent_id, description, image_url, display_order, is_active) values
  ('22222222-0000-0000-0000-000000000001', 'Helmets', 'helmets', null, 'Full-face, modular, and open-face helmets for every ride.', 'https://placehold.co/400x300/1a1a1a/fff?text=Helmets', 1, true),
  ('22222222-0000-0000-0000-000000000002', 'Riding Gear', 'riding-gear', null, 'Jackets, gloves, and boots built for the road.', 'https://placehold.co/400x300/1a1a1a/fff?text=Riding+Gear', 2, true),
  ('22222222-0000-0000-0000-000000000003', 'Parts & Maintenance', 'parts-maintenance', null, 'Genuine and aftermarket parts to keep your bike running.', 'https://placehold.co/400x300/1a1a1a/fff?text=Parts', 3, true),
  ('22222222-0000-0000-0000-000000000004', 'Accessories', 'accessories', null, 'Bags, mounts, and add-ons for your motorcycle.', 'https://placehold.co/400x300/1a1a1a/fff?text=Accessories', 4, true),
  ('22222222-0000-0000-0000-000000000005', 'Exhaust Systems', 'exhaust-systems', '22222222-0000-0000-0000-000000000003', 'Performance and slip-on exhaust systems.', 'https://placehold.co/400x300/1a1a1a/fff?text=Exhaust', 1, true),
  ('22222222-0000-0000-0000-000000000006', 'Tires', 'tires', '22222222-0000-0000-0000-000000000003', 'Street, touring, and off-road tires.', 'https://placehold.co/400x300/1a1a1a/fff?text=Tires', 2, true);

-- MOTORCYCLES
insert into motorcycles (id, brand_id, name, slug, model_year, category, price, compare_price, stock_quantity, engine_displacement, engine_type, transmission, fuel_capacity, weight, seat_height, top_speed, color_options, description, highlights, is_featured, status, rating, review_count) values
  ('33333333-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 'Yamaha MT-09', 'yamaha-mt-09', 2025, 'naked', 589000, 619000, 8, '889cc', 'Liquid-cooled inline-3', '6-speed manual', '14L', '193kg', '825mm', '220km/h', array['Cyan Storm','Tech Black','Icon Blue'], 'The Dark Side of Japan. A hyper naked with a razor-sharp CP3 engine and aggressive street-fighter styling.', array['CP3 Triple Engine','Quickshifter','6-axis IMU','Full-color TFT display'], true, 'available', 4.8, 124),
  ('33333333-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000001', 'Yamaha R15 V4', 'yamaha-r15-v4', 2025, 'sport', 189000, null, 15, '155cc', 'Liquid-cooled single', '6-speed manual', '11L', '142kg', '810mm', '136km/h', array['Racing Blue','Matte Black','Metallic Red'], 'Track-bred styling meets everyday practicality in Yamaha''s entry-level supersport.', array['VVA Technology','Quickshifter','Traction Control','LED lighting'], true, 'available', 4.6, 89),
  ('33333333-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000002', 'Honda CBR650R', 'honda-cbr650r', 2025, 'sport', 549000, null, 6, '649cc', 'Liquid-cooled inline-4', '6-speed manual', '15.4L', '208kg', '810mm', '200km/h', array['Grand Prix Red','Matte Black'], 'Inline-4 soundtrack, sharp handling, and everyday comfort in one supersport package.', array['Inline-4 Engine','Showa SFF-BP Forks','LCD Instrument Panel'], true, 'available', 4.7, 67),
  ('33333333-0000-0000-0000-000000000004', '11111111-0000-0000-0000-000000000002', 'Honda ADV 160', 'honda-adv-160', 2025, 'scooter', 149000, null, 20, '156.9cc', 'eSP+ single', 'CVT automatic', '8.1L', '133kg', '780mm', '105km/h', array['Pearl White','Matte Gray','Rally Red'], 'Adventure-styled scooter built for the city and beyond.', array['Smart Key System','Honda Selectable Torque Control','Large Storage'], false, 'available', 4.5, 143),
  ('33333333-0000-0000-0000-000000000005', '11111111-0000-0000-0000-000000000003', 'Kawasaki Z900', 'kawasaki-z900', 2025, 'naked', 649000, 679000, 4, '948cc', 'Liquid-cooled inline-4', '6-speed manual', '17L', '212kg', '820mm', '235km/h', array['Metallic Spark Black','Lime Green'], 'Aggressive Sugomi design with a torque-rich inline-4 for maximum street presence.', array['Assist & Slipper Clutch','TFT Color Display','Sugomi Design'], true, 'available', 4.9, 52),
  ('33333333-0000-0000-0000-000000000006', '11111111-0000-0000-0000-000000000003', 'Kawasaki Ninja 400', 'kawasaki-ninja-400', 2025, 'sport', 349000, null, 9, '399cc', 'Liquid-cooled parallel-twin', '6-speed manual', '14L', '168kg', '785mm', '175km/h', array['Lime Green','Metallic Black'], 'Class-leading power-to-weight ratio wrapped in aggressive Ninja styling.', array['Trellis Frame','Assist & Slipper Clutch','Lightweight Chassis'], false, 'available', 4.6, 98),
  ('33333333-0000-0000-0000-000000000007', '11111111-0000-0000-0000-000000000004', 'Ducati Monster', 'ducati-monster', 2025, 'naked', 799000, null, 3, '937cc', 'Liquid-cooled L-twin Testastretta', '6-speed manual', '14L', '166kg', '820mm', '215km/h', array['Ducati Red','Aviator Grey'], 'The icon reborn — lighter, sharper, and more thrilling than ever.', array['Testastretta 11° Engine','Full LED Lighting','Up/Down Quickshifter'], true, 'available', 4.9, 31),
  ('33333333-0000-0000-0000-000000000008', '11111111-0000-0000-0000-000000000005', 'KTM 390 Duke', 'ktm-390-duke', 2025, 'naked', 359000, null, 11, '399cc', 'Liquid-cooled single', '6-speed manual', '13.4L', '167kg', '820mm', '167km/h', array['Orange/Black'], 'Ready to Race in its purest form — sharp, light, and aggressive.', array['WP Suspension','TFT Display','Supermoto ABS'], false, 'available', 4.7, 76),
  ('33333333-0000-0000-0000-000000000009', '11111111-0000-0000-0000-000000000006', 'Royal Enfield Classic 350', 'royal-enfield-classic-350', 2025, 'cruiser', 259000, null, 13, '349cc', 'Air-oil-cooled single', '5-speed manual', '13L', '195kg', '805mm', '114km/h', array['Halcyon Black','Signals Dispatch Red'], 'Timeless silhouette, thumping single-cylinder soul.', array['J-Series Engine','Dual-Channel ABS','Classic Styling'], false, 'coming_soon', 4.5, 44),
  ('33333333-0000-0000-0000-000000000010', '11111111-0000-0000-0000-000000000005', 'KTM 250 Adventure', 'ktm-250-adventure', 2025, 'adventure', 379000, null, 5, '249cc', 'Liquid-cooled single', '6-speed manual', '14.5L', '173kg', '855mm', '138km/h', array['Orange'], 'Lightweight adventure-ready machine for gravel and highway alike.', array['WP APEX Suspension','Switchable ABS','Long-travel Suspension'], false, 'available', 4.4, 29);

-- MOTORCYCLE IMAGES
insert into motorcycle_images (motorcycle_id, image_url, is_primary, display_order) values
  ('33333333-0000-0000-0000-000000000001', 'https://placehold.co/1200x800/0d0d0d/00e0ff?text=Yamaha+MT-09', true, 0),
  ('33333333-0000-0000-0000-000000000001', 'https://placehold.co/1200x800/0d0d0d/00e0ff?text=MT-09+Side', false, 1),
  ('33333333-0000-0000-0000-000000000001', 'https://placehold.co/1200x800/0d0d0d/00e0ff?text=MT-09+Rear', false, 2),
  ('33333333-0000-0000-0000-000000000002', 'https://placehold.co/1200x800/0d0d0d/2563eb?text=Yamaha+R15+V4', true, 0),
  ('33333333-0000-0000-0000-000000000002', 'https://placehold.co/1200x800/0d0d0d/2563eb?text=R15+Side', false, 1),
  ('33333333-0000-0000-0000-000000000003', 'https://placehold.co/1200x800/0d0d0d/dc2626?text=Honda+CBR650R', true, 0),
  ('33333333-0000-0000-0000-000000000003', 'https://placehold.co/1200x800/0d0d0d/dc2626?text=CBR+Side', false, 1),
  ('33333333-0000-0000-0000-000000000004', 'https://placehold.co/1200x800/0d0d0d/f5f5f5?text=Honda+ADV+160', true, 0),
  ('33333333-0000-0000-0000-000000000005', 'https://placehold.co/1200x800/0d0d0d/84cc16?text=Kawasaki+Z900', true, 0),
  ('33333333-0000-0000-0000-000000000005', 'https://placehold.co/1200x800/0d0d0d/84cc16?text=Z900+Side', false, 1),
  ('33333333-0000-0000-0000-000000000006', 'https://placehold.co/1200x800/0d0d0d/84cc16?text=Ninja+400', true, 0),
  ('33333333-0000-0000-0000-000000000007', 'https://placehold.co/1200x800/0d0d0d/dc2626?text=Ducati+Monster', true, 0),
  ('33333333-0000-0000-0000-000000000007', 'https://placehold.co/1200x800/0d0d0d/dc2626?text=Monster+Side', false, 1),
  ('33333333-0000-0000-0000-000000000008', 'https://placehold.co/1200x800/0d0d0d/f97316?text=KTM+390+Duke', true, 0),
  ('33333333-0000-0000-0000-000000000009', 'https://placehold.co/1200x800/0d0d0d/f5f5f5?text=Classic+350', true, 0),
  ('33333333-0000-0000-0000-000000000010', 'https://placehold.co/1200x800/0d0d0d/f97316?text=250+Adventure', true, 0);

-- PRODUCTS
insert into products (id, category_id, brand_id, name, slug, sku, price, compare_price, stock_quantity, description, specs, is_featured, status, rating, review_count) values
  ('44444444-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001', null, 'AGV K6 Full-Face Helmet', 'agv-k6-full-face-helmet', 'HEL-AGV-K6', 18500, 21000, 12, 'Race-derived full-face helmet with superior aerodynamics and ventilation.', '{"material":"Carbon/Fiberglass","weight":"1400g","certification":"ECE 22.06"}', true, 'active', 4.8, 34),
  ('44444444-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000001', null, 'Shoei RF-1400 Helmet', 'shoei-rf-1400-helmet', 'HEL-SHOEI-RF14', 32000, null, 7, 'Premium comfort and quiet ride with advanced shell construction.', '{"material":"AIM+ Shell","weight":"1450g","certification":"ECE 22.06"}', true, 'active', 4.9, 21),
  ('44444444-0000-0000-0000-000000000003', '22222222-0000-0000-0000-000000000002', null, 'Alpinestars GP Plus R Jacket', 'alpinestars-gp-plus-r-jacket', 'JKT-ALP-GPR', 15900, null, 18, 'Leather racing jacket with CE-certified protectors.', '{"material":"Full-grain leather","protection":"CE Level 2"}', false, 'active', 4.6, 15),
  ('44444444-0000-0000-0000-000000000004', '22222222-0000-0000-0000-000000000002', null, 'Alpinestars SMX-6 v2 Boots', 'alpinestars-smx-6-v2-boots', 'BOOT-ALP-SMX6', 9800, null, 22, 'Sport riding boots with ankle protection and rigid heel cup.', '{"material":"Microfiber/TPU","protection":"CE certified"}', false, 'active', 4.5, 19),
  ('44444444-0000-0000-0000-000000000005', '22222222-0000-0000-0000-000000000002', null, 'Five RFX4 Riding Gloves', 'five-rfx4-riding-gloves', 'GLV-FIVE-RFX4', 4500, null, 30, 'Race-spec gloves with carbon knuckle protection.', '{"material":"Leather/Carbon","sizes":"S-XXL"}', false, 'active', 4.4, 27),
  ('44444444-0000-0000-0000-000000000006', '22222222-0000-0000-0000-000000000005', null, 'Akrapovic Slip-On Exhaust', 'akrapovic-slip-on-exhaust', 'EXH-AKRA-SO1', 28500, 32000, 6, 'Titanium slip-on muffler for improved sound and weight savings.', '{"material":"Titanium","weight_savings":"1.2kg"}', true, 'active', 4.9, 12),
  ('44444444-0000-0000-0000-000000000007', '22222222-0000-0000-0000-000000000006', null, 'Michelin Pilot Road 6 Tire', 'michelin-pilot-road-6-tire', 'TIRE-MICH-PR6', 6800, null, 40, 'Sport touring tire with excellent wet and dry grip.', '{"size":"180/55ZR17","type":"Sport Touring"}', false, 'active', 4.7, 41),
  ('44444444-0000-0000-0000-000000000008', '22222222-0000-0000-0000-000000000004', null, 'Givi Monokey Top Case 45L', 'givi-monokey-top-case-45l', 'BAG-GIVI-45L', 8900, null, 14, 'Weatherproof top case with 45L capacity, fits one full-face helmet.', '{"capacity":"45L","material":"Polymer"}', false, 'active', 4.5, 9),
  ('44444444-0000-0000-0000-000000000009', '22222222-0000-0000-0000-000000000003', null, 'DID 520 VX3 Chain Kit', 'did-520-vx3-chain-kit', 'CHN-DID-520VX3', 7200, null, 25, 'X-ring chain and sprocket kit for extended service life.', '{"chain":"520 X-Ring","includes":"Chain + 2 Sprockets"}', false, 'active', 4.6, 18),
  ('44444444-0000-0000-0000-000000000010', '22222222-0000-0000-0000-000000000004', null, 'Quad Lock Phone Mount', 'quad-lock-phone-mount', 'ACC-QL-MOUNT', 2900, null, 50, 'Secure vibration-resistant phone mount for handlebars.', '{"compatibility":"Universal handlebar","material":"Nylon composite"}', true, 'active', 4.8, 63);

insert into product_images (product_id, image_url, is_primary, display_order) values
  ('44444444-0000-0000-0000-000000000001', 'https://placehold.co/1000x1000/0d0d0d/00e0ff?text=AGV+K6', true, 0),
  ('44444444-0000-0000-0000-000000000002', 'https://placehold.co/1000x1000/0d0d0d/f5f5f5?text=Shoei+RF-1400', true, 0),
  ('44444444-0000-0000-0000-000000000003', 'https://placehold.co/1000x1000/0d0d0d/dc2626?text=Alpinestars+Jacket', true, 0),
  ('44444444-0000-0000-0000-000000000004', 'https://placehold.co/1000x1000/0d0d0d/1a1a1a?text=SMX-6+Boots', true, 0),
  ('44444444-0000-0000-0000-000000000005', 'https://placehold.co/1000x1000/0d0d0d/1a1a1a?text=RFX4+Gloves', true, 0),
  ('44444444-0000-0000-0000-000000000006', 'https://placehold.co/1000x1000/0d0d0d/9ca3af?text=Akrapovic+Exhaust', true, 0),
  ('44444444-0000-0000-0000-000000000007', 'https://placehold.co/1000x1000/0d0d0d/1a1a1a?text=Michelin+Tire', true, 0),
  ('44444444-0000-0000-0000-000000000008', 'https://placehold.co/1000x1000/0d0d0d/1a1a1a?text=Givi+Top+Case', true, 0),
  ('44444444-0000-0000-0000-000000000009', 'https://placehold.co/1000x1000/0d0d0d/1a1a1a?text=DID+Chain+Kit', true, 0),
  ('44444444-0000-0000-0000-000000000010', 'https://placehold.co/1000x1000/0d0d0d/00e0ff?text=Quad+Lock', true, 0);

-- MECHANICS
insert into mechanics (id, full_name, specialty, photo_url, bio, years_experience, is_active) values
  ('55555555-0000-0000-0000-000000000001', 'Marco Villanueva', 'Engine Overhaul & Diagnostics', 'https://placehold.co/400x400/1a1a1a/fff?text=Marco', 'Factory-trained technician specializing in Japanese inline engines.', 12, true),
  ('55555555-0000-0000-0000-000000000002', 'Rico Domingo', 'Suspension & Handling', 'https://placehold.co/400x400/1a1a1a/fff?text=Rico', 'Suspension tuning specialist for sport and adventure bikes.', 8, true),
  ('55555555-0000-0000-0000-000000000003', 'Ella Santos', 'Electrical & ECU Tuning', 'https://placehold.co/400x400/1a1a1a/fff?text=Ella', 'ECU remapping and electrical diagnostics expert.', 6, true),
  ('55555555-0000-0000-0000-000000000004', 'Jomari Cruz', 'General Maintenance & PMS', 'https://placehold.co/400x400/1a1a1a/fff?text=Jomari', 'Preventive maintenance specialist, fast and thorough.', 10, true);

-- BLOG POSTS
insert into blog_posts (id, title, slug, excerpt, content, cover_image_url, category, tags, status, published_at, view_count) values
  ('66666666-0000-0000-0000-000000000001', 'Top 5 Motorcycles for New Riders in 2025', 'top-5-motorcycles-new-riders-2025', 'Starting your riding journey? Here are our top picks for beginner-friendly motorcycles this year.', 'Full article content goes here. Choosing your first motorcycle can be overwhelming given how many options exist today. In this guide we break down engine size, weight, seat height, and rider aids that matter most for new riders...', 'https://placehold.co/1200x600/0d0d0d/00e0ff?text=Beginner+Motorcycles', 'Buying Guide', array['beginner','guide','2025'], 'published', now() - interval '10 days', 842),
  ('66666666-0000-0000-0000-000000000002', 'How Often Should You Change Your Motorcycle Oil?', 'how-often-change-motorcycle-oil', 'A practical maintenance guide to keep your engine running smoothly for years.', 'Full article content goes here. Oil change intervals depend on engine type, riding conditions, and oil quality. We cover manufacturer recommendations and warning signs that your oil needs changing sooner...', 'https://placehold.co/1200x600/0d0d0d/f97316?text=Oil+Change+Guide', 'Maintenance', array['maintenance','tips'], 'published', now() - interval '20 days', 651),
  ('66666666-0000-0000-0000-000000000003', 'Ode Works Opens New Service Center in Quezon City', 'ode-works-new-service-center-qc', 'We are excited to announce the opening of our newest full-service location.', 'Full article content goes here. Our new Galas, Quezon City branch features an expanded showroom, 8 service bays, and a dedicated parts counter...', 'https://placehold.co/1200x600/0d0d0d/84cc16?text=New+Branch', 'News', array['announcement','company-news'], 'published', now() - interval '3 days', 312),
  ('66666666-0000-0000-0000-000000000004', 'Riding Gear Checklist Before Your Next Long Ride', 'riding-gear-checklist-long-ride', 'Draft: what to pack and wear before a multi-day motorcycle trip.', 'Draft content in progress...', 'https://placehold.co/1200x600/0d0d0d/6366f1?text=Riding+Gear', 'Guides', array['touring','gear'], 'draft', null, 0);

-- BANNERS (hero slideshow)
insert into banners (title, subtitle, image_url, link_url, button_text, placement, display_order, is_active) values
  ('Ride Beyond Limits', 'Discover the 2025 lineup of Yamaha, Honda, Kawasaki, Ducati, KTM and Royal Enfield.', 'https://placehold.co/1920x900/0d0d0d/00e0ff?text=Ride+Beyond+Limits', 'motorcycles.html', 'Shop Motorcycles', 'hero', 0, true),
  ('Gear Up For The Road Ahead', 'Premium helmets, jackets, and accessories for every rider.', 'https://placehold.co/1920x900/0d0d0d/f97316?text=Gear+Up', 'parts.html', 'Shop Gear', 'hero', 1, true),
  ('Book Your Service Today', 'Certified mechanics. Genuine parts. Fast turnaround.', 'https://placehold.co/1920x900/0d0d0d/84cc16?text=Book+Service', 'booking.html', 'Book Now', 'hero', 2, true);

-- PROMOTIONS
insert into promotions (title, code, description, discount_type, discount_value, applies_to, starts_at, ends_at, is_active) values
  ('Rainy Season Gear Sale', 'RAINRIDE15', '15% off all riding gear and accessories', 'percent', 15, '{"scope":"category","category_slug":"riding-gear"}', now() - interval '5 days', now() + interval '25 days', true),
  ('First Ride Discount', 'FIRSTRIDE500', '₱500 off your first purchase', 'fixed', 500, '{"scope":"all"}', now() - interval '30 days', now() + interval '60 days', true);

-- SETTINGS
insert into settings (key, value) values
  ('store_info', '{"name":"Ode Works","address":"Galas, Quezon City, Philippines","phone":"+63 917 000 0000","email":"hello@odeworks.ph","hours":"Mon-Sat 9:00 AM - 6:00 PM"}'),
  ('social_links', '{"facebook":"https://facebook.com/odeworks","instagram":"https://instagram.com/odeworks","tiktok":"https://tiktok.com/@odeworks","youtube":"https://youtube.com/@odeworks"}'),
  ('map_embed', '{"lat":14.6255,"lng":121.0270,"query":"Galas, Quezon City, Philippines"}'),
  ('financing_defaults', '{"min_down_payment_percent":20,"interest_rate_annual":12,"terms_months":[12,24,36,48]}');
