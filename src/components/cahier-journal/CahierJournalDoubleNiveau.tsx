import { useEffect, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useCahierJournal } from "@/stores/useCahierJournal";
import { useEleves } from "@/stores/useEleves";
import { VueJournee } from "./VueJournee";
import { VueSemaine } from "./VueSemaine";
import { PlanificateurNotions } from "./PlanificateurNotions";

type ModeVue = "jour" | "semaine";

interface CahierJournalDoubleNiveauProps {
  onOuvrirModeClasse: (date: string) => void;
}

export function CahierJournalDoubleNiveau({ onOuvrirModeClasse }: CahierJournalDoubleNiveauProps) {
  const [modeVue, setModeVue] = useState<ModeVue>("jour");

  const semaineDebut = useCahierJournal((s) => s.semaineDebut);
  const joursSemaine = useCahierJournal((s) => s.joursSemaine);
  const jourSelectionne = useCahierJournal((s) => s.jourSelectionne);
  const chargement = useCahierJournal((s) => s.chargement);
  const selectionnerJour = useCahierJournal((s) => s.selectionnerJour);
  const chargerSemaine = useCahierJournal((s) => s.chargerSemaine);
  const allerSemaineSuivante = useCahierJournal((s) => s.allerSemaineSuivante);
  const allerSemainePrecedente = useCahierJournal((s) => s.allerSemainePrecedente);
  const allerAujourdhui = useCahierJournal((s) => s.allerAujourdhui);

  const chargerEleves = useEleves((s) => s.charger);

  useEffect(() => {
    void chargerSemaine();
    void chargerEleves();
    // chargée une seule fois au montage puis à chaque changement de semaine (géré par les actions du store)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 py-3 flex flex-wrap items-center gap-3">
        <h1 className="text-lg font-bold text-slate-800">Cahier journal</h1>

        <div className="flex items-center gap-1 ml-2">
          <button
            type="button"
            onClick={allerSemainePrecedente}
            className="px-2 py-1 rounded hover:bg-slate-100 text-slate-600"
            aria-label="Semaine précédente"
          >
            ←
          </button>
          <span className="text-sm text-slate-600 min-w-[11rem] text-center capitalize">
            Semaine du {format(new Date(`${semaineDebut}T00:00:00`), "d MMMM yyyy", { locale: fr })}
          </span>
          <button
            type="button"
            onClick={allerSemaineSuivante}
            className="px-2 py-1 rounded hover:bg-slate-100 text-slate-600"
            aria-label="Semaine suivante"
          >
            →
          </button>
          <button
            type="button"
            onClick={allerAujourdhui}
            className="ml-1 text-xs px-2 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-100"
          >
            Aujourd'hui
          </button>
        </div>

        <div className="flex items-center gap-1 ml-auto">
          <div className="flex rounded-md ring-1 ring-slate-200 overflow-hidden text-sm">
            <button
              type="button"
              onClick={() => setModeVue("jour")}
              className={`px-3 py-1.5 ${modeVue === "jour" ? "bg-slate-800 text-white" : "bg-white text-slate-600 hover:bg-slate-100"}`}
            >
              Jour
            </button>
            <button
              type="button"
              onClick={() => setModeVue("semaine")}
              className={`px-3 py-1.5 ${modeVue === "semaine" ? "bg-slate-800 text-white" : "bg-white text-slate-600 hover:bg-slate-100"}`}
            >
              Semaine
            </button>
          </div>

          <button
            type="button"
            onClick={() => onOuvrirModeClasse(jourSelectionne)}
            className="ml-2 px-3 py-1.5 rounded-md bg-violet-600 text-white text-sm font-medium hover:bg-violet-700"
          >
            🖥️ Mode Classe
          </button>
        </div>
      </header>

      <main className="p-4 max-w-7xl mx-auto space-y-4">
        <PlanificateurNotions semaineDebut={semaineDebut} />

        {chargement && <p className="text-sm text-slate-400">Chargement…</p>}

        {modeVue === "jour" ? (
          <>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {joursSemaine.map((jour) => (
                <button
                  key={jour}
                  type="button"
                  onClick={() => selectionnerJour(jour)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-sm capitalize ${
                    jour === jourSelectionne
                      ? "bg-slate-800 text-white"
                      : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {format(new Date(`${jour}T00:00:00`), "EEEE d", { locale: fr })}
                </button>
              ))}
            </div>
            <VueJournee date={jourSelectionne} />
          </>
        ) : (
          <VueSemaine joursSemaine={joursSemaine} onSelectionnerJour={(jour) => { selectionnerJour(jour); setModeVue("jour"); }} />
        )}
      </main>
    </div>
  );
}
