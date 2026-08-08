ALTER TABLE "cms_products" ADD COLUMN "calories" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "cms_products" ADD COLUMN "extra_calories" jsonb DEFAULT '{}'::jsonb NOT NULL;