import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let requestBody: any = null;
  
  try {
    requestBody = await req.json();
    const { assessmentId, frameworkId, storageFileName, empresaId } = requestBody;

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;

    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY não configurada');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Consumir crédito de IA
    if (empresaId) {
      const authHeader = req.headers.get('Authorization');
      let userId: string | null = null;
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user } } = await supabase.auth.getUser(token);
        userId = user?.id || null;
      }

      const { data: creditResult, error: creditError } = await supabase
        .rpc('consume_ai_credit', {
          p_empresa_id: empresaId,
          p_user_id: userId,
          p_funcionalidade: 'analyze_document_adherence',
          p_descricao: `Análise de aderência do documento para framework`
        });

      if (creditError || creditResult === false) {
        await supabase
          .from('gap_analysis_adherence_assessments')
          .update({
            status: 'erro',
            metadados_analise: { erro: 'Créditos de IA esgotados' }
          })
          .eq('id', assessmentId);

        return new Response(JSON.stringify({ 
          error: 'Créditos de IA esgotados.',
          creditsExhausted: true
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    console.log('Starting adherence analysis:', { assessmentId, frameworkId, storageFileName });

    // 1. Buscar framework e requisitos
    const { data: framework, error: frameworkError } = await supabase
      .from('gap_analysis_frameworks')
      .select('*')
      .eq('id', frameworkId)
      .single();

    if (frameworkError || !framework) {
      throw new Error(`Framework não encontrado: ${frameworkError?.message}`);
    }

    const { data: requirements, error: reqError } = await supabase
      .from('gap_analysis_requirements')
      .select('*')
      .eq('framework_id', frameworkId)
      .order('ordem');

    if (reqError) throw new Error(`Erro ao buscar requisitos: ${reqError.message}`);
    if (!requirements || requirements.length === 0) throw new Error('Framework não possui requisitos cadastrados');

    console.log(`Framework: ${framework.nome}, Requirements: ${requirements.length}`);

    // 2. Baixar arquivo do storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('adherence-documents')
      .download(storageFileName);

    if (downloadError || !fileData) {
      throw new Error(`Erro ao baixar documento: ${downloadError?.message}`);
    }

    console.log('Document downloaded, size:', fileData.size);

    // 3. Extrair texto
    console.log('Reading document text...');
    let documentText = '';
    const fileExtension = storageFileName.toLowerCase().split('.').pop();
    console.log('File extension detected:', fileExtension);

    if (fileExtension === 'txt') {
      documentText = await fileData.text();
      console.log('Text extracted, length:', documentText.length);
    } else {
      throw new Error(`Tipo de arquivo não suportado: ${fileExtension}. Apenas TXT pré-processados são aceitos.`);
    }

    if (!documentText || documentText.trim().length < 100) {
      throw new Error('Documento não contém texto suficiente para análise (mínimo 100 caracteres)');
    }

    // 4. Montar prompt com mais contexto e qualidade
    const docTextForAnalysis = documentText.substring(0, 20000);
    const reqsForAnalysis = requirements.slice(0, 60);

    const prompt = `Você é um auditor sênior de conformidade regulatória com experiência em frameworks como ISO 27001, LGPD, NIST CSF, SOC 2, GDPR e outros.

TAREFA: Analise o documento abaixo e avalie sua conformidade com os requisitos do framework ${framework.nome} (${framework.versao || ''}).

INSTRUÇÕES DETALHADAS:
1. Leia o documento inteiro com atenção
2. Para CADA requisito listado, determine se o documento aborda, menciona ou implementa o que é exigido
3. Seja criterioso: "conforme" significa que o documento cobre adequadamente o requisito; "parcial" significa cobertura incompleta; "nao_conforme" significa ausência ou inadequação
4. Forneça evidências textuais específicas encontradas no documento (citações ou referências a seções)
5. Identifique gaps concretos e acionáveis
6. O percentual geral deve refletir a média ponderada real dos requisitos avaliados

DOCUMENTO ANALISADO:
---
${docTextForAnalysis}${documentText.length > 20000 ? '\n\n[... documento continua - ' + (documentText.length - 20000) + ' caracteres adicionais ...]' : ''}
---

REQUISITOS DO FRAMEWORK ${framework.nome} (${reqsForAnalysis.length} de ${requirements.length}):
${reqsForAnalysis.map((r, i) => `${i+1}. ID:${r.id} | ${r.codigo || 'N/A'}: ${r.titulo}${r.descricao ? ' - ' + r.descricao.substring(0, 80) : ''}`).join('\n')}

FORMATO JSON OBRIGATÓRIO (retorne APENAS JSON válido, sem markdown):
{
  "documento_tipo_identificado": "string (política, procedimento, contrato, manual, etc)",
  "documento_escopo_identificado": "string curta descrevendo escopo do documento",
  "total_requisitos_relevantes": número,
  "resultado_geral": "conforme"|"nao_conforme"|"parcial",
  "percentual_conformidade": 0-100,
  "pontos_fortes": [
    {"titulo": "max 60 chars", "descricao": "max 150 chars com detalhes específicos"}
  ],
  "pontos_melhoria": [
    {"titulo": "max 60 chars", "descricao": "max 150 chars com ação recomendada", "prioridade": "alta|media|baixa"}
  ],
  "requisitos_analisados": [
    {
      "requirement_id": "UUID exato do requisito",
      "requisito_codigo": "código do requisito",
      "status_aderencia": "conforme"|"nao_conforme"|"parcial"|"nao_aplicavel",
      "evidencias_encontradas": "citação ou referência específica do documento (max 120 chars)",
      "gaps_especificos": "o que falta para conformidade total (max 100 chars)",
      "score_conformidade": 0-10,
      "observacoes_ia": "análise detalhada do auditor (max 150 chars)",
      "justificativa_relevancia": "por que este requisito é relevante ao documento (max 80 chars)"
    }
  ],
  "requisitos_nao_aplicaveis": ["array de UUIDs de requisitos não aplicáveis ao escopo do documento"],
  "recomendacoes": ["recomendações acionáveis e específicas, max 150 chars cada, mínimo 3"],
  "analise_detalhada": "resumo executivo da análise (max 500 palavras) incluindo: visão geral da conformidade, áreas de maior risco, prioridades de remediação"
}`;

    // 5. Chamar Lovable AI Gateway
    console.log('Calling Lovable AI Gateway...');
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { 
            role: 'system', 
            content: 'Você é um auditor sênior de conformidade regulatória. Analise documentos com rigor e precisão. Retorne APENAS JSON válido seguindo exatamente o schema fornecido. Seja específico nas evidências e gaps.'
          },
          { role: 'user', content: prompt }
        ],
        max_completion_tokens: 16000,
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI Gateway error:', response.status, errorText);
      if (response.status === 429) throw new Error('Limite de requisições excedido. Aguarde e tente novamente.');
      if (response.status === 402) throw new Error('Créditos do Lovable AI esgotados.');
      throw new Error(`Erro na API (${response.status}): ${errorText}`);
    }

    const aiResponse = await response.json();
    console.log('Lovable AI response received:', JSON.stringify({
      hasChoices: !!aiResponse.choices,
      choicesLength: aiResponse.choices?.length,
      hasMessage: !!aiResponse.choices?.[0]?.message,
      hasContent: !!aiResponse.choices?.[0]?.message?.content,
      contentLength: aiResponse.choices?.[0]?.message?.content?.length,
      finishReason: aiResponse.choices?.[0]?.finish_reason
    }));
    
    if (aiResponse.choices?.[0]?.finish_reason === 'length') {
      console.error('Response truncated');
      throw new Error('Análise truncada. Tente com um framework com menos requisitos.');
    }
    
    if (!aiResponse.choices?.[0]?.message?.content) {
      throw new Error('Resposta da IA inválida');
    }

    let analysisResult;
    try {
      const content = aiResponse.choices[0].message.content;
      console.log('AI response length:', content.length);
      
      analysisResult = JSON.parse(content);
      
      if (!analysisResult.resultado_geral || !analysisResult.requisitos_analisados) {
        throw new Error('JSON sem campos obrigatórios');
      }
      
      // Truncar campos
      if (analysisResult.requisitos_analisados) {
        analysisResult.requisitos_analisados = analysisResult.requisitos_analisados.map((req: any) => ({
          ...req,
          evidencias_encontradas: (req.evidencias_encontradas || '').substring(0, 120),
          gaps_especificos: (req.gaps_especificos || '').substring(0, 100),
          observacoes_ia: (req.observacoes_ia || '').substring(0, 150),
          justificativa_relevancia: (req.justificativa_relevancia || '').substring(0, 80)
        }));
      }
      
      console.log('Parsed:', {
        resultado: analysisResult.resultado_geral,
        percentual: analysisResult.percentual_conformidade,
        requisitos: analysisResult.requisitos_analisados?.length || 0
      });
    } catch (e) {
      console.error('Parse error:', e);
      throw new Error('JSON inválido retornado pela IA');
    }

    // 6. Salvar resultado
    console.log('Saving assessment results...');
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
          modelo_usado: 'google/gemini-3-flash-preview',
          tempo_processamento: Date.now(),
          total_requisitos: requirements?.length || 0,
          total_requisitos_relevantes: analysisResult.total_requisitos_relevantes || 0,
          documento_tamanho: documentText.length,
          documento_tipo: analysisResult.documento_tipo_identificado || null,
          documento_escopo: analysisResult.documento_escopo_identificado || null,
          requisitos_nao_aplicaveis: analysisResult.requisitos_nao_aplicaveis || []
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', assessmentId);

    if (updateError) {
      console.error('Error updating assessment:', updateError);
      throw updateError;
    }

    console.log('Assessment updated successfully');

    // 7. Salvar detalhes por requisito
    if (analysisResult.requisitos_analisados && analysisResult.requisitos_analisados.length > 0) {
      console.log('Saving requirement details...');
      const detailsToInsert = analysisResult.requisitos_analisados.map((req: any) => {
        const requirement = requirements?.find(r => r.id === req.requirement_id);
        return {
          assessment_id: assessmentId,
          requirement_id: req.requirement_id,
          requisito_codigo: requirement?.codigo || req.requisito_codigo || '',
          requisito_titulo: requirement?.titulo || '',
          status_aderencia: req.status_aderencia,
          evidencias_encontradas: req.evidencias_encontradas,
          gaps_especificos: req.gaps_especificos,
          score_conformidade: req.score_conformidade,
          observacoes_ia: req.observacoes_ia,
          justificativa_relevancia: req.justificativa_relevancia || null
        };
      });

      const { error: detailsError } = await supabase
        .from('gap_analysis_adherence_details')
        .insert(detailsToInsert);

      if (detailsError) {
        console.error('Error inserting details:', detailsError);
      } else {
        console.log(`Saved ${detailsToInsert.length} requirement details`);
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
    
    try {
      if (requestBody?.assessmentId) {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        await supabase
          .from('gap_analysis_adherence_assessments')
          .update({
            status: 'erro',
            metadados_analise: { 
              erro: error.message,
              timestamp_erro: new Date().toISOString()
            }
          })
          .eq('id', requestBody.assessmentId);
      }
    } catch (updateErr) {
      console.error('Failed to update assessment with error:', updateErr);
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
