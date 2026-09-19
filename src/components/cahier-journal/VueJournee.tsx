import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ColonneNiveau } from "./ColonneNiveau";
import { RituelsPanel } from "./RituelsPanel";
import { CreneauCard } from "./CreneauCard";
import { CreneauForm } from "./CreneauForm";
import { useCahierJournal, creneauxParGroupe } from "@/stores/useCahierJournal";
import { useEleves, elevesGS, elevesCE2 } from "@/stores/useEleves";
import type { CreneauAvecSeance, GroupeCreneau } from "@/types/models";

interface VueJourneeProps {
  date: string;
}

export function VueJournee({ date }: VueJourneeProps) {
  const creneauxParJour = useCahierJournal((s) => s.creneauxParJour);
  const ajouterCreneau = useCahierJournal((s) => s.ajouterCreneau);
  const eleves = useEleves((s) => s.eleves);
  const [formulaireGroupe, setFormulaireGroupe] = useState<GroupeCreneau | null>(null);

  const creneauxJour = creneauxParJour[date] ?? [];
  const communs = creneauxParGroupe(creneauxJour, ["COMMUN"]);
  const gs = creneauxParGroupe(creneauxJour, ["GS_DIRIGE", "GS_AUTONOME"]);
  const ce2 = creneauxParGroupe(creneauxJour, ["CE2_DIRIGE", "CE2_AUTONOME"]);

  function ouvrirFormulaire(groupe: GroupeCreneau) {
    setFormulaireGroupe(groupe);
  }

  function handleCreneauClick(_c: CreneauAvecSeance) {
    // Emplacement prévu pour ouvrir le détail / l'édition de la fiche de séance liée.
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-500 capitalize">
        {format(new Date(`${date}T00:00:00`), "EEEE d MMMM yyyy", { locale: fr })}
      </p>

      {communs.length > 0 && (
        <div className="rounded-lg bg-slate-100 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-1.5">
            Groupe classe entier
          </p>
          <div className="grid grid-cols-3 gap-2">
            {communs.map((c) => (
              <CreneauCard key={c.id} creneau={c} onClick={() => handleCreneauClick(c)} />
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-3">
        <ColonneNiveau
          niveau="GS"
          creneaux={gs}
          effectif={elevesGS(eleves).length}
          onCreneauClick={handleCreneauClick}
          onAjouterCreneau={() => ouvrirFormulaire("GS_DIRIGE")}
        />
        <ColonneNiveau
          niveau="CE2"
          creneaux={ce2}
          effectif={elevesCE2(eleves).length}
          onCreneauClick={handleCreneauClick}
          onAjouterCreneau={() => ouvrirFormulaire("CE2_DIRIGE")}
        />
      </div>

      <RituelsPanel date={date} />

      {formulaireGroupe && (
        <CreneauForm
          date={date}
          groupeParDefaut={formulaireGroupe}
          onValider={ajouterCreneau}
          onFermer={() => setFormulaireGroupe(null)}
        />
      )}
    </div>
  );
}
