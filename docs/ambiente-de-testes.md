# Ambiente de Testes Isolado (Local Docker)

Este documento explica como rodar e testar o sistema localmente em um banco de dados PostgreSQL completamente isolado, garantindo **risco zero** de alterar ou poluir os dados reais de produção.

---

## 1. Como a separação funciona

1. **Produção (Supabase / Render)**:
   - As credenciais de produção continuam preservadas no arquivo `backend/.env` e no painel do Render.
2. **Desenvolvimento Local (Docker)**:
   - Um container PostgreSQL dedicado (`finance-test-db`) roda na porta `5433`.
   - O arquivo `backend/.env.local` (ignorado pelo git) aponta para esse banco local de testes (`localhost:5433`).
   - O NestJS e o Prisma carregam o `.env.local` prioritariamente ao executar em modo de desenvolvimento.

---

## 2. Comandos do Backend

Execute a partir da pasta `backend/` (ou usando `--prefix backend`):

| Comando | Descrição |
| :--- | :--- |
| `npm run dev` | Inicia o backend NestJS apontando para o **banco local de teste**. |
| `npm run db:migrate:local` | Aplica as migrations do Prisma no **banco local de teste**. |
| `npm run db:studio:local` | Abre o Prisma Studio para visualizar/editar tabelas do **banco local**. |
| `npm run db:migrate:prod` | Aplica migrations no **banco de produção** (Supabase). |
| `npm run docker:db:start` | Inicia o container Docker caso tenha sido pausado ou o PC reiniciado. |
| `npm run docker:db:stop` | Pausa o container Docker para liberar memória RAM. |

---

## 3. Passo a Passo para Testar as Alterações

### Passo 1: Iniciar o Backend
Em um terminal:
```bash
cd backend
npm run dev
```
O terminal exibirá a inicialização do NestJS na porta `3000`.

### Passo 2: Iniciar o Frontend
Em outro terminal:
```bash
cd frontend
npm run dev
```
O frontend estará acessível em `http://localhost:5173`.

### Passo 3: Acessar e Testar
1. Abra `http://localhost:5173` no navegador.
2. Faça login com suas credenciais usuais do Firebase:
   - O sistema criará seu usuário automaticamente no banco local de testes.
3. Cadastre um cartão de teste em **Cartões** (ex: *Nubank Teste*, Fechamento dia 15, Vencimento dia 20).
4. Cadastre uma categoria em **Categorias** (ex: *Assinaturas*, tipo Saída).
5. Vá em **Nova Compra**:
   - Escolha o modo **Recorrente**.
   - Preencha o valor e descrição (ex: *Netflix* - R$ 55,90).
   - Salve e confira na tela de **Faturas** que a compra foi lançada com a etiqueta `Recorrente`.
6. Teste o cancelamento da recorrência pela **Abordagem A**:
   - Exclua testando tanto "Apenas futuras" quanto "Atual e futuras".
7. Teste o botão **"Marcar fatura como paga"** na fatura.
