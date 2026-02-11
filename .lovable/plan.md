

# Auditoria Completa do Sistema de E-mails -- Nome, Logo e Melhorias

## 1. Problemas de Nome do Sistema

O sistema foi renomeado para **Akuris**, mas diversas edge functions ainda referenciam o nome antigo "GovernAII" ou "GovernAI" como fallback hardcoded. Abaixo o mapeamento completo:

| Arquivo | Problema | Linha(s) |
|---------|----------|----------|
| `create-user/index.ts` | `'GovernAII'` como fallback, logo URL `governaii.com.br` | 264-265, 291 |
| `resend-welcome-email/index.ts` | `'GovernAII'` fallback no from e subject | 146, 160-162 |
| `send-password-reset/index.ts` | `'GovernAII'` fallback | 171, 185, 189, 191 |
| `send-approval-notification/index.ts` | `"GovernAII"` fallback, URL `governaii.com.br`, cor do botao `#0D9488` (teal antigo) | 99, 101, 104, 149-150 |
| `send-auditoria-item-notification/index.ts` | `"GovernAII"` fallback, logo URL, `"Powered by GovernAII"` no footer, cor botao `#3b82f6` | 60-61, 83, 127, 143 |
| `send-controle-notification/index.ts` | `"GovernAII"` fallback, logo URL `governaii.com.br`, cor botao `#3b82f6` | 85-86, 128, 177 |
| `send-controle-mention-notification/index.ts` | `"GovernAII"` fallback, logo URL, `"Powered by GovernAII"`, cor botao `#0D9488` | 68-69, 114, 135, 150-151 |
| `send-contrato-vencimento-notification/index.ts` | `"GovernAII"` fallback, logo URL, link `governaii.com.br`, cor botao `#0D9488` | 58-59, 142, 212 |
| `send-denuncia-notification/index.ts` | `'GovernAII'` fallback, logo URL, link `governaii.com.br`, cor botao `#0D9488` | 111-112, 196-197 |
| `send-incidente-notification/index.ts` | `"GovernAII"` fallback, logo URL, link `governaii.com.br`, cor botao `#0D9488` | 54-55, 120, 183 |
| `send-risco-notification/index.ts` | `"GovernAII"` fallback, logo URL, link `governaii.com.br`, cor botao `#0D9488` | 71-72, 102, 177, 183 |
| `send-review-notification/index.ts` | `'GovernAII'` fallback, logo URL, link `governaii.com.br`, cor botao `#0D9488` | 64-65, 83, 158 |
| `send-contact-email/index.ts` | `"GovernAII"` hardcoded no from, subject e footer | 60, 65-66, 85 |
| `send-test-email/index.ts` | `"GovernAII"` fallback, logo URL, link `governaii.com.br`, cor botao `#2563eb` | 53-54, 178-179, 196, 213-217 |
| `send-due-diligence-email/index.ts` | `'GovernAI'` fallback (sem segundo I), cor botao `#2563eb` | 50, 62, 72-73, 84, 92, 104, 134, 146, 161 |
| `send-chave-reminder/index.ts` | `"GovernAI <noreply@governaii.com>"` (sem segundo I, dominio .com sem .br), `"Equipe GovernAI"` | 95, 115-116 |
| `send-licenca-reminder/index.ts` | `"GovernAI <noreply@governaii.com>"` (mesmo problema), `"Equipe GovernAI"` | 104, 123-124 |
| `process-invitation-reminders/index.ts` | `'GovernAI <noreply@governaii.com.br>'`, subject `"GovernAI"` | 160, 162 |
| `process-due-diligence-reminders/index.ts` | `empresa_nome: 'GovernAI'` | 63 |
| `BaseEmailTemplate.tsx` | Logo URL `governaii.com.br/governaii-logo.png`, cores teal `#0D9488` | 23, 28-29, varias |
| `send-welcome-email/_templates/welcome-email.tsx` | `'GovernAII'` fallback | 23, 29 |
| `resend-welcome-email/_templates/welcome-email.tsx` | `'GovernAII'` fallback | 23, 29 |
| `send-password-reset/_templates/password-reset-email.tsx` | (usa BaseEmailTemplate, herda os problemas) | -- |

## 2. Problemas de Logo

- **URL do logo fallback** em quase todos os arquivos aponta para `https://governaii.com.br/governaii-logo.png` -- precisa ser atualizado para o logo do Akuris
- **Dominio errado** em `send-chave-reminder` e `send-licenca-reminder`: usam `noreply@governaii.com` (sem `.br`)

## 3. Problemas de Cores (Identidade Visual Desatualizada)

Muitos templates inline ainda usam as cores do tema antigo (teal/blue) ao inves do novo violet `#7552ff`:

| Cor Atual | Onde aparece | Deveria ser |
|-----------|-------------|-------------|
| `#0D9488` (teal) | Botoes CTA em 8+ templates, border-left em info boxes, BaseEmailTemplate | `#7552ff` (violet) |
| `#3b82f6` (blue) | Botoes em auditoria, controle notification, info boxes | `#7552ff` (violet) |
| `#2563eb` (blue) | Botoes em test-email, due-diligence, contact-email | `#7552ff` (violet) |
| `#0f766e` (teal dark) | Textos em risco-notification | `#5a3fd6` (violet dark) |
| `#f0f9f8` (teal bg) | Info boxes em BaseEmailTemplate, risco | `#f0eeff` (violet bg) |
| `#1e3a5f` (navy) | Textos/titulos -- OK, pode manter para contraste | Manter ou ajustar para `#0a1628` |

## 4. Inconsistencias de Layout entre Templates

Existem 3 "estilos" diferentes de e-mail no sistema:

