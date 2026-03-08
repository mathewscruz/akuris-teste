

# Validação Completa — Módulo Configurações

Analisei todos os componentes: Configuracoes.tsx, ConfiguracoesGerais.tsx, CompanyContextSettings.tsx, ReminderSettings.tsx, GerenciamentoEmpresas.tsx, GerenciamentoUsuariosEnhanced.tsx, PermissionMatrix.tsx, PermissionProfilesList.tsx, UserPermissionsList.tsx, PermissionProfileDialog.tsx, UserPermissionDialog.tsx, IntegrationHub.tsx, AssinaturaTab.tsx, CreditosIAManager.tsx, ConfiguracoesDenuncia.tsx, CategoriasDenuncia.tsx.

---

## OK — Sem problemas

- **PermissionMatrix** — filtra por `empresa_id`. Tabs Perfis/Usuários. OK.
- **PermissionProfilesList** — filtra por `empresa_id`. Cards com contagem de usuários. ConfirmDialog. OK.
- **UserPermissionsList** — filtra por `empresa_id` e `ativo: true`. Deep link via `selectedUserId`. OK.
- **UserPermissionDialog** — carrega módulos + perfis da empresa. Save atualiza `profiles.permission_profile_id` e `user_module_permissions`. OK.
- **PermissionProfileDialog** — CRUD com propagação. Carrega `system_modules`. OK.
- **IntegrationHub** — carrega configs da empresa. Dialogs por tipo. Log Viewer. API Keys. Webhooks. OK.
- **AssinaturaTab** — check-subscription via Edge Function. Portal Stripe. Empty state. OK.
- **CreditosIAManager** — filtra empresas com plano. DataTable. Sheet histórico por empresa. ConfirmDialog para reset. OK.
- **CompanyContextSettings** — usa `useEmpresaId`. Salva contexto da organização. OK.
- **ConfiguracoesDenuncia** — carrega config da empresa. Token público. Links. OK.
- **CategoriasDenuncia** — CRUD categorias da empresa. OK.
- **GerenciamentoUsuariosEnhanced** — DataTable com filtros. CRUD via Edge Function. StatCards. Ações por role. OK.
- **GerenciamentoEmpresas** — DataTable com filtros. CRUD. Logo upload. Planos. ConfirmDialog. OK.

---

## Problemas Identificados

### 1. REDUNDÂNCIA — `Configuracoes.tsx` faz query separada para buscar `role` do usuário

O `useEffect` na linha 29 faz `supabase.from('profiles').select('role').eq('user_id', user.id)` — query desnecessária. O `useAuth()` já expõe `profile.role` que é carregado no AuthProvider. Isso gera uma requisição extra ao Supabase em cada visita à página.

**Correção**: Usar `profile` do `useAuth()` em vez da query separada. Remover o `useState`, `useEffect` e o estado `loading` redundante.

### 2. SEGURANÇA — `ReminderSettings.loadStats` sem filtro `empresa_id`

Linhas 100-133: todas as 3 queries de stats (`profiles`, `user_invitation_reminders` x2) buscam dados de TODAS as empresas sem `.eq('empresa_id', ...)`. Um admin vê métricas globais (usuários convidados, convites aceitos) de outras empresas.

**Correção**: Usar o `empresa_id` já disponível no `settings.empresa_id` (carregado em `loadSettings`) para filtrar as queries. Passar `empresa_id` como dependência para `loadStats`.

### 3. INCOMPLETO — `ConfiguracoesGerais` salva preferências de notificação em `localStorage`

Linhas 178-189: o comentário diz `// Save to localStorage (DB column doesn't exist yet)`. Isso significa que as preferências não persistem entre dispositivos/browsers e são perdidas ao limpar cache. É uma feature incompleta que engana o usuário com um toast "Preferências salvas com sucesso!" sem real persistência.

**Correção**: Adicionar uma nota visual ao usuário indicando que a preferência é local ao navegador (badge "Local"), ou remover completamente essa seção incompleta para evitar confusão. A melhor abordagem é manter a funcionalidade mas informar claramente o escopo.

### 4. UX — `GerenciamentoEmpresas` usa botões inline com Tooltip em vez de DropdownMenu

Linhas 421-453: a coluna de ações usa botões ghost inline (Edit, Trash2) com Tooltip em vez do padrão `DropdownMenu` adotado nos demais módulos.

**Correção**: Migrar para DropdownMenu com MoreHorizontal, incluindo opções de Editar e Excluir. Incluir Upload de Logo como opção no dropdown.

### 5. UX — `CreditosIAManager` usa botões inline em vez de DropdownMenu

Linhas 175-189: a coluna de ações usa botões ghost inline (History, RotateCcw) em vez de DropdownMenu.

**Correção**: Migrar para DropdownMenu.

### 6. UX — `ReminderSettings` usa cores hardcoded não compatíveis com dark mode

Linha 320: `bg-blue-50`, `text-blue-900`, `text-blue-800`, `border-blue-200` — cores hardcoded que ficam ilegíveis em dark mode.

**Correção**: Usar `bg-muted`, `text-muted-foreground`, `border-border` ou classes do design system.

### 7. DUPLICIDADE — `CompanyContextDialog` (Gap Analysis) duplica `CompanyContextSettings` (Configurações)

O `CompanyContextDialog` no módulo Gap Analysis (src/components/gap-analysis/CompanyContextDialog.tsx) tem exatamente a mesma funcionalidade do `CompanyContextSettings` na aba Organização: mesmos campos (setor, porte, objetivo, data alvo), mesma tabela `empresas`, mesma lógica de load/save. São dois componentes independentes mantidos em paralelo.

**Correção**: Remover o `CompanyContextDialog` e redirecionar o usuário para Configurações > Organização quando clicar no botão correspondente no Gap Analysis. Isso centraliza a configuração e elimina manutenção duplicada.

---

## Resumo de Ações

| # | Problema | Tipo | Impacto |
|---|----------|------|---------|
| 1 | Configuracoes.tsx query redundante de role | Redundância | **Médio** |
| 2 | ReminderSettings stats sem empresa_id | Segurança | **Alto** |
| 3 | Notificações salvas em localStorage | Incompleto | **Baixo** |
| 4 | GerenciamentoEmpresas ações inline | UX | **Médio** |
| 5 | CreditosIAManager ações inline | UX | **Médio** |
| 6 | ReminderSettings cores hardcoded | UX | **Baixo** |
| 7 | CompanyContextDialog duplicado | Duplicidade | **Médio** |

Todos os 7 itens serão implementados.

### Arquivos a editar:
- `src/pages/Configuracoes.tsx` — usar `profile` do `useAuth()`, remover query redundante
- `src/components/configuracoes/ReminderSettings.tsx` — filtrar stats por empresa_id + corrigir cores hardcoded
- `src/components/configuracoes/ConfiguracoesGerais.tsx` — adicionar indicador visual "salvo localmente" nas preferências de notificação
- `src/components/configuracoes/GerenciamentoEmpresas.tsx` — migrar ações para DropdownMenu
- `src/components/configuracoes/CreditosIAManager.tsx` — migrar ações para DropdownMenu
- `src/components/gap-analysis/CompanyContextDialog.tsx` — remover e redirecionar para Configurações
- Componentes que importam `CompanyContextDialog` — atualizar para navegar a `/configuracoes?tab=organizacao`

