import { generateId, getDb, nowIso } from "@/db/client";
import { rowToSequence } from "@/db/mappers";
import type { Discipline, NiveauSequence, Periode, Sequence, StatutSequence } from "@/types/models";

interface SequenceRow {
  id: string;
  titre: string;
  discipline: Discipline;
  niveau: NiveauSequence;
  periode: Periode;
  objectifs_generaux: string | null;
  competences_programme_json: string;
  prerequis: string | null;
  nombre_seances_prevues: number;
  statut: StatutSequence;
  created_at: string;
  updated_at: string;
}

export async function listAllSequences(): Promise<Sequence[]> {
  const db = await getDb();
  const rows = await db.select<SequenceRow[]>(
    "SELECT * FROM sequences ORDER BY periode, niveau, titre",
  );
  return rows.map(rowToSequence);
}

export async function getSequence(id: string): Promise<Sequence | undefined> {
  const db = await getDb();
  const rows = await db.select<SequenceRow[]>("SELECT * FROM sequences WHERE id = $1", [id]);
  return rows[0] ? rowToSequence(rows[0]) : undefined;
}

export async function createSequence(
  input: Omit<Sequence, "id" | "createdAt" | "updatedAt">,
): Promise<Sequence> {
  const db = await getDb();
  const sequence: Sequence = { ...input, id: generateId(), createdAt: nowIso(), updatedAt: nowIso() };
  await db.execute(
    `INSERT INTO sequences (
       id, titre, discipline, niveau, periode, objectifs_generaux,
       competences_programme_json, prerequis, nombre_seances_prevues, statut
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
    [
      sequence.id,
      sequence.titre,
      sequence.discipline,
      sequence.niveau,
      sequence.periode,
      sequence.objectifsGeneraux ?? null,
      JSON.stringify(sequence.competencesProgramme ?? []),
      sequence.prerequis ?? null,
      sequence.nombreSeancesPrevues,
      sequence.statut,
    ],
  );
  return sequence;
}

export async function updateSequence(sequence: Sequence): Promise<void> {
  const db = await getDb();
  await db.execute(
    `UPDATE sequences SET
       titre = $1, discipline = $2, niveau = $3, periode = $4, objectifs_generaux = $5,
       competences_programme_json = $6, prerequis = $7, nombre_seances_prevues = $8,
       statut = $9, updated_at = $10
     WHERE id = $11`,
    [
      sequence.titre,
      sequence.discipline,
      sequence.niveau,
      sequence.periode,
      sequence.objectifsGeneraux ?? null,
      JSON.stringify(sequence.competencesProgramme ?? []),
      sequence.prerequis ?? null,
      sequence.nombreSeancesPrevues,
      sequence.statut,
      nowIso(),
      sequence.id,
    ],
  );
}

/** Supprime la séquence ; les séances liées sont supprimées en cascade (ON DELETE CASCADE). */
export async function deleteSequence(id: string): Promise<void> {
  const db = await getDb();
  await db.execute("DELETE FROM sequences WHERE id = $1", [id]);
}
