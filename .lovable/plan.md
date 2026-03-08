

# Adicionar Paginação nas Tabelas de Configurações

O componente `DataTable` já suporta a prop `paginated` nativamente. Basta ativá-la nas 4 instâncias dentro do módulo de configurações.

## Alterações

### 1. `src/components/configuracoes/GerenciamentoUsuariosEnhanced.tsx`
- Adicionar `paginated` na DataTable de usuários

### 2. `src/components/configuracoes/GerenciamentoEmpresas.tsx`
- Adicionar `paginated` na DataTable de empresas

### 3. `src/components/configuracoes/CreditosIAManager.tsx`
- Adicionar `paginated` na DataTable de empresas/créditos
- Adicionar `paginated` na DataTable de histórico de consumo (dentro do Sheet)

Todas usarão o `pageSize` padrão do componente (10 itens por página).

