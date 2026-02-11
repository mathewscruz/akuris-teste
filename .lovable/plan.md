
# Integrar Perfis de Permissao com Gestao de Usuarios

## Analise do Estado Atual

O campo "Perfil" que ja existe no formulario de usuario (linha 731) e na verdade o campo `role` (Super Admin, Admin, Usuario, Somente Leitura). **Nao ha conflito** com a nova estrutura de perfis de permissao -- sao conceitos diferentes:

- **Role** = nivel de acesso geral do sistema (admin, user, etc.)
- **Perfil de Permissao** = template granular de permissoes por modulo (Auditor, Gestor de Riscos, etc.)

## Mudancas Necessarias

### 1. Formulario de Usuario (`GerenciamentoUsuariosEnhanced.tsx`)

**Schema:** Adicionar `permission_profile_id` (string, opcional) ao `usuarioSchema`

**Estado:** Adicionar estado `permissionProfiles` para armazenar lista de perfis disponiveis, carregada na inicializacao

**Dialog de criar/editar:** Adicionar um novo campo Select "Perfil de Permissao" logo apos o campo "Perfil (role)", com opcoes carregadas da tabela `permission_profiles` filtrada por empresa. Incluir opcao "Sem perfil" como valor padrao.

**handleEdit:** Buscar `permission_profile_id` do usuario sendo editado (do `profiles`) e pre-selecionar no form

**handleSubmit (criacao):** Enviar `permission_profile_id` no body da edge function `create-user`

**handleSubmit (edicao):** Alem de atualizar o profile, salvar `permission_profile_id` e chamar `apply_permission_profile` via RPC quando um perfil for selecionado

**fetchUsuarios:** Incluir `permission_profile_id` no select para poder exibir na tabela

**Coluna na tabela:** Renomear coluna "Perfil" atual para "Papel" (role) e adicionar nova coluna "Perfil de Permissao" mostrando o nome do perfil associado ou "Sem perfil"

### 2. Edge Function `create-user/index.ts`

- Aceitar campo opcional `permission_profile_id` no body da requisicao
- Apos criar o profile, salvar `permission_profile_id` no insert do profiles
- Se `permission_profile_id` informado: chamar `apply_permission_profile(profile_id, user_id)` ao inves de `apply_default_permissions_for_user`
- Se nao informado: manter comportamento atual com `apply_default_permissions_for_user`

### 3. Tabela de Usuarios - Coluna Visual

Adicionar na DataTable uma coluna que mostra o perfil de permissao vinculado com badge, facilitando a visualizacao rapida de quem tem qual perfil.

### Arquivos Modificados

| Arquivo | Mudanca |
|---------|---------|
| `src/components/configuracoes/GerenciamentoUsuariosEnhanced.tsx` | Adicionar campo de perfil de permissao no form, carregar perfis, exibir na tabela, aplicar ao salvar |
| `supabase/functions/create-user/index.ts` | Receber `permission_profile_id`, salvar no profile e aplicar permissoes do perfil |
