
# Melhorias: MFA Inteligente, Analise de Documentos e UX do Gap Analysis

---

## 1. MFA com Bypass por Dia (Skip se ja verificou hoje)

### Problema
O usuario precisa digitar o codigo MFA toda vez que faz login, mesmo se ja verificou no mesmo dia.

### Solucao

**A. Nova tabela `mfa_sessions`** (migracao SQL)
```sql
CREATE TABLE mfa_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  verified_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),
  ip_hint text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_mfa_sessions_user ON mfa_sessions(user_id, expires_at);
ALTER TABLE mfa_sessions ENABLE ROW LEVEL SECURITY;
-- Politica: apenas service role acessa (edge functions)
```

**B. Edge function `send-mfa-code`**: antes de gerar o codigo, verificar se existe uma `mfa_sessions` valida (nao expirada) para o `user_id`. Se sim, retornar `{ success: true, skipped: true }`.

**C. Edge function `verify-mfa-code`**: apos verificacao bem-sucedida, inserir registro em `mfa_sessions` com `expires_at = now() + 24h`.

**D. Frontend `Auth.tsx`**: quando `send-mfa-code` retornar `skipped: true`, pular a tela MFA e autenticar diretamente (re-logar com as credenciais salvas).

### Arquivos modificados:
- Migracao SQL (nova tabela `mfa_sessions`)
- `supabase/functions/send-mfa-code/index.ts`
- `supabase/functions/verify-mfa-code/index.ts`
- `src/pages/Auth.tsx`

---

## 2. Analise de Documentos com Comparacao Real ao Framework

### Problema
A edge function `analyze-document-adherence` so aceita `.txt` (linha 112: `throw new Error` para qualquer outro tipo). O texto e extraido no frontend e enviado como TXT ao storage, mas a edge function verifica a extensao do arquivo no storage e rejeita tudo que nao e `.txt`. Na pratica isso funciona porque o frontend ja converte para TXT antes de enviar. Porem o prompt da IA nao inclui o **conteudo completo dos requisitos** do framework -- so envia codigo + titulo + 80 chars da descricao. Isso impede a IA de fazer uma comparacao profunda como um auditor faria.

### Solucao

**A. Incluir descricao completa dos requisitos no prompt** (`analyze-document-adherence/index.ts`)
- Mudar de `r.descricao.substring(0, 80)` para `r.descricao.substring(0, 300)`
- Incluir campos adicionais dos requisitos: `orientacao_implementacao` e `exemplos_evidencias` (se existirem) para que a IA saiba exatamente o que a norma exige
- Reformular o prompt para instruir a IA a agir como auditor comparando item a item

**B. Melhorar o prompt para comparacao auditor-like**
- Instrucao explicita: "Para cada requisito, identifique no documento se existe uma clausula, paragrafo ou secao que atende ao que o requisito exige"
- Pedir que a IA cite trechos especificos do documento como evidencia
- Adicionar contexto: "Se o documento e uma Politica de Mesa e Tela Limpa, localize no framework os requisitos que tratam deste tema e avalie se a politica cobre todos os pontos exigidos"

**C. Aumentar limite de tokens e texto**
- Documento: 20.000 -> 30.000 caracteres
- Requisitos: enviar descricao com ate 300 chars (ao inves de 80)
- `max_completion_tokens`: 16.000 -> 20.000

### Arquivos modificados:
- `supabase/functions/analyze-document-adherence/index.ts`

---

## 3. Melhorar Intuitividade do Gap Analysis

### Problemas identificados apos analise do codigo:

1. **Analise de Documentos esta FORA do contexto do framework** -- a aba "Analise de Documentos" no `GapAnalysisFrameworkDetail.tsx` nao filtra pelo framework atual. O `AdherenceAssessmentView` carrega TODAS as analises da empresa (sem filtro de `framework_id`). Isso confunde o usuario que acha que esta analisando documentos para aquele framework especifico.

2. **Nao ha guia de "proximo passo"** -- quando o usuario entra num framework, nao ha indicacao visual do que fazer primeiro (avaliar requisitos, analisar documentos, etc.)

3. **Os requisitos nao tem orientacao clara** -- o campo `orientacao_implementacao` e `exemplos_evidencias` existem na tabela mas podem estar vazios para muitos requisitos

### Solucao

**A. Filtrar analises de documentos pelo framework atual**
- No `AdherenceAssessmentView`, receber `frameworkId` como prop
- Filtrar a query de assessments por `framework_id`
- No dialog de criacao, pre-selecionar o framework atual e tornar o campo somente-leitura

**B. Adicionar dicas contextuais no framework detail**
- Quando o usuario nunca avaliou nenhum requisito, mostrar um banner de orientacao: "Comece avaliando os requisitos abaixo. Clique em cada requisito para ver detalhes e marcar o status de conformidade."
- Na aba de documentos, mostrar dica: "Faca upload de politicas, procedimentos ou manuais da sua empresa para que a IA compare automaticamente com os requisitos deste framework."

**C. Melhorar score dashboard para usuarios iniciantes**
- Quando `evaluatedRequirements === 0`, mostrar texto explicativo ao inves de "0.0%" para nao assustar

### Arquivos modificados:
- `src/pages/GapAnalysisFrameworkDetail.tsx` - Passar `frameworkId` para `AdherenceAssessmentView`
- `src/components/gap-analysis/adherence/AdherenceAssessmentView.tsx` - Filtrar por framework
- `src/components/gap-analysis/adherence/AdherenceAssessmentDialog.tsx` - Pre-selecionar framework
- `src/components/gap-analysis/GenericScoreDashboard.tsx` - Dicas para score zero

---

## Secao Tecnica - Resumo

| Arquivo | Tipo | Descricao |
|---------|------|-----------|
| Migracao SQL | DB | Criar tabela `mfa_sessions` |
| `send-mfa-code/index.ts` | Edge Function | Verificar sessao MFA antes de enviar codigo |
| `verify-mfa-code/index.ts` | Edge Function | Criar sessao MFA apos verificacao |
| `Auth.tsx` | Frontend | Tratar resposta `skipped: true` |
| `analyze-document-adherence/index.ts` | Edge Function | Incluir descricao completa dos requisitos no prompt |
| `GapAnalysisFrameworkDetail.tsx` | Frontend | Passar frameworkId, banners de orientacao |
| `AdherenceAssessmentView.tsx` | Frontend | Filtrar por frameworkId |
| `AdherenceAssessmentDialog.tsx` | Frontend | Pre-selecionar framework |
| `GenericScoreDashboard.tsx` | Frontend | Dicas para score zero |

### Ordem de implementacao:
1. Migracao SQL (tabela `mfa_sessions`)
2. Edge functions MFA (send + verify)
3. Frontend Auth.tsx (skip MFA)
4. Edge function analise de documentos (prompt melhorado)
5. Frontend Gap Analysis (filtros + UX)
