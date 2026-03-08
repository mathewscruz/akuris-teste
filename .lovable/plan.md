

# Varredura Geral — Problemas Remanescentes

Após analisar os módulos restantes, identifiquei **3 problemas concretos** que ainda persistem:

---

## 1. Queries sem filtro `empresa_id` em 5 módulos (Segurança)

Problema crítico de isolamento de dados. Os seguintes módulos fazem queries **sem** `.eq('empresa_id', empresaId)`, dependendo exclusivamente de RLS:

| Módulo | Query sem filtro |
|--------|-----------------|
| `Riscos.tsx` | `supabase.from('riscos').select(...)` — sem filtro empresa_id |
| `Ativos.tsx` | `supabase.from('ativos').select(...)` — sem filtro empresa_id |
| `Incidentes.tsx` | `supabase.from('incidentes').select(...)` — sem filtro empresa_id |
| `ContasPrivilegiadas.tsx` | `supabase.from('contas_privilegiadas').select(...)` e `sistemas_privilegiados` — sem filtro |
| `ControlesContent.tsx` | `supabase.from('controles').select(...)`, `auditorias`, `controles_auditorias`, `controles_testes` — sem filtro |

**Solução**: Adicionar `useEmpresaId()` (ou usar `profile.empresa_id` onde já disponível) e `.eq('empresa_id', empresaId)` em todas as queries, seguindo o padrão já implementado em Contratos, Documentos, Politicas e Privacidade.

---

## 2. `console.error` / `console.log` em páginas públicas e de configuração

Múltiplas páginas ainda usam `console.error` e `console.log` em vez de `logger`:

- `Configuracoes.tsx` (1 console.error)
- `DenunciaFormulario.tsx` (~15 console.log + console.error)
- `DenunciaMenu.tsx` (~6 console.log + console.error)
- `DenunciaExternaRedirect.tsx` (~6 console.log + console.error)
- `DenunciaConsulta.tsx` (2 console.error)
- `Auth.tsx` (3 console.error + console.log)
- `Assessment.tsx` (usa logger customizado local em vez do padrão)
- `ReviewExterna.tsx` (1 console.error)

**Solução**: Substituir por `logger.error` / `logger.info` do `src/lib/logger.ts`. As páginas públicas de denúncia podem manter logs em `logger.debug` para facilitar troubleshooting sem expor em produção.

---

## 3. `ControlesContent.tsx` usa `<Table>` manual em vez de `<DataTable>`

O componente de Controles Internos (`ControlesContent.tsx`, 855 linhas) ainda renderiza tabelas com `<Table>` manual com paginação customizada, enquanto o padrão da aplicação é `<DataTable>`. Isso cria inconsistência visual e de comportamento (paginação, ordenação, empty states).

**Solução**: Esta é uma refatoração maior que pode ser priorizada depois dos itens 1-2. Registro aqui para visibilidade.

---

## Resumo de Prioridade

| # | Problema | Impacto | Esforço |
|---|----------|---------|---------|
| 1 | 5 módulos sem filtro empresa_id | **Crítico** (segurança) | Médio |
| 2 | console.error/log espalhados | Baixo (manutenção) | Baixo |
| 3 | ControlesContent sem DataTable | Baixo (consistência visual) | Alto |

Recomendo implementar os itens **1 e 2** agora. O item 3 fica para uma rodada posterior.

