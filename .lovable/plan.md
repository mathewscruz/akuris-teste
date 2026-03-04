

# Plano: Gap Analysis — Elevação ao Nível Big4

## Diagnóstico Atual

O módulo já possui uma base sólida: frameworks globais com requisitos, avaliação manual com status por requisito, análise de aderência por IA (upload de documentos), assistente IA por requisito, plano de ação integrado, evidências (upload + links), vinculação com riscos, histórico de score, export PDF, e jornada de certificação. Isso cobre ~65% do que uma consultoria Big4 entrega. Os 35% restantes são funcionalidades que diferenciam uma ferramenta profissional de um checklist avançado.

## Gaps Identificados vs Big4

### 1. Avaliação em Lote (Bulk Assessment)
**Problema**: Hoje o usuário precisa clicar requisito por requisito para mudar status. Com frameworks de 100+ requisitos (ISO 27001 tem 117), isso é improdutivo.
**Solução**: Adicionar checkboxes na tabela de requisitos + barra de ação flutuante para aplicar status em lote ("Marcar 15 selecionados como Conforme").

### 2. Statement of Applicability (SoA) — ISO 27001
**Problema**: Toda certificação ISO 27001 exige um SoA (documento que lista cada controle do Anexo A, se é aplicável, justificativa, e status). O sistema não gera esse artefato.
**Solução**: Botão "Gerar SoA" que exporta um PDF/tabela com: código do controle, título, aplicável (sim/não), justificativa de exclusão (se N/A), status atual, e evidência vinculada.

### 3. Relatório Executivo de Conformidade
**Problema**: O PDF exportado atual é técnico (lista todos os requisitos). Big4s entregam relatórios executivos com: resumo gerencial, gráficos de maturidade, top risks, roadmap recomendado.
**Solução**: Novo template de PDF "Relatório Executivo" com: sumário executivo (gerado por IA), gráfico de maturidade por domínio, top 10 gaps prioritários, e recomendações estratégicas.

### 4. Painel de Remediação (Remediation Tracker)
**Problema**: Quando um requisito é marcado como "Não Conforme" e gera um plano de ação, não há visão consolidada dos planos de ação por framework. O usuário precisa ir ao módulo de Planos de Ação e não consegue filtrar por framework.
**Solução**: Nova aba "Remediação" no detalhe do framework, mostrando todos os planos de ação vinculados a requisitos desse framework, com status, prazo, responsável.

### 5. Comparação Cross-Framework
**Problema**: Muitos controles se repetem entre frameworks (ISO 27001 A.5.1 ↔ NIST GV.PO). Não há mapeamento cruzado para evitar trabalho duplicado.
**Solução**: Na tela de frameworks, adicionar card "Cobertura Cruzada" mostrando quantos % dos requisitos de um framework já são cobertos por avaliações de outro. Isso requer uma tabela de mapeamento (`gap_analysis_requirement_mappings`).

### 6. Notificações de Prazo
**Problema**: Requisitos com `prazo_implementacao` não geram alertas quando vencem. O usuário não é avisado.
**Solução**: Adicionar lógica ao `daily-reminder-processor` para verificar prazos de implementação de gap analysis e criar notificações no sino do header.

### 7. Modelo de Maturidade (Maturity Model)
**Problema**: Big4s classificam a organização em níveis de maturidade (ex: CMMI 1-5, ou Inicial/Gerenciado/Definido/Otimizado). O sistema mostra apenas % de conformidade.
**Solução**: Adicionar badge de maturidade no dashboard baseado no score: Nível 1 (0-20%), Nível 2 (20-40%), Nível 3 (40-60%), Nível 4 (60-80%), Nível 5 (80-100%). Mostrar no ScoreDashboard e no PDF.

### 8. Trilha de Auditoria (Audit Trail)
**Problema**: Não há registro de quem mudou o status de um requisito, quando, e de qual valor para qual. Isso é essencial para auditoria externa.
**Solução**: Criar tabela `gap_analysis_audit_log` e trigger na `gap_analysis_evaluations` para registrar mudanças de `conformity_status`. Mostrar timeline no dialog de detalhe do requisito.

## Priorização (Impacto x Esforço)

| # | Feature | Impacto | Esforço | Prioridade |
|---|---------|---------|---------|------------|
| 1 | Avaliação em Lote | Alto | Médio | P1 |
| 2 | Painel de Remediação | Alto | Médio | P1 |
| 3 | Modelo de Maturidade | Alto | Baixo | P1 |
| 4 | Notificações de Prazo | Alto | Baixo | P1 |
| 5 | Trilha de Auditoria | Alto | Médio | P1 |
| 6 | Relatório Executivo | Alto | Alto | P2 |
| 7 | Statement of Applicability | Médio | Médio | P2 |
| 8 | Comparação Cross-Framework | Médio | Alto | P3 |

## Implementação Proposta (P1 - Impacto Imediato)

### A. Avaliação em Lote
- Adicionar state `selectedRequirements: Set<string>` no `GenericRequirementsTable`
- Checkbox na primeira coluna de cada row + "Selecionar Todos"
- Barra flutuante no bottom quando há seleção: "X selecionados → [Conforme] [Parcial] [N/C] [N/A]"
- `handleBulkStatusChange(ids: string[], status: string)` faz upsert em batch

### B. Painel de Remediação
- Nova aba "Remediação" no `GapAnalysisFrameworkDetail`
- Query: `planos_acao` WHERE `id IN (SELECT plano_acao_id FROM gap_analysis_evaluations WHERE framework_id = X AND empresa_id = Y)`
- Cards com: título do plano, requisito vinculado, status, prazo, responsável
- Indicador de "X planos pendentes / Y em andamento / Z concluídos"

### C. Modelo de Maturidade
- Função `getMaturityLevel(score, config)` em `framework-configs.ts`
- Badge visual no `GenericScoreDashboard` ao lado do score
- Incluir no PDF exportado

### D. Notificações de Prazo
- Adicionar query no `daily-reminder-processor` para `gap_analysis_evaluations` com `prazo_implementacao` próximo (7 dias, vencido)
- Inserir em `notifications` com link para `/gap-analysis/framework/:id`

### E. Trilha de Auditoria
- Migration: criar `gap_analysis_audit_log` (evaluation_id, campo_alterado, valor_anterior, valor_novo, user_id, created_at)
- Trigger on UPDATE da `gap_analysis_evaluations` quando `conformity_status` muda
- No `NISTRequirementDetailDialog`: seção "Histórico de Alterações" com timeline

## Arquivos Afetados

| Arquivo | Mudança |
|---------|---------|
| `src/components/gap-analysis/GenericRequirementsTable.tsx` | Checkboxes + barra de ação em lote |
| `src/pages/GapAnalysisFrameworkDetail.tsx` | Nova aba "Remediação" |
| `src/components/gap-analysis/RemediationTab.tsx` | Novo componente |
| `src/lib/framework-configs.ts` | Função `getMaturityLevel()` |
| `src/components/gap-analysis/GenericScoreDashboard.tsx` | Badge de maturidade |
| `src/components/gap-analysis/ExportFrameworkPDF.tsx` | Nível de maturidade no PDF |
| `src/components/gap-analysis/nist/NISTRequirementDetailDialog.tsx` | Seção de histórico/auditoria |
| `supabase/functions/daily-reminder-processor/index.ts` | Query de prazos gap analysis |
| Migration SQL | Tabela `gap_analysis_audit_log` + trigger |

