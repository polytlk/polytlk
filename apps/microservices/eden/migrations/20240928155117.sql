-- Modify "query" table
ALTER TABLE "public"."query" ADD COLUMN "user_id" integer NOT NULL;
-- Create index "ix_query_user_id" to table: "query"
CREATE INDEX "ix_query_user_id" ON "public"."query" ("user_id");
