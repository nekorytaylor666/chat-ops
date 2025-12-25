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
import { workspace } from "./workspace";

export const attributeTypeEnum = pgEnum("attribute_type", [
  "short-text",
  "long-text",
  "number",
  "select",
  "multi-select",
  "checkbox",
  "date",
  "url",
]);

export const entityDefinition = pgTable(
  "entity_definition",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    singularName: text("singular_name").notNull(),
    pluralName: text("plural_name").notNull(),
    description: text("description"),
    icon: text("icon"),
    color: text("color"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("entity_definition_workspace_idx").on(table.workspaceId),
    index("entity_definition_slug_idx").on(table.workspaceId, table.slug),
  ]
);

export const attribute = pgTable(
  "attribute",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    entityDefinitionId: text("entity_definition_id")
      .notNull()
      .references(() => entityDefinition.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    type: attributeTypeEnum("type").notNull(),
    isRequired: boolean("is_required").notNull().default(false),
    isUnique: boolean("is_unique").notNull().default(false),
    isSystem: boolean("is_system").notNull().default(false),
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
    index("attribute_entity_idx").on(table.entityDefinitionId),
    index("attribute_slug_idx").on(table.entityDefinitionId, table.slug),
  ]
);

export const entityRecord = pgTable(
  "entity_record",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    entityDefinitionId: text("entity_definition_id")
      .notNull()
      .references(() => entityDefinition.id, { onDelete: "cascade" }),
    values: jsonb("values").notNull().$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("entity_record_entity_idx").on(table.entityDefinitionId)]
);

export const entityDefinitionRelations = relations(
  entityDefinition,
  ({ one, many }) => ({
    workspace: one(workspace, {
      fields: [entityDefinition.workspaceId],
      references: [workspace.id],
    }),
    attributes: many(attribute),
    records: many(entityRecord),
  })
);

export const attributeRelations = relations(attribute, ({ one }) => ({
  entityDefinition: one(entityDefinition, {
    fields: [attribute.entityDefinitionId],
    references: [entityDefinition.id],
  }),
}));

export const entityRecordRelations = relations(entityRecord, ({ one }) => ({
  entityDefinition: one(entityDefinition, {
    fields: [entityRecord.entityDefinitionId],
    references: [entityDefinition.id],
  }),
}));
