ALTER TABLE "RawMaterialPurchase"
ADD COLUMN "orderId" TEXT;

CREATE INDEX "RawMaterialPurchase_orderId_idx"
ON "RawMaterialPurchase"("orderId");

ALTER TABLE "RawMaterialPurchase"
ADD CONSTRAINT "RawMaterialPurchase_orderId_fkey"
FOREIGN KEY ("orderId") REFERENCES "Order"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
