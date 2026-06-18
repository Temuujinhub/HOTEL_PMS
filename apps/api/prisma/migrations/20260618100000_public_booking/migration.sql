-- Public booking site: per-property branding + slug for subdomain routing
ALTER TABLE "properties" ADD COLUMN "slug" TEXT;
ALTER TABLE "properties" ADD COLUMN "description" TEXT;
ALTER TABLE "properties" ADD COLUMN "logoUrl" TEXT;
ALTER TABLE "properties" ADD COLUMN "heroImageUrl" TEXT;
ALTER TABLE "properties" ADD COLUMN "images" JSONB;
ALTER TABLE "properties" ADD COLUMN "bookingEnabled" BOOLEAN NOT NULL DEFAULT true;

-- Globally-unique slug (one subdomain per property); NULLs allowed for legacy rows
CREATE UNIQUE INDEX "properties_slug_key" ON "properties"("slug");
