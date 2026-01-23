CREATE TYPE "public"."deal_status" AS ENUM('open', 'won', 'lost');--> statement-breakpoint
CREATE TYPE "public"."stage_history_action" AS ENUM('entered', 'completed', 'skipped', 'reverted');--> statement-breakpoint
CREATE TYPE "public"."stage_instance_status" AS ENUM('pending', 'active', 'completed', 'skipped');--> statement-breakpoint
CREATE TYPE "public"."workflow_status" AS ENUM('draft', 'active', 'archived');--> statement-breakpoint
CREATE TABLE "deal" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"workflow_definition_id" text NOT NULL,
	"name" text NOT NULL,
	"trigger_record_id" text,
	"current_stage_id" text,
	"status" "deal_status" DEFAULT 'open' NOT NULL,
	"owner_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"closed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "stage_attribute" (
	"id" text PRIMARY KEY NOT NULL,
	"stage_definition_id" text NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"type" "attribute_type" NOT NULL,
	"is_required" boolean DEFAULT false NOT NULL,
	"is_unique" boolean DEFAULT false NOT NULL,
	"default_value" jsonb,
	"order" integer DEFAULT 0 NOT NULL,
	"config" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stage_definition" (
	"id" text PRIMARY KEY NOT NULL,
	"workflow_definition_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"target" text,
	"order" integer DEFAULT 0 NOT NULL,
	"icon" text,
	"color" text,
	"is_initial" boolean DEFAULT false NOT NULL,
	"is_final" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stage_history" (
	"id" text PRIMARY KEY NOT NULL,
	"deal_id" text NOT NULL,
	"stage_instance_id" text NOT NULL,
	"action" "stage_history_action" NOT NULL,
	"performed_by" text,
	"performed_at" timestamp DEFAULT now() NOT NULL,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "stage_instance" (
	"id" text PRIMARY KEY NOT NULL,
	"deal_id" text NOT NULL,
	"stage_definition_id" text NOT NULL,
	"status" "stage_instance_status" DEFAULT 'pending' NOT NULL,
	"values" jsonb DEFAULT '{}'::jsonb,
	"entered_at" timestamp,
	"completed_at" timestamp,
	"completed_by" text
);
--> statement-breakpoint
CREATE TABLE "workflow_definition" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"trigger_entity_id" text,
	"icon" text,
	"color" text,
	"status" "workflow_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "deal" ADD CONSTRAINT "deal_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deal" ADD CONSTRAINT "deal_workflow_definition_id_workflow_definition_id_fk" FOREIGN KEY ("workflow_definition_id") REFERENCES "public"."workflow_definition"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deal" ADD CONSTRAINT "deal_trigger_record_id_entity_record_id_fk" FOREIGN KEY ("trigger_record_id") REFERENCES "public"."entity_record"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deal" ADD CONSTRAINT "deal_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stage_attribute" ADD CONSTRAINT "stage_attribute_stage_definition_id_stage_definition_id_fk" FOREIGN KEY ("stage_definition_id") REFERENCES "public"."stage_definition"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stage_definition" ADD CONSTRAINT "stage_definition_workflow_definition_id_workflow_definition_id_fk" FOREIGN KEY ("workflow_definition_id") REFERENCES "public"."workflow_definition"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stage_history" ADD CONSTRAINT "stage_history_deal_id_deal_id_fk" FOREIGN KEY ("deal_id") REFERENCES "public"."deal"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stage_history" ADD CONSTRAINT "stage_history_stage_instance_id_stage_instance_id_fk" FOREIGN KEY ("stage_instance_id") REFERENCES "public"."stage_instance"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stage_history" ADD CONSTRAINT "stage_history_performed_by_user_id_fk" FOREIGN KEY ("performed_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stage_instance" ADD CONSTRAINT "stage_instance_deal_id_deal_id_fk" FOREIGN KEY ("deal_id") REFERENCES "public"."deal"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stage_instance" ADD CONSTRAINT "stage_instance_stage_definition_id_stage_definition_id_fk" FOREIGN KEY ("stage_definition_id") REFERENCES "public"."stage_definition"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stage_instance" ADD CONSTRAINT "stage_instance_completed_by_user_id_fk" FOREIGN KEY ("completed_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_definition" ADD CONSTRAINT "workflow_definition_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_definition" ADD CONSTRAINT "workflow_definition_trigger_entity_id_entity_definition_id_fk" FOREIGN KEY ("trigger_entity_id") REFERENCES "public"."entity_definition"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "deal_organization_idx" ON "deal" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "deal_workflow_idx" ON "deal" USING btree ("workflow_definition_id");--> statement-breakpoint
CREATE INDEX "deal_status_idx" ON "deal" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "deal_owner_idx" ON "deal" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "stage_attribute_stage_idx" ON "stage_attribute" USING btree ("stage_definition_id");--> statement-breakpoint
CREATE INDEX "stage_attribute_slug_idx" ON "stage_attribute" USING btree ("stage_definition_id","slug");--> statement-breakpoint
CREATE INDEX "stage_definition_workflow_idx" ON "stage_definition" USING btree ("workflow_definition_id");--> statement-breakpoint
CREATE INDEX "stage_definition_order_idx" ON "stage_definition" USING btree ("workflow_definition_id","order");--> statement-breakpoint
CREATE INDEX "stage_history_deal_idx" ON "stage_history" USING btree ("deal_id");--> statement-breakpoint
CREATE INDEX "stage_history_performed_at_idx" ON "stage_history" USING btree ("deal_id","performed_at");--> statement-breakpoint
CREATE INDEX "stage_instance_deal_idx" ON "stage_instance" USING btree ("deal_id");--> statement-breakpoint
CREATE INDEX "stage_instance_stage_idx" ON "stage_instance" USING btree ("stage_definition_id");--> statement-breakpoint
CREATE INDEX "workflow_definition_organization_idx" ON "workflow_definition" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "workflow_definition_status_idx" ON "workflow_definition" USING btree ("organization_id","status");