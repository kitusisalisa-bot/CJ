import type { Responsable } from "@/types/models";

const ROLES: Responsable["role"][] = ["Mère", "Père", "Tuteur/Tutrice", "Autre"];

interface ResponsablesEditorProps {
  responsables: Responsable[];
  onChange: (responsables: Responsable[]) => void;
}

export function ResponsablesEditor({ responsables, onChange }: ResponsablesEditorProps) {
  function majResponsable(index: number, patch: Partial<Responsable>) {
    onChange(responsables.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  function ajouter() {
    onChange([...responsables, { role: "Mère", nom: "" }]);
  }

  function supprimer(index: number) {
    onChange(responsables.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-2">
      {responsables.map((r, index) => (
        <div key={index} className="rounded-md border border-slate-200 p-2 space-y-1.5">
          <div className="flex gap-2">
            <select
              value={r.role}
              onChange={(e) => majResponsable(index, { role: e.target.value as Responsable["role"] })}
              className="text-sm rounded border border-slate-200 px-2 py-1"
            >
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Nom"
              value={r.nom}
              onChange={(e) => majResponsable(index, { nom: e.target.value })}
              className="flex-1 min-w-0 text-sm rounded border border-slate-200 px-2 py-1"
              required
            />
            <button
              type="button"
              onClick={() => supprimer(index)}
              className="text-slate-400 hover:text-red-500 px-1"
              aria-label="Supprimer ce responsable"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <input
              type="tel"
              placeholder="Téléphone"
              value={r.telephone ?? ""}
              onChange={(e) => majResponsable(index, { telephone: e.target.value })}
              className="text-sm rounded border border-slate-200 px-2 py-1"
            />
            <input
              type="email"
              placeholder="Email"
              value={r.email ?? ""}
              onChange={(e) => majResponsable(index, { email: e.target.value })}
              className="text-sm rounded border border-slate-200 px-2 py-1"
            />
          </div>
          <input
            type="text"
            placeholder="Adresse"
            value={r.adresse ?? ""}
            onChange={(e) => majResponsable(index, { adresse: e.target.value })}
            className="w-full text-sm rounded border border-slate-200 px-2 py-1"
          />
        </div>
      ))}
      <button
        type="button"
        onClick={ajouter}
        className="text-xs px-2 py-1 rounded border border-dashed border-slate-300 text-slate-500 hover:bg-slate-50"
      >
        + Ajouter un responsable
      </button>
    </div>
  );
}
