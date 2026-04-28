# CLAUDE.md — HMI TMKP Internal System

Dokumen ini berisi konteks teknis, konvensi, dan panduan arsitektur untuk AI coding assistants (Claude, Gemini, dll.) yang bekerja pada proyek ini.

---

## Gambaran Proyek

**HMI TMKP Internal System** adalah aplikasi web internal untuk Himpunan Mahasiswa Islam Komisariat Teknik Mesin dan Kelautan Perikanan (HMI TMKP), Universitas Udayana.

**Tujuan:** Mengelola data anggota, peminjaman inventaris, verifikasi dokumen, dan keuangan komisariat secara terpusat.

**Deployment:** Vercel (SPA) + Supabase (PostgreSQL backend)

---

## Tech Stack

| Layer | Teknologi | Catatan |
|---|---|---|
| Framework | React 19 + TypeScript | Strict mode |
| Build tool | Vite 6 | Port 3000 |
| Styling | Tailwind CSS v4 | Konfigurasi via `@tailwindcss/vite` plugin |
| Routing | React Router DOM v7 | Client-side SPA, fallback ke `vercel.json` |
| Database | Supabase (PostgreSQL) | Semua akses via `src/lib/supabase.ts` |
| Animasi | Motion (motion/react) | Bukan `framer-motion`, import dari `motion/react` |
| CSV Parser | PapaParse | Digunakan di `CSVImportModal.tsx` |
| Icons | Lucide React | |
| Enkripsi | CryptoJS | Untuk credential admin |
| AI Chatbot | OpenRouter API | `src/lib/openrouter.ts` |
| Charts | Recharts | Digunakan di `FinancialReports.tsx` |

---

## Struktur Direktori

```
src/
├── App.tsx                    # Route definitions (React Router)
├── main.tsx                   # Entry point, Provider wrapping
├── index.css                  # Global styles + Tailwind config
├── components/
│   ├── ui/                    # Primitif: Button, Input, Badge
│   ├── Layout.tsx             # Admin dashboard shell (Sidebar + Topbar + Outlet)
│   ├── Sidebar.tsx            # Admin navigation sidebar
│   ├── Topbar.tsx             # Admin top bar (search, theme toggle, user)
│   ├── LoginModal.tsx         # Admin login modal
│   ├── CSVImportModal.tsx     # Bulk import anggota dari CSV
│   ├── FinanceImportModal.tsx # Bulk import keuangan dari CSV
│   ├── InventoryModal.tsx     # CRUD inventaris barang
│   ├── ConfirmationModal.tsx  # Generic confirm dialog
│   ├── AIChatbot.tsx          # AI assistant chatbot
│   └── Toast.tsx              # Toast notification UI
├── lib/
│   ├── supabase.ts            # SEMUA database services (satu file)
│   ├── auth-context.tsx       # Auth state (login/logout/session)
│   ├── theme-context.tsx      # Dark/light mode toggle
│   ├── toast-context.tsx      # Global toast notifications
│   ├── encryption.ts          # CryptoJS AES encrypt/decrypt
│   ├── openrouter.ts          # OpenRouter AI API client
│   └── utils.ts               # cn() helper (clsx + tailwind-merge)
├── pages/
│   ├── Frontpage.tsx          # Landing page publik (/)
│   ├── PublicSubmission.tsx   # Formulir pendataan anggota (/submission)
│   ├── PublicBorrowing.tsx    # Formulir peminjaman barang (/peminjaman)
│   ├── Dashboard.tsx          # Admin dashboard (/dashboard)
│   ├── MemberList.tsx         # Manajemen anggota (/dashboard/members)
│   ├── MemberForm.tsx         # Tambah anggota (/dashboard/members/new)
│   ├── MemberEdit.tsx         # Edit anggota (/dashboard/members/:id/edit)
│   ├── Verification.tsx       # Verifikasi dokumen (/dashboard/verification)
│   ├── BorrowingReview.tsx    # Review peminjaman + inventaris (/dashboard/borrowing)
│   ├── FinancialReports.tsx   # Laporan keuangan (/dashboard/reports)
│   ├── Organization.tsx       # Kepengurusan (/dashboard/organization)
│   ├── Events.tsx             # Kegiatan (/dashboard/events)
│   └── Settings.tsx           # Pengaturan app (/dashboard/settings)
└── types/index.ts             # Semua TypeScript interfaces
```

---

## Database Schema

Semua tabel ada di `public` schema Supabase. RLS aktif untuk semua tabel dengan policy "allow public" (karena belum pakai auth Supabase).

### Tabel Utama

```
members               — Data anggota HMI TMKP
financial_records     — Catatan pemasukan/pengeluaran
verification_requests — Permintaan verifikasi dokumen (KRS/UKT/KTM)
borrowing_requests    — Permintaan peminjaman barang
inventory_items       — Stok inventaris komisariat
app_settings          — Konfigurasi aplikasi (key-value)
```

### Relasi Penting
- `verification_requests.member_id` → `members.id` (CASCADE delete)
- `borrowing_requests.item_id` → `inventory_items.id` (SET NULL on delete)

### SQL Functions (RPC)
- `decrement_inventory_stock(item_id uuid, qty integer)` — kurangi stok saat APPROVED
- `increment_inventory_stock(item_id uuid, qty integer)` — kembalikan stok saat RETURNED/REJECTED

### Logika Stok Inventaris
```
PENDING   → tidak ada perubahan stok
APPROVED  → available_stock -= quantity
RETURNED  → available_stock += quantity
REJECTED  → available_stock += quantity (jika sebelumnya APPROVED)
```

