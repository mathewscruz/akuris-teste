-- Criar função RPC para buscar profiles usando IDs em formato texto
-- Isso resolve o problema de incompatibilidade entre TEXT (ativos.proprietario) e UUID (profiles.user_id)
CREATE OR REPLACE FUNCTION get_profiles_by_text_ids(text_ids TEXT[])
RETURNS TABLE (
  user_id UUID,
  nome TEXT,
  foto_url TEXT
) 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT p.user_id, p.nome, p.foto_url
  FROM profiles p
  WHERE p.user_id::TEXT = ANY(text_ids)
    AND p.empresa_id = get_user_empresa_id();
END;
$$ LANGUAGE plpgsql;