

# Reestruturação UX — Módulo Configurações

## Diagnóstico (visão de P.O.)

O módulo tem até **9 abas** para super_admin. A organização atual é funcional, mas apresenta problemas de arquitetura de informação que geram confusão e cliques desnecessários:

```text
ESTADO ATUAL (até 9 abas):
┌─────────┬──────────┬───────────┬────────────┬──────────┐
│Empresas │Usuários  │Permissões │Integrações │Denúncia  │
├─────────┼──────────┼───────────┼────────────┼──────────┤
│Créd. IA │Assinatura│Organização│  Geral     │          │
└─────────┴──────────┴───────────┴────────────┴──────────┘
```

**Problemas identificados:**

1. **"Geral" é um saco de gatos** — Mistura logo da empresa (identidade), preferências pessoais de notificação, teste de email e lembretes de convite. São 4 assuntos sem relação entre si.

2. **"Organização" vs "Geral" — naming confuso** — Ambos parecem "configurações da empresa". O usuário não sabe onde clicar para encontrar o logo ou o setor de atuação.

3. **Logo da empresa separado do contexto da empresa** — Logo está em "Geral", setor/porte/objetivo está em "Organização". São ambos dados da empresa e deveriam estar juntos.

4. **Lembretes de convite dentro de "Geral"** — É uma funcionalidade de gestão de usuários (convites pendentes). Deveria estar acessível a partir do contexto de Usuários.

5. **Usuários e Permissões separados** — São dois lados da mesma moeda (quem acessa e o que pode fazer). A separação força o admin a alternar entre abas constantemente.

6. **Assinatura e Créditos IA separados** — Para super_admin, são dois aspectos financeiros/de plano. Poderiam coexistir.

7. **Ordem das abas não segue prioridade de uso** — "Organização" (configuração feita 1x) está ao lado de "Assinatura" (consultada raramente), enquanto "Geral" (usada frequentemente) está no final.

---

## Proposta de reestruturação

```text
ESTADO PROPOSTO (6 abas, agrupamento lógico):
┌─────────┬──────────────────┬────────────┬──────────┬─────────────┬──────────────┐
│Empresas*│Usuários & Acessos│Organização │Integrações│Denúncia    │Assinatura    │
└─────────┴──────────────────┴────────────┴──────────┴─────────────┴──────────────┘
                                                         * super_admin only
```

### Mudanças concretas:

**1. Fundir "Usuários" + "Permissões" + "Lembretes" → "Usuários & Acessos"**
- Conteúdo: UserManagement, PermissionMatrix, ReminderSettings
- Layout: sub-tabs internas (Usuários | Perfis de Permissão | Lembretes)
- Motivo: tudo relacionado a "quem acessa e com que permissões"

**2. Fundir "Organização" + "Identidade Visual" + "Email" → "Organização"**
- Conteúdo: CompanyContextSettings (setor, porte, objetivo), Logo upload, Teste de email
- Motivo: tudo sobre "quem somos e como nos apresentamos"

**3. Fundir "Assinatura" + "Créditos IA" → "Assinatura"**
- Conteúdo: AssinaturaTab + CreditosIAManager (apenas para super_admin, como seção adicional)
- Motivo: ambos são sobre o plano/billing da empresa

**4. Eliminar aba "Geral"**
- Notificações pessoais (localStorage) → movidas para o **UserProfilePopover** (menu do usuário no header), onde faz mais sentido como preferência pessoal
- Logo → movido para "Organização"
- Teste de email → movido para "Organização"
- Lembretes → movido para "Usuários & Acessos"

**5. Manter "Integrações" e "Denúncia" como estão** — escopo correto.

---

## Impacto nos arquivos

### `src/pages/Configuracoes.tsx`
- Reduzir de 9 para 6 abas
- Aba "Usuários & Acessos": renderizar sub-tabs internas com GerenciamentoUsuariosEnhanced, PermissionMatrix e ReminderSettings
- Aba "Organização": renderizar CompanyContextSettings + seção de Identidade Visual (logo) + seção de Teste de Email
- Aba "Assinatura": renderizar AssinaturaTab + CreditosIAManager (condicional super_admin)
- Remover abas "Permissões", "Créditos IA", "Geral"

### `src/components/configuracoes/ConfiguracoesGerais.tsx`
- Extrair a seção de Logo para um componente reutilizável `CompanyLogoUpload.tsx`
- Extrair a seção de Teste de Email para ficar junto com "Organização"
- Mover preferências de notificação para `UserProfilePopover.tsx`

### `src/components/UserProfilePopover.tsx`
- Adicionar seção simples de "Preferências de Notificação" (os 2 switches + digest frequency) — é configuração pessoal, não da empresa

### Novos componentes:
- `src/components/configuracoes/CompanyLogoUpload.tsx` — extraído de ConfiguracoesGerais
- `src/components/configuracoes/UsersAccessTab.tsx` — wrapper com sub-tabs (Usuários | Permissões | Lembretes)
- `src/components/configuracoes/OrganizacaoTab.tsx` — wrapper que agrupa CompanyContextSettings + CompanyLogoUpload + EmailTest

### Arquivos que deixam de existir:
- `src/components/configuracoes/ConfiguracoesGerais.tsx` — conteúdo redistribuído

---

## Resultado esperado

| Antes | Depois | Benefício |
|-------|--------|-----------|
| 9 abas (super_admin) | 6 abas | Menos carga cognitiva |
| Logo em "Geral", contexto em "Organização" | Tudo em "Organização" | Agrupamento lógico |
| Permissões separada de Usuários | Sub-tab dentro de "Usuários & Acessos" | Fluxo contínuo |
| Notificação pessoal em "Geral" | No popover do perfil | Localização intuitiva |
| "Geral" como catch-all | Eliminada | Sem ambiguidade |
| Créditos IA separado de Assinatura | Seção dentro de Assinatura | Billing centralizado |

