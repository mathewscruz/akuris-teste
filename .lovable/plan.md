

# Alinhar Score do Modulo de Riscos com o Dashboard

## Problema
O `RiskScoreCard` usa uma escala de 0-1000 com logica invertida (`(100 - scoreAtual) * 10`), enquanto o dashboard usa uma escala de 0-100% com gauge semicircular. Visualmente sao diferentes e confundem o usuario.

## Solucao

Refatorar o `RiskScoreCard` para usar o mesmo formato visual e escala do `HealthScoreGauge`:

- **Escala**: 0-100% (ao inves de 0-1000)
- **Calculo**: Usar a mesma logica do `useRadarChartData` para Riscos -- percentual de riscos tratados/aceitos/baixos sobre o total
- **Labels**: "Sem dados", "Critico", "Atencao", "Bom", "Excelente" (mesmos do dashboard)
- **Cores**: Mesmas faixas do gauge do dashboard (destructive < 40, warning < 60, primary < 80, success >= 80)
- **Texto central**: Substituir "de 1000" por label textual (ex: "Atencao"), identico ao gauge do dashboard
- **Legenda inferior**: Atualizar de "Critico/Alto/Medio/Baixo" para "Critico/Atencao/Bom/Excelente"

### Detalhes tecnicos

**Arquivo**: `src/components/riscos/RiskScoreCard.tsx`

Mudancas:
1. Remover funcoes `getScorePercentage` e `getScoreColor` atuais (escala 0-1000)
2. Criar novas funcoes alinhadas com `HealthScoreGauge`:
   - `getColor(score)`: mesmas faixas (>=80 success, >=60 primary, >=40 warning, <40 destructive)
   - `getLabel(score)`: mesmos labels ("Sem dados" para 0, "Critico", "Atencao", "Bom", "Excelente")
3. Calcular `displayScore` como percentual 0-100 baseado nos dados de `stats`:
   - Score = percentual de riscos com nivel baixo/muito baixo + riscos aceitos + riscos com tratamento concluido, sobre o total
   - Quando `total === 0`, score = 0 (sem dados)
4. Atualizar SVG gauge: texto central mostra score de 0-100, texto inferior mostra label
5. Atualizar `legendItems` para: Critico / Atencao / Bom / Excelente com as cores correspondentes

