# Database Setup (Neon) - SHIPIN GO

Folder ini berisi SQL yang sudah disesuaikan dengan fitur project:
- Kirim paket
- Lacak paket (tracking event)
- Ulasan
- Kontak
- Cek ongkir
- Peran akun (admin/customer/courier)

## File
- `01_schema.sql`: Membuat tabel + relasi (foreign key).
- `02_seed.sql`: Mengisi data dummy yang relevan.
- `03_check_queries.sql`: Query validasi untuk bukti screenshot.

## Cara pakai di Neon SQL Editor
1. Jalankan isi `01_schema.sql`.
2. Jalankan isi `02_seed.sql`.
3. Jalankan isi `03_check_queries.sql` untuk verifikasi data.

## Relasi utama
- `users` 1..N `addresses`
- `users (customer)` 1..N `shipments`
- `users (courier)` 1..N `shipments`
- `shipping_services` 1..N `shipments`
- `shipments` 1..N `tracking_events`
- `shipments` 1..N `reviews`
- `users` 1..N `reviews`
- `users` 1..N `contact_messages` (opsional jika pengirim terdaftar)
- `shipping_services` 1..N `shipping_rate_quotes`
