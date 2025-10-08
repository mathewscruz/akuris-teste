-- ================================
-- MIGRATION: Correções de Segurança - Fase 2 (Funções e Search Path)
-- Data: 2025-10-08
-- Objetivo: Corrigir vulnerabilidades de injeção SQL em funções
-- ================================

-- ============================================================================
-- CORRIGIR TODAS AS FUNÇÕES SEM SEARCH_PATH DEFINIDO
-- Adicionar SET search_path = public em todas as funções security definer
-- ============================================================================

-- 1. update_docgen_updated_at_column
CREATE OR REPLACE FUNCTION public.update_docgen_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

-- 2. enviar_notificacao_aprovacao
CREATE OR REPLACE FUNCTION public.enviar_notificacao_aprovacao()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  documento_nome text;
  solicitante_nome text;
  aprovador_email text;
BEGIN
  -- Só processar se for uma solicitação (não aprovação direta)
  IF NEW.tipo_acao = 'solicitacao' AND NEW.notificacao_enviada = false THEN
    -- Buscar nome do documento
    SELECT nome INTO documento_nome 
    FROM documentos 
    WHERE id = NEW.documento_id;
    
    -- Buscar nome do solicitante
    SELECT nome INTO solicitante_nome 
    FROM profiles 
    WHERE user_id = NEW.solicitado_por;
    
    -- Inserir notificação para o aprovador
    INSERT INTO notifications (
      user_id,
      title,
      message,
      type,
      link_to,
      metadata
    ) VALUES (
      NEW.aprovador_id,
      'Solicitação de Aprovação de Documento',
      CONCAT(solicitante_nome, ' solicitou a aprovação do documento "', documento_nome, '"'),
      'info',
      '/documentos',
      jsonb_build_object(
        'documento_id', NEW.documento_id,
        'aprovacao_id', NEW.id,
        'tipo', 'solicitacao_aprovacao_documento'
      )
    );
    
    -- Marcar notificação como enviada
    UPDATE documentos_aprovacoes 
    SET notificacao_enviada = true 
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 3. gerar_protocolo_denuncia
CREATE OR REPLACE FUNCTION public.gerar_protocolo_denuncia()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  protocolo TEXT;
BEGIN
  protocolo := 'DEN' || TO_CHAR(now(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN protocolo;
END;
$function$;

-- 4. gerar_token_publico
CREATE OR REPLACE FUNCTION public.gerar_token_publico()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  token TEXT;
BEGIN
  token := encode(gen_random_bytes(32), 'hex');
  RETURN token;
END;
$function$;

-- 5. update_denuncias_updated_at
CREATE OR REPLACE FUNCTION public.update_denuncias_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 6. update_riscos_updated_at
CREATE OR REPLACE FUNCTION public.update_riscos_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 7. mark_user_reminders_completed
CREATE OR REPLACE FUNCTION public.mark_user_reminders_completed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Se é a primeira vez que o usuário está fazendo login (não tem last_sign_in_at anterior)
  IF OLD.last_sign_in_at IS NULL AND NEW.last_sign_in_at IS NOT NULL THEN
    -- Marcar todos os lembretes ativos deste usuário como concluídos
    UPDATE public.user_invitation_reminders 
    SET 
      status = 'completed',
      updated_at = now()
    WHERE 
      user_id = NEW.id 
      AND status = 'active';
      
    -- Deletar senha temporária já que o usuário fez login
    UPDATE public.temporary_passwords 
    SET 
      is_temporary = false,
      updated_at = now()
    WHERE 
      user_id = NEW.id 
      AND is_temporary = true;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 8. handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Não criar perfil automaticamente se for criação administrativa
  IF NEW.raw_user_meta_data ->> 'admin_created' = 'true' THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.profiles (user_id, nome, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'nome', split_part(NEW.email, '@', 1)),
    NEW.email,
    CASE 
      WHEN NEW.email = 'admin@governaii.com' THEN 'super_admin'::public.user_role
      ELSE 'user'::public.user_role
    END
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Profile already exists, just return
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log error and continue with user creation
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$function$;

-- 9. trigger_calculate_score
CREATE OR REPLACE FUNCTION public.trigger_calculate_score()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Só executar se o status mudou para 'concluido'
  IF NEW.status = 'concluido' AND (OLD.status IS NULL OR OLD.status != 'concluido') THEN
    -- Chamar a função de cálculo de score
    PERFORM calculate_due_diligence_score(NEW.id);
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 10. audit_ativos_changes
CREATE OR REPLACE FUNCTION public.audit_ativos_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  changed_fields text[] := '{}';
  old_values jsonb;
  new_values jsonb;
BEGIN
  IF TG_OP = 'INSERT' THEN
    new_values = to_jsonb(NEW);
    PERFORM create_audit_log('ativos', NEW.id, 'INSERT', NULL, new_values);
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    old_values = to_jsonb(OLD);
    new_values = to_jsonb(NEW);
    
    -- Detectar campos alterados
    IF OLD.nome != NEW.nome THEN changed_fields = array_append(changed_fields, 'nome'); END IF;
    IF OLD.tipo != NEW.tipo THEN changed_fields = array_append(changed_fields, 'tipo'); END IF;
    IF OLD.descricao IS DISTINCT FROM NEW.descricao THEN changed_fields = array_append(changed_fields, 'descricao'); END IF;
    IF OLD.proprietario IS DISTINCT FROM NEW.proprietario THEN changed_fields = array_append(changed_fields, 'proprietario'); END IF;
    IF OLD.localizacao IS DISTINCT FROM NEW.localizacao THEN changed_fields = array_append(changed_fields, 'localizacao'); END IF;
    IF OLD.valor_negocio IS DISTINCT FROM NEW.valor_negocio THEN changed_fields = array_append(changed_fields, 'valor_negocio'); END IF;
    IF OLD.criticidade != NEW.criticidade THEN changed_fields = array_append(changed_fields, 'criticidade'); END IF;
    IF OLD.status != NEW.status THEN changed_fields = array_append(changed_fields, 'status'); END IF;
    IF OLD.data_aquisicao IS DISTINCT FROM NEW.data_aquisicao THEN changed_fields = array_append(changed_fields, 'data_aquisicao'); END IF;
    IF OLD.fornecedor IS DISTINCT FROM NEW.fornecedor THEN changed_fields = array_append(changed_fields, 'fornecedor'); END IF;
    IF OLD.versao IS DISTINCT FROM NEW.versao THEN changed_fields = array_append(changed_fields, 'versao'); END IF;
    IF OLD.tags IS DISTINCT FROM NEW.tags THEN changed_fields = array_append(changed_fields, 'tags'); END IF;
    IF OLD.imei IS DISTINCT FROM NEW.imei THEN changed_fields = array_append(changed_fields, 'imei'); END IF;
    IF OLD.cliente IS DISTINCT FROM NEW.cliente THEN changed_fields = array_append(changed_fields, 'cliente'); END IF;
    IF OLD.quantidade IS DISTINCT FROM NEW.quantidade THEN changed_fields = array_append(changed_fields, 'quantidade'); END IF;
    
    IF array_length(changed_fields, 1) > 0 THEN
      PERFORM create_audit_log('ativos', NEW.id, 'UPDATE', old_values, new_values, changed_fields);
    END IF;
    RETURN NEW;
  END IF;

  IF TG_OP = 'DELETE' THEN
    old_values = to_jsonb(OLD);
    PERFORM create_audit_log('ativos', OLD.id, 'DELETE', old_values, NULL);
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$function$;

-- 11. audit_controles_changes
CREATE OR REPLACE FUNCTION public.audit_controles_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  changed_fields text[] := '{}';
  old_values jsonb;
  new_values jsonb;
BEGIN
  IF TG_OP = 'INSERT' THEN
    new_values = to_jsonb(NEW);
    PERFORM create_audit_log('controles', NEW.id, 'INSERT', NULL, new_values);
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    old_values = to_jsonb(OLD);
    new_values = to_jsonb(NEW);
    
    -- Detectar campos alterados
    IF OLD.nome != NEW.nome THEN changed_fields = array_append(changed_fields, 'nome'); END IF;
    IF OLD.descricao != NEW.descricao THEN changed_fields = array_append(changed_fields, 'descricao'); END IF;
    IF OLD.status != NEW.status THEN changed_fields = array_append(changed_fields, 'status'); END IF;
    IF OLD.criticidade != NEW.criticidade THEN changed_fields = array_append(changed_fields, 'criticidade'); END IF;
    
    IF array_length(changed_fields, 1) > 0 THEN
      PERFORM create_audit_log('controles', NEW.id, 'UPDATE', old_values, new_values, changed_fields);
    END IF;
    RETURN NEW;
  END IF;

  IF TG_OP = 'DELETE' THEN
    old_values = to_jsonb(OLD);
    PERFORM create_audit_log('controles', OLD.id, 'DELETE', old_values, NULL);
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$function$;

-- 12. generate_temp_password
CREATE OR REPLACE FUNCTION public.generate_temp_password()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  lowercase TEXT := 'abcdefghijkmnpqrstuvwxyz';
  uppercase TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  numbers TEXT := '23456789';
  specials TEXT := '!@#$%&*+-=?';
  result TEXT := '';
  i INTEGER := 0;
  remaining_length INTEGER := 8;
BEGIN
  -- Garantir pelo menos um de cada tipo
  result := result || substr(lowercase, floor(random() * length(lowercase) + 1)::integer, 1);
  result := result || substr(uppercase, floor(random() * length(uppercase) + 1)::integer, 1);
  result := result || substr(numbers, floor(random() * length(numbers) + 1)::integer, 1);
  result := result || substr(specials, floor(random() * length(specials) + 1)::integer, 1);
  
  -- Completar com caracteres aleatórios
  FOR i IN 1..remaining_length LOOP
    CASE floor(random() * 4)::integer
      WHEN 0 THEN
        result := result || substr(lowercase, floor(random() * length(lowercase) + 1)::integer, 1);
      WHEN 1 THEN
        result := result || substr(uppercase, floor(random() * length(uppercase) + 1)::integer, 1);
      WHEN 2 THEN
        result := result || substr(numbers, floor(random() * length(numbers) + 1)::integer, 1);
      ELSE
        result := result || substr(specials, floor(random() * length(specials) + 1)::integer, 1);
    END CASE;
  END LOOP;
  
  -- Embaralhar resultado
  DECLARE
    temp_char CHAR(1);
    pos1 INTEGER;
    pos2 INTEGER;
    shuffle_count INTEGER := 20;
  BEGIN
    FOR i IN 1..shuffle_count LOOP
      pos1 := floor(random() * length(result) + 1)::integer;
      pos2 := floor(random() * length(result) + 1)::integer;
      
      temp_char := substr(result, pos1, 1);
      result := overlay(result placing substr(result, pos2, 1) from pos1 for 1);
      result := overlay(result placing temp_char from pos2 for 1);
    END LOOP;
  END;
  
  RETURN result;
END;
$function$;