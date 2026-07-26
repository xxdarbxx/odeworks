-- ============================================================================
-- ODE WORKS - Future database schema (OPTIONAL, not required to run the site)
--
-- The site works today entirely from assets/js/data.js (sample content) and
-- assets/js/api.js (localStorage-backed booking/contact submission). This
-- file is here so that when you're ready to add a real backend, the shape
-- of the data already matches what the front-end expects — swap the
-- functions in api.js to call Supabase instead of localStorage, and point
-- data.js's consumers at these tables instead.
--
-- Run in the Supabase SQL Editor (Dashboard > SQL Editor > New query).
-- ============================================================================

create extension if not exists "uuid-ossp";

create type appointment_status as enum ('pending', 'confirmed', 'completed', 'cancelled');
create type post_status as enum ('draft', 'published');

-- ============================================================================
-- SERVICES (mirrors assets/js/data.js -> SERVICES)
-- ============================================================================
create table services (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  name text not null,
  icon text,                    -- Font Awesome class, e.g. 'fa-solid fa-gears'
  category text not null,       -- Diagnostics, Maintenance, Repair, Cosmetic
  short_description text,
  description text,
  price_from numeric(12,2) not null,
  is_active boolean not null default true,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- MECHANICS (mirrors data.js -> MECHANICS)
-- ============================================================================
create table mechanics (
  id uuid primary key default uuid_generate_v4(),
  full_name text not null,
  specialty text,
  photo_url text,
  bio text,
  years_experience int default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- APPOINTMENTS (mirrors api.js -> submitBooking payload)
-- ============================================================================
create table appointments (
  id uuid primary key default uuid_generate_v4(),
  service_id uuid references services(id) on delete set null,
  service_name text not null,           -- snapshot at time of booking
  mechanic_id uuid references mechanics(id) on delete set null,
  mechanic_name text,
  motorcycle_info text,
  appointment_date date not null,
  appointment_time time not null,
  full_name text not null,
  phone text not null,
  email text not null,
  notes text,
  status appointment_status not null default 'pending',
  created_at timestamptz not null default now()
);
create index idx_appointments_date on appointments(appointment_date);
create index idx_appointments_status on appointments(status);

-- ============================================================================
-- TESTIMONIALS (mirrors data.js -> TESTIMONIALS)
-- ============================================================================
create table testimonials (
  id uuid primary key default uuid_generate_v4(),
  customer_name text not null,
  location text,
  rating int not null check (rating between 1 and 5),
  quote text not null,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- GALLERY_IMAGES (mirrors data.js -> GALLERY, before/after pairs)
-- ============================================================================
create table gallery_images (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  category text not null,
  before_image_url text not null,
  after_image_url text not null,
  display_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- BLOG_POSTS (mirrors data.js -> BLOG_POSTS)
-- ============================================================================
create table blog_posts (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text not null,
  cover_image_url text,
  category text,
  tags text[] default '{}',
  status post_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now()
);
create index idx_blog_status on blog_posts(status);

-- ============================================================================
-- CONTACT_MESSAGES (mirrors api.js -> submitContactMessage payload)
-- ============================================================================
create table contact_messages (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- ROW LEVEL SECURITY (basic starting point)
-- Public content (services, mechanics, testimonials, gallery, published blog
-- posts) is readable by anyone. Appointments and contact messages are
-- write-only from the public site — reading them back requires a service
-- role key (i.e. only from a future admin tool, never the public site).
-- ============================================================================
alter table services enable row level security;
alter table mechanics enable row level security;
alter table testimonials enable row level security;
alter table gallery_images enable row level security;
alter table blog_posts enable row level security;
alter table appointments enable row level security;
alter table contact_messages enable row level security;

create policy "services_public_read" on services for select using (is_active = true);
create policy "mechanics_public_read" on mechanics for select using (is_active = true);
create policy "testimonials_public_read" on testimonials for select using (is_published = true);
create policy "gallery_public_read" on gallery_images for select using (is_published = true);
create policy "blog_public_read" on blog_posts for select using (status = 'published');

create policy "appointments_public_insert" on appointments for insert with check (true);
create policy "contact_messages_public_insert" on contact_messages for insert with check (true);
