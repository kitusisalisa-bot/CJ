import { generateId, getDb, nowIso } from "@/db/client";
import { rowToSeance } from "@/db/mappers";
import type { EtapeDeroulement, Seance, StatutSeance } from "@/types/models";

interface SeanceRow {
  id: string;
  sequence_id: string;
  numero_ordre: number;
  titre: string;
  date_prevue: string | null;
  duree_minutes: number;
  objectifs: string | null;
  competences_json: string;
  prerequis: string | null;
  materiel: string | null;
  deroulement_json: string;
  differenciation: string | null;
  bilan_remediation: string | null;
  statut: StatutSeance;
  created_at: string;
  updated_at: string;
}

export async function listAllSeances(): Promise<Seance[]> {
  const db = await getDb();
  const rows = await db.select<SeanceRow[]>("SELECT * FROM seances ORDER BY numero_ordre");
  return rows.map(rowToSeance);
}

export async function listSeancesDeLaSequence(sequenceId: string): Promise<Seance[]> {
  const db = await getDb();
  const rows = await db.select<SeanceRow[]>(
    "SELECT * FROM seances WHERE sequence_id = $1 ORDER BY numero_ordre",
    [sequenceId],
  );
  return rows.map(rowToSeance);
}

export async function createSeance(
  input: Omit<Seance, "id" | "createdAt" | "updatedAt">,
): Promise<Seance> {
  const db = await getDb();
  const seance: Seance = { ...input, id: generateId(), createdAt: nowIso(), updatedAt: nowIso() };
  await db.execute(
    `INSERT INTO seances (
       id, sequence_id, numero_ordre, titre, date_prevue, duree_minutes, objectifs,
       competences_json, prerequis, materiel, deroulement_json, differenciation,
       bilan_remediation, statut
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
    [
      seance.id,
      seance.sequenceId,
      seance.numeroOrdre,
      seance.titre,
      seance.datePrevue ?? null,
      seance.dureeMinutes,
      seance.objectifs ?? null,
      JSON.stringify(seance.competences ?? []),
      seance.prerequis ?? null,
      seance.materiel ?? null,
      JSON.stringify(seance.deroulement ?? ([] as EtapeDeroulement[])),
      seance.differenciation ?? null,
      seance.bilanRemediation ?? null,
      seance.statut,
    ],
  );
  return seance;
}

export async function updateSeance(seance: Seance): Promise<void> {
  const db = await getDb();
  await db.execute(
    `UPDATE seances SET
       numero_ordre = $1, titre = $2, date_prevue = $3, duree_minutes = $4, objectifs = $5,
       competences_json = $6, prerequis = $7, materiel = $8, deroulement_json = $9,
       differenciation = $10, bilan_remediation = $11, statut = $12, updated_at = $13
     WHERE id = $14`,
    [
      seance.numeroOrdre,
      seance.titre,
      seance.datePrevue ?? null,
      seance.dureeMinutes,
      seance.objectifs ?? null,
      JSON.stringify(seance.competences ?? []),
      seance.prerequis ?? null,
      seance.materiel ?? null,
      JSON.stringify(seance.deroulement ?? []),
      seance.differenciation ?? null,
      seance.bilanRemediation ?? null,
      seance.statut,
      nowIso(),
      seance.id,
    ],
  );
}

/** Supprime la séance ; les créneaux qui la référençaient repassent à seance_id = NULL. */
export async function deleteSeance(id: string): Promise<void> {
  const db = await getDb();
  await db.execute("DELETE FROM seances WHERE id = $1", [id]);
}
