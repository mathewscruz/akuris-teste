
# Plano Completo de Melhorias do Modulo de Gestao de Riscos

## Visao Geral

Implementar todas as melhorias identificadas na analise do modulo de riscos para torna-lo completo e alinhado com ISO 31000 / COSO. Sao 6 frentes de trabalho.

---

## 1. Matriz de Risco Visual na Pagina Principal

**Problema:** O componente `MatrizVisualizacao` ja existe mas nao e exibido na pagina `Riscos.tsx`.

**Solucao:** Importar e renderizar o componente entre os KPI cards e a tabela de dados. Adicionar layout responsivo com a matriz ao lado dos KPIs ou abaixo deles.

**Arquivo:** `src/pages/Riscos.tsx`
- Importar `MatrizVisualizacao` de `@/components/riscos/MatrizVisualizacao`
- Renderizar apos os StatCards, em grid 2 colunas (KPIs + Matriz lado a lado em desktop)

---

## 2. Historico de Reavaliacoes de Risco

**Problema:** Nao existe registro historico das avaliacoes. Quando o gestor reavalia um risco, o valor anterior e perdido.

**Solucao:**

### 2a. Criar tabela `riscos_historico_avaliacoes`
Nova tabela no banco com migration:
```text
- id (uuid, PK)
- risco_id (uuid, FK -> riscos)
- empresa_id (uuid, FK -> empresas)
- probabilidade (text)
- impacto (text)
- nivel_risco (text)
- tipo (text: 'inicial' ou 'residual')
- avaliado_por (uuid)
- observacoes (text, nullable)
- created_at (timestamptz)
```
RLS: Apenas usuarios da mesma empresa podem ver/inserir.

### 2b. Registrar historico no submit do formulario
**Arquivo:** `src/components/riscos/RiscoFormWizard.tsx`
- No `onSubmit`, apos salvar o risco, inserir registro em `riscos_historico_avaliacoes` com os valores atuais
- Comparar com valores anteriores para registrar somente se houve mudanca

### 2c. Componente de Timeline de Reavaliacoes
**Novo arquivo:** `src/components/riscos/HistoricoAvaliacoesDialog.tsx`
- Dialog com timeline visual mostrando evolucao do nivel de risco ao longo do tempo
- Exibir data, avaliador, nivel anterior vs novo, observacoes
- Acessivel via botao na tabela de riscos (nova coluna ou dentro das acoes)

---

## 3. Campo "Data Proxima Revisao" e Alertas

**Problema:** Nao ha campo para agendar proxima revisao nem alertas de riscos vencidos.

**Solucao:**

### 3a. Adicionar coluna na tabela `riscos`
Migration: `ALTER TABLE riscos ADD COLUMN data_proxima_revisao date;`

### 3b. Campo no formulario
**Arquivo:** `src/components/riscos/RiscoFormWizard.tsx`
- Adicionar campo `data_proxima_revisao` ao schema Zod e ao formulario (date picker)
- Posicionar na secao "Detalhes"

### 3c. Coluna na tabela e indicador visual
**Arquivo:** `src/pages/Riscos.tsx`
- Nova coluna "Proxima Revisao" com badge vermelho se vencida, amarelo se proxima (7 dias)

### 3d. Notificacoes automaticas
**Arquivo:** `src/components/NotificationCenter.tsx`
- Adicionar query de riscos com `data_proxima_revisao` vencida ou proxima do vencimento
- Gerar notificacoes automaticas no sino do header (seguindo padrao existente)

---

## 4. Trilha de Auditoria para Riscos

**Problema:** Os modulos de Documentos e Ativos possuem trilha de auditoria, mas Riscos nao.

**Solucao:** A tabela `audit_logs` ja existe com campos `table_name`, `record_id`, `action`, `old_values`, `new_values`. Basta criar o componente de exibicao e o trigger de registro.

### 4a. Trigger de auditoria
Migration: Criar trigger `audit_riscos_changes` na tabela `riscos` que insere em `audit_logs` a cada INSERT/UPDATE/DELETE (similar ao que ja existe para documentos).

