# Finance Control API

Backend NestJS do Finance Control.

## Requisitos

- Node.js 22 ou superior
- npm 11 ou superior

## Setup local

```bash
npm install
cp .env.example .env
npm run start:dev
```

Por padrão, a API sobe em `http://localhost:3000`.

## Variáveis de ambiente

Copie `.env.example` para `.env` e ajuste os valores locais quando necessário.

| Variável | Padrão | Descrição |
| --- | --- | --- |
| `NODE_ENV` | `development` | Ambiente de execução. |
| `PORT` | `3000` | Porta HTTP da API. |
| `CORS_ORIGIN` | `http://localhost:5173` | Origem permitida para CORS. Use vírgula para múltiplas origens. |

Não coloque credenciais reais no `.env.example`.

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

## Comandos úteis

```bash
npm run start:dev
npm test
npm run test:e2e
npm run lint
npm run build
```
