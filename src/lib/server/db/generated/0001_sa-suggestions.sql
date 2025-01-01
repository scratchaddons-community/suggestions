ALTER TABLE "image" ADD COLUMN "cloudinary_id" text;--> statement-breakpoint
ALTER TABLE "image" ADD CONSTRAINT "image_cloudinary_id_unique" UNIQUE("cloudinary_id");