1. **React Email (BaseEmailTemplate)**: `send-welcome-email`, `send-password-reset`, `resend-welcome-email`, `process-invitation-reminders` -- layout padronizado e bonito
2. **HTML inline padronizado**: `send-approval-notification`, `send-contrato-vencimento`, `send-denuncia`, `send-incidente`, `send-risco`, `send-review`, `send-controle` -- HTML inline com estrutura similar mas nao identica
3. **HTML inline basico (antigo)**: `send-chave-reminder`, `send-licenca-reminder`, `send-due-diligence`, `send-contact-email`, `send-test-email` -- layouts simplificados, sem o design corporativo

## 5. Plano de Correcoes

### 5.1 Criar constantes centralizadas
Criar um arquivo `supabase/functions/_shared/constants.ts` com:
- `SYSTEM_NAME = 'Akuris'`
- `SYSTEM_LOGO_URL = 'https://...'` (URL do logo Akuris)
- `SYSTEM_URL = 'https://akuris.com.br'` (ou URL correta)
- `NOREPLY_EMAIL = 'noreply@akuris.com.br'`
- `PRIMARY_COLOR = '#7552ff'`
- `PRIMARY_DARK = '#5a3fd6'`
- `PRIMARY_BG = '#f0eeff'`

### 5.2 Atualizar BaseEmailTemplate.tsx
- Trocar `GOVERNAII_LOGO_URL` para o logo Akuris
- Trocar paleta `COLORS.primary` de `#0D9488` para `#7552ff`
- Atualizar todos os emailStyles derivados (infoBox, button, badges, etc.)
- Atualizar link do footer de `governaii.com.br` para URL Akuris
- Trocar texto "GovernAII" para "Akuris" e "Plataforma de Governanca, Risco e Compliance" (manter descricao)

### 5.3 Atualizar cada edge function (22 arquivos)
Para cada uma das ~18 edge functions com e-mail:
- Substituir todos os fallbacks `'GovernAII'` / `'GovernAI'` por constante `SYSTEM_NAME`
- Substituir URLs `governaii.com.br` por constante `SYSTEM_URL`
- Substituir logo URLs pelo `SYSTEM_LOGO_URL`
- Substituir `noreply@governaii.com.br` e `noreply@governaii.com` por `NOREPLY_EMAIL`
- Corrigir cores dos botoes CTA e info boxes de teal/blue para violet `#7552ff`
- Remover textos "Powered by GovernAII" dos footers

### 5.4 Padronizar templates basicos
Para os 5 templates que usam HTML inline basico (chave-reminder, licenca-reminder, due-diligence, contact-email, test-email):
- Aplicar o mesmo layout visual dos templates inline padronizados (logo no topo, card branco com sombra, footer consistente)
- Usar as cores violet no lugar de blue/teal

### 5.5 Melhorias de layout sugeridas

**Adicionar em todos os templates:**
- Ano dinamico no footer: `2024-${new Date().getFullYear()} Akuris`
- Link para suporte/contato no footer
- Texto de confidencialidade uniforme

**Remover:**
- `"Powered by GovernAII"` de `send-auditoria-item-notification` e `send-controle-mention-notification`
- Nome da empresa como texto abaixo do logo em `send-auditoria-item-notification` (linha 83) -- ja tem o logo, duplica visualmente

**Melhorar:**
- `send-test-email`: o conteudo fala "Sua conta foi criada com sucesso no GovernAII" e mostra "Teste@123" -- deveria ser mais generico como "Este e um e-mail de teste" sem simular credenciais falsas
- `send-chave-reminder` e `send-licenca-reminder`: layout muito basico (HTML puro sem design), precisam receber o template visual corporativo

### Arquivos a editar (total: ~20 arquivos)

| Arquivo | Tipo de mudanca |
|---------|----------------|
| `_shared/constants.ts` | **Criar** -- constantes centralizadas |
| `_shared/email-templates/BaseEmailTemplate.tsx` | Atualizar cores e textos |
| `create-user/index.ts` | Substituir fallbacks e URLs |
| `resend-welcome-email/index.ts` | Substituir fallbacks e URLs |
| `send-password-reset/index.ts` | Substituir fallbacks e URLs |
| `send-welcome-email/_templates/welcome-email.tsx` | Substituir fallbacks |
| `resend-welcome-email/_templates/welcome-email.tsx` | Substituir fallbacks |
| `send-password-reset/_templates/password-reset-email.tsx` | Herda do Base, verificar |
| `process-invitation-reminders/index.ts` | Substituir nome e from |
| `send-approval-notification/index.ts` | Substituir tudo + cores |
| `send-auditoria-item-notification/index.ts` | Substituir tudo + cores + remover "Powered by" |
| `send-controle-notification/index.ts` | Substituir tudo + cores |
| `send-controle-mention-notification/index.ts` | Substituir tudo + cores + remover "Powered by" |
| `send-contrato-vencimento-notification/index.ts` | Substituir tudo + cores |
| `send-denuncia-notification/index.ts` | Substituir tudo + cores |
| `send-incidente-notification/index.ts` | Substituir tudo + cores |
| `send-risco-notification/index.ts` | Substituir tudo + cores |
| `send-review-notification/index.ts` | Substituir tudo + cores |
| `send-contact-email/index.ts` | Substituir tudo + melhorar layout |
| `send-test-email/index.ts` | Substituir tudo + corrigir conteudo |
| `send-due-diligence-email/index.ts` | Substituir tudo + cores |
| `send-chave-reminder/index.ts` | Substituir tudo + corrigir dominio + melhorar layout |
| `send-licenca-reminder/index.ts` | Substituir tudo + corrigir dominio + melhorar layout |
| `process-due-diligence-reminders/index.ts` | Substituir nome |

Todas as edge functions editadas precisarao ser re-deployed apos as mudancas.

