import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';

export type IntegrationEventType = 
  | 'incidente_criado'
  | 'incidente_atualizado'
  | 'incidente_resolvido'
  | 'incidente_critico'
  | 'risco_identificado'
  | 'risco_atualizado'
  | 'risco_nivel_alterado'
  | 'documento_criado'
  | 'documento_aprovado'
  | 'documento_rejeitado'
  | 'controle_criado'
  | 'controle_atualizado'
  | 'controle_vencendo'
  | 'auditoria_criada'
  | 'auditoria_item_atribuido'
  | 'denuncia_recebida';

interface NotifyOptions {
  titulo: string;
  descricao?: string;
  link?: string;
  dados?: Record<string, unknown>;
  gravidade?: 'baixa' | 'media' | 'alta' | 'critica';
}

export function useIntegrationNotify() {
  const { user } = useAuth();

  const notify = useCallback(async (
    evento: IntegrationEventType,
    options: NotifyOptions
  ) => {
    if (!user?.id) return;

    try {
      // Buscar empresa_id do usuário
      const { data: profile } = await supabase
        .from('profiles')
        .select('empresa_id')
        .eq('user_id', user.id)
        .single();

      if (!profile?.empresa_id) return;

      // Chamar Edge Function dispatcher
      const { error } = await supabase.functions.invoke('integration-webhook-dispatcher', {
        body: {
          empresa_id: profile.empresa_id,
          evento,
          titulo: options.titulo,
          descricao: options.descricao,
          link: options.link,
          dados: options.dados,
          gravidade: options.gravidade,
          triggered_by: user.id,
          timestamp: new Date().toISOString()
        }
      });

      if (error) {
        console.error('Erro ao enviar notificação de integração:', error);
      }
    } catch (error) {
      console.error('Erro ao notificar integrações:', error);
    }
  }, [user]);

  return { notify };
}

// Nota: A função dispatchIntegrationEvent para uso server-side
// deve ser usada diretamente nas Edge Functions, não neste arquivo client-side.
