

# Auditoria QA Completa do Sistema

## Problemas Encontrados

### 1. CRITICO: `useGapAnalysisStats` nao filtra frameworks por `empresa_id`

**Arquivo:** `src/hooks/useGapAnalysisStats.tsx` linhas 16-25

As queries de `gap_analysis_frameworks` nao incluem filtro `.eq('empresa_id', empresaId)`. Isso significa que o count de frameworks e a lista de IDs retorna dados de **todas as empresas**, quebrando o isolamento de dados.

```
// ATUAL (errado):
.from('gap_analysis_frameworks').select('*', { count: 'exact', head: true })
// deveria ser:
.from('gap_analysis_frameworks').select('*', { count: 'exact', head: true }).eq('empresa_id', empresaId)
```

### 2. CRITICO: Paginas ainda usam `useEmpresaId()` (race condition residual)

Os hooks do dashboard foram corrigidos, mas **9 paginas** ainda usam `useEmpresaId()` que faz query separada ao banco, causando a mesma race condition para dados desses modulos:

- `src/pages/PlanosAcao.tsx`
- `src/pages/Politicas.tsx`
- `src/pages/Incidentes.tsx`
- `src/pages/Documentos.tsx`
- `src/pages/Continuidade.tsx`
- `src/pages/Relatorios.tsx`
- `src/pages/RevisaoAcessos.tsx`
- `src/pages/GapAnalysisFrameworks.tsx`
- `src/pages/GapAnalysisFrameworkDetail.tsx`

E **8 hooks** auxiliares:
- `useChavesStats`, `useLicencasStats`, `useFrameworkScore`, `useScoreHistory`, `useReviewStats`, `useReviewData`, `useAdherenceStats`, `useAuditoriaData`

### 3. MEDIO: `useRiscosStats` tem `staleTime: 0` e `refetchOnWindowFocus: true`

Enquanto todos os outros hooks usam `staleTime: 5 * 60 * 1000`, riscos usa `staleTime: 0`. Isso gera requisicoes excessivas ao Supabase a cada foco de janela.

### 4. MEDIO: `useDenunciasStats` falta `staleTime`

Nao define `staleTime`, usando o default de 0 do React Query, causando refetch desnecessario.

### 5. BAIXO: Console warning React.Fragment `data-lov-id`

O `PageHeader` renderiza `<React.Fragment>` dentro de `.map()` e o Lovable injeta `data-lov-id` como prop no Fragment, gerando warning no console. Nao afeta funcionalidade, mas polui logs.

### 6. MEDIO: `useReviewStats` e `useAdherenceStats` usam `useOptimizedQuery` em vez de React Query

Estes hooks operam fora do sistema React Query, nao participam de `invalidateQueries`, e podem ficar dessincronizados. O `useReviewData.invalidateCache()` usa queryKeys erradas (`review-stats-${empresaId}` como key no React Query, mas o cache real esta no `useOptimizedQuery`).

### 7. BAIXO: `useRadarChartData` retorna score 0 quando modulo tem 0 registros

Se um modulo nao tem registros (ex: `riscosData.total === 0`), o score e 0. Isso puxa a media do health score pra baixo artificialmente. Uma abordagem melhor seria excluir modulos sem dados do calculo ou dar score neutro.

---

## Plano de Correcao

### A. Corrigir filtro `empresa_id` em `useGapAnalysisStats` (critico, seguranca)

Adicionar `.eq('empresa_id', empresaId!)` nas duas queries de frameworks.

**Arquivo:** `src/hooks/useGapAnalysisStats.tsx`

### B. Migrar paginas de `useEmpresaId()` para `useAuth().profile?.empresa_id`

Substituir em todas as 9 paginas e 8 hooks listados. Padrao simples:
```
// DE:
const { empresaId } = useEmpresaId();
// PARA:
const { profile } = useAuth();
const empresaId = profile?.empresa_id;
```

Onde a pagina ja usa `useAuth()`, basta extrair `empresa_id` do profile existente.

**Arquivos:** 17 arquivos listados acima.

### C. Padronizar `staleTime` em hooks inconsistentes

- `useRiscosStats`: mudar `staleTime: 0` para `staleTime: 5 * 60 * 1000` e remover `refetchOnWindowFocus: true`
- `useDenunciasStats`: adicionar `staleTime: 5 * 60 * 1000`

### D. Migrar `useReviewStats` de `useOptimizedQuery` para `useQuery`

Unificar com o padrao React Query para que `invalidateQueries` funcione.

**Arquivo:** `src/hooks/useReviewStats.tsx`

### Arquivos a modificar

| Arquivo | Mudanca |
|---|---|
| `src/hooks/useGapAnalysisStats.tsx` | Adicionar filtro `.eq('empresa_id', empresaId)` |
| `src/hooks/useRiscosStats.tsx` | `staleTime: 5 * 60 * 1000`, remover `refetchOnWindowFocus` |
| `src/hooks/useDenunciasStats.tsx` | Adicionar `staleTime: 5 * 60 * 1000` |
| `src/hooks/useReviewStats.tsx` | Migrar para `useQuery` |
| `src/pages/PlanosAcao.tsx` | `useEmpresaId()` → `useAuth()` |
| `src/pages/Politicas.tsx` | `useEmpresaId()` → `useAuth()` |
| `src/pages/Incidentes.tsx` | `useEmpresaId()` → `useAuth()` |
| `src/pages/Documentos.tsx` | `useEmpresaId()` → `useAuth()` |
| `src/pages/Continuidade.tsx` | `useEmpresaId()` → `useAuth()` |
| `src/pages/Relatorios.tsx` | `useEmpresaId()` → `useAuth()` |
| `src/pages/RevisaoAcessos.tsx` | `useEmpresaId()` → `useAuth()` |
| `src/pages/GapAnalysisFrameworks.tsx` | `useEmpresaId()` → `useAuth()` |
| `src/pages/GapAnalysisFrameworkDetail.tsx` | `useEmpresaId()` → `useAuth()` |
| `src/hooks/useChavesStats.tsx` | `useEmpresaId()` → `useAuth()` |
| `src/hooks/useLicencasStats.tsx` | `useEmpresaId()` → `useAuth()` |
| `src/hooks/useFrameworkScore.tsx` | `useEmpresaId()` → `useAuth()` |
| `src/hooks/useScoreHistory.tsx` | `useEmpresaId()` → `useAuth()` |
| `src/hooks/useReviewData.tsx` | `useEmpresaId()` → `useAuth()` |
| `src/hooks/useAdherenceStats.tsx` | `useEmpresaId()` → `useAuth()` |
| `src/hooks/useAuditoriaData.tsx` | `useEmpresaId()` → `useAuth()` |

