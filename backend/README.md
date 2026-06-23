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
