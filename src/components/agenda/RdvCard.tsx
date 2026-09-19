import type { Eleve, RendezVous, TypeRdv } from "@/types/models";

const LABEL_TYPE: Record<TypeRdv, string> = {
  parents: "Parents",
  rased: "RASED",
  equipe_educative: "Équipe éducative",
  reunion_cycle: "Réunion de cycle",
  autre: "Autre",
};

const STYLE_TYPE: Record<TypeRdv, string> = {
  parents: "bg-ce2-100 text-ce2-600",
  rased: "bg-violet-100 text-violet-600",
  equipe_educative: "bg-emerald-100 text-emerald-600",
  reunion_cycle: "bg-amber-100 text-amber-700",
  autre: "bg-slate-100 text-slate-600",
};

interface RdvCardProps {
  rdv: RendezVous;
  eleve?: Eleve;
  onClick: () => void;
}

export function RdvCard({ rdv, eleve, onClick }: RdvCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left rounded-md bg-white ring-1 ring-slate-200 px-3 py-2 hover:ring-slate-400 transition-colors"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-slate-700 tabular-nums">
          {rdv.heureDebut}–{rdv.heureFin}
        </span>
        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${STYLE_TYPE[rdv.typeRdv]}`}>
          {LABEL_TYPE[rdv.typeRdv]}
        </span>
      </div>
      <p className="text-slate-800 font-medium">{rdv.titre}</p>
      {eleve && (
        <p className="text-xs text-slate-500">
          {eleve.prenom} {eleve.nom} ({eleve.niveau})
        </p>
      )}
      {rdv.lieu && <p className="text-xs text-slate-400">{rdv.lieu}</p>}
    </button>
  );
}
