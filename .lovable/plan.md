

# Diagnóstico: Dashboard com dados intermitentes

## Problemas encontrados

### 1. Race condition na obtenção do `empresaId` (causa principal)

Os hooks do dashboard usam **duas formas diferentes** de obter o `empresaId`:

| Padrão | Hooks que usam | Como funciona |
|---|---|---|
| `useAuth().profile?.empresa_id` | `useAtivosStats`, `useRiscosStats`, `useDashboardStats`, `useTrendData` | Síncrono, disponível assim que AuthProvider carrega o profile |
| `useEmpresaId()` (query separada) | `useControlesStats`, `useIncidentesStats`, `useContratosStats`, `useDocumentosStats`, `useDenunciasStats` | Faz uma query assíncrona separada ao Supabase para buscar `empresa_id` |

O `useEmpresaId()` faz uma query **adicional e independente** ao banco. Dependendo da latência, ele pode resolver **depois** dos hooks que usam `useAuth()`, fazendo com que metade dos dados apareça e a outra metade fique vazia até o `useEmpresaId` resolver. Se a resposta demora ou falha silenciosamente, esses hooks nunca disparam.

### 2. `useRadarChartData` — queryKey não reage a mudanças de dados

O `queryKey` é apenas `['radar-chart-data', empresaId]`. Quando os sub-hooks (riscos, controles, etc.) atualizam seus dados, o radar **não re-executa** porque a key não mudou. Ele lê os `.data` dos hooks via closure no momento da chamada, mas o React Query não sabe que precisa refazer a query.

### 3. `useGapAnalysisStats` usa sistema de cache diferente

Usa `useOptimizedQuery` (cache manual) em vez de React Query. Retorna `loading` em vez de `isLoading`. O `useRadarChartData` verifica corretamente `gapAnalysis.loading`, mas esse hook opera fora do React Query, não participa de `invalidateQueries`, e pode ficar dessincronizado.

### 4. `useDueDiligenceStats` sem `empresaId` no queryKey

Não recebe `empresaId` de fora — busca internamente via `supabase.auth.getUser()` + query ao profiles. Isso significa que:
- Não participa do `invalidateQueries` baseado em `empresaId`
- Se o auth não estiver pronto, pode falhar silenciosamente

## Plano de correção

### A. Padronizar todos os hooks para usar `useAuth().profile?.empresa_id`

Eliminar `useEmpresaId()` de todos os hooks do dashboard. Usar o `profile?.empresa_id` que já está disponível no AuthProvider, evitando a query redundante.

**Arquivos:** `useControlesStats`, `useIncidentesStats`, `useContratosStats`, `useDocumentosStats`, `useDenunciasStats`

### B. Corrigir `useRadarChartData` para reagir a dados

Incluir os `dataUpdatedAt` dos sub-hooks no `queryKey` para que o React Query re-execute quando qualquer dado mudar.

**Arquivo:** `useRadarChartData.tsx`

### C. Migrar `useGapAnalysisStats` para React Query

Substituir `useOptimizedQuery` por `useQuery` padrão, mantendo o mesmo staleTime. Isso unifica o sistema de cache e garante que `invalidateQueries` funcione.

**Arquivo:** `useGapAnalysisStats.tsx`

### D. Corrigir `useDueDiligenceStats` para receber `empresaId`

Usar `useAuth().profile?.empresa_id` como os demais, incluir no `queryKey` e no `enabled`.

**Arquivo:** `useDueDiligenceStats.tsx`

## Arquivos modificados

| Arquivo | Mudança |
|---|---|
| `src/hooks/useControlesStats.tsx` | `useEmpresaId()` → `useAuth().profile?.empresa_id` |
| `src/hooks/useIncidentesStats.tsx` | `useEmpresaId()` → `useAuth().profile?.empresa_id` |
| `src/hooks/useContratosStats.tsx` | `useEmpresaId()` → `useAuth().profile?.empresa_id` |
| `src/hooks/useDocumentosStats.tsx` | `useEmpresaId()` → `useAuth().profile?.empresa_id` |
| `src/hooks/useDenunciasStats.tsx` | `useEmpresaId()` → `useAuth().profile?.empresa_id` |
| `src/hooks/useGapAnalysisStats.tsx` | Migrar de `useOptimizedQuery` para `useQuery` |
| `src/hooks/useDueDiligenceStats.tsx` | Receber `empresaId` via `useAuth()`, adicionar ao queryKey/enabled |
| `src/hooks/useRadarChartData.tsx` | Incluir `dataUpdatedAt` dos sub-hooks no queryKey |

## Impacto

- Elimina a race condition que causa dados intermitentes
- Todos os hooks disparam simultaneamente assim que o `profile` está disponível
- O refresh do dashboard (`invalidateQueries`) funciona uniformemente
- Isolamento por empresa mantido (cada hook filtra por `empresa_id`)

