-- 1) Cek jumlah data setiap tabel penting
SELECT 'shipin_users' AS table_name, COUNT(*) AS total FROM shipin_users
UNION ALL SELECT 'shipin_addresses', COUNT(*) FROM shipin_addresses
UNION ALL SELECT 'shipin_shipping_services', COUNT(*) FROM shipin_shipping_services
UNION ALL SELECT 'shipin_package_categories', COUNT(*) FROM shipin_package_categories
UNION ALL SELECT 'shipin_hubs', COUNT(*) FROM shipin_hubs
UNION ALL SELECT 'shipin_vehicles', COUNT(*) FROM shipin_vehicles
UNION ALL SELECT 'shipin_handling_tags', COUNT(*) FROM shipin_handling_tags
UNION ALL SELECT 'shipin_shipments', COUNT(*) FROM shipin_shipments
UNION ALL SELECT 'shipin_payments', COUNT(*) FROM shipin_payments
UNION ALL SELECT 'shipin_shipment_handling_tags', COUNT(*) FROM shipin_shipment_handling_tags
UNION ALL SELECT 'shipin_tracking_events', COUNT(*) FROM shipin_tracking_events
UNION ALL SELECT 'shipin_reviews', COUNT(*) FROM shipin_reviews
UNION ALL SELECT 'shipin_contact_messages', COUNT(*) FROM shipin_contact_messages
UNION ALL SELECT 'shipin_shipping_rate_quotes', COUNT(*) FROM shipin_shipping_rate_quotes
ORDER BY table_name;

-- 2) Cek Data Master
SELECT id, code, display_name, eta_min_days, eta_max_days, price_multiplier
FROM shipin_shipping_services
ORDER BY id;

SELECT id, code, display_name, base_insurance_rate
FROM shipin_package_categories
ORDER BY id;

SELECT id, code, hub_name, city, province
FROM shipin_hubs
ORDER BY id;

SELECT v.id, v.vehicle_name, v.plate_number, v.vehicle_type, v.capacity_kg, v.vehicle_status, h.hub_name AS home_hub
FROM shipin_vehicles v
JOIN shipin_hubs h ON h.id = v.home_hub_id
ORDER BY v.id;

SELECT id, code, display_name
FROM shipin_handling_tags
ORDER BY id;

-- 3) Bukti One to Many: satu service punya banyak shipment
SELECT
  sv.code AS service_code,
  sv.display_name AS service_name,
  COUNT(s.id) AS total_shipments,
  SUM(s.total_amount) AS total_revenue
FROM shipin_shipping_services sv
LEFT JOIN shipin_shipments s ON s.service_id = sv.id
GROUP BY sv.id, sv.code, sv.display_name
ORDER BY total_shipments DESC, sv.code;

-- 4) Bukti One to One: satu shipment punya satu payment
SELECT
  s.resi_code,
  p.invoice_number,
  p.payment_method,
  p.amount,
  p.payment_status,
  p.paid_at
FROM shipin_shipments s
JOIN shipin_payments p ON p.shipment_id = s.id
ORDER BY s.created_at DESC;

-- 5) Bukti Many to Many: shipment punya banyak handling tag lewat junction table
SELECT
  s.resi_code,
  s.package_type,
  STRING_AGG(ht.display_name, ', ' ORDER BY ht.display_name) AS handling_tags
FROM shipin_shipments s
JOIN shipin_shipment_handling_tags sht ON sht.shipment_id = s.id
JOIN shipin_handling_tags ht ON ht.id = sht.handling_tag_id
GROUP BY s.id, s.resi_code, s.package_type
ORDER BY s.resi_code;

