-- Seed data inventaris berdasarkan DATA INVENTARIS.xlsx
-- HMI TMKP Pengurus 2024-2025
-- Jalankan di Supabase SQL Editor

insert into public.inventory_items (name, total_stock, available_stock, category, condition)
values
  ('Mud',               2,  2,  'Perlengkapan Acara', 'BAIK'),
  ('Gordon',            10, 10, 'Perlengkapan Acara', 'BAIK'),
  ('Stampel Panitia',   1,  1,  'Alat Tulis',         'BAIK'),
  ('Stampel Pengurus',  1,  1,  'Alat Tulis',         'BAIK'),
  ('Cue Card',          5,  5,  'Perlengkapan Acara', 'BAIK');
