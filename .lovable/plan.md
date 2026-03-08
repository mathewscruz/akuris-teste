

# Validação Completa — Dashboard

## Componentes auditados

Dashboard.tsx, HeroScoreBanner, KPIPills, HealthScoreGauge, MultiDimensionalRadar, RiskScoreTimeline, UpcomingExpirations, RecentActivities, AlertsDetailDialog, AkurIAChatbot, ExecutiveSummaryAI, TrendIndicators, useDashboardStats, useRadarChartData, useAtivosStats.

---

## Problemas Identificados

### 1. SEGURANÇA — `useDashboardStats` sem filtro `empresa_id`

As 4 queries (riscos, denuncias, controles, incidentes) buscam dados de **todas as empresas**. É o mesmo tipo de vulnerabilidade corrigida no ReminderSettings. Embora o RLS possa mitigar, o hook não inclui `empresa_id` no `queryKey`, o que causa cache compartilhado incorreto.

**Correção**: Adicionar `empresa_id` via `useAuth()` como filtro em todas as queries e no `queryKey`.

### 2. SEGURANÇA — `useAtivosStats` sem filtro `empresa_id`

Mesmo problema: busca `ativos` sem `.eq('empresa_id', ...)`. Todos os outros hooks (controles, incidentes, riscos, denuncias, documentos) já filtram corretamente.

**Correção**: Adicionar `useEmpresaId()` ou `useAuth()` e filtrar por `empresa_id`.

### 3. COMPONENTE ÓRFÃO — `ExecutiveSummaryAI` não é usado em nenhum lugar

O componente existe completo (308 linhas) mas não é importado em nenhuma página. É uma feature funcional (resumo executivo com IA + export PDF) que deveria estar no Dashboard.

**Correção**: Adicionar o `ExecutiveSummaryAI` ao Dashboard, posicionado entre os KPIPills e os gráficos (é um CTA que o usuário clica sob demanda, não carrega automaticamente).

### 4. i18n INCOMPLETO — `HealthScoreGauge` com labels hardcoded em português

Labels "Sem dados", "Excelente", "Bom", "Atenção", "Crítico" e "Saúde Organizacional" estão hardcoded. Todos os outros componentes do dashboard já usam `useLanguage()`.

**Correção**: Adicionar `useLanguage()` e usar chaves i18n.

### 5. i18n INCOMPLETO — `AlertsDetailDialog` com textos hardcoded em português

Títulos, labels e mensagens: "Detalhamento de Alertas Críticos", "Riscos Altos", "Denúncias Pendentes", "Controles Vencendo (30 dias)", "Incidentes Críticos", "Ver todos", "Nenhum alerta crítico", etc.

**Correção**: Adicionar `useLanguage()` e usar chaves i18n.

### 6. i18n INCOMPLETO — `RecentActivities` com descrições hardcoded

Linhas 136, 156, 176, 196, 216: "Novo risco identificado", "Novo controle implementado", "Documento adicionado", "Nova auditoria iniciada", "Nova denúncia recebida" — todas hardcoded em português.

**Correção**: Usar `t()` para as descrições de atividades.

### 7. i18n INCOMPLETO — `MultiDimensionalRadar` tooltip com labels hardcoded

Linhas 48-52: "Excelente", "Bom", "Atenção", "Crítico" no tooltip customizado estão em português fixo.

**Correção**: Passar `t()` para o tooltip ou usar as chaves já existentes.

### 8. UX — Botão de refresh no header só recarrega `dashboardStats`, não todos os dados

O botão `RefreshCw` na linha 78 chama apenas `refetchDashboard()`. Mas o dashboard tem 7+ hooks independentes (ativos, controles, incidentes, contratos, documentos, gap, radar, trends). O usuário espera que "atualizar" atualize tudo.

**Correção**: Usar `queryClient.invalidateQueries()` com os prefixos relevantes para invalidar todos os caches do dashboard de uma vez.

---

## Resumo de Ações

| # | Problema | Tipo | Impacto |
|---|----------|------|---------|
| 1 | useDashboardStats sem empresa_id | Segurança | **Alto** |
| 2 | useAtivosStats sem empresa_id | Segurança | **Alto** |
| 3 | ExecutiveSummaryAI não utilizado | Feature órfã | **Médio** |
| 4 | HealthScoreGauge sem i18n | i18n | **Baixo** |
| 5 | AlertsDetailDialog sem i18n | i18n | **Baixo** |
| 6 | RecentActivities descrições hardcoded | i18n | **Baixo** |
| 7 | MultiDimensionalRadar tooltip hardcoded | i18n | **Baixo** |
| 8 | Refresh parcial | UX | **Médio** |

### Arquivos a editar:
- `src/hooks/useDashboardStats.tsx` — adicionar filtro empresa_id
- `src/hooks/useAtivosStats.tsx` — adicionar filtro empresa_id
- `src/pages/Dashboard.tsx` — adicionar ExecutiveSummaryAI + refresh global
- `src/components/dashboard/HealthScoreGauge.tsx` — i18n
- `src/components/dashboard/AlertsDetailDialog.tsx` — i18n
- `src/components/dashboard/RecentActivities.tsx` — i18n nas descrições
- `src/components/dashboard/MultiDimensionalRadar.tsx` — i18n no tooltip
- `src/i18n/pt.ts` e `src/i18n/en.ts` — adicionar chaves faltantes

