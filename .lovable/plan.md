

# Efeito de Zoom + Fade no Mockup ao Scroll

## O que será feito

Adicionar um efeito parallax no mockup do dashboard: conforme o usuário rola a tela para baixo, o mockup vai aumentando de escala (zoom) e simultaneamente perdendo opacidade, desaparecendo antes de chegar na próxima seção.

## Implementação

**Arquivo:** `src/pages/LandingPage.tsx`

1. Adicionar um `useState` para guardar o progresso do scroll (`mockupScale` e `mockupOpacity`)
2. No `useEffect` de scroll já existente (linha 52), calcular o progresso baseado na posição do scroll relativo à altura da viewport:
   - De `scrollY = 0` → scale 1, opacity 1
   - De `scrollY = ~500px` → scale ~1.5, opacity 0
3. Aplicar `transform: scale(...)` e `opacity` inline no container do mockup (linha 321)

Resultado: o mockup cresce suavemente e desaparece antes do próximo bloco de conteúdo, sem interferir em nada.

| Arquivo | Mudança |
|---|---|
| `src/pages/LandingPage.tsx` | State de scroll progress + style dinâmico no mockup |

