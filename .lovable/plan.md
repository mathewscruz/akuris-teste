

# Validacao Completa — Modulo Compliance (Due Diligence + Denuncia + Politicas)

Analisei todos os componentes: DueDiligence.tsx, DueDiligenceDashboard.tsx, FornecedoresManager.tsx, AssessmentsManagerEnhanced.tsx, TemplatesManager.tsx, AssessmentDialog.tsx, useDueDiligenceStats.tsx, Denuncia.tsx, DenunciasDashboard.tsx, DenunciaDialog.tsx, useDenunciasStats.tsx, Politicas.tsx, PoliticaDialog.tsx.

---

## OK — Sem problemas

- **DueDiligence.tsx** — page wrapper com tabs, custom events para navegacao. OK.
- **DueDiligenceDashboard** — busca empresa_id via profile, filtra assessments e fornecedores. OK.
- **useDueDiligenceStats** — busca empresa_id via profile, filtra assessments por empresa. OK.
- **AssessmentsManagerEnhanced** — query filtra por empresa_id. DropdownMenu nas acoes. OK.
- **AssessmentDialog** — grava empresa_id. OK.
- **TemplatesManager** — templates sao globais/compartilhados, adequado. OK.
- **Denuncia.tsx** — page wrapper com StatCards, deep link. OK.
- **Politicas.tsx** — queries filtram por empresa_id, queryKey inclui empresaId. StatCards com variantes semanticas. DataTable com filtros. ConfirmDialog. OK.
- **PoliticaDialog** — CRUD simples, handleSave em Politicas.tsx grava empresa_id. OK.

---

## Problemas Identificados

### 1. SEGURANCA — `useIncidentesStats` sem filtro `empresa_id` e queryKey estatica

Linhas 21-23: `supabase.from('incidentes').select('status, criticidade, created_at')` — sem `.eq('empresa_id', empresaId)`. A queryKey e fixa `['incidentes-stats']`, sem empresaId. Stats de incidentes de todas as empresas aparecem misturadas.

**Correcao**: Importar `useEmpresaId`, adicionar `.eq('empresa_id', empresaId)`, incluir `empresaId` na queryKey, `enabled: !!empresaId`.

### 2. SEGURANCA — `useDenunciasStats` sem filtro `empresa_id` e queryKey estatica

Linhas 16-18: `supabase.from('denuncias').select('id, status')` — sem filtro de empresa. QueryKey fixa `['denuncias-stats']`.

**Correcao**: Importar `useEmpresaId`, adicionar `.eq('empresa_id', empresaId)`, incluir `empresaId` na queryKey, `enabled: !!empresaId`.

### 3. SEGURANCA — `DenunciasDashboard.carregarDenuncias` sem filtro `empresa_id`

Linhas 63-69: `supabase.from('denuncias').select(...).order(...)` — busca denuncias de TODAS as empresas. Depende exclusivamente de RLS.

**Correcao**: Importar `useEmpresaId`, adicionar `.eq('empresa_id', empresaId)`.

### 4. SEGURANCA — `DenunciaDialog.carregarDados` busca usuarios sem filtro `empresa_id`

Linhas 115-119: `supabase.from('profiles').select('user_id, nome, role').in('role', ['admin', 'super_admin']).order('nome')` — retorna admins de TODAS as empresas no dropdown de atribuicao de responsavel.

**Correcao**: Adicionar `.eq('empresa_id', empresaId)`.

### 5. SEGURANCA — `FornecedoresManager` busca fornecedores SEM filtro `empresa_id`

Linhas 84-87: `supabase.from('fornecedores').select('*').order('nome')` — sem filtro de empresa. QueryKey tambem e estatica `['fornecedores-with-stats']`. Fornecedores de outras empresas aparecem na listagem.

Linhas 92-94: assessments tambem buscados sem filtro empresa: `supabase.from('due_diligence_assessments').select(...)`.

**Correcao**: Importar `useEmpresaId`, filtrar ambas queries por `empresa_id`, incluir `empresaId` na queryKey.

### 6. UX — Politicas usa botoes inline em vez de DropdownMenu

Linhas 228-261: a coluna de acoes usa botoes ghost inline com Tooltip (Send, Pencil, Trash2) em vez do padrao DropdownMenu com MoreHorizontal.

**Correcao**: Migrar para DropdownMenu.

### 7. UX — Planos de Acao usa botoes inline em vez de DropdownMenu

Linhas 399-436: a coluna de acoes usa botoes ghost inline (Pencil, Trash2, ExternalLink) em vez de DropdownMenu.

**Correcao**: Migrar para DropdownMenu.

### 8. UX — FornecedoresManager usa botoes inline em vez de DropdownMenu

A tabela de fornecedores usa botoes ghost inline (Edit2, Trash2, Eye, ClipboardList) em vez de DropdownMenu.

**Correcao**: Migrar para DropdownMenu.

---

## Resumo de Acoes

| # | Problema | Tipo | Impacto |
|---|----------|------|---------|
| 1 | useIncidentesStats sem empresa_id | Seguranca/Cache | **Alto** |
| 2 | useDenunciasStats sem empresa_id | Seguranca/Cache | **Alto** |
| 3 | DenunciasDashboard sem empresa_id | Seguranca | **Alto** |
| 4 | DenunciaDialog usuarios sem empresa_id | Seguranca | **Alto** |
| 5 | FornecedoresManager sem empresa_id | Seguranca/Cache | **Alto** |
| 6 | Politicas acoes inline → DropdownMenu | UX | **Medio** |
| 7 | PlanosAcao acoes inline → DropdownMenu | UX | **Medio** |
| 8 | FornecedoresManager acoes inline → DropdownMenu | UX | **Medio** |

Todos os 8 itens serao implementados.

### Arquivos a editar:
- `src/hooks/useIncidentesStats.tsx` — empresa_id filter + queryKey
- `src/hooks/useDenunciasStats.tsx` — empresa_id filter + queryKey
- `src/components/denuncia/DenunciasDashboard.tsx` — empresa_id filter
- `src/components/denuncia/DenunciaDialog.tsx` — empresa_id filter no fetchProfiles
- `src/components/due-diligence/FornecedoresManager.tsx` — empresa_id filter + queryKey + DropdownMenu
- `src/pages/Politicas.tsx` — DropdownMenu nas acoes
- `src/pages/PlanosAcao.tsx` — DropdownMenu nas acoes

