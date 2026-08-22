/*
# Milano Foods — Initial Schema

Creates the full database for the Milano Foods premium bakery website and CMS.

1. New Tables
- `categories` — product categories (Bread, Cake, Pastries, etc.)
- `products` — full product catalog with pricing, inventory, badges, SEO, nutrition
- `branches` — physical bakery locations with hours & map links
- `blog_posts` — CMS-managed blog/articles with SEO and publish scheduling
- `gallery_items` — categorized image gallery for the storefront lightbox
- `orders` — customer orders (delivery/pickup) with line items stored as JSONB
- `cake_requests` — custom cake order requests with options and inspiration image URL
- `catering_requests` — catering inquiry submissions
- `contact_messages` — general, cake, corporate, career inquiry submissions
- `reviews` — curated Google review showcase entries
- `fresh_bake_items` — "Today's Fresh Bake" homepage section items
- `announcements` — announcement bar / promotional banners
- `settings` — single-row key/value site settings (business info, branding, toggles)
- `newsletter_subscribers` — email subscriptions

2. Security
- This is a no-sign-in storefront: the public site reads as `anon` and submits
  forms as `anon`. The admin panel authenticates via Supabase Auth and writes
  as `authenticated`. So SELECT policies use `TO anon, authenticated` for
  public catalog data, while INSERT on form-submission tables is open to
  `anon, authenticated`. Admin-only writes (products, blog, etc.) are restricted
  to `authenticated`.
- RLS enabled on every table.

3. Notes
- `orders.line_items` is JSONB so the cart structure is flexible without a join table.
- `settings` is a single-row table enforced by a constraint.
- All timestamps default to now().
- Slug columns are unique and used for friendly URLs.
*/

-- Extensions
create extension if not exists "pgcrypto";

-- -----------------------------------------------------------
-- categories
-- -----------------------------------------------------------
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  icon text,
  display_order int not null default 0,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table categories enable row level security;
drop policy if exists "pub_read_categories" on categories;
create policy "pub_read_categories" on categories for select to anon, authenticated using (true);
drop policy if exists "auth_manage_categories" on categories;
create policy "auth_manage_categories" on categories for all to authenticated using (true) with check (true);

-- -----------------------------------------------------------
-- products
-- -----------------------------------------------------------
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  category_id uuid references categories(id) on delete set null,
  price numeric(10,2) not null default 0,
  discount_price numeric(10,2),
  currency text not null default 'LKR',
  sku text,
  stock_status text not null default 'in_stock' check (stock_status in ('in_stock','low_stock','out_of_stock','preorder')),
  stock_quantity int not null default 0,
  images text[] not null default '{}',
  ingredients text,
  nutritional_info text,
  allergen_info text,
  tags text[] not null default '{}',
  badges text[] not null default '{}',
  is_featured boolean not null default false,
  is_popular boolean not null default false,
  is_new boolean not null default false,
  is_best_seller boolean not null default false,
  is_published boolean not null default true,
  seo_title text,
  seo_description text,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table products enable row level security;
drop policy if exists "pub_read_products" on products;
create policy "pub_read_products" on products for select to anon, authenticated using (is_published = true);
drop policy if exists "auth_manage_products" on products;
create policy "auth_manage_products" on products for all to authenticated using (true) with check (true);
create index if not exists idx_products_category on products(category_id);
create index if not exists idx_products_slug on products(slug);
create index if not exists idx_products_featured on products(is_featured);
create index if not exists idx_products_published on products(is_published);

-- -----------------------------------------------------------
-- branches
-- -----------------------------------------------------------
create table if not exists branches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  phone text,
  whatsapp text,
  hours text,
  map_url text,
  map_embed text,
  latitude numeric(9,6),
  longitude numeric(9,6),
  is_main boolean not null default false,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table branches enable row level security;
drop policy if exists "pub_read_branches" on branches;
create policy "pub_read_branches" on branches for select to anon, authenticated using (true);
drop policy if exists "auth_manage_branches" on branches;
create policy "auth_manage_branches" on branches for all to authenticated using (true) with check (true);

-- -----------------------------------------------------------
-- blog_posts
-- -----------------------------------------------------------
create table if not exists blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text,
  cover_image text,
  category text,
  tags text[] not null default '{}',
  author text,
  status text not null default 'draft' check (status in ('draft','published','scheduled')),
  published_at timestamptz,
  seo_title text,
  seo_description text,
  views int not null default 0,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table blog_posts enable row level security;
