import { create } from "zustand";
import { createEleve, deleteEleve, listEleves, updateEleve } from "@/db/repositories/eleves";
import type { Eleve } from "@/types/models";

interface ElevesState {
  eleves: Eleve[];
  chargement: boolean;
  charger: () => Promise<void>;
  ajouterEleve: (input: Omit<Eleve, "id" | "createdAt" | "updatedAt">) => Promise<Eleve>;
  modifierEleve: (eleve: Eleve) => Promise<void>;
  supprimerEleve: (id: string) => Promise<void>;
}

export const useEleves = create<ElevesState>((set, get) => ({
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
  ajouterEleve: async (input) => {
    const eleve = await createEleve(input);
    await get().charger();
    return eleve;
  },
  modifierEleve: async (eleve) => {
    await updateEleve(eleve);
    await get().charger();
  },
  supprimerEleve: async (id) => {
    await deleteEleve(id);
    await get().charger();
  },
}));

export function elevesGS(eleves: Eleve[]): Eleve[] {
  return eleves.filter((e) => e.niveau === "GS");
}

export function elevesCE2(eleves: Eleve[]): Eleve[] {
  return eleves.filter((e) => e.niveau === "CE2");
}
