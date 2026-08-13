# API Documentation 

Base URL (development): `http://localhost:4000`

Semua response mengikuti format:

```json
{ "success": true, "message": "...", "data": { } }
```

atau saat error:

```json
{ "success": false, "message": "Pesan error" }
```

Endpoint validasi mengembalikan detail per-field:

```json
{ "success": false, "message": "Validation error", "errors": [{ "path": "body.email", "message": "Email tidak valid" }] }
```

## Autentikasi

Semua endpoint (kecuali `POST /auth/register` dan `POST /auth/login`) memerlukan header:

```
Authorization: Bearer <JWT_TOKEN>
```

Token didapat dari response login/register, berlaku sesuai `JWT_EXPIRES_IN` (default 1 hari).

---

## 1. Auth

### POST /api/auth/register
Mendaftarkan akun baru sebagai Job Seeker atau Company.

**Body**
```json
{
  "email": "budi@example.com",
  "password": "rahasia123",
  "name": "Budi Santoso",
  "role": "JOB_SEEKER",       // "JOB_SEEKER" | "COMPANY"
  "companyName": "PT ABC"      // wajib jika role = COMPANY
}
```

**Response 201**
```json
{
  "success": true,
  "message": "Registrasi berhasil",
  "data": {
    "user": { "id": "...", "email": "budi@example.com", "name": "Budi Santoso", "role": "JOB_SEEKER", "companyName": null },
    "token": "eyJhbGciOi..."
  }
}
```

**Error**: `409` jika email sudah terdaftar, `400` jika validasi gagal.

---

### POST /api/auth/login

**Body**
```json
{ "email": "budi@example.com", "password": "rahasia123" }
```

**Response 200**: sama seperti register (`user` + `token`).
**Error**: `401` jika email/password salah.

---

### GET /api/auth/me
Mengambil data user yang sedang login (dari token).

**Header**: `Authorization: Bearer <token>`

**Response 200**
```json
{ "success": true, "data": { "user": { "id": "...", "email": "...", "name": "...", "role": "...", "companyName": null } } }
```

---

## 2. Jobs

Semua endpoint di bawah ini butuh auth (`Authorization: Bearer <token>`).

### GET /api/jobs
Daftar semua lowongan aktif. Bisa diakses Job Seeker maupun Company.

**Query params (opsional)**
| Param | Keterangan |
|-------|------------|
| `search` | Cari berdasarkan judul pekerjaan |
| `location` | Filter berdasarkan lokasi (partial match) |
| `jobType` | `FULL_TIME` \| `PART_TIME` \| `CONTRACT` \| `INTERNSHIP` \| `FREELANCE` |

