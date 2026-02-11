
# Planos de Acao - Visao Consolidada de Pendencias do Usuario

## Resumo

Transformar o modulo "Planos de Acao" para funcionar como um hub centralizado de pendencias do usuario. A tela principal mostrara, por padrao, apenas os itens atribuidos ao usuario logado, agregando tanto os planos de acao manuais quanto pendencias vindas de outros modulos do sistema (controles, auditorias, incidentes). O usuario podera editar status e tomar acoes diretamente desta tela.

## Mudancas Principais

### 1. Aba "Meus Itens" como padrao
- A aba ativa ao abrir a pagina passa a ser "meus" em vez de "todos"
- Apenas administradores e super_admin verao a aba "Todos" (para visao gerencial)

### 2. Agregacao de pendencias de outros modulos
Ao carregar a pagina, alem dos registros da tabela `planos_acao`, o sistema buscara itens pendentes/ativos atribuidos ao usuario nos seguintes modulos:

| Modulo | Tabela | Campo responsavel | Filtro de pendencia | Campo titulo |
|--------|--------|-------------------|---------------------|--------------|
| Controles | `controles` | `responsavel_id` | status IN ('ativo', 'em_revisao') | `nome` |
| Auditorias | `auditoria_itens` (via auditorias) | `responsavel_id` | status NOT IN ('concluido', 'cancelado') | `titulo` |
| Incidentes | `incidentes` | `responsavel_tratamento` | status NOT IN ('encerrado', 'cancelado') | `titulo` |

Esses itens aparecerao na lista com uma badge indicando o modulo de origem e um botao para abrir/navegar ao item original.

### 3. Interface unificada
- Cada item agregado aparece como uma linha na tabela/card no kanban, com:
  - Titulo do item
  - Badge do modulo de origem (cor diferenciada)
  - Status (mapeado para os status do plano de acao)
  - Prazo (quando disponivel)
  - Botao "Abrir" que navega para o modulo de origem
- Itens nativos do `planos_acao` continuam editaveis inline
- Itens agregados de outros modulos possuem apenas o botao "Abrir no modulo" (nao editaveis diretamente aqui)

### 4. Estatisticas atualizadas
- Os cards de estatistica no topo refletirao o total consolidado (planos + itens agregados)

## Detalhes Tecnicos

### Arquivos a modificar

**`src/pages/PlanosAcao.tsx`**:
- Alterar `activeTab` inicial de `'todos'` para `'meus'`
- Adicionar 3 queries adicionais (controles, auditoria_itens, incidentes) filtradas por `responsavel_id = user.id` e `empresa_id`
- Criar funcao `buildAggregatedItems()` que transforma os registros de outros modulos em formato compativel com a tabela (com campo `_source: 'controles' | 'auditorias' | 'incidentes'` e `_isExternal: true`)
- Na aba "Meus Itens", concatenar planos do usuario + itens agregados
- Na aba "Todos", manter apenas planos_acao (visao gerencial)
- Adicionar coluna "Acoes" com botao de navegacao para itens externos (usa `react-router-dom` navigate)
- Ajustar coluna "Acoes" para esconder editar/excluir em itens externos

**`src/components/planos-acao/PlanoAcaoDialog.tsx`**: sem alteracoes

### Mapeamento de status dos modulos externos

```text
Controles:
  ativo -> em_andamento
  em_revisao -> pendente

Auditoria Itens:
  pendente -> pendente
  em_andamento -> em_andamento
  (com prazo vencido) -> atrasado

Incidentes:
  identificado -> pendente
  em_investigacao -> em_andamento
  em_tratamento -> em_andamento
```

### Navegacao para modulo de origem
- Controles: `/governanca?tab=controles`
- Auditorias: `/governanca?tab=auditorias`
- Incidentes: `/incidentes`

### Nenhuma dependencia nova necessaria
- Usa apenas hooks e componentes existentes (`useQuery`, `navigate`, `Badge`, `Button`)

### Estrutura dos itens agregados

```text
{
  id: string (id original),
  titulo: string (nome/titulo do item),
  status: string (mapeado),
  _displayStatus: string,
  prioridade: string (default 'media' quando nao disponivel),
  prazo: string | null,
  modulo_origem: string,
  responsavel_id: string,
  profiles: { nome_completo: string },
  _isExternal: true,
  _route: string (rota para navegar),
  registro_origem_titulo: null,
  observacoes: null,
  created_at: string
}
```
