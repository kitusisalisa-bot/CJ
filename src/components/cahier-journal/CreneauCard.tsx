import type { CreneauAvecSeance } from "@/types/models";

const STYLES_PAR_TYPE: Record<CreneauAvecSeance["typeCreneau"], string> = {
  rituel: "border-l-4 border-violet-400 bg-violet-50",
  seance: "border-l-4 border-slate-300 bg-white",
  recreation: "border-l-4 border-emerald-400 bg-emerald-50",
  cantine: "border-l-4 border-amber-400 bg-amber-50",
  accueil: "border-l-4 border-sky-400 bg-sky-50",
  autre: "border-l-4 border-slate-300 bg-slate-50",
};

const LABEL_DIRIGE_AUTONOME: Record<string, string> = {
  GS_DIRIGE: "Guidé",
  GS_AUTONOME: "Autonomie",
  CE2_DIRIGE: "Guidé",
  CE2_AUTONOME: "Autonomie",
  COMMUN: "Groupe classe",
};

interface CreneauCardProps {
  creneau: CreneauAvecSeance;
  onClick?: () => void;
}

export function CreneauCard({ creneau, onClick }: CreneauCardProps) {
  const titre = creneau.seance?.titre ?? creneau.titreLibre ?? "Sans titre";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-md px-3 py-2 shadow-sm hover:shadow transition-shadow ${STYLES_PAR_TYPE[creneau.typeCreneau]}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-slate-500 tabular-nums">
          {creneau.heureDebut}–{creneau.heureFin}
        </span>
        <span className="text-[10px] uppercase tracking-wide text-slate-400">
          {LABEL_DIRIGE_AUTONOME[creneau.groupe]}
        </span>
      </div>
      <div className="mt-0.5 font-medium text-slate-800">{titre}</div>
      {creneau.discipline && (
        <div className="text-xs text-slate-500">{creneau.discipline}</div>
      )}
      {creneau.seance?.differenciation && (
        <div className="mt-1 text-xs italic text-slate-400 line-clamp-2">
          Différenciation : {creneau.seance.differenciation}
        </div>
      )}
    </button>
  );
}
