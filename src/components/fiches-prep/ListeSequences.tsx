import type { NiveauSequence, Sequence } from "@/types/models";

interface ListeSequencesProps {
  sequences: Sequence[];
  sequenceSelectionneeId?: string;
  filtreNiveau: NiveauSequence | "TOUS";
  onFiltreNiveauChange: (niveau: NiveauSequence | "TOUS") => void;
  onSelectionner: (sequence: Sequence) => void;
  onNouvelle: () => void;
}

const BADGE_NIVEAU: Record<NiveauSequence, string> = {
  GS: "bg-gs-100 text-gs-600",
  CE2: "bg-ce2-100 text-ce2-600",
  GS_CE2: "bg-violet-100 text-violet-600",
};

const BADGE_STATUT: Record<Sequence["statut"], string> = {
  planifiee: "bg-slate-100 text-slate-500",
  en_cours: "bg-amber-100 text-amber-700",
  terminee: "bg-emerald-100 text-emerald-700",
  archivee: "bg-slate-100 text-slate-400",
};

export function ListeSequences({
  sequences,
  sequenceSelectionneeId,
  filtreNiveau,
  onFiltreNiveauChange,
  onSelectionner,
  onNouvelle,
}: ListeSequencesProps) {
  const filtrees = sequences.filter((s) => filtreNiveau === "TOUS" || s.niveau === filtreNiveau);

  return (
    <div className="w-80 shrink-0 border-r border-slate-200 bg-white flex flex-col">
      <div className="p-3 border-b border-slate-100 space-y-2">
        <button
          type="button"
          onClick={onNouvelle}
          className="w-full px-3 py-1.5 text-sm rounded-md bg-slate-800 text-white hover:bg-slate-700"
        >
          + Nouvelle séquence
        </button>
        <div className="flex rounded-md ring-1 ring-slate-200 overflow-hidden text-xs">
          {(["TOUS", "GS", "CE2", "GS_CE2"] as const).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onFiltreNiveauChange(n)}
              className={`flex-1 py-1 ${
                filtreNiveau === n ? "bg-slate-800 text-white" : "bg-white text-slate-600 hover:bg-slate-100"
              }`}
            >
              {n === "TOUS" ? "Tous" : n === "GS_CE2" ? "GS+CE2" : n}
            </button>
          ))}
        </div>
      </div>

      <ul className="flex-1 overflow-y-auto">
        {filtrees.length === 0 && <li className="p-3 text-sm text-slate-400 italic">Aucune séquence</li>}
        {filtrees.map((sequence) => (
          <li key={sequence.id}>
            <button
              type="button"
              onClick={() => onSelectionner(sequence)}
              className={`w-full text-left px-3 py-2 hover:bg-slate-50 ${
                sequence.id === sequenceSelectionneeId ? "bg-slate-100" : ""
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-slate-700 font-medium truncate">{sequence.titre}</span>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0 ${BADGE_NIVEAU[sequence.niveau]}`}>
                  {sequence.niveau === "GS_CE2" ? "GS+CE2" : sequence.niveau}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-slate-400">
                  {sequence.discipline} — {sequence.periode}
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${BADGE_STATUT[sequence.statut]}`}>
                  {sequence.statut.replace("_", " ")}
                </span>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
