# Finance Control Frontend

Frontend React do Finance Control.

## Tecnologias configuradas

- React com Vite e TypeScript
- TailwindCSS com `darkMode: "class"`
- React Router
- Axios
- Firebase Auth
- GSAP
- Vite PWA
- Lucide React

## Setup local

```bash
npm install
cp .env.example .env
npm run dev
```

O Vite abre por padrao em `http://localhost:5173`.

## Variaveis de ambiente

Copie `.env.example` para `.env` e preencha os valores locais.

```env
VITE_API_URL="http://localhost:3000"
VITE_FIREBASE_API_KEY=""
VITE_FIREBASE_AUTH_DOMAIN=""
VITE_FIREBASE_PROJECT_ID=""
VITE_FIREBASE_STORAGE_BUCKET=""
VITE_FIREBASE_MESSAGING_SENDER_ID=""
VITE_FIREBASE_APP_ID=""
```

Nao coloque credenciais reais no repositorio.

## Rotas iniciais

Rotas publicas:

- `/login`
- `/register`
- `/forgot-password`

Rotas privadas ainda sem protecao real:

- `/`
- `/invoices`
- `/transactions`
- `/transactions/new`
- `/credit-cards`
- `/categories`
- `/settings`

A protecao real das rotas sera adicionada depois da configuracao completa do Firebase Auth no frontend.

## Comandos uteis

```bash
npm run dev
npm run build
npm run preview
```
