-- 1) Cek jumlah data per tabel
SELECT 'shipin_users' AS table_name, COUNT(*) AS total FROM shipin_users
UNION ALL
SELECT 'shipin_addresses', COUNT(*) FROM shipin_addresses
UNION ALL
SELECT 'shipin_shipping_services', COUNT(*) FROM shipin_shipping_services
UNION ALL
SELECT 'shipin_shipments', COUNT(*) FROM shipin_shipments
UNION ALL
SELECT 'shipin_tracking_events', COUNT(*) FROM shipin_tracking_events
UNION ALL
SELECT 'shipin_reviews', COUNT(*) FROM shipin_reviews
UNION ALL
SELECT 'shipin_contact_messages', COUNT(*) FROM shipin_contact_messages
UNION ALL
SELECT 'shipin_shipping_rate_quotes', COUNT(*) FROM shipin_shipping_rate_quotes;

-- 2) Bukti relasi shipment -> customer -> service -> asal/tujuan -> courier
SELECT
  s.resi_code,
  c.full_name AS customer_name,
  sv.display_name AS service_name,
  oa.city AS origin_city,
  da.city AS destination_city,
  co.full_name AS courier_name,
  s.payment_status,
  s.shipment_status,
  s.total_amount
FROM shipin_shipments s
JOIN shipin_users c ON c.id = s.customer_id
LEFT JOIN shipin_users co ON co.id = s.courier_id
JOIN shipin_shipping_services sv ON sv.id = s.service_id
JOIN shipin_addresses oa ON oa.id = s.origin_address_id
JOIN shipin_addresses da ON da.id = s.destination_address_id
ORDER BY s.created_at DESC;

-- 3) Tracking timeline per resi
SELECT
  s.resi_code,
  te.event_status,
  te.location_label,
  te.occurred_at
FROM shipin_tracking_events te
JOIN shipin_shipments s ON s.id = te.shipment_id
WHERE s.resi_code = 'SPG-99281-ID'
ORDER BY te.occurred_at ASC;

-- 4) Ulasan customer per shipment
SELECT
  r.id,
  u.full_name AS customer_name,
  s.resi_code,
  r.stars,
  r.is_visible,
  r.review_text,
  r.created_at
FROM shipin_reviews r
JOIN shipin_users u ON u.id = r.customer_id
LEFT JOIN shipin_shipments s ON s.id = r.shipment_id
ORDER BY r.created_at DESC;
