

# Corrigir Grafico "Aderencia por Categoria"

## Problema

A mudanca anterior deixou o card enorme (altura dinamica) e as barras comecam apenas do meio para a direita devido a margem esquerda excessiva (145px) e largura do YAxis (140px).

## Solucao

**Arquivo**: `src/components/gap-analysis/CategoryBarChart.tsx`

1. **Voltar altura fixa para 300px** -- remover calculo dinamico
2. **Reduzir margem esquerda** de 145px para 10px
3. **Reduzir largura do YAxis** de 140px para 100px
4. **Truncar nomes** em 15 caracteres (em vez de 22) para caber no espaco menor
5. **Adicionar scroll vertical interno** com `overflow-y: auto` e `max-height: 300px` no container, renderizando o grafico com altura proporcional ao numero de categorias internamente -- assim o card mantem tamanho fixo mas o conteudo rola se houver muitas categorias

Resultado: card com tamanho compacto, barras ocupando toda a largura disponivel, nomes truncados legiveis, scroll interno se necessario.

