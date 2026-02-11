
# Redesign da Tela de Login - Akuris

## Resumo

Transformar a tela de login atual (card centralizado simples sobre fundo escuro) em uma experiencia visual moderna e imersiva, seguindo o conceito "Command Center" ja presente no restante do sistema, com layout split-screen, animacoes suaves e elementos graficos que reforcem a identidade da marca Akuris.

## Design Proposto

### Layout Split-Screen (Desktop)
- **Lado esquerdo (60%)**: Painel de marca com fundo navy escuro, elementos decorativos animados (orbs de glow violet, grid sutil animado), logo grande do Akuris ao centro, tagline "Plataforma de Governanca, Risco e Compliance", e indicadores visuais animados (3 icones com descricoes curtas das capacidades do sistema: Governanca, Riscos, Compliance)
- **Lado direito (40%)**: Formulario de login sobre fundo ligeiramente mais claro, com glassmorphism sutil

### Layout Mobile (< 768px)
- Painel de marca vira um header compacto (logo + tagline)
- Formulario ocupa a tela inteira abaixo, mantendo a mesma experiencia

### Melhorias Visuais no Formulario
- Inputs com icones internos (Mail para email, Lock para senha)
- Separador visual "ou" com linha decorativa (preparado para futuras opcoes de login)
- Botao "Entrar" com efeito shimmer animado no hover
- Animacao de entrada (fade-in staggered) nos elementos do formulario
- Badge "Seguro e Criptografado" com icone de Shield abaixo do botao

### Elementos Decorativos (Painel Esquerdo)
- Orbs de glow com cores violet animadas (ja existem no sistema, reutilizar)
- Grid de fundo sutil com linhas animadas (reutilizar `.landing-grid-bg`)
- 3 feature cards minimalistas com icones (Shield, BarChart3, FileCheck) e textos curtos
- Efeito de gradiente animado no texto de destaque

### Animacoes
- Reutilizar as classes ja existentes: `landing-fade-in-1` a `landing-fade-in-5` para entrada escalonada
- Glow pulse nos orbs decorativos (ja tem `glow-pulse` no CSS)
- Shimmer no botao CTA (ja tem `.landing-glow-btn` no CSS)

## Detalhes Tecnicos

### Arquivo modificado
- `src/pages/Auth.tsx` -- reescrever o JSX do return mantendo toda a logica (state, handlers, validacao Zod, loading, etc.)

### Nenhuma dependencia nova
- Usar apenas Lucide icons ja instalados (Shield, BarChart3, FileCheck, Mail, Lock, Eye, EyeOff, Loader2, CheckCircle2)
- Reutilizar classes CSS ja existentes no `index.css`

### Estrutura do componente

```text
+--------------------------------------------------+
|  DESKTOP (min-h-screen, flex)                    |
|                                                  |
|  +-------------------+  +---------------------+  |
|  | BRAND PANEL       |  | LOGIN PANEL         |  |
|  | (hidden sm, 60%)  |  | (100% mobile, 40%) |  |
|  |                   |  |                     |  |
|  | [Grid BG animado] |  | [Logo mobile only]  |  |
|  | [Orbs glow]       |  |                     |  |
|  |                   |  | "Acesso ao Sistema" |  |
|  |   AKURIS LOGO     |  | "Entre com suas     |  |
|  |   Tagline         |  |  credenciais"       |  |
|  |                   |  |                     |  |
|  | [Feature 1]       |  | [Email input]       |  |
|  | [Feature 2]       |  | [Password input]    |  |
|  | [Feature 3]       |  | [Remember + Forgot] |  |
|  |                   |  | [Entrar button]     |  |
|  |                   |  | [Shield badge]      |  |
|  |                   |  |                     |  |
|  +-------------------+  | [Footer links]      |  |
|                          +---------------------+  |
+--------------------------------------------------+
```

### Responsividade
- **Desktop (lg+)**: Split-screen com painel de marca visivel
- **Tablet/Mobile (< lg)**: Painel de marca escondido (`hidden lg:flex`), formulario centralizado com logo no topo (comportamento similar ao atual mas com melhorias visuais)

### Cores utilizadas
- Fundo painel esquerdo: `from-[hsl(216,60%,8%)] via-[hsl(216,45%,10%)] to-[hsl(216,60%,8%)]`
- Fundo painel direito: `from-[hsl(216,50%,10%)] to-[hsl(216,45%,12%)]`
- Inputs: bordas com `border-white/10`, fundo `bg-white/5`
- Texto destaque: classe `text-gradient` ja existente
- Botao: variante `gradient` ja existente com classe `landing-glow-btn` adicionada

### Nenhuma mudanca de logica
- Toda a logica de autenticacao, validacao Zod, estados, handlers e redirecionamento permanece inalterada
- Apenas o JSX de renderizacao e reestruturado
