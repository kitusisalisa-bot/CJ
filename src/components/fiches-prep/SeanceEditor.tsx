import { useState } from "react";
import { ListeChips } from "./ListeChips";
import { DeroulementEditor } from "./DeroulementEditor";
import type { EtapeDeroulement, Seance, StatutSeance } from "@/types/models";

const STATUTS: { value: StatutSeance; label: string }[] = [
  { value: "a_faire", label: "À faire" },
  { value: "faite", label: "Faite" },
  { value: "reportee", label: "Reportée" },
  { value: "annulee", label: "Annulée" },
];

export interface SeanceFormValues {
  titre: string;
  numeroOrdre: number;
  datePrevue: string;
  dureeMinutes: number;
  objectifs: string;
  competences: string[];
  prerequis: string;
  materiel: string;
  deroulement: EtapeDeroulement[];
  differenciation: string;
  bilanRemediation: string;
  statut: StatutSeance;
}

function valeursInitiales(seance?: Seance, numeroOrdreParDefaut?: number): SeanceFormValues {
  return {
    titre: seance?.titre ?? "",
    numeroOrdre: seance?.numeroOrdre ?? numeroOrdreParDefaut ?? 1,
    datePrevue: seance?.datePrevue ?? "",
    dureeMinutes: seance?.dureeMinutes ?? 30,
    objectifs: seance?.objectifs ?? "",
    competences: seance?.competences ?? [],
    prerequis: seance?.prerequis ?? "",
    materiel: seance?.materiel ?? "",
    deroulement: seance?.deroulement ?? [],
    differenciation: seance?.differenciation ?? "",
    bilanRemediation: seance?.bilanRemediation ?? "",
    statut: seance?.statut ?? "a_faire",
  };
}

interface SeanceEditorProps {
  seance?: Seance;
  numeroOrdreParDefaut?: number;
  onValider: (values: SeanceFormValues) => Promise<void>;
  onAnnuler: () => void;
  onSupprimer?: () => Promise<void>;
}

export function SeanceEditor({
  seance,
  numeroOrdreParDefaut,
  onValider,
  onAnnuler,
  onSupprimer,
}: SeanceEditorProps) {
  const [values, setValues] = useState<SeanceFormValues>(() =>
    valeursInitiales(seance, numeroOrdreParDefaut),
  );
  const [enCours, setEnCours] = useState(false);

  function set<K extends keyof SeanceFormValues>(key: K, value: SeanceFormValues[K]) {
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
      <div className="grid grid-cols-4 gap-2">
        <label className="text-sm col-span-2">
          Titre de la séance
          <input
            type="text"
            value={values.titre}
            onChange={(e) => set("titre", e.target.value)}
            placeholder="Ex : Séance 3 — Ranger des nombres avec la file numérique"
            className="mt-0.5 w-full rounded border border-slate-200 px-2 py-1"
            required
          />
        </label>
        <label className="text-sm">
          N° dans la séquence
          <input
            type="number"
            min={1}
            value={values.numeroOrdre}
            onChange={(e) => set("numeroOrdre", Number(e.target.value) || 1)}
            className="mt-0.5 w-full rounded border border-slate-200 px-2 py-1"
          />
        </label>
        <label className="text-sm">
          Durée (min)
          <input
            type="number"
            min={1}
            value={values.dureeMinutes}
            onChange={(e) => set("dureeMinutes", Number(e.target.value) || 0)}
            className="mt-0.5 w-full rounded border border-slate-200 px-2 py-1"
          />
        </label>
        <label className="text-sm">
          Date prévue
          <input
            type="date"
            value={values.datePrevue}
            onChange={(e) => set("datePrevue", e.target.value)}
            className="mt-0.5 w-full rounded border border-slate-200 px-2 py-1"
          />
        </label>
        <label className="text-sm col-span-3">
          Statut
          <select
            value={values.statut}
            onChange={(e) => set("statut", e.target.value as StatutSeance)}
            className="mt-0.5 w-full rounded border border-slate-200 px-2 py-1"
          >
            {STATUTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block text-sm">
        Objectifs de la séance
        <textarea
          value={values.objectifs}
          onChange={(e) => set("objectifs", e.target.value)}
          rows={2}
          className="mt-0.5 w-full rounded border border-slate-200 px-2 py-1"
        />
      </label>

      <div>
        <p className="text-sm mb-1">Compétences travaillées</p>
        <ListeChips
          valeurs={values.competences}
          onChange={(v) => set("competences", v)}
          placeholder="Ex : Comparer deux nombres"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label className="text-sm">
          Prérequis
          <textarea
            value={values.prerequis}
            onChange={(e) => set("prerequis", e.target.value)}
            rows={2}
            className="mt-0.5 w-full rounded border border-slate-200 px-2 py-1"
          />
        </label>
        <label className="text-sm">
          Matériel
          <textarea
            value={values.materiel}
            onChange={(e) => set("materiel", e.target.value)}
            rows={2}
            className="mt-0.5 w-full rounded border border-slate-200 px-2 py-1"
          />
        </label>
      </div>

      <section>
        <h3 className="font-bold text-slate-800 mb-2">Déroulement pas à pas</h3>
        <DeroulementEditor etapes={values.deroulement} onChange={(v) => set("deroulement", v)} />
      </section>

      <label className="block text-sm">
        Différenciation (GS / CE2 / élèves à besoins particuliers)
        <textarea
          value={values.differenciation}
          onChange={(e) => set("differenciation", e.target.value)}
          rows={2}
          className="mt-0.5 w-full rounded border border-slate-200 px-2 py-1"
        />
      </label>

      <label className="block text-sm">
        Bilan / remédiation
        <textarea
          value={values.bilanRemediation}
          onChange={(e) => set("bilanRemediation", e.target.value)}
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
              Supprimer cette séance
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
