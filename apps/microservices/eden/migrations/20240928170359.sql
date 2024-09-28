-- Modify "meaning" table
ALTER TABLE "public"."meaning" DROP COLUMN "was_split";
-- Modify "query" table
ALTER TABLE "public"."query" ADD COLUMN "meaning" character varying NOT NULL;
