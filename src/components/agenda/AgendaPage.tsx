import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  createRendezVous,
  deleteRendezVous,
  listRendezVousAVenir,
  listRendezVousPasses,
  updateRendezVous,
} from "@/db/repositories/rendezVous";
import { useEleves } from "@/stores/useEleves";
import { RdvCard } from "./RdvCard";
import { RdvForm, type RdvFormValues } from "./RdvForm";
import type { RendezVous } from "@/types/models";

type Onglet = "avenir" | "passes";

function valeursVersInput(values: RdvFormValues): Omit<RendezVous, "id" | "createdAt" | "updatedAt"> {
  return {
    date: values.date,
    heureDebut: values.heureDebut,
    heureFin: values.heureFin,
    typeRdv: values.typeRdv,
    titre: values.titre.trim(),
    participants: values.participants.trim() || undefined,
    lieu: values.lieu.trim() || undefined,
    notes: values.notes.trim() || undefined,
    eleveId: values.eleveId || undefined,
  };
}

export function AgendaPage() {
  const eleves = useEleves((s) => s.eleves);
  const chargerEleves = useEleves((s) => s.charger);

  const [onglet, setOnglet] = useState<Onglet>("avenir");
  const [rdvs, setRdvs] = useState<RendezVous[]>([]);
  const [formulaireOuvert, setFormulaireOuvert] = useState(false);
  const [rdvEnEdition, setRdvEnEdition] = useState<RendezVous | undefined>(undefined);

  const aujourdhui = useMemo(() => new Date().toISOString().slice(0, 10), []);

  async function recharger() {
    const liste =
      onglet === "avenir" ? await listRendezVousAVenir(aujourdhui) : await listRendezVousPasses(aujourdhui);
    setRdvs(liste);
  }

  useEffect(() => {
    void chargerEleves();
  }, [chargerEleves]);

  useEffect(() => {
    void recharger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onglet]);

  const parJour = useMemo(() => {
    const groupes: Record<string, RendezVous[]> = {};
    for (const rdv of rdvs) {
      (groupes[rdv.date] ??= []).push(rdv);
    }
    return Object.entries(groupes).sort(([a], [b]) =>
      onglet === "avenir" ? a.localeCompare(b) : b.localeCompare(a),
    );
  }, [rdvs, onglet]);

  function eleveDe(rdv: RendezVous) {
    return eleves.find((e) => e.id === rdv.eleveId);
  }

  async function handleValider(values: RdvFormValues) {
    if (rdvEnEdition) {
      await updateRendezVous({ ...rdvEnEdition, ...valeursVersInput(values) });
    } else {
      await createRendezVous(valeursVersInput(values));
    }
    await recharger();
  }

  async function handleSupprimer() {
    if (!rdvEnEdition) return;
    await deleteRendezVous(rdvEnEdition.id);
    await recharger();
  }

  return (
    <div className="p-5 max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800">Agenda / Rendez-vous</h2>
        <button
          type="button"
          onClick={() => {
            setRdvEnEdition(undefined);
            setFormulaireOuvert(true);
          }}
          className="px-3 py-1.5 rounded-md bg-slate-800 text-white text-sm hover:bg-slate-700"
        >
          + Nouveau rendez-vous
        </button>
      </div>

      <div className="flex rounded-md ring-1 ring-slate-200 overflow-hidden text-sm w-fit">
        <button
          type="button"
          onClick={() => setOnglet("avenir")}
          className={`px-3 py-1.5 ${onglet === "avenir" ? "bg-slate-800 text-white" : "bg-white text-slate-600 hover:bg-slate-100"}`}
        >
          À venir
        </button>
        <button
          type="button"
          onClick={() => setOnglet("passes")}
          className={`px-3 py-1.5 ${onglet === "passes" ? "bg-slate-800 text-white" : "bg-white text-slate-600 hover:bg-slate-100"}`}
        >
          Passés
        </button>
      </div>

      {parJour.length === 0 && <p className="text-sm text-slate-400 italic">Aucun rendez-vous.</p>}

      <div className="space-y-4">
        {parJour.map(([jour, rdvsDuJour]) => (
          <div key={jour}>
            <p className="text-sm font-semibold text-slate-600 capitalize mb-1.5">
              {format(new Date(`${jour}T00:00:00`), "EEEE d MMMM yyyy", { locale: fr })}
            </p>
            <div className="space-y-1.5">
              {rdvsDuJour.map((rdv) => (
                <RdvCard
                  key={rdv.id}
                  rdv={rdv}
                  eleve={eleveDe(rdv)}
                  onClick={() => {
                    setRdvEnEdition(rdv);
                    setFormulaireOuvert(true);
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {formulaireOuvert && (
        <RdvForm
          rdv={rdvEnEdition}
          eleves={eleves}
          onValider={handleValider}
          onFermer={() => setFormulaireOuvert(false)}
          onSupprimer={rdvEnEdition ? handleSupprimer : undefined}
        />
      )}
    </div>
  );
}
