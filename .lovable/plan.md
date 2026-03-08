

# Validacao Completa — Modulo Documentos

Analisei todos os componentes: Documentos.tsx, DocumentoDialog.tsx, CategoriasDialog.tsx, VinculacoesDialog.tsx, AprovacaoDialog.tsx, ComentariosDialog.tsx, DocumentoPreview.tsx, UploadMultiplosDialog.tsx, DocumentosRelatorios.tsx, BuscaAvancadaDocumentos.tsx, TrilhaAuditoriaDocumentos.tsx, RenovarDocumentoDialog.tsx, HistoricoVersoesDialog.tsx, DocGenDialog.tsx, useDocumentosStats.tsx.

---

## OK — Sem problemas

- **Documentos.tsx** — query principal filtra por `empresa_id` via `useEmpresaId`, queryKey inclui `empresaId`. DropdownMenu padrao. Paginacao, filtros, CSV export, empty states, confirm dialog, deep link aprovacao — tudo presente e funcional.
- **DocumentoDialog** — grava `empresa_id` corretamente via profile. CRUD completo com upload, tags, vencimento, aprovacao. OK.
- **DocumentoPreview** — signed URL com 1h. Download funcional. OK.
- **ComentariosDialog** — query por `documento_id` (RLS protege). CRUD com toast. OK.
- **TrilhaAuditoriaDocumentos** — query por `record_id`. OK.
- **RenovarDocumentoDialog** — upload + edge function. OK.
- **HistoricoVersoesDialog** — query por `documento_id`. OK.
- **BuscaAvancadaDocumentos** — filtros client-side sobre dados ja carregados. OK.
- **DocumentosRelatorios** — recebe dados ja filtrados por empresa como prop. OK.

---

## Problemas Identificados

### 1. SEGURANCA — `useDocumentosStats` sem filtro `empresa_id` e queryKey estatica

O hook busca `supabase.from('documentos').select('status, data_vencimento, classificacao, data_aprovacao')` sem `.eq('empresa_id', empresaId)`. A queryKey e fixa `['documentos-stats']`, causando cache compartilhado entre empresas.

**Correcao**: Importar `useEmpresaId`, filtrar por `empresa_id`, incluir `empresaId` na queryKey.

### 2. SEGURANCA — `CategoriasDialog.fetchCategorias` sem filtro `empresa_id`

Linha 54-57: `supabase.from('documentos_categorias').select('*').order('nome')` — sem filtro de empresa. Categorias de outras empresas podem aparecer na listagem. O save ja grava com `empresa_id` correto.

**Correcao**: Adicionar `.eq('empresa_id', empresaId)`. Precisa receber `empresaId` como prop ou buscar internamente.

### 3. SEGURANCA — `AprovacaoDialog.fetchProfiles` sem filtro `empresa_id`

Linha 256-260: `supabase.from('profiles').select('user_id, nome, email, role').in('role', ['admin', 'super_admin'])` — retorna admins de TODAS as empresas. Um usuario pode solicitar aprovacao a um admin de outra empresa.

**Correcao**: Adicionar `.eq('empresa_id', empresaId)` para listar apenas admins da mesma empresa.

### 4. SEGURANCA — `VinculacoesDialog.fetchItemsDisponiveis` sem filtro `empresa_id`

Linhas 182-205: todas as queries de items disponiveis (contratos, auditorias, riscos, controles, ativos) nao filtram por `empresa_id`. Depende exclusivamente de RLS. Items de outras empresas poderiam aparecer nos dropdowns de vinculacao.

**Correcao**: Adicionar `.eq('empresa_id', empresaId)` em cada query de modulo.

### 5. UX — Loading state sem PageSkeleton

Linhas 398-407 em Documentos.tsx: o loading usa spinner + texto "Carregando documentos..." em vez do componente `PageSkeleton` padrao.

**Correcao**: Substituir por `PageSkeleton`.

### 6. UX — Filtro "Categoria" na verdade filtra por classificacao

Linhas 534-546: o dropdown "Categoria" popula com `documentos_categorias` (Politicas, Procedimentos etc.) mas o filtro real (linha 199-201) compara `doc.classificacao === selectedCategoria`. Classificacao e outro campo (publica, interna, restrita, confidencial). Ou seja, o filtro nunca encontra correspondencia porque os valores de `categorias.nome` nao batem com os valores de `classificacao`.

**Correcao**: Corrigir a logica. Existem duas opcoes: (a) o filtro deveria comparar com o campo correto (categoria_id, se existir), ou (b) renomear o dropdown para "Classificacao" e popular com os valores corretos. Como a tabela `documentos` nao tem campo `categoria_id`, a opcao mais simples e renomear para "Classificacao" e popular com publica/interna/restrita/confidencial.

### 7. UX — Filtro de status inclui "vencido" mas documentos nao tem esse status no banco

Linha 557: `<SelectItem value="vencido">Vencido</SelectItem>` — no DocumentoDialog, os status possiveis sao `ativo`, `inativo`, `arquivado`, `pendente`. Nenhum documento tera status `vencido` no banco, tornando esse filtro inutilizado.

**Correcao**: Remover "vencido" dos filtros de status (ou implementar logica especial para filtrar por data_vencimento < hoje quando selecionado "vencido"). Recomendo implementar logica especial pois e util para o usuario.

### 8. UX — Tipo "documento" existe no dialog mas nao nos filtros da tabela

Linha 301 no DocumentoDialog: `<SelectItem value="documento">Documento</SelectItem>` — mas nos filtros da tabela (linhas 565-574), "documento" nao aparece como opcao. Um documento criado com tipo "documento" nao sera encontravel pelo filtro de tipo.

**Correcao**: Adicionar `<SelectItem value="documento">Documento</SelectItem>` nos filtros de tipo, e tambem o tipo "manual" (presente nos dados demo).

---

## Resumo de Acoes

| # | Problema | Tipo | Impacto |
|---|----------|------|---------|
| 1 | `useDocumentosStats` sem empresa_id | Seguranca/Cache | **Alto** |
| 2 | CategoriasDialog sem empresa_id | Seguranca | **Alto** |
| 3 | AprovacaoDialog fetchProfiles sem empresa_id | Seguranca | **Alto** |
| 4 | VinculacoesDialog fetchItems sem empresa_id | Seguranca | **Alto** |
| 5 | Loading sem PageSkeleton | UX | **Baixo** |
| 6 | Filtro "Categoria" filtra campo errado | Funcional/UX | **Alto** |
| 7 | Status "vencido" nunca encontra dados | Funcional | **Medio** |
| 8 | Tipo "documento"/"manual" ausente nos filtros | Funcional | **Medio** |

Todos os 8 itens serao implementados.

### Arquivos a editar:
- `src/hooks/useDocumentosStats.tsx` — empresa_id filter + queryKey
- `src/components/documentos/CategoriasDialog.tsx` — empresa_id filter (receber como prop ou buscar)
- `src/components/documentos/AprovacaoDialog.tsx` — empresa_id filter no fetchProfiles
- `src/components/documentos/VinculacoesDialog.tsx` — empresa_id filter em fetchItemsDisponiveis
- `src/pages/Documentos.tsx` — PageSkeleton, corrigir filtro categoria→classificacao, logica status vencido, adicionar tipos faltantes nos filtros

