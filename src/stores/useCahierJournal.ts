import { create } from "zustand";
import { addDays, format, startOfWeek } from "date-fns";
import { fr } from "date-fns/locale";
import { listCreneauxSemaine, createCreneau, updateCreneau, deleteCreneau } from "@/db/repositories/creneaux";
import type { Creneau, CreneauAvecSeance, GroupeCreneau } from "@/types/models";

const ISO = "yyyy-MM-dd";

interface CahierJournalState {
  /** Lundi de la semaine affichée (ISO date). */
  semaineDebut: string;
  /** Les 5 jours ouvrés de la semaine (ISO date). */
  joursSemaine: string[];
  creneauxParJour: Record<string, CreneauAvecSeance[]>;
  jourSelectionne: string;
  chargement: boolean;

  allerSemaineSuivante: () => void;
  allerSemainePrecedente: () => void;
  allerAujourdhui: () => void;
  selectionnerJour: (date: string) => void;
  chargerSemaine: () => Promise<void>;
  ajouterCreneau: (input: Omit<Creneau, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  modifierCreneau: (creneau: Creneau) => Promise<void>;
  supprimerCreneau: (id: string) => Promise<void>;
}

function joursDeLaSemaine(lundi: string): string[] {
  const base = new Date(`${lundi}T00:00:00`);
  return Array.from({ length: 5 }, (_, i) => format(addDays(base, i), ISO));
}

function lundiDe(date: Date): string {
  return format(startOfWeek(date, { weekStartsOn: 1, locale: fr }), ISO);
}

/**
 * Le cahier journal n'affiche que les jours ouvrés (Lundi-Vendredi). Un week-end
 * est donc ramené au lundi suivant, pour que "jourSelectionne" reste toujours
 * dans "joursSemaine" — sinon les créneaux du jour sélectionné ne seraient
 * jamais chargés (chargerSemaine ne récupère que les 5 jours ouvrés).
 */
function jourOuvreLePlusProche(date: Date): Date {
  const jourSemaine = date.getDay(); // 0 = dimanche, 6 = samedi
  if (jourSemaine === 6) return addDays(date, 2);
  if (jourSemaine === 0) return addDays(date, 1);
  return date;
}

const aujourdhui = jourOuvreLePlusProche(new Date());

export const useCahierJournal = create<CahierJournalState>((set, get) => ({
  semaineDebut: lundiDe(aujourdhui),
  joursSemaine: joursDeLaSemaine(lundiDe(aujourdhui)),
  creneauxParJour: {},
  jourSelectionne: format(aujourdhui, ISO),
  chargement: false,

  allerSemaineSuivante: () => {
    const nouveauLundi = format(addDays(new Date(`${get().semaineDebut}T00:00:00`), 7), ISO);
    set({ semaineDebut: nouveauLundi, joursSemaine: joursDeLaSemaine(nouveauLundi) });
    void get().chargerSemaine();
  },

  allerSemainePrecedente: () => {
    const nouveauLundi = format(addDays(new Date(`${get().semaineDebut}T00:00:00`), -7), ISO);
    set({ semaineDebut: nouveauLundi, joursSemaine: joursDeLaSemaine(nouveauLundi) });
    void get().chargerSemaine();
  },

  allerAujourdhui: () => {
    const aujourdhui = jourOuvreLePlusProche(new Date());
    const lundi = lundiDe(aujourdhui);
    set({
      semaineDebut: lundi,
      joursSemaine: joursDeLaSemaine(lundi),
      jourSelectionne: format(aujourdhui, ISO),
    });
    void get().chargerSemaine();
  },

  selectionnerJour: (date) => set({ jourSelectionne: date }),

  chargerSemaine: async () => {
    set({ chargement: true });
    try {
      const jours = get().joursSemaine;
      const creneaux = await listCreneauxSemaine(jours);
      const parJour: Record<string, CreneauAvecSeance[]> = {};
      for (const jour of jours) parJour[jour] = [];
      for (const c of creneaux) {
        (parJour[c.date] ??= []).push(c);
      }
      set({ creneauxParJour: parJour });
    } finally {
      set({ chargement: false });
    }
  },

  ajouterCreneau: async (input) => {
    await createCreneau(input);
    await get().chargerSemaine();
  },

  modifierCreneau: async (creneau) => {
    await updateCreneau(creneau);
    await get().chargerSemaine();
  },

  supprimerCreneau: async (id) => {
    await deleteCreneau(id);
    await get().chargerSemaine();
  },
}));

/** Filtre les créneaux d'un jour pour un groupe donné (colonne GS ou CE2). */
export function creneauxParGroupe(
  creneaux: CreneauAvecSeance[],
  groupes: GroupeCreneau[],
): CreneauAvecSeance[] {
  return creneaux
    .filter((c) => groupes.includes(c.groupe))
    .sort((a, b) => a.heureDebut.localeCompare(b.heureDebut));
}
