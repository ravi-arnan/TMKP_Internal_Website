# HMI TMKP — Internal System

Sistem administrasi internal resmi **HMI Komisariat Teknik Mesin dan Kelautan Perikanan (TMKP) Universitas Udayana** — dibangun untuk manajemen data anggota, peminjaman inventaris, verifikasi dokumen, dan pelaporan keuangan.

---

## ✨ Fitur Utama

### Publik
| Halaman | Deskripsi |
|---|---|
| **Landing Page** (`/`) | Halaman utama dengan video background dan navigasi ke semua fitur publik |
| **Pendataan Anggota** (`/submission`) | Formulir registrasi anggota baru (nama, NIM, fakultas, prodi, LK, dll.) |
| **Peminjaman Barang** (`/peminjaman`) | Formulir pengajuan peminjaman inventaris komisariat dengan pilihan barang real-time |

### Admin Dashboard (`/dashboard`)
| Halaman | Deskripsi |
|---|---|
| **Dashboard** | Statistik ringkasan: total anggota aktif, alumni, pertumbuhan, kegiatan bulanan |
| **Data Anggota** | Manajemen data anggota lengkap — CRUD, filter, bulk status, import CSV |
| **Verifikasi** | Review dokumen KRS/UKT/KTM yang diunggah anggota |
| **Peminjaman Barang** | Review permintaan peminjaman + tab **Inventaris** (manajemen stok barang) |
| **Kepengurusan** | Struktur organisasi HMI TMKP |
| **Kegiatan** | Jadwal dan catatan kegiatan komisariat |
| **Laporan Keuangan** | Catatan pemasukan/pengeluaran komisariat |
| **Pengaturan** | Konfigurasi aplikasi (nama organisasi, dll.) |

---

## 🛠 Tech Stack

| Layer | Teknologi |
|---|---|
| Framework | React 19 + TypeScript + Vite 6 |
| Styling | Tailwind CSS v4 |
| Routing | React Router DOM v7 |
| Database | Supabase (PostgreSQL + RLS) |
| Animasi | Motion (Framer Motion) |
| Chart | Recharts |
| CSV Parser | PapaParse |
| Icons | Lucide React |
| Video HLS | hls.js |
| Deployment | Vercel |

---

## 🚀 Menjalankan Lokal

**Prerequisites:** Node.js ≥ 18

```bash
# 1. Install dependencies
npm install

# 2. Salin dan isi environment variables
cp .env.example .env.local
```

Isi `.env.local` dengan:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
GEMINI_API_KEY=your-gemini-key   # opsional, untuk fitur AI
```

```bash
# 3. Jalankan dev server
npm run dev
# → http://localhost:3000
```

---

## 🗄 Setup Database (Supabase)

Jalankan seluruh isi `supabase-schema.sql` di **Supabase SQL Editor**.

Script ini **idempotent** — aman dijalankan berulang kali tanpa error duplikat.

**Tabel yang dibuat:**
- `members` — data anggota
- `financial_records` — catatan keuangan
- `verification_requests` — permintaan verifikasi dokumen
- `borrowing_requests` — permintaan peminjaman barang
- `inventory_items` — stok inventaris komisariat
- `app_settings` — konfigurasi aplikasi

**Fungsi SQL:**
- `decrement_inventory_stock(item_id, qty)` — kurangi stok saat peminjaman disetujui
- `increment_inventory_stock(item_id, qty)` — kembalikan stok saat barang dikembalikan

---

## 📦 Import Data Anggota (CSV)

Format header CSV yang didukung (tab-separated, dari Google Forms):

```
Timestamp	Email Address	Nama Lengkap	NIM	Angkatan	Fakultas	Prodi	Nomor WA	Domisili	Tempat Tanggal Lahir	Tahun LK 1	Tahun LK 2	Tahun LK 3
```

- Header di-trim otomatis (spasi/tab ekstra diabaikan)
- Nilai `..` pada Tahun LK 2/3 dianggap kosong
- Download template tersedia di modal import

---

## 📁 Struktur Proyek

```
src/
├── components/
│   ├── ui/               # Button, Input, Badge, dll.
│   ├── Layout.tsx        # Shell dashboard (sidebar + konten)
│   ├── Sidebar.tsx       # Navigasi admin
│   ├── CSVImportModal.tsx
│   ├── InventoryModal.tsx
│   └── LoginModal.tsx
├── lib/
│   ├── supabase.ts       # Semua service (member, financial, borrowing, inventory)
│   ├── auth-context.tsx  # Auth state management
│   └── toast-context.tsx # Global toast notifications
├── pages/
│   ├── Frontpage.tsx     # Landing page publik
│   ├── PublicSubmission.tsx
│   ├── PublicBorrowing.tsx
│   ├── Dashboard.tsx
│   ├── MemberList.tsx
│   ├── BorrowingReview.tsx
│   └── ...
└── types/index.ts        # Semua TypeScript interfaces
```

---

## 🔐 Autentikasi Admin

Login admin menggunakan credential yang disimpan di `app_settings` (dienkripsi). Akses melalui tombol **"Masuk Admin"** di landing page.

---

## 📜 Scripts

```bash
npm run dev      # Dev server (port 3000)
npm run build    # Production build
npm run lint     # TypeScript type check
npm run preview  # Preview production build
```
