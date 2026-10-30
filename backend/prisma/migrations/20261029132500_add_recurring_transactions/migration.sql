-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "recurring_transaction_id" UUID;

-- CreateTable
CREATE TABLE "recurring_transactions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "credit_card_id" UUID,
    "category_id" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "transaction_type" "transaction_type" NOT NULL DEFAULT 'EXPENSE',
    "payment_method" "payment_method" NOT NULL DEFAULT 'CREDIT_CARD',
    "billing_day" INTEGER NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "canceled_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recurring_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "recurring_transactions_user_id_idx" ON "recurring_transactions"("user_id");

-- CreateIndex
CREATE INDEX "recurring_transactions_credit_card_id_idx" ON "recurring_transactions"("credit_card_id");

-- CreateIndex
CREATE INDEX "recurring_transactions_category_id_idx" ON "recurring_transactions"("category_id");

-- CreateIndex
CREATE INDEX "recurring_transactions_user_id_is_active_idx" ON "recurring_transactions"("user_id", "is_active");

-- CreateIndex
CREATE INDEX "transactions_recurring_transaction_id_idx" ON "transactions"("recurring_transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_recurring_transaction_id_invoice_start_year_in_key" ON "transactions"("recurring_transaction_id", "invoice_start_year", "invoice_start_month");

-- AddForeignKey
ALTER TABLE "recurring_transactions" ADD CONSTRAINT "recurring_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_transactions" ADD CONSTRAINT "recurring_transactions_credit_card_id_fkey" FOREIGN KEY ("credit_card_id") REFERENCES "credit_cards"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_transactions" ADD CONSTRAINT "recurring_transactions_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_recurring_transaction_id_fkey" FOREIGN KEY ("recurring_transaction_id") REFERENCES "recurring_transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
