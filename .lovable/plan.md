

# Auditoria e Plano de Evolução: Hub de Integrações

## O que existe hoje

### Conectores Outbound (Akuris → Ferramenta externa)
| Conector | Status | Funciona? | Observação |
|---|---|---|---|
| **Slack** | Disponivel | Sim | Webhook incoming, envia notificações formatadas |
| **Teams** | Disponivel | Sim | Webhook incoming, Adaptive Cards |
| **Webhooks genéricos** | Disponivel | Sim | JSON para qualquer URL com headers custom |
| **Jira** | Disponivel | Sim | Cria tickets via REST API com credenciais |
| **Azure/Intune** | Disponivel | Sim | Sincroniza dispositivos para Ativos |
| **OneDrive** | "Em breve" | Nao | Placeholder sem lógica |
| **Google Drive** | "Em breve" | Nao | Placeholder sem lógica |
| **Zapier** | "Em breve" | Nao | Placeholder sem lógica |

### API Keys e Webhooks de Entrada
- **API Keys**: CRUD completo, mas a Edge Function `api-inbound-webhook` **nao valida permissoes da API Key** -- valida apenas `webhook_token`.  As API Keys são gerenciadas mas **nao são usadas por nenhum endpoint real**. Existe uma desconexão: o manager cria keys na tabela `api_keys`, mas nenhuma Edge Function as consome.
- **Webhooks de Entrada**: Funciona -- recebe payloads e insere em incidentes/riscos/ativos/controles/denuncias.

### Cobertura de eventos `notify()`
Dos módulos do sistema, apenas 6 disparam notificações para integrações:
- Incidentes (criado/crítico)
- Riscos (identificado)
- Controles (criado/atualizado)
- Documentos (aprovado/rejeitado)
- Auditorias (item atribuído)
- Denúncias (atualizada)

**Módulos sem nenhuma notificação**: Contratos, Ativos, Políticas, Planos de Ação, Continuidade, Contas Privilegiadas, Revisão de Acessos, Due Diligence, Gap Analysis.

### Listas de eventos inconsistentes
Cada dialog (Slack, Teams, Webhooks) define sua própria lista `EVENTOS_DISPONIVEIS` com **eventos diferentes**:
- Slack e Teams: 9 eventos (incluem `incidente_critico`, `risco_nivel_alterado`, `controle_vencendo`)
- Webhooks: 13 eventos (mais completo, inclui `incidente_atualizado`, `incidente_resolvido`, `documento_criado`, `controle_atualizado`, `auditoria_criada`)
- `useIntegrationNotify.tsx`: 16 tipos no TypeScript, mas apenas 7 são efetivamente chamados no código

## Problemas identificados

1. **API Keys são decorativas** -- existem no CRUD mas nenhum endpoint as valida. O usuário cria uma key achando que pode consumir a API, mas não há API REST pública.

2. **Listas de eventos fragmentadas** -- cada dialog repete e diverge. Deveria existir uma única fonte de verdade.

3. **Cobertura de notify() incompleta** -- a maioria dos módulos não dispara notificações, tornando as integrações parcialmente úteis.

4. **OneDrive/Google Drive/Zapier como placeholders** -- mostrar "Em breve" sem prazo confunde o usuário e polui a interface.

5. **Due Diligence ModuleIntegrations** -- é um conceito completamente diferente (regras de automação internas), não deveria estar misturado conceitualmente com integrações externas.

6. **Jira armazena credenciais como JSON string em `credenciais_encrypted`** -- não é realmente criptografado, apenas serializado. O nome do campo engana.

## Plano de correção e evolução

### Fase 1: Corrigir inconsistências (prioridade alta)

**A. Centralizar lista de eventos**
- Criar `src/lib/integration-events.ts` com a lista canônica de todos os eventos, labels e módulos
- Importar essa lista em todos os dialogs (Slack, Teams, Webhooks) e no `useIntegrationNotify.tsx`
- Adicionar eventos que faltam: `contrato_vencendo`, `contrato_criado`, `ativo_criado`, `politica_atualizada`, `plano_acao_criado`, `plano_acao_vencido`

**B. Expandir cobertura de notify()**
- Adicionar chamadas `notify()` nos módulos que faltam:
  - `ContratoDialog.tsx` → `contrato_criado`
  - `PlanoAcaoDialog.tsx` → `plano_acao_criado`
  - `PoliticaDialog.tsx` → `politica_atualizada`
  - `AtivoDialog.tsx` → `ativo_criado`

**C. Remover placeholders "Em breve"**
- Remover OneDrive, Google Drive e Zapier do array `INTEGRACOES_DISPONIVEIS`. Mostrar integrações fake confunde e reduz confiança.

### Fase 2: Tornar API Keys funcionais (prioridade média)

**D. Criar Edge Function de API pública**
- Criar `supabase/functions/api-public/index.ts` que:
  1. Valida a API Key do header `X-API-Key` contra a tabela `api_keys`
  2. Verifica permissões (`riscos:read`, `incidentes:write`, etc.)
  3. Aplica rate limiting (`rate_limit_por_minuto`)
  4. Roteia para operações CRUD nos módulos permitidos
  5. Atualiza `ultimo_uso` e `total_requisicoes`
- Gerar documentação inline na UI mostrando endpoints disponíveis e exemplos curl

### Fase 3: Melhorar UX e resiliência (prioridade média)

**E. Health check periódico das integrações**
- Adicionar lógica no `IntegrationHub` para mostrar "Last sync" e indicador de saúde baseado nos últimos logs (já parcialmente existe para Azure)

**F. Retry automático no dispatcher**
- No `integration-webhook-dispatcher`, adicionar 1 retry com backoff para falhas transitórias (timeout, 5xx)

### Arquivos a criar/modificar

| Arquivo | Ação |
|---|---|
| `src/lib/integration-events.ts` | **Criar** - fonte única de eventos |
| `src/components/configuracoes/integrations/SlackConfigDialog.tsx` | Importar eventos centralizados |
| `src/components/configuracoes/integrations/TeamsConfigDialog.tsx` | Importar eventos centralizados |
| `src/components/configuracoes/integrations/WebhooksConfigDialog.tsx` | Importar eventos centralizados |
| `src/hooks/useIntegrationNotify.tsx` | Expandir tipos com novos eventos |
| `src/components/configuracoes/IntegrationHub.tsx` | Remover placeholders, adicionar health indicators |
| `src/components/contratos/ContratoDialog.tsx` | Adicionar notify() |
| `src/components/planos-acao/PlanoAcaoDialog.tsx` | Adicionar notify() |
| `src/components/ativos/AtivoDialog.tsx` | Adicionar notify() |
| `src/components/politicas/PoliticaDialog.tsx` | Adicionar notify() |
| `supabase/functions/api-public/index.ts` | **Criar** - API REST pública com validação de API Keys |
| `supabase/functions/integration-webhook-dispatcher/index.ts` | Adicionar retry para falhas transitórias |
| `src/components/configuracoes/ApiKeysManager.tsx` | Adicionar documentação de uso e endpoints |

### O que NÃO faz sentido e será removido
- **OneDrive, Google Drive, Zapier** como placeholders -- poluem a interface sem entregar valor
- **Due Diligence ModuleIntegrations** permanece onde está -- é automação interna, não integração externa, e já funciona no contexto correto