**Response 200**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Backend Developer",
      "description": "...",
      "location": "Yogyakarta",
      "salary": "Rp 7.000.000 - Rp 10.000.000",
      "jobType": "FULL_TIME",
      "isActive": true,
      "createdAt": "2026-08-01T00:00:00.000Z",
      "companyId": "uuid",
      "company": { "id": "uuid", "name": "HR TechCorp", "companyName": "TechCorp Indonesia" }
    }
  ]
}
```

---

### GET /api/jobs/:id
Detail satu lowongan.

**Response 200**: object job (sama seperti item di atas).
**Error**: `404` jika tidak ditemukan.

---

### POST /api/jobs
Membuat lowongan baru. **Role: COMPANY**.

**Body**
```json
{
  "title": "Backend Developer",
  "description": "Membangun dan memelihara REST API...",
  "location": "Yogyakarta",
  "salary": "Rp 7.000.000 - Rp 10.000.000",
  "jobType": "FULL_TIME"
}
```

**Response 201**: job yang baru dibuat.
**Error**: `403` jika role bukan COMPANY, `400` jika validasi gagal.

---

### PATCH /api/jobs/:id
Mengubah lowongan (judul, deskripsi, lokasi, salary, jobType, isActive). **Role: COMPANY**, hanya pemilik lowongan.

**Body** (semua field opsional, kirim yang ingin diubah)
```json
{ "isActive": false }
```

**Response 200**: job yang sudah diperbarui.
**Error**: `403` jika bukan pemilik, `404` jika tidak ditemukan.

---

### GET /api/jobs/company/mine
Daftar lowongan milik company yang sedang login, termasuk jumlah pelamar. **Role: COMPANY**.

**Response 200**
```json
{
  "success": true,
  "data": [
    { "id": "uuid", "title": "Backend Developer", "...": "...", "_count": { "applications": 3 } }
  ]
}
```

---

## 3. Applications

### POST /api/applications
Job Seeker melamar sebuah lowongan. **Role: JOB_SEEKER**.

**Body**
```json
{ "jobId": "uuid-lowongan" }
```

**Response 201**
```json
{
  "success": true,
  "message": "Lamaran berhasil dikirim",
  "data": {
    "id": "uuid",
    "status": "APPLIED",
    "jobId": "uuid",
    "jobSeekerId": "uuid",
    "job": { "...": "..." },
    "history": [{ "id": "uuid", "status": "APPLIED", "note": "Lamaran dikirim", "changedAt": "..." }]
  }
}
```

**Error**:
- `404` jika lowongan tidak ditemukan / tidak aktif
- `409` jika job seeker sudah pernah melamar lowongan ini sebelumnya (requirement #5)

---

### GET /api/applications/mine
Daftar lamaran milik Job Seeker yang sedang login, beserta status terkini. **Role: JOB_SEEKER**.

**Response 200**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "status": "REVIEWING",
      "createdAt": "...",
      "job": {
        "id": "uuid", "title": "Backend Developer", "location": "Yogyakarta",
        "company": { "id": "uuid", "name": "HR TechCorp", "companyName": "TechCorp Indonesia" }
      }
    }
  ]
}
```

---

### GET /api/applications/:id/history
Riwayat lengkap perubahan status suatu lamaran (requirement #9), diurutkan dari yang paling awal.
Bisa diakses oleh Job Seeker pemilik lamaran ATAU Company pemilik lowongan.

**Response 200**
```json
{
  "success": true,
  "data": [
    { "id": "uuid", "status": "APPLIED", "note": "Lamaran dikirim", "changedAt": "2026-08-01T10:00:00.000Z" },
    { "id": "uuid", "status": "REVIEWING", "note": null, "changedAt": "2026-08-02T09:00:00.000Z" }
  ]
}
```

**Error**: `403` jika bukan job seeker pemilik atau company pemilik lowongan terkait.

---

### GET /api/applications/job/:jobId
Daftar kandidat yang melamar pada lowongan tertentu. **Role: COMPANY**, hanya pemilik lowongan.

**Response 200**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "status": "APPLIED",
      "createdAt": "...",
      "jobSeeker": { "id": "uuid", "name": "Budi Santoso", "email": "budi@example.com" }
    }
  ]
}
```

**Error**: `403` jika bukan pemilik lowongan, `404` jika lowongan tidak ditemukan.

---

### PATCH /api/applications/:id/status
Mengubah status kandidat. **Role: COMPANY**, hanya pemilik lowongan terkait.
Setiap perubahan otomatis dicatat ke `application_history` (transaksi atomik).

**Body**
```json
{ "status": "SHORTLISTED", "note": "Lolos tahap screening CV" }
```

Status yang valid: `APPLIED`, `REVIEWING`, `SHORTLISTED`, `REJECTED`, `ACCEPTED`.

**Response 200**
```json
{ "success": true, "message": "Status lamaran berhasil diperbarui", "data": { "id": "uuid", "status": "SHORTLISTED", "...": "..." } }
```

**Error**: `403` jika bukan pemilik lowongan terkait, `404` jika lamaran tidak ditemukan.

---

## 4. Ringkasan Kode Status HTTP

| Kode | Arti |
|------|------|
| 200 | Berhasil (GET/PATCH) |
| 201 | Berhasil membuat resource baru (POST) |
| 400 | Request tidak valid / gagal validasi |
| 401 | Belum login / token tidak valid atau kedaluwarsa |
| 403 | Tidak punya izin (role salah atau bukan pemilik resource) |
| 404 | Resource tidak ditemukan |
| 409 | Konflik (email sudah terdaftar / sudah pernah melamar) |
| 500 | Kesalahan server internal |
