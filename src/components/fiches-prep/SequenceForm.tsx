import { useState } from "react";
import { ListeChips } from "./ListeChips";
import { DISCIPLINES, type Discipline, type NiveauSequence, type Periode, type Sequence, type StatutSequence } from "@/types/models";

const PERIODES: Periode[] = ["P1", "P2", "P3", "P4", "P5"];
const STATUTS: { value: StatutSequence; label: string }[] = [
  { value: "planifiee", label: "Planifiée" },
  { value: "en_cours", label: "En cours" },
  { value: "terminee", label: "Terminée" },
  { value: "archivee", label: "Archivée" },
];

export interface SequenceFormValues {
  titre: string;
  discipline: Discipline;
  niveau: NiveauSequence;
  periode: Periode;
  objectifsGeneraux: string;
  competencesProgramme: string[];
  prerequis: string;
  nombreSeancesPrevues: number;
  statut: StatutSequence;
}

function valeursInitiales(sequence?: Sequence): SequenceFormValues {
  return {
    titre: sequence?.titre ?? "",
    discipline: sequence?.discipline ?? "Français",
    niveau: sequence?.niveau ?? "GS_CE2",
    periode: sequence?.periode ?? "P1",
    objectifsGeneraux: sequence?.objectifsGeneraux ?? "",
    competencesProgramme: sequence?.competencesProgramme ?? [],
    prerequis: sequence?.prerequis ?? "",
    nombreSeancesPrevues: sequence?.nombreSeancesPrevues ?? 1,
    statut: sequence?.statut ?? "planifiee",
  };
}

interface SequenceFormProps {
  sequence?: Sequence;
  onValider: (values: SequenceFormValues) => Promise<void>;
  onAnnuler: () => void;
  onSupprimer?: () => Promise<void>;
}

export function SequenceForm({ sequence, onValider, onAnnuler, onSupprimer }: SequenceFormProps) {
  const [values, setValues] = useState<SequenceFormValues>(() => valeursInitiales(sequence));
  const [enCours, setEnCours] = useState(false);

  function set<K extends keyof SequenceFormValues>(key: K, value: SequenceFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEnCours(true);
    try {
      await onValider(values);
    } finally {
      setEnCours(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <div className="grid grid-cols-2 gap-2">
        <label className="text-sm col-span-2">
          Titre de la séquence
          <input
            type="text"
            value={values.titre}
            onChange={(e) => set("titre", e.target.value)}
            placeholder="Ex : Comparer et ranger des nombres jusqu'à 100"
            className="mt-0.5 w-full rounded border border-slate-200 px-2 py-1"
            required
          />
        </label>
        <label className="text-sm">
          Discipline
          <select
            value={values.discipline}
            onChange={(e) => set("discipline", e.target.value as Discipline)}
            className="mt-0.5 w-full rounded border border-slate-200 px-2 py-1"
          >
            {DISCIPLINES.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Niveau
          <select
            value={values.niveau}
            onChange={(e) => set("niveau", e.target.value as NiveauSequence)}
            className="mt-0.5 w-full rounded border border-slate-200 px-2 py-1"
          >
            <option value="GS">GS</option>
            <option value="CE2">CE2</option>
            <option value="GS_CE2">GS + CE2</option>
          </select>
        </label>
        <label className="text-sm">
          Période
          <select
            value={values.periode}
            onChange={(e) => set("periode", e.target.value as Periode)}
            className="mt-0.5 w-full rounded border border-slate-200 px-2 py-1"
          >
            {PERIODES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Statut
          <select
            value={values.statut}
            onChange={(e) => set("statut", e.target.value as StatutSequence)}
            className="mt-0.5 w-full rounded border border-slate-200 px-2 py-1"
          >
            {STATUTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm col-span-2">
          Nombre de séances prévues
          <input
            type="number"
            min={1}
            value={values.nombreSeancesPrevues}
            onChange={(e) => set("nombreSeancesPrevues", Number(e.target.value) || 1)}
            className="mt-0.5 w-32 rounded border border-slate-200 px-2 py-1"
          />
        </label>
      </div>

      <label className="block text-sm">
        Objectifs généraux
        <textarea
          value={values.objectifsGeneraux}
          onChange={(e) => set("objectifsGeneraux", e.target.value)}
          rows={2}
          className="mt-0.5 w-full rounded border border-slate-200 px-2 py-1"
        />
      </label>

      <div>
        <p className="text-sm mb-1">Compétences du programme visées</p>
        <ListeChips
          valeurs={values.competencesProgramme}
          onChange={(v) => set("competencesProgramme", v)}
          placeholder="Ex : Résoudre des problèmes additifs"
        />
      </div>

      <label className="block text-sm">
        Prérequis
        <textarea
          value={values.prerequis}
          onChange={(e) => set("prerequis", e.target.value)}
          rows={2}
          className="mt-0.5 w-full rounded border border-slate-200 px-2 py-1"
        />
      </label>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <div>
          {onSupprimer && (
            <button
              type="button"
              onClick={() => void onSupprimer()}
              className="text-sm text-red-500 hover:text-red-700"
            >
              Supprimer cette séquence (et ses séances)
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onAnnuler}
            className="px-3 py-1.5 text-sm rounded text-slate-600 hover:bg-slate-100"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={enCours}
            className="px-4 py-1.5 text-sm rounded bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-50"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </form>
  );
}
