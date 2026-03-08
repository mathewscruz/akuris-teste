

# Auditoria de Código — Itens Legados e Otimizações

## 1. Código Morto / Não Utilizado

### Edge Function Órfã
| Arquivo | Problema |
|---------|----------|
| `supabase/functions/dashboard-ai-summary/index.ts` | Removemos o `ExecutiveSummaryAI.tsx` mas a Edge Function que o servia continua no projeto. Nenhum arquivo no frontend a referencia. |

### Hooks sem Importação
| Arquivo | Problema |
|---------|----------|
| `src/hooks/useCreditosIA.tsx` | Exporta `useCreditosIA` mas nenhum componente o importa. Código morto. |
| `src/hooks/useNISTScore.tsx` | Exporta `useNISTScore` mas nenhum componente o importa (era do layout antigo NIST). |

### Componentes Órfãos
| Arquivo | Problema |
|---------|----------|
| `src/components/due-diligence/ReportsViewer.tsx` | Nenhum arquivo importa este componente. Substituído por `ReportsView.tsx` + `ReportsSidebar.tsx`. |
| `src/components/due-diligence/FornecedorSelector.tsx` | Nenhum arquivo importa este componente. |

### Assets Não Utilizados
| Arquivo | Problema |
|---------|----------|
| `src/assets/governaii-logo-main.png` | Nenhuma referência no código. |
| `src/assets/governaii-logo-mini.png` | Nenhuma referência no código. |
| `src/assets/governaii-logo.png` | Nenhuma referência no código. |
| `src/assets/governance-security-badge.png` | Nenhuma referência no código. |
| `public/governaii-logo.png` | Nenhuma referência no código. |

### Código Não Utilizado em Hooks
| Arquivo | Item | Problema |
|---------|------|----------|
| `src/hooks/useOptimizedQuery.tsx` | `useSupabaseQuery` | Exportado mas nenhum componente usa. |
| `src/hooks/useOptimizedQuery.tsx` | `clearQueryCache` | Exportado mas nenhum componente usa. |

---

## 2. Página Redirect Desnecessária

| Arquivo | Problema |
|---------|----------|
| `src/pages/GapAnalysis.tsx` | Componente inteiro é apenas um `useEffect → navigate('/gap-analysis/frameworks')`. Pode ser substituído por `<Navigate>` direto no `App.tsx` (como já é feito para `/dados → /privacidade`). |

---

## 3. Plano de Limpeza

### Deletar arquivos
- `supabase/functions/dashboard-ai-summary/index.ts` (+ remover do `config.toml`)
- `src/hooks/useCreditosIA.tsx`
- `src/hooks/useNISTScore.tsx`
- `src/components/due-diligence/ReportsViewer.tsx`
- `src/components/due-diligence/FornecedorSelector.tsx`
- `src/assets/governaii-logo-main.png`
- `src/assets/governaii-logo-mini.png`
- `src/assets/governaii-logo.png`
- `src/assets/governance-security-badge.png`
- `public/governaii-logo.png`
- `src/pages/GapAnalysis.tsx`

### Editar arquivos
- `src/hooks/useOptimizedQuery.tsx` — remover `useSupabaseQuery` e `clearQueryCache`
- `src/App.tsx` — substituir `<GapAnalysis />` por `<Navigate to="/gap-analysis/frameworks" replace />` e remover import
- `supabase/config.toml` — remover seção `[functions.dashboard-ai-summary]`

Total: **11 arquivos deletados**, **3 arquivos editados**. Nenhuma funcionalidade ativa é afetada.

