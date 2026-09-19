import { useState } from "react";
import { CahierJournalDoubleNiveau } from "@/components/cahier-journal/CahierJournalDoubleNiveau";
import { TableauCursifProjection } from "@/components/projection/TableauCursifProjection";
import { ElevesPage } from "@/components/eleves/ElevesPage";
import { AgendaPage } from "@/components/agenda/AgendaPage";

type Module = "cahier" | "eleves" | "agenda";

const ONGLETS: { module: Module; label: string }[] = [
  { module: "cahier", label: "Cahier journal" },
  { module: "eleves", label: "Élèves" },
  { module: "agenda", label: "Agenda" },
];

export default function App() {
  const [module, setModule] = useState<Module>("cahier");
  const [modeClasseDate, setModeClasseDate] = useState<string | null>(null);

  if (modeClasseDate) {
    return (
      <TableauCursifProjection date={modeClasseDate} onFermer={() => setModeClasseDate(null)} />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="h-14 bg-slate-900 px-4 flex items-center gap-1">
        {ONGLETS.map(({ module: m, label }) => (
          <button
            key={m}
            type="button"
            onClick={() => setModule(m)}
            className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
              module === m
                ? "border-violet-400 text-white"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      {module === "cahier" && <CahierJournalDoubleNiveau onOuvrirModeClasse={setModeClasseDate} />}
      {module === "eleves" && <ElevesPage />}
      {module === "agenda" && <AgendaPage />}
    </div>
  );
}
