

# Avaliacao dos Modulos de Seguranca e Privacidade

Apos analise detalhada de todos os componentes, identifiquei **5 problemas concretos** — incluindo falhas criticas de funcionalidade e seguranca.

---

## 1. CRITICO — Editar Incidente nao funciona pelo dropdown

**Problema**: Na pagina `Incidentes.tsx`, quando o usuario clica em "Editar" no dropdown de acoes, o estado `editDialogOpen` e `selectedIncidente` sao atualizados, mas o `IncidenteDialog` **nao aceita controle externo de abertura**. Ele usa apenas seu proprio `useState(false)` interno + `DialogTrigger`. Resultado: o dialog de edicao nunca abre a partir do menu de acoes.

**Solucao**: Adicionar suporte a `externalOpen` e `onExternalOpenChange` no `IncidenteDialog` (mesmo padrao ja usado em `ComunicacaoDialog` e `EvidenciaDialog`), e ajustar o `Incidentes.tsx` para usar esse controle.

| Arquivo | Mudanca |
|---------|---------|
| `src/components/incidentes/IncidenteDialog.tsx` | Adicionar props `externalOpen` + `onExternalOpenChange` |
| `src/pages/Incidentes.tsx` | Usar IncidenteDialog com controle externo para edicao |

---

## 2. CRITICO — Queries em sub-dialogs sem filtro empresa_id (vazamento de dados)

**Problema**: Varios dialogs de seguranca e privacidade fazem queries **sem filtro de empresa_id**, podendo exibir dados de outras empresas:

| Componente | Query sem filtro |
|------------|-----------------|
| `IncidenteDialog.tsx` | `supabase.from('ativos').select(...)` e `supabase.from('riscos').select(...)` |
| `TratamentoDialog.tsx` | `supabase.from('profiles').select(...)` (mostra usuarios de todas as empresas) |
| `RopaWizard.tsx` | `supabase.from('dados_pessoais').select(...)` e `supabase.from('ativos').select(...)` |
| `FluxoDadosDialog.tsx` | `supabase.from('dados_pessoais').select(...)` e `supabase.from('profiles').select(...)` |

**Solucao**: Injetar `empresaId` (via prop ou `useEmpresaId`) em cada dialog e adicionar `.eq('empresa_id', empresaId)` nas queries.

---

## 3. FUNCIONALIDADE — Incidentes sem acesso a Tratamentos

**Problema**: O componente `TratamentoDialog` existe e esta funcional, mas **nao e renderizado nem acessivel** na pagina de Incidentes. O dropdown de acoes mostra apenas "Editar", "Comunicacao", "Evidencias" e "Excluir". O usuario nao tem como registrar acoes de tratamento (corretiva, preventiva, investigativa) para um incidente — uma funcionalidade essencial para gestao de seguranca.

**Solucao**: Adicionar opcao "Tratamentos" no dropdown de acoes e renderizar o `TratamentoDialog` no `Incidentes.tsx`, seguindo o mesmo padrao de `ComunicacaoDialog`.

| Arquivo | Mudanca |
|---------|---------|
| `src/pages/Incidentes.tsx` | Adicionar menu item + estado + renderizacao do TratamentoDialog |

---

## 4. UX — DadosPessoaisDialog nao atualiza ao trocar de registro

**Problema**: O `DadosPessoaisDialog` inicializa o `formData` com `useState(dados?.nome || "")` no momento da criacao do componente. Quando o usuario clica "Editar" em um dado diferente, o `dados` prop muda mas o estado **nao se reinicializa** (React nao re-executa useState). Resultado: o formulario mostra os dados do registro anterior.

**Solucao**: Adicionar `useEffect` que observa a prop `dados` e chama o equivalente a um `reset` do formulario, como ja e feito corretamente em `IncidenteDialog`, `ComunicacaoDialog` e `EvidenciaDialog`.

| Arquivo | Mudanca |
|---------|---------|
| `src/components/dados/DadosPessoaisDialog.tsx` | Adicionar useEffect para resetar formData quando `dados` muda |

---

## 5. UX — Privacidade: KPI de incidentes nao filtra por status aberto

**Problema**: O KPI "Incidentes Privacidade" na pagina de Privacidade mostra a **contagem total** de incidentes do tipo `privacidade`, nao apenas os abertos. A descricao diz "Em aberto" mas a query nao filtra por status. Isso pode dar falsa impressao de que ha incidentes ativos quando ja foram resolvidos.

**Solucao**: Adicionar filtro `.in('status', ['aberto', 'investigacao', 'contido'])` na query de incidentes de privacidade.

| Arquivo | Mudanca |
|---------|---------|
| `src/pages/Privacidade.tsx` | Adicionar filtro de status na query de incidentes de privacidade |

---

## Resumo

| # | Problema | Tipo | Impacto |
|---|----------|------|---------|
| 1 | Edit dialog nao abre | Bug funcional | **Critico** — usuario nao edita incidentes |
| 2 | Sub-dialogs sem empresa_id | Seguranca | **Critico** — vazamento de dados entre empresas |
| 3 | Sem Tratamentos em Incidentes | Feature ausente | **Alto** — funcionalidade core inacessivel |
| 4 | DadosPessoaisDialog stale | Bug UX | **Medio** — formulario mostra dados errados |
| 5 | KPI incidentes sem filtro status | Bug dados | **Baixo** — metricas imprecisas |

Recomendo implementar todos os 5 itens nesta rodada — sao correcoes essenciais para que os modulos de seguranca e privacidade funcionem conforme o esperado.

