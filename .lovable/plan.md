

# Validacao e Melhorias do Modulo Gap Analysis — "Consultor Virtual de Certificacao"

## Diagnostico Atual

Apos varredura completa dos arquivos, o modulo ja possui uma base solida:
- Onboarding com roteiro especifico por framework (ISO, NIST, LGPD)
- Assistente IA por requisito (explicacao, evidencias, status sugerido)
- Dashboard de score com evolucao temporal
- Analise de documentos por IA (aderencia automatica)
- Plano de acao integrado por requisito nao-conforme
- Historico e exportacao PDF

**Porem, para substituir uma consultoria Big4, faltam elementos criticos de guia, contexto e acao que um usuario leigo precisaria:**

---

## Lacunas Identificadas

### 1. Falta um "Mapa de Progresso" visivel e motivacional
O usuario nao tem nocao clara de onde esta na jornada. O score existe mas nao ha um indicador visual tipo "etapa 1 de 5" ou "voce esta aqui". Sem isso, o leigo desiste.

### 2. Framework Detail: descripcao do framework esta ausente ou generica
Na pagina de detalhe (`GapAnalysisFrameworkDetail`), o `PageHeader` mostra apenas `"Avaliacao de conformidade {tipo}"` quando nao ha `descricao`. Nao contextualiza *por que* o usuario deveria se importar.

### 3. Onboarding nao explica os status de avaliacao
O usuario ve "Conforme / Parcial / Nao Conforme / N/A" na tabela mas nao sabe o que cada um significa no contexto do framework. Nenhum tooltip ou legenda.

### 4. Tab "Analise de Documentos" nao orienta o que enviar
O usuario leigo nao sabe *quais documentos* enviar. A aba abre direto o formulario sem contexto.

### 5. Quick Actions ausentes apos score calculado
Apos avaliar varios requisitos, nao ha um CTA claro tipo "Proximos passos recomendados" visivel no dashboard (o AI Recommendations so aparece apos avaliar, mas fica escondido abaixo dos graficos).

### 6. FrameworkCard (available) nao indica "por onde comecar"
Os cards de frameworks disponiveis mostram esforco mas nao indicam qual e mais relevante para o perfil da empresa.

---

## Plano de Implementacao

### Tarefa 1: Adicionar Barra de Progresso da Jornada no Framework Detail
**Arquivo**: `src/pages/GapAnalysisFrameworkDetail.tsx`
- Criar componente `JourneyProgressBar` com 4 etapas: Conhecer o Framework → Avaliar Requisitos → Tratar Gaps → Certificar
- Posicionar entre o PageHeader e as Tabs
- Calcular etapa automaticamente: 0 avaliados = etapa 1, <50% = etapa 2, >50% e com planos = etapa 3, >80% conforme = etapa 4
- Visual: barra horizontal com dots, label da etapa atual, e dica contextual

### Tarefa 2: Enriquecer descricoes e contexto dos frameworks
**Arquivos**: `src/components/gap-analysis/FrameworkOnboarding.tsx`, `src/pages/GapAnalysisFrameworkDetail.tsx`
- Adicionar ao Onboarding uma secao "Para quem e este framework?" e "O que voce ganha com a certificacao?" com textos especificos para ISO 27001, NIST, LGPD e generico
- No PageHeader do Detail, usar descricoes enriquecidas do FRAMEWORK_AUDIENCES quando `framework.descricao` estiver vazio

### Tarefa 3: Adicionar legenda de status com tooltips na tabela de requisitos
**Arquivo**: `src/components/gap-analysis/GenericRequirementsTable.tsx`
- Inserir acima da tabela uma legenda horizontal compacta com os 4 status e suas definicoes (tooltip ou popover)
- Ex: "Conforme = Voce ja atende 100% deste requisito e tem evidencias", "Parcial = Voce atende parcialmente mas falta documentacao ou processo"

### Tarefa 4: Adicionar orientacao contextual na aba "Analise de Documentos"
**Arquivo**: `src/components/gap-analysis/adherence/AdherenceAssessmentView.tsx`
- Antes da lista de assessments, adicionar um Card informativo explicando: "Envie documentos como politicas, procedimentos, registros ou relatorios. A IA analisa automaticamente a aderencia ao framework."
- Incluir exemplos de documentos por tipo de framework (ISO → Politica de Seguranca, RACI, Relatorio de Riscos; LGPD → Politica de Privacidade, ROPA, Termo de Consentimento)

### Tarefa 5: Reposicionar AI Recommendations para maior visibilidade
**Arquivo**: `src/pages/GapAnalysisFrameworkDetail.tsx`
- Mover o `AIRecommendationsCard` para ANTES dos graficos (logo apos o ScoreDashboard)
- Quando `evaluatedRequirements >= 5 && evaluatedRequirements < totalRequirements`, mostrar um banner motivacional: "Voce ja avaliou X requisitos! Gere recomendacoes da IA para priorizar os proximos passos."

### Tarefa 6: Adicionar "Guia Rapido" no WelcomeHero para usuarios novos
**Arquivo**: `src/components/gap-analysis/WelcomeHero.tsx`
- Adicionar abaixo da descricao uma secao "Como funciona?" com 3 passos visuais: 
  1. "Escolha um framework" 
  2. "Avalie cada requisito com ajuda da IA" 
  3. "Acompanhe seu progresso e trate os gaps"
- Manter conciso, com icones

---

## Arquivos afetados
1. `src/pages/GapAnalysisFrameworkDetail.tsx` — JourneyProgressBar + reorder AI card
2. `src/components/gap-analysis/FrameworkOnboarding.tsx` — secoes "Para quem" e "Beneficios"
3. `src/components/gap-analysis/GenericRequirementsTable.tsx` — legenda de status
4. `src/components/gap-analysis/adherence/AdherenceAssessmentView.tsx` — guia de documentos
5. `src/components/gap-analysis/WelcomeHero.tsx` — "Como funciona?"

