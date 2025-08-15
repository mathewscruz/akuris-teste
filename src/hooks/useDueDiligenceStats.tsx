import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DueDiligenceStats {
  totalTemplates: number;
  totalAssessments: number;
  activeAssessments: number;
  pendingAssessments: number;
  completedAssessments: number;
  expiredAssessments: number;
  totalFornecedores: number;
  assessmentsThisMonth: number;
  averageScore: number;
}

export const useDueDiligenceStats = () => {
  return useQuery({
    queryKey: ['due-diligence-stats'],
    queryFn: async (): Promise<DueDiligenceStats> => {
      // Buscar templates
      const { data: templates, error: templatesError } = await supabase
        .from('due_diligence_templates')
        .select('id')
        .eq('ativo', true);

      if (templatesError) throw templatesError;

      // Buscar assessments com score
      const { data: assessments, error } = await supabase
        .from('due_diligence_assessments')
        .select('status, created_at, data_expiracao, fornecedor_email, score_final');

      if (error) throw error;

      // Contar fornecedores únicos nos assessments
      const uniqueFornecedores = new Set(
        assessments?.map(a => a.fornecedor_email) || []
      ).size;

      const total = assessments?.length || 0;
      const active = assessments?.filter(a => a.status === 'ativo').length || 0;
      const pending = assessments?.filter(a => a.status === 'pendente').length || 0;
      const completed = assessments?.filter(a => a.status === 'concluido').length || 0;
      
      const hoje = new Date();
      // Assessments expirados
      const expired = assessments?.filter(a => {
        return a.data_expiracao && new Date(a.data_expiracao) < hoje && a.status !== 'concluido';
      }).length || 0;

      // Assessments deste mês
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      const thisMonth = assessments?.filter(a => {
        return new Date(a.created_at) >= inicioMes;
      }).length || 0;

      // Calcular score médio
      const completedWithScores = assessments?.filter(a => a.status === 'concluido' && a.score_final) || [];
      const averageScore = completedWithScores.length > 0 
        ? completedWithScores.reduce((sum, a) => sum + (a.score_final || 0), 0) / completedWithScores.length
        : 0;

      return {
        totalTemplates: templates?.length || 0,
        totalAssessments: total,
        activeAssessments: active,
        pendingAssessments: pending,
        completedAssessments: completed,
        expiredAssessments: expired,
        totalFornecedores: uniqueFornecedores,
        assessmentsThisMonth: thisMonth,
        averageScore
      };
    },
  });
};