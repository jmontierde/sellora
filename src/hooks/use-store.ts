"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Id } from "../../convex/_generated/dataModel";

interface StoreState {
  activeStoreId: Id<"stores"> | null;
  setActiveStore: (id: Id<"stores">) => void;
}

export const useStoreState = create<StoreState>()(
  persist(
    (set) => ({
      activeStoreId: null,
      setActiveStore: (id) => set({ activeStoreId: id }),
    }),
    { name: "sellora-active-store" }
  )
);
