
# Redesign de Cores do Sistema Akuris

## Mapeamento das Novas Cores

| Cor Hex | HSL | Uso Principal |
|---------|-----|---------------|
| #7552ff | 252 100% 66% | Primary: botoes, links, destaques, ring, sidebar ativo, gradients, glow |
| #444444 | 0 0% 27% | Secondary/Foreground: textos principais, icones, labels |
| #0a1628 | 216 60% 10% | Backgrounds escuros: sidebar, login, landing page, dark mode base |

## Arquivo: `src/index.css`

### Light Mode (:root)
- **--primary**: 172 66% 35% (teal) --> 252 100% 66% (violet)
- **--primary-glow**: 166 72% 45% --> 252 100% 75% (violet mais claro)
- **--accent-vibrant**: 160 84% 39% --> 252 90% 58% (violet mais saturado)
- **--foreground**: 200 25% 12% --> 0 0% 17% (baseado no #444 mais escuro para contraste)
- **--ring**: 172 66% 35% --> 252 100% 66%
- **--accent**: 172 35% 93% --> 252 30% 95% (violet tint sutil)
- **--accent-foreground**: 172 66% 28% --> 252 80% 50%
- **--table-row-hover**: 172 15% 97% --> 252 15% 97%
- **--gradient-primary**: atualizar para usar tons de violet
- **--gradient-subtle**: manter neutro com leve tint violet
- **--gradient-card**: manter neutro com leve tint violet
- **--gradient-accent**: atualizar para tons violet
- **--shadow-elegant/glow**: atualizar cores de hsl(172...) para hsl(252...)
- **Sidebar Light**: --sidebar-background baseado em #0a1628, --sidebar-primary em violet

### Dark Mode (.dark)
- **--background**: 200 25% 8% --> 216 60% 8% (baseado no #0a1628)
- **--primary**: 168 70% 42% --> 252 100% 70% (violet vibrante no dark)
- **--primary-glow**: 164 75% 50% --> 252 100% 78%
- **--accent-vibrant**: 158 80% 45% --> 252 85% 62%
- **--accent**: 172 30% 18% --> 252 30% 20%
- **--accent-foreground**: 168 70% 55% --> 252 100% 75%
- **--card**: 200 22% 11% --> 216 45% 12%
- **--popover**: 200 22% 11% --> 216 45% 12%
- **--ring**: 168 70% 42% --> 252 100% 70%
- **Sidebar Dark**: atualizar para tons de #0a1628 com primary violet
- **Gradients e Shadows**: atualizar todas as referencias de teal/emerald para violet

### Landing Page CSS
- `.landing-glass`: rgba(15, 35, 64, 0.8) --> manter (ja usa #0a1628 como base)
- `.landing-gradient-text`: atualizar para usar violet ao inves de teal

### Auth.tsx
- Gradientes de fundo: atualizar hsl(200,25%,8%) para cores baseadas em #0a1628

## Resultado
O sistema inteiro muda de teal/emerald para violet/navy, mantendo a hierarquia visual: violet como cor de acao e destaque, cinza escuro para textos, e navy escuro para superficies de fundo e sidebar.
