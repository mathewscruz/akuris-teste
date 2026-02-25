

# Diagnostico de CRUD Quebrado

## Bug 1: Incidentes -- Tipo UUID vs Texto (CONFIRMADO)

As colunas `responsavel_deteccao` e `responsavel_tratamento` na tabela `incidentes` sao do tipo **UUID**, mas o `IncidenteDialog.tsx` usa campos `<Input>` de texto livre (linhas 410-435). Quando o usuario digita um nome como "Joao Silva", o PostgreSQL rejeita porque espera um UUID valido.

**Correcao**: Substituir os dois campos `<Input>` por `<UserSelect>` (componente que ja existe no projeto e e usado em Controles, Chaves, Licencas). Isso garante que apenas UUIDs validos sejam enviados. Tambem ajustar o schema Zod de `z.string()` para aceitar UUIDs ou strings vazias.

**Arquivo**: `src/components/incidentes/IncidenteDialog.tsx`
- Importar `UserSelect` de `@/components/riscos/UserSelect`
- Substituir os 2 campos Input (linhas 408-435) por `UserSelect`
- Enviar `null` em vez de string vazia quando nenhum responsavel for selecionado

---

## Bug 2: Riscos -- nivel_risco_inicial pode ficar vazio

O `RiscoFormWizard.tsx` calcula `nivelInicial` via `calcularNivelRisco()` que usa `parseInt()` nos valores de probabilidade/impacto. Se a matriz nao estiver carregada corretamente no momento do submit (ex: `selectedMatriz` ainda `null`), o `calcularNivelRisco` retorna `''` (string vazia). Apesar de `nivel_risco_inicial` ser `NOT NULL text`, o valor vazio pode causar problemas de validacao ou comportamento inesperado no fluxo.

Alem disso, ao editar um risco, se a matriz configuracao nao carregar antes do submit (race condition entre o `useEffect` que carrega matrizes e o `useEffect` que reseta o form), o calculo falha silenciosamente.

**Correcao**: 
- Adicionar validacao pre-submit que verifica se `nivelInicial` nao esta vazio
- Garantir que o botao de submit so fica habilitado apos a matriz estar carregada
- Mostrar mensagem clara caso a matriz nao esteja configurada

**Arquivo**: `src/components/riscos/RiscoFormWizard.tsx`

---

## Verificacao de Outros Modulos

Analisei os demais modulos de CRUD e a situacao e:

| Modulo | Status | Observacao |
|--------|--------|------------|
| Controles | OK | Usa `UserSelect` para `responsavel_id` (UUID) |
| Denuncias | OK | Usa Select com `user_id` dos profiles |
| Ativos | OK | Campos texto, nao UUID |
| Chaves Criptograficas | OK | Usa `UserSelect` |
| Licencas | OK | Usa `UserSelect` |
| Contratos | OK | Usa Select de usuarios |
| Documentos | OK | Sem campo responsavel UUID |
| Contas Privilegiadas | OK | Schema compativel com form |
| Dados Pessoais | OK | Sem campo responsavel UUID |
| ROPA | OK | `responsavel_tratamento` e UUID mas usa Select com `user_id` |
| Solicitacoes Titular | OK | `responsavel_analise` e UUID tratado corretamente |
| Fluxo de Dados | OK | `responsavel_fluxo` e UUID com Select de usuarios |

**Apenas o modulo de Incidentes tem o bug de tipo UUID vs texto.**

---

## Plano de Implementacao

### Passo 1: Corrigir IncidenteDialog (Bug critico)
- Importar `UserSelect`
- Substituir `<Input>` de `responsavel_deteccao` por `<UserSelect>`
- Substituir `<Input>` de `responsavel_tratamento` por `<UserSelect>`
- Enviar `null` quando o valor for vazio (em vez de string vazia)
- Na edicao, carregar o UUID existente no `UserSelect`

### Passo 2: Proteger RiscoFormWizard contra nivel vazio
- Adicionar check `if (!nivelInicial)` antes do submit com toast de erro
- Desabilitar botao de submit enquanto `selectedMatriz` for null
- Adicionar fallback no calculo caso a matriz nao tenha niveis configurados

### Arquivos Afetados
- `src/components/incidentes/IncidenteDialog.tsx`
- `src/components/riscos/RiscoFormWizard.tsx`

