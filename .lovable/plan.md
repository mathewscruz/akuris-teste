

# Correção dos E-mails do Akuris

## Problemas Identificados

1. **Logo não aparece**: A URL `https://akuris.com.br/akuris-logo.png` não carrega porque o domínio personalizado ainda não está conectado. A imagem precisa estar hospedada em um local acessível (ex: Supabase Storage público).

2. **Domínio antigo no send-welcome-email**: O arquivo `supabase/functions/send-welcome-email/index.ts` é o ÚNICO que ainda usa `governaii.com.br` (loginUrl, from, subject). Os outros 17+ edge functions já usam `akuris.com.br`.

3. **Chave Resend desatualizada**: O secret `RESEND_API_KEY` precisa ser atualizado para a nova chave configurada com o domínio `akuris.com.br`.

4. **Layout visual**: O template base (`BaseEmailTemplate.tsx`) tem um design funcional mas pode ser melhorado com um header mais profissional com fundo violeta e logo em destaque.

---

## Plano de Implementação

### Etapa 1: Atualizar a chave da API do Resend
- Solicitar a nova chave de API do Resend (configurada com domínio `akuris.com.br`) via ferramenta de secrets
- Isso resolve o envio como `@akuris.com.br` em vez de `@governaii.com.br`

### Etapa 2: Corrigir a URL do logo
- Alterar `AKURIS_LOGO_URL` no `BaseEmailTemplate.tsx` para usar a logo hospedada no Supabase Storage (URL pública acessível)
- Usar `https://lnlkahtugwmkznasapfd.supabase.co/storage/v1/object/public/` ou a imagem existente no `/public/akuris-logo.png` da preview URL
- Atualizar também em `constants.ts`

### Etapa 3: Corrigir send-welcome-email/index.ts
- Substituir `https://governaii.com.br` por `https://akuris.com.br` na loginUrl
- Substituir `GovernAII` por `Akuris` nos fallbacks
- Substituir `noreply@governaii.com.br` por `noreply@akuris.com.br`

### Etapa 4: Melhorar o layout do BaseEmailTemplate
- Adicionar header com fundo violeta (#7552ff) e logo em branco/destaque (similar ao estilo profissional da plataforma)
- Melhorar espaçamento e hierarquia visual
- Garantir que se a logo da empresa não carregar, o nome da empresa aparece como fallback visível
- Refinar o footer com visual mais limpo

---

## Arquivos Afetados

| Arquivo | Alteração |
|---------|-----------|
| `supabase/functions/_shared/email-templates/BaseEmailTemplate.tsx` | Nova URL do logo + layout visual melhorado com header violeta |
| `supabase/functions/_shared/constants.ts` | Atualizar SYSTEM_LOGO_URL |
| `supabase/functions/send-welcome-email/index.ts` | Corrigir 3 referências a governaii.com.br |
| Secret `RESEND_API_KEY` | Atualizar para nova chave |

