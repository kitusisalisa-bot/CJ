import { useState } from "react";

interface ListeChipsProps {
  valeurs: string[];
  onChange: (valeurs: string[]) => void;
  placeholder?: string;
}

/** Éditeur de liste de textes courts (compétences visées, etc.), sous forme de puces amovibles. */
export function ListeChips({ valeurs, onChange, placeholder }: ListeChipsProps) {
  const [brouillon, setBrouillon] = useState("");

  function ajouter() {
    const texte = brouillon.trim();
    if (!texte) return;
    onChange([...valeurs, texte]);
    setBrouillon("");
  }

  function supprimer(index: number) {
    onChange(valeurs.filter((_, i) => i !== index));
  }

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-1.5">
        {valeurs.map((v, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-xs rounded-full px-2.5 py-1"
          >
            {v}
            <button
              type="button"
              onClick={() => supprimer(i)}
              className="text-slate-400 hover:text-red-500"
              aria-label={`Retirer "${v}"`}
            >
              ✕
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-1.5">
        <input
          type="text"
          value={brouillon}
          onChange={(e) => setBrouillon(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              ajouter();
            }
          }}
          placeholder={placeholder}
          className="flex-1 min-w-0 text-sm rounded border border-slate-200 px-2 py-1"
        />
        <button
          type="button"
          onClick={ajouter}
          className="text-xs px-2 py-1 rounded bg-slate-800 text-white hover:bg-slate-700"
        >
          Ajouter
        </button>
      </div>
    </div>
  );
}
