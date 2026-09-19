import { useEffect, useMemo, useState } from "react";
import { listAllSequences } from "@/db/repositories/sequences";
import { listAllSeances } from "@/db/repositories/seances";
import {
  DISCIPLINES,
  type Creneau,
  type Discipline,
  type GroupeCreneau,
  type Seance,
  type Sequence,
  type TypeCreneau,
} from "@/types/models";

interface CreneauFormProps {
  date: string;
  groupeParDefaut: GroupeCreneau;
  creneau?: Creneau;
  onValider: (input: Omit<Creneau, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  onFermer: () => void;
  onSupprimer?: () => Promise<void>;
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

/** Une séance n'est proposée pour un groupe que si le niveau de sa séquence est compatible. */
function niveauCompatible(groupe: GroupeCreneau, sequence: Sequence): boolean {
  if (sequence.niveau === "GS_CE2" || groupe === "COMMUN") return true;
  if (groupe.startsWith("GS_")) return sequence.niveau === "GS";
  if (groupe.startsWith("CE2_")) return sequence.niveau === "CE2";
  return true;
}

export function CreneauForm({
  date,
  groupeParDefaut,
  creneau,
  onValider,
  onFermer,
  onSupprimer,
}: CreneauFormProps) {
  const [heureDebut, setHeureDebut] = useState(creneau?.heureDebut ?? "09:00");
  const [heureFin, setHeureFin] = useState(creneau?.heureFin ?? "09:30");
  const [groupe, setGroupe] = useState<GroupeCreneau>(creneau?.groupe ?? groupeParDefaut);
  const [typeCreneau, setTypeCreneau] = useState<TypeCreneau>(creneau?.typeCreneau ?? "seance");
  const [discipline, setDiscipline] = useState<Discipline>(creneau?.discipline ?? "Français");
  const [seanceId, setSeanceId] = useState<string>(creneau?.seanceId ?? "");
  const [titreLibre, setTitreLibre] = useState(creneau?.titreLibre ?? "");
  const [enCours, setEnCours] = useState(false);

  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [seances, setSeances] = useState<Seance[]>([]);

  useEffect(() => {
    void listAllSequences().then(setSequences);
    void listAllSeances().then(setSeances);
  }, []);

  const sequenceParId = useMemo(() => new Map(sequences.map((s) => [s.id, s])), [sequences]);

  const seancesCompatibles = useMemo(
    () =>
      seances.filter((s) => {
        const sequence = sequenceParId.get(s.sequenceId);
        return sequence && niveauCompatible(groupe, sequence);
      }),
    [seances, sequenceParId, groupe],
  );

  const seancesParSequence = useMemo(() => {
    const groupes = new Map<string, Seance[]>();
    for (const s of seancesCompatibles) {
      const liste = groupes.get(s.sequenceId) ?? [];
      liste.push(s);
      groupes.set(s.sequenceId, liste);
    }
    return groupes;
  }, [seancesCompatibles]);

  function handleChoisirSeance(id: string) {
    setSeanceId(id);
    const seance = seances.find((s) => s.id === id);
    const sequence = seance ? sequenceParId.get(seance.sequenceId) : undefined;
    if (sequence) setDiscipline(sequence.discipline);
  }

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
        seanceId: typeCreneau === "seance" && seanceId ? seanceId : undefined,
        titreLibre: seanceId ? undefined : titreLibre.trim() || undefined,
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
        className="w-full max-w-md rounded-lg bg-white p-4 shadow-xl space-y-3 max-h-[90vh] overflow-y-auto"
      >
        <h3 className="font-bold text-slate-800">
          {creneau ? "Modifier le créneau" : "Nouveau créneau"} — {date}
        </h3>

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
          <>
            <label className="block text-sm">
              Fiche de préparation liée (optionnel)
              <select
                value={seanceId}
                onChange={(e) => handleChoisirSeance(e.target.value)}
                className="mt-0.5 w-full rounded border border-slate-200 px-2 py-1"
              >
                <option value="">— Aucune (titre libre) —</option>
                {[...seancesParSequence.entries()].map(([sequenceId, seancesDeLaSequence]) => {
                  const sequence = sequenceParId.get(sequenceId);
                  return (
                    <optgroup key={sequenceId} label={sequence?.titre ?? "Séquence"}>
                      {seancesDeLaSequence.map((s) => (
                        <option key={s.id} value={s.id}>
                          #{s.numeroOrdre} — {s.titre}
                        </option>
                      ))}
                    </optgroup>
                  );
                })}
              </select>
              {seancesCompatibles.length === 0 && (
                <p className="mt-1 text-xs text-slate-400">
                  Aucune séance créée pour ce niveau dans « Fiches de prép » — vous pouvez saisir un titre libre.
                </p>
              )}
            </label>

            <label className="block text-sm">
              Discipline
              <select
                value={discipline}
                onChange={(e) => setDiscipline(e.target.value as Discipline)}
                disabled={!!seanceId}
                className="mt-0.5 w-full rounded border border-slate-200 px-2 py-1 disabled:bg-slate-100 disabled:text-slate-400"
              >
                {DISCIPLINES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              {seanceId && (
                <p className="mt-1 text-xs text-slate-400">
                  Déterminée par la séquence liée.
                </p>
              )}
            </label>
          </>
        )}

        <label className="block text-sm">
          Titre {seanceId && <span className="text-slate-400">(remplacé par le titre de la fiche liée)</span>}
          <input
            type="text"
            value={seanceId ? (seances.find((s) => s.id === seanceId)?.titre ?? "") : titreLibre}
            onChange={(e) => setTitreLibre(e.target.value)}
            disabled={!!seanceId}
            placeholder="Ex : Numération — comparer des nombres"
            className="mt-0.5 w-full rounded border border-slate-200 px-2 py-1 disabled:bg-slate-100 disabled:text-slate-400"
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
              {creneau ? "Enregistrer" : "Ajouter"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
