# Finance Control API

Backend NestJS do Finance Control.

## Requisitos

- Node.js 22 ou superior
- npm 11 ou superior
- PostgreSQL acessivel para desenvolvimento

## Setup local

```bash
npm install
cp .env.example .env
```

Depois de copiar o arquivo, configure `DATABASE_URL` e `DIRECT_URL` no `.env`.

```bash
npm run prisma:generate
npm run start:dev
```

Por padrao, a API sobe em `http://localhost:3000`.

## Deploy na Vercel

Crie um projeto separado para a API com estas configuracoes:

- Root Directory: `backend`
- Framework Preset: `Other`
- Build Command: `npm install && npx prisma generate && npm run build`
- Output Directory: deixe vazio

A Vercel usa `api/[...path].ts` como function serverless. O handler remove o prefixo `/api` antes de encaminhar a requisicao ao NestJS, entao `GET /api/health` chega no controller como `GET /health`.

Variaveis esperadas na Vercel da API:

```env
NODE_ENV=production
DATABASE_URL=
DIRECT_URL=
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
CORS_ORIGIN=https://finance-control-bay.vercel.app,http://localhost:5173
```

No frontend, depois que a API subir, configure `VITE_API_URL` apontando para `https://URL-DA-API-VERCEL.vercel.app/api`.

## Variaveis de ambiente

Copie `.env.example` para `.env` e ajuste os valores locais quando necessario.

| Variavel | Padrao | Descricao |
| --- | --- | --- |
| `NODE_ENV` | `development` | Ambiente de execucao. |
| `PORT` | `3000` | Porta HTTP da API. |
| `CORS_ORIGIN` | `http://localhost:5173` | Origem permitida para CORS. Use virgula para multiplas origens. |
| `DATABASE_URL` | - | URL de conexao PostgreSQL usada pela aplicacao. No Supabase, prefira a URL pooled quando aplicavel. |
| `DIRECT_URL` | - | URL direta PostgreSQL usada pelo Prisma em migrations. |
| `FIREBASE_PROJECT_ID` | - | ID do projeto Firebase usado pelo Firebase Admin SDK. |
| `FIREBASE_CLIENT_EMAIL` | - | Client email da service account do Firebase Admin SDK. |
| `FIREBASE_PRIVATE_KEY` | - | Private key da service account. Use `\n` no lugar das quebras de linha dentro do `.env`. |

Nao coloque credenciais reais no `.env.example`.

Exemplo sem credenciais reais:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:6543/DATABASE?pgbouncer=true"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE"
FIREBASE_PROJECT_ID="finance-control-dev"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk@example.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nEXAMPLE\n-----END PRIVATE KEY-----\n"
```

## Prisma

O Supabase deve ser usado apenas como banco PostgreSQL. O backend acessa o banco pelo Prisma, sem Supabase Client.

Gere o Prisma Client:

```bash
npm run prisma:generate
```

Crie e aplique uma migration em desenvolvimento:

```bash
npm run prisma:migrate -- --name init
```

Abra o Prisma Studio:

```bash
npm run prisma:studio
```

## Autenticacao Firebase

O login fica no frontend com Firebase Auth. O backend recebe o token Firebase e valida com Firebase Admin SDK.

O frontend deve enviar o token no header:

```http
Authorization: Bearer TOKEN_DO_FIREBASE
```

Rota de teste do usuario logado:

```bash
curl http://localhost:3000/auth/me \
  -H "Authorization: Bearer TOKEN_DO_FIREBASE"
```

Sem token, a rota deve responder `401 Unauthorized`. Com token valido, se o usuario ainda nao existir no banco, ele sera criado automaticamente com `firebaseUid`, `email`, `name` e `photoUrl`.

## Modulos da API

- `auth`: valida o token Firebase e expoe `GET /auth/me`.
- `users`: expoe `GET /users/me` para retornar o usuario logado.
- `credit-cards`: CRUD de cartoes de credito do usuario logado.
- `categories`: CRUD de categorias do usuario logado.
- `transactions`: CRUD de transacoes, com geracao automatica de parcelas para compras no cartao de credito.
- `invoices`: consulta faturas calculadas a partir de parcelas e permite alterar status das parcelas.
- `health`: health check da API.

Todas as rotas de negocio usam:

```http
Authorization: Bearer TOKEN_DO_FIREBASE
```

Rotas principais:

```http
GET /auth/me
GET /users/me

POST /credit-cards
GET /credit-cards
GET /credit-cards/:id
PATCH /credit-cards/:id
DELETE /credit-cards/:id

POST /categories
GET /categories
GET /categories/:id
PATCH /categories/:id
DELETE /categories/:id

