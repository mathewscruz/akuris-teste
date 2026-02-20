

# Solucao Definitiva: Logo Embutido como Base64

## Problema
Apesar do bucket `email-assets` existir e conter o arquivo `akuris-logo.png` (137KB), o logo continua quebrado nos e-mails. Isso provavelmente ocorreu porque o upload anterior capturou o HTML da pagina de preview em vez do arquivo PNG real.

## Solucao: Abordagem mais simples possivel

**Embutir o logo diretamente no template como imagem base64 (data URI).** Isso elimina 100% da dependencia de URLs externas, buckets, CDNs ou qualquer outro ponto de falha.

Vantagens:
- Funciona em TODOS os clientes de e-mail (Gmail, Outlook, Apple Mail)
- Zero dependencia de URLs externas
- Nunca quebra por problemas de storage/DNS/cache
- A imagem viaja junto com o e-mail

## Passos

### 1. Copiar o logo enviado pelo usuario para o projeto
- Copiar `user-uploads://AKURIS_400_x_120_px_2-3.png` para `public/akuris-logo-email.png`

### 2. Converter para base64 via Edge Function temporaria
- Criar uma Edge Function que le o arquivo do storage e retorna o base64
- Ou usar a imagem diretamente convertida

### 3. Atualizar BaseEmailTemplate.tsx
- Substituir a tag `<Img src={logoUrl}>` por uma imagem com `src="data:image/png;base64,..."` contendo o logo embutido
- Remover a constante `AKURIS_LOGO_URL` e a prop `companyLogoUrl` (simplificar)
- O header escuro (#0a1628) continuara o mesmo, com o logo branco/violeta visivel

### 4. Atualizar Edge Functions com HTML inline
- Nas funcoes que usam HTML inline (denuncias, incidentes, auditorias, due diligence), substituir `<img src="...">` pelo mesmo data URI base64

### 5. Deploy de todas as funcoes afetadas

## Secao Tecnica

**Mudanca principal no BaseEmailTemplate.tsx:**
```tsx
// Antes:
<Img src={logoUrl} alt={companyName} width="160" height="48" ... />

// Depois:
<Img src="data:image/png;base64,iVBORw0KGgo..." alt="Akuris" width="160" height="48" ... />
```

**Arquivos modificados:**
- `supabase/functions/_shared/email-templates/BaseEmailTemplate.tsx` - logo base64 embutido
- `supabase/functions/_shared/constants.ts` - remover URL do logo (nao mais necessaria)
- `supabase/functions/send-denuncia-notification/index.ts` - logo base64 inline
- `supabase/functions/send-incidente-notification/index.ts` - logo base64 inline
- `supabase/functions/send-auditoria-item-notification/index.ts` - logo base64 inline
- `supabase/functions/send-due-diligence-email/index.ts` - logo base64 inline
- Demais funcoes que usam HTML inline com logo

**Nota:** O arquivo base64 aumenta o tamanho do e-mail em ~10-15KB, o que e absolutamente aceitavel e e a pratica padrao da industria para logos em e-mails.
