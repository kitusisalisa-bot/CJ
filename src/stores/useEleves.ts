import { create } from "zustand";
import { listEleves } from "@/db/repositories/eleves";
import type { Eleve } from "@/types/models";

interface ElevesState {
  eleves: Eleve[];
  chargement: boolean;
  charger: () => Promise<void>;
}

export const useEleves = create<ElevesState>((set) => ({
  eleves: [],
  chargement: false,
  charger: async () => {
    set({ chargement: true });
    try {
      const eleves = await listEleves();
      set({ eleves });
    } finally {
      set({ chargement: false });
    }
  },
}));

export function elevesGS(eleves: Eleve[]): Eleve[] {
  return eleves.filter((e) => e.niveau === "GS");
}

export function elevesCE2(eleves: Eleve[]): Eleve[] {
  return eleves.filter((e) => e.niveau === "CE2");
}
