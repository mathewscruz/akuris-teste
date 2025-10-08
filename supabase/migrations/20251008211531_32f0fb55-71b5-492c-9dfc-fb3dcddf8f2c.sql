-- Criar função para popular dados de demonstração
-- Esta função pode ser chamada pelo usuário logado

CREATE OR REPLACE FUNCTION public.popular_dados_demonstracao()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_empresa_id uuid;
  v_user_id uuid;
  v_count_riscos int := 0;
  v_count_controles int := 0;
  v_count_documentos int := 0;
  v_count_incidentes int := 0;
  v_count_ativos int := 0;
  v_result jsonb;
BEGIN
  -- Buscar empresa_id e user_id do usuário atual
  SELECT empresa_id, user_id INTO v_empresa_id, v_user_id 
  FROM public.profiles 
  WHERE user_id = auth.uid();

  IF v_empresa_id IS NULL OR v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Usuário ou empresa não encontrados'
    );
  END IF;

  -- Verificar se já existem dados
  IF EXISTS (SELECT 1 FROM public.riscos WHERE empresa_id = v_empresa_id LIMIT 1) THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Dados de demonstração já existem para esta empresa'
    );
  END IF;

  -- Criar todas as categorias e configurações necessárias
  PERFORM popular_categorias_base(v_empresa_id);
  
  -- Popular módulo de Riscos
  v_count_riscos := popular_riscos_demo(v_empresa_id, v_user_id);
  
  -- Popular módulo de Controles
  v_count_controles := popular_controles_demo(v_empresa_id, v_user_id);
  
  -- Popular módulo de Documentos
  v_count_documentos := popular_documentos_demo(v_empresa_id, v_user_id);
  
  -- Popular módulo de Incidentes
  v_count_incidentes := popular_incidentes_demo(v_empresa_id, v_user_id);
  
  -- Popular módulo de Ativos
  v_count_ativos := popular_ativos_demo(v_empresa_id, v_user_id);
  
  v_result := jsonb_build_object(
    'success', true,
    'message', 'Dados de demonstração criados com sucesso!',
    'counts', jsonb_build_object(
      'riscos', v_count_riscos,
      'controles', v_count_controles,
      'documentos', v_count_documentos,
      'incidentes', v_count_incidentes,
      'ativos', v_count_ativos
    )
  );
  
  RETURN v_result;
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Erro ao criar dados: ' || SQLERRM
    );
END;
$$;

