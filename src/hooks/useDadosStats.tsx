import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DadosStats {
  total: number;
  sensibilidade: {
    comum: number;
    sensivel: number;
    critico: number;
  };
  categorias: {
    identificacao: number;
    contato: number;
    financeiro: number;
    saude: number;
    outros: number;
  };
  fluxosAtivos: number;
  solicitacoesPendentes: number;
  ropaRegistros: number;
}

export const useDadosStats = () => {
  return useQuery({
    queryKey: ['dados-stats'],
    queryFn: async (): Promise<DadosStats> => {
      const { data: dados, error } = await supabase
        .from('dados_pessoais')
        .select('sensibilidade, categoria_dados');

      const { data: fluxos } = await supabase
        .from('dados_fluxos')
        .select('status');

      const { data: solicitacoes } = await supabase
        .from('dados_solicitacoes_titular')
        .select('status');

      const { data: ropa } = await supabase
        .from('ropa_registros')
        .select('id');

      if (error) throw error;

      const total = dados?.length || 0;
      
      // Análise por sensibilidade
      const sensibilidade = {
        comum: dados?.filter(d => d.sensibilidade === 'comum').length || 0,
        sensivel: dados?.filter(d => d.sensibilidade === 'sensivel').length || 0,
        critico: dados?.filter(d => d.sensibilidade === 'critico').length || 0,
      };

      // Análise por categoria
      const categorias = {
        identificacao: dados?.filter(d => d.categoria_dados === 'identificacao').length || 0,
        contato: dados?.filter(d => d.categoria_dados === 'contato').length || 0,
        financeiro: dados?.filter(d => d.categoria_dados === 'financeiro').length || 0,
        saude: dados?.filter(d => d.categoria_dados === 'saude').length || 0,
        outros: dados?.filter(d => !['identificacao', 'contato', 'financeiro', 'saude'].includes(d.categoria_dados)).length || 0,
      };

      const fluxosAtivos = fluxos?.filter(f => f.status === 'ativo').length || 0;
      const solicitacoesPendentes = solicitacoes?.filter(s => s.status === 'pendente').length || 0;
      const ropaRegistros = ropa?.length || 0;

      return {
        total,
        sensibilidade,
        categorias,
        fluxosAtivos,
        solicitacoesPendentes,
        ropaRegistros
      };
    },
  });
};