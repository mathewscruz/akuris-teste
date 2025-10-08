-- Criar função que aceita IDs como parâmetros
CREATE OR REPLACE FUNCTION public.popular_dados_demonstracao_direto(p_empresa_id uuid, p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_categoria_risco_id uuid;
  v_categoria_controle_id uuid;
  v_categoria_doc_id uuid;
  v_categoria_denuncia_id uuid;
  v_matriz_id uuid;
  v_localizacao_id uuid;
  v_sistema_id uuid;
  v_fornecedor_dd_id uuid;
  v_fornecedor_id uuid;
  v_framework_id uuid;
  v_template_dd_id uuid;
BEGIN
  -- Verificar se já existem riscos
  IF EXISTS (SELECT 1 FROM public.riscos WHERE empresa_id = p_empresa_id LIMIT 1) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Dados já existem');
  END IF;

  -- Categorias Riscos
  INSERT INTO public.riscos_categorias (nome, descricao, cor, empresa_id)
  VALUES ('Segurança da Informação', 'Riscos de segurança', '#ef4444', p_empresa_id)
  RETURNING id INTO v_categoria_risco_id;

  -- Matriz Riscos
  INSERT INTO public.riscos_matrizes (nome, descricao, empresa_id, ativo)
  VALUES ('Matriz Corporativa 2025', 'Matriz principal', p_empresa_id, true)
  RETURNING id INTO v_matriz_id;

  -- Categorias Controles
  INSERT INTO public.controles_categorias (nome, descricao, cor, empresa_id)
  VALUES ('Segurança da Informação', 'Controles de segurança', '#3b82f6', p_empresa_id)
  RETURNING id INTO v_categoria_controle_id;

  -- Categorias Documentos
  INSERT INTO public.documentos_categorias (nome, descricao, cor, empresa_id)
  VALUES ('Políticas', 'Políticas organizacionais', '#8b5cf6', p_empresa_id)
  RETURNING id INTO v_categoria_doc_id;

  -- Localizações
  INSERT INTO public.ativos_localizacoes (nome, descricao, empresa_id)
  VALUES ('Datacenter Principal', 'Sala servidores', p_empresa_id)
  RETURNING id INTO v_localizacao_id;

  -- Sistemas
  INSERT INTO public.contas_privilegiadas_sistemas (nome, descricao, tipo_sistema, criticidade, empresa_id)
  VALUES ('Active Directory', 'Controlador de domínio', 'Autenticação', 'critico', p_empresa_id)
  RETURNING id INTO v_sistema_id;

  -- Categorias Denúncia
  INSERT INTO public.denuncias_categorias (nome, descricao, cor, empresa_id)
  VALUES ('Assédio', 'Casos de assédio', '#ef4444', p_empresa_id)
  RETURNING id INTO v_categoria_denuncia_id;

  -- RISCOS
  INSERT INTO public.riscos (empresa_id, nome, descricao, categoria_id, matriz_id, probabilidade_inicial, impacto_inicial, nivel_risco_inicial, status, responsavel, data_identificacao, created_by)
  VALUES 
    (p_empresa_id, 'Vazamento de Dados', 'Risco de exposição', v_categoria_risco_id, v_matriz_id, 'provavel', 'catastrofico', 'critico', 'tratado', 'CISO', CURRENT_DATE - 45, p_user_id),
    (p_empresa_id, 'Falha no Backup', 'Falha nos backups', v_categoria_risco_id, v_matriz_id, 'possivel', 'maior', 'alto', 'monitorado', 'TI', CURRENT_DATE - 60, p_user_id),
    (p_empresa_id, 'Acesso Não Autorizado', 'Tentativas indevidas', v_categoria_risco_id, v_matriz_id, 'provavel', 'maior', 'alto', 'tratado', 'CISO', CURRENT_DATE - 30, p_user_id);

  -- CONTROLES
  INSERT INTO public.controles (empresa_id, nome, descricao, tipo, categoria_id, status, criticidade, frequencia_teste, responsavel, created_by)
  VALUES 
    (p_empresa_id, 'Controle de Acesso', 'Gestão MFA', 'preventivo', v_categoria_controle_id, 'ativo', 'critico', 'mensal', 'CISO', p_user_id),
    (p_empresa_id, 'Backup Diário', 'Backup incremental', 'preventivo', v_categoria_controle_id, 'ativo', 'critico', 'semanal', 'TI', p_user_id),
    (p_empresa_id, 'Revisão Logs', 'Análise diária', 'detectivo', v_categoria_controle_id, 'ativo', 'alto', 'diario', 'CISO', p_user_id);

  -- DOCUMENTOS
  INSERT INTO public.documentos (empresa_id, nome, descricao, tipo, status, classificacao, tags, data_vencimento, created_by)
  VALUES 
    (p_empresa_id, 'Política de Segurança', 'Política corporativa', 'politica', 'ativo', 'confidencial', ARRAY['seguranca'], CURRENT_DATE + 365, p_user_id),
    (p_empresa_id, 'Manual LGPD', 'Guia práticas', 'manual', 'ativo', 'interna', ARRAY['lgpd'], CURRENT_DATE + 730, p_user_id),
    (p_empresa_id, 'Procedimento Backup', 'Procedimento', 'procedimento', 'ativo', 'interna', ARRAY['backup'], CURRENT_DATE + 365, p_user_id);

  -- INCIDENTES
  INSERT INTO public.incidentes (empresa_id, titulo, descricao, tipo, gravidade, status, data_ocorrencia, data_deteccao, responsavel_id, created_by)
  VALUES 
    (p_empresa_id, 'Tentativa Phishing', 'Campanha detectada', 'seguranca', 'alta', 'resolvido', CURRENT_DATE - 30, CURRENT_DATE - 30, p_user_id, p_user_id),
    (p_empresa_id, 'Acesso Não Autorizado', 'Tentativa detectada', 'seguranca', 'critica', 'em_investigacao', CURRENT_DATE - 5, CURRENT_DATE - 5, p_user_id, p_user_id),
    (p_empresa_id, 'Perda Notebook', 'Equipamento perdido', 'privacidade', 'media', 'contido', CURRENT_DATE - 15, CURRENT_DATE - 14, p_user_id, p_user_id);

  -- ATIVOS
  INSERT INTO public.ativos (empresa_id, nome, tipo, descricao, proprietario, localizacao, valor_negocio, criticidade, status, data_aquisicao, fornecedor, versao, created_by)
  VALUES 
    (p_empresa_id, 'Servidor Aplicação', 'tecnologia', 'Dell PowerEdge', 'TI', 'Datacenter Principal', 350000, 'critico', 'ativo', CURRENT_DATE - 730, 'Dell', 'R740', p_user_id),
    (p_empresa_id, 'Banco PostgreSQL', 'tecnologia', 'Cluster PostgreSQL', 'TI', 'Datacenter Principal', 500000, 'critico', 'ativo', CURRENT_DATE - 365, 'PostgreSQL', '15.2', p_user_id),
    (p_empresa_id, 'Firewall FortiGate', 'tecnologia', 'Firewall principal', 'TI', 'Datacenter Principal', 180000, 'critico', 'ativo', CURRENT_DATE - 500, 'Fortinet', '600E', p_user_id);

  -- FORNECEDORES
  INSERT INTO public.fornecedores (nome, cnpj, email, telefone, endereco, status, categoria, empresa_id)
  VALUES 
    ('Microsoft Brasil', '04.712.500/0001-07', 'contato@ms.com', '(11) 4002-8922', 'SP', 'ativo', 'tecnologia', p_empresa_id),
    ('TechSupport', '12.345.678/0001-90', 'contato@tech.com', '(11) 3456-7890', 'SP', 'ativo', 'servicos', p_empresa_id)
  RETURNING id INTO v_fornecedor_id;

  -- CONTRATOS
  INSERT INTO public.contratos (empresa_id, numero_contrato, nome, tipo, fornecedor_id, valor_total, valor_mensal, data_inicio, data_fim, data_assinatura, status, objeto, created_by)
  VALUES 
    (p_empresa_id, 'CTR-2024-001', 'Licenciamento M365', 'licenciamento', v_fornecedor_id, 600000, 50000, CURRENT_DATE - 180, CURRENT_DATE + 545, CURRENT_DATE - 200, 'ativo', 'Licenças', p_user_id),
    (p_empresa_id, 'CTR-2024-002', 'Suporte TI', 'servicos', v_fornecedor_id, 360000, 30000, CURRENT_DATE - 150, CURRENT_DATE + 575, CURRENT_DATE - 165, 'ativo', 'Suporte', p_user_id);

  -- DADOS PESSOAIS
  INSERT INTO public.dados_pessoais (empresa_id, nome, descricao, categoria_dados, tipo_dados, sensibilidade, origem_coleta, finalidade_tratamento, base_legal, prazo_retencao, created_by)
  VALUES 
    (p_empresa_id, 'Dados Colaboradores', 'Nome, CPF, RG', 'colaboradores', 'identificacao', 'sensivel', 'RH', 'Gestão RH', 'contrato_trabalho', '5 anos', p_user_id),
    (p_empresa_id, 'Dados Clientes', 'Email, telefone', 'clientes', 'contato', 'comum', 'Vendas', 'Relacionamento', 'consentimento', '2 anos', p_user_id),
    (p_empresa_id, 'Dados Financeiros', 'Conta bancária', 'fornecedores', 'financeiro', 'sensivel', 'Financeiro', 'Pagamentos', 'contrato', '5 anos', p_user_id);

  -- AUDITORIAS
  INSERT INTO public.auditorias (empresa_id, titulo, tipo, escopo, objetivo, data_inicio, data_fim, status, lider_auditoria, equipe, metodologia, created_by)
  VALUES 
    (p_empresa_id, 'Auditoria LGPD 2025', 'conformidade', 'Dados', 'Verificar conformidade', CURRENT_DATE - 30, CURRENT_DATE + 30, 'em_andamento', 'DPO', ARRAY['CISO'], 'ISO 19011', p_user_id),
    (p_empresa_id, 'Auditoria Financeira', 'interna', 'Financeiro', 'Avaliar controles', CURRENT_DATE - 90, CURRENT_DATE - 30, 'concluida', 'CFO', ARRAY['Auditor'], 'COSO', p_user_id);

  -- GAP ANALYSIS
  INSERT INTO public.gap_analysis_frameworks (empresa_id, nome, versao, tipo_framework, descricao, ativo, created_by)
  VALUES 
    (p_empresa_id, 'ISO/IEC 27001:2022', '2022', 'seguranca_informacao', 'Framework ISO', true, p_user_id),
    (p_empresa_id, 'LGPD', '2020', 'privacidade', 'Lei Proteção Dados', true, p_user_id)
  RETURNING id INTO v_framework_id;

  INSERT INTO public.gap_analysis_requirements (framework_id, codigo, titulo, descricao, categoria, peso, obrigatorio, ordem)
  VALUES 
    (v_framework_id, 'A.5.1', 'Políticas Segurança', 'Estabelecer políticas', 'Políticas', 3, true, 1),
    (v_framework_id, 'A.8.1', 'Inventário Ativos', 'Manter inventário', 'Ativos', 3, true, 2);

  -- DUE DILIGENCE
  SELECT id INTO v_template_dd_id FROM public.due_diligence_templates WHERE padrao = true LIMIT 1;

  INSERT INTO public.due_diligence_fornecedores (empresa_id, nome, cnpj, email, contato, telefone, categoria, porte, pais, status, created_by)
  VALUES 
    (p_empresa_id, 'Tech Solutions', '12.345.678/0001-90', 'contato@tech.com', 'Roberto', '(11) 98765-4321', 'tecnologia', 'medio', 'Brasil', 'ativo', p_user_id)
  RETURNING id INTO v_fornecedor_dd_id;

  INSERT INTO public.due_diligence_assessments (empresa_id, fornecedor_id, template_id, nome, descricao, status, data_inicio, data_conclusao, responsavel_id, score_final, observacoes, created_by)
  VALUES 
    (p_empresa_id, v_fornecedor_dd_id, v_template_dd_id, 'DD - Tech Solutions', 'Avaliação', 'concluido', CURRENT_DATE - 90, CURRENT_DATE - 60, p_user_id, 85, 'Aprovado', p_user_id);

  -- DENÚNCIAS
  INSERT INTO public.denuncias (empresa_id, protocolo, titulo, descricao, tipo_denuncia, categoria_id, gravidade, status, canal_denuncia, data_ocorrencia, anonima, created_by)
  VALUES 
    (p_empresa_id, gerar_protocolo_denuncia(), 'Assédio Moral', 'Relato inadequado', 'assedio_moral', v_categoria_denuncia_id, 'media', 'em_investigacao', 'formulario_web', CURRENT_DATE - 10, false, p_user_id),
    (p_empresa_id, gerar_protocolo_denuncia(), 'Suspeita Fraude', 'Indícios manipulação', 'fraude', v_categoria_denuncia_id, 'alta', 'nova', 'email', CURRENT_DATE - 3, true, p_user_id);

  -- CONTAS PRIVILEGIADAS
  INSERT INTO public.contas_privilegiadas (empresa_id, sistema_id, nome_conta, descricao, tipo_conta, nivel_privilegio, proprietario, aprovador, data_criacao, data_expiracao, status, utiliza_mfa, rotacao_senha_dias, ultima_rotacao_senha, created_by)
  VALUES 
    (p_empresa_id, v_sistema_id, 'Administrator', 'Conta admin', 'administrativa', 'critico', 'CISO', 'CEO', CURRENT_DATE - 730, CURRENT_DATE + 365, 'ativa', true, 90, CURRENT_DATE - 45, p_user_id),
    (p_empresa_id, v_sistema_id, 'root', 'Conta root', 'sistema', 'critico', 'TI', 'CTO', CURRENT_DATE - 600, CURRENT_DATE + 365, 'ativa', true, 60, CURRENT_DATE - 30, p_user_id);

  RETURN jsonb_build_object('success', true, 'message', 'Dados criados com sucesso');
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'message', SQLERRM);
END;
$$;