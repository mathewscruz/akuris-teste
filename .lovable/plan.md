

# Plano: Reorganizar layout do Score Dashboard

## 3 Ajustes Solicitados

### Anexo 1 — Domínios na mesma linha
Mudar grid dos domínios de `grid-cols-2 sm:grid-cols-3` para `grid-cols-2 sm:grid-cols-4` para que os 4 domínios (A.5, A.6, A.7, A.8) fiquem na mesma linha.

### Anexo 2 — Score Donut à esquerda, badges/progresso à direita (vertical)
Reorganizar o bloco do Score Geral para layout horizontal: Donut à esquerda, e à direita uma coluna vertical com Badge "Em Implementação", "Nível 3" e barra de progresso.

### Anexo 3 — Gráfico de Evolução ocupa toda a área
Aumentar `height` do `ResponsiveContainer` de `200` para `300` e remover altura fixa do container vazio para que o chart preencha o card.

## Arquivos

| Arquivo | Mudança |
|---------|---------|
| `GenericScoreDashboard.tsx` | Layout horizontal no score (donut + info lado a lado); grid domínios `sm:grid-cols-4` |
| `ScoreEvolutionChart.tsx` | Aumentar altura do chart para ~300px |

