# Database Setup (Neon) - SHIPIN GO

Folder ini berisi SQL database untuk domain project jasa pengiriman/kurir SHIPIN GO.

## Teknologi

- Next.js
- PostgreSQL Neon
- SQL manual melalui folder `database`
- Tidak menggunakan Prisma, Drizzle, Sequelize, TypeORM, atau migration ORM lain

## File

- `01_schema.sql`: schema idempotent untuk tabel, enum, foreign key, index, relasi one-to-one, one-to-many, dan many-to-many.
- `02_seed.sql`: seed data dummy saling terhubung, minimal 10 data untuk tabel penting.
- `03_check_queries.sql`: query validasi dan cheatsheet untuk Test Query.

## Cara pakai di Neon SQL Editor

1. Jalankan isi `01_schema.sql`.
2. Jalankan isi `02_seed.sql`.
3. Jalankan isi `03_check_queries.sql` untuk bukti jumlah data dan relasi.

File schema dan seed aman dijalankan ulang karena memakai `CREATE IF NOT EXISTS`, `ALTER ... IF NOT EXISTS`, dan `ON CONFLICT`.

## Data Master

- `shipin_users`
- `shipin_addresses`
- `shipin_shipping_services`
- `shipin_package_categories`
- `shipin_hubs`
- `shipin_vehicles`
- `shipin_handling_tags`

## Tabel Transaksi / Proses

- `shipin_shipments`
- `shipin_payments`
- `shipin_tracking_events`
- `shipin_reviews`
- `shipin_contact_messages`
- `shipin_shipping_rate_quotes`

## Junction Table

- `shipin_shipment_handling_tags`

## Relasi utama

- One to Many: `shipin_shipping_services` -> `shipin_shipments`
- One to Many: `shipin_shipments` -> `shipin_tracking_events`
- One to Many: `shipin_users` -> `shipin_addresses`
- One to One: `shipin_shipments` -> `shipin_payments`
- Many to Many: `shipin_shipments` -> `shipin_shipment_handling_tags` -> `shipin_handling_tags`

## Catatan Test Query

Gunakan tabel prefix `shipin_`. Jangan memakai tabel lain tanpa prefix ini jika muncul di database Neon karena kemungkinan berasal dari guided/latihan lama.