-- Função auxiliar para popular categorias base
CREATE OR REPLACE FUNCTION public.popular_categorias_base(p_empresa_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_matriz_id uuid;
BEGIN
  -- Categorias de Riscos
  INSERT INTO public.riscos_categorias (nome, descricao, cor, empresa_id)
  VALUES 
    ('Segurança da Informação', 'Riscos de segurança', '#ef4444', p_empresa_id),
    ('Operacional', 'Riscos operacionais', '#f59e0b', p_empresa_id),
    ('Compliance', 'Riscos de conformidade', '#8b5cf6', p_empresa_id)
  ON CONFLICT DO NOTHING;

  -- Matriz de Riscos
  INSERT INTO public.riscos_matrizes (nome, descricao, empresa_id, ativo)
  VALUES ('Matriz Corporativa 2025', 'Matriz principal', p_empresa_id, true)
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_matriz_id;

  -- Categorias de Controles
  INSERT INTO public.controles_categorias (nome, descricao, cor, empresa_id)
  VALUES 
    ('Segurança da Informação', 'Controles de segurança', '#3b82f6', p_empresa_id),
    ('Controles Operacionais', 'Controles operacionais', '#22c55e', p_empresa_id)
  ON CONFLICT DO NOTHING;

  -- Categorias de Documentos
  INSERT INTO public.documentos_categorias (nome, descricao, cor, empresa_id)
  VALUES 
    ('Políticas', 'Políticas organizacionais', '#8b5cf6', p_empresa_id),
    ('Procedimentos', 'Procedimentos operacionais', '#3b82f6', p_empresa_id)
  ON CONFLICT DO NOTHING;

  -- Localizações de Ativos
  INSERT INTO public.ativos_localizacoes (nome, descricao, empresa_id)
  VALUES 
    ('Datacenter Principal', 'Sala de servidores', p_empresa_id),
    ('Escritório Central', 'Sede administrativa', p_empresa_id)
  ON CONFLICT DO NOTHING;
END;
$$;

-- Função para popular riscos demo
CREATE OR REPLACE FUNCTION public.popular_riscos_demo(p_empresa_id uuid, p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_categoria_id uuid;
  v_matriz_id uuid;
  v_count int := 0;
BEGIN
  SELECT id INTO v_categoria_id FROM public.riscos_categorias WHERE empresa_id = p_empresa_id LIMIT 1;
  SELECT id INTO v_matriz_id FROM public.riscos_matrizes WHERE empresa_id = p_empresa_id LIMIT 1;
  
  INSERT INTO public.riscos (empresa_id, nome, descricao, categoria_id, matriz_id, probabilidade_inicial, impacto_inicial, nivel_risco_inicial, status, responsavel, data_identificacao, created_by)
  VALUES 
    (p_empresa_id, 'Vazamento de Dados', 'Risco de exposição de dados pessoais', v_categoria_id, v_matriz_id, 'provavel', 'catastrofico', 'critico', 'tratado', 'CISO', CURRENT_DATE - 45, p_user_id),
    (p_empresa_id, 'Falha no Backup', 'Falha nos backups de dados', v_categoria_id, v_matriz_id, 'possivel', 'maior', 'alto', 'monitorado', 'TI', CURRENT_DATE - 60, p_user_id),
    (p_empresa_id, 'Acesso Não Autorizado', 'Tentativas de acesso não autorizado', v_categoria_id, v_matriz_id, 'provavel', 'maior', 'alto', 'tratado', 'CISO', CURRENT_DATE - 30, p_user_id);
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- Função para popular controles demo
CREATE OR REPLACE FUNCTION public.popular_controles_demo(p_empresa_id uuid, p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_categoria_id uuid;
  v_count int := 0;
BEGIN
  SELECT id INTO v_categoria_id FROM public.controles_categorias WHERE empresa_id = p_empresa_id LIMIT 1;
  
  INSERT INTO public.controles (empresa_id, nome, descricao, tipo, categoria_id, status, criticidade, frequencia_teste, responsavel, created_by)
  VALUES 
    (p_empresa_id, 'Controle de Acesso', 'Gestão de permissões e MFA', 'preventivo', v_categoria_id, 'ativo', 'critico', 'mensal', 'CISO', p_user_id),
    (p_empresa_id, 'Backup Diário', 'Backup incremental diário', 'preventivo', v_categoria_id, 'ativo', 'critico', 'semanal', 'TI', p_user_id),
    (p_empresa_id, 'Revisão de Logs', 'Análise diária de logs', 'detectivo', v_categoria_id, 'ativo', 'alto', 'diario', 'CISO', p_user_id);
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- Função para popular documentos demo
CREATE OR REPLACE FUNCTION public.popular_documentos_demo(p_empresa_id uuid, p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count int := 0;
BEGIN
  INSERT INTO public.documentos (empresa_id, nome, descricao, tipo, status, classificacao, tags, data_vencimento, created_by)
  VALUES 
    (p_empresa_id, 'Política de Segurança', 'Política corporativa de segurança', 'politica', 'ativo', 'confidencial', ARRAY['seguranca', 'politica'], CURRENT_DATE + 365, p_user_id),
    (p_empresa_id, 'Manual LGPD', 'Guia de boas práticas LGPD', 'manual', 'ativo', 'interna', ARRAY['lgpd', 'privacidade'], CURRENT_DATE + 730, p_user_id),
    (p_empresa_id, 'Procedimento de Backup', 'Procedimento de backup de dados', 'procedimento', 'ativo', 'interna', ARRAY['backup', 'ti'], CURRENT_DATE + 365, p_user_id);
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- Função para popular incidentes demo
CREATE OR REPLACE FUNCTION public.popular_incidentes_demo(p_empresa_id uuid, p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count int := 0;
BEGIN
  INSERT INTO public.incidentes (empresa_id, titulo, descricao, tipo, gravidade, status, data_ocorrencia, data_deteccao, responsavel_id, created_by)
  VALUES 
    (p_empresa_id, 'Tentativa de Phishing', 'Campanha de phishing detectada', 'seguranca', 'alta', 'resolvido', CURRENT_DATE - 30, CURRENT_DATE - 30, p_user_id, p_user_id),
    (p_empresa_id, 'Acesso Não Autorizado', 'Tentativa de acesso não autorizado detectada', 'seguranca', 'critica', 'em_investigacao', CURRENT_DATE - 5, CURRENT_DATE - 5, p_user_id, p_user_id),
    (p_empresa_id, 'Perda de Equipamento', 'Perda de notebook corporativo', 'privacidade', 'media', 'contido', CURRENT_DATE - 15, CURRENT_DATE - 14, p_user_id, p_user_id);
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- Função para popular ativos demo
CREATE OR REPLACE FUNCTION public.popular_ativos_demo(p_empresa_id uuid, p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count int := 0;
BEGIN
  INSERT INTO public.ativos (empresa_id, nome, tipo, descricao, proprietario, localizacao, valor_negocio, criticidade, status, data_aquisicao, fornecedor, versao, created_by)
  VALUES 
    (p_empresa_id, 'Servidor Aplicação Principal', 'tecnologia', 'Servidor de aplicação produção', 'TI', 'Datacenter Principal', 350000, 'critico', 'ativo', CURRENT_DATE - 730, 'Dell', 'R740', p_user_id),
    (p_empresa_id, 'Banco de Dados PostgreSQL', 'tecnologia', 'Cluster PostgreSQL Produção', 'TI', 'Datacenter Principal', 500000, 'critico', 'ativo', CURRENT_DATE - 365, 'PostgreSQL', '15.2', p_user_id),
    (p_empresa_id, 'Firewall FortiGate', 'tecnologia', 'Firewall principal', 'TI', 'Datacenter Principal', 180000, 'critico', 'ativo', CURRENT_DATE - 500, 'Fortinet', '600E', p_user_id);
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;