POST /transactions
GET /transactions
GET /transactions/:id
PATCH /transactions/:id
DELETE /transactions/:id

GET /invoices?month=7&year=2026
PATCH /invoices/installments/:id/pay
PATCH /invoices/installments/:id/reopen
PATCH /invoices/installments/:id/cancel
```

Cartoes, categorias e transacoes sempre usam o usuario autenticado vindo do token. Nao envie `userId` no body.

### Criar transacao no cartao de credito

`POST /transactions` cria a transacao original. Quando `paymentMethod` for `CREDIT_CARD`, a API tambem cria as parcelas em `installments`.

```bash
curl -X POST http://localhost:3000/transactions \
  -H "Authorization: Bearer TOKEN_DO_FIREBASE" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Mercado",
    "amount": 300,
    "transactionType": "EXPENSE",
    "paymentMethod": "CREDIT_CARD",
    "purchaseDate": "2026-06-23",
    "categoryId": "uuid-da-categoria",
    "creditCardId": "uuid-do-cartao",
    "installmentsCount": 3,
    "invoiceStartMonth": 7,
    "invoiceStartYear": 2026,
    "notes": "Compra mensal"
  }'
```

Uma compra de `300` em `3x`, iniciando na fatura `07/2026`, gera parcelas de `100` em `07/2026`, `08/2026` e `09/2026`. Quando ha diferenca de centavos no arredondamento, a ultima parcela recebe o ajuste.

Para metodos que nao sao cartao de credito, envie os campos basicos:

```bash
curl -X POST http://localhost:3000/transactions \
  -H "Authorization: Bearer TOKEN_DO_FIREBASE" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Padaria",
    "amount": 25.5,
    "transactionType": "EXPENSE",
    "paymentMethod": "PIX",
    "purchaseDate": "2026-06-23",
    "categoryId": "uuid-da-categoria"
  }'
```

`PATCH /transactions/:id` nesta etapa permite alterar apenas `description`, `notes`, `categoryId` e `purchaseDate`. Campos como `amount`, `paymentMethod`, `creditCardId`, `installmentsCount`, `invoiceStartMonth` e `invoiceStartYear` ficam bloqueados porque exigem recalculo de parcelas.

### Consultar fatura

`GET /invoices` calcula a fatura a partir das parcelas `OPEN`, sem criar tabela de fatura.

```bash
curl "http://localhost:3000/invoices?month=7&year=2026" \
  -H "Authorization: Bearer TOKEN_DO_FIREBASE"
```

Filtros opcionais:

```bash
curl "http://localhost:3000/invoices?month=7&year=2026&creditCardId=uuid-do-cartao" \
  -H "Authorization: Bearer TOKEN_DO_FIREBASE"

curl "http://localhost:3000/invoices?month=7&year=2026&creditCardId=uuid-do-cartao&categoryId=uuid-da-categoria" \
  -H "Authorization: Bearer TOKEN_DO_FIREBASE"
```

Resposta resumida:

```json
{
  "month": 7,
  "year": 2026,
  "total": 850,
  "filters": {
    "creditCardId": null,
    "categoryId": null
  },
  "items": [
    {
      "id": "installment-id",
      "description": "Mercado",
      "amount": 100,
      "installmentNumber": 1,
      "totalInstallments": 3,
      "status": "OPEN",
      "category": {
        "id": "category-id",
        "name": "Alimentacao",
        "color": "#22c55e",
        "icon": "utensils"
      },
      "creditCard": {
        "id": "card-id",
        "name": "Nubank",
        "color": "#8b5cf6"
      },
      "transaction": {
        "id": "transaction-id",
        "purchaseDate": "2026-06-23T00:00:00.000Z"
      }
    }
  ]
}
```

### Alterar status de parcela

```bash
curl -X PATCH http://localhost:3000/invoices/installments/uuid-da-parcela/pay \
  -H "Authorization: Bearer TOKEN_DO_FIREBASE"

curl -X PATCH http://localhost:3000/invoices/installments/uuid-da-parcela/reopen \
  -H "Authorization: Bearer TOKEN_DO_FIREBASE"

curl -X PATCH http://localhost:3000/invoices/installments/uuid-da-parcela/cancel \
  -H "Authorization: Bearer TOKEN_DO_FIREBASE"
```

Todas as consultas e alteracoes validam o usuario autenticado. A API nunca aceita `userId` enviado pelo frontend e nao usa Supabase Client no backend.

## Health check

```bash
curl http://localhost:3000/health
```

Resposta esperada:

```json
{
  "status": "ok",
  "service": "finance-control-api"
}
```

## Comandos uteis

```bash
npm run start:dev
npm test
npm run test:e2e
npm run lint
npm run build
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run prisma:studio
```
