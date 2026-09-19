import Database from "@tauri-apps/plugin-sql";

/**
 * Connexion unique à la base SQLite locale. Le fichier vit dans le dossier de
 * données applicatif de l'utilisateur (géré par Tauri), jamais sur un serveur.
 * Les migrations (src-tauri/migrations/*.sql) sont rejouées automatiquement
 * par le plugin au premier accès.
 */
let dbPromise: Promise<Database> | null = null;

export function getDb(): Promise<Database> {
  if (!dbPromise) {
    dbPromise = Database.load("sqlite:cahier-journal.db");
  }
  return dbPromise;
}

/** Génère un identifiant local (uuid v4 simplifié) sans dépendance réseau. */
export function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function nowIso(): string {
  return new Date().toISOString();
}
