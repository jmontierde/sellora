"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CartStore {
  sessionId: string;
  getSessionId: () => string;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      sessionId: "",
      getSessionId: () => {
        let id = get().sessionId;
        if (!id) {
          id = crypto.randomUUID();
          set({ sessionId: id });
        }
        return id;
      },
    }),
    { name: "sellora-cart" }
  )
);
