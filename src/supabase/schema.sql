-- ============================================================
-- ROYAL INVITATIONS — Supabase schema
-- Run in the Supabase SQL editor. Assumes `auth.users` exists.
-- ============================================================

create extension if not exists "uuid-ossp";

-- ---------- Categories ----------
create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  description text,
  icon text,
  image_url text,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- ---------- Products ----------
create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  category_id uuid references categories(id) on delete set null,
  name text not null,
  slug text unique not null,
  description text,
  price numeric(10,2) not null,
  compare_at_price numeric(10,2),
  badge text check (badge in ('new','best_seller','premium') or badge is null),
  paper_quality text,
  dimensions text,
  customizable boolean default true,
  delivery_days int default 5,
  stock int default 100,
  rating numeric(2,1) default 0,
  rating_count int default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists product_images (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references products(id) on delete cascade,
  url text not null,
  alt text,
  sort_order int default 0
);

-- ---------- Users (profile extension) ----------
create table if not exists users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz default now()
);

-- ---------- Wishlist ----------
create table if not exists wishlist (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, product_id)
);

-- ---------- Cart ----------
create table if not exists cart (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  qty int not null default 1,
  updated_at timestamptz default now(),
  unique(user_id, product_id)
);

-- ---------- Orders ----------
create table if not exists orders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete set null,
  total numeric(10,2) not null,
  status text default 'pending' check (status in ('pending','confirmed','shipped','delivered','cancelled')),
  shipping_address jsonb,
  created_at timestamptz default now()
);

create table if not exists order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  qty int not null,
  price numeric(10,2) not null
);

-- ---------- Reviews ----------
create table if not exists reviews (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete set null,
  product_id uuid references products(id) on delete cascade,
  customer_name text,
  rating int check (rating between 1 and 5),
  comment text,
  avatar_url text,
  created_at timestamptz default now()
);

-- ---------- Banners ----------
create table if not exists banners (
  id uuid primary key default uuid_generate_v4(),
  title text,
  subtitle text,
  image_url text,
  link_url text,
  active boolean default true,
  sort_order int default 0
);

-- ---------- Gallery ----------
create table if not exists gallery (
  id uuid primary key default uuid_generate_v4(),
  image_url text not null,
  caption text,
  category_id uuid references categories(id),
  created_at timestamptz default now()
);

