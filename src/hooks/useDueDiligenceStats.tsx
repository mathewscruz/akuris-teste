import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DueDiligenceStats {
  totalAssessments: number;
  activeAssessments: number;
  pendingAssessments: number;
  completedAssessments: number;
  expiredAssessments: number;
  totalFornecedores: number;
  assessmentsThisMonth: number;
}

export const useDueDiligenceStats = () => {
  return useQuery({
    queryKey: ['due-diligence-stats'],
    queryFn: async (): Promise<DueDiligenceStats> => {
      const { data: assessments, error } = await supabase
        .from('due_diligence_assessments')
        .select('status, created_at');

      if (error) throw error;

      const { data: fornecedores } = await supabase
        .from('fornecedores')
        .select('id')
        .eq('status', 'ativo');

      const total = assessments?.length || 0;
      const active = assessments?.filter(a => a.status === 'ativo').length || 0;
      const pending = assessments?.filter(a => a.status === 'pendente').length || 0;
      const completed = assessments?.filter(a => a.status === 'concluido').length || 0;
      
      const hoje = new Date();
      // Temporariamente zerado até ajustar a estrutura da tabela
      const expired = 0;

      // Assessments deste mês
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      const thisMonth = assessments?.filter(a => {
        return new Date(a.created_at) >= inicioMes;
      }).length || 0;

      return {
        totalAssessments: total,
        activeAssessments: active,
        pendingAssessments: pending,
        completedAssessments: completed,
        expiredAssessments: expired,
        totalFornecedores: fornecedores?.length || 0,
        assessmentsThisMonth: thisMonth
      };
    },
  });
};