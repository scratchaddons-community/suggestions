-- ALTER TABLE "user" ALTER COLUMN "role" SET DATA TYPE role;--> statement-breakpoint
-- DROP TYPE "public"."roles";--> statement-breakpoint
-- DROP TYPE "public"."status";--> statement-breakpoint
-- DROP TYPE "public"."tag";

-- Again, drizzle's migration does not seem right at all. I guess I'm learning SQL!
ALTER TYPE "public"."roles" RENAME TO "role";