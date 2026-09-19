import { useState } from "react";
import type { Eleve, RendezVous, TypeRdv } from "@/types/models";

const TYPES_RDV: { value: TypeRdv; label: string }[] = [
  { value: "parents", label: "Parents" },
  { value: "rased", label: "RASED" },
  { value: "equipe_educative", label: "Équipe éducative" },
  { value: "reunion_cycle", label: "Réunion de cycle" },
  { value: "autre", label: "Autre" },
];

export interface RdvFormValues {
  date: string;
  heureDebut: string;
  heureFin: string;
  typeRdv: TypeRdv;
  titre: string;
  participants: string;
  lieu: string;
  notes: string;
  eleveId: string;
}

function valeursInitiales(rdv?: RendezVous, dateParDefaut?: string): RdvFormValues {
  return {
    date: rdv?.date ?? dateParDefaut ?? new Date().toISOString().slice(0, 10),
    heureDebut: rdv?.heureDebut ?? "17:00",
    heureFin: rdv?.heureFin ?? "17:30",
    typeRdv: rdv?.typeRdv ?? "parents",
    titre: rdv?.titre ?? "",
    participants: rdv?.participants ?? "",
    lieu: rdv?.lieu ?? "",
    notes: rdv?.notes ?? "",
    eleveId: rdv?.eleveId ?? "",
  };
}

interface RdvFormProps {
  rdv?: RendezVous;
  dateParDefaut?: string;
  eleves: Eleve[];
  onValider: (values: RdvFormValues) => Promise<void>;
  onFermer: () => void;
  onSupprimer?: () => Promise<void>;
}

export function RdvForm({ rdv, dateParDefaut, eleves, onValider, onFermer, onSupprimer }: RdvFormProps) {
  const [values, setValues] = useState<RdvFormValues>(() => valeursInitiales(rdv, dateParDefaut));
  const [enCours, setEnCours] = useState(false);

  function set<K extends keyof RdvFormValues>(key: K, value: RdvFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEnCours(true);
    try {
      await onValider(values);
      onFermer();
    } finally {
      setEnCours(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-lg bg-white p-4 shadow-xl space-y-3 max-h-[90vh] overflow-y-auto"
      >
        <h3 className="font-bold text-slate-800">{rdv ? "Modifier le rendez-vous" : "Nouveau rendez-vous"}</h3>

        <label className="block text-sm">
          Titre
          <input
            type="text"
            value={values.titre}
            onChange={(e) => set("titre", e.target.value)}
            placeholder="Ex : Entretien famille Dupont"
            className="mt-0.5 w-full rounded border border-slate-200 px-2 py-1"
            required
          />
        </label>

        <div className="grid grid-cols-3 gap-2">
          <label className="text-sm col-span-1">
            Date
            <input
              type="date"
              value={values.date}
              onChange={(e) => set("date", e.target.value)}
              className="mt-0.5 w-full rounded border border-slate-200 px-2 py-1"
              required
            />
          </label>
          <label className="text-sm">
            Début
            <input
              type="time"
              value={values.heureDebut}
              onChange={(e) => set("heureDebut", e.target.value)}
              className="mt-0.5 w-full rounded border border-slate-200 px-2 py-1"
              required
            />
          </label>
          <label className="text-sm">
            Fin
            <input
              type="time"
              value={values.heureFin}
              onChange={(e) => set("heureFin", e.target.value)}
              className="mt-0.5 w-full rounded border border-slate-200 px-2 py-1"
              required
            />
          </label>
        </div>

        <label className="block text-sm">
          Type
          <select
            value={values.typeRdv}
            onChange={(e) => set("typeRdv", e.target.value as TypeRdv)}
            className="mt-0.5 w-full rounded border border-slate-200 px-2 py-1"
          >
            {TYPES_RDV.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          Élève concerné (optionnel)
          <select
            value={values.eleveId}
            onChange={(e) => set("eleveId", e.target.value)}
            className="mt-0.5 w-full rounded border border-slate-200 px-2 py-1"
          >
            <option value="">—</option>
            {eleves.map((el) => (
              <option key={el.id} value={el.id}>
                {el.prenom} {el.nom} ({el.niveau})
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          Participants
          <input
            type="text"
            value={values.participants}
            onChange={(e) => set("participants", e.target.value)}
            placeholder="Ex : Mme Dupont, psychologue scolaire"
            className="mt-0.5 w-full rounded border border-slate-200 px-2 py-1"
          />
        </label>

        <label className="block text-sm">
          Lieu
          <input
            type="text"
            value={values.lieu}
            onChange={(e) => set("lieu", e.target.value)}
            placeholder="Ex : Salle des maîtres"
            className="mt-0.5 w-full rounded border border-slate-200 px-2 py-1"
          />
        </label>

        <label className="block text-sm">
          Notes
          <textarea
            value={values.notes}
            onChange={(e) => set("notes", e.target.value)}
            rows={3}
            className="mt-0.5 w-full rounded border border-slate-200 px-2 py-1"
          />
        </label>

        <div className="flex items-center justify-between pt-2">
          <div>
            {onSupprimer && (
              <button
                type="button"
                onClick={() => void onSupprimer().then(onFermer)}
                className="text-sm text-red-500 hover:text-red-700"
              >
                Supprimer
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onFermer}
              className="px-3 py-1.5 text-sm rounded text-slate-600 hover:bg-slate-100"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={enCours}
              className="px-3 py-1.5 text-sm rounded bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-50"
            >
              Enregistrer
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
