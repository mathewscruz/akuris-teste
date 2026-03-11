

# Correções de SEO para indexação no Google

## Problemas identificados nos prints

1. **"Indexada, mas bloqueada pelo robots.txt"** — O robots.txt atual não tem nenhuma diretiva `Disallow`, o que é tecnicamente incompleto segundo o padrão. Alguns crawlers interpretam a ausência de `Disallow` como ambígua. Além disso, rotas internas da app (dashboard, configuracoes, etc.) estão acessíveis ao crawler, o que polui o crawl budget.

2. **HTTP vs HTTPS** — A página indexada aparece como `http://akuris.com.br/` (sem HTTPS). Isso é um problema de infraestrutura/DNS que precisa ser resolvido no provedor de domínio (configurar redirect 301 de HTTP para HTTPS). Não é corrigível via código.

3. **SPA sem conteúdo para crawler** — Como é uma Single Page Application React, o Google precisa renderizar JavaScript para ver o conteúdo. Isso atrasa e dificulta a indexação. Não há SSR (Server-Side Rendering) disponível no Lovable, mas podemos melhorar o que o crawler vê inicialmente.

4. **Sitemap com páginas internas** — O sitemap inclui `/auth` e `/registro` que são páginas de login/cadastro, não conteúdo indexável relevante.

## Correções implementáveis

### 1. robots.txt — Adicionar Disallow explícito + bloquear rotas internas

Adicionar `Disallow:` (vazio, padrão) e bloquear todas as rotas internas do app que não são conteúdo público (dashboard, riscos, controles, etc.). Isso foca o crawl budget nas páginas públicas.

### 2. sitemap.xml — Remover páginas de app, manter só públicas

Remover `/auth` e `/registro` do sitemap. Manter apenas: `/`, `/politica-privacidade`, `/denuncia-menu`.

### 3. index.html — Adicionar noscript fallback com conteúdo

Adicionar um bloco `<noscript>` dentro do `<body>` com o conteúdo principal da landing page em HTML estático. Isso permite que crawlers que não executam JS (ou que falham no render) ainda vejam conteúdo relevante.

### 4. Meta tags adicionais para crawlers

Adicionar `<meta name="fragment" content="!">` (legacy AJAX crawling hint) e garantir que o canonical está correto com trailing slash.

## Ação manual necessária (infraestrutura)

- **HTTPS**: Verificar no provedor de domínio (onde o DNS do akuris.com.br está configurado) se há redirect 301 de `http://` para `https://`. Se o domínio está apontando para o Lovable via custom domain, verificar nas configurações do Lovable se o SSL está ativo.
- **Google Search Console**: Após as correções, resubmeter o sitemap e solicitar reindexação da URL principal.

## Arquivos a editar

| Arquivo | Mudança |
|---|---|
| `public/robots.txt` | Adicionar `Disallow:` explícito + bloquear rotas internas do app |
| `public/sitemap.xml` | Remover `/auth` e `/registro` |
| `index.html` | Adicionar `<noscript>` com conteúdo estático da landing page |

