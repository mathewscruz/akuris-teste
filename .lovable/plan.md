

# Redesign Completo da Experiencia do Gap Analysis

## Problemas Identificados

### Pagina Principal (GapAnalysisFrameworks)
1. **Stat Cards genericos** - "Total de Frameworks: 21", "Itens Pendentes: 0" nao ajudam o usuario a tomar nenhuma decisao. Sao numeros frios sem contexto.
2. **21 cards de frameworks de uma vez** - Quando o usuario nunca usou nenhum, ele ve 21 cards iguais (secao "Disponiveis") sem saber por onde comecar. E overwhelming.
3. **Nenhum guia de "por onde comecar"** - Um usuario leigo nao sabe a diferenca entre ISO 27001 e NIST CSF 2.0. Precisa de orientacao.

### Submodulo "Avaliacao de Aderencia"
4. **Duplicacao de proposito** - "Frameworks" avalia manualmente requisito por requisito. "Avaliacao de Aderencia" analisa documentos com IA contra um framework. Sao complementares, mas ficam em paginas separadas sem conexao, confundindo o usuario.
5. **Historico de evolucao** - O `ScoreEvolutionChart` existe mas so aparece DENTRO do detalhe de um framework. O usuario nao tem uma visao geral da evolucao de todos os seus frameworks num unico lugar.

---

## Solucao Proposta

### 1. Redesign da Pagina Principal - De "Catalogo" para "Meu Painel de Compliance"

Substituir a pagina atual por uma experiencia orientada ao usuario:

**Secao Hero (topo)** - Se o usuario NAO tem nenhum framework ativo:
- Exibir um banner de boas-vindas com titulo "Comece sua jornada de compliance"
- 3 cards de sugestao com os frameworks mais populares (ISO 27001, LGPD, NIST CSF 2.0) com uma frase simples explicando para quem serve cada um
- Botao "Ver todos os frameworks" que expande/mostra o catalogo completo
- Isso elimina o problema de 21 cards na tela logo de cara

**Secao Hero (topo)** - Se o usuario JA tem frameworks ativos:
- Banner com score medio geral de compliance + mini grafico de evolucao (sparkline)
- Cards dos frameworks ativos com StatusBlocks (como ja esta, mas destacados como protagonistas)
- Botao discreto "Explorar mais frameworks"

**Secao de Frameworks Disponiveis** - Reformulada:
- Agrupar frameworks por categoria (Seguranca, Privacidade, Qualidade, Governanca) em accordions/secoes colapsaveis
- Cada framework mostra uma frase de 1 linha explicando PARA QUEM serve (ex: "Para empresas que processam dados pessoais no Brasil")
- Reduz a carga visual de 21 cards para secoes organizadas

**Arquivo modificado:** `src/pages/GapAnalysisFrameworks.tsx`
**Arquivo modificado:** `src/components/gap-analysis/FrameworkCard.tsx`

### 2. Unificar Frameworks + Aderencia em Uma Unica Pagina

Eliminar o subitem "Avaliacao de Aderencia" do sidebar. Mover essa funcionalidade para DENTRO da pagina de detalhe do framework (`GapAnalysisFrameworkDetail`), como uma aba ou secao.

Quando o usuario entra no detalhe de um framework (ex: ISO 27001), ele ve:
- Tab "Avaliacao Manual" (a tabela de requisitos atual)
- Tab "Analise de Documentos" (a avaliacao de aderencia, filtrada para aquele framework)
- Tab "Historico e Evolucao" (grafico de evolucao do score ao longo do tempo + lista de snapshots)

Isso faz muito mais sentido porque:
- A aderencia sempre e relativa a UM framework especifico
- O historico e relativo a UM framework especifico
- O usuario nao precisa navegar entre paginas para ver coisas do mesmo framework

**Arquivos modificados:**
- `src/pages/GapAnalysisFrameworkDetail.tsx` - Adicionar Tabs com 3 abas
- `src/components/AppSidebar.tsx` - Remover subitem "Avaliacao de Aderencia"
- `src/App.tsx` - Remover rota `/gap-analysis/avaliacao-aderencia`

