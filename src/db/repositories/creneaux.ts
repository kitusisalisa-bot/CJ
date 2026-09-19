import { generateId, getDb, nowIso } from "@/db/client";
import { rowToCreneau, rowToSeance } from "@/db/mappers";
import type { Creneau, CreneauAvecSeance } from "@/types/models";

interface CreneauSeanceRow {
  id: string;
  date: string;
  heure_debut: string;
  heure_fin: string;
  groupe: Creneau["groupe"];
  type_creneau: Creneau["typeCreneau"];
  discipline: string | null;
  seance_id: string | null;
  titre_libre: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  s_id: string | null;
  s_sequence_id: string | null;
  s_numero_ordre: number | null;
  s_titre: string | null;
  s_date_prevue: string | null;
  s_duree_minutes: number | null;
  s_objectifs: string | null;
  s_competences_json: string | null;
  s_prerequis: string | null;
  s_materiel: string | null;
  s_deroulement_json: string | null;
  s_differenciation: string | null;
  s_bilan_remediation: string | null;
  s_statut: string | null;
  s_created_at: string | null;
  s_updated_at: string | null;
}

/** Récupère tous les créneaux d'une date, avec la séance liée si présente. */
export async function listCreneauxDuJour(date: string): Promise<CreneauAvecSeance[]> {
  const db = await getDb();
  const rows = await db.select<CreneauSeanceRow[]>(
    `SELECT c.*,
            s.id AS s_id, s.sequence_id AS s_sequence_id, s.numero_ordre AS s_numero_ordre,
            s.titre AS s_titre, s.date_prevue AS s_date_prevue, s.duree_minutes AS s_duree_minutes,
            s.objectifs AS s_objectifs, s.competences_json AS s_competences_json,
            s.prerequis AS s_prerequis, s.materiel AS s_materiel,
            s.deroulement_json AS s_deroulement_json, s.differenciation AS s_differenciation,
            s.bilan_remediation AS s_bilan_remediation, s.statut AS s_statut,
            s.created_at AS s_created_at, s.updated_at AS s_updated_at
       FROM creneaux c
       LEFT JOIN seances s ON s.id = c.seance_id
      WHERE c.date = $1
      ORDER BY c.heure_debut, c.groupe`,
    [date],
  );

  return rows.map((row) => {
    const creneau = rowToCreneau(row);
    const avecSeance: CreneauAvecSeance = { ...creneau };
    if (row.s_id) {
      avecSeance.seance = rowToSeance({
        id: row.s_id,
        sequence_id: row.s_sequence_id!,
        numero_ordre: row.s_numero_ordre!,
        titre: row.s_titre!,
        date_prevue: row.s_date_prevue,
        duree_minutes: row.s_duree_minutes!,
        objectifs: row.s_objectifs,
        competences_json: row.s_competences_json ?? "[]",
        prerequis: row.s_prerequis,
        materiel: row.s_materiel,
        deroulement_json: row.s_deroulement_json ?? "[]",
        differenciation: row.s_differenciation,
        bilan_remediation: row.s_bilan_remediation,
        statut: row.s_statut,
        created_at: row.s_created_at!,
        updated_at: row.s_updated_at!,
        // Les colonnes préfixées "s_" viennent d'un LEFT JOIN texte brut ; le
        // typage strict est fait par rowToSeance, ce cast n'affecte que l'entrée.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
    }
    return avecSeance;
  });
}

/** Récupère les créneaux de la semaine (7 dates ISO fournies par l'appelant). */
export async function listCreneauxSemaine(dates: string[]): Promise<CreneauAvecSeance[]> {
  const results = await Promise.all(dates.map(listCreneauxDuJour));
  return results.flat();
}

export async function createCreneau(
  input: Omit<Creneau, "id" | "createdAt" | "updatedAt">,
): Promise<Creneau> {
  const db = await getDb();
  const creneau: Creneau = { ...input, id: generateId(), createdAt: nowIso(), updatedAt: nowIso() };
  await db.execute(
    `INSERT INTO creneaux (
       id, date, heure_debut, heure_fin, groupe, type_creneau, discipline,
       seance_id, titre_libre, notes
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
    [
      creneau.id,
      creneau.date,
      creneau.heureDebut,
      creneau.heureFin,
      creneau.groupe,
      creneau.typeCreneau,
      creneau.discipline ?? null,
      creneau.seanceId ?? null,
      creneau.titreLibre ?? null,
      creneau.notes ?? null,
    ],
  );
  return creneau;
}

export async function updateCreneau(creneau: Creneau): Promise<void> {
  const db = await getDb();
  await db.execute(
    `UPDATE creneaux SET
       date = $1, heure_debut = $2, heure_fin = $3, groupe = $4, type_creneau = $5,
       discipline = $6, seance_id = $7, titre_libre = $8, notes = $9, updated_at = $10
     WHERE id = $11`,
    [
      creneau.date,
      creneau.heureDebut,
      creneau.heureFin,
      creneau.groupe,
      creneau.typeCreneau,
      creneau.discipline ?? null,
      creneau.seanceId ?? null,
      creneau.titreLibre ?? null,
      creneau.notes ?? null,
      nowIso(),
      creneau.id,
    ],
  );
}

export async function deleteCreneau(id: string): Promise<void> {
  const db = await getDb();
  await db.execute("DELETE FROM creneaux WHERE id = $1", [id]);
}
