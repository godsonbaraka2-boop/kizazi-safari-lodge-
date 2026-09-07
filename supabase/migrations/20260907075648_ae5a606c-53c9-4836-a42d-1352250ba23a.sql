CREATE TABLE public.dining_orders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  guest_room text NOT NULL DEFAULT 'Walk-in',
  guest_name text,
  total_pi numeric NOT NULL DEFAULT 0,
  payment_id text,
  txid text,
  status text NOT NULL DEFAULT 'Pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.dining_orders TO anon;
GRANT SELECT ON public.dining_orders TO authenticated;
GRANT ALL ON public.dining_orders TO service_role;

ALTER TABLE public.dining_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kitchen screens can read recent orders"
  ON public.dining_orders FOR SELECT
  TO anon, authenticated
  USING (created_at > now() - interval '2 days');

CREATE TRIGGER update_dining_orders_updated_at
  BEFORE UPDATE ON public.dining_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX dining_orders_created_at_idx ON public.dining_orders (created_at DESC);

ALTER TABLE public.dining_orders REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.dining_orders;

CREATE INDEX IF NOT EXISTS bookings_room_dates_idx ON public.bookings (room, check_in, check_out);