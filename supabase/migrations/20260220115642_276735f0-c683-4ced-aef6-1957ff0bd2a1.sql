
-- Bucket público para assets de e-mail (logo)
INSERT INTO storage.buckets (id, name, public)
VALUES ('email-assets', 'email-assets', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Email assets are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'email-assets');

-- Tabela MFA codes
CREATE TABLE public.mfa_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  empresa_id UUID NOT NULL REFERENCES public.empresas(id),
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '5 minutes'),
  used BOOLEAN NOT NULL DEFAULT false,
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_mfa_codes_user_id ON public.mfa_codes (user_id);
CREATE INDEX idx_mfa_codes_lookup ON public.mfa_codes (user_id, code, used);

-- RLS
ALTER TABLE public.mfa_codes ENABLE ROW LEVEL SECURITY;

-- Apenas o próprio usuário pode ler seus códigos
CREATE POLICY "Users can read own mfa codes"
ON public.mfa_codes FOR SELECT
USING (user_id = auth.uid());

-- Inserção via service role nas edge functions (sem política de INSERT para anon)
-- Limpeza automática de códigos expirados
CREATE OR REPLACE FUNCTION public.cleanup_expired_mfa_codes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.mfa_codes
  WHERE expires_at < now() - interval '1 hour';
END;
$$;

-- Invalidar códigos anteriores quando novo é criado
CREATE OR REPLACE FUNCTION public.invalidate_previous_mfa_codes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.mfa_codes
  SET used = true
  WHERE user_id = NEW.user_id
    AND id != NEW.id
    AND used = false;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_invalidate_previous_mfa_codes
AFTER INSERT ON public.mfa_codes
FOR EACH ROW
EXECUTE FUNCTION public.invalidate_previous_mfa_codes();
