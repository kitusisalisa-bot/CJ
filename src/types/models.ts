/**
 * Modèles de données — miroir TypeScript du schéma SQLite (src-tauri/migrations/0001_init.sql).
 * Toutes les dates sont des chaînes ISO 8601 ("YYYY-MM-DD" pour les dates seules,
 * "HH:MM" pour les heures). Aucun type ici ne modélise de donnée distante.
 */

export type Niveau = "GS" | "CE2";
export type NiveauSequence = "GS" | "CE2" | "GS_CE2";

export type Periode = "P1" | "P2" | "P3" | "P4" | "P5";

/** Groupe pédagogique d'un créneau : permet le double niveau en colonnes parallèles. */
export type GroupeCreneau =
  | "GS_DIRIGE"
  | "GS_AUTONOME"
  | "CE2_DIRIGE"
  | "CE2_AUTONOME"
  | "COMMUN";

export type TypeCreneau =
  | "rituel"
  | "seance"
  | "recreation"
  | "cantine"
  | "accueil"
  | "autre";

export const DISCIPLINES = [
  "Français",
  "Mathématiques",
  "Explorer le monde",
  "Questionner le monde",
  "EPS",
  "Arts (visuels / musique)",
  "Langage oral",
  "EMC",
  "Langue vivante",
  "Autre",
] as const;
export type Discipline = (typeof DISCIPLINES)[number];

// ---------------------------------------------------------------------------
// Élèves
// ---------------------------------------------------------------------------

export interface Responsable {
  role: "Mère" | "Père" | "Tuteur/Tutrice" | "Autre";
  nom: string;
  telephone?: string;
  email?: string;
  adresse?: string;
}

export interface Autorisations {
  droitImage?: boolean;
  sortiesScolaires?: boolean;
  recupParTiers?: string; // liste libre des personnes autorisées
}

export interface Eleve {
  id: string;
  prenom: string;
  nom: string;
  niveau: Niveau;
  dateNaissance?: string;
  dateEntreeClasse?: string;
  photoPath?: string;

  responsables: Responsable[];

  aPai: boolean;
  paiDetails?: string;
  aPpre: boolean;
  ppreDetails?: string;
  aPap: boolean;
  papDetails?: string;
  allergies?: string;
  autorisations: Autorisations;

  notesConfidentielles?: string;

  createdAt: string;
  updatedAt: string;
}

/** Forme brute d'une ligne SQLite avant parsing des colonnes JSON. */
export interface EleveRow {
  id: string;
  prenom: string;
  nom: string;
  niveau: Niveau;
  date_naissance: string | null;
  date_entree_classe: string | null;
  photo_path: string | null;
  responsables_json: string;
  a_pai: 0 | 1;
  pai_details: string | null;
  a_ppre: 0 | 1;
  ppre_details: string | null;
  a_pap: 0 | 1;
  pap_details: string | null;
  allergies: string | null;
  autorisations_json: string;
  notes_confidentielles: string | null;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Séquences & séances (fiches de préparation)
// ---------------------------------------------------------------------------

export type StatutSequence = "planifiee" | "en_cours" | "terminee" | "archivee";
export type StatutSeance = "a_faire" | "faite" | "reportee" | "annulee";

/** Une étape du déroulement pas à pas d'une séance, façon fiche Éduscol. */
export interface EtapeDeroulement {
  ordre: number;
  titre: string; // ex : "Découverte", "Entraînement", "Mise en commun"
  dureeMinutes: number;
  consigne: string;
  materiel?: string;
  rolePe: string; // rôle de l'enseignant·e
  roleEleves: string; // rôle des élèves
  modalite?: "collectif" | "individuel" | "binome" | "petit_groupe";
}

export interface Sequence {
  id: string;
  titre: string;
  discipline: Discipline;
  niveau: NiveauSequence;
  periode: Periode;

  objectifsGeneraux?: string;
  competencesProgramme: string[];
  prerequis?: string;

  nombreSeancesPrevues: number;
  statut: StatutSequence;

  createdAt: string;
  updatedAt: string;
}

export interface Seance {
  id: string;
  sequenceId: string;
  numeroOrdre: number;

  titre: string;
  datePrevue?: string;
  dureeMinutes: number;

  objectifs?: string;
  competences: string[];
  prerequis?: string;
  materiel?: string;

  deroulement: EtapeDeroulement[];

  differenciation?: string;
  bilanRemediation?: string;

  statut: StatutSeance;

  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Emploi du temps — créneaux
// ---------------------------------------------------------------------------

export interface Creneau {
  id: string;
  date: string;
  heureDebut: string;
  heureFin: string;

  groupe: GroupeCreneau;
  typeCreneau: TypeCreneau;
  discipline?: Discipline;

  seanceId?: string;
  /** Titre libre utilisé quand le créneau n'est pas rattaché à une séance (ex. "Récréation"). */
  titreLibre?: string;
  notes?: string;

  createdAt: string;
  updatedAt: string;
}

/** Créneau enrichi de sa séance liée, pour l'affichage dans le cahier journal. */
export interface CreneauAvecSeance extends Creneau {
  seance?: Seance;
}

// ---------------------------------------------------------------------------
// Rituels quotidiens
// ---------------------------------------------------------------------------

export type TypeRituel =
  | "date"
  | "meteo"
  | "chaque_jour_compte"
  | "phonologie"
  | "vocabulaire"
  | "autre";

export interface Rituel {
  id: string;
  date: string;
  niveau: NiveauSequence;
  typeRituel: TypeRituel;
  contenu: Record<string, unknown>;
  fait: boolean;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Planificateur de notions de la semaine
// ---------------------------------------------------------------------------

export interface NotionSemaine {
  id: string;
  semaineDebut: string; // lundi de la semaine
  niveau: Niveau;
  discipline: Discipline;
  objectifPrioritaire: string;
  ordre: number;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Devoirs
// ---------------------------------------------------------------------------

export interface Devoir {
  id: string;
  dateDonnee: string;
  dateARendre: string;
  niveau: Niveau;
  discipline: Discipline;
  consigne: string;
  /** undefined = tous les élèves du niveau */
  elevesConcernes?: string[];
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Rendez-vous
// ---------------------------------------------------------------------------

export type TypeRdv = "parents" | "rased" | "equipe_educative" | "reunion_cycle" | "autre";

export interface RendezVous {
  id: string;
  date: string;
  heureDebut: string;
  heureFin: string;
  typeRdv: TypeRdv;
  titre: string;
  participants?: string;
  lieu?: string;
  notes?: string;
  eleveId?: string;

  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Paramètres applicatifs
// ---------------------------------------------------------------------------

export interface Parametres {
  nomClasse: string;
  policeCursiveTailleProjection: number;
  anneeScolaire: string;
}