---

## Services Layer (`src/lib/supabase.ts`)

Semua akses database **wajib** melalui service objects di file ini. Jangan query Supabase langsung dari komponen.

| Service | Methods |
|---|---|
| `memberService` | `getMembers`, `getMemberById`, `createMember`, `updateMember`, `bulkInsertMembers`, `deleteMembers`, `updateMembersStatus` |
| `financialService` | `getRecords`, `createRecord`, `bulkInsertRecords` |
| `verificationService` | `createRequest`, `getRequests`, `updateStatus`, `getPendingRequests` |
| `borrowingService` | `createRequest`, `getRequests`, `updateStatus` (auto-adjust stok) |
| `inventoryService` | `getItems`, `createItem`, `updateItem`, `deleteItem` |
| `dashboardService` | `getStats` |
| `settingsService` | `getSetting`, `updateSetting` |

---

## Autentikasi Admin

- **Bukan** Supabase Auth — menggunakan credential hardcoded di `auth-context.tsx`
- Login: `username: admin`, `password: Z#nn5~8f!d1a`
- Session disimpan di `localStorage` dengan key `tmkp_auth_session`
- Route protection via `<RequireAuth>` wrapper di `App.tsx`
- Redirect ke `/` jika tidak authenticated

---

## Design System & Konvensi UI

### Pola Warna (Dark Mode)
```
bg-black/40 dark:backdrop-blur-xl  → panel/modal background
dark:bg-white/5                    → card/table row background  
dark:border-white/10               → border
dark:text-white/50                 → muted text
text-green-600 / dark:text-green-400 → primary accent (hijau)
```

> ⚠️ **Jangan gunakan** `dark:bg-gray-900` — menghasilkan warna navy/indigo yang tidak sesuai desain. Gunakan `dark:bg-black/80` atau `dark:bg-[#0a0a0a]`.

### Animasi
- Selalu gunakan `motion` dari `motion/react` (bukan `framer-motion`)
- `initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}` untuk page transitions
- `AnimatePresence` untuk conditional rendering dengan exit animation

### Utility Function
```ts
import { cn } from '@/src/lib/utils'; // clsx + tailwind-merge
```

### Path Aliases
```ts
'@' → root project directory
// Contoh: import { Button } from '@/src/components/ui/Button'
```

### Select & Dropdown (Dark Mode)
Gunakan `dark:bg-[#0a0a0a]` untuk `<select>` dan `<option>` — bukan `dark:bg-white/5` karena browser akan render option dengan warna navy default.

---

## Routing

```ts
/                   → Frontpage (publik)
/submission         → PublicSubmission (publik)
/peminjaman         → PublicBorrowing (publik)
/dashboard          → Dashboard (auth required)
/dashboard/members  → MemberList
/dashboard/members/new → MemberForm
/dashboard/members/:id/edit → MemberEdit
/dashboard/verification → Verification
/dashboard/borrowing → BorrowingReview
/dashboard/reports  → FinancialReports
/dashboard/organization → Organization
/dashboard/events   → Events
/dashboard/settings → Settings
*                   → redirect ke /
```

`vercel.json` mengatur SPA fallback: semua request diarahkan ke `index.html`.

---

## Environment Variables

```env
VITE_SUPABASE_URL=                  # Required
VITE_SUPABASE_ANON_KEY=             # Required (atau VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY)
VITE_ENCRYPTION_KEY=                # Optional (default fallback ada, tapi tidak aman untuk prod)
GEMINI_API_KEY=                     # Optional (untuk AI Chatbot via OpenRouter)
```

---

## CSV Import — Format Anggota

Header yang didukung (tab-separated, dari Google Forms export):

```
Timestamp	Email Address	Nama Lengkap	NIM	Angkatan	Fakultas	Prodi	Nomor WA	Domisili	Tempat Tanggal Lahir	Tahun LK 1	Tahun LK 2	Tahun LK 3
```

- `transformHeader: header => header.trim()` aktif di PapaParse — spasi/tab ekstra di-trim otomatis
- Kolom `Tahun LK 2` dan `Tahun LK 3` boleh kosong atau berisi `..`
- Nilai `..` diperlakukan sebagai kosong

---

## Hal-hal yang Perlu Diperhatikan

1. **Import animasi:** Selalu `import { motion } from 'motion/react'` — bukan `framer-motion`
2. **Supabase schema idempotent:** `supabase-schema.sql` menggunakan `DROP POLICY IF EXISTS` sebelum `CREATE POLICY` — aman dijalankan berulang kali
3. **Stok inventaris:** Otomatis di-adjust di `borrowingService.updateStatus()` saat status APPROVED/RETURNED/REJECTED menggunakan Supabase RPC
4. **Video landing page:** Menggunakan HLS stream via `hls.js` dengan fade-in setelah `canplay` event — hindari menampilkan video sebelum siap untuk mencegah flash
5. **Navbar publik:** Semua halaman publik (`/submission`, `/peminjaman`) menggunakan `dark:bg-black/40 dark:backdrop-blur-md` — jangan tambahkan `dark:bg-white` yang akan override
6. **Auth bukan Supabase Auth:** Jangan gunakan `supabase.auth.*` — auth dikelola sendiri via `auth-context.tsx`

---

## Commands

```bash
npm run dev      # Dev server → localhost:3000
npm run build    # Production build
npm run lint     # TypeScript type check (tsc --noEmit)
npm run preview  # Preview production build
```
