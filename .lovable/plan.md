

# Validacao Completa — Modulo Governanca (Controles + Auditorias)

Analisei em profundidade todos os componentes: Governanca.tsx, ControlesContent.tsx, AuditoriasContent.tsx, AuditoriaDialog.tsx, AuditoriaCardAccordion.tsx, ItensAuditoriaDialog.tsx, ControleDialog.tsx, CategoriasDialog.tsx, TestesList.tsx, useControlesStats.tsx, useAuditoriaData.tsx.

---

## RLS — OK

Tabelas `controles`, `auditorias`, `auditoria_itens`, `controles_categorias`, `controles_testes`, `controles_auditorias` possuem RLS com policies baseadas em `get_user_empresa_id()`.

---

## Problemas Identificados

### 1. SEGURANCA — `useControlesStats` sem filtro `empresa_id` e queryKey estatica

O hook busca `supabase.from('controles').select('status, criticidade, tipo, proxima_avaliacao')` sem `.eq('empresa_id', empresaId)`. A queryKey e fixa `['controles-stats']`, causando cache compartilhado entre empresas.

**Correcao**: Importar `useEmpresaId`, filtrar por `empresa_id`, incluir `empresaId` na queryKey.

### 2. SEGURANCA — `ControlesContent` busca `controles_categorias` sem filtro `empresa_id`

Linha 241: `supabase.from('controles_categorias').select('*').order('nome')` — sem `.eq('empresa_id', empresaId)`. Categorias de outras empresas podem aparecer no dropdown. A queryKey tambem e estatica `['controles_categorias']`.

**Correcao**: Adicionar `.eq('empresa_id', empresaId!)` e incluir `empresaId` na queryKey.

### 3. SEGURANCA — `ControlesContent` busca `controles_testes` sem filtro `empresa_id`

Linha 166: `supabase.from('controles_testes').select('controle_id')` busca TODOS os testes de todas as empresas para calcular contagem. Depende apenas de RLS.

**Correcao**: Filtrar os IDs dos controles ja buscados (que ja sao da empresa) para limitar: `.in('controle_id', controleIds)`.

### 4. SEGURANCA — `CategoriasDialog` busca categorias sem filtro `empresa_id`

Linha 48-51: `supabase.from('controles_categorias').select('*').order('nome')` — sem filtro de empresa. O save grava corretamente com `empresa_id`, mas a listagem pode mostrar categorias de outras empresas.

**Correcao**: Adicionar filtro `empresa_id` na query de listagem.

### 5. SEGURANCA — `AuditoriasContent` busca auditorias sem filtro `empresa_id`

Linha 49-52: `supabase.from('auditorias').select('*').order(...)` — sem `.eq('empresa_id', empresaId)`. Depende exclusivamente de RLS. A queryKey tambem nao inclui `empresaId`.

**Correcao**: Importar `useEmpresaId`, adicionar filtro e incluir na queryKey.

### 6. SEGURANCA — `useUsuariosEmpresa` busca profiles sem filtro `empresa_id`

Linha 65-69 em `useAuditoriaData.tsx`: `supabase.from('profiles').select(...).eq('ativo', true)` — retorna usuarios de TODAS as empresas. Usado nos dropdowns de responsaveis de auditorias.

**Correcao**: Adicionar `.eq('empresa_id', empresaId)`.

### 7. UX — Coluna de acoes em Controles usa botoes inline

A coluna de acoes (linhas 511-567) usa 4 botoes ghost inline (Edit, TestTube, Link, Trash2), nao seguindo o padrao DropdownMenu adotado nos demais modulos.

**Correcao**: Migrar para `DropdownMenu` com `MoreHorizontal`.

### 8. UX — Coluna de acoes em Auditorias usa botoes inline

`AuditoriaCardAccordion.tsx` linhas 101-120 usa botoes ghost inline (Edit, Trash2). Inconsistente com o padrao DropdownMenu.

**Correcao**: Migrar para `DropdownMenu` com `MoreHorizontal`.

### 9. SEGURANCA — `controles_auditorias` vinculos sem filtro

Linha 136-141 em `ControlesContent.tsx`: `supabase.from('controles_auditorias').select('controle_id, auditoria_id')` — busca vinculos de todas as empresas. Sem `empresa_id` na tabela de juncao, mas os controles ja sao filtrados, entao os vinculos "orfaos" nao aparecem na UI. Risco baixo, mas viola o padrao.

**Correcao**: Limitar query com `.in('controle_id', controleIds)` apos carregar controles, ou aceitar como risco baixo dado RLS.

---

## Resumo de Acoes

| # | Problema | Tipo | Impacto |
|---|----------|------|---------|
| 1 | `useControlesStats` sem empresa_id | Seguranca/Cache | **Alto** |
| 2 | Categorias sem empresa_id (ControlesContent) | Seguranca | **Alto** |
| 3 | `controles_testes` sem filtro | Seguranca | **Medio** |
| 4 | `CategoriasDialog` sem empresa_id | Seguranca | **Alto** |
| 5 | Auditorias sem empresa_id | Seguranca/Cache | **Alto** |
| 6 | `useUsuariosEmpresa` sem empresa_id | Seguranca | **Alto** |
| 7 | Controles acoes inline | UX | **Medio** |
| 8 | Auditorias acoes inline | UX | **Medio** |
| 9 | `controles_auditorias` vinculos sem filtro | Seguranca | **Baixo** |

### Arquivos a editar:
- `src/hooks/useControlesStats.tsx` — empresa_id filter + queryKey
- `src/hooks/useAuditoriaData.tsx` — empresa_id filter no `useUsuariosEmpresa`
- `src/components/governanca/ControlesContent.tsx` — categorias + testes + vinculos com empresa_id, acoes DropdownMenu
- `src/components/governanca/AuditoriasContent.tsx` — empresa_id filter + queryKey
- `src/components/controles/CategoriasDialog.tsx` — empresa_id filter
- `src/components/auditorias/AuditoriaCardAccordion.tsx` — DropdownMenu

Todos os 9 itens serao implementados.