-- 6) Tabel penting yang masih kosong
WITH table_counts AS (
  SELECT 'shipin_users' AS table_name, COUNT(*) AS total FROM shipin_users
  UNION ALL SELECT 'shipin_addresses', COUNT(*) FROM shipin_addresses
  UNION ALL SELECT 'shipin_shipping_services', COUNT(*) FROM shipin_shipping_services
  UNION ALL SELECT 'shipin_package_categories', COUNT(*) FROM shipin_package_categories
  UNION ALL SELECT 'shipin_hubs', COUNT(*) FROM shipin_hubs
  UNION ALL SELECT 'shipin_vehicles', COUNT(*) FROM shipin_vehicles
  UNION ALL SELECT 'shipin_handling_tags', COUNT(*) FROM shipin_handling_tags
  UNION ALL SELECT 'shipin_shipments', COUNT(*) FROM shipin_shipments
  UNION ALL SELECT 'shipin_payments', COUNT(*) FROM shipin_payments
  UNION ALL SELECT 'shipin_shipment_handling_tags', COUNT(*) FROM shipin_shipment_handling_tags
  UNION ALL SELECT 'shipin_tracking_events', COUNT(*) FROM shipin_tracking_events
  UNION ALL SELECT 'shipin_reviews', COUNT(*) FROM shipin_reviews
  UNION ALL SELECT 'shipin_contact_messages', COUNT(*) FROM shipin_contact_messages
  UNION ALL SELECT 'shipin_shipping_rate_quotes', COUNT(*) FROM shipin_shipping_rate_quotes
)
SELECT *
FROM table_counts
WHERE total = 0
ORDER BY table_name;

-- 7) Foreign key yang tidak terhubung atau wajibnya kosong
SELECT s.resi_code, 'missing customer' AS issue
FROM shipin_shipments s
LEFT JOIN shipin_users u ON u.id = s.customer_id
WHERE u.id IS NULL
UNION ALL
SELECT s.resi_code, 'missing service'
FROM shipin_shipments s
LEFT JOIN shipin_shipping_services sv ON sv.id = s.service_id
WHERE sv.id IS NULL
UNION ALL
SELECT s.resi_code, 'missing origin address'
FROM shipin_shipments s
LEFT JOIN shipin_addresses a ON a.id = s.origin_address_id
WHERE a.id IS NULL
UNION ALL
SELECT s.resi_code, 'missing destination address'
FROM shipin_shipments s
LEFT JOIN shipin_addresses a ON a.id = s.destination_address_id
WHERE a.id IS NULL
UNION ALL
SELECT s.resi_code, 'missing one-to-one payment'
FROM shipin_shipments s
LEFT JOIN shipin_payments p ON p.shipment_id = s.id
WHERE p.id IS NULL;

-- 8) Sample JOIN lengkap untuk Test Query
SELECT
  s.resi_code,
  c.full_name AS customer_name,
  co.full_name AS courier_name,
  sv.display_name AS service_name,
  pc.display_name AS package_category,
  oa.city AS origin_city,
  da.city AS destination_city,
  oh.hub_name AS origin_hub,
  dh.hub_name AS destination_hub,
  v.plate_number,
  p.invoice_number,
  p.payment_method,
  s.payment_status,
  s.item_status,
  s.shipment_status,
  s.total_amount,
  s.created_at
FROM shipin_shipments s
JOIN shipin_users c ON c.id = s.customer_id
LEFT JOIN shipin_users co ON co.id = s.courier_id
JOIN shipin_shipping_services sv ON sv.id = s.service_id
JOIN shipin_package_categories pc ON pc.id = s.package_category_id
JOIN shipin_addresses oa ON oa.id = s.origin_address_id
JOIN shipin_addresses da ON da.id = s.destination_address_id
JOIN shipin_hubs oh ON oh.id = s.origin_hub_id
JOIN shipin_hubs dh ON dh.id = s.destination_hub_id
JOIN shipin_vehicles v ON v.id = s.vehicle_id
JOIN shipin_payments p ON p.shipment_id = s.id
ORDER BY s.created_at DESC;

-- 9) Tracking timeline per resi
SELECT
  s.resi_code,
  te.event_status,
  te.location_label,
  te.occurred_at
FROM shipin_tracking_events te
JOIN shipin_shipments s ON s.id = te.shipment_id
WHERE s.resi_code = 'SPG-99281-ID'
ORDER BY te.occurred_at ASC;

-- 10) Ranking customer berdasarkan transaksi
SELECT
  u.full_name,
  COUNT(s.id) AS total_shipments,
  SUM(s.total_amount) AS total_spent
FROM shipin_users u
JOIN shipin_shipments s ON s.customer_id = u.id
WHERE u.role = 'CUSTOMER'
GROUP BY u.id, u.full_name
ORDER BY total_spent DESC;
