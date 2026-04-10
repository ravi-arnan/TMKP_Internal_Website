-- SQL Schema untuk database Supabase project "hmi-tmkp"
-- Jalankan script ini di Supabase SQL Editor

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

-- Index untuk performa query
create index if not exists idx_members_status on public.members(status);
create index if not exists idx_members_angkatan on public.members(angkatan);
create index if not exists idx_members_created_at on public.members(created_at desc);
create index if not exists idx_financial_date on public.financial_records(date desc);
create index if not exists idx_financial_type on public.financial_records(type);
create index if not exists idx_verification_status on public.verification_requests(status);
create index if not exists idx_verification_member on public.verification_requests(member_id);
