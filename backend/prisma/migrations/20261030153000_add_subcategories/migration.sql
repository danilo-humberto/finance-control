-- AlterTable
ALTER TABLE "categories" ADD COLUMN "parent_id" UUID;

-- AlterTable
ALTER TABLE "recurring_transactions" ADD COLUMN "subcategory_id" UUID;

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN "subcategory_id" UUID;

-- CreateIndex
CREATE INDEX "categories_parent_id_idx" ON "categories"("parent_id");

-- CreateIndex
CREATE INDEX "recurring_transactions_subcategory_id_idx" ON "recurring_transactions"("subcategory_id");

-- CreateIndex
CREATE INDEX "transactions_subcategory_id_idx" ON "transactions"("subcategory_id");

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_transactions" ADD CONSTRAINT "recurring_transactions_subcategory_id_fkey" FOREIGN KEY ("subcategory_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_subcategory_id_fkey" FOREIGN KEY ("subcategory_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
