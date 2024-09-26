-- Create enum type "participantenum"
CREATE TYPE "public"."participantenum" AS ENUM ('A', 'B');
-- Create "query" table
CREATE TABLE "public"."query" (
  "id" serial NOT NULL,
  "text" character varying NOT NULL,
  PRIMARY KEY ("id")
);
-- Create "dialogue" table
CREATE TABLE "public"."dialogue" (
  "id" serial NOT NULL,
  "participant" "public"."participantenum" NOT NULL,
  "text" character varying NOT NULL,
  "sound" character varying NOT NULL,
  "meaning" character varying NOT NULL,
  "order" integer NOT NULL,
  "query_id" integer NOT NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "dialogue_query_id_fkey" FOREIGN KEY ("query_id") REFERENCES "public"."query" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT "dialogue_order_check" CHECK ("order" > 0)
);
-- Create "meaning" table
CREATE TABLE "public"."meaning" (
  "id" serial NOT NULL,
  "text" character varying NOT NULL,
  "was_split" boolean NOT NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "meaning_text_key" UNIQUE ("text")
);
-- Create "unit" table
CREATE TABLE "public"."unit" (
  "id" serial NOT NULL,
  "text" character varying NOT NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "unit_text_key" UNIQUE ("text")
);
-- Create "unitmeaninglink" table
CREATE TABLE "public"."unitmeaninglink" (
  "unit_id" integer NOT NULL,
  "meaning_id" integer NOT NULL,
  "sound" character varying NOT NULL,
  PRIMARY KEY ("unit_id", "meaning_id"),
  CONSTRAINT "unitmeaninglink_meaning_id_fkey" FOREIGN KEY ("meaning_id") REFERENCES "public"."meaning" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT "unitmeaninglink_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "public"."unit" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);
-- Create "queryunitmeaning" table
CREATE TABLE "public"."queryunitmeaning" (
  "query_id" integer NOT NULL,
  "unit_id" integer NOT NULL,
  "meaning_id" integer NOT NULL,
  PRIMARY KEY ("query_id", "unit_id", "meaning_id"),
  CONSTRAINT "queryunitmeaning_query_id_fkey" FOREIGN KEY ("query_id") REFERENCES "public"."query" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT "queryunitmeaning_unit_id_meaning_id_fkey" FOREIGN KEY ("unit_id", "meaning_id") REFERENCES "public"."unitmeaninglink" ("unit_id", "meaning_id") ON UPDATE NO ACTION ON DELETE NO ACTION
);
