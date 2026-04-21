-- SQL Schema untuk database Supabase project "hmi-tmkp"
-- Jalankan script ini di Supabase SQL Editor
-- Script ini idempotent: aman dijalankan berulang kali

-- ============================================
-- Tables
-- ============================================

-- Tabel anggota HMI TMKP
create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  nim text not null unique,
  angkatan text not null,
  jurusan text not null,
  status text not null check (status in ('AKTIF','ALUMNI','NON-AKTIF','PENDING')),
  photo_url text,
  phone text,
  address text,
  semester integer,
  fakultas text,
  prodi text,
  tempat_tanggal_lahir text,
  tahun_lk1 text,
  tahun_lk2 text,
  tahun_lk3 text,
  created_at timestamptz not null default now()
);

-- Tabel catatan keuangan
create table if not exists public.financial_records (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  description text not null,
  category text not null,
  amount numeric(14,2) not null check (amount >= 0),
  type text not null check (type in ('INCOME','EXPENSE')),
  created_at timestamptz not null default now()
);

-- Tabel permintaan verifikasi dokumen anggota
create table if not exists public.verification_requests (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  document_type text not null check (document_type in ('KRS','UKT','KTM')),
  document_url text not null,
  status text not null default 'PENDING' check (status in ('PENDING','APPROVED','REJECTED')),
  created_at timestamptz not null default now()
);

-- Tabel konfigurasi pengaturan aplikasi internal
create table if not exists public.app_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

-- Tabel permintaan peminjaman barang/inventaris komisariat
create table if not exists public.borrowing_requests (
  id uuid primary key default gen_random_uuid(),
  requester_name text not null,
  requester_email text not null,
  requester_phone text,
  requester_affiliation text,
  item_name text not null,
  quantity integer not null check (quantity > 0),
  purpose text not null,
  borrow_date date not null,
  return_date date not null,
  notes text,
  status text not null default 'PENDING'
    check (status in ('PENDING','APPROVED','REJECTED','RETURNED')),
  admin_note text,
  created_at timestamptz not null default now()
);

