import { save, open } from "@tauri-apps/plugin-dialog";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { getDb, nowIso } from "@/db/client";
import { eleveToRow } from "@/db/mappers";
import { listEleves } from "@/db/repositories/eleves";
import { listAllSequences } from "@/db/repositories/sequences";
import { listAllSeances } from "@/db/repositories/seances";
import { listAllCreneaux } from "@/db/repositories/creneaux";
import { listAllRituels } from "@/db/repositories/rituels";
import { listAllNotionsSemaine } from "@/db/repositories/notionsSemaine";
import { listAllDevoirs } from "@/db/repositories/devoirs";
import { listAllRendezVous } from "@/db/repositories/rendezVous";
import { listTousParametres } from "@/db/repositories/parametres";
import type {
  Creneau,
  Devoir,
  Eleve,
  NotionSemaine,
  RendezVous,
  Rituel,
  Seance,
  Sequence,
} from "@/types/models";

/** Version du format de sauvegarde — à incrémenter si la structure change de façon non rétrocompatible. */
const VERSION_SAUVEGARDE = 1;

export interface Sauvegarde {
  version: number;
  exportedAt: string;
  eleves: Eleve[];
  sequences: Sequence[];
  seances: Seance[];
  creneaux: Creneau[];
  rituels: Rituel[];
  notionsSemaine: NotionSemaine[];
  devoirs: Devoir[];
  rendezVous: RendezVous[];
  parametres: Record<string, string>;
}

/** Rassemble l'intégralité des données locales en un seul objet sérialisable. */
export async function collecterSauvegarde(): Promise<Sauvegarde> {
  const [eleves, sequences, seances, creneaux, rituels, notionsSemaine, devoirs, rendezVous, parametres] =
    await Promise.all([
      listEleves(),
      listAllSequences(),
      listAllSeances(),
      listAllCreneaux(),
      listAllRituels(),
      listAllNotionsSemaine(),
      listAllDevoirs(),
      listAllRendezVous(),
      listTousParametres(),
    ]);

  return {
    version: VERSION_SAUVEGARDE,
    exportedAt: nowIso(),
    eleves,
    sequences,
    seances,
    creneaux,
    rituels,
    notionsSemaine,
    devoirs,
    rendezVous,
    parametres,
  };
}

/**
 * Ouvre le sélecteur de fichier système et écrit la sauvegarde JSON à l'emplacement
 * choisi par l'utilisateur (clé USB, dossier partagé, etc.). Ne transite jamais par le réseau.
 */
export async function exporterVersFichier(): Promise<string | null> {
  const horodatage = new Date().toISOString().slice(0, 10);
  const chemin = await save({
    defaultPath: `cahier-journal-sauvegarde-${horodatage}.json`,
    filters: [{ name: "Sauvegarde Cahier Journal", extensions: ["json"] }],
  });
  if (!chemin) return null;

  const sauvegarde = await collecterSauvegarde();
  await writeTextFile(chemin, JSON.stringify(sauvegarde, null, 2));
  return chemin;
}

/** Ouvre le sélecteur de fichier et lit + valide une sauvegarde JSON, sans encore rien modifier en base. */
export async function choisirEtLireSauvegarde(): Promise<Sauvegarde | null> {
  const chemin = await open({
    multiple: false,
    filters: [{ name: "Sauvegarde Cahier Journal", extensions: ["json"] }],
  });
  if (!chemin || Array.isArray(chemin)) return null;

  const contenu = await readTextFile(chemin);
  const donnees = JSON.parse(contenu) as Partial<Sauvegarde>;

  if (typeof donnees !== "object" || donnees === null || !Array.isArray(donnees.eleves)) {
    throw new Error("Ce fichier ne ressemble pas à une sauvegarde Cahier Journal valide.");
  }
  if (donnees.version !== VERSION_SAUVEGARDE) {
    throw new Error(
      `Version de sauvegarde non prise en charge (${donnees.version ?? "inconnue"}). ` +
        `Cette application lit la version ${VERSION_SAUVEGARDE}.`,
    );
  }
  return donnees as Sauvegarde;
}

/**
 * Remplace intégralement le contenu de la base locale par celui de la sauvegarde fournie.
 * Opération destructive : à n'appeler qu'après confirmation explicite de l'utilisateur.
 * Les identifiants et horodatages d'origine sont préservés pour garder les liens
 * (séance ↔ créneau, élève ↔ rendez-vous) intacts.
 */
