

# Ajustes no Header: Logo no Mobile + Botao Voltar

## O que sera feito

### 1. Substituir o botao de expandir sidebar pelo logo no mobile
No header (`src/components/Layout.tsx`), o `SidebarTrigger` sera exibido **apenas em desktop** (classe `hidden md:flex`). No mobile, sera exibido o logo do sistema (imagem `akuris-logo.png`) no lugar, funcionando como link para o Dashboard.

### 2. Adicionar botao "Voltar" no header (desktop e mobile)
Um botao com icone de seta para a esquerda (`ArrowLeft`) sera adicionado ao header, visivel em ambas as plataformas. Ele aparecera **somente quando o usuario nao estiver no Dashboard** (pagina raiz), pois no Dashboard nao faz sentido "voltar". O botao usara `navigate(-1)` para voltar a pagina anterior do historico.

---

## Detalhes tecnicos

### Arquivo: `src/components/Layout.tsx`

Alteracoes no bloco do header (linha 152-178):

- Importar `ArrowLeft` de `lucide-react` e o logo (`akuris-logo.png`)
- Condicional no header:
  - **Mobile**: exibir `<img>` com o logo (altura ~28px), clicavel levando ao Dashboard
  - **Desktop**: manter o `<SidebarTrigger />` como esta
- Apos o logo/trigger, adicionar botao voltar:
  - Visivel quando `location.pathname !== '/dashboard'`
  - Icone `ArrowLeft`, estilo `ghost`, tamanho compacto
  - `onClick={() => navigate(-1)}`

### Estrutura visual do header (mobile):

```text
[Logo] [<-] [Breadcrumb...]          [Notif] [User]
```

### Estrutura visual do header (desktop):

```text
[Sidebar Toggle] [<-] [Breadcrumb...]   [Search] [Lang] [Log] [Notif] [User]
```

### Arquivo unico modificado
- `src/components/Layout.tsx`
