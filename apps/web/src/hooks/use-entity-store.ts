import * as React from "react";
import type {
  AttributeDefinition,
  CreateAttributeInput,
  CreateEntityInput,
  EntityDefinition,
  EntityStoreState,
  UpdateAttributeInput,
  UpdateEntityInput,
} from "@/types/entity";

const STORAGE_KEY = "crm_entity_definitions";
const CURRENT_VERSION = 1;

// Generate a slug from a name
function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Generate unique slug by appending number if needed
function generateUniqueSlug(baseName: string, existingSlugs: string[]): string {
  const baseSlug = slugify(baseName);
  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug;
  }

  let counter = 1;
  while (existingSlugs.includes(`${baseSlug}-${counter}`)) {
    counter++;
  }
  return `${baseSlug}-${counter}`;
}

// Default "companies" entity matching current mock data structure
function createDefaultEntities(): EntityDefinition[] {
  const now = new Date().toISOString();
  return [
    {
      id: crypto.randomUUID(),
      slug: "companies",
      singularName: "Company",
      pluralName: "Companies",
      description: "Manage your company records",
      icon: "Building2",
      color: "#6366f1",
      createdAt: now,
      updatedAt: now,
      attributes: [
        {
          id: crypto.randomUUID(),
          slug: "name",
          name: "Company",
          type: "short-text",
          isRequired: true,
          isUnique: false,
          isSystem: true,
          order: 0,
        },
        {
          id: crypto.randomUUID(),
          slug: "description",
          name: "Description",
          type: "long-text",
          isRequired: false,
          isUnique: false,
          isSystem: false,
          order: 1,
        },
        {
          id: crypto.randomUUID(),
          slug: "industry",
          name: "Primary Industry",
          type: "select",
          isRequired: false,
          isUnique: false,
          isSystem: false,
          order: 2,
          config: {
            options: [
              { label: "Technology", value: "technology" },
              { label: "Finance", value: "finance" },
              { label: "Healthcare", value: "healthcare" },
              { label: "Retail", value: "retail" },
              { label: "Manufacturing", value: "manufacturing" },
              { label: "Energy", value: "energy" },
              { label: "Real Estate", value: "real-estate" },
              { label: "Media", value: "media" },
            ],
          },
        },
        {
          id: crypto.randomUUID(),
          slug: "country",
          name: "Country",
          type: "select",
          isRequired: false,
          isUnique: false,
          isSystem: false,
          order: 3,
          config: {
            options: [
              { label: "United States", value: "us" },
              { label: "United Kingdom", value: "uk" },
              { label: "Germany", value: "de" },
              { label: "France", value: "fr" },
              { label: "Japan", value: "jp" },
              { label: "Canada", value: "ca" },
              { label: "Australia", value: "au" },
              { label: "Singapore", value: "sg" },
            ],
          },
        },
        {
          id: crypto.randomUUID(),
          slug: "foundedDate",
          name: "Foundation Date",
          type: "date",
          isRequired: false,
          isUnique: false,
          isSystem: false,
          order: 4,
        },
        {
          id: crypto.randomUUID(),
          slug: "twitterFollowers",
          name: "Twitter Followers",
          type: "number",
          isRequired: false,
          isUnique: false,
          isSystem: false,
          order: 5,
        },
        {
          id: crypto.randomUUID(),
          slug: "twitterUrl",
          name: "Twitter URL",
          type: "url",
          isRequired: false,
          isUnique: false,
          isSystem: false,
          order: 6,
        },
        {
          id: crypto.randomUUID(),
          slug: "linkedinUrl",
          name: "LinkedIn URL",
          type: "url",
          isRequired: false,
          isUnique: false,
          isSystem: false,
          order: 7,
        },
      ],
    },
  ];
}

// Load state from localStorage
function loadState(): EntityStoreState {
  if (typeof window === "undefined") {
    return { entities: [], version: CURRENT_VERSION };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as EntityStoreState;
      // TODO: Add migration logic when version changes
      return parsed;
    }
  } catch {
    console.error("Failed to load entity store from localStorage");
  }

  // Initialize with default entities
  const defaultState: EntityStoreState = {
    entities: createDefaultEntities(),
    version: CURRENT_VERSION,
  };
  saveState(defaultState);
  return defaultState;
}

