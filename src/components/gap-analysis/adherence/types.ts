export interface AdherenceAssessment {
  id: string;
  empresa_id: string;
  framework_id: string;
  documento_id: string;
  nome_analise: string;
  descricao?: string;
  status: 'processando' | 'concluido' | 'erro';
  resultado_geral?: 'conforme' | 'nao_conforme' | 'parcial';
  percentual_conformidade: number;
  pontos_fortes: PontoForte[];
  pontos_melhoria: PontoMelhoria[];
  gaps_identificados: any[];
  recomendacoes: string[];
  analise_detalhada?: string;
  documento_nome?: string;
  documento_tipo?: string;
  framework_nome?: string;
  framework_versao?: string;
  metadados_analise?: any;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface AdherenceDetail {
  id: string;
  assessment_id: string;
  requirement_id: string;
  requisito_codigo?: string;
  requisito_titulo?: string;
  status_aderencia: 'conforme' | 'nao_conforme' | 'parcial' | 'nao_aplicavel';
  evidencias_encontradas?: string;
  gaps_especificos?: string;
  score_conformidade?: number;
  observacoes_ia?: string;
  created_at: string;
}

export interface PontoForte {
  titulo: string;
  descricao: string;
}

export interface PontoMelhoria {
  titulo: string;
  descricao: string;
  prioridade: 'alta' | 'media' | 'baixa';
}

export interface Framework {
  id: string;
  nome: string;
  versao: string;
  descricao?: string;
}

export interface Documento {
  id: string;
  nome: string;
  tipo: string;
  arquivo_url?: string;
  arquivo_nome?: string;
}