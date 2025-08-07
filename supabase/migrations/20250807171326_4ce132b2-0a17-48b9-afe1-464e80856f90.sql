-- Criar tabelas para sistema de aprendizado contínuo
CREATE TABLE public.docgen_learning_patterns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id UUID NOT NULL,
  tipo_documento TEXT NOT NULL,
  pergunta_padrao TEXT NOT NULL,
  contexto_aplicacao JSONB DEFAULT '{}',
  taxa_sucesso DECIMAL DEFAULT 0.0,
  numero_usos INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.docgen_learning_patterns ENABLE ROW LEVEL SECURITY;

-- Policies para learning_patterns
CREATE POLICY "Users can view learning patterns from their empresa"
ON public.docgen_learning_patterns FOR SELECT
USING (empresa_id = get_user_empresa_id());

CREATE POLICY "Users can insert learning patterns in their empresa"
ON public.docgen_learning_patterns FOR INSERT
WITH CHECK (empresa_id = get_user_empresa_id());

CREATE POLICY "Users can update learning patterns from their empresa"
ON public.docgen_learning_patterns FOR UPDATE
USING (empresa_id = get_user_empresa_id());

-- Criar tabela para feedback implícito
CREATE TABLE public.docgen_feedback_implicit (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id UUID NOT NULL,
  conversation_id UUID NOT NULL,
  documento_salvo BOOLEAN DEFAULT false,
  tempo_geracao INTEGER, -- em segundos
  revisoes_necessarias INTEGER DEFAULT 0,
  qualidade_estimada INTEGER, -- 1-10
  padroes_identificados JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.docgen_feedback_implicit ENABLE ROW LEVEL SECURITY;

-- Policies para feedback_implicit
CREATE POLICY "Users can view feedback from their empresa"
ON public.docgen_feedback_implicit FOR SELECT
USING (empresa_id = get_user_empresa_id());

CREATE POLICY "Users can insert feedback in their empresa"
ON public.docgen_feedback_implicit FOR INSERT
WITH CHECK (empresa_id = get_user_empresa_id());

-- Expandir tabela de templates para incluir mais conhecimento específico
ALTER TABLE public.docgen_templates 
ADD COLUMN IF NOT EXISTS secoes_obrigatorias JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS perguntas_sequenciais JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS frameworks_relacionados TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS conhecimento_especializado JSONB DEFAULT '{}';

-- Atualizar template existente de política com conhecimento específico
UPDATE public.docgen_templates 
SET 
  secoes_obrigatorias = '[
    {"nome": "Objetivo", "descricao": "Definir o propósito e abrangência da política", "obrigatorio": true},
    {"nome": "Escopo", "descricao": "Delimitar onde a política se aplica", "obrigatorio": true},
    {"nome": "Diretrizes", "descricao": "Estabelecer as regras e procedimentos", "obrigatorio": true},
    {"nome": "Responsabilidades", "descricao": "Definir papéis e responsabilidades", "obrigatorio": true},
    {"nome": "Penalidades", "descricao": "Consequências do não cumprimento", "obrigatorio": false},
    {"nome": "Revisão", "descricao": "Periodicidade de revisão da política", "obrigatorio": true}
  ]',
  perguntas_sequenciais = '[
    {"ordem": 1, "pergunta": "Qual é o objetivo principal desta política? O que você deseja alcançar?", "secao": "Objetivo"},
    {"ordem": 2, "pergunta": "Qual é o escopo de aplicação? A quais sistemas, processos ou pessoas se aplica?", "secao": "Escopo"},
    {"ordem": 3, "pergunta": "Quais são as principais diretrizes ou regras que devem ser seguidas?", "secao": "Diretrizes"},
    {"ordem": 4, "pergunta": "Quem são os responsáveis por implementar e monitorar esta política?", "secao": "Responsabilidades"},
    {"ordem": 5, "pergunta": "Com que frequência esta política deve ser revisada?", "secao": "Revisão"}
  ]',
  frameworks_relacionados = '{"iso27001", "lgpd", "cobit"}',
  conhecimento_especializado = '{
    "iso27001": {
      "controles_relacionados": ["A.12.6.1", "A.12.6.2"],
      "requisitos": ["Gestão de vulnerabilidades técnicas", "Restrições na instalação de software"]
    },
    "lgpd": {
      "artigos_relacionados": ["Art. 46", "Art. 47"],
      "principios": ["Segurança", "Prevenção"]
    }
  }'
WHERE tipo_documento = 'politica';

-- Criar trigger para atualização automática do updated_at
CREATE OR REPLACE FUNCTION update_docgen_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_docgen_learning_patterns_updated_at
    BEFORE UPDATE ON public.docgen_learning_patterns
    FOR EACH ROW
    EXECUTE FUNCTION update_docgen_updated_at_column();