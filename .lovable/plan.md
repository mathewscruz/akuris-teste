

# Plano: Corrigir relatórios PDF

## Problemas identificados

1. **Logo espremido**: Na capa usa `60x30mm` e no header `40x20mm` — proporção 2:1 está incorreta para o logo Akuris que é mais largo. Precisa corrigir para ~3:1 (ex: `60x20mm` na capa, `36x12mm` no header).

2. **Informações redundantes**: Na página 2 (linhas 104-120 do `ExportFrameworkPDF.tsx`) há um box com "Empresa" e "Framework" que já constam na capa. Remover.

3. **Caracteres ilegíveis**: jsPDF não suporta emojis (🟡, 🔴, etc.). O "Nível de Maturidade" no PDF mostra "Ø=ßà" ao invés do emoji. Os `statusLabel` com ✓, ◐, ✗, ○, − também podem falhar. Precisa substituir por texto puro ou indicadores simples.

## Mudanças

### Arquivo 1: `src/lib/pdf-utils.ts`

| Local | Mudança |
|-------|---------|
| `addAkurisCover` (linha 137) | Alterar dimensões do logo de `60x30` para `60x20` (proporção correta) |
| `addAkurisHeader` (linha 62) | Alterar de `40x20` para `36x12` e centralizar verticalmente no header |

### Arquivo 2: `src/components/gap-analysis/ExportFrameworkPDF.tsx`

| Local | Mudança |
|-------|---------|
| Linhas 104-120 | Remover bloco do info box (Empresa/Framework) — já está na capa |
| Função `statusLabel` (linhas 55-64) | Substituir emojis/símbolos Unicode por texto simples: "Conforme", "Parcial", "Não Conforme", "N/A", "Não Avaliado" |
| Linha 168 | Remover `maturity.icon` (emoji) da string do nível de maturidade — usar apenas "Nível X — Nome" |

### Arquivo 3: `src/components/riscos/ExportRiscosPDF.tsx`

Verificar e aplicar mesma correção de proporção do logo (usa `addAkurisHeader` — já será corrigido centralmente).

## Impacto

- Todos os PDFs exportados (frameworks, riscos, documentos, relatórios) herdam a correção do logo via `pdf-utils.ts`
- Nenhum caractere ilegível nos PDFs
- Informação limpa sem redundância

