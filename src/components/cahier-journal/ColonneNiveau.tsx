import type { CreneauAvecSeance, Niveau } from "@/types/models";
import { CreneauCard } from "./CreneauCard";

const THEME: Record<Niveau, { bg: string; text: string; ring: string; label: string }> = {
  GS: { bg: "bg-gs-50", text: "text-gs-900", ring: "ring-gs-400", label: "Grande Section" },
  CE2: { bg: "bg-ce2-50", text: "text-ce2-900", ring: "ring-ce2-400", label: "CE2" },
};

interface ColonneNiveauProps {
  niveau: Niveau;
  creneaux: CreneauAvecSeance[];
  effectif: number;
  onCreneauClick?: (creneau: CreneauAvecSeance) => void;
  onAjouterCreneau?: () => void;
}

export function ColonneNiveau({
  niveau,
  creneaux,
  effectif,
  onCreneauClick,
  onAjouterCreneau,
}: ColonneNiveauProps) {
  const theme = THEME[niveau];
  const dirige = creneaux.filter((c) => c.groupe === `${niveau}_DIRIGE`);
  const autonome = creneaux.filter((c) => c.groupe === `${niveau}_AUTONOME`);

  return (
    <div className={`flex-1 min-w-0 rounded-lg ${theme.bg} ring-1 ${theme.ring} p-3`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className={`font-bold ${theme.text}`}>
          {theme.label} <span className="font-normal text-sm text-slate-500">({effectif} élèves)</span>
        </h3>
        {onAjouterCreneau && (
          <button
            type="button"
            onClick={onAjouterCreneau}
            className="text-xs px-2 py-1 rounded bg-white/80 hover:bg-white text-slate-600 shadow-sm"
          >
            + Créneau
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-1">
            Travail dirigé
          </p>
          <div className="space-y-1.5">
            {dirige.length === 0 && <p className="text-xs text-slate-400 italic">—</p>}
            {dirige.map((c) => (
              <CreneauCard key={c.id} creneau={c} onClick={() => onCreneauClick?.(c)} />
            ))}
          </div>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-1">
            En autonomie
          </p>
          <div className="space-y-1.5">
            {autonome.length === 0 && <p className="text-xs text-slate-400 italic">—</p>}
            {autonome.map((c) => (
              <CreneauCard key={c.id} creneau={c} onClick={() => onCreneauClick?.(c)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
