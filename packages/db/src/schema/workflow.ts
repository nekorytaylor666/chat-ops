import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { attributeTypeEnum, entityDefinition, entityRecord } from "./entity";
import { organization } from "./organization";

// Enums
export const workflowStatusEnum = pgEnum("workflow_status", [
  "draft",
  "active",
  "archived",
]);

export const dealStatusEnum = pgEnum("deal_status", ["open", "won", "lost"]);

export const stageInstanceStatusEnum = pgEnum("stage_instance_status", [
  "pending",
  "active",
  "completed",
  "skipped",
]);

export const stageHistoryActionEnum = pgEnum("stage_history_action", [
  "entered",
  "completed",
  "skipped",
  "reverted",
]);

export const stageAttributeIoEnum = pgEnum("stage_attribute_io", [
  "input",
  "output",
]);

// Workflow Definition Layer

export const workflowDefinition = pgTable(
  "workflow_definition",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    triggerEntityId: text("trigger_entity_id").references(
      () => entityDefinition.id,
      { onDelete: "set null" }
    ),
    icon: text("icon"),
    color: text("color"),
    status: workflowStatusEnum("status").notNull().default("draft"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("workflow_definition_organization_idx").on(table.organizationId),
    index("workflow_definition_status_idx").on(
      table.organizationId,
      table.status
    ),
  ]
);

export const stageDefinition = pgTable(
  "stage_definition",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    workflowDefinitionId: text("workflow_definition_id")
      .notNull()
      .references(() => workflowDefinition.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    instructions: text("instructions"),
    target: text("target"),
    order: integer("order").notNull().default(0),
    icon: text("icon"),
    color: text("color"),
    isInitial: boolean("is_initial").notNull().default(false),
    isFinal: boolean("is_final").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("stage_definition_workflow_idx").on(table.workflowDefinitionId),
    index("stage_definition_order_idx").on(
      table.workflowDefinitionId,
      table.order
    ),
  ]
);

export const stageAttribute = pgTable(
  "stage_attribute",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    stageDefinitionId: text("stage_definition_id")
      .notNull()
      .references(() => stageDefinition.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    type: attributeTypeEnum("type").notNull(),
    io: stageAttributeIoEnum("io").notNull().default("output"),
    isRequired: boolean("is_required").notNull().default(false),
    isUnique: boolean("is_unique").notNull().default(false),
    defaultValue: jsonb("default_value"),
    order: integer("order").notNull().default(0),
    config: jsonb("config"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("stage_attribute_stage_idx").on(table.stageDefinitionId),
    index("stage_attribute_slug_idx").on(table.stageDefinitionId, table.slug),
  ]
);

// Workflow Instance Layer

export const deal = pgTable(
  "deal",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    workflowDefinitionId: text("workflow_definition_id")
      .notNull()
      .references(() => workflowDefinition.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    triggerRecordId: text("trigger_record_id").references(
      () => entityRecord.id,
      { onDelete: "set null" }
    ),
    currentStageId: text("current_stage_id"),
    status: dealStatusEnum("status").notNull().default("open"),
    ownerId: text("owner_id").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    closedAt: timestamp("closed_at"),
  },
  (table) => [
    index("deal_organization_idx").on(table.organizationId),
    index("deal_workflow_idx").on(table.workflowDefinitionId),
    index("deal_status_idx").on(table.organizationId, table.status),
    index("deal_owner_idx").on(table.ownerId),
  ]
);

export const stageInstance = pgTable(
  "stage_instance",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    dealId: text("deal_id")
      .notNull()
      .references(() => deal.id, { onDelete: "cascade" }),
    stageDefinitionId: text("stage_definition_id")
      .notNull()
      .references(() => stageDefinition.id, { onDelete: "cascade" }),
    status: stageInstanceStatusEnum("status").notNull().default("pending"),
    values: jsonb("values").$type<Record<string, unknown>>().default({}),
    enteredAt: timestamp("entered_at"),
    completedAt: timestamp("completed_at"),
    completedBy: text("completed_by").references(() => user.id, {
      onDelete: "set null",
    }),
  },
  (table) => [
    index("stage_instance_deal_idx").on(table.dealId),
    index("stage_instance_stage_idx").on(table.stageDefinitionId),
  ]
);

export const stageHistory = pgTable(
  "stage_history",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    dealId: text("deal_id")
      .notNull()
      .references(() => deal.id, { onDelete: "cascade" }),
    stageInstanceId: text("stage_instance_id")
      .notNull()
      .references(() => stageInstance.id, { onDelete: "cascade" }),
    action: stageHistoryActionEnum("action").notNull(),
    performedBy: text("performed_by").references(() => user.id, {
      onDelete: "set null",
    }),
    performedAt: timestamp("performed_at").defaultNow().notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  },
  (table) => [
    index("stage_history_deal_idx").on(table.dealId),
    index("stage_history_performed_at_idx").on(table.dealId, table.performedAt),
  ]
);

// Relations

export const workflowDefinitionRelations = relations(
  workflowDefinition,
  ({ one, many }) => ({
    organization: one(organization, {
      fields: [workflowDefinition.organizationId],
      references: [organization.id],
    }),
    triggerEntity: one(entityDefinition, {
      fields: [workflowDefinition.triggerEntityId],
      references: [entityDefinition.id],
    }),
    stages: many(stageDefinition),
    deals: many(deal),
  })
);

export const stageDefinitionRelations = relations(
  stageDefinition,
  ({ one, many }) => ({
    workflowDefinition: one(workflowDefinition, {
      fields: [stageDefinition.workflowDefinitionId],
      references: [workflowDefinition.id],
    }),
    attributes: many(stageAttribute),
    instances: many(stageInstance),
  })
);

export const stageAttributeRelations = relations(stageAttribute, ({ one }) => ({
  stageDefinition: one(stageDefinition, {
    fields: [stageAttribute.stageDefinitionId],
    references: [stageDefinition.id],
  }),
}));

export const dealRelations = relations(deal, ({ one, many }) => ({
  organization: one(organization, {
    fields: [deal.organizationId],
    references: [organization.id],
  }),
  workflowDefinition: one(workflowDefinition, {
    fields: [deal.workflowDefinitionId],
    references: [workflowDefinition.id],
  }),
  triggerRecord: one(entityRecord, {
    fields: [deal.triggerRecordId],
    references: [entityRecord.id],
  }),
  currentStage: one(stageInstance, {
    fields: [deal.currentStageId],
    references: [stageInstance.id],
  }),
  owner: one(user, {
    fields: [deal.ownerId],
    references: [user.id],
  }),
  stageInstances: many(stageInstance),
  stageHistory: many(stageHistory),
}));

export const stageInstanceRelations = relations(
  stageInstance,
  ({ one, many }) => ({
    deal: one(deal, {
      fields: [stageInstance.dealId],
      references: [deal.id],
    }),
    stageDefinition: one(stageDefinition, {
      fields: [stageInstance.stageDefinitionId],
      references: [stageDefinition.id],
    }),
    completedByUser: one(user, {
      fields: [stageInstance.completedBy],
      references: [user.id],
    }),
    history: many(stageHistory),
  })
);

export const stageHistoryRelations = relations(stageHistory, ({ one }) => ({
  deal: one(deal, {
    fields: [stageHistory.dealId],
    references: [deal.id],
  }),
  stageInstance: one(stageInstance, {
    fields: [stageHistory.stageInstanceId],
    references: [stageInstance.id],
  }),
  performedByUser: one(user, {
    fields: [stageHistory.performedBy],
    references: [user.id],
  }),
}));