### 3. Aba "Historico e Evolucao" (Nova)

Dentro do detalhe do framework, uma aba dedicada para o historico que o usuario pode usar para demonstrar progresso:

- Grafico de evolucao do score (ja existe `ScoreEvolutionChart`, mover para ca)
- Timeline com marcos: "Em 15/01 voce avaliou 20 requisitos", "Em 20/01 sua conformidade subiu de 30% para 45%"
- Botao "Gerar Relatorio de Evolucao" que exporta um PDF com o historico (util para apresentar para stakeholders/auditores)
- Comparacao "Score inicial vs Score atual"

**Novo componente:** `src/components/gap-analysis/FrameworkHistoryTab.tsx`

### 4. Cards de Stat Relevantes

Substituir os 4 stat cards atuais por informacoes uteis:

- **"Sua Conformidade Geral"** - Media ponderada de todos os frameworks ativos com indicador de tendencia (subindo/descendo)
- **"Proximas Acoes"** - Quantidade de planos de acao pendentes vinculados a requisitos
- **"Requisitos Criticos"** - Quantidade de requisitos de peso alto marcados como "Nao Conforme"
- **"Progresso do Mes"** - Quantos requisitos foram avaliados neste mes vs mes anterior

**Arquivo modificado:** `src/pages/GapAnalysisFrameworks.tsx`
**Arquivo modificado:** `src/hooks/useGapAnalysisStats.tsx`

### 5. Melhoria Visual nos Cards de Framework Disponivel

Em vez de cards todos iguais com icone generico, adicionar:
- Tag de categoria colorida (Seguranca = azul, Privacidade = verde, Qualidade = laranja, Governanca = roxo)
- Frase curta de "para quem serve"
- Indicador de complexidade/esforco estimado (Baixo/Medio/Alto baseado na quantidade de requisitos)

**Arquivo modificado:** `src/components/gap-analysis/FrameworkCard.tsx`

---

## Secao Tecnica

### Novos arquivos:
- `src/components/gap-analysis/FrameworkHistoryTab.tsx` - Aba de historico com timeline e relatorio de evolucao
- `src/components/gap-analysis/WelcomeHero.tsx` - Banner de boas-vindas para usuarios sem frameworks ativos
- `src/components/gap-analysis/FrameworkCatalog.tsx` - Catalogo organizado por categoria com accordions

### Arquivos modificados:
- `src/pages/GapAnalysisFrameworks.tsx` - Redesign completo: hero condicional, stats relevantes, catalogo por categoria
- `src/pages/GapAnalysisFrameworkDetail.tsx` - Adicionar sistema de Tabs (Avaliacao | Documentos | Historico)
- `src/components/gap-analysis/FrameworkCard.tsx` - Tags de categoria, frase descritiva, indicador de esforco
- `src/components/AppSidebar.tsx` - Remover subitem "Avaliacao de Aderencia", manter apenas "Gap Analysis" com link unico
- `src/App.tsx` - Remover rota `/gap-analysis/avaliacao-aderencia` (ou redirecionar para `/gap-analysis/frameworks`)
- `src/hooks/useGapAnalysisStats.tsx` - Novos calculos (conformidade geral, acoes pendentes, requisitos criticos, progresso mensal)

### Logica de agrupamento por categoria:
- Mapear `tipo_framework` para categorias visuais: `seguranca` = "Seguranca da Informacao", `privacidade` = "Privacidade e Protecao de Dados", `qualidade` = "Qualidade e Processos", `governanca` = "Governanca Corporativa"
- Usar essas categorias nos accordions do catalogo e nas tags dos cards

### Ordem de implementacao:
1. Redesign da pagina principal (Hero + Stats + Catalogo por categoria)
2. Unificacao: Tabs no detalhe do framework (Avaliacao | Documentos | Historico)
3. Nova aba de Historico e Evolucao
4. Remocao do subitem de Aderencia do sidebar e rota
5. Melhoria visual nos cards de frameworks disponiveis

