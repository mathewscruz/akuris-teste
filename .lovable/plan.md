
# Auditoria Completa de Product Design (UX/UI)
## GovernAII - Plataforma GRC

Analisei todas as paginas, componentes, fluxos e padroes visuais do sistema sob a otica de um Product Designer senior. Abaixo, as descobertas organizadas por categoria com acoes concretas.

---

## 1. Hierarquia Visual e Espacamento

### Problema: Header do Dashboard sem hierarquia clara
O greeting "Ola, Usuario! (emoji)" mistura tom informal com uma plataforma corporativa GRC. O emoji e o tom quebram a seriedade esperada por CISOs e gestores de compliance.

**Acao:** Remover emoji. Trocar saudacao para formato mais profissional: "Dashboard Executivo" como titulo fixo, com subtitulo "Bem-vindo, [Nome]" em texto secundario. Manter timestamp de atualizacao.

### Problema: Inconsistencia de padding entre modulos
O Dashboard usa `space-y-6` e `gap-3 lg:gap-6`, Riscos usa `container mx-auto py-6 px-4 max-w-7xl`, Denuncia usa `space-y-6` sem container. Configuracoes tambem usa `space-y-6`. A falta de container padrao cria larguras diferentes entre paginas.

**Acao:** Padronizar layout wrapper. O Layout.tsx ja aplica `p-4 md:p-6` no main, entao remover containers/paddings redundantes dos modulos individuais (ex: Riscos.tsx linha 356).

---

## 2. Sidebar e Navegacao

### Problema: Animacoes excessivas no sidebar
O sidebar tem `hover:scale-105`, `hover:shadow-sm`, `hover:translate-x-2`, `hover:rotate-12` no chevron, e `scale-110 rotate-3` nos icones ativos. Isso cria uma experiencia "saltitante" que distrai e parece amadora. Em plataformas SaaS enterprise, micro-animacoes devem ser sutis.

**Acao:**
- Remover `hover:scale-105` de todos os itens do sidebar
- Remover `hover:translate-x-2` dos subitems
- Remover `rotate-3` e `rotate-12` dos icones/chevrons
- Manter apenas transicoes de cor e opacidade nos hovers (ja suficientes com `hover:bg-sidebar-accent/50`)
- Reduzir `duration-300` para `duration-200`

### Problema: Placeholder invisivel para alinhamento
Linha 369 do AppSidebar.tsx tem um `<div className="w-4 h-4 flex-shrink-0" />` como placeholder para alinhar itens sem chevron. Isso e uma solucao fragil.

**Acao:** Remover o placeholder. O alinhamento natural com `justify-start` e suficiente.

---

## 3. Cards e KPIs do Dashboard

### Problema: KPI Cards com informacao insuficiente
Os 4 cards do dashboard mostram um numero grande e um badge unico. Falta contexto imediato -- o usuario nao sabe se "12 ativos" e bom ou ruim sem clicar.

**Acao:** Adicionar uma segunda linha com progresso ou comparativo inline (ex: "12 ativos | 3 criticos" ou uma mini barra de progresso mostrando % criticos vs total). Ja existe `TrendBadge` nos cards 2-4, estender para o card 1 (Ativos).

### Problema: Cards clicaveis sem affordance visual clara
Os KPI cards sao clicaveis mas nao tem indicador visual alem do cursor pointer. O usuario pode nao perceber que sao interativos.

**Acao:** Adicionar um icone discreto de `ChevronRight` ou `ExternalLink` (h-3 w-3) no canto inferior direito dos cards, com opacidade 0.5 que aumenta no hover.

---

## 4. Componente ExecutiveSummaryAI

### Problema: Estado inicial vazio
O componente de resumo IA mostra apenas um botao "Gerar Resumo Executivo" ate ser clicado. Isso desperdiça espaco valioso no dashboard e cria uma sensacao de "feature incompleta".

**Acao:** Mostrar um estado inicial mais convidativo com skeleton/preview do que sera gerado (ex: 3 linhas de skeleton + texto "Clique para gerar uma analise executiva com IA"). Opcionalmente, gerar automaticamente no primeiro acesso do dia.

---

## 5. Tabelas e Listas

### Problema: Controles.tsx usa Table manual em vez de DataTable
O modulo de Controles (837 linhas) usa `<Table>` manual com paginacao propria, enquanto Riscos, Incidentes e outros usam `DataTable`. Isso quebra a consistencia de UX (paginacao diferente, sorting diferente).

**Acao:** Migrar Controles.tsx para usar o componente `DataTable` padrao, eliminando a implementacao manual de paginacao.

### Problema: Documentos.tsx tambem usa Table manual
Mesmo caso - 927 linhas com tabela manual.

**Acao:** Migrar Documentos.tsx para DataTable.

### Problema: Contratos.tsx usa Table manual
857 linhas com tabela e paginacao manuais.

**Acao:** Migrar Contratos.tsx para DataTable.

---

## 6. Loading States

### Problema: Loading spinner identico em todos os modulos
Todos os modulos mostram o mesmo spinner generico (circulo girando + "Carregando..."). Isso perde a oportunidade de manter contexto visual.

**Acao:** Substituir o spinner generico por Skeleton layouts que espelham a estrutura real da pagina. O Dashboard ja faz isso parcialmente (skeleton nos cards), mas modulos como Riscos (linha 354-364) e Configuracoes mostram apenas spinner centralizado. Aplicar skeleton pattern em todos.

---

## 7. Mobile Bottom Navigation

