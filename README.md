# 🛒 POS (Point of Sale) Web Application

Aplikasi Sistem Kasir / Point of Sale (POS) modern berbasis web yang dirancang untuk mengelola master data produk, pengadaan stok (*restock*), transaksi penjualan dengan pembuatan kode transaksi unik otomatis, kalkulasi diskon otomatis berdasarkan rentang waktu, serta visualisasi data omset penjualan harian secara *real-time*.

Aplikasi ini dibangun menggunakan **Laravel 12** sebagai RESTful API backend dan **React** (Vite + Tailwind CSS) sebagai frontend SPA (Single Page Application).

---

## 📸 Fitur Utama

- **Dashboard Analytic:**
  - Grafik tren omset penjualan interaktif (*Recharts*) yang dikelompokkan berdasarkan tanggal transaksi aktual.
  - Filter kustom rentang tanggal omset penjualan.
  - Ringkasan total omset & daftar 5 transaksi terakhir.
- **Master Produk (CRUD):**
  - Manajemen data produk dengan pemisah ribuan otomatis (*thousand separator*) pada input harga.
  - Validasi stok minimal 0.
- **Pengadaan Barang / Restock (CRUD):**
  - Catat riwayat stok masuk barang.
  - Otomatis menambah jumlah stok produk yang tersedia.
- **Transaksi Penjualan (CRUD):**
  - Input transaksi penjualan dengan fleksibilitas tanggal transaksi (masa lalu/saat ini).
  - Penentuan kode transaksi unik otomatis berformat `TRX-YYYYMMDD-PRD[ID]-[RANDOM]` (Contoh: `TRX-20261102-PRD1-A9F2X`).
  - Pemotongan stok otomatis saat penjualan dicatat.
  - Restorasi (pengembalian) stok otomatis ke master produk jika transaksi penjualan dibatalkan/dihapus.
  - Penerapan diskon otomatis secara *real-time* jika tanggal transaksi berada dalam periode diskon aktif.
- **Manajemen Diskon (CRUD):**
  - Buat konfigurasi diskon persentase (`%`) berdasarkan rentang `start_date` dan `end_date`.
  - Pelacakan jumlah kali diskon digunakan (*total used*).
- **RESTful API Endpoint:**
  - Endpoint `GET /api/products/{id}` yang menyediakan detail produk lengkap beserta status & kalkulasi diskon aktif.
- **UI/UX Modern:**
  - Modal interaktif reusable (Form Edit Modal & Alert Confirm Delete Modal).
  - Fitur pencarian (*Search Bar*) di setiap modul CRUD.
  - Notifikasi Toast interaktif (*React-Toastify*).

---

## 🛠️ Tech Stack & Persyaratan Sistem

### Backend & Database
- **Framework:** Laravel 12.x
- **Language:** PHP >= 8.2
- **Database:** SQLite (Default) / MySQL
- **Authentication:** Laravel Session / Sanctum

### Frontend
- **Library/Framework:** React 18+ (Vite)
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Charts:** Recharts
- **HTTP Client:** Axios
- **Notifications:** React-Toastify

---

## 📋 Prasyarat Instalasi (Prerequisites)

