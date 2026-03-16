-- Rename priceAdjust to price on ProductVariant.
-- Existing rows get their priceAdjust value copied into price.
-- We add the column with a temporary default of 0, copy existing data, then drop the default.

ALTER TABLE "ProductVariant" ADD COLUMN "price" DOUBLE PRECISION NOT NULL DEFAULT 0;
UPDATE "ProductVariant" SET "price" = "priceAdjust";
ALTER TABLE "ProductVariant" ALTER COLUMN "price" DROP DEFAULT;
ALTER TABLE "ProductVariant" DROP COLUMN "priceAdjust";
