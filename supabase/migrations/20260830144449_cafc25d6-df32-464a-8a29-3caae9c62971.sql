CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  confirmation_code TEXT NOT NULL UNIQUE,
  guest_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  nights INTEGER NOT NULL DEFAULT 1,
  guests INTEGER NOT NULL DEFAULT 1,
  room TEXT NOT NULL,
  price_per_night NUMERIC(18,7) NOT NULL DEFAULT 0,
  total_pi NUMERIC(18,7) NOT NULL DEFAULT 0,
  payment_id TEXT,
  txid TEXT,
  status TEXT NOT NULL DEFAULT 'paid',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT ALL ON public.bookings TO service_role;

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX bookings_created_at_idx ON public.bookings (created_at DESC);