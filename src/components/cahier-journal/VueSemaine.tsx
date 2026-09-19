import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useCahierJournal, creneauxParGroupe } from "@/stores/useCahierJournal";

interface VueSemaineProps {
  joursSemaine: string[];
  onSelectionnerJour: (date: string) => void;
}

export function VueSemaine({ joursSemaine, onSelectionnerJour }: VueSemaineProps) {
  const creneauxParJour = useCahierJournal((s) => s.creneauxParJour);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2">
      {joursSemaine.map((jour) => {
        const creneaux = creneauxParJour[jour] ?? [];
        const gs = creneauxParGroupe(creneaux, ["GS_DIRIGE", "GS_AUTONOME"]);
        const ce2 = creneauxParGroupe(creneaux, ["CE2_DIRIGE", "CE2_AUTONOME"]);
        const communs = creneauxParGroupe(creneaux, ["COMMUN"]);

        return (
          <button
            key={jour}
            type="button"
            onClick={() => onSelectionnerJour(jour)}
            className="text-left rounded-lg bg-white ring-1 ring-slate-200 p-2.5 hover:ring-slate-400 transition-colors"
          >
            <p className="text-sm font-semibold text-slate-700 capitalize mb-1.5">
              {format(new Date(`${jour}T00:00:00`), "EEEE d MMM", { locale: fr })}
            </p>
            <ul className="space-y-1">
              {communs.map((c) => (
                <li key={c.id} className="text-xs text-slate-600 truncate">
                  <span className="text-slate-400">{c.heureDebut}</span> {c.seance?.titre ?? c.titreLibre}
                </li>
              ))}
            </ul>
            <div className="grid grid-cols-2 gap-1.5 mt-1.5">
              <div>
                <p className="text-[10px] font-semibold text-gs-600 uppercase">GS</p>
                <ul className="space-y-0.5">
                  {gs.slice(0, 4).map((c) => (
                    <li key={c.id} className="text-[11px] text-slate-600 truncate">
                      {c.heureDebut} {c.seance?.titre ?? c.titreLibre}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-ce2-600 uppercase">CE2</p>
                <ul className="space-y-0.5">
                  {ce2.slice(0, 4).map((c) => (
                    <li key={c.id} className="text-[11px] text-slate-600 truncate">
                      {c.heureDebut} {c.seance?.titre ?? c.titreLibre}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
