

# Alinhar Visualmente o Card Maturidade GRC com o Card Evolucao dos Riscos

## Problema
O card "Maturidade GRC" tem altura do grafico diferente do card "Evolucao dos Riscos". O card de Riscos usa `h-52 sm:h-72` como wrapper do grafico, enquanto o Maturidade usa `height={250}` fixo no ResponsiveContainer. Isso causa desalinhamento vertical entre os dois cards.

## Mudanca

### Arquivo: `src/components/dashboard/MultiDimensionalRadar.tsx`

1. Envolver o `ResponsiveContainer` em um `div` com `className="h-52 sm:h-72 w-full"` (mesmo wrapper do card de Riscos)
2. Mudar o `ResponsiveContainer` de `height={250}` para `height="100%"` (preenche o wrapper, igual ao card de Riscos)

Isso garante que ambos os cards tenham exatamente a mesma altura de area de grafico em todos os breakpoints.

## Resultado esperado
Os dois cards terao estrutura identica:
- CardHeader com titulo
- CardHeader com numero + icone + badge
- CardContent com div h-52/h-72 contendo o grafico
- Rodape com grid 4 colunas

