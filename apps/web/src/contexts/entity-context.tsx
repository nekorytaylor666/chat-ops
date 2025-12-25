import * as React from "react";
import { type EntityStore, useEntityStore } from "@/hooks/use-entity-store";

const EntityContext = React.createContext<EntityStore | null>(null);

export function EntityProvider({ children }: { children: React.ReactNode }) {
  const store = useEntityStore();
  return (
    <EntityContext.Provider value={store}>{children}</EntityContext.Provider>
  );
}

export function useEntities(): EntityStore {
  const context = React.useContext(EntityContext);
  if (!context) {
    throw new Error("useEntities must be used within EntityProvider");
  }
  return context;
}
