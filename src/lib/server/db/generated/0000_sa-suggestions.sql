CREATE TYPE "public"."status" AS ENUM('pending', 'good', 'implemented', 'in-dev', 'incompatible', 'impractical', 'rejected', 'impossible');--> statement-breakpoint
CREATE TYPE "public"."tag" AS ENUM('website', 'editor', 'other', 'everywhere');--> statement-breakpoint
CREATE TABLE "image" (
	"id" text PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"resolution" json
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "suggestion" (
	"id" text PRIMARY KEY NOT NULL,
	"author_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '*no description given*' NOT NULL,
	"voter_ids" text[] DEFAULT '{}' NOT NULL,
	"tag" "tag" NOT NULL,
	"status" "status" DEFAULT 'pending' NOT NULL,
	"image_ids" text[],
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"oauth_id" text NOT NULL,
	"username" text NOT NULL,
	"display_name" text,
	"oauth_provider" text NOT NULL,
	CONSTRAINT "user_oauth_id_unique" UNIQUE("oauth_id")
);
--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suggestion" ADD CONSTRAINT "suggestion_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;