### 4b. Componente de Trilha
**Novo arquivo:** `src/components/riscos/TrilhaAuditoriaRiscos.tsx`
- Baseado no padrao de `TrilhaAuditoriaDocumentos.tsx`
- Dialog com ScrollArea listando todas as mudancas do risco
- Exibir acao, usuario, data, campos alterados com comparacao old/new
- Traduzir nomes de campos para portugues

### 4c. Botao de acesso
**Arquivo:** `src/pages/Riscos.tsx`
- Adicionar botao "Historico" nas acoes de cada risco (icone History)

---

## 5. Workflow de Aprovacao de Riscos

**Problema:** As colunas `status_aprovacao`, `aprovador_id`, `data_aprovacao`, `comentarios_aprovacao`, `historico_aprovacao` ja existem na tabela mas nao sao usadas.

**Solucao:**

### 5a. Componente de Aprovacao
**Novo arquivo:** `src/components/riscos/AprovacaoRiscoDialog.tsx`
- Dialog para enviar risco para aprovacao
- Selecionar aprovador (UserSelect)
- Exibir historico de aprovacoes (campo JSONB `historico_aprovacao`)
- Acoes: Aprovar, Rejeitar, Solicitar Alteracoes (com comentario)

### 5b. Campos no formulario
**Arquivo:** `src/components/riscos/RiscoFormWizard.tsx`
- Adicionar botao "Enviar para Aprovacao" quando risco ja esta salvo
- Atualizar `status_aprovacao` e `data_envio_aprovacao`

### 5c. Badge de status na tabela
**Arquivo:** `src/pages/Riscos.tsx`
- Exibir badge de aprovacao ao lado do status (pendente/aprovado/rejeitado)
- Botao para abrir dialog de aprovacao

### 5d. Notificacao de aprovacao
- Inserir em `notifications` quando risco e enviado para aprovacao
- Centralizar no sino do header (padrao existente)

---

## 6. Exportacao de Relatorios

**Problema:** Nao existe opcao de exportar dados de riscos.

**Solucao:**

### 6a. Exportacao CSV/Excel
**Arquivo:** `src/pages/Riscos.tsx`
- Implementar funcao `handleExport` que gera CSV com todos os riscos filtrados
- Colunas: Nome, Categoria, Nivel Inicial, Nivel Residual, Status, Responsavel, Data Identificacao, Proxima Revisao
- Usar o prop `onExport` ja suportado pelo componente `DataTable`

### 6b. Exportacao PDF (Relatorio Executivo)
**Novo arquivo:** `src/components/riscos/ExportRiscosPDF.tsx`
- Usar biblioteca `jspdf` (ja instalada)
- Gerar relatorio com: resumo KPIs, distribuicao por nivel, lista de riscos criticos, tratamentos pendentes
- Botao "Exportar PDF" ao lado dos filtros

---

## Secao Tecnica - Resumo de Arquivos

### Migrations (banco de dados):
1. Criar tabela `riscos_historico_avaliacoes` com RLS
2. Adicionar coluna `data_proxima_revisao` em `riscos`
3. Criar trigger `audit_riscos_changes` para auditoria

### Novos arquivos:
- `src/components/riscos/HistoricoAvaliacoesDialog.tsx`
- `src/components/riscos/TrilhaAuditoriaRiscos.tsx`
- `src/components/riscos/AprovacaoRiscoDialog.tsx`
- `src/components/riscos/ExportRiscosPDF.tsx`

### Arquivos modificados:
- `src/pages/Riscos.tsx` — matriz visual, novas colunas, botoes de historico/aprovacao/exportacao
- `src/components/riscos/RiscoFormWizard.tsx` — campo data proxima revisao, registro de historico, botao aprovacao
- `src/components/NotificationCenter.tsx` — alertas de revisao vencida
- `src/hooks/useRiscosStats.tsx` — adicionar stat de riscos com revisao vencida

### Ordem de implementacao:
1. Migrations (tabela + coluna + trigger)
2. Matriz Visual na pagina (rapido, componente ja existe)
3. Campo data proxima revisao + formulario
4. Historico de avaliacoes (tabela + componente)
5. Trilha de auditoria (trigger + componente)
6. Workflow aprovacao (componente + integracao)
7. Exportacao CSV/PDF
8. Notificacoes no NotificationCenter
