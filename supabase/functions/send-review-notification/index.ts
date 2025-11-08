import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendNotificationRequest {
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

    const { reviewId }: SendNotificationRequest = await req.json();

    console.log('Enviando notificação para revisão:', reviewId);

    // Buscar revisão
    const { data: review, error: reviewError } = await supabaseClient
      .from('access_reviews')
      .select(`
        *,
        sistema:sistemas_privilegiados(nome_sistema),
        responsavel:responsavel_revisao(nome, email)
      `)
      .eq('id', reviewId)
      .single();

    if (reviewError) throw reviewError;

    // Gerar link de acesso
    const reviewLink = `${Deno.env.get('SUPABASE_URL')?.replace('https://', 'https://')}/review/${review.link_token}`;

    // Inserir notificação no sistema
    await supabaseClient.from('notifications').insert({
      user_id: review.responsavel_revisao,
      title: 'Nova Revisão de Acesso Atribuída',
      message: `Você foi atribuído como responsável pela revisão "${review.nome_revisao}" do sistema ${review.sistema.nome_sistema}.`,
      type: 'info',
      link_to: '/revisao-acessos',
      metadata: {
        review_id: reviewId,
        tipo: 'revisao_atribuida',
      },
    });

    console.log('Notificação enviada com sucesso para:', review.responsavel.email);

    return new Response(
      JSON.stringify({ success: true, message: 'Notificação enviada com sucesso' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erro ao enviar notificação:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
