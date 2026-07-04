# Imobiliária KS — Imóveis em Bombinhas

Landing page de captação da Imobiliária KS para imóveis prontos, investimentos
e lançamentos em diferentes regiões de Bombinhas/SC.

## Desenvolvimento

Requisitos:

- Node.js 20 ou superior
- npm

```bash
npm install
npm run dev
```

A aplicação ficará disponível no endereço informado pelo Vite, normalmente
`http://localhost:5173`.

## Validação e build

```bash
npm run check
npm run preview
```

O build de produção é gerado em `dist/`.

## Publicação

O projeto está configurado para Vercel. Ao importar este repositório:

- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`
- Node.js: `20.x` ou superior

Cada pull request ou branch conectada à Vercel pode gerar um preview para
aprovação antes da publicação em produção.

## Formulários e CRM

Os formulários já capturam dados visíveis, UTMs, click IDs, URL, origem,
data de envio e contexto do empreendimento. O endpoint definitivo do CRM
ainda precisa ser confirmado.

Até a integração ser concluída, falhas de envio apresentam um canal de
contingência pelo WhatsApp.

## Antes da produção

- Confirmar endpoint e autenticação do CRM.
- Confirmar o telefone oficial do WhatsApp.
- Validar valores, disponibilidade e condições comerciais.
- Configurar domínio, analytics e pixels na Vercel.
- Realizar um envio de teste e confirmar a criação do lead no CRM.
