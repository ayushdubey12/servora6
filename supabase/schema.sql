-- ============================================================
-- Servora — Supabase Database Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- Enable UUID extension (should already be enabled in Supabase)
create extension if not exists "uuid-ossp";

-- ============================================================
-- 1. RESTAURANTS
-- ============================================================
create table public.restaurants (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  description text,
  phone text,
  email text,
  address text,
  opening_hours jsonb default '[]'::jsonb,
  settings jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- 2. PROFILES (extends auth.users — staff + customers)
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  name text not null,
  email text unique not null,
  phone text,
  role text not null default 'customer'
    check (role in ('owner', 'chef', 'waiter', 'customer')),
  restaurant_id uuid references public.restaurants on delete set null,
  avatar text,
  -- Customer-specific fields
  points integer default 0,
  total_spent float8 default 0,
  visit_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-create profile on auth.users insert
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'role', 'customer')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.update_updated_at();

create trigger restaurants_updated_at
  before update on public.restaurants
  for each row execute procedure public.update_updated_at();

-- ============================================================
-- 3. CATEGORIES
-- ============================================================
create table public.categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null,
  item_count integer default 0,
  sort_order integer default 0,
  restaurant_id uuid not null references public.restaurants on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (restaurant_id, slug)
);

create trigger categories_updated_at
  before update on public.categories
  for each row execute procedure public.update_updated_at();

