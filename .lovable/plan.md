
# Correcoes: Toast Duplicado, Modulos Seguranca/Privacidade e Gestao de Creditos IA

---

## 1. Corrigir Toast de Login Duplicado

### Problema
O toast "Login realizado com sucesso!" aparece duas vezes porque:
- `MFAVerification.tsx` linha 53: chama `toast.success('Verificacao concluida!')` ao verificar o codigo
- `Auth.tsx` linha 202 (`handleMFAVerified`): chama `toast.success('Login realizado com sucesso!')` logo em seguida
- Resultado: dois toasts aparecem quase simultaneamente

Nos fluxos sem MFA (MFA skipped, erro MFA, etc), o toast so aparece uma vez -- o problema e especificamente no fluxo MFA completo.

### Solucao

**A. Remover toast de dentro do `MFAVerification.tsx`** (linha 53)
- Remover `toast.success('Verificacao concluida!')` do `handleVerify`
- O componente pai (`Auth.tsx`) ja cuida de mostrar o toast correto apos `onVerified()`

Isso resolve o problema sem alterar a logica de autenticacao.

### Arquivo modificado:
- `src/components/MFAVerification.tsx` - Remover toast da linha 53

---

## 2. Validacao dos Modulos de Seguranca e Privacidade

### Analise Atual

**Seguranca** (menu lateral > Seguranca):
- Contas Privilegiadas: Gestao de contas com privilegios elevados -- funcional
- Revisao de Acessos: Campanhas de revisao periodica de acessos -- funcional
- Incidentes: Gestao de incidentes de seguranca -- funcional

**Privacidade** (menu lateral > Privacidade):
- Catalogo de Dados Pessoais, ROPA, Solicitacoes de Titulares, Descoberta de Dados -- funcional

**Compliance** (menu lateral > Compliance):
- Due Diligence, Denuncia, Politicas e Treinamentos

### Melhorias Identificadas

Nao ha problemas criticos para remover ou refazer. Os modulos estao funcionais e seguem o padrao visual. Porem, ha uma melhoria de integracao relevante:

**A. Vincular Incidentes de Privacidade ao modulo de Privacidade**
- Atualmente, incidentes do tipo `privacidade` ficam APENAS no modulo de Seguranca (Incidentes)
- O modulo de Privacidade nao mostra incidentes de privacidade/vazamento de dados
- Melhoria: adicionar um card de resumo ou aba no modulo de Privacidade mostrando a contagem de incidentes de privacidade com link direto para o modulo de Incidentes (filtrado)

**B. Adicionar Metricas LGPD no modulo de Privacidade**
- O modulo de Privacidade mostra stats basicas (total dados, sensiveis, ROPA, solicitacoes pendentes)
- Falta uma metrica critica: "Solicitacoes de Titulares dentro do prazo LGPD (15 dias)"
- Adicionar stat card mostrando quantas solicitacoes estao dentro/fora do prazo legal

### Arquivos modificados:
- `src/pages/Privacidade.tsx` - Adicionar stat card de prazo LGPD e card de incidentes de privacidade

---

## 3. Gestao de Creditos IA para Super Admin

### Analise Atual

O sistema de creditos IA JA EXISTE parcialmente:
- Tabela `creditos_consumo`: registra cada uso (empresa_id, user_id, funcionalidade, descricao, created_at)
- Funcao SQL `consume_ai_credit`: consome 1 credito e registra no historico
- `GerenciamentoEmpresas.tsx`: mostra barra de consumo (X/Y creditos) ao editar uma empresa
- `useCreditosIA.tsx`: hook para verificar creditos disponiveis
- `CreditsExhaustedDialog.tsx`: dialog quando creditos acabam

### Problema
Nao existe uma **visao consolidada** para o super_admin ver:
- Quanto cada empresa ja consumiu no total
- Quais funcionalidades consomem mais creditos
- Historico detalhado de uso por empresa
- Capacidade de **resetar** creditos de uma empresa (ex: inicio do mes)

### Solucao

**A. Criar componente `CreditosIAManager.tsx`** para super_admin:
- Tabela consolidada mostrando todas as empresas com:
  - Nome da empresa | Plano | Creditos consumidos | Franquia | % uso | Acoes
- Ao clicar numa empresa, expandir mostrando historico de uso (`creditos_consumo`) com:
  - Data | Usuario | Funcionalidade | Descricao
- Botao "Resetar Creditos" para zerar o contador de uma empresa (UPDATE empresas SET creditos_consumidos = 0)
- Stats cards no topo: Total empresas, Total creditos consumidos (todas empresas), Empresa que mais consumiu

**B. Adicionar aba "Creditos IA" nas Configuracoes** (somente super_admin):
- Nova `TabsTrigger` com icone `Brain` ou `Sparkles`
- Renderizar `CreditosIAManager` dentro da aba

### Arquivos modificados:
- `src/components/configuracoes/CreditosIAManager.tsx` (novo) - Componente de gestao de creditos
- `src/pages/Configuracoes.tsx` - Adicionar aba "Creditos IA" para super_admin

---

## Secao Tecnica - Resumo

| Arquivo | Tipo | Descricao |
|---------|------|-----------|
| `MFAVerification.tsx` | Frontend | Remover toast duplicado |
| `Privacidade.tsx` | Frontend | Stat card de prazo LGPD + resumo incidentes privacidade |
| `CreditosIAManager.tsx` | Frontend (novo) | Painel de gestao de creditos IA |
| `Configuracoes.tsx` | Frontend | Nova aba "Creditos IA" para super_admin |

### Ordem de implementacao:
1. Fix toast duplicado (MFAVerification)
2. Melhorias modulo Privacidade (metricas LGPD + incidentes)
3. Painel de Creditos IA para super_admin
