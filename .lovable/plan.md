
# Plano: Fluxo Completo de Auto-Cadastro com Assinatura

## Situacao Atual

O sistema hoje **nao permite que um visitante se cadastre sozinho**. O fluxo atual e:
1. Landing page tem apenas "Solicitar Demonstracao" (formulario de contato) e "Fazer Login"
2. Usuarios sao criados apenas por admins via painel de configuracoes
3. Nao existe pagina de signup/registro publico
4. A pagina `/planos` esta protegida (dentro do Layout, requer login)
5. Nao ha vinculacao automatica entre assinatura Stripe e criacao de empresa/usuario

## O Que Falta Construir

### 1. Secao de Precos na Landing Page
Adicionar uma secao de planos/precos na landing page (antes da secao de contato) com os 3 planos, toggle mensal/anual, e botao "Comecar teste gratis" que leva ao cadastro.

### 2. Pagina de Registro (Signup)
Criar pagina `/registro` publica onde o visitante pode:
- Informar: Nome, Email, Senha, Nome da Empresa, CNPJ (opcional)
- Selecionar o plano desejado (passado como parametro da URL, ex: `/registro?plano=starter`)
- Ao submeter, criar conta no Supabase Auth

### 3. Edge Function de Provisionamento Automatico
Criar edge function `provision-new-account` que sera chamada apos o registro:
- Cria a empresa na tabela `empresas` com `status_licenca = 'trial'` e `data_inicio_trial = now()`
- Cria o profile do usuario como `role = 'admin'` vinculado a empresa
- Aplica permissoes padrao
- Associa o plano escolhido (via `plano_id`) a empresa
- Redireciona para o Stripe Checkout com trial de 14 dias

### 4. Pagina de Sucesso pos-Checkout
Criar rota `/checkout-success` que:
- Confirma a assinatura via `check-subscription`
- Redireciona automaticamente para `/dashboard`
- Exibe mensagem de boas-vindas

### 5. Ajustes no Fluxo Existente
- Atualizar a landing page para incluir link "Comecar Gratis" que leva a `/registro`
- Atualizar a pagina de login para incluir link "Criar conta" 
- Tornar a rota `/planos` acessivel publicamente (mover para fora do ProtectedRoute)
- Atualizar o `TrialBanner` para incluir link para a pagina de planos/checkout

## Detalhes Tecnicos

### Arquivos a Criar
- `src/pages/Registro.tsx` - Formulario de auto-cadastro
- `supabase/functions/provision-new-account/index.ts` - Provisionamento automatico
- `src/pages/CheckoutSuccess.tsx` - Pagina pos-checkout

### Arquivos a Modificar
- `src/pages/LandingPage.tsx` - Adicionar secao de precos e CTAs de registro
- `src/pages/Auth.tsx` - Adicionar link "Criar conta"
- `src/App.tsx` - Adicionar rotas `/registro` e `/checkout-success`
- `supabase/config.toml` - Registrar nova edge function

### Migracao de Banco (se necessario)
- Verificar se a tabela `planos` ja tem os registros correspondentes aos planos Stripe
- Garantir que a tabela `empresas` aceita insercao sem campos obrigatorios bloqueantes

### Fluxo Completo do Usuario

```text
Landing Page
    |
    v
Clica "Comecar Teste Gratis" (em qualquer plano)
    |
    v
/registro?plano=starter
    |
    v
Preenche: Nome, Email, Senha, Empresa
    |
    v
Edge Function: provision-new-account
  - Cria usuario no auth
  - Cria empresa (trial, 14 dias)
  - Cria profile (admin)
  - Aplica permissoes
    |
    v
Redireciona para Stripe Checkout (trial 14 dias)
    |
    v
/checkout-success
    |
    v
/dashboard (com onboarding wizard)
```

### Seguranca
- A edge function `provision-new-account` usara `SUPABASE_SERVICE_ROLE_KEY` para criar os registros
- RLS das tabelas existentes continuara funcionando normalmente
- Cada empresa criada tera dados isolados (empresa_id)
- O `verify_jwt` sera `false` para a funcao de provisionamento (pois o usuario ainda nao esta autenticado no momento da criacao)
