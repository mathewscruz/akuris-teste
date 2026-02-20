

# Reestilizacao Visual do Modulo de Riscos (Inspirado na Referencia)

## Analise da Referencia vs Estado Atual

A imagem mostra um dashboard "Risk Intelligence" com 3 elementos visuais chave que podemos adotar, adaptando aos nossos dados:

### O que vale a pena adotar

1. **KPI Cards com mini sparklines e tendencia percentual** - Nossos StatCards atuais exibem apenas numero + descricao. A referencia mostra mini graficos de linha dentro dos cards com variacao percentual colorida (ex: +18%). Isso agrega valor visual sem mudar dados.

2. **Layout do Score/Gauge mais proeminente** - A referencia tem um "Total Exposure" com gauge semicircular e legenda (High/Moderate/Low). Nosso `RiskScoreCard` ja tem o circulo com score, mas pode ganhar a legenda de niveis abaixo como a referencia.

3. **Tabela com Tags/Badges multiplos e avatar inline** - A referencia mostra colunas com multiplas tags coloridas por linha (Monitoring, Deferred, Awaiting Review). Nosso modulo ja tem avatar do responsavel e badges de nivel, mas podemos adicionar uma coluna de "Tags" combinando status de aprovacao + status do tratamento + aceite num formato visual de badges agrupados.

### O que NAO vale adotar

- **Heatmap radar** ("Risk Analytics") - Nos ja temos a Matriz de Risco visual configuravel que e mais adequada ao nosso contexto ISO 31000.
- **Tabs "Customers/Applications"** - Nao faz sentido no nosso contexto pois nossos riscos nao se dividem dessa forma.
- **Metricas "Total Applications/Customers"** - Sao especificas de outro dominio. Manteremos nossas metricas proprias (Total de Riscos, Tratamentos, Aceitos, Score).

---

## Plano de Implementacao

### 1. Evoluir KPI Cards com Sparklines e Tendencia

**Arquivo:** `src/pages/Riscos.tsx`

Substituir os 3 `StatCard` por cards customizados que incluam:
- Mini sparkline SVG (linha simples dos ultimos 7 dias de contagem)
- Badge de variacao percentual colorido (verde se melhorou, vermelho se piorou)
- Manter icone e valores atuais

**Arquivo:** `src/hooks/useRiscosStats.tsx`
- Adicionar dados de tendencia por KPI (total_7d_atras, criticos_7d_atras) para calcular variacao percentual por card

### 2. Melhorar o RiskScoreCard

**Arquivo:** `src/components/riscos/RiskScoreCard.tsx`

Evoluir o card para se parecer mais com o "Total Exposure" da referencia:
- Trocar circulo completo por gauge semicircular (arco de 180 graus), similar ao `HealthScoreGauge` do dashboard
- Adicionar legenda de niveis abaixo do gauge (badges: Critico / Alto / Medio / Baixo)
- Manter score numerico centralizado e variacao de 7 dias

### 3. Adicionar coluna "Tags" na tabela

**Arquivo:** `src/pages/Riscos.tsx`

Nova coluna "Tags" que agrupa visualmente:
- Badge do status de aprovacao (se existir)
- Badge de "Aceito" (se risco aceito)
- Badge de revisao (se proxima/vencida)
- Exibir ate 2 badges + "+N" se houver mais (como na referencia "+4")

Remover as colunas separadas de "Revisao" e "Status Aprovacao" que hoje ocupam espaco individual, consolidando tudo em "Tags".

### 4. Ajustar header da pagina

**Arquivo:** `src/pages/Riscos.tsx`

Adicionar subtitulo descritivo similar ao da referencia:
- Atual: "Identifique, avalie e monitore riscos organizacionais de forma estruturada"
- Manter, pois ja esta adequado

---

## Secao Tecnica

### Arquivos modificados:
- `src/pages/Riscos.tsx` - Layout dos KPI cards, nova coluna Tags na tabela
- `src/components/riscos/RiskScoreCard.tsx` - Redesign para gauge semicircular com legenda
- `src/hooks/useRiscosStats.tsx` - Dados de tendencia por metrica individual

### Arquivos nao modificados:
- Nenhum arquivo novo necessario - tudo e evolucao visual dos componentes existentes

### Ordem:
1. Atualizar `useRiscosStats` com dados de tendencia
2. Redesenhar `RiskScoreCard` com gauge semicircular
3. Evoluir KPI cards em `Riscos.tsx` com sparklines
4. Consolidar coluna Tags na tabela

