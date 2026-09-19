import type { Seance } from "@/types/models";

const BADGE_STATUT: Record<Seance["statut"], string> = {
  a_faire: "bg-slate-100 text-slate-500",
  faite: "bg-emerald-100 text-emerald-700",
  reportee: "bg-amber-100 text-amber-700",
  annulee: "bg-red-100 text-red-600",
};

const LABEL_STATUT: Record<Seance["statut"], string> = {
  a_faire: "À faire",
  faite: "Faite",
  reportee: "Reportée",
  annulee: "Annulée",
};

interface ListeSeancesProps {
  seances: Seance[];
  onSelectionner: (seance: Seance) => void;
  onNouvelle: () => void;
}

export function ListeSeances({ seances, onSelectionner, onNouvelle }: ListeSeancesProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-slate-800">Séances ({seances.length})</h3>
        <button
          type="button"
          onClick={onNouvelle}
          className="text-xs px-2 py-1 rounded bg-slate-800 text-white hover:bg-slate-700"
        >
          + Nouvelle séance
        </button>
      </div>
      {seances.length === 0 && <p className="text-sm text-slate-400 italic">Aucune séance pour l'instant.</p>}
      <ul className="space-y-1.5">
        {seances.map((seance) => (
          <li key={seance.id}>
            <button
              type="button"
              onClick={() => onSelectionner(seance)}
              className="w-full text-left rounded-md ring-1 ring-slate-200 px-3 py-2 hover:ring-slate-400 transition-colors flex items-center justify-between gap-2"
            >
              <span className="text-sm text-slate-700">
                <span className="text-slate-400">#{seance.numeroOrdre}</span> {seance.titre}
                {seance.datePrevue && <span className="text-xs text-slate-400"> — {seance.datePrevue}</span>}
              </span>
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0 ${BADGE_STATUT[seance.statut]}`}>
                {LABEL_STATUT[seance.statut]}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
