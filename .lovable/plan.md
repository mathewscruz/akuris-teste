

# Loader Premium com fundo roxo Akuris

## O que muda

O loader entre páginas e o loader inicial (Layout) passarão a ter:
- **Fundo roxo Akuris** (`#7552FF`) ocupando toda a área
- **Logo branco** centralizado (usando filtro CSS `brightness(0) invert(1)` no logo existente)
- **Animação de anel giratório** (spin ring) ao redor do logo, em branco semi-transparente
- **Fade-in suave** na entrada

## Arquivos a editar

### 1. `src/components/ui/page-skeleton.tsx`
- Fundo `bg-[#7552FF]` com `min-h-[40vh]` (loader entre páginas, dentro do layout)
- Logo com `filter brightness(0) invert(1)` para ficar branco
- Anel giratório CSS (`border-4 border-white/20 border-t-white rounded-full animate-spin`) envolvendo o logo
- Remover os dots de bounce

### 2. `src/components/Layout.tsx` (loading state, linhas 55-67)
- Mesmo visual do PageSkeleton mas com `min-h-screen` e fundo roxo
- Consistência visual total entre os dois loaders

### 3. `src/index.css`
- Adicionar keyframe customizado para o spin ring (ou usar `animate-spin` nativo do Tailwind, que já existe)

