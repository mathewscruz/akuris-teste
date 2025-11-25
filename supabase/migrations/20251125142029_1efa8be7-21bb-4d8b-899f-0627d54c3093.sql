-- Parte 5: HIPAA (54 requisitos de Privacy e Security Rules)
-- Framework: HIPAA 1996

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
  -- Privacy Rule - Direitos dos Pacientes
  ('PR.1', 'Direito de Aviso de Práticas de Privacidade', 'Fornecer aviso escrito sobre usos de informações de saúde', 'Privacy Rule - Direitos', 'Privacidade', 3, true, 1),
  ('PR.2', 'Direito de Acesso a PHI', 'Permitir indivíduos acessarem suas informações de saúde', 'Privacy Rule - Direitos', 'Privacidade', 3, true, 2),
  ('PR.3', 'Direito de Emendas', 'Permitir correções em registros de saúde', 'Privacy Rule - Direitos', 'Privacidade', 3, true, 3),
  ('PR.4', 'Direito de Contabilização de Divulgações', 'Fornecer lista de divulgações de PHI', 'Privacy Rule - Direitos', 'Privacidade', 3, true, 4),
  ('PR.5', 'Direito de Solicitar Restrições', 'Permitir solicitação de limitações no uso de PHI', 'Privacy Rule - Direitos', 'Privacidade', 2, true, 5),
  ('PR.6', 'Direito de Comunicações Confidenciais', 'Acomodar solicitações de comunicação alternativa', 'Privacy Rule - Direitos', 'Privacidade', 2, true, 6),
  
  -- Privacy Rule - Usos e Divulgações
  ('PR.7', 'Minimização de Uso', 'Usar e divulgar apenas PHI minimamente necessária', 'Privacy Rule - Usos', 'Privacidade', 3, true, 7),
  ('PR.8', 'Uso para Tratamento, Pagamento e Operações', 'Estabelecer usos permitidos de PHI', 'Privacy Rule - Usos', 'Saúde', 3, true, 8),
  ('PR.9', 'Autorização para Outros Usos', 'Obter autorização para usos não rotineiros', 'Privacy Rule - Usos', 'Privacidade', 3, true, 9),
  ('PR.10', 'Marketing', 'Obter autorização para comunicações de marketing', 'Privacy Rule - Usos', 'Marketing', 3, true, 10),
  ('PR.11', 'Venda de PHI', 'Proibir venda de PHI sem autorização', 'Privacy Rule - Usos', 'Privacidade', 3, true, 11),
  ('PR.12', 'Pesquisa', 'Estabelecer requisitos para uso em pesquisa', 'Privacy Rule - Usos', 'Pesquisa', 3, true, 12),
  
  -- Privacy Rule - Salvaguardas Administrativas
  ('PR.13', 'Oficial de Privacidade', 'Designar oficial responsável por privacidade', 'Privacy Rule - Admin', 'Privacidade', 3, true, 13),
  ('PR.14', 'Treinamento de Privacidade', 'Treinar força de trabalho sobre políticas de privacidade', 'Privacy Rule - Admin', 'Treinamento', 2, true, 14),
  ('PR.15', 'Mitigação', 'Mitigar efeitos prejudiciais de violações', 'Privacy Rule - Admin', 'Privacidade', 3, true, 15),
  ('PR.16', 'Política de Não Retaliação', 'Proibir retaliação contra reclamantes', 'Privacy Rule - Admin', 'Recursos Humanos', 2, true, 16),
  ('PR.17', 'Processo de Reclamações', 'Estabelecer processo para reclamações', 'Privacy Rule - Admin', 'Compliance', 3, true, 17),
  ('PR.18', 'Documentação e Retenção', 'Manter documentação por 6 anos', 'Privacy Rule - Admin', 'Gestão Documental', 3, true, 18),
  
  -- Privacy Rule - Acordos com Parceiros de Negócios
  ('PR.19', 'Business Associate Agreement', 'Estabelecer contratos com parceiros de negócios', 'Privacy Rule - Parceiros', 'Contratos', 3, true, 19),
  ('PR.20', 'Requisitos em Contratos', 'Incluir salvaguardas obrigatórias em contratos', 'Privacy Rule - Parceiros', 'Contratos', 3, true, 20),
  
  -- Security Rule - Salvaguardas Administrativas
  ('SR.1', 'Avaliação de Riscos', 'Conduzir avaliação precisa e completa de riscos', 'Security Rule - Admin', 'Gestão de Riscos', 3, true, 21),
  ('SR.2', 'Gestão de Riscos', 'Implementar medidas de segurança para reduzir riscos', 'Security Rule - Admin', 'Gestão de Riscos', 3, true, 22),
  ('SR.3', 'Política e Procedimentos de Sanção', 'Aplicar sanções por violações de política', 'Security Rule - Admin', 'Compliance', 3, true, 23),
  ('SR.4', 'Revisão de Sistemas de Informação', 'Revisar regularmente atividades dos sistemas', 'Security Rule - Admin', 'Auditoria Interna', 3, true, 24),
  ('SR.5', 'Autorização e Supervisão', 'Autorizar e supervisionar força de trabalho', 'Security Rule - Admin', 'Recursos Humanos', 3, true, 25),
  ('SR.6', 'Autorização e Documentação de Acesso', 'Implementar procedimentos de autorização de acesso', 'Security Rule - Admin', 'Controle de Acesso', 3, true, 26),
  ('SR.7', 'Treinamento de Segurança', 'Treinar força de trabalho em segurança', 'Security Rule - Admin', 'Treinamento', 2, true, 27),
  ('SR.8', 'Gestão de Senhas', 'Estabelecer procedimentos para criar e alterar senhas', 'Security Rule - Admin', 'Segurança', 3, true, 28),
  ('SR.9', 'Plano de Contingência', 'Estabelecer plano de backup, recuperação e emergência', 'Security Rule - Admin', 'Continuidade', 3, true, 29),
  ('SR.10', 'Avaliação', 'Realizar avaliações periódicas de conformidade', 'Security Rule - Admin', 'Auditoria Interna', 3, true, 30),
  ('SR.11', 'Acordos com Parceiros de Negócios', 'Garantir que parceiros implementem salvaguardas', 'Security Rule - Admin', 'Contratos', 3, true, 31),
  
  -- Security Rule - Salvaguardas Físicas
  ('SR.12', 'Controle de Acesso a Instalações', 'Limitar acesso físico a sistemas e instalações', 'Security Rule - Física', 'Segurança Física', 3, true, 32),
  ('SR.13', 'Controle de Acesso Validado', 'Validar acesso de pessoas a instalações', 'Security Rule - Física', 'Segurança Física', 3, true, 33),
  ('SR.14', 'Manutenção de Registros', 'Documentar reparos e modificações', 'Security Rule - Física', 'Infraestrutura', 2, true, 34),
  ('SR.15', 'Controle e Validação de Estações de Trabalho', 'Implementar políticas de uso de estações', 'Security Rule - Física', 'TI', 3, true, 35),
  ('SR.16', 'Segurança de Dispositivos e Mídia', 'Controlar movimentação de hardware e mídia', 'Security Rule - Física', 'TI', 3, true, 36),
  ('SR.17', 'Descarte', 'Procedimentos para descarte seguro de ePHI', 'Security Rule - Física', 'TI', 3, true, 37),
  ('SR.18', 'Reutilização de Mídia', 'Remover ePHI antes de reutilizar mídia', 'Security Rule - Física', 'TI', 3, true, 38),
  ('SR.19', 'Backup de Dados', 'Criar cópias recuperáveis de ePHI', 'Security Rule - Física', 'TI', 3, true, 39),
  
  -- Security Rule - Salvaguardas Técnicas
  ('SR.20', 'Controle de Acesso', 'Implementar controles técnicos de acesso', 'Security Rule - Técnica', 'Segurança', 3, true, 40),
  ('SR.21', 'IDs de Usuário Únicos', 'Atribuir identificação única a usuários', 'Security Rule - Técnica', 'Segurança', 3, true, 41),
  ('SR.22', 'Procedimento de Acesso de Emergência', 'Estabelecer acesso em emergências', 'Security Rule - Técnica', 'Continuidade', 3, true, 42),
  ('SR.23', 'Encerramento Automático de Sessão', 'Terminar sessões após período de inatividade', 'Security Rule - Técnica', 'Segurança', 3, true, 43),
  ('SR.24', 'Criptografia e Descriptografia', 'Implementar mecanismos de criptografia quando apropriado', 'Security Rule - Técnica', 'Segurança', 3, true, 44),
  ('SR.25', 'Controles de Auditoria', 'Implementar hardware, software e procedimentos para registrar atividades', 'Security Rule - Técnica', 'Monitoramento', 3, true, 45),
  ('SR.26', 'Controles de Integridade', 'Implementar políticas para garantir integridade de ePHI', 'Security Rule - Técnica', 'Segurança', 3, true, 46),
  ('SR.27', 'Autenticação', 'Verificar identidade de pessoas ou entidades', 'Security Rule - Técnica', 'Segurança', 3, true, 47),
  ('SR.28', 'Controles de Integridade de Transmissão', 'Garantir que ePHI não seja alterada indevidamente em transmissão', 'Security Rule - Técnica', 'Segurança', 3, true, 48),
  ('SR.29', 'Criptografia de Transmissão', 'Implementar mecanismo para criptografar ePHI em transmissão', 'Security Rule - Técnica', 'Segurança', 3, true, 49),
  
  -- Breach Notification Rule
  ('BN.1', 'Notificação de Violações', 'Notificar indivíduos sobre violações de PHI não segura', 'Breach Notification', 'Privacidade', 3, true, 50),
  ('BN.2', 'Prazo de Notificação', 'Notificar dentro de 60 dias da descoberta', 'Breach Notification', 'Privacidade', 3, true, 51),
  ('BN.3', 'Notificação ao HHS', 'Notificar Departamento de Saúde sobre violações', 'Breach Notification', 'Compliance', 3, true, 52),
  ('BN.4', 'Notificação à Mídia', 'Notificar mídia para violações que afetem 500+ indivíduos', 'Breach Notification', 'Comunicação', 3, true, 53),
  ('BN.5', 'Log de Violações', 'Manter log de violações menores que 500 indivíduos', 'Breach Notification', 'Documentação', 3, true, 54)
) AS r(codigo, titulo, descricao, categoria, area_responsavel, peso, obrigatorio, ordem)
WHERE f.nome = 'HIPAA' AND f.versao = '1996';