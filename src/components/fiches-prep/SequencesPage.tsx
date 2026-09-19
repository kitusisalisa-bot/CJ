import { useEffect, useState } from "react";
import {
  createSequence,
  deleteSequence,
  listAllSequences,
  updateSequence,
} from "@/db/repositories/sequences";
import {
  createSeance,
  deleteSeance,
  listSeancesDeLaSequence,
  updateSeance,
} from "@/db/repositories/seances";
import { ListeSequences } from "./ListeSequences";
import { SequenceForm, type SequenceFormValues } from "./SequenceForm";
import { ListeSeances } from "./ListeSeances";
import { SeanceEditor, type SeanceFormValues } from "./SeanceEditor";
import type { NiveauSequence, Seance, Sequence } from "@/types/models";

type Mode =
  | { type: "vide" }
  | { type: "nouvelle_sequence" }
  | { type: "sequence"; sequence: Sequence }
  | { type: "nouvelle_seance"; sequence: Sequence }
  | { type: "seance"; sequence: Sequence; seance: Seance };

function versInputSequence(values: SequenceFormValues): Omit<Sequence, "id" | "createdAt" | "updatedAt"> {
  return {
    titre: values.titre.trim(),
    discipline: values.discipline,
    niveau: values.niveau,
    periode: values.periode,
    objectifsGeneraux: values.objectifsGeneraux.trim() || undefined,
    competencesProgramme: values.competencesProgramme,
    prerequis: values.prerequis.trim() || undefined,
    nombreSeancesPrevues: values.nombreSeancesPrevues,
    statut: values.statut,
  };
}

function versInputSeance(
  sequenceId: string,
  values: SeanceFormValues,
): Omit<Seance, "id" | "createdAt" | "updatedAt"> {
  return {
    sequenceId,
    numeroOrdre: values.numeroOrdre,
    titre: values.titre.trim(),
    datePrevue: values.datePrevue || undefined,
    dureeMinutes: values.dureeMinutes,
    objectifs: values.objectifs.trim() || undefined,
    competences: values.competences,
    prerequis: values.prerequis.trim() || undefined,
    materiel: values.materiel.trim() || undefined,
    deroulement: values.deroulement,
    differenciation: values.differenciation.trim() || undefined,
    bilanRemediation: values.bilanRemediation.trim() || undefined,
    statut: values.statut,
  };
}

