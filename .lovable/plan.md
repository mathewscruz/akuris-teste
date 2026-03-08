

# Validacao Completa — Modulos Relatorios + Planos de Acao

Analisei todos os componentes: Relatorios.tsx, RelatorioDialog.tsx, RelatorioPreviewDialog.tsx, generateTemplatePDF.ts, PlanosAcao.tsx, PlanoAcaoDialog.tsx, UserSelect.tsx.

---

## OK — Sem problemas

- **PlanosAcao.tsx** — query principal filtra por `empresa_id`, queryKey inclui `empresaId`. Queries externas (controles, auditorias, incidentes) todas filtradas por `empresa_id` e `user.id`. StatCards com variantes semanticas. DataTable com filtros, sort, busca, paginacao. Kanban view. DropdownMenu nas acoes. ConfirmDialog. Empty states. Tab "Todos" restrita a admin. OK.
- **PlanoAcaoDialog** — useEffect reseta estado ao abrir/fechar. UserSelect filtra por `empresa_id`. Campos condicionais (referencia aparece quando modulo != manual). OK.
- **UserSelect** — filtra profiles por `empresa_id` e `ativo: true`. OK.
- **Relatorios.tsx** — query principal filtra por `empresa_id`, queryKey inclui `empresaId`. Grava `empresa_id` e `created_by`. StatCards. Tabs (Meus/Templates). Empty state. ConfirmDialog. OK.
- **RelatorioPreviewDialog** — carrega dados via fetchTemplateData com empresaId. Skeleton loading. Empty state. OK.
- **generateTemplatePDF.ts** — todas as queries principais filtram por `empresa_id`. OK.

---

## Problemas Identificados

### 1. SEGURANCA — `generateTemplatePDF.fetchRiscosData` busca tratamentos SEM filtro `empresa_id`

Linha 94: `supabase.from('riscos_tratamentos').select('*')` — busca TODOS os tratamentos de todas as empresas, depois filtra em memoria por `risco_id`. Embora o resultado final esteja correto (filtra pelos riscos da empresa), a query transfere dados de todas as empresas para o cliente.

**Correcao**: Buscar tratamentos apenas dos riscos da empresa. Usar `.in('risco_id', riscoIds)` apos obter os IDs dos riscos.

### 2. SEGURANCA — `Relatorios.handleDelete` sem filtro redundante `empresa_id`

Linha 92: `supabase.from('relatorios_customizados').delete().eq('id', deleteId)` — sem `.eq('empresa_id', empresaId)`. Depende exclusivamente de RLS.

**Correcao**: Adicionar `.eq('empresa_id', empresaId)`.

### 3. SEGURANCA — `PlanosAcao.handleDelete` sem filtro redundante `empresa_id`

Linha 313: `supabase.from('planos_acao').delete().eq('id', deleteId)` — sem `.eq('empresa_id', empresaId)`.

**Correcao**: Adicionar `.eq('empresa_id', empresaId)`.

### 4. BUG — `RelatorioDialog` nao reseta estado ao reabrir

O dialog usa `useState` com valor inicial do prop `relatorio`, mas nao tem `useEffect` para resetar quando o dialog reabre ou o relatorio muda. Ao editar um relatorio e depois clicar "Novo", os campos ficam com valores do relatorio anterior.

**Correcao**: Adicionar `useEffect` para sincronizar estado com props, similar ao PlanoAcaoDialog.

### 5. UX — Relatorios usa botoes inline com Tooltip em vez de DropdownMenu

Linhas 250-287: os cards de relatorios usam 4 botoes ghost inline (Eye, Download, Pencil, Trash2) em vez do padrao DropdownMenu adotado nos demais modulos.

**Correcao**: Migrar para DropdownMenu com MoreHorizontal.

---

## Resumo de Acoes

| # | Problema | Tipo | Impacto |
|---|----------|------|---------|
| 1 | fetchRiscosData tratamentos sem empresa_id | Seguranca | **Alto** |
| 2 | Relatorios handleDelete sem empresa_id | Seguranca | **Medio** |
| 3 | PlanosAcao handleDelete sem empresa_id | Seguranca | **Medio** |
| 4 | RelatorioDialog nao reseta estado | Bug | **Medio** |
| 5 | Relatorios cards acoes inline → DropdownMenu | UX | **Medio** |

Todos os 5 itens serao implementados.

### Arquivos a editar:
- `src/components/relatorios/generateTemplatePDF.ts` — filtrar tratamentos por risco_id
- `src/pages/Relatorios.tsx` — empresa_id no delete + DropdownMenu nos cards
- `src/pages/PlanosAcao.tsx` — empresa_id no delete
- `src/components/relatorios/RelatorioDialog.tsx` — adicionar useEffect para reset de estado

