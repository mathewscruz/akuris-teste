

# Plano: Agrupar Score + Domínios + Seções em um único card

## Problema
O Score Geral ocupa metade da tela sozinho com muito espaço vazio. Os blocos de "Aderência por Domínio" e "Aderência por Seção" ficam abaixo, separados visualmente. O donut e badges não estão centralizados.

## Mudança

Consolidar tudo dentro do **mesmo Card** que hoje exibe apenas o Score Geral:

```text
┌─────────────────────────────────────────┐  ┌──────────────────────┐
│ Score Geral de Conformidade             │  │ Evolução do Score    │
│                                         │  │                      │
│   [Donut 120px]                         │  │   [Chart]            │
│   Em Implementação  ● Nível 3           │  │                      │
│   ████████████████████████░░  111/117   │  │                      │
│                                         │  │                      │
│ ─────────────────────────────────────── │  │                      │
│ Aderência por Domínio do Anexo A        │  │                      │
│ ┌─────────┐┌─────────┐┌────────┐┌─────┐│  │                      │
│ │A.5 64.6%││A.6 63.2%││A.7 35% ││A.8  ││  │                      │
│ └─────────┘└─────────┘└────────┘└─────┘│  │                      │
│ ─────────────────────────────────────── │  │                      │
│ Aderência por Seção                     │  │                      │
│ ┌──────────────────┐┌─────────────────┐ │  │                      │
│ │Req. SGSI  32.5%  ││Controles  53.4% │ │  │                      │
│ └──────────────────┘└─────────────────┘ │  │                      │
└─────────────────────────────────────────┘  └──────────────────────┘
```

### Detalhes:
1. **Centralizar** donut + badges + progress verticalmente dentro do card
2. **Mover** domainScores e sectionScores para **dentro** do mesmo Card, separados por `Separator`
3. **Remover** os blocos `<div>` avulsos de domínios/seções que ficam fora do grid
4. Domínios e seções usam cards menores internos (border only, sem shadow) para manter compactos
5. Só renderiza as seções de domínio/seção se houver dados

## Arquivo Afetado

| Arquivo | Mudança |
|---------|---------|
| `src/components/gap-analysis/GenericScoreDashboard.tsx` | Reestruturar layout: score centralizado + domínios + seções dentro do mesmo Card |

