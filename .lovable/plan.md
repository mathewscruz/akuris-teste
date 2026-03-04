

# Ajuste Visual dos Campos de Login

## Problema
Os inputs de e-mail e senha têm `pl-10` (2.5rem de padding esquerdo) para acomodar ícones posicionados em `left-3`. Isso cria um espaço excessivo entre o texto e a borda, além do fundo `bg-white/5` que destoa visualmente do card escuro.

## Solução

**Arquivo**: `src/pages/Auth.tsx`

- Reduzir padding esquerdo dos inputs de `pl-10` para `pl-9`
- Mover ícones de `left-3` para `left-3.5` para centralizar melhor dentro do espaço
- Trocar `bg-white/5` por `bg-white/[0.03]` para um fundo mais sutil e integrado ao card
- Ajustar `border-white/10` para `border-white/[0.08]` para borda mais suave
- Adicionar `rounded-lg` explícito para consistência visual

Resultado: campos mais compactos, texto mais próximo da borda, visual mais integrado ao tema escuro.

