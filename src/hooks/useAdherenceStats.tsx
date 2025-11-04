import { useOptimizedQuery } from './useOptimizedQuery';
import { supabase } from '@/integrations/supabase/client';

export const useAdherenceStats = () => {
  return useOptimizedQuery(
    async () => {
      try {
        // Total de avaliações
        const { count: totalAvaliacoes, error: countError } = await supabase
          .from('gap_analysis_adherence_assessments')
          .select('*', { count: 'exact', head: true });

        if (countError) throw countError;

        // Buscar todas as avaliações concluídas
        const { data: avaliacoes, error: avaliacoesError } = await supabase
          .from('gap_analysis_adherence_assessments')
          .select('resultado_geral, percentual_conformidade')
          .eq('status', 'concluido');

        if (avaliacoesError) throw avaliacoesError;

        // Contar por status
        const conformes = avaliacoes?.filter(a => a.resultado_geral === 'conforme').length || 0;
        const naoConformes = avaliacoes?.filter(a => a.resultado_geral === 'nao_conforme').length || 0;
        const parciais = avaliacoes?.filter(a => a.resultado_geral === 'parcial').length || 0;

        // Calcular média de conformidade
        const mediaConformidade = avaliacoes && avaliacoes.length > 0
          ? Math.round(
              avaliacoes.reduce((acc, a) => acc + (a.percentual_conformidade || 0), 0) / avaliacoes.length
            )
          : 0;

        return {
          data: {
            totalAvaliacoes: totalAvaliacoes || 0,
            avaliacoesConformes: conformes,
            avaliacoesNaoConformes: naoConformes,
            avaliacoesParciais: parciais,
            mediaConformidade
          },
          error: null
        };
      } catch (error) {
        console.error('Adherence Stats Error:', error);
        return {
          data: {
            totalAvaliacoes: 0,
            avaliacoesConformes: 0,
            avaliacoesNaoConformes: 0,
            avaliacoesParciais: 0,
            mediaConformidade: 0
          },
          error: error
        };
      }
    },
    [],
    {
      staleTime: 0,
      cacheKey: 'adherence-stats',
      cacheDuration: 0
    }
  );
};