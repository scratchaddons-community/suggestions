-- CREATE TYPE "public"."roles" AS ENUM('user', 'trusted', 'mod', 'dev', 'admin', 'jazza');--> statement-breakpoint
-- ALTER TABLE "user" ALTER COLUMN "role" SET DATA TYPE roles;

-- Those are the generated migration commands, below is smth ChatGPT made, though I do understand it (important for my morals regarding AI)

-- Step 1: Create the enum type
CREATE TYPE "public"."roles" AS ENUM('user', 'trusted', 'mod', 'dev', 'admin', 'jazza');

-- Step 2: Drop the default value on the column
ALTER TABLE "user" ALTER COLUMN "role" DROP DEFAULT;

-- Step 3: Update existing values to match the enum type
UPDATE "user"
SET "role" = 'user'
WHERE "role" = 'users';

-- Step 4: Change the column type, using a cast
ALTER TABLE "user" ALTER COLUMN "role" SET DATA TYPE roles USING "role"::roles;

-- Step 5: Set the new default value
ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'user';