-- Tabel inventaris barang komisariat
create table if not exists public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  total_stock integer not null default 1 check (total_stock >= 0),
  available_stock integer not null default 1 check (available_stock >= 0),
  category text,
  condition text not null default 'BAIK' check (condition in ('BAIK','RUSAK RINGAN','RUSAK BERAT')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Tambah referensi item ke borrowing_requests (idempotent via IF NOT EXISTS)
alter table public.borrowing_requests
  add column if not exists item_id uuid references public.inventory_items(id) on delete set null;

-- ============================================
-- Indexes
-- ============================================

create index if not exists idx_members_status on public.members(status);
create index if not exists idx_members_angkatan on public.members(angkatan);
create index if not exists idx_members_created_at on public.members(created_at desc);
create index if not exists idx_financial_date on public.financial_records(date desc);
create index if not exists idx_financial_type on public.financial_records(type);
create index if not exists idx_verification_status on public.verification_requests(status);
create index if not exists idx_verification_member on public.verification_requests(member_id);
create index if not exists idx_borrowing_status on public.borrowing_requests(status);
create index if not exists idx_borrowing_created_at on public.borrowing_requests(created_at desc);
create index if not exists idx_inventory_name on public.inventory_items(name);
create index if not exists idx_inventory_category on public.inventory_items(category);

-- ============================================
-- Row Level Security (RLS) Policies
-- Menggunakan DROP IF EXISTS sebelum CREATE agar idempotent
-- ============================================

-- Members
alter table public.members enable row level security;

drop policy if exists "Allow public read members" on public.members;
create policy "Allow public read members"
  on public.members for select
  to anon, authenticated
  using (true);

drop policy if exists "Allow public insert members" on public.members;
create policy "Allow public insert members"
  on public.members for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Allow public update members" on public.members;
create policy "Allow public update members"
  on public.members for update
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "Allow public delete members" on public.members;
create policy "Allow public delete members"
  on public.members for delete
  to anon, authenticated
  using (true);

-- Financial Records
alter table public.financial_records enable row level security;

drop policy if exists "Allow public read financial_records" on public.financial_records;
create policy "Allow public read financial_records"
  on public.financial_records for select
  to anon, authenticated
  using (true);

drop policy if exists "Allow public insert financial_records" on public.financial_records;
create policy "Allow public insert financial_records"
  on public.financial_records for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Allow public update financial_records" on public.financial_records;
create policy "Allow public update financial_records"
  on public.financial_records for update
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "Allow public delete financial_records" on public.financial_records;
create policy "Allow public delete financial_records"
  on public.financial_records for delete
  to anon, authenticated
  using (true);

-- Verification Requests
alter table public.verification_requests enable row level security;

drop policy if exists "Allow public read verification_requests" on public.verification_requests;
create policy "Allow public read verification_requests"
  on public.verification_requests for select
  to anon, authenticated
  using (true);

drop policy if exists "Allow public insert verification_requests" on public.verification_requests;
create policy "Allow public insert verification_requests"
  on public.verification_requests for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Allow public update verification_requests" on public.verification_requests;
create policy "Allow public update verification_requests"
  on public.verification_requests for update
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "Allow public delete verification_requests" on public.verification_requests;
create policy "Allow public delete verification_requests"
  on public.verification_requests for delete
  to anon, authenticated
  using (true);

-- App Settings
alter table public.app_settings enable row level security;

drop policy if exists "Allow public read app_settings" on public.app_settings;
create policy "Allow public read app_settings"
  on public.app_settings for select
  to anon, authenticated
  using (true);

drop policy if exists "Allow public insert app_settings" on public.app_settings;
create policy "Allow public insert app_settings"
  on public.app_settings for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Allow public update app_settings" on public.app_settings;
create policy "Allow public update app_settings"
  on public.app_settings for update
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "Allow public delete app_settings" on public.app_settings;
create policy "Allow public delete app_settings"
  on public.app_settings for delete
  to anon, authenticated
  using (true);

-- Borrowing Requests
alter table public.borrowing_requests enable row level security;

drop policy if exists "Allow public read borrowing_requests" on public.borrowing_requests;
create policy "Allow public read borrowing_requests"
  on public.borrowing_requests for select
  to anon, authenticated
  using (true);

drop policy if exists "Allow public insert borrowing_requests" on public.borrowing_requests;
create policy "Allow public insert borrowing_requests"
  on public.borrowing_requests for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Allow public update borrowing_requests" on public.borrowing_requests;
create policy "Allow public update borrowing_requests"
  on public.borrowing_requests for update
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "Allow public delete borrowing_requests" on public.borrowing_requests;
create policy "Allow public delete borrowing_requests"
  on public.borrowing_requests for delete
  to anon, authenticated
  using (true);

-- Inventory Items
alter table public.inventory_items enable row level security;

drop policy if exists "Allow public read inventory_items" on public.inventory_items;
create policy "Allow public read inventory_items"
  on public.inventory_items for select
  to anon, authenticated
  using (true);

drop policy if exists "Allow public insert inventory_items" on public.inventory_items;
create policy "Allow public insert inventory_items"
  on public.inventory_items for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Allow public update inventory_items" on public.inventory_items;
create policy "Allow public update inventory_items"
  on public.inventory_items for update
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "Allow public delete inventory_items" on public.inventory_items;
create policy "Allow public delete inventory_items"
  on public.inventory_items for delete
  to anon, authenticated
  using (true);

-- ============================================
-- Functions untuk auto-adjust stok inventaris
-- (create or replace = idempotent by default)
-- ============================================

create or replace function decrement_inventory_stock(item_id uuid, qty integer)
returns void language plpgsql as $$
begin
  update public.inventory_items
  set available_stock = greatest(0, available_stock - qty),
      updated_at = now()
  where id = item_id;
end;
$$;

create or replace function increment_inventory_stock(item_id uuid, qty integer)
returns void language plpgsql as $$
begin
  update public.inventory_items
  set available_stock = least(total_stock, available_stock + qty),
      updated_at = now()
  where id = item_id;
end;
$$;
