

# Ajustes rápidos na Landing Page

## Mudanças

1. **Mockup URL**: Trocar `app.akuris.com.br` → `akuris.com.br` no `DashboardMockup.tsx`

2. **Hero CTAs**: Remover o link "Teste Grátis" que vai para `/registro`. Manter apenas dois botões que direcionam ao formulário de contato:
   - **Primário**: "Solicitar Demonstração" → scroll para `#contato`
   - **Secundário**: "Fale Conosco" → scroll para `#contato`

3. **Demais CTAs na página**: Substituir "Fale com Vendas" → "Fale Conosco" em todos os pontos (dialog de módulo, etc). Trocar "Começar Grátis" / links para `/registro` por scroll ao formulário de contato.

## Arquivos

| Arquivo | Mudança |
|---|---|
| `src/components/landing/DashboardMockup.tsx` | Linha 26: URL do mockup |
| `src/pages/LandingPage.tsx` | Hero CTAs, dialog CTA, seção de preços CTA — todos direcionando ao formulário |

