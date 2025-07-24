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

        // Avaliações em andamento
        const { count: assessmentsInProgress, error: assessmentsError } = await supabase
          .from('gap_analysis_assessments')
          .select('*', { count: 'exact', head: true })
          .in('status', ['em_andamento', 'pausada']);

        if (assessmentsError) throw assessmentsError;

        // Calcular conformidade média
        const { data: evaluations, error: evaluationsError } = await supabase
          .from('gap_analysis_evaluations')
          .select('status');

        if (evaluationsError) throw evaluationsError;

        let averageCompliance = 0;
        if (evaluations && evaluations.length > 0) {
          const conformeCount = evaluations.filter(e => e.status === 'conforme').length;
          const totalEvaluated = evaluations.filter(e => e.status !== 'nao_avaliado').length;
          averageCompliance = totalEvaluated > 0 ? (conformeCount / totalEvaluated) * 100 : 0;
        }

        // Itens pendentes (atribuições)
        const { count: pendingItems, error: assignmentsError } = await supabase
          .from('gap_analysis_assignments')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pendente');

        if (assignmentsError) throw assignmentsError;

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
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheKey: 'gap-analysis-stats',
      cacheDuration: 10 // 10 minutos
    }
  );
};