

# Adicionar Framework NIS2 (Diretiva EU 2022/2555)

## O que e o NIS2?
A Diretiva NIS2 (Network and Information Security Directive 2) e a legislacao europeia sobre ciberseguranca que entrou em vigor em janeiro de 2023, substituindo a NIS1. Ela define obrigacoes de gestao de riscos, reporte de incidentes e governanca para entidades essenciais e importantes na UE.

## O que sera feito

### 1. Criar o registro do framework no banco de dados
Inserir na tabela `gap_analysis_frameworks` com:
- Nome: `NIS2`
- Versao: `2022/2555`
- Tipo: `compliance`
- Template global (`is_template = true`, `empresa_id = NULL`)

### 2. Criar os requisitos (controles) do NIS2
Inserir ~45 requisitos na tabela `gap_analysis_requirements` organizados pelos principais capitulos/artigos da diretiva:

| Categoria | Artigos | Qtd | Temas |
|-----------|---------|-----|-------|
| Ambito e Definicoes | Art. 1-6 | 5 | Objetivo, ambito, definicoes, entidades essenciais/importantes |
| Governanca e Responsabilidade | Art. 20 | 4 | Responsabilidade da gestao, formacao, supervisao |
| Medidas de Gestao de Riscos | Art. 21 | 10 | Politicas de seguranca, gestao de incidentes, continuidade, supply chain, criptografia, controle de acesso, MFA, etc. |
| Reporte de Incidentes | Art. 23-24 | 6 | Alerta inicial (24h), notificacao (72h), relatorio final, informacao aos destinatarios |
| Supervisao e Execucao | Art. 31-37 | 6 | Auditorias, inspecoes, sancoes, multas |
| Seguranca da Cadeia de Suprimentos | Art. 21(2)(d) | 4 | Avaliacao de fornecedores, clausulas contratuais, monitoramento |
| Compartilhamento de Informacoes | Art. 29-30 | 3 | Cooperacao, CSIRTs, divulgacao de vulnerabilidades |
| Registros e Documentacao | Art. 27-28 | 3 | Registro de entidades, base de dados de dominios |
| Jurisdicao e Cooperacao | Art. 25-26 | 4 | Jurisdicao, assistencia mutua, cooperacao transfronteirica |

### 3. Adicionar deteccao do NIS2 no framework-configs.ts
Adicionar regra no `getFrameworkConfig()` para detectar "nis2" e retornar configuracao com:
- `scoreType: 'percentage'`
- `chartType: 'stacked'` (compliance/audit)

### 4. Adicionar icone no FrameworkLogos.tsx
Mapear "NIS2" para um icone adequado (ex: `Globe` ou `Network` com cor azul EU).

---

## Secao Tecnica

### Arquivos afetados
| Arquivo | Alteracao |
|---------|-----------|
| Banco de dados (INSERT) | 1 framework + ~45 requisitos |
| `src/lib/framework-configs.ts` | Adicionar deteccao "nis2" no `getFrameworkConfig()` |
| `src/components/gap-analysis/FrameworkLogos.tsx` | Adicionar mapeamento de icone NIS2 |

### Estrutura dos requisitos
Cada requisito segue o padrao existente:
- `codigo`: Referencia ao artigo (ex: "Art. 21(2)(a)")
- `titulo`: Nome do controle
- `descricao`: Explicacao detalhada do requisito
- `categoria`: Capitulo/secao da diretiva
- `area_responsavel`: Area tipicamente responsavel (TI, Compliance, Juridico, CISO)
- `peso`: 1-3 conforme criticidade
- `obrigatorio`: true/false
- `ordem`: Sequencia numerica
- `is_template`: true (global, compartilhado entre empresas)

