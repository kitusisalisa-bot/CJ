import { useState } from "react";
import { ResponsablesEditor } from "./ResponsablesEditor";
import type { Autorisations, Eleve, Niveau, Responsable } from "@/types/models";

export interface EleveFormValues {
  prenom: string;
  nom: string;
  niveau: Niveau;
  dateNaissance: string;
  dateEntreeClasse: string;
  responsables: Responsable[];
  aPai: boolean;
  paiDetails: string;
  aPpre: boolean;
  ppreDetails: string;
  aPap: boolean;
  papDetails: string;
  allergies: string;
  autorisations: Autorisations;
  notesConfidentielles: string;
}

function valeursInitiales(eleve?: Eleve): EleveFormValues {
  return {
    prenom: eleve?.prenom ?? "",
    nom: eleve?.nom ?? "",
    niveau: eleve?.niveau ?? "GS",
    dateNaissance: eleve?.dateNaissance ?? "",
    dateEntreeClasse: eleve?.dateEntreeClasse ?? "",
    responsables: eleve?.responsables ?? [],
    aPai: eleve?.aPai ?? false,
    paiDetails: eleve?.paiDetails ?? "",
    aPpre: eleve?.aPpre ?? false,
    ppreDetails: eleve?.ppreDetails ?? "",
    aPap: eleve?.aPap ?? false,
    papDetails: eleve?.papDetails ?? "",
    allergies: eleve?.allergies ?? "",
    autorisations: eleve?.autorisations ?? {},
    notesConfidentielles: eleve?.notesConfidentielles ?? "",
  };
}

interface EleveFormProps {
  eleve?: Eleve;
  onValider: (values: EleveFormValues) => Promise<void>;
  onAnnuler: () => void;
  onSupprimer?: () => Promise<void>;
}

