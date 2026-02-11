
# Plano: Adicionar Plano Free (14 dias) + 3 Planos Pagos na Landing Page

## Resumo

Adicionar um quarto card de plano "Free" na landing page que oferece 14 dias gratuitos com os mesmos recursos do Starter. Os 3 planos pagos (Starter, Professional, Enterprise) continuam como estao. O plano Free nao passa pelo Stripe Checkout -- apenas cria a conta com status trial. Apos 14 dias, o acesso e cortado automaticamente (ja funciona via `check_trial_expiration`).

## Alteracoes

### 1. `src/lib/stripe-plans.ts`
- Adicionar entrada `free` no mapa de planos com preco 0, sem `product_id` nem `price_id`, mesmas features do Starter, e flag `isFree: true`
- Atualizar o tipo `PlanKey` para incluir `'free'`

### 2. `src/pages/LandingPage.tsx` (secao de precos)
- Mudar o grid de 3 para 4 colunas (`md:grid-cols-2 lg:grid-cols-4`)
- Adicionar o card "Free" como primeiro, exibindo "R$ 0" e "14 dias", com botao "Comecar gratis" apontando para `/registro?plano=free`
- Atualizar textos dos botoes dos planos pagos de "Comecar teste gratis" para "Assinar agora" (ja que o Free e o unico gratuito)

### 3. `supabase/functions/provision-new-account/index.ts`
- Quando `plano_codigo === 'free'`: criar usuario, empresa (com `status_licenca = 'trial'`) e profile normalmente, mas **pular** a criacao do Stripe Checkout
- Retornar `{ success: true }` sem `checkout_url`, para que o frontend faca login e redirecione direto ao dashboard

### 4. `src/pages/Registro.tsx`
- Quando o plano e `free`: apos provisionar, fazer login automatico e redirecionar direto para `/dashboard` (sem Stripe)
- Atualizar o texto do botao para "Criar conta gratis" quando plano for free, e "Criar conta e assinar" para os demais

### 5. `src/components/TrialBanner.tsx`
- Adicionar um botao/link "Ver planos" que leva para `/planos` ou para a landing page secao de precos, incentivando o usuario a migrar antes do trial expirar

## Fluxo do Usuario

```text
Plano Free:
  Landing -> /registro?plano=free -> provision (sem Stripe) -> login -> /dashboard
  Apos 14 dias sem assinar -> acesso cortado automaticamente

Planos Pagos:
  Landing -> /registro?plano=starter -> provision + Stripe Checkout (trial 14 dias) -> /checkout-success -> /dashboard
```

## Detalhes Tecnicos

- O plano Free usa o mesmo `plano_id` do Starter no banco (`45d5976f-bc3a-4f0d-ad7c-d6e83e07daf2`) para herdar os mesmos recursos
- A logica de expiracao do trial (14 dias) ja existe via function SQL `check_trial_expiration` e edge function `check-trial-expiration`
- Nenhuma migracao de banco de dados necessaria
- Nenhuma nova edge function necessaria
