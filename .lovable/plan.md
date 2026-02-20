
# Correcao de Scores e Estilizacao do Formulario de Due Diligence

## 1. Corrigir Calculos de Score (0% quando vazio)

### Problema
Varios hooks e o dashboard usam valores padrao altos quando nao ha dados cadastrados:
- `useRadarChartData.tsx`: Riscos, Controles, Ativos, Due Diligence e Documentos usam `50` como fallback quando `total === 0`
- `useRadarChartData.tsx`: Incidentes e Denuncias usam `100` como fallback (logica invertida: "sem incidentes = perfeito")
- `Dashboard.tsx` linha 60: `healthScore` esta fixo em `72`
- O correto: tudo deve comecar em `0%` e subir conforme itens sao cadastrados e gerenciados

### Solucao

**A. `src/hooks/useRadarChartData.tsx`** - Trocar todos os fallbacks de `50`/`100` para `0`:
- Riscos: `total === 0 ? 0` (era 50)
- Controles: `total === 0 ? 0` (era 50)
- Ativos: `total === 0 ? 0` (era 50)
- Incidentes: `total === 0 ? 0` (era 100)
- Due Diligence: `total === 0 ? 0` (era 50)
- Documentos: `total === 0 ? 0` (era 50)
- Denuncias: `total === 0 ? 0` (era 100)
- Gap Analysis ja usa `gapData.averageCompliance || 0` (correto)

**B. `src/pages/Dashboard.tsx`** - Calcular `healthScore` dinamicamente:
- Substituir `const healthScore = 72` por calculo real
- Usar a media dos scores do radar chart ou media dos dados disponiveis
- Quando nenhum dado existe, mostrar `0`

**C. `src/components/dashboard/HealthScoreGauge.tsx`** - Atualizar o label para score 0:
- Quando score === 0, mostrar "Sem dados" ao inves de "Critico"

### Arquivos modificados:
- `src/hooks/useRadarChartData.tsx`
- `src/pages/Dashboard.tsx`
- `src/components/dashboard/HealthScoreGauge.tsx`

---

## 2. Restilizar Formulario de Due Diligence (Assessment Externo)

### Problema
O formulario que o fornecedor/parceiro recebe (`/assessment/:token`) tem visual generico:
- Background claro (`from-background to-muted`)
- Nao exibe logotipo da Akuris
- Nao segue a identidade visual do sistema (navy + violeta)
- Cards com estilo basico sem a personalidade da marca

### Solucao

**A. Aplicar background navy do login** em todas as telas do Assessment:
- Trocar `bg-gradient-to-br from-background to-muted` por `bg-[hsl(230,25%,7%)]` com o brilho radial neon
- Aplicar em: loading, erro, concluido, formulario principal
- Cards ficam com `bg-card/95 backdrop-blur-sm` para contraste

**B. Adicionar logotipo Akuris** no topo do formulario:
- Usar `/akuris-logo.png` como logo fixo da plataforma (sempre visivel)
- Logo da empresa do cliente aparece abaixo, como ja faz
- Adicionar texto "Powered by Akuris" no rodape

**C. Melhorar layout do formulario**:
- Header com gradiente navy e logo Akuris centralizado
- Progress bar com cores da marca (violeta)
- Cards de perguntas com bordas mais suaves e sombras
- Botoes com gradiente violeta da marca
- Footer discreto com "Powered by Akuris" e link

**D. Telas de estado** (loading, erro, sucesso):
- Loading: fundo navy com spinner violeta
- Erro: fundo navy com card flutuante
- Sucesso: fundo navy com animacao de checkmark

### Arquivos modificados:
- `src/pages/Assessment.tsx` - Todas as secoes de renderizacao (loading, erro, concluido, formulario)

---

## Secao Tecnica - Resumo

| Arquivo | Tipo | Descricao |
|---------|------|-----------|
| `useRadarChartData.tsx` | Hook | Fallbacks de 50/100 para 0 |
| `Dashboard.tsx` | Pagina | Calcular healthScore dinamicamente |
| `HealthScoreGauge.tsx` | Componente | Label "Sem dados" para score 0 |
| `Assessment.tsx` | Pagina | Background navy, logo Akuris, visual alinhado |

### Ordem de implementacao:
1. Corrigir scores (radar + dashboard + gauge)
2. Restilizar formulario de Assessment
