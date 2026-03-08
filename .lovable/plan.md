

# Validacao Completa — Modulo Gestao de Riscos + Sub-modulo Aceite de Risco

## Problemas Identificados no Modulo Atual

### 1. DADOS — Coluna `created_by` inexistente na tabela `riscos`

O `RiscoFormWizard.tsx` nao grava `created_by` (a coluna nao existe), e o `AprovacaoRiscoDialog.tsx` tenta usar `risco.created_by` para notificar o criador — sempre `undefined`. O fluxo de aprovacao nunca notifica o criador.

**Correcao**: Criar migration adicionando `created_by uuid NULL REFERENCES auth.users(id)` e atualizar o `RiscoFormWizard.tsx` para gravar o valor.

### 2. SEGURANCA — `useRiscosStats` sem filtro `empresa_id`

O hook faz `supabase.from('riscos').select(...)` sem `.eq('empresa_id', ...)` e a queryKey nao inclui `empresaId`. Mesmos problemas de cache e isolamento identificados nos outros modulos.

**Correcao**: Injetar `useAuth()` para obter `empresa_id`, filtrar queries e incluir na queryKey.

### 3. SEGURANCA — `RiscoFormWizard` queries sem filtro `empresa_id`

As queries de `riscos_matrizes`, `riscos_categorias` e `ativos` nao filtram por `empresa_id`, podendo mostrar dados de outras empresas.

**Correcao**: Adicionar `.eq('empresa_id', profile!.empresa_id)` nas 3 queries de `fetchData()`.

### 4. UX — Status `em_tratamento` ausente nos filtros

O `RiscoSelect.tsx` filtra por `em_tratamento` mas a pagina `Riscos.tsx` nao oferece esse status nos filtros. Riscos com status `em_tratamento` ficam invisiveis se filtrado por status.

**Correcao**: Adicionar `{ value: 'em_tratamento', label: 'Em Tratamento' }` aos filtros de status.

### 5. UX — Botao "Aprovacao" inacessivel na pagina

O `AprovacaoRiscoDialog` esta renderizado mas **nao ha botao/menu para abri-lo**. O state `aprovacaoRisco` nunca e setado na UI. O fluxo de aprovacao e inacessivel.

**Correcao**: Adicionar botao de aprovacao na coluna de acoes da tabela.

### 6. UX — Coluna de acoes usa botoes inline em vez de DropdownMenu

A coluna de acoes usa 4 botoes inline (historico, audit, edit, delete) que ocupam muito espaco. Nao segue o padrao DropdownMenu da aplicacao.

**Correcao**: Migrar para `DropdownMenu` com `MoreHorizontal`, incluindo todas as acoes + Aprovacao + Tratamentos + Anexos.

---

## Novo Sub-modulo: Aceite de Risco

Uma pagina dedicada em `/riscos/aceite` que lista todos os riscos aceitos com visao completa de gestao.

### Funcionalidades:
- **Tabela** com riscos aceitos: nome, nivel, justificativa, data aceite, aprovador, proxima revisao, status revisao
- **KPIs**: total aceitos, revisoes vencidas, revisoes proximas (7d), sem data de revisao
- **Filtros**: nivel de risco, status de revisao (vencida/proxima/ok/sem data)
- **Dialog de detalhes**: historico de aceite, fluxo de aprovacao, anexos de aceite, timeline
- **Acao rapida**: agendar/reagendar revisao, revogar aceite
- **Exportar**: CSV/PDF dos riscos aceitos

### Mudancas necessarias:
- Novo arquivo `src/pages/RiscosAceite.tsx`
- Novo arquivo `src/components/riscos/AceiteDetalheDialog.tsx`
- Rota em `App.tsx`: `/riscos/aceite`
- Sub-itens no sidebar: Riscos passa a ter sub-menu (Riscos + Aceite de Risco)
- Traducoes em `i18n/pt.ts` e `i18n/en.ts`

### Tabela DB:
Nao precisa de nova tabela — os campos `aceito`, `justificativa_aceite`, `aprovador_aceite`, `data_aceite`, `data_proxima_revisao` ja existem na tabela `riscos`. Apenas `created_by` precisa ser adicionado.

---

## Resumo de Acoes

| # | Problema | Tipo | Impacto |
|---|----------|------|---------|
| 1 | `created_by` inexistente | Bug dados | **Critico** — aprovacao nao notifica criador |
| 2 | `useRiscosStats` sem empresa_id | Seguranca | **Alto** — cache/isolamento |
| 3 | `RiscoFormWizard` queries sem empresa_id | Seguranca | **Alto** — dados cross-tenant |
| 4 | Status `em_tratamento` ausente | UX | **Medio** — riscos invisiveis |
| 5 | Botao aprovacao inacessivel | Bug funcional | **Alto** — fluxo morto |
| 6 | Acoes sem DropdownMenu | UX | **Medio** — inconsistencia visual |
| 7 | Sub-modulo Aceite de Risco | Feature nova | **Alto** — requisito do usuario |

