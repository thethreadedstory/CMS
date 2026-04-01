-- AlterTable: Remove stock fields from Product
ALTER TABLE "Product" DROP COLUMN IF EXISTS "currentStock";
ALTER TABLE "Product" DROP COLUMN IF EXISTS "lowStockAlert";

-- AlterTable: Remove stock field from ProductVariant
ALTER TABLE "ProductVariant" DROP COLUMN IF EXISTS "stock";
