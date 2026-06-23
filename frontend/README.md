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

Para configurar o Firebase, crie um app web no Firebase Console e copie as
chaves publicas do SDK para as variaveis `VITE_FIREBASE_*`. Essas chaves sao
usadas pelo Firebase SDK no navegador; mesmo assim, mantenha o `.env` local fora
do Git.

## Autenticacao

O frontend usa Firebase Auth com e-mail e senha.

- `src/contexts/AuthContext.tsx` controla usuario logado, carregamento, login,
  cadastro, logout, recuperacao de senha e leitura do ID token.
- `src/hooks/useAuth.ts` expoe o contexto de autenticacao para componentes.
- `src/app/routes/PrivateRoute.tsx` protege as rotas privadas e redireciona
  usuarios nao logados para `/login`.

O cadastro atualiza o `displayName` do usuario com o nome informado. A protecao
usa `onAuthStateChanged` para manter a sessao sincronizada com o Firebase.

## Backend autenticado

`src/lib/api.ts` configura uma instancia Axios com `VITE_API_URL`. Antes de cada
requisicao, o interceptor consulta `auth.currentUser?.getIdToken()` e, quando
existe usuario logado, envia:

```http
Authorization: Bearer TOKEN_DO_FIREBASE
```

O backend valida esse token com Firebase Admin SDK.

## Rotas iniciais

Rotas publicas:

- `/login`
- `/register`
- `/forgot-password`

Rotas privadas protegidas por Firebase Auth:

- `/`
- `/invoices`
- `/transactions`
- `/transactions/new`
- `/credit-cards`
- `/categories`
- `/settings`

Sem usuario logado, essas rotas redirecionam para `/login`.

## Comandos uteis

```bash
npm run dev
npm run build
npm run preview
```