// Save state to localStorage
function saveState(state: EntityStoreState): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    console.error("Failed to save entity store to localStorage");
  }
}

// Store singleton for useSyncExternalStore
let storeState: EntityStoreState = { entities: [], version: CURRENT_VERSION };
const listeners = new Set<() => void>();

function getSnapshot(): EntityStoreState {
  return storeState;
}

function getServerSnapshot(): EntityStoreState {
  return { entities: [], version: CURRENT_VERSION };
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emitChange(): void {
  for (const listener of listeners) {
    listener();
  }
}

function updateState(
  updater: (state: EntityStoreState) => EntityStoreState
): void {
  storeState = updater(storeState);
  saveState(storeState);
  emitChange();
}

// Initialize store on module load (client-side only)
if (typeof window !== "undefined") {
  storeState = loadState();

  // Listen for changes from other tabs
  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY && event.newValue) {
      try {
        storeState = JSON.parse(event.newValue);
        emitChange();
      } catch {
        // Ignore parse errors
      }
    }
  });
}

export interface EntityStore {
  entities: EntityDefinition[];
  getEntity: (slug: string) => EntityDefinition | undefined;
  createEntity: (input: CreateEntityInput) => EntityDefinition;
  updateEntity: (
    slug: string,
    updates: UpdateEntityInput
  ) => EntityDefinition | undefined;
  deleteEntity: (slug: string) => boolean;
  addAttribute: (
    entitySlug: string,
    input: CreateAttributeInput
  ) => AttributeDefinition | undefined;
  updateAttribute: (
    entitySlug: string,
    attributeId: string,
    updates: UpdateAttributeInput
  ) => AttributeDefinition | undefined;
  deleteAttribute: (entitySlug: string, attributeId: string) => boolean;
  reorderAttributes: (entitySlug: string, orderedIds: string[]) => void;
}

