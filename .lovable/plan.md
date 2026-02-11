
# AkurIA - Chatbot Inteligente no Dashboard

## Resumo

Transformar o "Resumo com IA" (card estático) em um chatbot flutuante chamado **AkurIA**, posicionado como botão no canto inferior direito da tela. O chatbot permite conversas interativas sobre os módulos do sistema, com streaming de respostas. O espaço liberado no dashboard será reorganizado para melhor distribuição dos cards restantes.

## Mudancas Visuais

### Antes (layout atual)
```text
[Hero Score Banner                                        ]
[KPI Pills                                                ]
[Resumo IA (2/3)              ] [Vencimentos (1/3)        ]
[Radar (1/3)] [Timeline (1/3)] [Atividades (1/3)          ]
```

### Depois (novo layout)
```text
[Hero Score Banner                                        ]
[KPI Pills                                                ]
[Vencimentos (1/3)] [Radar (1/3)] [Timeline (1/3)         ]
[Atividades Recentes (full width)                         ]
                                        [Botão AkurIA FAB]
```

Com a remoção do card "Resumo IA" (que ocupava 2/3), os demais cards serão reorganizados em uma distribuição mais equilibrada: Vencimentos, Radar e Timeline ficam em uma linha de 3 colunas, e Atividades Recentes ocupa a largura total abaixo.

## Componente AkurIA Chatbot

Um botão flutuante (FAB) no canto inferior direito com o favicon do Akuris como ícone. Ao clicar, abre um painel de chat com:
- Header com nome "AkurIA" e botão fechar
- Área de mensagens com scroll
- Input de texto com botão enviar
- Streaming de respostas token-a-token
- Renderização markdown nas respostas

## Edge Function: akuria-chat

Nova edge function que:
- Recebe o histórico de mensagens do chat
- Busca dados contextuais da empresa (riscos, controles, incidentes, etc.) -- reaproveitando a lógica do `dashboard-ai-summary`
- Envia para a Lovable AI Gateway com system prompt de consultor GRC
- Retorna streaming SSE para renderização progressiva
- Consome crédito de IA por mensagem

## Detalhes Tecnicos

### Arquivos a criar

**`src/components/dashboard/AkurIAChatbot.tsx`**
- Componente com estado open/closed
- Botão FAB fixo (`fixed bottom-6 right-6 z-50`) com imagem `/akuris-favicon.png`
- Painel de chat com `fixed bottom-20 right-6 w-96 h-[500px]`
- Gerenciamento de mensagens com useState
- Streaming SSE usando fetch + ReadableStream
- Markdown rendering com formatação simples (bold, listas)
- Tratamento de erros 429/402 com toast

**`supabase/functions/akuria-chat/index.ts`**
- Recebe `{ messages }` do frontend
- Autentica o usuário e obtém empresa_id
- Consome crédito de IA (funcionalidade `akuria_chat`)
- Busca dados resumidos da empresa (riscos, controles, incidentes, documentos, contratos, frameworks)
- Envia para `https://ai.gateway.lovable.dev/v1/chat/completions` com streaming
- System prompt: consultor GRC que conhece os dados da empresa e pode responder perguntas sobre módulos, dar insights e recomendações
- Retorna stream SSE direto ao frontend

### Arquivos a modificar

**`src/pages/Dashboard.tsx`**
- Remover import e uso de `ExecutiveSummaryAI`
- Adicionar import de `AkurIAChatbot`
- Reorganizar grid: linha 1 com 3 colunas (Vencimentos + Radar + Timeline), linha 2 com Atividades full width
- Renderizar `<AkurIAChatbot />` no final do componente

**`supabase/config.toml`**
- Adicionar entrada `[functions.akuria-chat]` com `verify_jwt = true`

### System Prompt do AkurIA
O chatbot receberá um prompt de sistema que inclui:
- Dados resumidos da empresa (totais de riscos, controles, incidentes, etc.)
- Instrução para responder como consultor GRC especializado
- Instrução para usar os dados fornecidos sem inventar informações
- Capacidade de dar recomendações, explicar conceitos de GRC e analisar a situação da empresa