Sebelum menjalankan proyek ini, pastikan sistem kamu telah terinstal tools berikut:
- [PHP](https://www.php.net/) (v8.2 atau lebih baru)
- [Composer](https://getcomposer.org/) (Package Manager PHP)
- [Node.js](https://nodejs.org/) (v18.x atau lebih baru) & NPM
- [Git](https://git-scm.com/)

---

## 🚀 Panduan Instalasi & Menjalankan Proyek

Ikuti langkah-langkah di bawah ini untuk mengkloning dan menjalankan proyek di lingkungan lokal:

### 1. Kloning Repositori
```bash
git clone [https://github.com/username-kamu/crud-api.git](https://github.com/username-kamu/crud-api.git)
cd crud-api

```

### 2. Instal Dependency Backend (PHP)

```bash
composer install

```

### 3. Instal Dependency Frontend (Node.js)

```bash
npm install

```

### 4. Konfigurasi Environment File

Salin file `.env.example` menjadi `.env`:

```bash
cp .env.example .env

```

Buka file `.env` dan pastikan konfigurasi database SQLite serta session driver disesuaikan seperti berikut:

```env
APP_NAME="Laravel POS"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=[http://127.0.0.1:8000](http://127.0.0.1:8000)

DB_CONNECTION=sqlite
# Kosongkan DB_DATABASE jika menggunakan database/database.sqlite default

SESSION_DRIVER=database

```

Generate App Encryption Key:

```bash
php artisan key:generate

```

### 5. Setup Database SQLite

Jika file database SQLite belum ada, buat file kosong secara manual di folder `database/`:

* **Windows (PowerShell):**
```powershell
New-Item -ItemType File -Path database\database.sqlite

```


* **Linux / MacOS / Git Bash:**
```bash
touch database/database.sqlite

```



Jalankan migrasi database:

```bash
php artisan migrate:fresh

```

---

## 💻 Menjalankan Aplikasi (Development Mode)

Aplikasi membutuhkan **dua server** yang berjalan secara bersamaan (Backend API Server & Vite Dev Server).

Buka **dua terminal terpisah** di direktori proyek kamu:

#### Terminal 1: Laravel Backend Server

```bash
php artisan serve

```

*Server Laravel akan berjalan di: `http://127.0.0.1:8000*`

#### Terminal 2: Vite Frontend Hot-Reload

```bash
npm run dev

```

Buka browser kamu dan akses alamat:

```text
[http://127.0.0.1:8000](http://127.0.0.1:8000)

```

---

## 📡 Dokumentasi RESTful API Endpoint

Berikut adalah daftar endpoint API utama yang tersedia:

| Method | Endpoint | Deskripsi |
| --- | --- | --- |
| `GET` | `/api/dashboard` | Mengambil data omset penjualan, chart data, & 5 transaksi terakhir |
| `GET` | `/api/products` | Mengambil semua daftar produk master |
| `POST` | `/api/products` | Menambahkan produk master baru |
| `GET` | `/api/products/{id}` | Mengambil detail produk beserta informasi diskon aktif |
| `PUT` | `/api/products/{id}` | Memperbarui data produk master |
| `DELETE` | `/api/products/{id}` | Menghapus produk master |
| `GET` | `/api/stocks` | Mengambil riwayat pengadaan stok |
| `POST` | `/api/stocks` | Menambahkan stok barang (*restock*) |
| `DELETE` | `/api/stocks/{id}` | Menghapus riwayat pengadaan |
| `GET` | `/api/sales` | Mengambil semua transaksi penjualan |
| `POST` | `/api/sales` | Mencatat transaksi penjualan baru |
| `DELETE` | `/api/sales/{id}` | Membatalkan transaksi penjualan & mengembalikan stok |
| `GET` | `/api/discounts` | Mengambil daftar konfigurasi diskon |
| `POST` | `/api/discounts` | Membuat konfigurasi diskon baru |
| `PUT` | `/api/discounts/{id}` | Memperbarui konfigurasi diskon |
| `DELETE` | `/api/discounts/{id}` | Menghapus konfigurasi diskon |

---

## 📂 Struktur Direktori Utama

```text
crud-api/
├── app/
│   ├── Http/Controllers/Api/
│   │   ├── DashboardController.php
│   │   ├── DiscountController.php
│   │   ├── ProductController.php
│   │   ├── SaleController.php
│   │   └── StockController.php
│   └── Models/
│       ├── Discount.php
│       ├── Product.php
│       ├── Sale.php
│       ├── SalesDiscount.php
│       └── Stock.php
├── database/
│   ├── migrations/      # Skema m_products, t_sales, t_stocks, t_discount, dll.
│   └── database.sqlite  # Database file SQLite
├── resources/
│   ├── js/
│   │   ├── components/  # Komponent CRUD & Reusable Modal
│   │   ├── pages/       # Dashboard & MasterIndex
│   │   └── app.jsx      # Root Entry React Component
│   └── views/
│       └── welcome.blade.php
├── routes/
│   ├── api.php          # Definisi Endpoint REST API
│   └── web.php          # Route SPA React Catch-all
└── vite.config.js

```

---

## 📝 Lisensi

Proyek ini dibuat untuk tujuan pembelajaran dan pengembangan open-source di bawah lisensi [MIT License](https://www.google.com/search?q=LICENSE).

```

---

## 🧪 Data Dummy Sparepart (Artisan Command)

Brand: **GS Astra (aki), Denso (busi), Aspira (wiper), Kayaba (shock absorber), Evalube (oli)**, masing-masing 12 produk (motor & mobil), stok acak 100-555 per produk. Harga di katalog hanyalah perkiraan untuk data uji.

```bash
php artisan migrate
php artisan products:generate-dummy            # 60 produk + riwayat stok awal
php artisan sales:generate-dummy               # >= 100 penjualan, Jan-Mei 2026, diskon acak per bulan
```

Opsi `sales:generate-dummy`: `--count=120` (minimal 100), `--from=2026-01`, `--to=2026-05`, `--discounts-per-month=15`, `--fresh` (hapus penjualan & diskon lama, stok dikembalikan).
Opsi `products:generate-dummy`: `--fresh` (hapus semua produk lebih dulu). Perintah aman dijalankan ulang: produk dengan nama yang sama dilewati.

Atau sekaligus lewat seeder: `php artisan db:seed`.

> Factory memakai Faker (paket dev). Jalankan di lingkungan lokal, atau `composer install` tanpa `--no-dev`.

## 📈 Laporan Tren Penjualan

Menu **Laporan tren** (`/report`): chart + tabel dengan filter rentang tanggal, filter produk (semua / beberapa produk), interval bulanan/harian, dan rangkuman total / per merek / per produk. Tabel bisa diunduh sebagai CSV.

| Method | Endpoint | Deskripsi |
| --- | --- | --- |
| `GET` | `/api/reports/sales-trend` | Parameter: `start_date`, `end_date`, `product_ids[]`, `interval` (`month`/`day`), `group_by` (`total`/`brand`/`product`) |

Omset kotor = qty x harga produk saat ini; diskon = persentase pada `t_sales_discount`; omset bersih = kotor - diskon.