export function useEntityStore(): EntityStore {
  const state = React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const getEntity = React.useCallback(
    (slug: string): EntityDefinition | undefined =>
      state.entities.find((e) => e.slug === slug),
    [state.entities]
  );

  const createEntity = React.useCallback(
    (input: CreateEntityInput): EntityDefinition => {
      const now = new Date().toISOString();
      const existingSlugs = state.entities.map((e) => e.slug);
      const slug = generateUniqueSlug(input.pluralName, existingSlugs);

      const newEntity: EntityDefinition = {
        id: crypto.randomUUID(),
        slug,
        singularName: input.singularName,
        pluralName: input.pluralName,
        description: input.description,
        icon: input.icon ?? "Database",
        color: input.color ?? "#6366f1",
        createdAt: now,
        updatedAt: now,
        attributes: [
          // Always include a system "name" attribute
          {
            id: crypto.randomUUID(),
            slug: "name",
            name: "Name",
            type: "short-text",
            isRequired: true,
            isUnique: false,
            isSystem: true,
            order: 0,
          },
          // Add any additional attributes from input
          ...(input.attributes ?? []).map((attr, index) => ({
            id: crypto.randomUUID(),
            slug: generateUniqueSlug(attr.name, ["name"]),
            ...attr,
            isSystem: false,
            order: index + 1,
          })),
        ],
      };

      updateState((s) => ({
        ...s,
        entities: [...s.entities, newEntity],
      }));

      return newEntity;
    },
    [state.entities]
  );

  const updateEntity = React.useCallback(
    (
      slug: string,
      updates: UpdateEntityInput
    ): EntityDefinition | undefined => {
      let updatedEntity: EntityDefinition | undefined;

      updateState((s) => ({
        ...s,
        entities: s.entities.map((entity) => {
          if (entity.slug !== slug) return entity;

          updatedEntity = {
            ...entity,
            ...updates,
            updatedAt: new Date().toISOString(),
          };
          return updatedEntity;
        }),
      }));

      return updatedEntity;
    },
    []
  );

  const deleteEntity = React.useCallback((slug: string): boolean => {
    let deleted = false;

    updateState((s) => {
      const index = s.entities.findIndex((e) => e.slug === slug);
      if (index === -1) return s;

      deleted = true;
      return {
        ...s,
        entities: s.entities.filter((e) => e.slug !== slug),
      };
    });

    return deleted;
  }, []);

  const addAttribute = React.useCallback(
    (
      entitySlug: string,
      input: CreateAttributeInput
    ): AttributeDefinition | undefined => {
      let newAttribute: AttributeDefinition | undefined;

      updateState((s) => ({
        ...s,
        entities: s.entities.map((entity) => {
          if (entity.slug !== entitySlug) return entity;

          const existingSlugs = entity.attributes.map((a) => a.slug);
          const attrSlug = generateUniqueSlug(input.name, existingSlugs);
          const maxOrder = Math.max(
            0,
            ...entity.attributes.map((a) => a.order)
          );

          newAttribute = {
            id: crypto.randomUUID(),
            slug: attrSlug,
            ...input,
            isSystem: false,
            order: maxOrder + 1,
          };

          return {
            ...entity,
            attributes: [...entity.attributes, newAttribute],
            updatedAt: new Date().toISOString(),
          };
        }),
      }));

      return newAttribute;
    },
    []
  );

  const updateAttribute = React.useCallback(
    (
      entitySlug: string,
      attributeId: string,
      updates: UpdateAttributeInput
    ): AttributeDefinition | undefined => {
      let updatedAttribute: AttributeDefinition | undefined;

      updateState((s) => ({
        ...s,
        entities: s.entities.map((entity) => {
          if (entity.slug !== entitySlug) return entity;

          return {
            ...entity,
            attributes: entity.attributes.map((attr) => {
              if (attr.id !== attributeId) return attr;

              // Update slug if name changes
              let newSlug = attr.slug;
              if (updates.name && updates.name !== attr.name) {
                const existingSlugs = entity.attributes
                  .filter((a) => a.id !== attributeId)
                  .map((a) => a.slug);
                newSlug = generateUniqueSlug(updates.name, existingSlugs);
              }

              updatedAttribute = {
                ...attr,
                ...updates,
                slug: newSlug,
              };
              return updatedAttribute;
            }),
            updatedAt: new Date().toISOString(),
          };
        }),
      }));

      return updatedAttribute;
    },
    []
  );

  const deleteAttribute = React.useCallback(
    (entitySlug: string, attributeId: string): boolean => {
      let deleted = false;

      updateState((s) => ({
        ...s,
        entities: s.entities.map((entity) => {
          if (entity.slug !== entitySlug) return entity;

          const attr = entity.attributes.find((a) => a.id === attributeId);
          if (!attr || attr.isSystem) return entity;

          deleted = true;
          return {
            ...entity,
            attributes: entity.attributes.filter((a) => a.id !== attributeId),
            updatedAt: new Date().toISOString(),
          };
        }),
      }));

      return deleted;
    },
    []
  );

  const reorderAttributes = React.useCallback(
    (entitySlug: string, orderedIds: string[]): void => {
      updateState((s) => ({
        ...s,
        entities: s.entities.map((entity) => {
          if (entity.slug !== entitySlug) return entity;

          const reorderedAttrs = entity.attributes
            .slice()
            .sort((a, b) => {
              const aIndex = orderedIds.indexOf(a.id);
              const bIndex = orderedIds.indexOf(b.id);
              // Items not in orderedIds go to the end
              if (aIndex === -1) return 1;
              if (bIndex === -1) return -1;
              return aIndex - bIndex;
            })
            .map((attr, index) => ({ ...attr, order: index }));

          return {
            ...entity,
            attributes: reorderedAttrs,
            updatedAt: new Date().toISOString(),
          };
        }),
      }));
    },
    []
  );

  return {
    entities: state.entities,
    getEntity,
    createEntity,
    updateEntity,
    deleteEntity,
    addAttribute,
    updateAttribute,
    deleteAttribute,
    reorderAttributes,
  };
}
