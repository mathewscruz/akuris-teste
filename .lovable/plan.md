

# Alinhamento Visual dos Cards + Renomear Titulo

## Problemas

1. O titulo "Evolucao de Riscos por Criticidade" e longo demais e quebra em duas linhas no header do card
2. O card "Maturidade GRC" nao tem a mesma estrutura visual do card "Evolucao dos Riscos" (falta area de status/badge entre header e grafico)

## Mudancas

### 1. Renomear titulo do card de Riscos
- **Arquivo:** `src/i18n/pt.ts` (linha 78)
  - De: `'Evolucao de Riscos por Criticidade'`
  - Para: `'Evolucao dos Riscos'`
- **Arquivo:** `src/i18n/en.ts` (linha 78)
  - De: `'Risk Evolution by Criticality'`
  - Para: `'Risk Evolution'`

### 2. Alinhar estrutura visual do card Maturidade GRC
- **Arquivo:** `src/components/dashboard/MultiDimensionalRadar.tsx`
  - Adicionar area de status entre o header e o grafico (mesmo padrao do card de Riscos que tem numero + icone + badge)
  - Mostrar o score medio geral com badge de status (ex: "72" + badge "Bom" ou "Atencao")
  - Manter a mesma hierarquia visual: CardHeader com titulo -> area de metricas resumo -> grafico -> rodape com grid 4 colunas

### Detalhes tecnicos

O card de Riscos tem esta estrutura:
```
CardHeader
  -> titulo + tabs
  -> numero grande (totalCritical) + icone de trend + badge de status
CardContent
  -> grafico (ResponsiveContainer)
  -> rodape grid 4 colunas (Criticos/Altos/Medios/Baixos)
```

O card de Maturidade GRC sera ajustado para:
```
CardHeader
  -> titulo
  -> score medio grande + badge de status (Excelente/Bom/Atencao/Critico)
CardContent
  -> grafico radar (ResponsiveContainer)
  -> rodape grid 4 colunas (top 4 dimensoes)
```

Isso garante que ambos os cards tenham a mesma altura de header, mesma area de metricas, e mesmo rodape.

