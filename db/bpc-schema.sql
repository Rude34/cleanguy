BEGIN;

CREATE TABLE IF NOT EXISTS bpc_profiles (
  id text PRIMARY KEY,
  username text NOT NULL UNIQUE CHECK (username ~ '^[a-z0-9._-]{3,32}$'),
  display_name text NOT NULL CHECK (char_length(display_name) BETWEEN 1 AND 80),
  role text NOT NULL CHECK (role IN ('admin', 'operator')),
  is_active boolean NOT NULL DEFAULT true,
  password_hash text NOT NULL,
  password_changed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS bpc_single_admin ON bpc_profiles (role) WHERE role = 'admin';

-- Text IDs preserve both UUIDs and older 32-character Blob shift IDs.
CREATE TABLE IF NOT EXISTS bpc_shifts (
  id text PRIMARY KEY,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  started_by text REFERENCES bpc_profiles(id),
  ended_by text REFERENCES bpc_profiles(id),
  CHECK (ended_at IS NULL OR ended_at >= started_at)
);
CREATE UNIQUE INDEX IF NOT EXISTS bpc_single_open_shift ON bpc_shifts ((true)) WHERE ended_at IS NULL;

CREATE TABLE IF NOT EXISTS bpc_table_staff (
  shift_id text NOT NULL REFERENCES bpc_shifts(id),
  table_number smallint NOT NULL CHECK (table_number BETWEEN 7 AND 41),
  staff_name text NOT NULL CHECK (char_length(staff_name) BETWEEN 1 AND 80),
  PRIMARY KEY (shift_id, table_number)
);

-- Lock this singleton row first in every mutation to coordinate separate Functions.
CREATE TABLE IF NOT EXISTS bpc_state (
  singleton boolean PRIMARY KEY DEFAULT true CHECK (singleton),
  active_shift_id text REFERENCES bpc_shifts(id)
);
INSERT INTO bpc_state (singleton) VALUES (true) ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS bpc_records (
  id text PRIMARY KEY,
  shift_id text NOT NULL REFERENCES bpc_shifts(id),
  idempotency_key text,
  table_number smallint NOT NULL CHECK (table_number BETWEEN 7 AND 41),
  bpc_category text NOT NULL,
  quantity integer CHECK (quantity BETWEEN 1 AND 100000),
  operator_id text NOT NULL REFERENCES bpc_profiles(id),
  status text NOT NULL CHECK (status IN ('delivered', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  cancelled_at timestamptz,
  cancelled_by text REFERENCES bpc_profiles(id),
  cancellation_reason text,
  UNIQUE (operator_id, idempotency_key)
);
CREATE INDEX IF NOT EXISTS bpc_records_shift_time ON bpc_records (shift_id, created_at DESC);
CREATE INDEX IF NOT EXISTS bpc_records_time ON bpc_records (created_at DESC);

CREATE TABLE IF NOT EXISTS bpc_audit (
  id text PRIMARY KEY,
  actor_id text REFERENCES bpc_profiles(id),
  action text NOT NULL,
  record_id text REFERENCES bpc_records(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  detail text NOT NULL
);
CREATE INDEX IF NOT EXISTS bpc_audit_time ON bpc_audit (created_at DESC);

CREATE TABLE IF NOT EXISTS bpc_waiting_tables (
  id text PRIMARY KEY,
  table_number smallint NOT NULL UNIQUE CHECK (table_number BETWEEN 7 AND 41),
  added_by text NOT NULL REFERENCES bpc_profiles(id),
  added_at timestamptz NOT NULL DEFAULT now()
);

COMMIT;
