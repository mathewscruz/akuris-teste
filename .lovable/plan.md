

# Correções da Landing Page

## Problema 1: Texto JSON visível no topo
O `index.html` tem JSON-LD órfão nas linhas 200-227 — o `<script>` do BreadcrumbList fecha na linha 199, mas o conteúdo do FAQPage ficou fora de qualquer tag `<script>`, renderizando como texto visível no navegador.

**Correção:** Envolver o bloco FAQPage em `<script type="application/ld+json">...</script>`.

## Problema 2: Remover elementos do Hero
- Linha 274-276: Remover o badge "Plataforma GRC para empresas"
- Linhas 310-312: Remover "Sem cartão de crédito • Setup em minutos • Suporte incluso"

## Problema 3: Fundo vazio no Hero
Adicionar um efeito de fundo sutil e profissional — um grid pattern com opacidade muito baixa + radial gradient suave no centro. Isso preenche o vazio sem parecer "AI-generated":

```css
/* Grid sutil no fundo do hero */
background-image: 
  radial-gradient(ellipse 60% 50% at 50% 40%, rgba(59,130,246,0.08) 0%, transparent 70%),
  linear-gradient(rgba(30,45,69,0.3) 1px, transparent 1px),
  linear-gradient(90deg, rgba(30,45,69,0.3) 1px, transparent 1px);
background-size: 100% 100%, 60px 60px, 60px 60px;
```

Estilo enterprise sóbrio, referência visual: Vanta.com, Drata.com.

## Arquivos

| Arquivo | Mudança |
|---|---|
| `index.html` | Corrigir JSON-LD órfão (envolver em script tag) |
| `src/pages/LandingPage.tsx` | Remover badge + trust line, adicionar background pattern ao hero |

