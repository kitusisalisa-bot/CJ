import { generateId, getDb } from "@/db/client";
import type { Discipline, Niveau, NotionSemaine } from "@/types/models";

interface NotionRow {
  id: string;
  semaine_debut: string;
  niveau: Niveau;
  discipline: Discipline;
  objectif_prioritaire: string;
  ordre: number;
  created_at: string;
}

function rowToNotion(row: NotionRow): NotionSemaine {
  return {
    id: row.id,
    semaineDebut: row.semaine_debut,
    niveau: row.niveau,
    discipline: row.discipline,
    objectifPrioritaire: row.objectif_prioritaire,
    ordre: row.ordre,
    createdAt: row.created_at,
  };
}

/** Toutes les notions, toutes semaines confondues — pour l'export de sauvegarde. */
export async function listAllNotionsSemaine(): Promise<NotionSemaine[]> {
  const db = await getDb();
  const rows = await db.select<NotionRow[]>("SELECT * FROM notions_semaine ORDER BY semaine_debut");
  return rows.map(rowToNotion);
}

export async function listNotionsSemaine(semaineDebut: string): Promise<NotionSemaine[]> {
  const db = await getDb();
  const rows = await db.select<NotionRow[]>(
    "SELECT * FROM notions_semaine WHERE semaine_debut = $1 ORDER BY niveau, ordre",
    [semaineDebut],
  );
  return rows.map(rowToNotion);
}

export async function ajouterNotionSemaine(
  input: Omit<NotionSemaine, "id" | "createdAt">,
): Promise<void> {
  const db = await getDb();
  await db.execute(
    `INSERT INTO notions_semaine (id, semaine_debut, niveau, discipline, objectif_prioritaire, ordre)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [generateId(), input.semaineDebut, input.niveau, input.discipline, input.objectifPrioritaire, input.ordre],
  );
}

export async function supprimerNotionSemaine(id: string): Promise<void> {
  const db = await getDb();
  await db.execute("DELETE FROM notions_semaine WHERE id = $1", [id]);
}
