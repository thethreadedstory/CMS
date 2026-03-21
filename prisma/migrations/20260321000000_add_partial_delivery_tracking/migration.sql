ALTER TYPE "OrderStatus" ADD VALUE 'PARTIALLY_DELIVERED';

ALTER TABLE "Order"
ADD COLUMN "deliveredQuantity" INTEGER NOT NULL DEFAULT 0;

UPDATE "Order"
SET "deliveredQuantity" = COALESCE(
  (
    SELECT SUM("quantity")::INTEGER
    FROM "OrderItem"
    WHERE "OrderItem"."orderId" = "Order"."id"
  ),
  0
)
WHERE "orderStatus" = 'DELIVERED';

UPDATE "Order"
SET "dueDate" = COALESCE("dueDate", "deliveryDate", "updatedAt")
WHERE "orderStatus" = 'DELIVERED'
  AND "dueDate" IS NULL;
