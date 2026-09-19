import { generateId, getDb, nowIso } from "@/db/client";
import { eleveToRow, rowToEleve } from "@/db/mappers";
import type { Eleve, EleveRow, Niveau } from "@/types/models";

export async function listEleves(niveau?: Niveau): Promise<Eleve[]> {
  const db = await getDb();
  const rows = niveau
    ? await db.select<EleveRow[]>(
        "SELECT * FROM eleves WHERE niveau = $1 ORDER BY nom, prenom",
        [niveau],
      )
    : await db.select<EleveRow[]>("SELECT * FROM eleves ORDER BY niveau, nom, prenom");
  return rows.map(rowToEleve);
}

export async function createEleve(
  input: Omit<Eleve, "id" | "createdAt" | "updatedAt">,
): Promise<Eleve> {
  const db = await getDb();
  const eleve: Eleve = { ...input, id: generateId(), createdAt: nowIso(), updatedAt: nowIso() };
  const row = eleveToRow(eleve);
  await db.execute(
    `INSERT INTO eleves (
       id, prenom, nom, niveau, date_naissance, date_entree_classe, photo_path,
       responsables_json, a_pai, pai_details, a_ppre, ppre_details, a_pap, pap_details,
       allergies, autorisations_json, notes_confidentielles
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`,
    [
      row.id,
      row.prenom,
      row.nom,
      row.niveau,
      row.date_naissance,
      row.date_entree_classe,
      row.photo_path,
      row.responsables_json,
      row.a_pai,
      row.pai_details,
      row.a_ppre,
      row.ppre_details,
      row.a_pap,
      row.pap_details,
      row.allergies,
      row.autorisations_json,
      row.notes_confidentielles,
    ],
  );
  return eleve;
}

export async function updateEleve(eleve: Eleve): Promise<void> {
  const db = await getDb();
  const row = eleveToRow(eleve);
  await db.execute(
    `UPDATE eleves SET
       prenom = $1, nom = $2, niveau = $3, date_naissance = $4, date_entree_classe = $5,
       photo_path = $6, responsables_json = $7, a_pai = $8, pai_details = $9,
       a_ppre = $10, ppre_details = $11, a_pap = $12, pap_details = $13,
       allergies = $14, autorisations_json = $15, notes_confidentielles = $16,
       updated_at = $17
     WHERE id = $18`,
    [
      row.prenom,
      row.nom,
      row.niveau,
      row.date_naissance,
      row.date_entree_classe,
      row.photo_path,
      row.responsables_json,
      row.a_pai,
      row.pai_details,
      row.a_ppre,
      row.ppre_details,
      row.a_pap,
      row.pap_details,
      row.allergies,
      row.autorisations_json,
      row.notes_confidentielles,
      nowIso(),
      row.id,
    ],
  );
}

export async function deleteEleve(id: string): Promise<void> {
  const db = await getDb();
  await db.execute("DELETE FROM eleves WHERE id = $1", [id]);
}
