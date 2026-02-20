
# Melhorar Visual do Mapa de Conformidade por Capitulo

## Problema

O Treemap atual do Recharts tem varios problemas visuais:
- Nomes dos capitulos ficam cortados e sobrepostos
- Blocos muito pequenos nao mostram conteudo
- Todos os blocos estao vermelhos (0%) sem diferenciacao visual clara
- Layout parece desordenado e dificil de ler

## Solucao

Substituir o Treemap do Recharts por um **grid de cards estilizados** (CSS puro), similar ao padrao usado no `CategoryStatusCards`. Cada categoria sera um card compacto com:

- Nome completo do capitulo (sem truncar)
- Score em destaque com cor indicativa
- Barra de progresso pequena
- Contagem de itens avaliados

**Arquivo**: `src/components/gap-analysis/charts/PrivacyTreemap.tsx`

### Mudancas

1. **Remover Recharts** (Treemap, ResponsiveContainer, Tooltip) -- usar apenas HTML/CSS
2. **Grid responsivo** com `grid-cols-2 md:grid-cols-3 lg:grid-cols-4` para distribuir os capitulos uniformemente
3. **Cada card** tera:
   - Borda esquerda colorida baseada no score (verde/azul/amarelo/laranja/vermelho)
   - Nome completo do capitulo em texto pequeno
   - Score grande e centralizado
   - Mini barra de progresso
   - "X/Y avaliados" em texto discreto
4. **Container scrollavel** com `max-h-[320px] overflow-y-auto` para manter o card compacto
5. **Manter a mesma interface** (`PrivacyTreemapProps`) para nao quebrar o uso em `GapAnalysisFrameworkDetail.tsx`

### Resultado visual

Um grid organizado e legivel, onde cada capitulo e um mini-card com cor indicativa, nome completo visivel, e informacoes claras -- sem sobreposicao ou texto cortado.
