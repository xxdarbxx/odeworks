-- ============================================================================
-- ODE WORKS - Row Level Security Policies
-- Run AFTER schema.sql
-- ============================================================================

-- Helper: is the current user an admin/staff?
create or replace function is_staff()
returns boolean as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role in ('admin', 'staff')
  );
$$ language sql security definer stable;

-- ============================================================================
-- PROFILES
-- ============================================================================
alter table profiles enable row level security;

create policy "profiles_select_own_or_staff" on profiles
  for select using (auth.uid() = id or is_staff());

create policy "profiles_update_own_or_staff" on profiles
  for update using (auth.uid() = id or is_staff());

create policy "profiles_insert_own" on profiles
  for insert with check (auth.uid() = id);

create policy "profiles_delete_staff" on profiles
  for delete using (is_staff());

-- ============================================================================
-- BRANDS
-- ============================================================================
alter table brands enable row level security;

create policy "brands_public_read" on brands for select using (is_active = true or is_staff());
create policy "brands_staff_write" on brands for insert with check (is_staff());
create policy "brands_staff_update" on brands for update using (is_staff());
create policy "brands_staff_delete" on brands for delete using (is_staff());

-- ============================================================================
-- PRODUCT_CATEGORIES
-- ============================================================================
alter table product_categories enable row level security;

create policy "categories_public_read" on product_categories for select using (is_active = true or is_staff());
create policy "categories_staff_write" on product_categories for insert with check (is_staff());
create policy "categories_staff_update" on product_categories for update using (is_staff());
create policy "categories_staff_delete" on product_categories for delete using (is_staff());

-- ============================================================================
-- MOTORCYCLES + IMAGES
-- ============================================================================
alter table motorcycles enable row level security;

create policy "motorcycles_public_read" on motorcycles for select using (true);
create policy "motorcycles_staff_write" on motorcycles for insert with check (is_staff());
create policy "motorcycles_staff_update" on motorcycles for update using (is_staff());
create policy "motorcycles_staff_delete" on motorcycles for delete using (is_staff());

alter table motorcycle_images enable row level security;

create policy "moto_images_public_read" on motorcycle_images for select using (true);
create policy "moto_images_staff_write" on motorcycle_images for insert with check (is_staff());
create policy "moto_images_staff_update" on motorcycle_images for update using (is_staff());
create policy "moto_images_staff_delete" on motorcycle_images for delete using (is_staff());

-- ============================================================================
-- PRODUCTS + IMAGES
-- ============================================================================
alter table products enable row level security;

create policy "products_public_read" on products for select using (true);
create policy "products_staff_write" on products for insert with check (is_staff());
create policy "products_staff_update" on products for update using (is_staff());
create policy "products_staff_delete" on products for delete using (is_staff());

alter table product_images enable row level security;

create policy "product_images_public_read" on product_images for select using (true);
create policy "product_images_staff_write" on product_images for insert with check (is_staff());
create policy "product_images_staff_update" on product_images for update using (is_staff());
create policy "product_images_staff_delete" on product_images for delete using (is_staff());

-- ============================================================================
-- REVIEWS
-- ============================================================================
alter table reviews enable row level security;

create policy "reviews_public_read" on reviews for select using (true);
create policy "reviews_own_insert" on reviews for insert with check (auth.uid() = user_id);
create policy "reviews_own_update" on reviews for update using (auth.uid() = user_id or is_staff());
create policy "reviews_own_or_staff_delete" on reviews for delete using (auth.uid() = user_id or is_staff());

-- ============================================================================
-- WISHLIST (user-scoped)
-- ============================================================================
alter table wishlist enable row level security;

create policy "wishlist_own_select" on wishlist for select using (auth.uid() = user_id);
create policy "wishlist_own_insert" on wishlist for insert with check (auth.uid() = user_id);
create policy "wishlist_own_delete" on wishlist for delete using (auth.uid() = user_id);

-- ============================================================================
-- CART (user-scoped)
-- ============================================================================
alter table cart enable row level security;

create policy "cart_own_select" on cart for select using (auth.uid() = user_id);
create policy "cart_own_insert" on cart for insert with check (auth.uid() = user_id);
create policy "cart_own_update" on cart for update using (auth.uid() = user_id);
create policy "cart_own_delete" on cart for delete using (auth.uid() = user_id);

-- ============================================================================
-- ORDERS + ORDER_ITEMS
-- ============================================================================
alter table orders enable row level security;

create policy "orders_own_or_staff_select" on orders for select using (auth.uid() = user_id or is_staff());
create policy "orders_own_insert" on orders for insert with check (auth.uid() = user_id);
create policy "orders_staff_update" on orders for update using (is_staff());
create policy "orders_staff_delete" on orders for delete using (is_staff());

alter table order_items enable row level security;

create policy "order_items_own_or_staff_select" on order_items for select using (
  exists (select 1 from orders o where o.id = order_id and (o.user_id = auth.uid() or is_staff()))
);
create policy "order_items_own_insert" on order_items for insert with check (
  exists (select 1 from orders o where o.id = order_id and o.user_id = auth.uid())
);
create policy "order_items_staff_update" on order_items for update using (is_staff());
create policy "order_items_staff_delete" on order_items for delete using (is_staff());

-- ============================================================================
-- MECHANICS
-- ============================================================================
alter table mechanics enable row level security;

create policy "mechanics_public_read" on mechanics for select using (is_active = true or is_staff());
create policy "mechanics_staff_write" on mechanics for insert with check (is_staff());
create policy "mechanics_staff_update" on mechanics for update using (is_staff());
create policy "mechanics_staff_delete" on mechanics for delete using (is_staff());

-- ============================================================================
-- APPOINTMENTS
-- ============================================================================
alter table appointments enable row level security;

create policy "appointments_own_or_staff_select" on appointments for select using (auth.uid() = user_id or is_staff());
create policy "appointments_own_insert" on appointments for insert with check (auth.uid() = user_id);
create policy "appointments_own_or_staff_update" on appointments for update using (auth.uid() = user_id or is_staff());
create policy "appointments_staff_delete" on appointments for delete using (is_staff());

-- ============================================================================
-- BLOG POSTS
-- ============================================================================
alter table blog_posts enable row level security;

create policy "blog_public_read" on blog_posts for select using (status = 'published' or is_staff());
create policy "blog_staff_write" on blog_posts for insert with check (is_staff());
create policy "blog_staff_update" on blog_posts for update using (is_staff());
create policy "blog_staff_delete" on blog_posts for delete using (is_staff());

-- ============================================================================
-- BANNERS
-- ============================================================================
alter table banners enable row level security;

create policy "banners_public_read" on banners for select using (is_active = true or is_staff());
create policy "banners_staff_write" on banners for insert with check (is_staff());
create policy "banners_staff_update" on banners for update using (is_staff());
create policy "banners_staff_delete" on banners for delete using (is_staff());

-- ============================================================================
-- PROMOTIONS
-- ============================================================================
alter table promotions enable row level security;

create policy "promotions_public_read" on promotions for select using (is_active = true or is_staff());
create policy "promotions_staff_write" on promotions for insert with check (is_staff());
create policy "promotions_staff_update" on promotions for update using (is_staff());
create policy "promotions_staff_delete" on promotions for delete using (is_staff());

-- ============================================================================
-- SETTINGS
-- ============================================================================
alter table settings enable row level security;

create policy "settings_public_read" on settings for select using (true);
create policy "settings_staff_write" on settings for insert with check (is_staff());
create policy "settings_staff_update" on settings for update using (is_staff());
create policy "settings_staff_delete" on settings for delete using (is_staff());
