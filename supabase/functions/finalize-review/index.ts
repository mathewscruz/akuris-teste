import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FinalizeReviewRequest {
  reviewId: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { reviewId }: FinalizeReviewRequest = await req.json();

    console.log('Finalizando revisão:', reviewId);

    // Buscar revisão
    const { data: review, error: reviewError } = await supabaseClient
      .from('access_reviews')
      .select('*, sistema:sistemas_privilegiados(nome_sistema)')
      .eq('id', reviewId)
      .single();

    if (reviewError) throw reviewError;

    // Verificar se todos os itens foram revisados
    const { data: items, error: itemsError } = await supabaseClient
      .from('access_review_items')
      .select('*')
      .eq('review_id', reviewId);

    if (itemsError) throw itemsError;

    const pendentes = items.filter((item: any) => item.decisao === 'pendente');
    if (pendentes.length > 0) {
      return new Response(
        JSON.stringify({ error: `Ainda há ${pendentes.length} item(ns) pendente(s)` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Processar decisões
    for (const item of items) {
      let acaoTomada = 'mantido';

      if (item.decisao === 'revogar') {
        // Atualizar status da conta para revogado
        await supabaseClient
          .from('contas_privilegiadas')
          .update({ status: 'revogado' })
          .eq('id', item.conta_id);

        acaoTomada = 'revogado';
      } else if (item.decisao === 'modificar' && item.nova_data_expiracao) {
        // Atualizar data de expiração
        await supabaseClient
          .from('contas_privilegiadas')
          .update({ data_expiracao: item.nova_data_expiracao })
          .eq('id', item.conta_id);

        acaoTomada = 'expirado_atualizado';
      }

      // Registrar no histórico
      await supabaseClient.from('access_review_history').insert({
        empresa_id: review.empresa_id,
        review_id: reviewId,
        conta_id: item.conta_id,
        sistema_nome: review.sistema.nome_sistema,
        usuario_beneficiario: item.usuario_beneficiario,
        email_beneficiario: item.email_beneficiario,
        tipo_acesso: item.tipo_acesso,
        nivel_privilegio: item.nivel_privilegio,
        decisao: item.decisao,
        justificativa_revisor: item.justificativa_revisor,
        revisado_por: item.revisado_por,
        data_revisao: item.data_revisao,
        acao_tomada: acaoTomada,
      });
    }

    // Atualizar revisão para concluída
    await supabaseClient
      .from('access_reviews')
      .update({
        status: 'concluida',
        data_conclusao: new Date().toISOString(),
      })
      .eq('id', reviewId);

    // Enviar notificação ao criador
    await supabaseClient.from('notifications').insert({
      user_id: review.created_by,
      title: 'Revisão de Acesso Finalizada',
      message: `A revisão "${review.nome_revisao}" foi concluída com sucesso.`,
      type: 'success',
      link_to: '/revisao-acessos',
      metadata: {
        review_id: reviewId,
        tipo: 'revisao_finalizada',
      },
    });

    console.log('Revisão finalizada com sucesso');

    return new Response(
      JSON.stringify({ success: true, message: 'Revisão finalizada com sucesso' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erro ao finalizar revisão:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
