
# Correcoes: Analise de Documentos, Chat IA e Padronizacao de Frameworks

---

## 1. Corrigir Analise de Documentos (PDF) no Gap Analysis

### Problema
- O `pdfjs-dist` versao 5.4.394 nao carrega o worker corretamente (erro no console: `Failed to fetch dynamically imported module: pdf.worker.min.js`)
- Alem disso, a coluna `justificativa_relevancia` nao existe na tabela `gap_analysis_adherence_details`, causando erro ao salvar os detalhes da analise (visivel nos logs da edge function)

### Solucao

**A. Corrigir worker do PDF.js** (`src/components/gap-analysis/adherence/AdherenceAssessmentDialog.tsx`)
- Trocar a URL do worker de CDN para usar import inline via Vite (`new URL` pattern) ou fixar a versao do CDN para uma compativel
- Alternativa mais robusta: usar `pdfjs-dist/build/pdf.worker.min.mjs` como import e configurar via Vite worker

**B. Adicionar coluna na tabela** (migracao SQL)
```sql
ALTER TABLE gap_analysis_adherence_details
ADD COLUMN justificativa_relevancia text;
```

**C. Melhorar qualidade da analise** (`supabase/functions/analyze-document-adherence/index.ts`)
- Trocar modelo de `google/gemini-2.5-flash` para `google/gemini-3-flash-preview` (mais recente e melhor)
- Aumentar o limite de texto do documento de 12.000 para 20.000 caracteres
- Aumentar limite de requisitos analisados de 40 para 60
- Melhorar o prompt com instrucoes mais detalhadas para avaliacao de conformidade
- Aumentar `max_completion_tokens` de 12.000 para 16.000

### Arquivos modificados:
- `src/components/gap-analysis/adherence/AdherenceAssessmentDialog.tsx` - Fix PDF worker
- `supabase/functions/analyze-document-adherence/index.ts` - Modelo melhor, prompt refinado, limites maiores
- Migracao SQL - Adicionar coluna `justificativa_relevancia`

---

## 2. Corrigir Chat AkurIA - Dados Faltantes

### Problema
O chat da AkurIA nao busca dados de varios modulos importantes:
- **Ativos** - Nao consulta a tabela `ativos`
- **Contas Privilegiadas** - Nao consulta `contas_privilegiadas`
- **Dados Pessoais** - Nao consulta `dados_pessoais`
- **Politicas** - Nao consulta `politicas`
- **Planos de Acao** - Nao consulta `planos_acao`
- **Fornecedores** - Nao consulta `fornecedores`

Alem disso, o contexto so envia contagens resumidas. Quando o usuario pergunta "quais sao meus ativos?", a IA nao tem os nomes individuais para responder.

### Solucao (`supabase/functions/akuria-chat/index.ts`)

**A. Adicionar consultas para modulos faltantes:**
- `ativos`: `id, nome, tipo, criticidade, status`
- `contas_privilegiadas`: `id, nome_conta, tipo_conta, criticidade, status`
- `dados_pessoais`: `id, nome, categoria_dados, sensibilidade`
- `politicas`: `id, titulo, status, data_publicacao`
- `planos_acao`: `id, titulo, status, prioridade`
- `fornecedores`: `id, nome, status, categoria`

**B. Incluir nomes individuais no contexto** (nao apenas contagens)
- Para cada modulo, listar os nomes dos primeiros 15 itens para que a IA possa responder "quais sao meus X?"
- Manter contagens para visao geral

**C. Trocar modelo para `google/gemini-3-flash-preview`** (mais recente)

### Arquivos modificados:
- `supabase/functions/akuria-chat/index.ts` - Adicionar consultas e melhorar contexto

---

## 3. Padronizar Visualizacao dos Frameworks

### Problema
Cada tipo de framework usa um grafico diferente:
- LGPD/GDPR/CCPA/HIPAA/27701 usam `treemap` (Mapa de Conformidade)
- NIST/CIS usam `radar`
- ISO 27001 usa `funnel`
- COBIT/COSO/ISO 31000 usam `gauge`
- SOC 2/SOX/PCI/ITIL/NIS2 usam `stacked`

O usuario quer que TODOS usem o **Mapa de Conformidade** (treemap) como grafico principal, padronizando a experiencia.

### Solucao (`src/lib/framework-configs.ts` + `src/pages/GapAnalysisFrameworkDetail.tsx`)

**A. Padronizar `chartType` para `treemap` em todos os frameworks** no `framework-configs.ts`
- Manter `treemap` como tipo de grafico padrao para todos
- O `PrivacyTreemap` funciona com qualquer framework pois usa `categoryScores` que todos possuem

**B. Simplificar logica de renderizacao** no `GapAnalysisFrameworkDetail.tsx`
- Remover os blocos condicionais de `chartType` (radar, funnel, gauge, stacked)
- Usar um bloco unico que sempre renderiza o `PrivacyTreemap` (renomeado para `ConformityMap`) + `CategoryBarChart` como secundario
- Manter o `CategoryStatusCards` e `GenericRequirementsTable` para todos

**C. Renomear componente** de `PrivacyTreemap` para `ConformityMap` (titulo ja e "Mapa de Conformidade por Capitulo")

### Arquivos modificados:
- `src/lib/framework-configs.ts` - Padronizar chartType para treemap
- `src/pages/GapAnalysisFrameworkDetail.tsx` - Simplificar blocos de graficos
- `src/components/gap-analysis/charts/PrivacyTreemap.tsx` - Renomear export (opcional)

---

## Secao Tecnica - Resumo de Mudancas

| Arquivo | Tipo | Descricao |
|---------|------|-----------|
| Migracao SQL | DB | Adicionar coluna `justificativa_relevancia` |
| `AdherenceAssessmentDialog.tsx` | Frontend | Fix PDF.js worker URL |
| `analyze-document-adherence/index.ts` | Edge Function | Modelo melhor, prompt melhorado, limites maiores |
| `akuria-chat/index.ts` | Edge Function | Adicionar 6 modulos faltantes com nomes individuais |
| `framework-configs.ts` | Frontend | Padronizar chartType = treemap |
| `GapAnalysisFrameworkDetail.tsx` | Frontend | Simplificar renderizacao de graficos |

### Ordem de implementacao:
1. Migracao SQL (coluna `justificativa_relevancia`)
2. Fix PDF worker + edge function de aderencia
3. Corrigir edge function do chat
4. Padronizar frameworks e graficos