export function SequencesPage() {
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [seances, setSeances] = useState<Seance[]>([]);
  const [filtreNiveau, setFiltreNiveau] = useState<NiveauSequence | "TOUS">("TOUS");
  const [mode, setMode] = useState<Mode>({ type: "vide" });

  async function rechargerSequences() {
    setSequences(await listAllSequences());
  }

  async function rechargerSeances(sequenceId: string) {
    setSeances(await listSeancesDeLaSequence(sequenceId));
  }

  useEffect(() => {
    void rechargerSequences();
  }, []);

  useEffect(() => {
    if (mode.type === "sequence" || mode.type === "nouvelle_seance" || mode.type === "seance") {
      void rechargerSeances(mode.sequence.id);
    } else {
      setSeances([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode.type === "vide" || mode.type === "nouvelle_sequence" ? null : mode.sequence.id]);

  async function handleValiderSequence(values: SequenceFormValues) {
    if (mode.type === "sequence") {
      const sequence = { ...mode.sequence, ...versInputSequence(values) };
      await updateSequence(sequence);
      await rechargerSequences();
      setMode({ type: "sequence", sequence });
    } else {
      const sequence = await createSequence(versInputSequence(values));
      await rechargerSequences();
      setMode({ type: "sequence", sequence });
    }
  }

  async function handleSupprimerSequence() {
    if (mode.type !== "sequence") return;
    if (!window.confirm(`Supprimer « ${mode.sequence.titre} » et toutes ses séances ?`)) return;
    await deleteSequence(mode.sequence.id);
    await rechargerSequences();
    setMode({ type: "vide" });
  }

  async function handleValiderSeance(values: SeanceFormValues) {
    if (mode.type === "seance") {
      const seance = { ...mode.seance, ...versInputSeance(mode.sequence.id, values) };
      await updateSeance(seance);
      await rechargerSeances(mode.sequence.id);
      setMode({ type: "sequence", sequence: mode.sequence });
    } else if (mode.type === "nouvelle_seance") {
      await createSeance(versInputSeance(mode.sequence.id, values));
      await rechargerSeances(mode.sequence.id);
      setMode({ type: "sequence", sequence: mode.sequence });
    }
  }

  async function handleSupprimerSeance() {
    if (mode.type !== "seance") return;
    if (!window.confirm(`Supprimer la séance « ${mode.seance.titre} » ?`)) return;
    await deleteSeance(mode.seance.id);
    await rechargerSeances(mode.sequence.id);
    setMode({ type: "sequence", sequence: mode.sequence });
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <ListeSequences
        sequences={sequences}
        sequenceSelectionneeId={
          mode.type === "sequence" || mode.type === "nouvelle_seance" || mode.type === "seance"
            ? mode.sequence.id
            : undefined
        }
        filtreNiveau={filtreNiveau}
        onFiltreNiveauChange={setFiltreNiveau}
        onSelectionner={(sequence) => setMode({ type: "sequence", sequence })}
        onNouvelle={() => setMode({ type: "nouvelle_sequence" })}
      />

      <div className="flex-1 overflow-y-auto p-5">
        {mode.type === "vide" && (
          <p className="text-sm text-slate-400 italic">
            Sélectionnez une séquence, ou créez-en une nouvelle pour commencer une fiche de préparation.
          </p>
        )}

        {mode.type === "nouvelle_sequence" && (
          <>
            <h2 className="text-lg font-bold text-slate-800 mb-4">Nouvelle séquence</h2>
            <SequenceForm onValider={handleValiderSequence} onAnnuler={() => setMode({ type: "vide" })} />
          </>
        )}

        {mode.type === "sequence" && (
          <>
            <h2 className="text-lg font-bold text-slate-800 mb-4">{mode.sequence.titre}</h2>
            <SequenceForm
              key={mode.sequence.id}
              sequence={mode.sequence}
              onValider={handleValiderSequence}
              onAnnuler={() => setMode({ type: "vide" })}
              onSupprimer={handleSupprimerSequence}
            />
            <div className="mt-6 max-w-2xl">
              <ListeSeances
                seances={seances}
                onSelectionner={(seance) => setMode({ type: "seance", sequence: mode.sequence, seance })}
                onNouvelle={() => setMode({ type: "nouvelle_seance", sequence: mode.sequence })}
              />
            </div>
          </>
        )}

        {mode.type === "nouvelle_seance" && (
          <>
            <button
              type="button"
              onClick={() => setMode({ type: "sequence", sequence: mode.sequence })}
              className="text-xs text-slate-500 hover:text-slate-700 mb-3"
            >
              ← Retour à « {mode.sequence.titre} »
            </button>
            <h2 className="text-lg font-bold text-slate-800 mb-4">Nouvelle séance</h2>
            <SeanceEditor
              numeroOrdreParDefaut={seances.length + 1}
              onValider={handleValiderSeance}
              onAnnuler={() => setMode({ type: "sequence", sequence: mode.sequence })}
            />
          </>
        )}

        {mode.type === "seance" && (
          <>
            <button
              type="button"
              onClick={() => setMode({ type: "sequence", sequence: mode.sequence })}
              className="text-xs text-slate-500 hover:text-slate-700 mb-3"
            >
              ← Retour à « {mode.sequence.titre} »
            </button>
            <h2 className="text-lg font-bold text-slate-800 mb-4">{mode.seance.titre}</h2>
            <SeanceEditor
              key={mode.seance.id}
              seance={mode.seance}
              onValider={handleValiderSeance}
              onAnnuler={() => setMode({ type: "sequence", sequence: mode.sequence })}
              onSupprimer={handleSupprimerSeance}
            />
          </>
        )}
      </div>
    </div>
  );
}
