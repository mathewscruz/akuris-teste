
# Auditoria Completa do Modulo Gap Analysis

## 1. Componentes Orfaos (Codigo Morto)

Os seguintes arquivos existem no projeto mas **nao sao importados por nenhuma pagina ou componente**:

| Arquivo | Descricao |
|---------|-----------|
| `nist/NISTScoreDashboard.tsx` | Dashboard especifico NIST (substituido pelo GenericScoreDashboard) |
| `nist/NISTRadarChart.tsx` | Radar chart NIST (nao usado) |
| `nist/NISTPillarCard.tsx` | Card de pilar NIST (nao usado) |
| `nist/NISTRequirementsTable.tsx` | Tabela de requisitos NIST (substituida pela GenericRequirementsTable) |
| `nist/ExportNISTPDF.tsx` | Export PDF NIST (substituido pelo ExportFrameworkPDF) |
| `charts/ComplianceStackedBar.tsx` | Grafico de barras empilhadas (nao usado) |
| `charts/GovernanceGauge.tsx` | Gauge de governanca (nao usado) |
| `charts/ISOProgressFunnel.tsx` | Funnel PDCA ISO (nao usado) |
| `charts/FrameworkRadarChart.tsx` | Radar chart generico (nao usado) |
| `ColumnVisibilityManager.tsx` | Gerenciador de colunas (nao usado) |
| `FrameworkVisibilityDialog.tsx` | Dialog de visibilidade (nao usado) |
| `RequirementsManagerDialog.tsx` | Dialog gerenciador de requisitos (nao usado) |
| `pages/GapAnalysisAderencia.tsx` | Pagina de aderencia avulsa (rota redirecionada) |

**Acao**: Remover todos esses arquivos para reduzir complexidade e tamanho do bundle.

---

## 2. Bugs e Problemas Tecnicos

### 2.1 AreaBarChart importado mas nunca renderizado
O `AreaBarChart` e importado no `GapAnalysisFrameworkDetail.tsx` (linha 11) mas **nunca e renderizado no JSX**. E codigo morto no import.

### 2.2 Score nao atualiza em tempo real apos mudanca de status
No `GenericRequirementsTable.tsx`, quando o usuario muda o status de um requisito:
- Linha 167-170: O `calculateScore` usa o array `requirements` **antigo** (antes do `loadRequirements()` recarregar), entao o score salvo no historico esta sempre **1 avaliacao atrasado**.
- `handleScoreChange` na page (linha 168) e uma funcao vazia `() => {}` que nao faz nada -- o dashboard nao recarrega apos mudanca de status.

### 2.3 AdherenceResultView com cores hardcoded (ignora dark mode)
O `AdherenceResultView.tsx` usa cores fixas como `text-gray-900`, `bg-white`, `text-gray-700`, `bg-gray-50` que **quebram no dark mode**, ficando ilegivel.

### 2.4 getFrameworkConfig com deteccao imprecisa
O `getFrameworkConfig` detecta "NIST CSF" pelo nome, mas o framework no banco chama-se `"NIST CSF"` e nao `"NIST CSF 2.0"`. A deteccao funciona por `.includes('nist')`, mas a config retornada tem `id: 'nist-csf-2.0'` -- pode gerar inconsistencia se houver outros NIST.

### 2.5 ISO 27001 sections/domains nunca calculados
O `useFrameworkScore` sempre seta `setDomainScores([])` e `setSectionScores([])` (linhas 252-253), ignorando completamente a configuracao de `config.sections` e `config.domains` da ISO 27001. Os cards de "Aderencia por Secao" e "Aderencia por Dominio do Anexo A" no `GenericScoreDashboard` ficam sempre vazios.

### 2.6 Badge variant invalida
No `GenericScoreDashboard.tsx` linha 141: `variant={getScoreColor(overallScore, config) as any}` -- `getScoreColor` retorna strings como `"text-green-600"` que nao sao variants validas de Badge. Sempre cai no fallback.

---

## 3. Problemas de UX/Visual

### 3.1 Grid 2 colunas no dashboard quebra em telas menores
O `GenericScoreDashboard` usa `grid-cols-2` fixo (linha 121) sem responsividade. Em telas medias, os cards ficam espremidos.

### 3.2 Falta feedback visual de progresso geral na lista de frameworks
Ao entrar na listagem, os "Frameworks Ativos" mostram status blocks e score, mas nao ha uma **barra de progresso geral** mostrando quanto falta para completar a avaliacao de todos os frameworks.