-- ============================================================
-- 4. MENU ITEMS
-- ============================================================
create table public.menu_items (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text default '',
  price float8 not null,
  is_veg boolean default true,
  is_available boolean default true,
  restaurant_id uuid not null references public.restaurants on delete cascade,
  category_id uuid not null references public.categories on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger menu_items_updated_at
  before update on public.menu_items
  for each row execute procedure public.update_updated_at();

-- ============================================================
-- 5. TABLES
-- ============================================================
create table public.tables (
  id uuid primary key default uuid_generate_v4(),
  number integer not null,
  seats integer not null,
  status text not null default 'available'
    check (status in ('available', 'occupied', 'reserved', 'cleaning')),
  restaurant_id uuid not null references public.restaurants on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (restaurant_id, number)
);

create trigger tables_updated_at
  before update on public.tables
  for each row execute procedure public.update_updated_at();

-- ============================================================
-- 6. ORDERS
-- ============================================================
create table public.orders (
  id uuid primary key default uuid_generate_v4(),
  restaurant_id uuid not null references public.restaurants on delete cascade,
  table_number integer,
  customer_name text not null default 'Guest',
  status text not null default 'PENDING'
    check (status in ('PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'SERVED', 'PAYMENT_PENDING', 'PAID', 'COMPLETED', 'CANCELLED', 'NEW')),
  payment_status text not null default 'PENDING',
  subtotal float8 default 0,
  tax float8 default 0,
  total float8 default 0,
  claimed_by_id uuid references public.profiles on delete set null,
  customer_id uuid references public.profiles on delete set null,
  points_earned integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger orders_updated_at
  before update on public.orders
  for each row execute procedure public.update_updated_at();

-- ============================================================
-- 7. ORDER ITEMS
-- ============================================================
create table public.order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.orders on delete cascade,
  item_id uuid references public.menu_items on delete set null,
  name text not null default 'Item',
  quantity integer not null,
  price float8 not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger order_items_updated_at
  before update on public.order_items
  for each row execute procedure public.update_updated_at();

-- ============================================================
-- 8. PAYMENTS
-- ============================================================
create table public.payments (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.orders on delete cascade,
  amount float8 not null,
  method text not null
    check (method in ('online', 'counter', 'card', 'cash', 'mobile')),
  status text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger payments_updated_at
  before update on public.payments
  for each row execute procedure public.update_updated_at();

-- ============================================================
-- 9. RESERVATIONS
-- ============================================================
create table public.reservations (
  id uuid primary key default uuid_generate_v4(),
  restaurant_id uuid not null references public.restaurants on delete cascade,
  customer_id uuid references public.profiles on delete set null,
  customer_name text not null,
  phone text,
  email text,
  party_size integer not null,
  date text not null,
  time text not null,
  notes text,
  status text not null default 'PENDING'
    check (status in ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger reservations_updated_at
  before update on public.reservations
  for each row execute procedure public.update_updated_at();

-- ============================================================
-- INDEXES
-- ============================================================
create index idx_profiles_email on public.profiles (email);
create index idx_profiles_role on public.profiles (role);
create index idx_profiles_restaurant on public.profiles (restaurant_id);
create index idx_categories_restaurant on public.categories (restaurant_id);
create index idx_menu_items_restaurant on public.menu_items (restaurant_id);
create index idx_menu_items_category on public.menu_items (category_id);
create index idx_tables_restaurant on public.tables (restaurant_id);
create index idx_orders_restaurant on public.orders (restaurant_id);
create index idx_orders_status on public.orders (status);
create index idx_orders_customer on public.orders (customer_id);
create index idx_order_items_order on public.order_items (order_id);
create index idx_payments_order on public.payments (order_id);
create index idx_reservations_restaurant on public.reservations (restaurant_id);
create index idx_reservations_date on public.reservations (date);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on all tables
alter table public.restaurants enable row level security;
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.tables enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.reservations enable row level security;

-- PUBLIC READ: anyone can view restaurant info, categories, menu, tables
create policy "Restaurants are publicly readable"
  on public.restaurants for select
  to public
  using (true);

create policy "Categories are publicly readable"
  on public.categories for select
  to public
  using (true);

create policy "Menu items are publicly readable"
  on public.menu_items for select
  to public
  using (true);

create policy "Tables are publicly readable"
  on public.tables for select
  to public
  using (true);

-- AUTHENTICATED: anyone logged in can manage orders, payments, reservations
create policy "Authenticated users can view orders"
  on public.orders for select
  to authenticated
  using (true);

create policy "Authenticated users can create orders"
  on public.orders for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update orders"
  on public.orders for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can view order items"
  on public.order_items for select
  to authenticated
  using (true);

create policy "Authenticated users can insert order items"
  on public.order_items for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update order items"
  on public.order_items for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can view payments"
  on public.payments for select
  to authenticated
  using (true);

create policy "Authenticated users can create payments"
  on public.payments for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update payments"
  on public.payments for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can view reservations"
  on public.reservations for select
  to authenticated
  using (true);

create policy "Authenticated users can create reservations"
  on public.reservations for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update reservations"
  on public.reservations for update
  to authenticated
  using (true)
  with check (true);

-- PROFILES: users can read all profiles, update their own, insert for onboarding
create policy "Profiles are readable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users can insert profiles"
  on public.profiles for insert
  to authenticated
  with check (true);

create policy "Users can update profiles"
  on public.profiles for update
  to authenticated
  using (true)
  with check (true);

-- RESTAURANTS: authenticated users can manage restaurants
create policy "Authenticated users can create restaurants"
  on public.restaurants for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update restaurants"
  on public.restaurants for update
  to authenticated
  using (true)
  with check (true);

-- CATEGORIES & MENU: authenticated users can manage
create policy "Authenticated users can manage categories"
  on public.categories for all
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can manage menu items"
  on public.menu_items for all
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can manage tables"
  on public.tables for all
  to authenticated
  using (true)
  with check (true);

-- ============================================================
-- REALTIME
-- Add tables to the realtime publication so we can listen for changes
-- ============================================================
alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.reservations;

-- ============================================================
-- HELPER: Order status transition validator
-- ============================================================
create or replace function public.valid_order_transition(
  current_status text,
  new_status text
)
returns boolean
language plpgsql
immutable
as $$
declare
  allowed text[];
begin
  case current_status
    when 'PENDING'    then allowed := array['ACCEPTED', 'PREPARING', 'CANCELLED'];
    when 'NEW'        then allowed := array['ACCEPTED', 'PREPARING', 'CANCELLED'];
    when 'ACCEPTED'   then allowed := array['PREPARING', 'CANCELLED'];
    when 'PREPARING'  then allowed := array['READY', 'CANCELLED'];
    when 'READY'      then allowed := array['SERVED', 'CANCELLED'];
    when 'SERVED'     then allowed := array['PAYMENT_PENDING', 'CANCELLED'];
    when 'PAYMENT_PENDING' then allowed := array['PAID', 'CANCELLED'];
    when 'PAID'       then allowed := array['COMPLETED'];
    else return false;
  end case;
  return new_status = any(allowed);
end;
$$;
