import { generateId, getDb } from "@/db/client";
import type { Devoir, Discipline, Niveau } from "@/types/models";

interface DevoirRow {
  id: string;
  date_donnee: string;
  date_a_rendre: string;
  niveau: Niveau;
  discipline: Discipline;
  consigne: string;
  eleves_concernes_json: string | null;
  created_at: string;
}

function rowToDevoir(row: DevoirRow): Devoir {
  return {
    id: row.id,
    dateDonnee: row.date_donnee,
    dateARendre: row.date_a_rendre,
    niveau: row.niveau,
    discipline: row.discipline,
    consigne: row.consigne,
    elevesConcernes: row.eleves_concernes_json ? JSON.parse(row.eleves_concernes_json) : undefined,
    createdAt: row.created_at,
  };
}

/** Devoirs donnés à une date donnée (typiquement le jour affiché en Mode Classe). */
export async function listDevoirsDonnesLe(date: string): Promise<Devoir[]> {
  const db = await getDb();
  const rows = await db.select<DevoirRow[]>(
    "SELECT * FROM devoirs WHERE date_donnee = $1 ORDER BY discipline",
    [date],
  );
  return rows.map(rowToDevoir);
}

export async function ajouterDevoir(input: Omit<Devoir, "id" | "createdAt">): Promise<void> {
  const db = await getDb();
  await db.execute(
    `INSERT INTO devoirs (id, date_donnee, date_a_rendre, niveau, discipline, consigne, eleves_concernes_json)
     VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [
      generateId(),
      input.dateDonnee,
      input.dateARendre,
      input.niveau,
      input.discipline,
      input.consigne,
      input.elevesConcernes ? JSON.stringify(input.elevesConcernes) : null,
    ],
  );
}
