

# Validacao Completa — Modulo Contratos

Analisei todos os componentes: Contratos.tsx, ContratoDialogWizard.tsx, FornecedorDialog.tsx, MarcosDialog.tsx, DocumentosDialog.tsx, AditivosDialog.tsx, RelatoriosContratos.tsx, TemplatesContratos.tsx, BuscaAvancada.tsx, useContratosStats.tsx.

---

## OK — Sem problemas

- **Contratos.tsx** — queries principais ja filtram por `empresa_id` via `useEmpresaId`, queryKeys incluem `empresaId`. DropdownMenu padrao nas acoes de contratos. Paginacao, filtros, CSV export, empty states, confirm dialog — tudo presente.
- **DocumentosDialog** — queries por `contrato_id` (pertence a empresa via RLS). Upload/download com Supabase Storage funcional.
- **AditivosDialog** — queries por `contrato_id`, validacao com Zod, CRUD completo. OK.

---

## Problemas Identificados

### 1. SEGURANCA — `useContratosStats` sem filtro `empresa_id` e queryKey estatica

O hook busca `supabase.from('contratos').select(...)` e `supabase.from('fornecedores').select('id').eq('status', 'ativo')` sem `.eq('empresa_id', empresaId)`. A queryKey e fixa `['contratos-stats']`, causando cache compartilhado entre empresas.

**Correcao**: Importar `useEmpresaId`, filtrar ambas queries por `empresa_id`, incluir `empresaId` na queryKey.

### 2. SEGURANCA — `ContratoDialogWizard.fetchUsuarios` sem filtro `empresa_id`

Linha 144: `supabase.from('profiles').select('user_id, nome').eq('ativo', true)` retorna usuarios de TODAS as empresas. Aparece no dropdown "Gestor do Contrato".

**Correcao**: Adicionar `.eq('empresa_id', profile.empresa_id)` — precisa buscar o empresa_id antes ou receber como prop.

### 3. SEGURANCA — `MarcosDialog.fetchUsuarios` sem filtro `empresa_id`

Linha 88: mesma query sem filtro de empresa. Usuarios de outras empresas aparecem no dropdown de responsavel.

**Correcao**: Adicionar filtro `empresa_id`.

### 4. SEGURANCA — `RelatoriosContratos` queries sem filtro `empresa_id`

Linhas 60-92: todas as 4 queries (contratos, marcos, aditivos, fornecedores) nao filtram por `empresa_id`. Depende exclusivamente de RLS. A query de fornecedores (linha 90-92) nem tem filtro de datas.

**Correcao**: Adicionar `.eq('empresa_id', empresaId)` nas 4 queries.

### 5. UX — Fornecedores tab usa botoes inline em vez de DropdownMenu

Linhas 720-744: a aba de fornecedores usa botoes ghost inline (Edit, Trash2), enquanto contratos ja usa DropdownMenu. Inconsistencia visual dentro do mesmo modulo.

**Correcao**: Migrar para DropdownMenu com MoreHorizontal, padrao dos demais modulos.

### 6. UX — Filtro de status do fornecedor inclui "pendente" e "bloqueado" mas o dialog so permite "ativo/inativo/suspenso"

O filtro da tabela (linhas 633-639) oferece `pendente` e `bloqueado` como opcoes, mas o `FornecedorDialog` so permite criar fornecedores com status `ativo`, `inativo` ou `suspenso`. Status `pendente` e `bloqueado` nunca serao gravados, tornando esses filtros inuteis.

**Correcao**: Alinhar — ou adicionar `pendente`/`bloqueado` ao FornecedorDialog ou remover dos filtros. Recomendo remover dos filtros e adicionar `suspenso`.

### 7. UX — Loading state sem skeleton

Linha 323-325: o loading usa um simples texto "Carregando..." centralizado em vez do componente `PageSkeleton` padrao do sistema.

**Correcao**: Substituir por `PageSkeleton`.

---

## Resumo de Acoes

| # | Problema | Tipo | Impacto |
|---|----------|------|---------|
| 1 | `useContratosStats` sem empresa_id | Seguranca/Cache | **Alto** |
| 2 | ContratoDialogWizard fetchUsuarios sem empresa_id | Seguranca | **Alto** |
| 3 | MarcosDialog fetchUsuarios sem empresa_id | Seguranca | **Alto** |
| 4 | RelatoriosContratos queries sem empresa_id | Seguranca | **Alto** |
| 5 | Fornecedores acoes inline | UX | **Medio** |
| 6 | Filtros desalinhados com opcoes do dialog | UX | **Baixo** |
| 7 | Loading sem PageSkeleton | UX | **Baixo** |

Todos os 7 itens serao implementados.

### Arquivos a editar:
- `src/hooks/useContratosStats.tsx` — empresa_id filter + queryKey
- `src/components/contratos/ContratoDialogWizard.tsx` — fetchUsuarios com empresa_id
- `src/components/contratos/MarcosDialog.tsx` — fetchUsuarios com empresa_id
- `src/components/contratos/RelatoriosContratos.tsx` — empresa_id em todas as queries
- `src/pages/Contratos.tsx` — DropdownMenu nos fornecedores, alinhar filtros status, PageSkeleton

