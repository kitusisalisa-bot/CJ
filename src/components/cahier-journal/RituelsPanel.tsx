import { useEffect, useState } from "react";
import { listRituelsDuJour, upsertRituel } from "@/db/repositories/rituels";
import type { Rituel, TypeRituel } from "@/types/models";

const RITUELS_CONFIG: { type: TypeRituel; label: string; placeholder: string }[] = [
  { type: "date", label: "📅 La date", placeholder: "Nous sommes le..." },
  { type: "meteo", label: "🌤️ La météo", placeholder: "Aujourd'hui il fait..." },
  { type: "chaque_jour_compte", label: "🔢 Chaque jour compte", placeholder: "Jour n°..." },
  { type: "phonologie", label: "🔤 Phonologie", placeholder: "Son du jour / syllabe..." },
  { type: "vocabulaire", label: "📖 Vocabulaire", placeholder: "Mot du jour..." },
];

interface RituelsPanelProps {
  date: string;
}

export function RituelsPanel({ date }: RituelsPanelProps) {
  const [rituels, setRituels] = useState<Rituel[]>([]);

  useEffect(() => {
    void listRituelsDuJour(date).then(setRituels);
  }, [date]);

  async function handleChange(type: TypeRituel, texte: string) {
    const existant = rituels.find((r) => r.typeRituel === type);
    await upsertRituel({
      id: existant?.id,
      date,
      niveau: "GS_CE2",
      typeRituel: type,
      contenu: { texte },
      fait: existant?.fait ?? false,
    });
    setRituels(await listRituelsDuJour(date));
  }

  async function handleToggleFait(type: TypeRituel) {
    const existant = rituels.find((r) => r.typeRituel === type);
    await upsertRituel({
      id: existant?.id,
      date,
      niveau: "GS_CE2",
      typeRituel: type,
      contenu: existant?.contenu ?? {},
      fait: !(existant?.fait ?? false),
    });
    setRituels(await listRituelsDuJour(date));
  }

  return (
    <div className="rounded-lg bg-white ring-1 ring-slate-200 p-3">
      <h3 className="font-bold text-slate-800 mb-2">Rituels du jour</h3>
      <div className="space-y-2">
        {RITUELS_CONFIG.map(({ type, label, placeholder }) => {
          const rituel = rituels.find((r) => r.typeRituel === type);
          const texte = (rituel?.contenu.texte as string | undefined) ?? "";
          return (
            <div key={type} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={rituel?.fait ?? false}
                onChange={() => void handleToggleFait(type)}
                className="h-4 w-4 accent-violet-500"
                aria-label={`${label} fait`}
              />
              <label className="w-40 shrink-0 text-sm text-slate-600">{label}</label>
              <input
                type="text"
                defaultValue={texte}
                placeholder={placeholder}
                onBlur={(e) => void handleChange(type, e.target.value)}
                className="flex-1 min-w-0 text-sm rounded border border-slate-200 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-violet-300"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
