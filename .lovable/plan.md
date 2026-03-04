

# Plano: Correções no Gap Analysis — Requisitos, Persistência e Acentuação

## 1. ISO 27001 — Verificação de Completude

O framework ISO/IEC 27001:2022 possui **117 requisitos** no banco, distribuídos assim:
- Cláusulas 4 a 10 (requisitos do SGSI): 24 itens (Contexto: 4, Liderança: 3, Planejamento: 4, Apoio: 5, Operação: 3, Avaliação: 3, Melhoria: 2)
- Anexo A (controles): 93 itens (Pessoas: 8, Físico: 14, Tecnologia: 34, Segurança: 37)

A ISO 27001:2022 especifica exatamente **24 cláusulas obrigatórias + 93 controles do Anexo A = 117 itens**. O framework **está completo**.

---

## 2. Perguntas Diagnósticas Sem Persistência

**Problema**: As respostas do "Diagnóstico Rápido" ficam apenas em `useState` e são resetadas para `{}` a cada abertura do dialog. Não são salvas no banco.

**Solução**: Persistir as respostas na tabela `gap_analysis_evaluations` usando um novo campo JSON `diagnostic_answers`.

| Arquivo | Ação |
|---------|------|
| Nova migration SQL | Adicionar coluna `diagnostic_answers jsonb DEFAULT null` em `gap_analysis_evaluations` |
| `NISTRequirementDetailDialog.tsx` | Carregar `diagnostic_answers` no `loadData()` e salvar no `handleSave()` |

---

## 3. Acentuação nos Relatórios PDF

**Problema**: Textos em português sem acentuação em múltiplos arquivos PDF. Exemplos: "Nao Conforme", "Declaracao", "Codigo", "Responsavel", "Sumario", "Relatorio", "organizacao", "atencao", etc.

A fonte Helvetica do jsPDF suporta caracteres acentuados — o problema são as strings hardcoded sem acento.

| Arquivo | Exemplos de correção |
|---------|---------------------|
| `SoAExportPDF.tsx` | `Nao Conforme` → `Não Conforme`, `Declaracao` → `Declaração`, `Codigo` → `Código`, `Responsavel` → `Responsável`, `Aplicaveis` → `Aplicáveis` |
| `ExportFrameworkPDF.tsx` | `Nao Conforme` → `Não Conforme`, `Nao Avaliado` → `Não Avaliado`, `Nivel` → `Nível`, `Codigo` → `Código` |
| `ExportBoardPDF.tsx` | `Relatorio Executivo` → `Relatório Executivo`, `Sumario` → `Sumário`, `Indice` → `Índice`, `Nao Conformes` → `Não Conformes`, `Distribuicao` → `Distribuição`, `Recomendacoes` → `Recomendações`, todo o texto do "parecer" e recomendações sem acento |
| `NISTRequirementDetailDialog.tsx` | `Diagnostico Rapido` → `Diagnóstico Rápido`, `sugestao automatica` → `sugestão automática`, `Nao Conforme` → `Não Conforme`, `aderencia` → `aderência`, `Nao` (botão) → `Não` |

**Total**: ~60 strings a corrigir em 4 arquivos.

---

## Resumo de Impacto

- **ISO 27001**: Nenhuma mudança necessária — já está completo
- **Diagnóstico**: 1 migration + alteração no dialog para carregar/salvar respostas
- **Acentuação**: Correção de strings em 4 arquivos de exportação PDF + 1 componente UI