export function EleveForm({ eleve, onValider, onAnnuler, onSupprimer }: EleveFormProps) {
  const [values, setValues] = useState<EleveFormValues>(() => valeursInitiales(eleve));
  const [notesVisibles, setNotesVisibles] = useState(false);
  const [enCours, setEnCours] = useState(false);

  function set<K extends keyof EleveFormValues>(key: K, value: EleveFormValues[K]) {
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
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
      <section className="space-y-2">
        <h3 className="font-bold text-slate-800">Identité</h3>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-sm">
            Prénom
            <input
              type="text"
              value={values.prenom}
              onChange={(e) => set("prenom", e.target.value)}
              className="mt-0.5 w-full rounded border border-slate-200 px-2 py-1"
              required
            />
          </label>
          <label className="text-sm">
            Nom
            <input
              type="text"
              value={values.nom}
              onChange={(e) => set("nom", e.target.value)}
              className="mt-0.5 w-full rounded border border-slate-200 px-2 py-1"
              required
            />
          </label>
          <label className="text-sm">
            Niveau
            <select
              value={values.niveau}
              onChange={(e) => set("niveau", e.target.value as Niveau)}
              className="mt-0.5 w-full rounded border border-slate-200 px-2 py-1"
            >
              <option value="GS">Grande Section</option>
              <option value="CE2">CE2</option>
            </select>
          </label>
          <label className="text-sm">
            Date de naissance
            <input
              type="date"
              value={values.dateNaissance}
              onChange={(e) => set("dateNaissance", e.target.value)}
              className="mt-0.5 w-full rounded border border-slate-200 px-2 py-1"
            />
          </label>
          <label className="text-sm col-span-2">
            Date d'entrée dans la classe
            <input
              type="date"
              value={values.dateEntreeClasse}
              onChange={(e) => set("dateEntreeClasse", e.target.value)}
              className="mt-0.5 w-full rounded border border-slate-200 px-2 py-1"
            />
          </label>
        </div>
      </section>

      <section className="space-y-2">
        <h3 className="font-bold text-slate-800">Responsables légaux</h3>
        <ResponsablesEditor
          responsables={values.responsables}
          onChange={(responsables) => set("responsables", responsables)}
        />
      </section>

      <section className="space-y-2">
        <h3 className="font-bold text-slate-800">Suivi / adaptations pédagogiques</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={values.aPai}
              onChange={(e) => set("aPai", e.target.checked)}
              className="accent-ce2-500"
            />
            PAI (Projet d'Accueil Individualisé)
          </label>
          {values.aPai && (
            <textarea
              value={values.paiDetails}
              onChange={(e) => set("paiDetails", e.target.value)}
              placeholder="Détails du PAI..."
              rows={2}
              className="w-full text-sm rounded border border-slate-200 px-2 py-1"
            />
          )}

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={values.aPpre}
              onChange={(e) => set("aPpre", e.target.checked)}
              className="accent-ce2-500"
            />
            PPRE (Programme Personnalisé de Réussite Éducative)
          </label>
          {values.aPpre && (
            <textarea
              value={values.ppreDetails}
              onChange={(e) => set("ppreDetails", e.target.value)}
              placeholder="Détails du PPRE..."
              rows={2}
              className="w-full text-sm rounded border border-slate-200 px-2 py-1"
            />
          )}

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={values.aPap}
              onChange={(e) => set("aPap", e.target.checked)}
              className="accent-ce2-500"
            />
            PAP (Plan d'Accompagnement Personnalisé)
          </label>
          {values.aPap && (
            <textarea
              value={values.papDetails}
              onChange={(e) => set("papDetails", e.target.value)}
              placeholder="Détails du PAP..."
              rows={2}
              className="w-full text-sm rounded border border-slate-200 px-2 py-1"
            />
          )}
        </div>

        <label className="block text-sm">
          Allergies
          <textarea
            value={values.allergies}
            onChange={(e) => set("allergies", e.target.value)}
            rows={2}
            className="mt-0.5 w-full rounded border border-slate-200 px-2 py-1"
          />
        </label>
      </section>

      <section className="space-y-2">
        <h3 className="font-bold text-slate-800">Autorisations</h3>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={values.autorisations.droitImage ?? false}
            onChange={(e) =>
              set("autorisations", { ...values.autorisations, droitImage: e.target.checked })
            }
          />
          Droit à l'image
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={values.autorisations.sortiesScolaires ?? false}
            onChange={(e) =>
              set("autorisations", { ...values.autorisations, sortiesScolaires: e.target.checked })
            }
          />
          Sorties scolaires
        </label>
        <label className="block text-sm">
          Personnes autorisées à récupérer l'enfant
          <input
            type="text"
            value={values.autorisations.recupParTiers ?? ""}
            onChange={(e) =>
              set("autorisations", { ...values.autorisations, recupParTiers: e.target.value })
            }
            className="mt-0.5 w-full rounded border border-slate-200 px-2 py-1"
          />
        </label>
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-800">Notes confidentielles</h3>
          <button
            type="button"
            onClick={() => setNotesVisibles((v) => !v)}
            className="text-xs text-slate-500 hover:text-slate-700"
          >
            {notesVisibles ? "Masquer" : "Afficher"}
          </button>
        </div>
        {notesVisibles ? (
          <textarea
            value={values.notesConfidentielles}
            onChange={(e) => set("notesConfidentielles", e.target.value)}
            rows={3}
            placeholder="Visible uniquement dans cette fiche, jamais dans le cahier journal ni en Mode Classe."
            className="w-full text-sm rounded border border-slate-200 px-2 py-1"
          />
        ) : (
          <p className="text-sm text-slate-400 italic">Contenu masqué — cliquez sur « Afficher ».</p>
        )}
      </section>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <div>
          {onSupprimer && (
            <button
              type="button"
              onClick={() => void onSupprimer()}
              className="text-sm text-red-500 hover:text-red-700"
            >
              Supprimer cet élève
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
