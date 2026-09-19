import type { EtapeDeroulement } from "@/types/models";

const MODALITES: { value: NonNullable<EtapeDeroulement["modalite"]>; label: string }[] = [
  { value: "collectif", label: "Collectif" },
  { value: "individuel", label: "Individuel" },
  { value: "binome", label: "Binôme" },
  { value: "petit_groupe", label: "Petit groupe" },
];

interface DeroulementEditorProps {
  etapes: EtapeDeroulement[];
  onChange: (etapes: EtapeDeroulement[]) => void;
}

function renumeroter(etapes: EtapeDeroulement[]): EtapeDeroulement[] {
  return etapes.map((e, i) => ({ ...e, ordre: i + 1 }));
}

export function DeroulementEditor({ etapes, onChange }: DeroulementEditorProps) {
  function majEtape(index: number, patch: Partial<EtapeDeroulement>) {
    onChange(etapes.map((e, i) => (i === index ? { ...e, ...patch } : e)));
  }

  function ajouter() {
    onChange([
      ...etapes,
      {
        ordre: etapes.length + 1,
        titre: "",
        dureeMinutes: 10,
        consigne: "",
        rolePe: "",
        roleEleves: "",
        modalite: "collectif",
      },
    ]);
  }

  function supprimer(index: number) {
    onChange(renumeroter(etapes.filter((_, i) => i !== index)));
  }

  function deplacer(index: number, direction: -1 | 1) {
    const cible = index + direction;
    if (cible < 0 || cible >= etapes.length) return;
    const copie = [...etapes];
    [copie[index], copie[cible]] = [copie[cible], copie[index]];
    onChange(renumeroter(copie));
  }

  return (
    <div className="space-y-3">
      {etapes.map((etape, index) => (
        <div key={index} className="rounded-md border border-slate-200 p-3 space-y-2 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Étape {etape.ordre}</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => deplacer(index, -1)}
                disabled={index === 0}
                className="text-slate-400 hover:text-slate-700 disabled:opacity-30 px-1"
                aria-label="Monter"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => deplacer(index, 1)}
                disabled={index === etapes.length - 1}
                className="text-slate-400 hover:text-slate-700 disabled:opacity-30 px-1"
                aria-label="Descendre"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => supprimer(index)}
                className="text-slate-400 hover:text-red-500 px-1"
                aria-label="Supprimer cette étape"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <input
              type="text"
              placeholder="Titre de l'étape (ex : Découverte)"
              value={etape.titre}
              onChange={(e) => majEtape(index, { titre: e.target.value })}
              className="col-span-2 text-sm rounded border border-slate-200 px-2 py-1"
            />
            <input
              type="number"
              min={1}
              value={etape.dureeMinutes}
              onChange={(e) => majEtape(index, { dureeMinutes: Number(e.target.value) || 0 })}
              className="text-sm rounded border border-slate-200 px-2 py-1"
              aria-label="Durée en minutes"
            />
          </div>

          <textarea
            placeholder="Consigne donnée aux élèves"
            value={etape.consigne}
            onChange={(e) => majEtape(index, { consigne: e.target.value })}
            rows={2}
            className="w-full text-sm rounded border border-slate-200 px-2 py-1"
          />

          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Rôle de l'enseignant·e"
              value={etape.rolePe}
              onChange={(e) => majEtape(index, { rolePe: e.target.value })}
              className="text-sm rounded border border-slate-200 px-2 py-1"
            />
            <input
              type="text"
              placeholder="Rôle des élèves"
              value={etape.roleEleves}
              onChange={(e) => majEtape(index, { roleEleves: e.target.value })}
              className="text-sm rounded border border-slate-200 px-2 py-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Matériel"
              value={etape.materiel ?? ""}
              onChange={(e) => majEtape(index, { materiel: e.target.value })}
              className="text-sm rounded border border-slate-200 px-2 py-1"
            />
            <select
              value={etape.modalite ?? "collectif"}
              onChange={(e) => majEtape(index, { modalite: e.target.value as EtapeDeroulement["modalite"] })}
              className="text-sm rounded border border-slate-200 px-2 py-1"
            >
              {MODALITES.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={ajouter}
        className="text-xs px-2 py-1.5 rounded border border-dashed border-slate-300 text-slate-500 hover:bg-slate-50 w-full"
      >
        + Ajouter une étape
      </button>
    </div>
  );
}
