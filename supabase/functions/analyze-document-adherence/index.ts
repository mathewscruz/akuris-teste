import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { assessmentId, frameworkId, documentId, empresaId } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Buscar dados do framework e requisitos
    const { data: framework } = await supabase
      .from('gap_analysis_frameworks')
      .select('*')
      .eq('id', frameworkId)
      .single();

    const { data: requirements } = await supabase
      .from('gap_analysis_requirements')
      .select('*')
      .eq('framework_id', frameworkId)
      .order('ordem');

    // 2. Buscar documento
    const { data: documento } = await supabase
      .from('documentos')
      .select('*')
      .eq('id', documentId)
      .single();

    if (!documento?.arquivo_url) {
      throw new Error('Documento não possui arquivo anexado');
    }

    // 3. Baixar conteúdo do documento do storage
    const bucket = 'documentos';
    const filePath = documento.arquivo_url.split(`${bucket}/`)[1];
    
    const { data: fileData } = await supabase.storage
      .from(bucket)
      .download(filePath);

    if (!fileData) {
      throw new Error('Não foi possível baixar o documento');
    }

    // 4. Extrair texto do documento (simplificado - você pode melhorar isso)
    const documentText = await fileData.text();

    // 5. Montar prompt para IA
    const requirementsList = requirements?.map(r => 
      `- ${r.codigo || ''} | ${r.titulo} (Categoria: ${r.categoria || 'N/A'}, Peso: ${r.peso})`
    ).join('\n');

    const prompt = `Você é um auditor especializado em conformidade regulatória. Analise o seguinte documento corporativo em relação aos requisitos do framework ${framework.nome} - ${framework.versao}.

DOCUMENTO ANALISADO:
${documentText.substring(0, 15000)} ${documentText.length > 15000 ? '...(truncado)' : ''}

REQUISITOS DO FRAMEWORK:
${requirementsList}

Realize uma análise detalhada e retorne um JSON válido com:
{
  "resultado_geral": "conforme" | "nao_conforme" | "parcial",
  "percentual_conformidade": número de 0 a 100,
  "pontos_fortes": [{"titulo": "", "descricao": ""}],
  "pontos_melhoria": [{"titulo": "", "descricao": "", "prioridade": "alta|media|baixa"}],
  "requisitos_detalhados": [
    {
      "requirement_id": "uuid",
      "status_aderencia": "conforme|nao_conforme|parcial|nao_aplicavel",
      "evidencias_encontradas": "",
      "gaps_especificos": "",
      "score_conformidade": 0-10,
      "observacoes_ia": ""
    }
  ],
  "recomendacoes": ["ação 1", "ação 2"],
  "analise_detalhada": "texto markdown com análise completa"
}

Seja específico, cite trechos do documento quando possível, e forneça orientações práticas.`;

    // 6. Chamar OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em auditoria e conformidade regulatória. Sempre responda com JSON válido.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const aiResponse = await response.json();
    const analysisResult = JSON.parse(aiResponse.choices[0].message.content);

    // 7. Salvar resultado completo na tabela de assessments
    const { error: updateError } = await supabase
      .from('gap_analysis_adherence_assessments')
      .update({
        status: 'concluido',
        resultado_geral: analysisResult.resultado_geral,
        percentual_conformidade: analysisResult.percentual_conformidade,
        pontos_fortes: analysisResult.pontos_fortes || [],
        pontos_melhoria: analysisResult.pontos_melhoria || [],
        recomendacoes: analysisResult.recomendacoes || [],
        analise_detalhada: analysisResult.analise_detalhada,
        metadados_analise: {
          modelo_usado: 'gpt-4o-mini',
          tempo_processamento: Date.now(),
          total_requisitos: requirements?.length || 0,
          documento_tamanho: documentText.length
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', assessmentId);

    if (updateError) throw updateError;

    // 8. Salvar detalhes por requisito
    if (analysisResult.requisitos_detalhados) {
      const detailsToInsert = analysisResult.requisitos_detalhados.map((req: any) => ({
        assessment_id: assessmentId,
        requirement_id: req.requirement_id,
        requisito_codigo: requirements?.find(r => r.id === req.requirement_id)?.codigo,
        requisito_titulo: requirements?.find(r => r.id === req.requirement_id)?.titulo,
        status_aderencia: req.status_aderencia,
        evidencias_encontradas: req.evidencias_encontradas,
        gaps_especificos: req.gaps_especificos,
        score_conformidade: req.score_conformidade,
        observacoes_ia: req.observacoes_ia
      }));

      const { error: detailsError } = await supabase
        .from('gap_analysis_adherence_details')
        .insert(detailsToInsert);

      if (detailsError) {
        console.error('Error inserting details:', detailsError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          assessmentId,
          resultado_geral: analysisResult.resultado_geral,
          percentual_conformidade: analysisResult.percentual_conformidade
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in analyze-document-adherence:', error);
    
    // Tentar atualizar o assessment com erro
    try {
      const { assessmentId } = await req.json();
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      await supabase
        .from('gap_analysis_adherence_assessments')
        .update({
          status: 'erro',
          metadados_analise: { erro: error.message }
        })
        .eq('id', assessmentId);
    } catch {}

    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});