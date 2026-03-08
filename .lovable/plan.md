

# Validacao Completa — Modulo Seguranca (Contas Privilegiadas + Revisao de Acessos + Sistemas)

Analisei todos os componentes: ContasPrivilegiadas.tsx, ContaDialog.tsx, ContasDashboard.tsx, SistemasContent.tsx, SistemaDialog.tsx, RevisaoAcessos.tsx, ReviewDialog.tsx, ReviewItemsDialog.tsx, ReviewItemDecisionDialog.tsx, ReviewExternalForm.tsx, SistemaUsuariosList.tsx, SistemaUsuarioDialog.tsx, useReviewStats.tsx, useReviewData.tsx.

---

## OK — Sem problemas

- **ContasPrivilegiadas.tsx** — query principal filtra por `empresa_id`, queryKey inclui `empresaId`. Filtros, StatCards, ConfirmDialog, empty states. OK.
- **ContaDialog** — valida que o sistema pertence a empresa antes de gravar. Grava `empresa_id`. OK.
- **RevisaoAcessos.tsx** — queries filtram por `empresa_id`, queryKeys incluem `empresaId`. Tabs (Ativas, Historico, Usuarios). OK.
- **ReviewDialog** — busca sistemas e usuarios filtrados por `empresa_id`. OK.
- **useReviewStats** — todas as queries filtram por `empresa_id`, cacheKey inclui `empresaId`. OK.
- **useReviewData** — grava `empresa_id` no createReview. OK.
- **SistemaUsuariosList** — query filtra por `empresa_id`. OK.
- **SistemaUsuarioDialog** — busca sistemas por `empresa_id`. OK.

---

## Problemas Identificados

### 1. SEGURANCA — `SistemasContent` busca sistemas SEM filtro `empresa_id`

Linha 54: `supabase.from('sistemas_privilegiados').select('*').order('nome_sistema')` — sem `.eq('empresa_id', empresaId)`. Sistemas de outras empresas podem aparecer. A queryKey tambem e estatica `['sistemas-privilegiados-governanca']`, sem `empresaId`.

**Correcao**: Importar `useEmpresaId`, adicionar `.eq('empresa_id', empresaId)`, incluir `empresaId` na queryKey, e `enabled: !!empresaId`.

### 2. SEGURANCA — `SistemasContent.handleDeleteSistema` verifica contas sem filtro `empresa_id`

Linha 81-84: `supabase.from('contas_privilegiadas').select('id').eq('sistema_id', sistemaId)` — depende exclusivamente de RLS. Deve incluir filtro redundante.

**Correcao**: Adicionar `.eq('empresa_id', empresaId)`.

### 3. UX — Contas Privilegiadas usa botoes inline em vez de DropdownMenu

Linhas 294-324: a coluna de acoes usa botoes ghost com Tooltip (Edit, Trash2) em vez do padrao DropdownMenu com MoreHorizontal adotado nos demais modulos.

**Correcao**: Migrar para DropdownMenu.

### 4. UX — Revisao de Acessos usa botoes inline em vez de DropdownMenu

Linhas 219-261: mesma inconsistencia — botoes ghost inline (Eye, Edit, Trash2) em vez de DropdownMenu.

**Correcao**: Migrar para DropdownMenu.

### 5. UX — Sistemas usa botoes inline em vez de DropdownMenu

Linhas 234-264: mesma inconsistencia — botoes ghost inline (Edit, Trash2).

**Correcao**: Migrar para DropdownMenu.

### 6. UX — SistemaUsuariosList usa botoes inline em vez de DropdownMenu

Linhas 198-229: botoes ghost inline (Pencil, Trash2).

**Correcao**: Migrar para DropdownMenu.

### 7. CODIGO MORTO — `ContasDashboard` nao e utilizado

O componente ContasDashboard.tsx nao e importado em nenhum lugar do projeto. E codigo morto.

**Correcao**: Remover o arquivo.

---

## Resumo de Acoes

| # | Problema | Tipo | Impacto |
|---|----------|------|---------|
| 1 | SistemasContent sem empresa_id | Seguranca/Cache | **Alto** |
| 2 | handleDeleteSistema sem empresa_id | Seguranca | **Medio** |
| 3 | Contas Privilegiadas acoes inline | UX | **Medio** |
| 4 | Revisao Acessos acoes inline | UX | **Medio** |
| 5 | Sistemas acoes inline | UX | **Medio** |
| 6 | SistemaUsuariosList acoes inline | UX | **Medio** |
| 7 | ContasDashboard codigo morto | Manutencao | **Baixo** |

Todos os 7 itens serao implementados.

### Arquivos a editar:
- `src/components/governanca/SistemasContent.tsx` — empresa_id filter + queryKey + DropdownMenu
- `src/pages/ContasPrivilegiadas.tsx` — DropdownMenu nas acoes
- `src/pages/RevisaoAcessos.tsx` — DropdownMenu nas acoes
- `src/components/revisao-acessos/SistemaUsuariosList.tsx` — DropdownMenu nas acoes
- `src/components/contas-privilegiadas/ContasDashboard.tsx` — remover arquivo