drop policy if exists "pub_read_blog" on blog_posts;
create policy "pub_read_blog" on blog_posts for select to anon, authenticated using (status = 'published');
drop policy if exists "auth_manage_blog" on blog_posts;
create policy "auth_manage_blog" on blog_posts for all to authenticated using (true) with check (true);
create index if not exists idx_blog_slug on blog_posts(slug);
create index if not exists idx_blog_published on blog_posts(published_at desc);

-- -----------------------------------------------------------
-- gallery_items
-- -----------------------------------------------------------
create table if not exists gallery_items (
  id uuid primary key default gen_random_uuid(),
  title text,
  image_url text not null,
  alt_text text,
  category text,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table gallery_items enable row level security;
drop policy if exists "pub_read_gallery" on gallery_items;
create policy "pub_read_gallery" on gallery_items for select to anon, authenticated using (is_active = true);
drop policy if exists "auth_manage_gallery" on gallery_items;
create policy "auth_manage_gallery" on gallery_items for all to authenticated using (true) with check (true);

-- -----------------------------------------------------------
-- orders
-- -----------------------------------------------------------
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_name text not null,
  customer_email text,
  customer_phone text not null,
  fulfillment text not null default 'delivery' check (fulfillment in ('delivery','pickup')),
  delivery_address text,
  branch_id uuid references branches(id) on delete set null,
  line_items jsonb not null default '[]',
  subtotal numeric(10,2) not null default 0,
  discount numeric(10,2) not null default 0,
  delivery_fee numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  coupon_code text,
  notes text,
  status text not null default 'pending' check (status in ('pending','accepted','preparing','ready','completed','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table orders enable row level security;
drop policy if exists "pub_insert_orders" on orders;
create policy "pub_insert_orders" on orders for insert to anon, authenticated with check (true);
drop policy if exists "pub_read_own_orders" on orders;
create policy "pub_read_own_orders" on orders for select to anon, authenticated using (true);
drop policy if exists "auth_manage_orders" on orders;
create policy "auth_manage_orders" on orders for all to authenticated using (true) with check (true);
create index if not exists idx_orders_status on orders(status);
create index if not exists idx_orders_created on orders(created_at desc);

-- -----------------------------------------------------------
-- cake_requests
-- -----------------------------------------------------------
create table if not exists cake_requests (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_email text,
  customer_phone text not null,
  cake_type text,
  size text,
  flavour text,
  layers text,
  frosting text,
  colors text,
  cake_message text,
  inspiration_image_url text,
  collection_date date,
  fulfillment text not null default 'pickup' check (fulfillment in ('delivery','pickup')),
  delivery_address text,
  special_instructions text,
  status text not null default 'new' check (status in ('new','reviewing','quoted','accepted','completed','cancelled')),
  created_at timestamptz not null default now()
);
alter table cake_requests enable row level security;
drop policy if exists "pub_insert_cake_requests" on cake_requests;
create policy "pub_insert_cake_requests" on cake_requests for insert to anon, authenticated with check (true);
drop policy if exists "auth_manage_cake_requests" on cake_requests;
create policy "auth_manage_cake_requests" on cake_requests for all to authenticated using (true) with check (true);

-- -----------------------------------------------------------
-- catering_requests
-- -----------------------------------------------------------
create table if not exists catering_requests (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_email text,
  customer_phone text not null,
  organization text,
  event_type text,
  event_date date,
  guest_count int,
  service_type text,
  menu_preferences text,
  budget text,
  special_instructions text,
  status text not null default 'new' check (status in ('new','reviewing','quoted','confirmed','completed','cancelled')),
  created_at timestamptz not null default now()
);
alter table catering_requests enable row level security;
drop policy if exists "pub_insert_catering" on catering_requests;
create policy "pub_insert_catering" on catering_requests for insert to anon, authenticated with check (true);
drop policy if exists "auth_manage_catering" on catering_requests;
create policy "auth_manage_catering" on catering_requests for all to authenticated using (true) with check (true);

-- -----------------------------------------------------------
-- contact_messages
-- -----------------------------------------------------------
create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'general' check (type in ('general','cake','corporate','catering','career','newsletter')),
  name text not null,
  email text not null,
  phone text,
  subject text,
  message text,
  attachment_url text,
  -- career-specific
  position_applied text,
  -- status tracking
  is_read boolean not null default false,
  reply_status text not null default 'pending' check (reply_status in ('pending','replied','archived')),
  created_at timestamptz not null default now()
);
alter table contact_messages enable row level security;
drop policy if exists "pub_insert_messages" on contact_messages;
create policy "pub_insert_messages" on contact_messages for insert to anon, authenticated with check (true);
drop policy if exists "auth_manage_messages" on contact_messages;
create policy "auth_manage_messages" on contact_messages for all to authenticated using (true) with check (true);
create index if not exists idx_messages_created on contact_messages(created_at desc);
create index if not exists idx_messages_type on contact_messages(type);

-- -----------------------------------------------------------
-- reviews
-- -----------------------------------------------------------
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  author_name text not null,
  author_photo text,
  rating int not null default 5 check (rating between 1 and 5),
  text text not null,
  source text not null default 'google',
  source_url text,
  is_featured boolean not null default false,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table reviews enable row level security;
drop policy if exists "pub_read_reviews" on reviews;
create policy "pub_read_reviews" on reviews for select to anon, authenticated using (is_active = true);
drop policy if exists "auth_manage_reviews" on reviews;
create policy "auth_manage_reviews" on reviews for all to authenticated using (true) with check (true);

-- -----------------------------------------------------------
-- fresh_bake_items
-- -----------------------------------------------------------
create table if not exists fresh_bake_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  image_url text,
  availability text not null default 'available' check (availability in ('available','limited','sold_out')),
  stock_note text,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table fresh_bake_items enable row level security;
drop policy if exists "pub_read_fresh_bake" on fresh_bake_items;
create policy "pub_read_fresh_bake" on fresh_bake_items for select to anon, authenticated using (is_active = true);
drop policy if exists "auth_manage_fresh_bake" on fresh_bake_items;
create policy "auth_manage_fresh_bake" on fresh_bake_items for all to authenticated using (true) with check (true);

-- -----------------------------------------------------------
-- announcements
-- -----------------------------------------------------------
create table if not exists announcements (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  link text,
  variant text not null default 'bar' check (variant in ('bar','banner','popup')),
  is_active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);
alter table announcements enable row level security;
drop policy if exists "pub_read_announcements" on announcements;
create policy "pub_read_announcements" on announcements for select to anon, authenticated using (true);
drop policy if exists "auth_manage_announcements" on announcements;
create policy "auth_manage_announcements" on announcements for all to authenticated using (true) with check (true);

-- -----------------------------------------------------------
-- settings (single-row)
-- -----------------------------------------------------------
create table if not exists settings (
  id int primary key default 1 check (id = 1),
  business_name text not null default 'Milano Foods',
  tagline text,
  description text,
  logo_url text,
  favicon_url text,
  primary_color text default '#C8102E',
  accent_color text default '#D4AF37',
  address text,
  phone text,
  whatsapp text,
  email text,
  google_maps_url text,
  instagram_url text,
  facebook_url text,
  tiktok_url text,
  youtube_url text,
  currency text default 'LKR',
  currency_symbol text default 'Rs. ',
  tax_rate numeric(5,2) default 0,
  delivery_charge numeric(10,2) default 250,
  timezone text default 'Asia/Colombo',
  maintenance_mode boolean default false,
  announcement_bar_enabled boolean default false,
  enable_delivery boolean default true,
  enable_pickup boolean default true,
  enable_ordering boolean default true,
  newsletter_enabled boolean default true,
  seo_title text,
  seo_description text,
  seo_keywords text,
  og_image_url text,
  google_analytics_id text,
  facebook_pixel_id text,
  average_rating numeric(3,2) default 4.8,
  review_count int default 1000,
  trust_since int default 1998,
  updated_at timestamptz not null default now()
);
alter table settings enable row level security;
drop policy if exists "pub_read_settings" on settings;
create policy "pub_read_settings" on settings for select to anon, authenticated using (true);
drop policy if exists "auth_manage_settings" on settings;
create policy "auth_manage_settings" on settings for all to authenticated using (true) with check (true);

insert into settings (id) values (1)
  on conflict (id) do nothing;

-- -----------------------------------------------------------
-- newsletter_subscribers
-- -----------------------------------------------------------
create table if not exists newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);
alter table newsletter_subscribers enable row level security;
drop policy if exists "pub_insert_newsletter" on newsletter_subscribers;
create policy "pub_insert_newsletter" on newsletter_subscribers for insert to anon, authenticated with check (true);
drop policy if exists "auth_manage_newsletter" on newsletter_subscribers;
create policy "auth_manage_newsletter" on newsletter_subscribers for all to authenticated using (true) with check (true);

-- -----------------------------------------------------------
-- updated_at trigger
-- -----------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$
declare t text;
begin
  for t in select unnest(array['categories','products','branches','blog_posts','settings','orders']) loop
    execute format('drop trigger if exists trg_%s_updated on %s', t, t);
    execute format('create trigger trg_%s_updated before update on %s for each row execute function set_updated_at()', t, t);
  end loop;
end$$;
