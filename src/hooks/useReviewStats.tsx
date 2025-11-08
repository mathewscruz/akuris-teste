import { useOptimizedQuery } from "./useOptimizedQuery";
import { supabase } from "@/integrations/supabase/client";
import { useEmpresaId } from "./useEmpresaId";

export const useReviewStats = () => {
  const { empresaId } = useEmpresaId();

  return useOptimizedQuery(
    async () => {
      if (!empresaId) {
        return { data: null, error: "Empresa não encontrada" };
      }

      // Total de revisões
      const { count: totalReviews } = await supabase
        .from("access_reviews")
        .select("*", { count: "exact", head: true })
        .eq("empresa_id", empresaId);

      // Revisões em andamento
      const { count: emAndamento } = await supabase
        .from("access_reviews")
        .select("*", { count: "exact", head: true })
        .eq("empresa_id", empresaId)
        .eq("status", "em_andamento");

      // Revisões concluídas
      const { count: concluidas } = await supabase
        .from("access_reviews")
        .select("*", { count: "exact", head: true })
        .eq("empresa_id", empresaId)
        .eq("status", "concluida");

      // Revisões vencidas
      const { count: vencidas } = await supabase
        .from("access_reviews")
        .select("*", { count: "exact", head: true })
        .eq("empresa_id", empresaId)
        .eq("status", "em_andamento")
        .lt("data_limite", new Date().toISOString().split("T")[0]);

      // Total de contas revisadas
      const { data: statsData } = await supabase
        .from("access_reviews")
        .select("contas_revisadas, contas_aprovadas, contas_revogadas")
        .eq("empresa_id", empresaId);

      const contasRevisadas = statsData?.reduce((acc, r) => acc + (r.contas_revisadas || 0), 0) || 0;
      const contasAprovadas = statsData?.reduce((acc, r) => acc + (r.contas_aprovadas || 0), 0) || 0;
      const contasRevogadas = statsData?.reduce((acc, r) => acc + (r.contas_revogadas || 0), 0) || 0;

      return {
        data: {
          total: totalReviews || 0,
          emAndamento: emAndamento || 0,
          concluidas: concluidas || 0,
          vencidas: vencidas || 0,
          contasRevisadas,
          contasAprovadas,
          contasRevogadas,
        },
        error: null,
      };
    },
    [empresaId],
    {
      cacheKey: `review-stats-${empresaId}`,
      cacheDuration: 60000,
    }
  );
};
