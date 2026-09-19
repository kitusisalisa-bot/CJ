import { useEffect, useState } from "react";
import { useEleves } from "@/stores/useEleves";
import { ListeEleves } from "./ListeEleves";
import { EleveForm, type EleveFormValues } from "./EleveForm";
import { listRendezVousDeLEleve } from "@/db/repositories/rendezVous";
import type { Eleve, Niveau, RendezVous } from "@/types/models";

type Mode = { type: "vide" } | { type: "nouveau" } | { type: "edition"; eleve: Eleve };

function valeursVersInputEleve(values: EleveFormValues): Omit<Eleve, "id" | "createdAt" | "updatedAt"> {
  return {
    prenom: values.prenom.trim(),
    nom: values.nom.trim(),
    niveau: values.niveau,
    dateNaissance: values.dateNaissance || undefined,
    dateEntreeClasse: values.dateEntreeClasse || undefined,
    responsables: values.responsables.filter((r) => r.nom.trim() !== ""),
    aPai: values.aPai,
    paiDetails: values.aPai ? values.paiDetails || undefined : undefined,
    aPpre: values.aPpre,
    ppreDetails: values.aPpre ? values.ppreDetails || undefined : undefined,
    aPap: values.aPap,
    papDetails: values.aPap ? values.papDetails || undefined : undefined,
    allergies: values.allergies || undefined,
    autorisations: values.autorisations,
    notesConfidentielles: values.notesConfidentielles || undefined,
  };
}

export function ElevesPage() {
  const eleves = useEleves((s) => s.eleves);
  const charger = useEleves((s) => s.charger);
  const ajouterEleve = useEleves((s) => s.ajouterEleve);
  const modifierEleve = useEleves((s) => s.modifierEleve);
  const supprimerEleve = useEleves((s) => s.supprimerEleve);

  const [filtreNiveau, setFiltreNiveau] = useState<Niveau | "TOUS">("TOUS");
  const [mode, setMode] = useState<Mode>({ type: "vide" });
  const [rdvEleve, setRdvEleve] = useState<RendezVous[]>([]);

  useEffect(() => {
    void charger();
  }, [charger]);

  useEffect(() => {
    if (mode.type === "edition") {
      void listRendezVousDeLEleve(mode.eleve.id).then(setRdvEleve);
    } else {
      setRdvEleve([]);
    }
  }, [mode]);

  async function handleValider(values: EleveFormValues) {
    if (mode.type === "edition") {
      await modifierEleve({ ...mode.eleve, ...valeursVersInputEleve(values) });
      setMode({ type: "vide" });
    } else {
      const eleve = await ajouterEleve(valeursVersInputEleve(values));
      setMode({ type: "edition", eleve });
    }
  }

  async function handleSupprimer() {
    if (mode.type !== "edition") return;
    if (!window.confirm(`Supprimer définitivement la fiche de ${mode.eleve.prenom} ${mode.eleve.nom} ?`)) {
      return;
    }
    await supprimerEleve(mode.eleve.id);
    setMode({ type: "vide" });
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <ListeEleves
        eleves={eleves}
        eleveSelectionneId={mode.type === "edition" ? mode.eleve.id : undefined}
        filtreNiveau={filtreNiveau}
        onFiltreNiveauChange={setFiltreNiveau}
        onSelectionner={(eleve) => setMode({ type: "edition", eleve })}
        onNouveau={() => setMode({ type: "nouveau" })}
      />

      <div className="flex-1 overflow-y-auto p-5">
        {mode.type === "vide" && (
          <p className="text-sm text-slate-400 italic">
            Sélectionnez un élève dans la liste, ou créez-en un nouveau.
          </p>
        )}

        {mode.type === "nouveau" && (
          <>
            <h2 className="text-lg font-bold text-slate-800 mb-4">Nouvel élève</h2>
            <EleveForm onValider={handleValider} onAnnuler={() => setMode({ type: "vide" })} />
          </>
        )}

        {mode.type === "edition" && (
          <>
            <h2 className="text-lg font-bold text-slate-800 mb-4">
              {mode.eleve.prenom} {mode.eleve.nom}
            </h2>
            <EleveForm
              key={mode.eleve.id}
              eleve={mode.eleve}
              onValider={handleValider}
              onAnnuler={() => setMode({ type: "vide" })}
              onSupprimer={handleSupprimer}
            />

            {rdvEleve.length > 0 && (
              <div className="mt-6 max-w-2xl">
                <h3 className="font-bold text-slate-800 mb-2">Rendez-vous liés</h3>
                <ul className="space-y-1">
                  {rdvEleve.map((r) => (
                    <li key={r.id} className="text-sm text-slate-600 bg-slate-50 rounded px-2 py-1">
                      {r.date} — {r.heureDebut} — {r.titre}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
