

# Plano: Corrigir Donut + Transformar IA em botão com popup

## 1. Donut não preenche corretamente

O componente `ScoreDonut` usa cores CSS variáveis (`hsl(var(--chart-4))`) que podem ser muito próximas da cor de fundo (`hsl(var(--muted))`), resultando no anel preenchido sendo visualmente indistinguível. Vou trocar as cores para valores mais vibrantes e contrastantes (hex/hsl fixos) para garantir que o preenchimento seja sempre visível.

## 2. Consultor IA → Botão com ícone + popup

Atualmente `AIRecommendationsCard` é um card inteiro renderizado abaixo do dashboard. Vou:

- Remover o card `AIRecommendationsCard` da posição atual na página
- Adicionar um botão com ícone `Sparkles` ao lado do botão "Exportar PDF" no `PageHeader`
- Ao clicar, abrir um `Dialog` que executa a análise IA e mostra os resultados dentro do popup
- A lógica de fetch da IA será movida para dentro do Dialog

## Arquivos

| Arquivo | Mudança |
|---------|---------|
| `GenericScoreDashboard.tsx` | Corrigir cores do `ScoreDonut` para cores mais vibrantes/contrastantes |
| `GapAnalysisFrameworkDetail.tsx` | Remover `AIRecommendationsCard`, adicionar botão IA no header, criar Dialog com resultados |
| `AIRecommendationsCard.tsx` | Refatorar para exportar um Dialog (`AIRecommendationsDialog`) em vez de Card |

