
# Redesign do Dashboard e Refinamento Visual do GovernAII

## Diagnostico Atual

Analisei o dashboard e os modulos internos. O layout atual segue o padrao classico de SaaS: grid de KPI cards retangulares em cima, graficos em baixo, tudo em cards brancos com bordas suaves. Esse padrao e identico ao de ferramentas como Metabase, Notion Analytics, ou qualquer template shadcn/ui. Nao comunica identidade propria.

### Sobre a Fonte

A fonte atual e **Plus Jakarta Sans**. Ela e uma boa fonte, mas se tornou extremamente popular em projetos criados com Lovable, shadcn/ui e templates modernos. Quase todo SaaS recente usa ela ou Inter. Para se diferenciar, recomendo migrar para **DM Sans** -- uma fonte geometric sans-serif igualmente legivel, mais corporativa e menos "startup", com excelente suporte a pesos variados. Alternativa seria **Outfit** ou **Satoshi** (essa ultima nao esta no Google Fonts).

**Recomendacao final: DM Sans** -- corporativa, moderna, distinta, disponivel no Google Fonts.

---

## Mudancas Propostas

### 1. Trocar fonte para DM Sans
- Atualizar `index.html` para carregar DM Sans
- Atualizar `tailwind.config.ts` para usar DM Sans como font-family principal
- Manter fallback para system-ui

### 2. Redesign do Dashboard - Layout "Command Center"
Em vez do grid padrao de cards, criar um layout estilo "Centro de Comando" que transmita controle e visao estrategica:

**Estrutura proposta:**

```text
+-------------------------------------------------------+
| Dashboard Executivo              [Atualizar] [HH:MM]  |
| Bem-vindo, Nome                                        |
+-------------------------------------------------------+
|                                                         |
| +--HERO BANNER (Health Score + Resumo Rapido)--------+ |
| | [Gauge SVG]  Score 72/100 Bom                      | |
| |  3 alertas criticos | 12 controles ativos          | |
| |  Score conformidade: 68%                           | |
| +----------------------------------------------------+ |
|                                                         |
| +--KPIs em PILL/CHIP style (horizontal scroll)------+ |
| | [Ativos 24] [Alertas 3] [Controles 12] [Incid. 1] | |
| | [Contratos 8] [Docs 15] [Conformidade 68%]        | |
| +----------------------------------------------------+ |
|                                                         |
| +--Maturidade GRC (2/3)--+ +--Vencimentos (1/3)----+ |
| |  Radar Chart            | | Lista compacta         | |
| +-------------------------+ +------------------------+ |
|                                                         |
| +--IA Summary----+ +--Riscos Timeline--+ +--Ativid.--+ |
| |  Compacto       | |  Chart           | | Feed      | |
| +-----------------+ +------------------+ +-----------+ |
+-------------------------------------------------------+
```

**Diferenciais visuais:**
- **Hero Banner:** Card grande no topo com gradiente sutil (primary/5 para transparent), contendo o HealthScoreGauge ja existente + metricas-chave inline. Substitui a secao de 7 cards por uma visao consolidada
- **KPIs como Pills/Chips:** Em vez de cards grandes, usar badges/pills horizontais compactos que funcionam como atalhos de navegacao. Scroll horizontal no mobile
- **Grid 3 colunas na ultima fila:** IA Summary, Riscos Timeline e Atividades lado a lado (xl), empilhados no mobile

### 3. KPI Pills (substitui os 7 cards atuais)
Em vez de 7 cards ocupando 2 fileiras inteiras, criar uma barra horizontal de "stat pills" -- pequenos indicadores compactos e clicaveis com icone + numero + badge de status. Isso libera espaco vertical para conteudo mais rico (graficos, IA).

Cada pill tera:
- Icone pequeno (h-4 w-4) com cor semantica
- Valor numerico em bold
- Label em texto pequeno
- Badge de status (vencendo, criticos, etc.) quando aplicavel
- Clicavel para navegacao

### 4. Hero Score Banner
Componente novo que combina:
- HealthScoreGauge (ja existe, nao e usado no dashboard atualmente!)
- 3-4 metricas-chave inline ao lado do gauge
- Background com gradiente sutil da paleta teal
- Cria identidade visual unica -- nenhum SaaS GRC tem isso

### 5. Secao de IA mais integrada
O ExecutiveSummaryAI atual ocupa uma fileira inteira. Compacta-lo para ocupar 1/3 do grid (ao lado de Riscos Timeline e Atividades), mostrando apenas resumo + score quando gerado, com botao "Expandir" para ver detalhes completos em dialog.

### 6. Refinamento visual dos modulos internos
- Adicionar uma barra sutil de gradiente no topo das paginas de modulo (abaixo do header) para criar continuidade visual com o dashboard
- Os modulos ja estao bem padronizados (DataTable, StatCards), mas o header `PageHeader` pode ganhar uma linha decorativa sutil

---

## Arquivos que serao modificados

| Arquivo | Mudanca |
|---------|---------|
| `index.html` | Trocar Google Font de Plus Jakarta Sans para DM Sans |
| `tailwind.config.ts` | Atualizar fontFamily para DM Sans |
| `src/pages/Dashboard.tsx` | Redesign completo do layout: Hero Banner + KPI Pills + grid 3 colunas |
| `src/components/dashboard/HeroScoreBanner.tsx` | NOVO - Banner principal com gauge + metricas |
| `src/components/dashboard/KPIPills.tsx` | NOVO - Barra horizontal de indicadores compactos |
| `src/components/dashboard/ExecutiveSummaryAI.tsx` | Compactar para modo resumido no grid |

## O que NAO sera alterado
- Paleta de cores (teal/emerald ja esta bem diferenciada)
- Sidebar (ja foi refinado)
- Componentes de modulos (ja padronizados)
- Landing page

## Resultado esperado
O dashboard vai sair do padrao "template shadcn/ui" para um visual de "centro de comando GRC" com identidade propria, onde o score de saude organizacional e o elemento visual principal, os KPIs sao compactos e acessiveis, e o conteudo rico (graficos, IA, timeline) ocupa a maior parte do espaco.
