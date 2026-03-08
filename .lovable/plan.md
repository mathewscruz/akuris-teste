

# Clarear seções alternadas — fundo claro real

## Problema

As seções "claras" continuam com tons escuros (`#0F1A2E`), praticamente indistinguíveis do fundo principal. O usuário quer um contraste real — branco ou cinza claro.

## Solução

Trocar o fundo das 3 seções alternadas para um cinza muito claro (`#F1F5F9` — slate-100) e ajustar o texto/cards internos para ficarem legíveis no fundo claro (texto escuro, cards com fundo branco/borda sutil).

## Mudanças

**Arquivo:** `src/pages/LandingPage.tsx`

| Seção | Linha | Mudança |
|---|---|---|
| Módulos | 363 | `bg-[#0F1A2E]` → `bg-[#F1F5F9]` + textos internos para cores escuras |
| Testimonials | 462 | `bg-[#0F1A2E]` → `bg-[#F1F5F9]` + textos internos para cores escuras |
| Contato | 522 | `bg-[#0F1A2E]` → `bg-[#F1F5F9]` + textos/inputs para modo claro |

Em cada seção clara, os ajustes internos incluem:
- Títulos: `text-white` → `text-gray-900`
- Subtítulos/descrições: `text-gray-400` → `text-gray-600`
- Cards: fundo `bg-white` com `border border-gray-200` e `shadow-sm`
- Inputs (contato): fundo branco, borda cinza, texto escuro
- Botões roxo mantêm a cor `#7552FF`