### Problema: Contratos e Documentos nao estao no bottom nav
Os modulos recentemente movidos para raiz do sidebar (Contratos, Documentos) nao foram adicionados ao menu "Mais" do MobileBottomNav. O item "Docs" no nav principal vai para `/documentos`, mas Contratos so aparece no "Mais" de forma indireta.

**Acao:** Adicionar "Contratos" aos `moreNavItems` do MobileBottomNav.tsx (ja esta parcialmente la como parte de outro grupo). Verificar que todos os modulos raiz do sidebar estejam representados.

### Problema: Icones repetidos
`Shield` e usado para Privacidade e tambem para Controles no bottom nav. `HardDrive` e usado para Incidentes no bottom nav mas para Ativos no dashboard.

**Acao:** Diferenciar icones: Privacidade pode usar `Eye` ou `UserCheck`, Incidentes pode usar `AlertCircle` (ja usado no desktop sidebar).

---

## 8. NotificationCenter

### Problema: Limite de 20 notificacoes pode cortar alertas importantes
O sistema combina notificacoes manuais + automaticas e faz `.slice(0, 20)`. Em cenarios reais com muitos contratos/documentos vencendo, alertas criticos podem ser cortados.

**Acao:** Separar notificacoes por prioridade: mostrar TODAS as de tipo "error" primeiro, depois "warning", depois "info". Adicionar um link "Ver todas" que abre uma pagina completa de notificacoes (ou dialog fullscreen) em vez de limitar a 20 no popover.

### Problema: Performance - queries pesadas no NotificationCenter
O componente faz 8+ queries separadas (documentos, contratos, controles, incidentes, ativos, manutencoes, licencas, chaves, aprovacoes) toda vez que abre. Isso impacta performance.

**Acao:** Consolidar em uma unica Edge Function `get-notifications-summary` que retorna todos os alertas de uma vez, com cache de 5 minutos server-side.

---

## 9. Empty States

### Problema: EmptyState sem ilustracoes
O componente EmptyState usa apenas um icone circular generico. Para uma plataforma premium, falta personalidade.

**Acao:** Adicionar ilustracoes SVG simples (line-art no estilo do design system teal) para os empty states mais comuns: "Nenhum risco cadastrado", "Nenhum documento", etc. Usar um componente wrapper que aceita `illustration` como prop.

---

## 10. Formularios e Dialogs

### Problema: Dialogs sem indicacao de campos obrigatorios
Os formularios nos dialogs (RiscoDialog, ControleDialog, etc.) nao marcam visualmente quais campos sao obrigatorios (asterisco vermelho) de forma consistente.

**Acao:** Padronizar todos os Labels de campos obrigatorios com `*` vermelho apos o texto. Criar um componente `RequiredLabel` wrapper.

---

## 11. Cores e Identidade

### Problema: App.css com estilos legados
O arquivo `src/App.css` contem estilos do template Vite original (`#root`, `.logo`, `.read-the-docs`, `.card`) que nao sao usados e poluem o projeto.

**Acao:** Limpar App.css removendo todos os estilos legados do template.

---

## 12. Micro-interacoes e Feedback

### Problema: Botoes de acao sem feedback de carregamento
Botoes como "Salvar", "Excluir" em dialogs nao mostram estado de loading durante operacoes assincronas de forma consistente.

**Acao:** Padronizar todos os botoes de submit em dialogs para mostrar `<Loader2 className="animate-spin" />` durante requisicoes, desabilitando o botao.

---

## Resumo de Impacto

| Categoria | Itens | Prioridade |
|-----------|-------|------------|
| Remover animacoes excessivas sidebar | 1 arquivo | Alta |
| Dashboard profissionalizar header | 1 arquivo | Alta |
| Migrar tabelas manuais para DataTable | 3 arquivos | Alta |
| Limpar App.css legado | 1 arquivo | Media |
| Loading skeletons em todos modulos | 5+ arquivos | Media |
| Empty states com ilustracoes | 1 componente + SVGs | Baixa |
| NotificationCenter priorizar erros | 1 arquivo | Media |
| Mobile nav icones e cobertura | 1 arquivo | Media |
| Campos obrigatorios visuais | Multiplos dialogs | Baixa |
| Botoes loading padrao | Multiplos dialogs | Baixa |
| ExecutiveSummaryAI estado inicial | 1 arquivo | Baixa |

---

## Detalhes Tecnicos

### Arquivos que serao modificados:
- `src/App.css` -- limpar estilos legados
- `src/components/AppSidebar.tsx` -- remover animacoes excessivas
- `src/pages/Dashboard.tsx` -- profissionalizar header, affordance nos cards
- `src/pages/Controles.tsx` -- migrar para DataTable
- `src/pages/Documentos.tsx` -- migrar para DataTable
- `src/pages/Contratos.tsx` -- migrar para DataTable
- `src/pages/Riscos.tsx` -- remover container wrapper redundante
- `src/components/MobileBottomNav.tsx` -- corrigir icones e cobertura
- `src/components/NotificationCenter.tsx` -- priorizar por severidade, link "ver todas"
- `src/components/dashboard/ExecutiveSummaryAI.tsx` -- melhorar estado inicial
- `src/pages/Incidentes.tsx` -- skeleton loading
- `src/pages/Configuracoes.tsx` -- skeleton loading

### Principios aplicados:
1. Menos e mais: remover animacoes que nao agregam valor
2. Consistencia acima de tudo: mesmos componentes para mesmas funcoes
3. Feedback imediato: o usuario sempre sabe o que esta acontecendo
4. Hierarquia clara: titulos, subtitulos e acoes em posicoes previsiveis
5. Tom profissional: linguagem e visual adequados ao publico-alvo (GRC)
