# IndoKerja.id — Job Application Platform (Simulasi)

Aplikasi simulasi platform pencarian kerja seperti IndoKerja.id. Terdiri dari dua bagian:

- **backend/** — REST API (Node.js + TypeScript + Express + Prisma + PostgreSQL)
- **frontend/** — Single Page App (React.js + TypeScript + Vite)

Dokumentasi API lengkap ada di [`API_DOCS.md`](./API_DOCS.md).

---

## 1. Fitur

| # | Fitur | Role |
|---|-------|------|
| 1 | Register & Login (JWT) | Job Seeker & Company |
| 2 | Melihat daftar lowongan (title, company, location, salary, job type) | Job Seeker |
| 3 | Melihat detail lowongan & Apply Job | Job Seeker |
| 4 | Melihat daftar lamaran sendiri beserta status | Job Seeker |
| 5 | Tidak bisa melamar lowongan yang sama dua kali (unique constraint DB + validasi) | Job Seeker |
| 6 | Membuat lowongan baru | Company |
| 7 | Melihat kandidat yang melamar pada lowongan miliknya | Company |
| 8 | Mengubah status kandidat (Applied → Reviewing → Shortlisted → Rejected/Accepted) | Company |
| 9 | Setiap perubahan status tersimpan di `application_history` | Company |

## 2. Arsitektur & Teknologi

```
Frontend (React + TS + Vite)  ─── REST/JSON + JWT ───▶  Backend (Express + TS)
                                                             │
                                                             ▼
                                                    Prisma ORM ─▶ PostgreSQL
```

- **Auth**: JWT Bearer token, password di-hash dengan bcrypt.
- **Validasi**: Zod schema pada setiap endpoint (body/params/query).
- **Error handling**: Terpusat lewat `errorHandler` middleware + custom `AppError`
  classes (`NotFoundError`, `ForbiddenError`, `ConflictError`, dst), sehingga
  response error selalu konsisten `{ success: false, message }`.
- **Otorisasi berbasis role**: middleware `authorize('COMPANY' | 'JOB_SEEKER')`.
- **Relasi database**: `User (1) — (N) Job`, `User (1) — (N) Application`,
  `Job (1) — (N) Application`, `Application (1) — (N) ApplicationHistory`,
  dengan `@@unique([jobId, jobSeekerId])` untuk mencegah lamaran ganda.

### Struktur folder backend

```
backend/
├── prisma/
│   ├── schema.prisma      # skema database + relasi
│   └── seed.ts            # data awal untuk testing
└── src/
    ├── config/prisma.ts   # singleton Prisma client
    ├── middlewares/        # auth, validate, error handler
    ├── modules/
    │   ├── auth/           # register, login, /me
    │   ├── jobs/            # CRUD lowongan
    │   └── applications/    # apply, status, history, kandidat
    ├── utils/               # AppError, jwt
    ├── app.ts               # setup express + routes
    └── index.ts              # entry point
```

### Struktur folder frontend

```
frontend/
└── src/
    ├── api/client.ts        # axios instance + interceptor JWT
    ├── context/AuthContext.tsx
    ├── components/          # Navbar, ProtectedRoute, StatusBadge
    ├── pages/
    │   ├── Login.tsx / Register.tsx
    │   ├── JobList.tsx / JobDetail.tsx / MyApplications.tsx     (Job Seeker)
    │   └── company/CreateJob.tsx / CompanyJobs.tsx / JobCandidates.tsx (Company)
    ├── types/index.ts
    └── styles.css            # styling responsif (tanpa framework CSS eksternal)
```

---

## 3. Prasyarat

- Node.js ≥ 18                                                                                        
- PostgreSQL ≥ 13 (lokal atau cloud, mis. Supabase/Neon/Railway)
- npm

## 4. Cara Menjalankan (Development)

### 4.1 Setup Database & Backend

```bash
cd backend
cp .env.example .env
# Edit .env: isi DATABASE_URL sesuai koneksi PostgreSQL kamu, dan JWT_SECRET

npm install

# Generate Prisma client
npx prisma generate

# Jalankan migration (membuat tabel di database)
npx prisma migrate dev --name init

# (Opsional) isi data contoh: 1 company, 1 job seeker, 3 lowongan
npm run prisma:seed

# Jalankan server (default port 4000)
npm run dev
```

Backend akan berjalan di `http://localhost:4000`. Cek `GET /api/health` untuk memastikan server aktif.

### 4.2 Setup Frontend

Buka terminal baru:

```bash
cd frontend
cp .env.example .env
# Pastikan VITE_API_URL mengarah ke backend, default: http://localhost:4000/api

npm install
npm run dev
```

Frontend akan berjalan di `http://localhost:5173`.

### 4.3 Akun demo (jika menjalankan `npm run prisma:seed`)

| Role | Email | Password |
|------|-------|----------|
| Company | hr@techcorp.id | password123 |
| Job Seeker | jobseeker@example.com | password123 |

Atau bisa mendaftar akun baru sendiri lewat halaman **Register**.

## 5. Build untuk Production

```bash
# Backend
cd backend
npm run build
npm start        # menjalankan dist/index.js

# Frontend
cd frontend
npm run build     # hasil build ada di frontend/dist
npm run preview   # preview hasil build
```

## 6. Environment Variables

### backend/.env
| Variable | Keterangan |
|----------|------------|
| `DATABASE_URL` | Connection string PostgreSQL |
| `PORT` | Port server backend (default 4000) |
| `JWT_SECRET` | Secret key untuk sign JWT (wajib diganti, jangan pakai default) |
| `JWT_EXPIRES_IN` | Masa berlaku token, mis. `1d` |
| `CORS_ORIGIN` | Origin frontend yang diizinkan, mis. `http://localhost:5173` |

### frontend/.env
| Variable | Keterangan |
|----------|------------|
| `VITE_API_URL` | Base URL API backend, mis. `http://localhost:4000/api` |

## 7. Catatan Desain & Keamanan

- Password disimpan sebagai hash bcrypt (10 salt rounds), tidak pernah dikembalikan ke client.
- Setiap route (kecuali `/api/auth/register` & `/api/auth/login`) memerlukan JWT valid.
- Otorisasi berbasis role diterapkan di level route (`authorize('COMPANY')`, dst) **dan**
  diverifikasi ulang di controller (mis. Company hanya bisa melihat/mengubah lamaran pada
  lowongan miliknya sendiri) untuk mencegah IDOR (Insecure Direct Object Reference).
  Perubahan status disimpan bersamaan dengan `application_history` menggunakan
  Prisma transaction agar data selalu konsisten.
- Duplikasi lamaran dicegah di dua lapis: constraint unik di database
  (`@@unique([jobId, jobSeekerId])`) dan pengecekan eksplisit di controller
  agar pesan error lebih ramah pengguna.

## 8. Batasan / Simplifikasi (sesuai catatan assessment)

Untuk menjaga scope tetap sederhana dan fokus pada kualitas inti:
- Tidak ada fitur upload CV/file (bisa ditambahkan sebagai pengembangan lanjutan).
- Profil Company disederhanakan menjadi field `companyName` pada tabel `User`,
  tanpa tabel profil terpisah.
- Tidak ada fitur reset password / verifikasi email.
- Tidak ada pagination (cukup untuk skala data simulasi/demo).
