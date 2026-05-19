import { useState, useCallback } from "react";
import { store } from "./store";
import type { PainEntry } from "@shared/schema";

// Simple hook that reads from the in-memory store and forces re-renders via counter
export function useEntries() {
  const [, setTick] = useState(0);
  const refresh = useCallback(() => setTick((t) => t + 1), []);
  const entries = store.getAll();
  return { entries, refresh };
}

export function useEntry(id: number) {
  const [, setTick] = useState(0);
  const refresh = useCallback(() => setTick((t) => t + 1), []);
  const entry = store.getById(id);
  return { entry, refresh };
}
