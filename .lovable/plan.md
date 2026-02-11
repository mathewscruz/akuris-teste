
# Corrigir Alinhamento Vertical dos Cards do Dashboard

## Causa raiz
O card "Evolucao dos Riscos" tem um elemento extra no header (Tabs com Semanal/Mensal/Anual) que o card "Maturidade GRC" nao tem. Isso faz o header do card de Riscos ser mais alto, empurrando o grafico e o rodape para baixo. Como resultado, os rodapes dos dois cards ficam em alturas diferentes.

## Solucao
Usar flexbox vertical em ambos os cards para que o conteudo se distribua uniformemente e o rodape fique sempre alinhado na parte inferior do card.

### Arquivo: `src/components/dashboard/MultiDimensionalRadar.tsx`
- Adicionar `flex flex-col` ao Card
- Adicionar `flex-1` ao CardContent para que ocupe o espaco restante
- Adicionar `mt-auto` ao div do rodape (grid com os 4 indicadores) para que fique sempre colado na base

### Arquivo: `src/components/dashboard/RiskScoreTimeline.tsx`
- Adicionar `flex flex-col` ao Card
- Adicionar `flex-1` ao CardContent para que ocupe o espaco restante
- Adicionar `mt-auto` ao div do rodape (grid com os 4 indicadores) para que fique sempre colado na base

## Resultado
Ambos os cards se expandem para a mesma altura (por estarem em grid) e os rodapes com indicadores ficam alinhados na mesma posicao vertical, independentemente da diferenca de altura dos headers.
