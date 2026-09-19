import { useState } from "react";
import { choisirEtLireSauvegarde, exporterVersFichier, restaurerSauvegarde } from "@/lib/export-import";

type Statut = { type: "idle" } | { type: "succes"; message: string } | { type: "erreur"; message: string };

export function ReglagesPage() {
  const [statut, setStatut] = useState<Statut>({ type: "idle" });
  const [enCours, setEnCours] = useState(false);

  async function handleExporter() {
    setEnCours(true);
    setStatut({ type: "idle" });
    try {
      const chemin = await exporterVersFichier();
      if (chemin) {
        setStatut({ type: "succes", message: `Sauvegarde enregistrée : ${chemin}` });
      }
    } catch (err) {
      setStatut({ type: "erreur", message: `Échec de l'export : ${(err as Error).message}` });
    } finally {
      setEnCours(false);
    }
  }

  async function handleImporter() {
    setEnCours(true);
    setStatut({ type: "idle" });
    try {
      const sauvegarde = await choisirEtLireSauvegarde();
      if (!sauvegarde) {
        setEnCours(false);
        return;
      }

      const resume =
        `${sauvegarde.eleves.length} élève(s), ${sauvegarde.sequences.length} séquence(s), ` +
        `${sauvegarde.seances.length} séance(s), ${sauvegarde.creneaux.length} créneau(x), ` +
        `${sauvegarde.rendezVous.length} rendez-vous`;

      const confirme = window.confirm(
        `Cette sauvegarde contient : ${resume}.\n\n` +
          `L'importer remplacera INTÉGRALEMENT les données actuelles de l'application ` +
          `(rien n'est envoyé sur un serveur, tout reste local). Cette action est irréversible.\n\n` +
          `Continuer ?`,
      );
      if (!confirme) {
        setEnCours(false);
        return;
      }

      await restaurerSauvegarde(sauvegarde);
      setStatut({ type: "succes", message: "Sauvegarde restaurée. Rechargement de l'application…" });
      setTimeout(() => window.location.reload(), 1200);
    } catch (err) {
      setStatut({ type: "erreur", message: `Échec de l'import : ${(err as Error).message}` });
      setEnCours(false);
    }
  }

  return (
    <div className="p-5 max-w-2xl mx-auto space-y-5">
      <h2 className="text-lg font-bold text-slate-800">Réglages &amp; sauvegarde</h2>

      <section className="rounded-lg bg-white ring-1 ring-slate-200 p-4 space-y-3">
        <h3 className="font-semibold text-slate-800">Sauvegarde manuelle</h3>
        <p className="text-sm text-slate-500">
          Toutes les données (élèves, séquences, séances, cahier journal, rituels, devoirs,
          rendez-vous) restent uniquement sur cet ordinateur. Utilisez l'export pour créer une
          copie de sauvegarde — par exemple sur une clé USB — et l'import pour la restaurer sur
          ce poste ou sur un autre.
        </p>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void handleExporter()}
            disabled={enCours}
            className="px-3 py-1.5 text-sm rounded-md bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-50"
          >
            ⭳ Exporter une sauvegarde (.json)
          </button>
          <button
            type="button"
            onClick={() => void handleImporter()}
            disabled={enCours}
            className="px-3 py-1.5 text-sm rounded-md ring-1 ring-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            ⭱ Importer une sauvegarde (.json)
          </button>
        </div>

        {statut.type === "succes" && (
          <p className="text-sm text-emerald-600 bg-emerald-50 rounded px-2 py-1">{statut.message}</p>
        )}
        {statut.type === "erreur" && (
          <p className="text-sm text-red-600 bg-red-50 rounded px-2 py-1">{statut.message}</p>
        )}
      </section>

      <section className="rounded-lg bg-white ring-1 ring-slate-200 p-4 space-y-1">
        <h3 className="font-semibold text-slate-800">Confidentialité</h3>
        <p className="text-sm text-slate-500">
          Cette application ne se connecte à aucun serveur : aucune donnée élève n'est jamais
          transmise. Le fichier de sauvegarde exporté contient des données personnelles
          (identité, PAI/PPRE/PAP, allergies, coordonnées des responsables) — conservez-le dans
          un endroit sûr et évitez de le transmettre par un canal non sécurisé.
        </p>
      </section>
    </div>
  );
}