export async function restaurerSauvegarde(sauvegarde: Sauvegarde): Promise<void> {
  const db = await getDb();

  await db.execute("BEGIN TRANSACTION");
  try {
    // Ordre de suppression : des tables dépendantes vers les tables référencées.
    await db.execute("DELETE FROM creneaux");
    await db.execute("DELETE FROM rituels");
    await db.execute("DELETE FROM notions_semaine");
    await db.execute("DELETE FROM devoirs");
    await db.execute("DELETE FROM rendez_vous");
    await db.execute("DELETE FROM seances");
    await db.execute("DELETE FROM sequences");
    await db.execute("DELETE FROM eleves");

    for (const eleve of sauvegarde.eleves) {
      const row = eleveToRow(eleve);
      await db.execute(
        `INSERT INTO eleves (
           id, prenom, nom, niveau, date_naissance, date_entree_classe, photo_path,
           responsables_json, a_pai, pai_details, a_ppre, ppre_details, a_pap, pap_details,
           allergies, autorisations_json, notes_confidentielles, created_at, updated_at
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)`,
        [
          row.id, row.prenom, row.nom, row.niveau, row.date_naissance, row.date_entree_classe,
          row.photo_path, row.responsables_json, row.a_pai, row.pai_details, row.a_ppre,
          row.ppre_details, row.a_pap, row.pap_details, row.allergies, row.autorisations_json,
          row.notes_confidentielles, eleve.createdAt, eleve.updatedAt,
        ],
      );
    }

    for (const sequence of sauvegarde.sequences) {
      await db.execute(
        `INSERT INTO sequences (
           id, titre, discipline, niveau, periode, objectifs_generaux,
           competences_programme_json, prerequis, nombre_seances_prevues, statut,
           created_at, updated_at
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [
          sequence.id, sequence.titre, sequence.discipline, sequence.niveau, sequence.periode,
          sequence.objectifsGeneraux ?? null, JSON.stringify(sequence.competencesProgramme ?? []),
          sequence.prerequis ?? null, sequence.nombreSeancesPrevues, sequence.statut,
          sequence.createdAt, sequence.updatedAt,
        ],
      );
    }

    for (const seance of sauvegarde.seances) {
      await db.execute(
        `INSERT INTO seances (
           id, sequence_id, numero_ordre, titre, date_prevue, duree_minutes, objectifs,
           competences_json, prerequis, materiel, deroulement_json, differenciation,
           bilan_remediation, statut, created_at, updated_at
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`,
        [
          seance.id, seance.sequenceId, seance.numeroOrdre, seance.titre, seance.datePrevue ?? null,
          seance.dureeMinutes, seance.objectifs ?? null, JSON.stringify(seance.competences ?? []),
          seance.prerequis ?? null, seance.materiel ?? null, JSON.stringify(seance.deroulement ?? []),
          seance.differenciation ?? null, seance.bilanRemediation ?? null, seance.statut,
          seance.createdAt, seance.updatedAt,
        ],
      );
    }

    for (const creneau of sauvegarde.creneaux) {
      await db.execute(
        `INSERT INTO creneaux (
           id, date, heure_debut, heure_fin, groupe, type_creneau, discipline,
           seance_id, titre_libre, notes, created_at, updated_at
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [
          creneau.id, creneau.date, creneau.heureDebut, creneau.heureFin, creneau.groupe,
          creneau.typeCreneau, creneau.discipline ?? null, creneau.seanceId ?? null,
          creneau.titreLibre ?? null, creneau.notes ?? null, creneau.createdAt, creneau.updatedAt,
        ],
      );
    }

    for (const rituel of sauvegarde.rituels) {
      await db.execute(
        `INSERT INTO rituels (id, date, niveau, type_rituel, contenu_json, fait, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [
          rituel.id, rituel.date, rituel.niveau, rituel.typeRituel,
          JSON.stringify(rituel.contenu ?? {}), rituel.fait ? 1 : 0, rituel.createdAt,
        ],
      );
    }

    for (const notion of sauvegarde.notionsSemaine) {
      await db.execute(
        `INSERT INTO notions_semaine (id, semaine_debut, niveau, discipline, objectif_prioritaire, ordre, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [
          notion.id, notion.semaineDebut, notion.niveau, notion.discipline,
          notion.objectifPrioritaire, notion.ordre, notion.createdAt,
        ],
      );
    }

    for (const devoir of sauvegarde.devoirs) {
      await db.execute(
        `INSERT INTO devoirs (id, date_donnee, date_a_rendre, niveau, discipline, consigne, eleves_concernes_json, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [
          devoir.id, devoir.dateDonnee, devoir.dateARendre, devoir.niveau, devoir.discipline,
          devoir.consigne, devoir.elevesConcernes ? JSON.stringify(devoir.elevesConcernes) : null,
          devoir.createdAt,
        ],
      );
    }

    for (const rdv of sauvegarde.rendezVous) {
      await db.execute(
        `INSERT INTO rendez_vous (
           id, date, heure_debut, heure_fin, type_rdv, titre, participants, lieu, notes,
           eleve_id, created_at, updated_at
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [
          rdv.id, rdv.date, rdv.heureDebut, rdv.heureFin, rdv.typeRdv, rdv.titre,
          rdv.participants ?? null, rdv.lieu ?? null, rdv.notes ?? null, rdv.eleveId ?? null,
          rdv.createdAt, rdv.updatedAt,
        ],
      );
    }

    for (const [cle, valeur] of Object.entries(sauvegarde.parametres)) {
      await db.execute(
        `INSERT INTO parametres (cle, valeur) VALUES ($1, $2)
         ON CONFLICT(cle) DO UPDATE SET valeur = excluded.valeur`,
        [cle, valeur],
      );
    }

    await db.execute("COMMIT");
  } catch (err) {
    await db.execute("ROLLBACK");
    throw err;
  }
}
