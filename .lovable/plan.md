
Objetivo: eliminar o erro ao editar riscos e validar consistência CRUD (campos x tipos do banco) nos módulos principais.

Implementação
1) Corrigir trigger de auditoria de riscos no banco (hotfix crítico)
- Criar migration para substituir `public.audit_riscos_changes`.
- Trocar `OLD.id::text` e `NEW.id::text` por `OLD.id` e `NEW.id` (UUID nativo) nos INSERTs de `audit_logs.record_id`.
- Manter `SET search_path TO 'public'` e recriar trigger `audit_riscos_changes` na tabela `riscos`.

2) Executar varredura técnica de funções/trigger de auditoria
- Conferir todas as funções `audit_%_changes` e usos de `create_audit_log(...)` para garantir que `record_id` sempre entra como UUID.
- Confirmar que somente `audit_riscos_changes` estava com cast inválido.

3) Validar CRUD de Riscos ponta a ponta
- Testar criar, editar, excluir e listar.
- Confirmar PATCH em `riscos` sem erro 400.
- Confirmar criação de trilha em `audit_logs` para INSERT/UPDATE/DELETE.

4) Validar CRUD de Incidentes e módulos críticos com campos UUID
- Incidentes: criar/editar com `responsavel_deteccao` e `responsavel_tratamento`.
- Controles, Auditorias (itens), Planos de Ação, Denúncias (tratamento) com foco em campos `*_id`/`responsavel_*`.
- Confirmar que formulários estão enviando UUID/NULL (não texto livre) quando coluna é UUID.

5) Rodar checklist final de consistência campo x banco
- Para cada módulo auditado: mapear campos do formulário → colunas da tabela.
- Registrar divergências restantes (se houver) com prioridade e arquivo afetado.

Validação de aceite
- Edição de risco concluída sem erro `record_id uuid vs text`.
- Trilha de auditoria de riscos funcionando.
- CRUD de Incidentes e módulos críticos executando sem erro de tipo/RLS.
- Sem regressão visual/fluxo nos dialogs.

Detalhes técnicos (alvos)
- Banco: função/trigger `public.audit_riscos_changes`, tabela `public.audit_logs(record_id uuid)`.
- Frontend (revalidação): `src/components/riscos/RiscoFormWizard.tsx`, `src/components/incidentes/IncidenteDialog.tsx` e dialogs com campos UUID.
