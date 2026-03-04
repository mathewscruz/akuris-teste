

# Plano: Corrigir Divergências de Cálculo no Gap Analysis

## Divergências Identificadas

Comparando as duas telas (screenshots do usuário):
- **Card do Framework** (lista): ISO 27001 → **49%**, **117 de 117** avaliados
- **Dashboard interno** (detalhe): → **40.6%**, **114 de 117** avaliados

### Bug 1 — Score geral usa média de pilares (não ponderada)

No `useFrameworkScore.tsx` (linha 184-188), o score geral é calculado como **média simples dos scores por pilar/categoria**:

```
overall = pillarScores.reduce(sum + p.score) / pillarScores.length
```

Se um pilar tem 5 requisitos (score 90%) e outro tem 80 requisitos (score 35%), ambos pesam igual. Resultado distorcido.

Já no `GapAnalysisFrameworks.tsx` (linha 114-126), o cálculo é **flat** — soma todos os scores individuais e divide pelo total aplicável. Resultado correto.

**Correção**: Mudar `useFrameworkScore` para calcular o score geral como média ponderada flat (soma de scores / total de requisitos aplicáveis), igual ao card.

### Bug 2 — Contagem de "avaliados" exclui N/A

No `useFrameworkScore.tsx` (linha 164), `evaluated++` só ocorre quando `status !== 'nao_avaliado'`, mas o bloco inteiro já exclui `nao_aplicavel` (linha 159). Resultado: itens marcados como N/A não contam como avaliados.

Na lista de frameworks, N/A conta como avaliado (linha 102-103 de GapAnalysisFrameworks.tsx filtra apenas `nao_avaliado`).

Com 3 itens N/A: card mostra 117/117, dashboard mostra 114/117.

**Correção**: Contar itens `nao_aplicavel` como avaliados (o usuário tomou uma decisão sobre eles).

## Mudanças

| Arquivo | Mudança |
|---------|---------|
| `src/hooks/useFrameworkScore.tsx` | (1) Score geral = soma ponderada flat / total peso aplicável. (2) `evaluatedRequirements` inclui `nao_aplicavel`. |

Nenhum outro arquivo precisa mudar — a fonte da verdade é o hook, e os componentes já consomem dele.

## Impacto

- Score e contagem no dashboard passam a bater com o card da lista
- Cálculos por pilar/seção/domínio continuam individuais (corretos)
- Apenas o `overallScore` e `evaluatedRequirements` mudam

