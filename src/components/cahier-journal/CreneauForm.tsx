import { useState } from "react";
import { DISCIPLINES, type Creneau, type Discipline, type GroupeCreneau, type TypeCreneau } from "@/types/models";

interface CreneauFormProps {
  date: string;
  groupeParDefaut: GroupeCreneau;
  onValider: (input: Omit<Creneau, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  onFermer: () => void;
}

const GROUPES: { value: GroupeCreneau; label: string }[] = [
  { value: "GS_DIRIGE", label: "GS — Travail dirigé" },
  { value: "GS_AUTONOME", label: "GS — Autonomie" },
  { value: "CE2_DIRIGE", label: "CE2 — Travail dirigé" },
  { value: "CE2_AUTONOME", label: "CE2 — Autonomie" },
  { value: "COMMUN", label: "Groupe classe entier" },
];

const TYPES: { value: TypeCreneau; label: string }[] = [
  { value: "seance", label: "Séance" },
  { value: "rituel", label: "Rituel" },
  { value: "recreation", label: "Récréation" },
  { value: "cantine", label: "Cantine" },
  { value: "accueil", label: "Accueil" },
  { value: "autre", label: "Autre" },
];

export function CreneauForm({ date, groupeParDefaut, onValider, onFermer }: CreneauFormProps) {
  const [heureDebut, setHeureDebut] = useState("09:00");
  const [heureFin, setHeureFin] = useState("09:30");
  const [groupe, setGroupe] = useState<GroupeCreneau>(groupeParDefaut);
  const [typeCreneau, setTypeCreneau] = useState<TypeCreneau>("seance");
  const [discipline, setDiscipline] = useState<Discipline>("Français");
  const [titreLibre, setTitreLibre] = useState("");
  const [enCours, setEnCours] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEnCours(true);
    try {
      await onValider({
        date,
        heureDebut,
        heureFin,
        groupe,
        typeCreneau,
        discipline: typeCreneau === "seance" ? discipline : undefined,
        titreLibre: titreLibre.trim() || undefined,
      });
      onFermer();
    } finally {
      setEnCours(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-lg bg-white p-4 shadow-xl space-y-3"
      >
        <h3 className="font-bold text-slate-800">Nouveau créneau — {date}</h3>

        <div className="grid grid-cols-2 gap-2">
          <label className="text-sm">
            Début
            <input
              type="time"
              value={heureDebut}
              onChange={(e) => setHeureDebut(e.target.value)}
              className="mt-0.5 w-full rounded border border-slate-200 px-2 py-1"
              required
            />
          </label>
          <label className="text-sm">
            Fin
            <input
              type="time"
              value={heureFin}
              onChange={(e) => setHeureFin(e.target.value)}
              className="mt-0.5 w-full rounded border border-slate-200 px-2 py-1"
              required
            />
          </label>
        </div>

        <label className="block text-sm">
          Groupe
          <select
            value={groupe}
            onChange={(e) => setGroupe(e.target.value as GroupeCreneau)}
            className="mt-0.5 w-full rounded border border-slate-200 px-2 py-1"
          >
            {GROUPES.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          Type
          <select
            value={typeCreneau}
            onChange={(e) => setTypeCreneau(e.target.value as TypeCreneau)}
            className="mt-0.5 w-full rounded border border-slate-200 px-2 py-1"
          >
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>

        {typeCreneau === "seance" && (
          <label className="block text-sm">
            Discipline
            <select
              value={discipline}
              onChange={(e) => setDiscipline(e.target.value as Discipline)}
              className="mt-0.5 w-full rounded border border-slate-200 px-2 py-1"
            >
              {DISCIPLINES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="block text-sm">
          Titre
          <input
            type="text"
            value={titreLibre}
            onChange={(e) => setTitreLibre(e.target.value)}
            placeholder="Ex : Numération — comparer des nombres"
            className="mt-0.5 w-full rounded border border-slate-200 px-2 py-1"
          />
        </label>

        <div className="flex justify-end gap-2 pt-2">
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
            Ajouter
          </button>
        </div>
      </form>
    </div>
  );
}