-- ---------- Settings ----------
create table if not exists settings (
  key text primary key,
  value jsonb
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table categories enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table gallery enable row level security;
alter table banners enable row level security;
alter table reviews enable row level security;
alter table users enable row level security;
alter table wishlist enable row level security;
alter table cart enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Public read-only content
create policy "public read categories" on categories for select using (true);
create policy "public read products" on products for select using (is_active = true);
create policy "public read product_images" on product_images for select using (true);
create policy "public read gallery" on gallery for select using (true);
create policy "public read banners" on banners for select using (active = true);
create policy "public read reviews" on reviews for select using (true);
create policy "anyone can submit a review" on reviews for insert with check (true);

-- Users can manage only their own profile
create policy "users read own profile" on users for select using (auth.uid() = id);
create policy "users update own profile" on users for update using (auth.uid() = id);

-- Wishlist: per-user access
create policy "wishlist owner select" on wishlist for select using (auth.uid() = user_id);
create policy "wishlist owner insert" on wishlist for insert with check (auth.uid() = user_id);
create policy "wishlist owner delete" on wishlist for delete using (auth.uid() = user_id);

-- Cart: per-user access
create policy "cart owner select" on cart for select using (auth.uid() = user_id);
create policy "cart owner insert" on cart for insert with check (auth.uid() = user_id);
create policy "cart owner update" on cart for update using (auth.uid() = user_id);
create policy "cart owner delete" on cart for delete using (auth.uid() = user_id);

-- Orders: per-user access
create policy "orders owner select" on orders for select using (auth.uid() = user_id);
create policy "orders owner insert" on orders for insert with check (auth.uid() = user_id);
create policy "order_items owner select" on order_items for select using (
  exists (select 1 from orders o where o.id = order_items.order_id and o.user_id = auth.uid())
);

-- ============================================================
-- STORAGE BUCKETS (run separately if buckets don't exist yet)
-- ============================================================
insert into storage.buckets (id, name, public) values ('products', 'products', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('gallery', 'gallery', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('banners', 'banners', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true) on conflict do nothing;

create policy "public read product images bucket" on storage.objects for select using (bucket_id = 'products');
create policy "public read gallery bucket" on storage.objects for select using (bucket_id = 'gallery');
create policy "public read banners bucket" on storage.objects for select using (bucket_id = 'banners');
create policy "public read avatars bucket" on storage.objects for select using (bucket_id = 'avatars');

-- ============================================================
-- ADMIN ROLE
-- Run this whole section once. It adds a `role` column to `users`
-- (default 'user'), auto-creates a `users` row on signup, and gives
-- admins full read/write access to every table + storage bucket.
--
-- To make yourself an admin after signing up once through the app:
--   update users set role = 'admin' where id = '<your-auth-user-uuid>';
-- (find the uuid in Supabase -> Authentication -> Users)
-- ============================================================

alter table users add column if not exists role text not null default 'user'
  check (role in ('user', 'admin'));

-- Auto-insert a `users` row whenever someone signs up via Supabase Auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, full_name, role)
  values (new.id, new.raw_user_meta_data ->> 'full_name', 'user')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Helper used inside RLS policies to check the current user's role
-- without recursive-policy issues (security definer bypasses RLS).
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce((select role = 'admin' from public.users where id = auth.uid()), false);
$$;

alter table settings enable row level security;

-- Admins can fully manage catalog/content tables
create policy "admin manage categories" on categories for all using (is_admin()) with check (is_admin());
create policy "admin manage products" on products for all using (is_admin()) with check (is_admin());
create policy "admin manage product_images" on product_images for all using (is_admin()) with check (is_admin());
create policy "admin manage banners" on banners for all using (is_admin()) with check (is_admin());
create policy "admin manage gallery" on gallery for all using (is_admin()) with check (is_admin());
create policy "admin manage reviews" on reviews for all using (is_admin()) with check (is_admin());
create policy "admin manage settings" on settings for all using (is_admin()) with check (is_admin());

-- Admins can see and manage every user's profile/role
create policy "admin read users" on users for select using (is_admin());
create policy "admin update users" on users for update using (is_admin());

-- Admins can view and update all orders (owners already have their own access above)
create policy "admin read orders" on orders for select using (is_admin());
create policy "admin update orders" on orders for update using (is_admin());
create policy "admin read order_items" on order_items for select using (is_admin());

-- Admins can upload/replace/delete images in every storage bucket
create policy "admin write products bucket" on storage.objects for insert with check (bucket_id = 'products' and is_admin());
create policy "admin update products bucket" on storage.objects for update using (bucket_id = 'products' and is_admin());
create policy "admin delete products bucket" on storage.objects for delete using (bucket_id = 'products' and is_admin());

create policy "admin write gallery bucket" on storage.objects for insert with check (bucket_id = 'gallery' and is_admin());
create policy "admin update gallery bucket" on storage.objects for update using (bucket_id = 'gallery' and is_admin());
create policy "admin delete gallery bucket" on storage.objects for delete using (bucket_id = 'gallery' and is_admin());

create policy "admin write banners bucket" on storage.objects for insert with check (bucket_id = 'banners' and is_admin());
create policy "admin update banners bucket" on storage.objects for update using (bucket_id = 'banners' and is_admin());
create policy "admin delete banners bucket" on storage.objects for delete using (bucket_id = 'banners' and is_admin());

create policy "users write own avatar" on storage.objects for insert with check (bucket_id = 'avatars' and auth.uid() is not null);
create policy "users update own avatar" on storage.objects for update using (bucket_id = 'avatars' and auth.uid() is not null);

-- ============================================================
-- REVIEW AGGREGATES
-- Keeps products.rating / products.rating_count in sync with the
-- reviews table automatically, so "total reviews" is always accurate
-- without extra client-side queries.
-- ============================================================

create or replace function public.refresh_product_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_product uuid := coalesce(new.product_id, old.product_id);
begin
  update products p
  set
    rating = coalesce((select round(avg(rating)::numeric, 1) from reviews where product_id = target_product), 0),
    rating_count = (select count(*) from reviews where product_id = target_product)
  where p.id = target_product;
  return null;
end;
$$;

drop trigger if exists on_review_change on reviews;
create trigger on_review_change
  after insert or update or delete on reviews
  for each row execute procedure public.refresh_product_rating();

-- ============================================================
-- ORDER INSERT POLICIES
-- `order_items` had RLS enabled but no INSERT policy at all, so every
-- checkout was silently failing when it tried to insert line items.
-- Also allow guest (no login) orders placed via the WhatsApp buttons —
-- user_id is null for those, while the Cart checkout flow still
-- attaches a real user_id since it requires login.
-- ============================================================

create policy "orders guest insert" on orders for insert with check (user_id is null);

create policy "order_items insert" on order_items for insert with check (
  exists (
    select 1 from orders o
    where o.id = order_items.order_id
      and (o.user_id = auth.uid() or o.user_id is null)
  )
);
