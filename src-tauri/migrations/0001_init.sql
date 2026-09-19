-- ============================================================================
-- Cahier Journal — schéma SQLite initial
-- Base 100% locale (fichier .db dans le dossier de données applicatif de
-- l'utilisateur). Aucune table ni colonne ne référence de service distant.
-- ============================================================================

PRAGMA foreign_keys = ON;

-- ----------------------------------------------------------------------------
-- ELEVES : fiches élèves GS et CE2 (double niveau)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS eleves (
  id                      TEXT PRIMARY KEY,                 -- uuid
  prenom                  TEXT NOT NULL,
  nom                     TEXT NOT NULL,
  niveau                  TEXT NOT NULL CHECK (niveau IN ('GS', 'CE2')),
  date_naissance          TEXT,                              -- ISO 8601 (YYYY-MM-DD)
  date_entree_classe      TEXT,
  photo_path              TEXT,                              -- chemin local relatif au dossier de données, jamais distant

  -- Coordonnées responsables (JSON : tableau de {role, nom, tel, email, adresse})
  responsables_json       TEXT NOT NULL DEFAULT '[]',

  -- Suivi médical / adaptations pédagogiques
  a_pai                   INTEGER NOT NULL DEFAULT 0 CHECK (a_pai IN (0, 1)),
  pai_details             TEXT,
  a_ppre                  INTEGER NOT NULL DEFAULT 0 CHECK (a_ppre IN (0, 1)),
  ppre_details            TEXT,
  a_pap                   INTEGER NOT NULL DEFAULT 0 CHECK (a_pap IN (0, 1)),
  pap_details             TEXT,
  allergies               TEXT,
  autorisations_json      TEXT NOT NULL DEFAULT '{}',        -- {droit_image, sorties, ...}

  notes_confidentielles   TEXT,                              -- visible enseignant·e uniquement dans l'UI

  created_at              TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at              TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_eleves_niveau ON eleves (niveau);

-- ----------------------------------------------------------------------------
-- SEQUENCES : séquences d'apprentissage / progressions
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sequences (
  id                      TEXT PRIMARY KEY,
  titre                   TEXT NOT NULL,
  discipline              TEXT NOT NULL,                     -- voir enum côté TS: Discipline
  niveau                  TEXT NOT NULL CHECK (niveau IN ('GS', 'CE2', 'GS_CE2')),
  periode                 TEXT NOT NULL CHECK (periode IN ('P1', 'P2', 'P3', 'P4', 'P5')),

  objectifs_generaux      TEXT,
  competences_programme_json TEXT NOT NULL DEFAULT '[]',     -- items du programme / socle visés
  prerequis               TEXT,

  nombre_seances_prevues  INTEGER NOT NULL DEFAULT 1,
  statut                  TEXT NOT NULL DEFAULT 'planifiee' CHECK (statut IN ('planifiee', 'en_cours', 'terminee', 'archivee')),

  created_at              TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at              TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_sequences_niveau_periode ON sequences (niveau, periode);

-- ----------------------------------------------------------------------------
-- SEANCES : fiches de préparation détaillées, rattachées à une séquence
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS seances (
  id                      TEXT PRIMARY KEY,
  sequence_id             TEXT NOT NULL REFERENCES sequences(id) ON DELETE CASCADE,
  numero_ordre            INTEGER NOT NULL DEFAULT 1,

  titre                   TEXT NOT NULL,
  date_prevue             TEXT,                              -- ISO date, nullable tant que non planifiée
  duree_minutes           INTEGER NOT NULL DEFAULT 30,

  objectifs               TEXT,
  competences_json        TEXT NOT NULL DEFAULT '[]',
  prerequis               TEXT,
  materiel                TEXT,

  -- Déroulement pas à pas : JSON, tableau d'étapes {ordre, titre, duree_minutes,
  -- consigne, materiel, role_pe, role_eleves, modalite}
  deroulement_json        TEXT NOT NULL DEFAULT '[]',

  differenciation         TEXT,                              -- adaptation GS / CE2 / élèves à besoins particuliers
  bilan_remediation       TEXT,

  statut                  TEXT NOT NULL DEFAULT 'a_faire' CHECK (statut IN ('a_faire', 'faite', 'reportee', 'annulee')),

  created_at              TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at              TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_seances_sequence ON seances (sequence_id);
CREATE INDEX IF NOT EXISTS idx_seances_date ON seances (date_prevue);

-- ----------------------------------------------------------------------------
-- CRENEAUX : emploi du temps — un créneau par colonne/groupe sur un jour donné
-- Le double niveau est modélisé par la colonne `groupe` : un même horaire peut
-- avoir deux créneaux en parallèle (un GS, un CE2) ou un créneau commun.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS creneaux (
  id                      TEXT PRIMARY KEY,
  date                    TEXT NOT NULL,                     -- ISO date (YYYY-MM-DD)
  heure_debut             TEXT NOT NULL,                     -- "HH:MM"
  heure_fin               TEXT NOT NULL,                     -- "HH:MM"

  groupe                  TEXT NOT NULL CHECK (groupe IN (
                              'GS_DIRIGE', 'GS_AUTONOME',
                              'CE2_DIRIGE', 'CE2_AUTONOME',
                              'COMMUN'
                            )),
  type_creneau            TEXT NOT NULL DEFAULT 'seance' CHECK (type_creneau IN (
                              'rituel', 'seance', 'recreation', 'cantine', 'accueil', 'autre'
                            )),
  discipline              TEXT,

  seance_id               TEXT REFERENCES seances(id) ON DELETE SET NULL,
  titre_libre             TEXT,                              -- utilisé si pas de seance_id (ex : "Récréation")
  notes                   TEXT,

  created_at              TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at              TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_creneaux_date ON creneaux (date);
CREATE INDEX IF NOT EXISTS idx_creneaux_date_groupe ON creneaux (date, groupe);

-- ----------------------------------------------------------------------------
-- RITUELS QUOTIDIENS : paramétrables par jour et par niveau
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rituels (
  id                      TEXT PRIMARY KEY,
  date                    TEXT NOT NULL,
  niveau                  TEXT NOT NULL CHECK (niveau IN ('GS', 'CE2', 'GS_CE2')),
  type_rituel             TEXT NOT NULL CHECK (type_rituel IN (
                              'date', 'meteo', 'chaque_jour_compte', 'phonologie', 'vocabulaire', 'autre'
                            )),
  contenu_json            TEXT NOT NULL DEFAULT '{}',        -- contenu libre selon le type (ex: {mot_du_jour, nombre_du_jour})
  fait                    INTEGER NOT NULL DEFAULT 0 CHECK (fait IN (0, 1)),

  created_at              TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_rituels_date ON rituels (date);

-- ----------------------------------------------------------------------------
-- NOTIONS DE LA SEMAINE : objectifs prioritaires hebdomadaires par niveau
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notions_semaine (
  id                      TEXT PRIMARY KEY,
  semaine_debut           TEXT NOT NULL,                     -- lundi de la semaine, ISO date
  niveau                  TEXT NOT NULL CHECK (niveau IN ('GS', 'CE2')),
  discipline              TEXT NOT NULL,
  objectif_prioritaire    TEXT NOT NULL,
  ordre                   INTEGER NOT NULL DEFAULT 0,

  created_at              TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_notions_semaine ON notions_semaine (semaine_debut, niveau);

-- ----------------------------------------------------------------------------
-- DEVOIRS : gestion des devoirs hebdomadaires (essentiellement CE2)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS devoirs (
  id                      TEXT PRIMARY KEY,
  date_donnee             TEXT NOT NULL,
  date_a_rendre           TEXT NOT NULL,
  niveau                  TEXT NOT NULL CHECK (niveau IN ('GS', 'CE2')),
  discipline              TEXT NOT NULL,
  consigne                TEXT NOT NULL,

  -- NULL = tous les élèves du niveau concerné ; sinon JSON tableau d'ids élèves
  eleves_concernes_json   TEXT,

  created_at              TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_devoirs_date_rendre ON devoirs (date_a_rendre);

-- ----------------------------------------------------------------------------
-- RENDEZ-VOUS : agenda parents / RASED / équipes éducatives / réunions
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rendez_vous (
  id                      TEXT PRIMARY KEY,
  date                    TEXT NOT NULL,
  heure_debut             TEXT NOT NULL,
  heure_fin               TEXT NOT NULL,
  type_rdv                TEXT NOT NULL CHECK (type_rdv IN (
                              'parents', 'rased', 'equipe_educative', 'reunion_cycle', 'autre'
                            )),
  titre                   TEXT NOT NULL,
  participants            TEXT,
  lieu                    TEXT,
  notes                   TEXT,
  eleve_id                TEXT REFERENCES eleves(id) ON DELETE SET NULL,

  created_at              TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at              TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_rdv_date ON rendez_vous (date);

-- ----------------------------------------------------------------------------
-- PARAMETRES : réglages applicatifs (clé/valeur), ex. taille police cursive
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS parametres (
  cle                     TEXT PRIMARY KEY,
  valeur                  TEXT NOT NULL
);

INSERT OR IGNORE INTO parametres (cle, valeur) VALUES
  ('nom_classe', 'Classe GS/CE2'),
  ('police_cursive_taille_projection', '72'),
  ('annee_scolaire', '2025-2026');
