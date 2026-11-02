CREATE TABLE public.pi_users (uid text PRIMARY KEY, username text NOT NULL, verified_at timestamptz NOT NULL DEFAULT now());
GRANT ALL ON public.pi_users TO service_role;
ALTER TABLE public.pi_users ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.pi_rewards (id uuid PRIMARY KEY, user_uid text NOT NULL REFERENCES public.pi_users(uid), amount numeric(20,7) NOT NULL CHECK(amount > 0), status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','processing','completed','review')), payment_id text UNIQUE, txid text, signed_xdr text, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
GRANT ALL ON public.pi_rewards TO service_role;
ALTER TABLE public.pi_rewards ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX pi_rewards_one_active ON public.pi_rewards ((true)) WHERE status IN ('pending','processing','review');