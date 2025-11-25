-- Parte 4: ISO 31000:2018 (15 princípios e processos)
-- Framework: ISO 31000:2018

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
  -- Princípios de Gestão de Riscos
  ('PR1', 'Integrada', 'Gestão de riscos é parte integrante de todas as atividades organizacionais', 'Princípios', 'Gestão de Riscos', 3, true, 1),
  ('PR2', 'Estruturada e Abrangente', 'Abordagem estruturada e abrangente contribui para resultados consistentes e comparáveis', 'Princípios', 'Gestão de Riscos', 3, true, 2),
  ('PR3', 'Personalizada', 'Framework e processo de gestão de riscos são personalizados e proporcionais ao contexto', 'Princípios', 'Gestão de Riscos', 2, true, 3),
  ('PR4', 'Inclusiva', 'Envolvimento apropriado e oportuno das partes interessadas possibilita conhecimento, pontos de vista e percepções', 'Princípios', 'Governança', 2, true, 4),
  ('PR5', 'Dinâmica', 'Riscos podem emergir, mudar ou desaparecer à medida que contextos externos e internos mudam', 'Princípios', 'Gestão de Riscos', 3, true, 5),
  ('PR6', 'Melhor Informação Disponível', 'Entradas para gestão de riscos são baseadas em informações históricas e atuais', 'Princípios', 'Informação', 3, true, 6),
  ('PR7', 'Fatores Humanos e Culturais', 'Comportamento humano e cultura influenciam significativamente todos os aspectos da gestão de riscos', 'Princípios', 'Recursos Humanos', 2, true, 7),
  ('PR8', 'Melhoria Contínua', 'Gestão de riscos é continuamente melhorada através de aprendizado e experiência', 'Princípios', 'Melhoria Contínua', 2, true, 8),
  
  -- Framework de Gestão de Riscos
  ('FR1', 'Liderança e Comprometimento', 'Alta direção e órgãos de supervisão devem demonstrar liderança e comprometimento', 'Framework', 'Alta Direção', 3, true, 9),
  ('FR2', 'Integração', 'Integrar gestão de riscos em todas as atividades organizacionais', 'Framework', 'Gestão de Riscos', 3, true, 10),
  ('FR3', 'Concepção', 'Compreender organização e seu contexto, articular comprometimento, atribuir papéis', 'Framework', 'Gestão de Riscos', 3, true, 11),
  ('FR4', 'Implementação', 'Implementar framework de gestão de riscos na organização', 'Framework', 'Gestão de Riscos', 3, true, 12),
  ('FR5', 'Avaliação', 'Avaliar periodicamente a eficácia do framework de gestão de riscos', 'Framework', 'Auditoria', 3, true, 13),
  ('FR6', 'Melhoria', 'Melhorar continuamente adequação, suficiência e eficácia do framework', 'Framework', 'Melhoria Contínua', 2, true, 14),
  
  -- Processo de Gestão de Riscos
  ('PC1', 'Comunicação e Consulta', 'Comunicar e consultar partes interessadas durante processo de gestão de riscos', 'Processo', 'Comunicação', 2, true, 15),
  ('PC2', 'Escopo, Contexto e Critérios', 'Definir escopo, contexto externo e interno, e critérios de risco', 'Processo', 'Gestão de Riscos', 3, true, 16),
  ('PC3', 'Identificação de Riscos', 'Encontrar, reconhecer e descrever riscos que podem ajudar ou impedir alcance de objetivos', 'Processo', 'Gestão de Riscos', 3, true, 17),
  ('PC4', 'Análise de Riscos', 'Compreender natureza do risco e suas características incluindo nível de risco', 'Processo', 'Gestão de Riscos', 3, true, 18),
  ('PC5', 'Avaliação de Riscos', 'Comparar resultados da análise com critérios de risco e priorizar riscos', 'Processo', 'Gestão de Riscos', 3, true, 19),
  ('PC6', 'Tratamento de Riscos', 'Selecionar e implementar opções para abordar risco', 'Processo', 'Gestão de Riscos', 3, true, 20),
  ('PC7', 'Monitoramento e Análise Crítica', 'Monitorar e analisar criticamente riscos e processo de gestão de riscos', 'Processo', 'Monitoramento', 3, true, 21),
  ('PC8', 'Registro e Reporte', 'Documentar processo de gestão de riscos e seus resultados', 'Processo', 'Documentação', 2, true, 22)
) AS r(codigo, titulo, descricao, categoria, area_responsavel, peso, obrigatorio, ordem)
WHERE f.nome = 'ISO 31000:2018' AND f.versao = '2018';