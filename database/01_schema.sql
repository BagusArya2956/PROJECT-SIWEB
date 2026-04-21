CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'shipin_user_role') THEN
    CREATE TYPE shipin_user_role AS ENUM ('ADMIN', 'CUSTOMER', 'COURIER');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'shipin_payment_status') THEN
    CREATE TYPE shipin_payment_status AS ENUM ('LUNAS', 'BELUM_BAYAR');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'shipin_shipment_status') THEN
    CREATE TYPE shipin_shipment_status AS ENUM ('DIJADWALKAN', 'DALAM_PERJALANAN', 'SAMPAI');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'shipin_message_status') THEN
    CREATE TYPE shipin_message_status AS ENUM ('OPEN', 'IN_PROGRESS', 'CLOSED');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS shipin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role shipin_user_role NOT NULL,
  password_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shipin_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES shipin_users(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  postal_code TEXT,
  detail_address TEXT NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shipin_shipping_services (
  id SMALLSERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT NOT NULL,
  eta_min_days INT NOT NULL,
  eta_max_days INT NOT NULL,
  price_multiplier NUMERIC(6,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS shipin_shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resi_code TEXT NOT NULL UNIQUE,
  customer_id UUID NOT NULL REFERENCES shipin_users(id),
  courier_id UUID REFERENCES shipin_users(id),
  service_id SMALLINT NOT NULL REFERENCES shipin_shipping_services(id),
  origin_address_id UUID NOT NULL REFERENCES shipin_addresses(id),
  destination_address_id UUID NOT NULL REFERENCES shipin_addresses(id),
  package_type TEXT NOT NULL,
  weight_kg NUMERIC(8,2) NOT NULL CHECK (weight_kg > 0),
  length_cm NUMERIC(8,2),
  width_cm NUMERIC(8,2),
  height_cm NUMERIC(8,2),
  total_amount NUMERIC(14,2) NOT NULL CHECK (total_amount >= 0),
  payment_status shipin_payment_status NOT NULL DEFAULT 'BELUM_BAYAR',
  shipment_status shipin_shipment_status NOT NULL DEFAULT 'DIJADWALKAN',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  estimated_arrival_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS shipin_tracking_events (
  id BIGSERIAL PRIMARY KEY,
  shipment_id UUID NOT NULL REFERENCES shipin_shipments(id) ON DELETE CASCADE,
  event_status TEXT NOT NULL,
  description TEXT NOT NULL,
  location_label TEXT NOT NULL,
  lat NUMERIC(9,6),
  lng NUMERIC(9,6),
  occurred_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_shipin_tracking_events_shipment_time
  ON shipin_tracking_events (shipment_id, occurred_at DESC);

CREATE TABLE IF NOT EXISTS shipin_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID REFERENCES shipin_shipments(id) ON DELETE SET NULL,
  customer_id UUID NOT NULL REFERENCES shipin_users(id) ON DELETE CASCADE,
  stars INT NOT NULL CHECK (stars BETWEEN 1 AND 5),
  review_text TEXT NOT NULL,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shipin_contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES shipin_users(id) ON DELETE SET NULL,
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message_text TEXT NOT NULL,
  status shipin_message_status NOT NULL DEFAULT 'OPEN',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS shipin_shipping_rate_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  origin_city TEXT NOT NULL,
  destination_city TEXT NOT NULL,
  weight_kg NUMERIC(8,2) NOT NULL CHECK (weight_kg > 0),
  length_cm NUMERIC(8,2),
  width_cm NUMERIC(8,2),
  height_cm NUMERIC(8,2),
  selected_service_id SMALLINT REFERENCES shipin_shipping_services(id),
  estimated_cost NUMERIC(14,2) NOT NULL CHECK (estimated_cost >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
