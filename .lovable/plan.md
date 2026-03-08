

# Validação i18n + Bandeiras no Login

## Diagnóstico

A internacionalização está **extremamente incompleta**. O sistema NÃO está pronto para venda internacional.

### Cobertura atual de `useLanguage()`/`t()`:
- **1 de 37 páginas** usa i18n (apenas `Dashboard.tsx`)
- **11 de ~120 componentes** usam i18n (todos do dashboard + sidebar)
- **36 páginas inteiras** têm texto 100% hardcoded em português

### Problemas principais:
1. **Auth.tsx**: Labels "Acesso ao Sistema", "E-mail", "Senha", "Lembrar-me", "Esqueci minha senha", "Entrar", "Não tem uma conta?", erros de validação — tudo hardcoded PT
2. **Registro.tsx**: Formulário inteiro em PT
3. **Todas as páginas de módulos** (Riscos, Incidentes, Contratos, Documentos, Ativos, Políticas, etc.): títulos, botões, placeholders, toasts, mensagens de erro, labels de filtro — tudo PT
4. **Todos os dialogs** (~50+ componentes): formulários, labels, validações — tudo PT
5. **text-utils.ts**: 280 status labels hardcoded em português sem alternativa EN
6. **MobileBottomNav.tsx**: menu items hardcoded em PT
7. **NotificationCenter.tsx**: todas as strings em PT
8. **ForgotPasswordDialog.tsx**: strings em PT
9. **LandingPage.tsx**: conteúdo marketing inteiro em PT
10. **Edge Functions**: emails de boas-vindas, MFA, reset — todos em PT

### O que funciona:
- Sidebar traduz corretamente PT/EN
- Dashboard widgets (KPIs, alertas, gráficos) traduzem corretamente
- Seletor de idioma existe na tela de login (mas só muda texto do dashboard)

## Escopo real

Traduzir 100% do sistema exigiria modificar **~100+ arquivos** e adicionar **~2000+ chaves** ao dicionário. Isso é um projeto de várias sessões.

## Proposta pragmática para esta sessão

Focar no que é **visível ao cliente internacional na primeira impressão** e na bandeira solicitada:

### 1. Bandeiras no Login (solicitado explicitamente)
- Trocar o `LanguageSelector` para mostrar bandeira do Brasil (🇧🇷) e bandeira do Reino Unido (🇬🇧) usando emoji flags em vez de imagens externas (funciona em todos os navegadores modernos, sem dependência de assets)
- Remover o ícone Globe, usar apenas as bandeiras como toggle

### 2. Traduzir a tela de Login (Auth.tsx)
- "Acesso ao Sistema" → "System Access"
- "Entre com suas credenciais" → "Enter your credentials"
- "E-mail", "Senha", "Lembrar-me", "Esqueci minha senha", "Entrar"
- "Não tem uma conta?", "Criar conta grátis"
- Mensagens de erro do Zod e do Supabase
- "Todos os direitos reservados"
- Features do brand panel

### 3. Traduzir a tela de Registro (Registro.tsx)
- Todos os labels, placeholders, validações e botões

### 4. Traduzir o ForgotPasswordDialog
- Labels, mensagens de sucesso/erro

### 5. Traduzir o MobileBottomNav
- Usar as mesmas chaves do sidebar

### 6. Traduzir o header/layout comum
- NotificationCenter: títulos "Notificações", "Marcar como lido", etc.
- CommandPalette: placeholder de busca
- ConfirmDialog: botões

### 7. Expandir os dicionários (en.ts / pt.ts)
- Adicionar seções: `auth`, `register`, `notifications`, `forgotPassword`

## Arquivos a modificar

| Arquivo | Mudança |
|---|---|
| `src/components/LanguageSelector.tsx` | Globe → emoji flags 🇧🇷/🇬🇧 |
| `src/i18n/pt.ts` | Adicionar seções auth, register, notifications, forgotPassword |
| `src/i18n/en.ts` | Adicionar mesmas seções em inglês |
| `src/pages/Auth.tsx` | Substituir strings hardcoded por `t()` |
| `src/pages/Registro.tsx` | Substituir strings hardcoded por `t()` |
| `src/components/ForgotPasswordDialog.tsx` | Substituir strings por `t()` |
| `src/components/MobileBottomNav.tsx` | Usar `t()` do sidebar |
| `src/components/NotificationCenter.tsx` | Substituir strings por `t()` |
| `src/components/ConfirmDialog.tsx` | Substituir strings por `t()` |

### Nota sobre módulos internos

As 27+ páginas de módulos (Riscos, Incidentes, Contratos, etc.) e seus ~50+ dialogs continuarão em português nesta sessão. A tradução completa desses módulos será feita em sessões subsequentes, organizadas por módulo. Isso é aceitável porque um cliente internacional consegue: fazer login, navegar pelo sidebar, usar o dashboard — tudo em inglês. Os módulos internos podem ser traduzidos incrementalmente.

