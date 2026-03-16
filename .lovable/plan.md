

# Avaliacao de Melhorias e Otimizacoes

Apos analisar o codebase, identifiquei as seguintes oportunidades organizadas por impacto e esforco:

---

## 1. Acessibilidade e UX

### 1.1 Prefetch de rotas no hover da sidebar
**Problema**: Ao clicar em um modulo, o chunk JS precisa ser carregado (lazy loading), causando micro-delay.
**Solucao**: Adicionar `onMouseEnter` nos links da sidebar para chamar o import dinamico da pagina correspondente, fazendo prefetch do chunk antes do clique.

| Arquivo | Mudanca |
|---------|---------|
| `src/components/AppSidebar.tsx` | Adicionar prefetch via `import()` no `onMouseEnter` dos links |

### 1.2 Skeleton de carregamento por modulo (ao invés de tela branca)
**Problema**: Enquanto dados carregam via React Query, varios modulos mostram nada ou StatCards com "0" que piscam. Apenas Dashboard usa `<Skeleton>` adequadamente.
**Solucao**: Criar um componente `ModuleLoadingSkeleton` com variantes (stat-cards + tabela) e aplicar nos modulos que fazem fetch pesado (Riscos, Incidentes, PlanosAcao, Continuidade, etc).

| Arquivo | Mudanca |
|---------|---------|
| `src/components/ui/module-loading-skeleton.tsx` | Novo componente com layout skeleton (4 stat cards + tabela) |
| Paginas principais | Usar skeleton enquanto `isLoading` |

---

## 2. Performance

### 2.1 React Query: deduplicar fetches redundantes
**Problema**: Varias paginas fazem queries separadas para stats E lista de dados, quando muitas vezes os stats poderiam ser derivados da lista. Alem disso, hooks como `useDashboardStats` fazem 4 queries em paralelo que poderiam ser consolidadas.
**Solucao**: Nos modulos onde stats sao contagens simples da propria lista (Riscos, Incidentes), derivar stats do `useQuery` principal ao inves de ter um hook separado.

| Arquivo | Mudanca |
|---------|---------|
| Paginas que usam stats hook + query separada | Consolidar em uma unica query |

### 2.2 Virtualizar tabelas grandes
**Problema**: Modulos como Riscos, Documentos, Contratos carregam todos os registros e renderizam no DOM. Com 100+ registros, isso afeta scroll e re-renders.
**Solucao**: Adicionar paginacao server-side ou virtualizar com `@tanstack/react-virtual` no `DataTable`.

| Arquivo | Mudanca |
|---------|---------|
| `src/components/ui/data-table.tsx` | Adicionar paginacao server-side ou virtualizacao |

---

## 3. Robustez

### 3.1 Tratamento de erros em Edge Functions
**Problema**: Varios componentes que chamam Edge Functions (AkurIAChatbot, DocGenDialog, AIRecommendationsCard) tratam erros de forma inconsistente - alguns mostram toast, outros falham silenciosamente.
**Solucao**: Criar um wrapper `invokeEdgeFunction()` centralizado que trata CORS, 402 (creditos), 429 (rate limit), e erros de rede de forma padronizada.

| Arquivo | Mudanca |
|---------|---------|
| `src/lib/edge-function-utils.ts` | Novo utilitario para invocar edge functions |
| Componentes que usam `supabase.functions.invoke` | Migrar para o wrapper |

### 3.2 Retry automatico em falhas de rede
**Problema**: O `QueryClient` tem `retry: 1`, mas nao diferencia erros de rede (retriable) de erros de negocio (nao-retriable).
**Solucao**: Configurar `retry` com funcao que so faz retry em erros de rede/timeout.

| Arquivo | Mudanca |
|---------|---------|
| `src/App.tsx` | `retry: (count, error) => isNetworkError(error) && count < 2` |

---

## 4. UX de Primeiro Uso

### 4.1 Tooltips contextuais nos StatCards vazios
**Problema**: Novos usuarios veem todos os StatCards com "0" e nao entendem o que significam.
**Solucao**: Quando stats == 0, mostrar um tooltip ou mensagem sutil no StatCard indicando "Cadastre seu primeiro risco" etc.

| Arquivo | Mudanca |
|---------|---------|
| `src/components/ui/stat-card.tsx` | Prop opcional `emptyHint` |

---

## 5. Seguranca

### 5.1 Sanitizacao de HTML no chatbot
**Problema**: O `AkurIAChatbot` usa `dangerouslySetInnerHTML` com `DOMPurify.sanitize()`, mas o `DocGenDialog` faz o mesmo com formatacao markdown customizada que pode ter edge cases.
**Solucao**: Auditar e padronizar o uso de DOMPurify em ambos componentes, garantindo que a config de sanitizacao seja a mesma e restritiva.

| Arquivo | Mudanca |
|---------|---------|
| `src/lib/sanitize-utils.ts` | Configuracao centralizada do DOMPurify |

---

## Resumo de Prioridade

| # | Melhoria | Impacto | Esforco |
|---|----------|---------|---------|
| 1.1 | Prefetch de rotas na sidebar | Alto (navegacao instantanea) | Baixo |
| 1.2 | Skeleton de carregamento por modulo | Alto (percepçao de velocidade) | Medio |
| 2.1 | Deduplicar fetches stats | Medio (menos requests) | Medio |
| 2.2 | Virtualizar/paginar tabelas | Alto (performance com muitos dados) | Alto |
| 3.1 | Wrapper Edge Functions | Medio (consistencia erros) | Medio |
| 3.2 | Retry inteligente | Baixo (resilencia) | Baixo |
| 4.1 | Hints nos StatCards vazios | Medio (onboarding) | Baixo |
| 5.1 | Sanitizacao centralizada | Medio (seguranca) | Baixo |

Recomendo comecar por **1.1** (prefetch na sidebar, rapido e alto impacto), depois **3.2** (retry inteligente), e **1.2** (skeletons por modulo).

