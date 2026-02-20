

# Correcao do Erro de Edge Function + Logo nos E-mails

## Problemas Identificados

### 1. Erro critico de boot (causa do "Failed to send a request")
O arquivo `BaseEmailTemplate.tsx` tem a linha `import * as React from 'npm:react@18.3.1'` **duplicada** (linhas 12 e 13). Isso causa o erro:
```
Uncaught SyntaxError: Identifier 'React' has already been declared
```
Todas as edge functions que importam este arquivo falham ao iniciar.

### 2. Logo como imagem real
O usuario quer o logotipo real (imagem) e nao texto estilizado. A abordagem mais confiavel: fazer upload do logo para o Supabase Storage corretamente e usar a URL publica.

## Solucao

### Passo 1: Corrigir import duplicado no BaseEmailTemplate.tsx
- Remover a linha 13 (import duplicado de React)
- Adicionar import do componente `Img` do react-email
- Substituir o `<Text>` do header por `<Img>` usando a URL do logo no Supabase Storage

### Passo 2: Upload correto do logo via Edge Function temporaria
Criar uma edge function que:
1. Faz fetch do logo diretamente da URL do preview do projeto (`/akuris-logo-email.png`)
2. Cria o bucket `email-assets` se nao existir
3. Faz upload do arquivo real (binario PNG)
4. Retorna confirmacao

### Passo 3: Atualizar o header do BaseEmailTemplate
Trocar o texto "AKURIS" por:
```tsx
<Img
  src="https://lnlkahtugwmkznasapfd.supabase.co/storage/v1/object/public/email-assets/akuris-logo-email.png"
  alt="Akuris"
  width="200"
  height="60"
  style={{ margin: '0 auto', display: 'block' }}
/>
```

### Passo 4: Atualizar Edge Functions com HTML inline
Substituir o logo em texto nas funcoes que usam HTML inline:
- `send-controle-notification/index.ts`
- `send-denuncia-notification/index.ts`
- `send-incidente-notification/index.ts`
- `send-auditoria-item-notification/index.ts`
- `send-due-diligence-email/index.ts`
- `send-risco-notification/index.ts`
- `send-controle-mention-notification/index.ts`
- `send-review-notification/index.ts`
- `send-contrato-vencimento-notification/index.ts`

### Passo 5: Deploy e limpeza
- Deploy de todas as funcoes afetadas
- Executar a funcao de upload
- Deletar a funcao temporaria

## Secao Tecnica

**Causa raiz do erro:**
```
Linha 12: import * as React from 'npm:react@18.3.1';
Linha 13: import * as React from 'npm:react@18.3.1';  // DUPLICADO - REMOVER
```

**Arquivos modificados:**
- `supabase/functions/_shared/email-templates/BaseEmailTemplate.tsx` - remover import duplicado, usar Img
- `supabase/functions/_shared/constants.ts` - adicionar URL do logo
- 9 edge functions de notificacao - substituir logo texto por img tag
- 1 edge function temporaria para upload (criar, executar, deletar)
