-- Parte 5: ISO/IEC 27701:2019 (49 controles adicionais de privacidade)
-- Framework: ISO/IEC 27701:2019

INSERT INTO public.gap_analysis_requirements (framework_id, codigo, titulo, descricao, categoria, area_responsavel, peso, obrigatorio, ordem)
SELECT 
  f.id,
  r.codigo,
  r.titulo,
  r.descricao,
  r.categoria,
  r.area_responsavel,
  r.peso,
  r.obrigatorio,
  r.ordem
FROM public.gap_analysis_frameworks f
CROSS JOIN (VALUES
  -- Controles PII para Controladores
  ('5.2.1', 'Políticas de Privacidade', 'Estabelecer e manter políticas de privacidade para dados pessoais', 'Controlador - Políticas', 'Privacidade', 3, true, 1),
  ('5.2.2', 'Responsabilidades pela Privacidade', 'Atribuir responsabilidades pela proteção de dados pessoais', 'Controlador - Organização', 'Privacidade', 3, true, 2),
  ('5.2.3', 'Autorização de Processamento', 'Obter autorização para processar dados pessoais', 'Controlador - Operações', 'Privacidade', 3, true, 3),
  ('5.2.4', 'Determinação e Documentação de Propósito', 'Determinar e documentar propósitos de processamento', 'Controlador - Operações', 'Privacidade', 3, true, 4),
  ('5.2.5', 'Base Legal para Processamento', 'Identificar e documentar base legal para cada propósito', 'Controlador - Operações', 'Privacidade', 3, true, 5),
  ('5.2.6', 'Consentimento', 'Obter, registrar e gerenciar consentimentos válidos', 'Controlador - Operações', 'Privacidade', 3, true, 6),
  ('5.2.7', 'Limitação de Processamento', 'Limitar processamento ao necessário para propósitos', 'Controlador - Operações', 'Privacidade', 3, true, 7),
  ('5.2.8', 'Precisão e Qualidade', 'Manter dados pessoais precisos e atualizados', 'Controlador - Operações', 'Privacidade', 3, true, 8),
  ('5.2.9', 'Retenção de PII', 'Definir períodos de retenção baseados em propósitos', 'Controlador - Operações', 'Privacidade', 3, true, 9),
  ('5.2.10', 'Eliminação de PII', 'Eliminar dados pessoais quando não mais necessários', 'Controlador - Operações', 'Privacidade', 3, true, 10),
  ('5.2.11', 'Informação aos Titulares', 'Fornecer informações claras aos titulares', 'Controlador - Direitos', 'Privacidade', 3, true, 11),
  ('5.2.12', 'Direito de Acesso', 'Permitir titulares acessarem seus dados', 'Controlador - Direitos', 'Privacidade', 3, true, 12),
  ('5.2.13', 'Direito de Retificação', 'Permitir correção de dados imprecisos', 'Controlador - Direitos', 'Privacidade', 3, true, 13),
  ('5.2.14', 'Direito de Apagamento', 'Implementar direito de apagamento quando aplicável', 'Controlador - Direitos', 'Privacidade', 3, true, 14),
  ('5.2.15', 'Direito de Portabilidade', 'Fornecer dados em formato estruturado e legível', 'Controlador - Direitos', 'Privacidade', 3, true, 15),
  ('5.2.16', 'Direito de Oposição', 'Permitir oposição a processamento em casos específicos', 'Controlador - Direitos', 'Privacidade', 3, true, 16),
  ('5.2.17', 'Decisões Automatizadas', 'Implementar salvaguardas para decisões automatizadas', 'Controlador - Operações', 'Privacidade', 3, true, 17),
  ('5.2.18', 'Transferências Internacionais', 'Garantir proteção adequada em transferências', 'Controlador - Transferências', 'Privacidade', 3, true, 18),
  ('5.2.19', 'Avaliação de Impacto à Privacidade', 'Realizar DPIA quando processamento apresentar risco', 'Controlador - Riscos', 'Privacidade', 3, true, 19),
  ('5.2.20', 'Notificação de Violações', 'Notificar autoridades e titulares sobre violações', 'Controlador - Incidentes', 'Privacidade', 3, true, 20),
  ('5.2.21', 'Encarregado de Proteção de Dados', 'Designar e posicionar DPO apropriadamente', 'Controlador - Organização', 'Privacidade', 3, true, 21),
  ('5.2.22', 'Registros de Atividades de Processamento', 'Manter registros de atividades de processamento', 'Controlador - Documentação', 'Privacidade', 3, true, 22),
  ('5.2.23', 'Monitoramento de Mudanças na Privacidade', 'Monitorar mudanças que afetem privacidade', 'Controlador - Monitoramento', 'Privacidade', 2, true, 23),
  ('5.2.24', 'Conscientização e Treinamento', 'Treinar equipe sobre privacidade de dados', 'Controlador - Pessoas', 'Treinamento', 2, true, 24),
  
  -- Controles PII para Processadores
  ('6.2.1', 'Termos do Contrato', 'Estabelecer termos contratuais claros de processamento', 'Processador - Contratos', 'Privacidade', 3, true, 25),
  ('6.2.2', 'Instruções de Processamento', 'Processar dados apenas conforme instruções documentadas', 'Processador - Operações', 'Privacidade', 3, true, 26),
  ('6.2.3', 'Competência, Conscientização e Treinamento', 'Garantir competência da equipe em privacidade', 'Processador - Pessoas', 'Treinamento', 2, true, 27),
  ('6.2.4', 'Confidencialidade', 'Garantir confidencialidade da equipe', 'Processador - Segurança', 'Privacidade', 3, true, 28),
  ('6.2.5', 'Uso de Subprocessadores', 'Obter autorização para uso de subprocessadores', 'Processador - Terceiros', 'Privacidade', 3, true, 29),
  ('6.2.6', 'Retorno e Eliminação de PII', 'Retornar ou eliminar dados conforme instruções', 'Processador - Operações', 'Privacidade', 3, true, 30),
  ('6.2.7', 'Notificação de Violações ao Controlador', 'Notificar controlador sobre violações', 'Processador - Incidentes', 'Privacidade', 3, true, 31),
  ('6.2.8', 'Assistência ao Controlador', 'Auxiliar controlador no cumprimento de obrigações', 'Processador - Suporte', 'Privacidade', 3, true, 32),
  ('6.2.9', 'Disponibilização de Informações', 'Fornecer informações para demonstrar conformidade', 'Processador - Auditoria', 'Privacidade', 3, true, 33),
  ('6.2.10', 'Auditorias do Controlador', 'Permitir auditorias pelo controlador', 'Processador - Auditoria', 'Privacidade', 3, true, 34),
  ('6.2.11', 'Avaliação de Transferências Internacionais', 'Avaliar adequação de transferências', 'Processador - Transferências', 'Privacidade', 3, true, 35),
  ('6.2.12', 'Processamento para Propósitos Próprios', 'Obter autorização para processamento próprio', 'Processador - Operações', 'Privacidade', 3, true, 36),
  
  -- Controles Organizacionais Adicionais
  ('7.2.1', 'Identificação de Base Legal', 'Sistema para identificar bases legais aplicáveis', 'Organização', 'Privacidade', 3, true, 37),
  ('7.2.2', 'Privacidade por Design e por Padrão', 'Incorporar privacidade no design de sistemas', 'Organização', 'Privacidade', 3, true, 38),
  ('7.2.3', 'Compartilhamento de PII', 'Controlar compartilhamento de dados pessoais', 'Organização', 'Privacidade', 3, true, 39),
  ('7.2.4', 'Acordo de Processamento Conjunto', 'Estabelecer acordos para processamento conjunto', 'Organização', 'Privacidade', 2, true, 40),
  ('7.2.5', 'Políticas de PII para Clientes', 'Estabelecer políticas para dados de clientes', 'Organização', 'Privacidade', 3, true, 41),
  ('7.2.6', 'Registros de Consentimento', 'Manter registros de consentimentos obtidos', 'Organização', 'Privacidade', 3, true, 42),
  ('7.2.7', 'Retirada de Consentimento', 'Facilitar retirada de consentimento', 'Organização', 'Privacidade', 3, true, 43),
  ('7.2.8', 'Provisão de Serviços de Privacidade', 'Fornecer serviços que respeitem privacidade', 'Organização', 'Privacidade', 2, true, 44),
  ('7.2.9', 'Dados de Menores', 'Implementar proteções adicionais para menores', 'Organização', 'Privacidade', 3, true, 45),
  ('7.2.10', 'Marketing Direto', 'Controlar uso de dados para marketing', 'Organização', 'Marketing', 3, true, 46),
  ('7.2.11', 'Privacidade em Mobile e IoT', 'Implementar controles para dispositivos móveis e IoT', 'Tecnologia', 'Privacidade', 3, true, 47),
  ('7.2.12', 'Minimização de Dados', 'Coletar apenas dados necessários', 'Organização', 'Privacidade', 3, true, 48),
  ('7.2.13', 'Transparência no Processamento', 'Garantir transparência total no processamento', 'Organização', 'Privacidade', 3, true, 49)
) AS r(codigo, titulo, descricao, categoria, area_responsavel, peso, obrigatorio, ordem)
WHERE f.nome = 'ISO/IEC 27701:2019' AND f.versao = '2019';