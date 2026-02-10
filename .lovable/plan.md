
# Troca de Conteudo dos Cards do Dashboard + Sistema de Idiomas (PT/EN)

## Parte 1: Trocar conteudo entre cards do Dashboard

### Situacao atual
- **Linha 3 do grid (xl:grid-cols-3):** `MultiDimensionalRadar` (Maturidade GRC) ocupa `xl:col-span-2` (2/3) + `UpcomingExpirations` (1/3)
- **Linha 4 do grid (xl:grid-cols-3):** `ExecutiveSummaryAI` (1/3) + `RiskScoreTimeline` (1/3) + `RecentActivities` (1/3)

### Problema
O grafico radar de Maturidade GRC e muito grande para o card de 2/3 e o Resumo Executivo IA esta comprimido em 1/3.

### Solucao
- Mover `MultiDimensionalRadar` para a posicao do `ExecutiveSummaryAI` (1/3 da linha 4)
- Mover `ExecutiveSummaryAI` para a posicao do `MultiDimensionalRadar` (2/3 da linha 3)
- Renomear "Resumo Executivo IA" para "Resumo" em todos os estados do componente (inicial, loading, resultado, PDF)
- Reduzir a altura do radar chart de 400px para ~280px para caber no card menor

### Arquivos modificados
- `src/pages/Dashboard.tsx` -- trocar posicao dos componentes no grid
- `src/components/dashboard/ExecutiveSummaryAI.tsx` -- renomear titulo para "Resumo"
- `src/components/dashboard/MultiDimensionalRadar.tsx` -- ajustar altura do chart para card menor

---

## Parte 2: Sistema de Idiomas (Portugues/Ingles)

### Abordagem
Criar um sistema de internacionalizacao (i18n) leve e sem dependencias externas, usando React Context + dicionarios de traducao. O usuario seleciona o idioma no perfil/header.

### Arquitetura

**Novo contexto:** `src/contexts/LanguageContext.tsx`
- Provider com estado `locale: 'pt' | 'en'`
- Persiste no `localStorage`
- Exporta hook `useLanguage()` que retorna `{ t, locale, setLocale }`
- Funcao `t(key)` busca traducao no dicionario ativo

**Dicionarios:** `src/i18n/pt.ts` e `src/i18n/en.ts`
- Contem todas as strings do sistema organizadas por modulo
- Chaves como `dashboard.title`, `sidebar.riscos`, `common.save`, etc.
- Comecar com as strings principais: sidebar, header, dashboard, dialogs comuns, botoes

**Seletor de idioma:** Adicionado ao header (ao lado do ChangelogPopover) como um botao com bandeira/sigla (PT | EN)

### Escopo das traducoes (primeira entrega)
- Sidebar completo (todos os menus e submenus)
- Header (breadcrumbs ficam dinamicos)
- Dashboard (titulos, labels, KPI pills, hero banner)
- Botoes comuns (Salvar, Cancelar, Excluir, Editar, Novo, Exportar)
- Estados vazios e loading
- Componentes de UI (DataTable headers, filtros)

### Arquivos criados
- `src/contexts/LanguageContext.tsx` -- Context + Provider + hook
- `src/i18n/pt.ts` -- dicionario portugues
- `src/i18n/en.ts` -- dicionario ingles
- `src/components/LanguageSelector.tsx` -- botao toggle PT/EN

### Arquivos modificados
- `src/main.tsx` -- envolver app com LanguageProvider
- `src/components/Layout.tsx` -- adicionar LanguageSelector no header
- `src/components/AppSidebar.tsx` -- usar `t()` nos labels do menu
- `src/pages/Dashboard.tsx` -- usar `t()` nos titulos e labels
- `src/components/dashboard/HeroScoreBanner.tsx` -- usar `t()`
- `src/components/dashboard/KPIPills.tsx` -- usar `t()`
- `src/components/dashboard/ExecutiveSummaryAI.tsx` -- usar `t()`
- `src/components/dashboard/MultiDimensionalRadar.tsx` -- usar `t()`
- `src/components/dashboard/UpcomingExpirations.tsx` -- usar `t()`
- `src/components/dashboard/RecentActivities.tsx` -- usar `t()`
- `src/components/dashboard/RiskScoreTimeline.tsx` -- usar `t()`

### Detalhes tecnicos
- Sem bibliotecas externas (react-i18next, etc.) -- o sistema e simples o suficiente para um Context nativo
- Persistencia via `localStorage.getItem('governaii-locale')`
- Fallback para 'pt' se nao houver preferencia salva
- Os modulos internos (Riscos, Controles, etc.) serao traduzidos incrementalmente em etapas futuras -- nesta primeira entrega o foco e sidebar + dashboard + componentes comuns
