-- Add 'file' to attribute_type enum
ALTER TYPE "attribute_type" ADD VALUE 'file';

-- Create stage_attribute_io enum
DO $$ BEGIN
 CREATE TYPE "public"."stage_attribute_io" AS ENUM('input', 'output');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Add instructions column to stage_definition table
ALTER TABLE "stage_definition" ADD COLUMN "instructions" text;

-- Add io column to stage_attribute table with default 'output'
ALTER TABLE "stage_attribute" ADD COLUMN "io" "stage_attribute_io" NOT NULL DEFAULT 'output';
