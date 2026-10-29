# Compras Recorrentes e Ciclo de Faturas

Este documento explica de forma simples como funciona a funcionalidade de compras recorrentes (assinaturas e despesas fixas), como os dados são guardados e quais regras protegem o histórico financeiro.

---

## 1. O que é uma compra recorrente?

É qualquer despesa ou receita que se repete mensalmente com um valor previsível.
Exemplos: Netflix, Spotify, academia, plano de internet, aluguel, condomínio.

Em vez de você ter que cadastrar a mesma despesa todo mês manualmente, você cadastra uma única vez como **Recorrente**.

---

## 2. Como o sistema funciona por baixo dos panos?

### A Janela Rolante de 12 Meses

Quando você cadastra uma compra recorrente:
1. O sistema cria o registro mestre da assinatura (`RecurringTransaction`).
2. O sistema gera imediatamente no banco de dados as **12 próximas cobranças reais** (`Transaction` e `Installment`), uma para cada mês.

### Por que gerar 12 meses adiantados em vez de esperar a virada do mês?
- **Visibilidade imediata**: Você pode navegar para a fatura do mês que vem (ou daqui a 6 meses) e já enxergar o valor real que terá que pagar, sem surpresas.
- **Confiabilidade**: Não depende de robôs ou agendadores (cron jobs) rodando na virada da noite. Mesmo que o servidor reinicie, as faturas futuras já estão prontas.

---

## 3. Como funciona com cartão de crédito (Fechamento vs Vencimento)

Cada cartão possui duas datas importantes:
- **Dia de fechamento**: o dia em que o cartão fecha a conta do mês.
- **Dia de vencimento**: o dia em que você paga a fatura.

O sistema calcula automaticamente em qual fatura cada cobrança mensal deve entrar:
- Se a assinatura cobra no dia 10 e o cartão fecha no dia 20: a cobrança cai na **fatura do mês atual**.
- Se a assinatura cobra no dia 25 e o cartão fecha no dia 20: a cobrança já cai na **fatura do mês seguinte**.

---

## 4. O que é a Blindagem Temporal? (Proteção do Histórico)

### O problema que existia antes
Se você deixasse de marcar faturas antigas como "Pagas", o status delas continuava como "Aberta".
Se você resolvesse atualizar o preço de uma assinatura (por exemplo, a Netflix aumentou de R$ 39 para R$ 55), o sistema corria o risco de alterar os registros de meses passados que você já havia pago na vida real, distorcendo seus relatórios antigos.

### A solução adotada
O sistema agora aplica uma **blindagem temporal baseada no calendário e no ciclo do cartão**:
- O sistema sabe qual é o mês/ano do ciclo atual.
- Qualquer mês **anterior ao atual é considerado passado e fica congelado**.
- Nenhuma edição de valor, categoria ou descrição altera meses passados.
- Nenhum cancelamento apaga transações de meses passados.
- Seu histórico contábil fica 100% protegido e imutável.

---

## 5. Como funciona o Cancelamento? (Abordagem A)

Quando você decide cancelar ou apagar uma assinatura, o sistema não apaga tudo sem critério. Ele oferece duas opções claras:

1. **Cancelar apenas futuras**:
   - A cobrança do mês atual continua na sua fatura.
   - Todas as cobranças dos meses futuros são excluídas.
   - Ideal quando você já usou o serviço no mês atual e só quer cancelar a renovação.

2. **Cancelar atual e futuras**:
   - A cobrança do mês atual é removida (desde que a fatura ainda esteja aberta e você não tenha pago).
   - Todas as cobranças dos meses futuros são excluídas.
   - Se a fatura atual já tiver sido marcada como **Paga**, o sistema bloqueia a exclusão para não gerar inconsistência no seu saldo.

> **Regra permanente**: Meses passados e parcelas que já constam como **Pagas** nunca são apagados pelo cancelamento.

---

## 6. Quitação de Faturas em Lote (`PATCH /invoices/pay`)

Na tela de Faturas, existe o botão **"Marcar fatura como paga"**:
- Ao clicar, o sistema quita de uma só vez todas as parcelas em aberto daquele cartão no mês selecionado.
- Isso atualiza o status de todas as parcelas para `PAID`, deduz o limite utilizado do cartão e reflete imediatamente no painel de controle.
