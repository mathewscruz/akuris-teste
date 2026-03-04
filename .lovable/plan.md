

# Plano: Agrupar Score + Domínios + Seções dentro do card esquerdo

## Mudança

Mover "Aderência por Domínio" e "Aderência por Seção" para **dentro** do card "Score Geral de Conformidade" (o card esquerdo do grid 2 colunas), separados por `Separator`. Remover os cards full-width avulsos abaixo.

```text
┌──────────────────────────────────┐  ┌──────────────────────┐
│ Score Geral de Conformidade      │  │ Evolução do Score    │
│   [Donut] Badges Progress        │  │ [Chart]              │
│ ──────────────────────────────── │  │                      │
│ ADERÊNCIA POR DOMÍNIO DO ANEXO A │  │                      │
│ ┌────┐┌────┐┌────┐┌────┐┌────┐  │  │                      │
│ └────┘└────┘└────┘└────┘└────┘  │  │                      │
│ ──────────────────────────────── │  │                      │
│ ADERÊNCIA POR SEÇÃO              │  │                      │
│ ┌──────────┐ ┌──────────┐       │  │                      │
│ └──────────┘ └──────────┘       │  │                      │
└──────────────────────────────────┘  └──────────────────────┘
```

## Arquivo

| Arquivo | Mudança |
|---------|---------|
| `src/components/gap-analysis/GenericScoreDashboard.tsx` | Mover domínios e seções para dentro do CardContent do Score Geral, separados por Separator. Remover os cards independentes de domínio/seção. Reduzir donut para 100px para liberar espaço vertical. |

