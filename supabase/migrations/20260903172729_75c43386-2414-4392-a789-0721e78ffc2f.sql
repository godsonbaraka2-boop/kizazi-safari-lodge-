CREATE TABLE public.app_secrets (
  name TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT ALL ON public.app_secrets TO service_role;

ALTER TABLE public.app_secrets ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_app_secrets_updated_at
BEFORE UPDATE ON public.app_secrets
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();