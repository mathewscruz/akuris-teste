

# Correção do Flickering + Novo Gráfico de Maturidade GRC

## Problema 1: Dashboard piscando (flickering)

**Causa raiz:** O `useRadarChartData` inclui `dataUpdatedAt` de 8 sub-hooks no `queryKey`. Toda vez que qualquer sub-hook refaz fetch (mesmo retornando dados identicos), o timestamp muda, o queryKey muda, e o React Query re-executa a query inteira. Isso gera novos objetos de array a cada ciclo, causando re-render em cascata no Dashboard (gauge, KPIs, radar -- tudo pisca).

**Correcao:** Substituir `useQuery` por `useMemo` no `useRadarChartData`. Os dados do radar sao 100% derivados dos sub-hooks -- nao ha fetch proprio. Usar `useQuery` para computacao sincrona e um anti-pattern que cria dependencias circulares de invalidacao.

```text
ANTES:                          DEPOIS:
useQuery({                      useMemo(() => {
  queryKey: [                     // computa direto dos .data
    'radar-chart-data',           // sem queryKey, sem refetch
    ...8 dataUpdatedAt            // memo so recalcula quando
  ],                              // dados reais mudam
  queryFn: async () => {        }, [ativosData, controlesData, ...])
    // le .data dos hooks
  }
})
```

**Arquivo:** `src/hooks/useRadarChartData.tsx`

Adicionalmente, `RecentActivities` usa `useEffect` + `useState` com fetch manual. Vou migrar para `useQuery` com `staleTime: 5min` para evitar refetches desnecessarios e manter consistencia.

**Arquivo:** `src/components/dashboard/RecentActivities.tsx`

## Problema 2: Grafico "Maturidade de GRC" vazio e pouco util

O radar chart atual tem problemas visuais: quando modulos tem score 0, o grafico fica quase vazio e nao comunica valor. Alem disso, os labels sobrepoem em telas menores.

**Substituicao:** Trocar o `RadarChart` por um layout de **barras horizontais com indicadores de status**, mais moderno e informativo:

- Cada modulo aparece como uma barra horizontal com gradiente de cor baseado no score
- Icone do modulo + nome a esquerda, score numerico a direita
- Barras clicaveis (navegam para o modulo)
- Modulos sem dados aparecem com barra cinza e label "Sem dados" em vez de score 0
- Ocupa melhor o espaco vertical do card
- Score medio e badge de status no header (mantidos)

**Arquivo:** `src/components/dashboard/MultiDimensionalRadar.tsx`

## Arquivos a modificar

| Arquivo | Mudanca |
|---|---|
| `src/hooks/useRadarChartData.tsx` | `useQuery` → `useMemo`, retornar `{ data, isLoading }` compativel |
| `src/components/dashboard/MultiDimensionalRadar.tsx` | RadarChart → barras horizontais modernas |
| `src/components/dashboard/RecentActivities.tsx` | `useEffect/useState` → `useQuery` com staleTime |

