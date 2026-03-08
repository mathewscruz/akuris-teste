

# Responsividade Completa do Sistema

## Diagnóstico

Após análise do codebase, identifiquei os seguintes problemas de responsividade:

### Problemas encontrados

1. **Dialogs (modais)** — Usam `max-w-5xl` fixo sem adaptação mobile. Em telas pequenas ocupam a tela inteira sem padding adequado, sem scroll correto. Exemplos: `RiscoDialog`, `ContratoDialogWizard`, `DocGenDialog`, etc.

2. **DataTable** — Tabelas com muitas colunas não têm scroll horizontal no mobile. Colunas como "Tags", "Resp.", "Tratam." ficam comprimidas e ilegíveis.

3. **Botões de ação em páginas** — Linhas de botões (Exportar, Categorias, Matriz, Novo Risco) não quebram em mobile, ficam cortados. Ex: `Riscos.tsx` linhas 676-718.

4. **PageHeader** — Título `text-3xl` fixo é grande demais para mobile. Actions ficam na mesma linha sem wrap.

5. **StatCards grid** — Grid `lg:grid-cols-4` comprime cards demais em tablets. Falta breakpoint intermediário.

6. **Configurações tabs** — TabsList horizontal com muitas abas não tem scroll horizontal em mobile.

7. **DataTable pagination** — Info "Mostrando X a Y de Z" + seletor + paginação ficam na mesma linha, quebra no mobile.

8. **KPI Pills** — Scrollbar horizontal funciona, mas não há indicador visual de que é scrollável.

9. **Dashboard grids** — Seções com `xl:grid-cols-3` pulam direto para 1 coluna no mobile sem estágio intermediário em alguns pontos.

10. **Dialogs grandes como RiscoFormWizard** — Em mobile deveria virar fullscreen (drawer-style) ao invés de modal centralizado.

## Implementação

### A. Componentes base (impacto global)

| Arquivo | Mudança |
|---|---|
| `src/components/ui/dialog.tsx` | Adicionar classes responsivas ao `DialogContent`: mobile fullscreen (`max-h-[100dvh] h-full sm:h-auto sm:max-h-[90vh]`, `rounded-none sm:rounded-lg`, `inset-0 sm:inset-auto sm:left-[50%] sm:top-[50%]`) |
| `src/components/ui/data-table.tsx` | Wrap tabela em `overflow-x-auto`; pagination layout stack no mobile; search/filters stack vertical no mobile |
| `src/components/ui/page-header.tsx` | Título `text-2xl sm:text-3xl`; actions wrap `flex-wrap` |
| `src/components/ui/stat-card.tsx` | Valor `text-2xl sm:text-3xl`; padding mais compacto no mobile |

### B. Páginas principais

| Arquivo | Mudança |
|---|---|
| `src/pages/Riscos.tsx` | Botões de ação: `flex-wrap` no container; ocultar labels no mobile (só ícones); StatCards grid `grid-cols-2 lg:grid-cols-4` |
| `src/pages/Dashboard.tsx` | KPI pills: indicador de scroll (gradient fade); grids intermediários para tablet |
| `src/pages/Contratos.tsx` | Mesma lógica de botões e tabela |
| `src/pages/Documentos.tsx` | Mesma lógica |
| `src/pages/Configuracoes.tsx` | TabsList com `overflow-x-auto` e `scrollbar-hide` |

### C. Dialogs grandes

| Arquivo | Mudança |
|---|---|
| `src/components/riscos/RiscoDialog.tsx` | Mobile: `max-w-full sm:max-w-5xl`, fullscreen style |
| Outros dialogs grandes (ContratoDialogWizard, DocGenDialog, etc.) | Mesmo padrão |

### D. CSS utilitário

| Arquivo | Mudança |
|---|---|
| `src/index.css` | Adicionar `.safe-area-bottom { padding-bottom: env(safe-area-inset-bottom) }` e `.scrollbar-hide` para ocultar scrollbar em pills |

## Resumo de arquivos a editar

1. `src/components/ui/dialog.tsx` — Fullscreen mobile
2. `src/components/ui/data-table.tsx` — Scroll horizontal + pagination stack
3. `src/components/ui/page-header.tsx` — Texto e layout responsivos
4. `src/components/ui/stat-card.tsx` — Tamanhos responsivos
5. `src/pages/Riscos.tsx` — Botões e grid
6. `src/pages/Dashboard.tsx` — Grids e pills
7. `src/pages/Contratos.tsx` — Botões e layout
8. `src/pages/Configuracoes.tsx` — Tabs scrolláveis
9. `src/components/riscos/RiscoDialog.tsx` — Fullscreen mobile
10. `src/index.css` — Utilitários CSS
11. `src/components/dashboard/KPIPills.tsx` — Fade indicator scroll

