INSERT INTO shipin_users (id, full_name, email, phone, role, password_hash)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Admin Shipin', 'admin@shipingo.id', '0215007447', 'ADMIN', 'hashed_admin_123'),
  ('22222222-2222-2222-2222-222222222221', 'Budi Santoso', 'budi.santoso@mail.id', '081200000001', 'CUSTOMER', 'hashed_customer_budi'),
  ('22222222-2222-2222-2222-222222222222', 'Siti Aminah', 'siti.aminah@mail.id', '081300000001', 'CUSTOMER', 'hashed_customer_siti'),
  ('33333333-3333-3333-3333-333333333331', 'Andi Kurir', 'andi.kurir@shipingo.id', '081211112222', 'COURIER', 'hashed_courier_andi')
ON CONFLICT (id) DO NOTHING;

INSERT INTO shipin_addresses (id, user_id, label, city, province, postal_code, detail_address, is_primary)
VALUES
  ('44444444-4444-4444-4444-444444444441', '22222222-2222-2222-2222-222222222221', 'Rumah', 'Jakarta Selatan', 'DKI Jakarta', '12190', 'Jl. Mampang Prapatan No. 15', TRUE),
  ('44444444-4444-4444-4444-444444444442', '22222222-2222-2222-2222-222222222222', 'Rumah', 'Surabaya', 'Jawa Timur', '60231', 'Jl. Darmo Permai Blok B1', TRUE),
  ('44444444-4444-4444-4444-444444444443', '33333333-3333-3333-3333-333333333331', 'Base Kurir', 'Surabaya', 'Jawa Timur', '60119', 'Hub SHIPIN GO Surabaya', TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO shipin_shipping_services (id, code, display_name, description, eta_min_days, eta_max_days, price_multiplier)
VALUES
  (1, 'REGULER', 'Layanan Reguler', 'Keseimbangan terbaik antara harga dan kecepatan.', 2, 3, 1.00),
  (2, 'EKSPRES', 'Layanan Express', 'Pengiriman prioritas untuk kebutuhan mendesak.', 1, 1, 1.55),
  (3, 'HEMAT', 'Layanan Hemat', 'Pengiriman ekonomis untuk paket non-prioritas.', 4, 7, 0.72)
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code,
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  eta_min_days = EXCLUDED.eta_min_days,
  eta_max_days = EXCLUDED.eta_max_days,
  price_multiplier = EXCLUDED.price_multiplier;

INSERT INTO shipin_shipments (
  id,
  resi_code,
  customer_id,
  courier_id,
  service_id,
  origin_address_id,
  destination_address_id,
  package_type,
  weight_kg,
  length_cm,
  width_cm,
  height_cm,
  total_amount,
  payment_status,
  shipment_status,
  created_at,
  estimated_arrival_at
)
VALUES
  (
    '55555555-5555-5555-5555-555555555551',
    'SPG-99281-ID',
    '22222222-2222-2222-2222-222222222221',
    '33333333-3333-3333-3333-333333333331',
    2,
    '44444444-4444-4444-4444-444444444441',
    '44444444-4444-4444-4444-444444444442',
    'Dokumen Kontrak',
    2.50,
    35,
    25,
    15,
    1450000,
    'LUNAS',
    'DALAM_PERJALANAN',
    '2026-04-20 08:00:00+07',
    '2026-04-21 20:00:00+07'
  ),
  (
    '55555555-5555-5555-5555-555555555552',
    'SPG-88172-ID',
    '22222222-2222-2222-2222-222222222222',
    NULL,
    1,
    '44444444-4444-4444-4444-444444444442',
    '44444444-4444-4444-4444-444444444441',
    'Barang Retail',
    6.40,
    60,
    40,
    45,
    5200000,
    'BELUM_BAYAR',
    'DIJADWALKAN',
    '2026-04-20 09:10:00+07',
    '2026-04-23 18:00:00+07'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO shipin_tracking_events (shipment_id, event_status, description, location_label, lat, lng, occurred_at)
VALUES
  (
    '55555555-5555-5555-5555-555555555551',
    'Pesanan diterima',
    'Pesanan telah dipindai dan masuk dalam sistem manifest utama.',
    'Jakarta Selatan',
    -6.243000,
    106.825000,
    '2026-04-20 08:05:00+07'
  ),
  (
    '55555555-5555-5555-5555-555555555551',
    'Diproses di warehouse',
    'Sortir paket berdasarkan wilayah tujuan selesai dilakukan.',
    'Jakarta Selatan Warehouse',
    -6.237000,
    106.833000,
    '2026-04-20 08:50:00+07'
  ),
  (
    '55555555-5555-5555-5555-555555555551',
    'Berangkat dari hub',
    'Paket berangkat dari hub asal menuju fasilitas transit resmi.',
    'Jakarta Hub',
    -6.210000,
    106.845000,
    '2026-04-20 09:35:00+07'
  ),
  (
    '55555555-5555-5555-5555-555555555551',
    'Tiba di transit',
    'Paket tiba di pusat transit dan siap diteruskan ke area tujuan.',
    'Transit Semarang',
    -6.966700,
    110.416700,
    '2026-04-20 13:10:00+07'
  ),
  (
    '55555555-5555-5555-5555-555555555551',
    'Sedang dikirim',
    'Kurir sedang mengantar paket ke alamat penerima.',
    'Area Surabaya',
    -7.265000,
    112.734000,
    '2026-04-20 18:45:00+07'
  ),
  (
    '55555555-5555-5555-5555-555555555552',
    'Pesanan diterima',
    'Pesanan diterima dan menunggu jadwal pickup.',
    'Surabaya',
    -7.257500,
    112.752100,
    '2026-04-20 09:20:00+07'
  )
ON CONFLICT DO NOTHING;

INSERT INTO shipin_reviews (id, shipment_id, customer_id, stars, review_text, is_visible, created_at)
VALUES
  (
    '66666666-6666-6666-6666-666666666661',
    '55555555-5555-5555-5555-555555555551',
    '22222222-2222-2222-2222-222222222221',
    5,
    'Pengiriman sangat cepat dan kurir ramah. Paket sampai rapi tanpa kerusakan.',
    TRUE,
    '2026-04-21 09:20:00+07'
  ),
  (
    '66666666-6666-6666-6666-666666666662',
    '55555555-5555-5555-5555-555555555552',
    '22222222-2222-2222-2222-222222222222',
    3,
    'Estimasi sedikit meleset, tapi paket aman. Tracking perlu ditingkatkan.',
    FALSE,
    '2026-04-21 10:10:00+07'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO shipin_contact_messages (
  id,
  customer_id,
  sender_name,
  sender_email,
  subject,
  message_text,
  status,
  created_at
)
VALUES
  (
    '77777777-7777-7777-7777-777777777771',
    '22222222-2222-2222-2222-222222222221',
    'Budi Santoso',
    'budi.santoso@mail.id',
    'Pengiriman Domestik',
    'Mohon info kapan kurir sampai ke alamat penerima untuk resi SPG-99281-ID.',
    'IN_PROGRESS',
    '2026-04-21 08:40:00+07'
  ),
  (
    '77777777-7777-7777-7777-777777777772',
    NULL,
    'Rina Kartika',
    'rina.kartika@mail.id',
    'Klaim & Refund',
    'Saya ingin menanyakan prosedur klaim jika paket terlambat.',
    'OPEN',
    '2026-04-21 11:15:00+07'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO shipin_shipping_rate_quotes (
  id,
  origin_city,
  destination_city,
  weight_kg,
  length_cm,
  width_cm,
  height_cm,
  selected_service_id,
  estimated_cost,
  created_at
)
VALUES
  (
    '88888888-8888-8888-8888-888888888881',
    'Jakarta',
    'Surabaya',
    2.50,
    35,
    25,
    15,
    1,
    42300,
    '2026-04-21 08:00:00+07'
  ),
  (
    '88888888-8888-8888-8888-888888888882',
    'Bandung',
    'Medan',
    6.40,
    60,
    40,
    45,
    2,
    112700,
    '2026-04-21 08:25:00+07'
  )
ON CONFLICT (id) DO NOTHING;
