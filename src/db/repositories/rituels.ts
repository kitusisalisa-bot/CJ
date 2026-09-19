import { generateId, getDb } from "@/db/client";
import type { NiveauSequence, Rituel, TypeRituel } from "@/types/models";

interface RituelRow {
  id: string;
  date: string;
  niveau: NiveauSequence;
  type_rituel: TypeRituel;
  contenu_json: string;
  fait: 0 | 1;
  created_at: string;
}

function rowToRituel(row: RituelRow): Rituel {
  return {
    id: row.id,
    date: row.date,
    niveau: row.niveau,
    typeRituel: row.type_rituel,
    contenu: JSON.parse(row.contenu_json || "{}"),
    fait: row.fait === 1,
    createdAt: row.created_at,
  };
}

/** Tous les rituels, toutes dates confondues — pour l'export de sauvegarde. */
export async function listAllRituels(): Promise<Rituel[]> {
  const db = await getDb();
  const rows = await db.select<RituelRow[]>("SELECT * FROM rituels ORDER BY date");
  return rows.map(rowToRituel);
}

export async function listRituelsDuJour(date: string): Promise<Rituel[]> {
  const db = await getDb();
  const rows = await db.select<RituelRow[]>(
    "SELECT * FROM rituels WHERE date = $1 ORDER BY type_rituel",
    [date],
  );
  return rows.map(rowToRituel);
}

export async function upsertRituel(
  input: Omit<Rituel, "id" | "createdAt"> & { id?: string },
): Promise<void> {
  const db = await getDb();
  if (input.id) {
    await db.execute(
      "UPDATE rituels SET contenu_json = $1, fait = $2 WHERE id = $3",
      [JSON.stringify(input.contenu), input.fait ? 1 : 0, input.id],
    );
    return;
  }
  await db.execute(
    `INSERT INTO rituels (id, date, niveau, type_rituel, contenu_json, fait)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [generateId(), input.date, input.niveau, input.typeRituel, JSON.stringify(input.contenu), input.fait ? 1 : 0],
  );
}
