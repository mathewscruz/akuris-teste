

# Melhorias e Otimizações Identificadas

Analisei o codebase completo e identifiquei melhorias em 3 categorias: **Performance**, **Qualidade de Código** e **UX**.

---

## 1. Code Splitting com React.lazy (Performance -- Alto Impacto)

O `App.tsx` importa **todas as 30+ páginas sincronamente**. Isso significa que o bundle inicial carrega todo o código de Riscos, Contratos, Documentos, etc., mesmo quando o usuário está na Landing Page. Com `React.lazy` + `Suspense`, cada página é carregada apenas quando acessada.

**Arquivo:** `src/App.tsx`
- Converter todos os imports de páginas para `React.lazy(() => import(...))`
- Envolver as `<Routes>` com `<Suspense fallback={<PageSkeleton />}>`
- Resultado esperado: bundle inicial ~60% menor, carregamento da Landing Page muito mais rápido

---

## 2. LanguageProvider duplicado (Bug)

O `LanguageProvider` está instanciado **duas vezes**: uma em `main.tsx` e outra em `App.tsx`. Isso cria dois contextos aninhados desnecessariamente, desperdiçando memória e potencialmente causando inconsistências.

**Correção:** Remover o `LanguageProvider` de `main.tsx` (manter apenas em `App.tsx` que já envolve tudo).

---

## 3. QueryClient sem configuração de cache (Performance)

O `QueryClient` em `App.tsx` é criado sem nenhuma configuração `defaultOptions`. Isso significa `staleTime: 0` (padrão), fazendo com que toda navegação entre páginas re-fetche dados. Os hooks individuais configuram `staleTime`, mas uma configuração global garante consistência.

**Arquivo:** `src/App.tsx`
- Adicionar `defaultOptions: { queries: { staleTime: 2 * 60 * 1000, retry: 1, refetchOnWindowFocus: false } }`

---

## 4. Preload da fonte Google Fonts bloqueante (Performance)

O `index.html` carrega Google Fonts com `<link rel="stylesheet">` que é render-blocking. Usar `media="print" onload="this.media='all'"` ou `font-display: swap` + `preload` eliminaria o bloqueio.

**Arquivo:** `index.html`
- Converter o link de fonts para carregamento assíncrono

---

## 5. Preconnect para Supabase já existe, mas falta preload do logo (Performance)

O logo Akuris (`/akuris-logo.png`) é carregado via import em vários componentes. Um `<link rel="preload">` para o asset local (não o URL externo) ajudaria no LCP.

**Arquivo:** `index.html`
- Trocar o preload de `https://akuris.com.br/akuris-logo.png` para o asset local usado no hero

---

## Resumo de Prioridade

| # | Melhoria | Impacto | Esforço |
|---|----------|---------|---------|
| 1 | Code splitting (React.lazy) | Alto (bundle -60%) | Médio |
| 2 | Remover LanguageProvider duplicado | Médio (bug fix) | Baixo |
| 3 | QueryClient defaultOptions | Médio (menos refetches) | Baixo |
| 4 | Fonts não-bloqueantes | Médio (LCP melhor) | Baixo |
| 5 | Preload do logo local | Baixo | Baixo |

