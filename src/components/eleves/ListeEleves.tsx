import type { Eleve, Niveau } from "@/types/models";

interface ListeElevesProps {
  eleves: Eleve[];
  eleveSelectionneId?: string;
  filtreNiveau: Niveau | "TOUS";
  onFiltreNiveauChange: (niveau: Niveau | "TOUS") => void;
  onSelectionner: (eleve: Eleve) => void;
  onNouveau: () => void;
}

const BADGE_NIVEAU: Record<Niveau, string> = {
  GS: "bg-gs-100 text-gs-600",
  CE2: "bg-ce2-100 text-ce2-600",
};

export function ListeEleves({
  eleves,
  eleveSelectionneId,
  filtreNiveau,
  onFiltreNiveauChange,
  onSelectionner,
  onNouveau,
}: ListeElevesProps) {
  const elevesFiltres = eleves.filter((e) => filtreNiveau === "TOUS" || e.niveau === filtreNiveau);

  return (
    <div className="w-72 shrink-0 border-r border-slate-200 bg-white flex flex-col">
      <div className="p-3 border-b border-slate-100 space-y-2">
        <button
          type="button"
          onClick={onNouveau}
          className="w-full px-3 py-1.5 text-sm rounded-md bg-slate-800 text-white hover:bg-slate-700"
        >
          + Nouvel élève
        </button>
        <div className="flex rounded-md ring-1 ring-slate-200 overflow-hidden text-xs">
          {(["TOUS", "GS", "CE2"] as const).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onFiltreNiveauChange(n)}
              className={`flex-1 py-1 ${
                filtreNiveau === n ? "bg-slate-800 text-white" : "bg-white text-slate-600 hover:bg-slate-100"
              }`}
            >
              {n === "TOUS" ? "Tous" : n}
            </button>
          ))}
        </div>
      </div>

      <ul className="flex-1 overflow-y-auto">
        {elevesFiltres.length === 0 && (
          <li className="p-3 text-sm text-slate-400 italic">Aucun élève</li>
        )}
        {elevesFiltres.map((eleve) => (
          <li key={eleve.id}>
            <button
              type="button"
              onClick={() => onSelectionner(eleve)}
              className={`w-full text-left px-3 py-2 flex items-center justify-between gap-2 hover:bg-slate-50 ${
                eleve.id === eleveSelectionneId ? "bg-slate-100" : ""
              }`}
            >
              <span className="text-sm text-slate-700">
                {eleve.prenom} {eleve.nom}
              </span>
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${BADGE_NIVEAU[eleve.niveau]}`}>
                {eleve.niveau}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
