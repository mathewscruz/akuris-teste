

# Revisao Completa: Cadastro, E-mails e MFA por E-mail

## Diagnostico Atual

Apos analisar todo o sistema, identifiquei os seguintes pontos:

### Problemas encontrados

1. **Senha temporaria enviada por e-mail (inseguro)**: Os e-mails de boas-vindas e reset enviam a senha em texto puro no corpo do e-mail. Isso e uma pratica insegura.

2. **Fluxo de primeiro acesso ruim**: O usuario recebe uma senha temporaria, faz login com ela, e depois e forcado a troca-la via modal `PasswordChangeRequired`. O ideal seria enviar um link para o usuario definir a propria senha diretamente.

3. **Logo do Akuris**: O `BaseEmailTemplate.tsx` usa a URL `https://id-preview--...lovable.app/akuris-logo.png` que e uma URL de preview e pode deixar de funcionar. Precisa de uma URL publica estavel.

4. **Sem MFA**: Nao existe nenhum mecanismo de autenticacao multifator no sistema.

---

## Plano de Implementacao

### Parte 1: Substituir senha temporaria por link de definicao de senha

**Fluxo novo do cadastro de usuario (admin cria usuario):**
1. Admin cria usuario no sistema
2. Sistema cria o usuario no Supabase Auth com uma senha aleatoria interna (nao enviada)
3. Sistema gera um magic link / invite link via `supabase.auth.admin.generateLink({ type: 'invite', email })`
4. E-mail de boas-vindas envia o LINK (nao a senha) para o usuario definir sua propria senha
5. Usuario clica no link, e redirecionado para uma pagina `/definir-senha` onde define a senha
6. Apos definir, e redirecionado para `/auth` (login)

**Arquivos afetados:**

| Arquivo | Alteracao |
|---------|-----------|
| `supabase/functions/create-user/index.ts` | Usar `generateLink({ type: 'invite' })` ao inves de `generate_temp_password`. Passar o link no e-mail |
| `supabase/functions/send-welcome-email/index.ts` | Receber `setupPasswordUrl` ao inves de `temporaryPassword` |
| `supabase/functions/send-welcome-email/_templates/welcome-email.tsx` | Redesenhar template: botao "Definir Minha Senha" com link, sem exibir senha |
| `supabase/functions/resend-welcome-email/index.ts` | Mesmo ajuste: gerar novo invite link ao inves de senha temporaria |
| `supabase/functions/resend-welcome-email/_templates/welcome-email.tsx` | Mesmo ajuste do template |
| `supabase/functions/send-password-reset/index.ts` | Usar `generateLink({ type: 'recovery' })` ao inves de `generate_temp_password` |
| `supabase/functions/send-password-reset/_templates/password-reset-email.tsx` | Template com link "Redefinir Minha Senha" sem exibir senha |
| `src/pages/DefinirSenha.tsx` | **NOVA PAGINA** - Recebe o token da URL, valida, permite definir senha, redireciona para login |
| `src/App.tsx` | Adicionar rota `/definir-senha` (publica) |
| `src/components/AuthProvider.tsx` | Remover logica de `hasTemporaryPassword` e `checkTemporaryPassword` (nao serao mais necessarios) |
| `src/components/PasswordChangeRequired.tsx` | Pode ser mantido como fallback para usuarios legados que ainda tenham senha temporaria |

### Parte 2: MFA por E-mail (OTP)

**Fluxo:**
1. Usuario faz login com email + senha (como hoje)
2. Se login com sucesso, sistema gera um codigo OTP de 6 digitos
3. Codigo e salvo no banco com expiracao de 5 minutos
4. E-mail e enviado ao usuario com o codigo
5. Tela de verificacao aparece pedindo o codigo
6. Usuario insere o codigo e a sessao e liberada

**Arquivos afetados:**

| Arquivo | Alteracao |
|---------|-----------|
| Migracao SQL | Criar tabela `mfa_codes` (user_id, code, expires_at, used, created_at) com RLS |
| `supabase/functions/send-mfa-code/index.ts` | **NOVA FUNCAO** - Gera codigo, salva no banco, envia e-mail |
| `supabase/functions/send-mfa-code/_templates/mfa-code-email.tsx` | **NOVO TEMPLATE** - E-mail com codigo OTP estilizado |
| `supabase/functions/verify-mfa-code/index.ts` | **NOVA FUNCAO** - Valida codigo, marca como usado |
| `src/pages/Auth.tsx` | Apos login com sucesso, chamar `send-mfa-code` e exibir tela de verificacao |
| `src/components/MFAVerification.tsx` | **NOVO COMPONENTE** - Tela de input do codigo OTP com 6 digitos usando `InputOTP` |
| `supabase/config.toml` | Registrar novas edge functions |

**Estrutura da tabela `mfa_codes`:**
```text
id          UUID PRIMARY KEY
user_id     UUID NOT NULL (referencia profiles)
code        TEXT NOT NULL (6 digitos)
expires_at  TIMESTAMPTZ NOT NULL (created_at + 5min)
used        BOOLEAN DEFAULT false
created_at  TIMESTAMPTZ DEFAULT now()
empresa_id  UUID (para isolamento de dados)
```

### Parte 3: Logo estavel nos e-mails

**Abordagem:** Fazer upload do logo para o Supabase Storage em um bucket publico `email-assets` e usar a URL do storage em todos os templates.

| Arquivo | Alteracao |
|---------|-----------|
| Migracao SQL | Criar bucket `email-assets` publico |
| Upload | Fazer upload de `public/akuris-logo.png` para o bucket |
| `supabase/functions/_shared/constants.ts` | Atualizar `SYSTEM_LOGO_URL` para URL do storage |
| `supabase/functions/_shared/email-templates/BaseEmailTemplate.tsx` | Atualizar `AKURIS_LOGO_URL` para URL do storage |

---

## Secao Tecnica

### Fluxo do novo cadastro (sem senha temporaria)

```text
Admin clica "Criar Usuario"
        |
        v
create-user Edge Function
        |
        +---> Cria usuario no Auth (senha aleatoria interna)
        +---> Cria profile
        +---> Gera invite link via generateLink({ type: 'invite' })
        +---> Envia e-mail com link "Definir Minha Senha"
        |
        v
Usuario recebe e-mail
        |
        v
Clica no link --> /definir-senha?token_hash=xxx&type=invite
        |
        v
Pagina valida o token, permite definir senha
        |
        v
Redireciona para /auth (login normal)
```

### Fluxo do MFA por e-mail

```text
Usuario digita email + senha
        |
        v
Login OK --> NÃO libera sessao ainda
        |
        v
Chama send-mfa-code (gera codigo 6 digitos, envia e-mail)
        |
        v
Exibe tela MFA (InputOTP com 6 slots)
        |
        v
Usuario digita codigo recebido por e-mail
        |
        v
Chama verify-mfa-code (valida codigo)
        |
        v
Sessao liberada --> Dashboard
```

### Consideracoes de seguranca

- Codigos MFA expiram em 5 minutos
- Maximo 5 tentativas por codigo antes de bloquear
- Tabela `mfa_codes` com RLS isolando por `empresa_id`
- Codigos antigos sao invalidados quando novo codigo e gerado
- Rate limiting no envio (maximo 1 codigo por minuto por usuario)

