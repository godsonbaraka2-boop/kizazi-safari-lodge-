-- Kitchen orders: admin-only (server side), no public reads or realtime.
DROP POLICY IF EXISTS "Kitchen screens can read recent orders" ON public.dining_orders;
REVOKE ALL ON public.dining_orders FROM anon, authenticated;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime DROP TABLE public.dining_orders;
EXCEPTION WHEN others THEN NULL; END $$;

-- Each Pi payment can only be used once.
CREATE UNIQUE INDEX IF NOT EXISTS bookings_payment_id_uniq ON public.bookings (payment_id) WHERE payment_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS dining_orders_payment_id_uniq ON public.dining_orders (payment_id) WHERE payment_id IS NOT NULL;

-- No two active bookings for the same room may overlap (database-enforced).
CREATE EXTENSION IF NOT EXISTS btree_gist WITH SCHEMA extensions;
ALTER TABLE public.bookings ADD CONSTRAINT bookings_no_overlap
  EXCLUDE USING gist (room WITH =, daterange(check_in, check_out, '[)') WITH &&)
  WHERE (nights > 0 AND status IN ('confirmed','paid','checked-in'));

-- Failed admin sign-in tracking for rate limiting.
CREATE TABLE public.admin_login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.admin_login_attempts TO service_role;
ALTER TABLE public.admin_login_attempts ENABLE ROW LEVEL SECURITY;
CREATE INDEX admin_login_attempts_key_idx ON public.admin_login_attempts (client_key, created_at DESC);