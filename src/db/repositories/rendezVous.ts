import { generateId, getDb, nowIso } from "@/db/client";
import type { RendezVous, TypeRdv } from "@/types/models";

interface RendezVousRow {
  id: string;
  date: string;
  heure_debut: string;
  heure_fin: string;
  type_rdv: TypeRdv;
  titre: string;
  participants: string | null;
  lieu: string | null;
  notes: string | null;
  eleve_id: string | null;
  created_at: string;
  updated_at: string;
}

function rowToRendezVous(row: RendezVousRow): RendezVous {
  return {
    id: row.id,
    date: row.date,
    heureDebut: row.heure_debut,
    heureFin: row.heure_fin,
    typeRdv: row.type_rdv,
    titre: row.titre,
    participants: row.participants ?? undefined,
    lieu: row.lieu ?? undefined,
    notes: row.notes ?? undefined,
    eleveId: row.eleve_id ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Tous les RDV à partir d'une date donnée (incluse), triés chronologiquement. */
export async function listRendezVousAVenir(depuisDate: string): Promise<RendezVous[]> {
  const db = await getDb();
  const rows = await db.select<RendezVousRow[]>(
    "SELECT * FROM rendez_vous WHERE date >= $1 ORDER BY date, heure_debut",
    [depuisDate],
  );
  return rows.map(rowToRendezVous);
}

export async function listRendezVousPasses(avantDate: string): Promise<RendezVous[]> {
  const db = await getDb();
  const rows = await db.select<RendezVousRow[]>(
    "SELECT * FROM rendez_vous WHERE date < $1 ORDER BY date DESC, heure_debut DESC",
    [avantDate],
  );
  return rows.map(rowToRendezVous);
}

export async function listRendezVousDuJour(date: string): Promise<RendezVous[]> {
  const db = await getDb();
  const rows = await db.select<RendezVousRow[]>(
    "SELECT * FROM rendez_vous WHERE date = $1 ORDER BY heure_debut",
    [date],
  );
  return rows.map(rowToRendezVous);
}

export async function listRendezVousDeLEleve(eleveId: string): Promise<RendezVous[]> {
  const db = await getDb();
  const rows = await db.select<RendezVousRow[]>(
    "SELECT * FROM rendez_vous WHERE eleve_id = $1 ORDER BY date DESC, heure_debut DESC",
    [eleveId],
  );
  return rows.map(rowToRendezVous);
}

export async function createRendezVous(
  input: Omit<RendezVous, "id" | "createdAt" | "updatedAt">,
): Promise<RendezVous> {
  const db = await getDb();
  const rdv: RendezVous = { ...input, id: generateId(), createdAt: nowIso(), updatedAt: nowIso() };
  await db.execute(
    `INSERT INTO rendez_vous (id, date, heure_debut, heure_fin, type_rdv, titre, participants, lieu, notes, eleve_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
    [
      rdv.id,
      rdv.date,
      rdv.heureDebut,
      rdv.heureFin,
      rdv.typeRdv,
      rdv.titre,
      rdv.participants ?? null,
      rdv.lieu ?? null,
      rdv.notes ?? null,
      rdv.eleveId ?? null,
    ],
  );
  return rdv;
}

export async function updateRendezVous(rdv: RendezVous): Promise<void> {
  const db = await getDb();
  await db.execute(
    `UPDATE rendez_vous SET
       date = $1, heure_debut = $2, heure_fin = $3, type_rdv = $4, titre = $5,
       participants = $6, lieu = $7, notes = $8, eleve_id = $9, updated_at = $10
     WHERE id = $11`,
    [
      rdv.date,
      rdv.heureDebut,
      rdv.heureFin,
      rdv.typeRdv,
      rdv.titre,
      rdv.participants ?? null,
      rdv.lieu ?? null,
      rdv.notes ?? null,
      rdv.eleveId ?? null,
      nowIso(),
      rdv.id,
    ],
  );
}

export async function deleteRendezVous(id: string): Promise<void> {
  const db = await getDb();
  await db.execute("DELETE FROM rendez_vous WHERE id = $1", [id]);
}
