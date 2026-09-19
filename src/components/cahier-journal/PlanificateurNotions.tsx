import { useEffect, useState } from "react";
import {
  ajouterNotionSemaine,
  listNotionsSemaine,
  supprimerNotionSemaine,
} from "@/db/repositories/notionsSemaine";
import { DISCIPLINES, type Discipline, type Niveau, type NotionSemaine } from "@/types/models";

interface PlanificateurNotionsProps {
  semaineDebut: string;
}

const NIVEAUX: { niveau: Niveau; label: string; classe: string }[] = [
  { niveau: "GS", label: "Grande Section", classe: "text-gs-600" },
  { niveau: "CE2", label: "CE2", classe: "text-ce2-600" },
];

export function PlanificateurNotions({ semaineDebut }: PlanificateurNotionsProps) {
  const [notions, setNotions] = useState<NotionSemaine[]>([]);
  const [brouillon, setBrouillon] = useState<Record<Niveau, { discipline: Discipline; texte: string }>>({
    GS: { discipline: "Français", texte: "" },
    CE2: { discipline: "Français", texte: "" },
  });

  useEffect(() => {
    void listNotionsSemaine(semaineDebut).then(setNotions);
  }, [semaineDebut]);

  async function ajouter(niveau: Niveau) {
    const { discipline, texte } = brouillon[niveau];
    if (!texte.trim()) return;
    await ajouterNotionSemaine({
      semaineDebut,
      niveau,
      discipline,
      objectifPrioritaire: texte.trim(),
      ordre: notions.filter((n) => n.niveau === niveau).length,
    });
    setBrouillon((b) => ({ ...b, [niveau]: { ...b[niveau], texte: "" } }));
    setNotions(await listNotionsSemaine(semaineDebut));
  }

  async function supprimer(id: string) {
    await supprimerNotionSemaine(id);
    setNotions(await listNotionsSemaine(semaineDebut));
  }

  return (
    <div className="rounded-lg bg-white ring-1 ring-slate-200 p-3">
      <h3 className="font-bold text-slate-800 mb-2">Notions prioritaires de la semaine</h3>
      <div className="grid grid-cols-2 gap-4">
        {NIVEAUX.map(({ niveau, label, classe }) => (
          <div key={niveau}>
            <p className={`text-sm font-semibold mb-1 ${classe}`}>{label}</p>
            <ul className="space-y-1 mb-2">
              {notions
                .filter((n) => n.niveau === niveau)
                .map((n) => (
                  <li key={n.id} className="flex items-center justify-between gap-2 text-sm bg-slate-50 rounded px-2 py-1">
                    <span>
                      <span className="text-slate-400">{n.discipline} — </span>
                      {n.objectifPrioritaire}
                    </span>
                    <button
                      type="button"
                      onClick={() => void supprimer(n.id)}
                      className="text-slate-400 hover:text-red-500"
                      aria-label="Supprimer"
                    >
                      ✕
                    </button>
                  </li>
                ))}
            </ul>
            <div className="flex gap-1">
              <select
                value={brouillon[niveau].discipline}
                onChange={(e) =>
                  setBrouillon((b) => ({
                    ...b,
                    [niveau]: { ...b[niveau], discipline: e.target.value as Discipline },
                  }))
                }
                className="text-xs rounded border border-slate-200 px-1"
              >
                {DISCIPLINES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={brouillon[niveau].texte}
                onChange={(e) =>
                  setBrouillon((b) => ({ ...b, [niveau]: { ...b[niveau], texte: e.target.value } }))
                }
                onKeyDown={(e) => e.key === "Enter" && void ajouter(niveau)}
                placeholder="Objectif de la semaine..."
                className="flex-1 min-w-0 text-xs rounded border border-slate-200 px-2 py-1"
              />
              <button
                type="button"
                onClick={() => void ajouter(niveau)}
                className="text-xs px-2 rounded bg-slate-800 text-white hover:bg-slate-700"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
