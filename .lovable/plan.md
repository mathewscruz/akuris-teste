

# Plano: Score Geral lado a lado com gráfico + Domínios/Seções abaixo com mais espaço

## Mudança

Voltar ao layout original onde Score Geral e Evolução do Score ficam lado a lado (grid 2 colunas). Mover Domínios e Seções para **fora** desse card, como cards independentes abaixo do grid, com mais espaçamento.

```text
┌──────────────────────────┐  ┌──────────────────────────┐
│ Score Geral              │  │ Evolução do Score        │
│ [Donut] Badges Progress  │  │ [Chart]                  │
└──────────────────────────┘  └──────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ ADERÊNCIA POR DOMÍNIO DO ANEXO A                        │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│ │A.5 64.6% │ │A.6 63.2% │ │A.7 35.0% │ │A.8 45.6% │   │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ ADERÊNCIA POR SEÇÃO                                     │
│ ┌────────────────────────┐ ┌────────────────────────┐   │
│ │Req. SGSI  32.5%        │ │Controles  53.4%        │   │
│ └────────────────────────┘ └────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## Arquivo

| Arquivo | Mudança |
|---------|---------|
| `src/components/gap-analysis/GenericScoreDashboard.tsx` | Extrair domínios/seções do card de Score, colocá-los como cards full-width abaixo do grid. Aumentar gap entre seções (`gap-3`). |