### 3.3 Falta indicacao de "ultimo acesso" nos frameworks
O usuario nao sabe quando foi a ultima vez que avaliou um framework especifico.

### 3.4 Tabs de categorias com nomes longos causam overflow horizontal
No `GenericRequirementsTable`, as tabs de categoria com nomes longos (ex: "Estrategia de Gestao de Riscos da Cadeia de Suprimentos") causam overflow horizontal sem scroll visivel.

### 3.5 Falta confirmacao ao mudar status de um requisito
O dropdown de status muda imediatamente sem confirmacao -- um clique acidental pode alterar uma avaliacao importante.

---

## 4. Melhorias Recomendadas

### 4.1 Corrigir o refresh do dashboard apos mudanca de status
Trocar o `handleScoreChange = () => {}` por uma funcao que recarregue os scores do `useFrameworkScore` (adicionar uma key de dependencia ou funcao de refetch).

### 4.2 Calcular domainScores e sectionScores no useFrameworkScore
Usar a configuracao `config.sections` e `config.domains` para calcular scores por secao/dominio da ISO 27001, preenchendo os cards que hoje ficam vazios.

### 4.3 Corrigir cores do AdherenceResultView para dark mode
Substituir cores hardcoded por variaveis CSS do Tailwind (ex: `text-foreground`, `bg-card`, `bg-muted`).

### 4.4 Corrigir Badge variant no dashboard
Usar uma funcao propria que mapeia o score para uma variant valida (`success`, `warning`, `destructive`, `outline`).

### 4.5 Tornar o grid do dashboard responsivo
Mudar `grid-cols-2` para `grid-cols-1 lg:grid-cols-2` no score dashboard.

### 4.6 Limpar todos os componentes orfaos
Remover os 13 arquivos listados na secao 1.

### 4.7 Remover import nao usado do AreaBarChart
Limpar import sem uso no `GapAnalysisFrameworkDetail.tsx`.

---

## Resumo de Prioridades

| Prioridade | Item | Tipo |
|------------|------|------|
| Alta | Score nao atualiza apos mudanca de status (2.2) | Bug |
| Alta | ISO sections/domains nunca calculados (2.5) | Bug |
| Alta | Badge variant invalida (2.6) | Bug |
| Alta | AdherenceResultView quebra no dark mode (2.3) | Visual |
| Media | Grid nao responsivo no dashboard (3.1) | Visual |
| Media | Componentes orfaos (1) | Limpeza |
| Media | Import nao usado AreaBarChart (2.1) | Limpeza |
| Baixa | Falta confirmacao ao mudar status (3.5) | UX |
| Baixa | Tabs overflow com nomes longos (3.4) | Visual |
| Baixa | Indicacao de ultimo acesso (3.3) | UX |

---

## Plano de Implementacao

### Fase 1 -- Corrigir Bugs Criticos
1. Corrigir `handleScoreChange` para recarregar dados do dashboard
2. Implementar calculo de `sectionScores` e `domainScores` no `useFrameworkScore` usando `config.sections` e `config.domains`
3. Corrigir Badge variant no `GenericScoreDashboard`
4. Corrigir score history salvando com dados atualizados (pos-reload)

### Fase 2 -- Corrigir Visual
5. Substituir cores hardcoded no `AdherenceResultView` por variaveis CSS
6. Tornar grid do dashboard responsivo (`grid-cols-1 lg:grid-cols-2`)
7. Adicionar scroll horizontal nas tabs de categorias longas

### Fase 3 -- Limpeza
8. Remover os 13 arquivos orfaos
9. Remover import nao usado do `AreaBarChart`
10. Remover pagina `GapAnalysisAderencia.tsx` (ja redirecionada)

### Arquivos Afetados
- `src/hooks/useFrameworkScore.tsx` -- adicionar calculo de sections/domains
- `src/pages/GapAnalysisFrameworkDetail.tsx` -- corrigir handleScoreChange, remover import
- `src/components/gap-analysis/GenericScoreDashboard.tsx` -- corrigir badge, responsividade
- `src/components/gap-analysis/GenericRequirementsTable.tsx` -- corrigir ordem de calculo do score
- `src/components/gap-analysis/adherence/AdherenceResultView.tsx` -- corrigir dark mode
- 13 arquivos a remover (listados na secao 1)
