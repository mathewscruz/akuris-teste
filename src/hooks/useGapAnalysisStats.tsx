import { useOptimizedQuery } from './useOptimizedQuery';
import { supabase } from '@/integrations/supabase/client';

export const useGapAnalysisStats = () => {
  return useOptimizedQuery(
    async () => {
      try {
        // Total de frameworks
        const { count: totalFrameworks, error: frameworksError } = await supabase
          .from('gap_analysis_frameworks')
          .select('*', { count: 'exact', head: true });

        if (frameworksError) throw frameworksError;

        // Buscar avaliações com join para frameworks ativos
        const { data: evaluations, error: evaluationsError } = await supabase
          .from('gap_analysis_evaluations')
          .select(`
            conformity_status,
            evidence_status,
            framework_id,
            gap_analysis_frameworks!inner(id, empresa_id)
          `);

        if (evaluationsError) throw evaluationsError;

        // Conformidade média (nova fórmula)
        let averageCompliance = 0;
        if (evaluations && evaluations.length > 0) {
          const evaluatedItems = evaluations.filter(e => 
            e.conformity_status && e.conformity_status !== 'nao_aplicavel'
          );
          
          if (evaluatedItems.length > 0) {
            const totalScore = evaluatedItems.reduce((score, evaluation) => {
              switch (evaluation.conformity_status) {
                case 'conforme': return score + 100;
                case 'parcial': return score + 50;
                case 'nao_conforme': return score + 0;
                default: return score;
              }
            }, 0);
            
            averageCompliance = totalScore / evaluatedItems.length;
          }
        }

        // Itens pendentes (apenas evidências pendentes)
        const pendingItems = evaluations?.filter(e => 
          e.evidence_status === 'pendente'
        ).length || 0;

        // Frameworks em andamento (que têm avaliações preenchidas mas não finalizadas)
        const frameworksWithEvaluations = new Set();
        evaluations?.forEach(evaluation => {
          if (evaluation.conformity_status || evaluation.evidence_status) {
            frameworksWithEvaluations.add(evaluation.framework_id);
          }
        });

        const assessmentsInProgress = frameworksWithEvaluations.size;

        return {
          data: {
            totalFrameworks: totalFrameworks || 0,
            assessmentsInProgress: assessmentsInProgress || 0,
            averageCompliance: Math.round(averageCompliance),
            pendingItems: pendingItems || 0
          },
          error: null
        };
      } catch (error) {
        return {
          data: null,
          error: error
        };
      }
    },
    [],
    {
      staleTime: 2 * 60 * 1000, // 2 minutos
      cacheKey: 'gap-analysis-stats',
      cacheDuration: 5 // 5 minutos
    }
  );
};