import { getDb } from "@/db/client";

interface ParametreRow {
  cle: string;
  valeur: string;
}

/** Lit tous les paramètres sous forme de dictionnaire clé/valeur. */
export async function listTousParametres(): Promise<Record<string, string>> {
  const db = await getDb();
  const rows = await db.select<ParametreRow[]>("SELECT * FROM parametres");
  return Object.fromEntries(rows.map((r) => [r.cle, r.valeur]));
}

export async function setParametre(cle: string, valeur: string): Promise<void> {
  const db = await getDb();
  await db.execute(
    `INSERT INTO parametres (cle, valeur) VALUES ($1, $2)
     ON CONFLICT(cle) DO UPDATE SET valeur = excluded.valeur`,
    [cle, valeur],
  );
}

export async function setPlusieursParametres(parametres: Record<string, string>): Promise<void> {
  for (const [cle, valeur] of Object.entries(parametres)) {
    await setParametre(cle, valeur);
  }
}
