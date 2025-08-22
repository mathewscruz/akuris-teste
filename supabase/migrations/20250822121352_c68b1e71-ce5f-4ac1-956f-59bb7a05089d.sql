-- Atualizar função para enviar email via edge function
CREATE OR REPLACE FUNCTION public.enviar_notificacao_aprovacao()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
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
    
    -- Buscar email do aprovador
    SELECT email INTO aprovador_email
    FROM profiles 
    WHERE user_id = NEW.aprovador_id;
    
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
    
    -- Chamar edge function para enviar email (async)
    PERFORM net.http_post(
      url := current_setting('app.supabase_url') || '/functions/v1/send-approval-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.supabase_anon_key')
      ),
      body := jsonb_build_object(
        'documento_id', NEW.documento_id,
        'aprovador_id', NEW.aprovador_id,
        'solicitante_nome', solicitante_nome,
        'documento_nome', documento_nome
      )
    );
    
    -- Marcar notificação como enviada
    UPDATE documentos_aprovacoes 
    SET notificacao_enviada = true 
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;