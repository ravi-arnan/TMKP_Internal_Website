<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# HMI TMKP Internal Website

Administrative Excellence system for HMI Komisariat TMKP. Manage members, academic data, organizational reports, and more.

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env.local` and fill in your credentials:
   ```
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
3. Run the app:
   `npm run dev`

## Supabase Setup

Create a project at [supabase.com](https://supabase.com) and run the following SQL in the SQL editor to create the required tables:

```sql
-- Members table
create table public.members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  nim text not null,
  angkatan text not null,
  jurusan text not null,
  status text not null default 'AKTIF',
  phone text,
  address text,
  semester integer,
  fakultas text,
  prodi text,
  tempat_tanggal_lahir text,
  tahun_lk1 text,
  tahun_lk2 text,
  tahun_lk3 text,
  photo_url text,
  created_at timestamptz not null default now()
);

-- Verification requests table
create table public.verification_requests (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references public.members(id) on delete cascade,
  document_type text not null,
  document_url text not null,
  status text not null default 'PENDING',
  created_at timestamptz not null default now()
);

-- Financial records table
create table public.financial_records (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  description text not null,
  category text not null,
  amount numeric not null,
  type text not null,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security (authenticated users can read/write)
alter table public.members enable row level security;
alter table public.verification_requests enable row level security;
alter table public.financial_records enable row level security;

create policy "Authenticated users can manage members"
  on public.members for all using (auth.role() = 'authenticated');

create policy "Authenticated users can manage verification_requests"
  on public.verification_requests for all using (auth.role() = 'authenticated');

create policy "Authenticated users can manage financial_records"
  on public.financial_records for all using (auth.role() = 'authenticated');
```

After creating the tables, create admin users through **Supabase Authentication > Users** in the dashboard. Users will log in via the `/login` page.

## Features

- 🔐 **Authentication** – Secure login via Supabase Auth; all routes are protected
- 👥 **Member Management** – Add, search, filter, sort, and bulk-manage member data
- 📋 **Verification** – Review and approve/reject member document submissions
- 💰 **Financial Reports** – Track income/expense with CSV import and export
- 📊 **Dashboard** – Live stats pulled from the database

