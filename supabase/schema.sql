-- ============================================================================
-- ODE WORKS - Motorcycle Shop Database Schema
-- Run this file in the Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- Order: schema.sql -> rls_policies.sql -> seed.sql
-- ============================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================================
-- ENUM TYPES
-- ============================================================================
create type user_role as enum ('customer', 'staff', 'admin');
create type item_type as enum ('motorcycle', 'product');
create type order_status as enum ('pending', 'processing', 'shipped', 'delivered', 'cancelled');
create type payment_status as enum ('pending', 'paid', 'failed', 'refunded');
create type payment_method as enum ('cod', 'bank_transfer', 'gcash');
create type appointment_status as enum ('pending', 'confirmed', 'completed', 'cancelled');
create type motorcycle_status as enum ('available', 'sold_out', 'coming_soon');
create type post_status as enum ('draft', 'published');
create type discount_type as enum ('percent', 'fixed');
create type banner_placement as enum ('hero', 'promo', 'announcement');

-- ============================================================================
-- PROFILES (extends auth.users)
-- ============================================================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  address text,
  city text,
  avatar_url text,
  role user_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_profiles_role on profiles(role);

-- ============================================================================
-- BRANDS
-- ============================================================================
create table brands (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  slug text not null unique,
  logo_url text,
  description text,
  country text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- PRODUCT CATEGORIES (self-referencing for subcategories)
-- ============================================================================
create table product_categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  parent_id uuid references product_categories(id) on delete set null,
  description text,
  image_url text,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index idx_categories_parent on product_categories(parent_id);

-- ============================================================================
-- MOTORCYCLES
-- ============================================================================
create table motorcycles (
  id uuid primary key default uuid_generate_v4(),
  brand_id uuid references brands(id) on delete set null,
  name text not null,
  slug text not null unique,
  model_year int not null,
  category text not null, -- sport, cruiser, scooter, adventure, naked, touring, underbone
  price numeric(12,2) not null,
  compare_price numeric(12,2),
  stock_quantity int not null default 0,
  engine_displacement text,
  engine_type text,
  transmission text,
  fuel_capacity text,
  weight text,
  seat_height text,
  top_speed text,
  color_options text[] default '{}',
  description text,
  highlights text[] default '{}',
  is_featured boolean not null default false,
  status motorcycle_status not null default 'available',
  rating numeric(2,1) not null default 0,
  review_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_motorcycles_brand on motorcycles(brand_id);
create index idx_motorcycles_category on motorcycles(category);
create index idx_motorcycles_status on motorcycles(status);
create index idx_motorcycles_featured on motorcycles(is_featured);
create index idx_motorcycles_slug on motorcycles(slug);

create table motorcycle_images (
  id uuid primary key default uuid_generate_v4(),
  motorcycle_id uuid not null references motorcycles(id) on delete cascade,
  image_url text not null,
  is_primary boolean not null default false,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);
create index idx_moto_images_moto on motorcycle_images(motorcycle_id);

-- ============================================================================
-- PRODUCTS (Parts & Accessories)
-- ============================================================================
create table products (
  id uuid primary key default uuid_generate_v4(),
  category_id uuid references product_categories(id) on delete set null,
  brand_id uuid references brands(id) on delete set null,
  name text not null,
  slug text not null unique,
  sku text unique,
  price numeric(12,2) not null,
  compare_price numeric(12,2),
  stock_quantity int not null default 0,
  description text,
  specs jsonb default '{}',
  is_featured boolean not null default false,
  status text not null default 'active', -- active, inactive, out_of_stock
  rating numeric(2,1) not null default 0,
  review_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_products_category on products(category_id);
create index idx_products_brand on products(brand_id);
create index idx_products_featured on products(is_featured);
create index idx_products_slug on products(slug);

create table product_images (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references products(id) on delete cascade,
  image_url text not null,
  is_primary boolean not null default false,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);
create index idx_product_images_product on product_images(product_id);

-- ============================================================================
-- REVIEWS (polymorphic: motorcycle or product)
-- ============================================================================
create table reviews (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  item_type item_type not null,
  motorcycle_id uuid references motorcycles(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  title text,
  comment text,
  is_verified_purchase boolean not null default false,
  created_at timestamptz not null default now(),
  constraint reviews_target_check check (
    (item_type = 'motorcycle' and motorcycle_id is not null and product_id is null) or
    (item_type = 'product' and product_id is not null and motorcycle_id is null)
  )
);
create index idx_reviews_motorcycle on reviews(motorcycle_id);
create index idx_reviews_product on reviews(product_id);
create index idx_reviews_user on reviews(user_id);

-- ============================================================================
-- WISHLIST
-- ============================================================================
create table wishlist (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  item_type item_type not null,
  motorcycle_id uuid references motorcycles(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, motorcycle_id, product_id)
);
create index idx_wishlist_user on wishlist(user_id);

-- ============================================================================
-- CART
-- ============================================================================
create table cart (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  item_type item_type not null,
  motorcycle_id uuid references motorcycles(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  quantity int not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  unique (user_id, motorcycle_id, product_id)
);
create index idx_cart_user on cart(user_id);

-- ============================================================================
-- ORDERS
-- ============================================================================
create table orders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  order_number text not null unique,
  status order_status not null default 'pending',
  payment_method payment_method not null default 'cod',
  payment_status payment_status not null default 'pending',
  payment_reference text,
  subtotal numeric(12,2) not null,
  shipping_fee numeric(12,2) not null default 0,
  discount_amount numeric(12,2) not null default 0,
  total numeric(12,2) not null,
  shipping_address jsonb not null,
  contact_phone text not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_orders_user on orders(user_id);
create index idx_orders_status on orders(status);
create index idx_orders_created on orders(created_at desc);

create table order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  item_type item_type not null,
  motorcycle_id uuid references motorcycles(id) on delete set null,
  product_id uuid references products(id) on delete set null,
  item_name text not null,
  item_image text,
  unit_price numeric(12,2) not null,
  quantity int not null check (quantity > 0),
  subtotal numeric(12,2) not null
);
create index idx_order_items_order on order_items(order_id);

-- ============================================================================
-- MECHANICS
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
-- APPOINTMENTS
-- ============================================================================
create table appointments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  mechanic_id uuid references mechanics(id) on delete set null,
  service_type text not null,
  motorcycle_info text,
  appointment_date date not null,
  appointment_time time not null,
  status appointment_status not null default 'pending',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_appointments_user on appointments(user_id);
create index idx_appointments_mechanic on appointments(mechanic_id);
create index idx_appointments_date on appointments(appointment_date);
create index idx_appointments_status on appointments(status);

-- ============================================================================
-- BLOG POSTS
-- ============================================================================
create table blog_posts (
  id uuid primary key default uuid_generate_v4(),
  author_id uuid references profiles(id) on delete set null,
  title text not null,
  slug text not null unique,
  excerpt text,
  content text not null,
  cover_image_url text,
  category text,
  tags text[] default '{}',
  status post_status not null default 'draft',
  published_at timestamptz,
  view_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_blog_status on blog_posts(status);
create index idx_blog_slug on blog_posts(slug);
create index idx_blog_published on blog_posts(published_at desc);

-- ============================================================================
-- BANNERS (CMS - hero slides / promos)
-- ============================================================================
create table banners (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  subtitle text,
  image_url text not null,
  link_url text,
  button_text text,
  placement banner_placement not null default 'hero',
  display_order int not null default 0,
  is_active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now()
);
create index idx_banners_placement on banners(placement);

-- ============================================================================
-- PROMOTIONS
-- ============================================================================
create table promotions (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  code text unique,
  description text,
  discount_type discount_type not null default 'percent',
  discount_value numeric(12,2) not null,
  applies_to jsonb default '{"scope":"all"}',
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index idx_promotions_code on promotions(code);
create index idx_promotions_active on promotions(is_active);

-- ============================================================================
-- SETTINGS (site-wide CMS key/value store)
-- ============================================================================
create table settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- UPDATED_AT TRIGGER HELPER
-- ============================================================================
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_profiles_updated before update on profiles for each row execute function set_updated_at();
create trigger trg_motorcycles_updated before update on motorcycles for each row execute function set_updated_at();
create trigger trg_products_updated before update on products for each row execute function set_updated_at();
create trigger trg_orders_updated before update on orders for each row execute function set_updated_at();
create trigger trg_appointments_updated before update on appointments for each row execute function set_updated_at();
create trigger trg_blog_updated before update on blog_posts for each row execute function set_updated_at();

-- ============================================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================================
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    'customer'
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
