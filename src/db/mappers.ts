import type {
  Autorisations,
  Creneau,
  Eleve,
  EleveRow,
  EtapeDeroulement,
  Responsable,
  Seance,
  Sequence,
} from "@/types/models";

function safeParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

export function rowToEleve(row: EleveRow): Eleve {
  return {
    id: row.id,
    prenom: row.prenom,
    nom: row.nom,
    niveau: row.niveau,
    dateNaissance: row.date_naissance ?? undefined,
    dateEntreeClasse: row.date_entree_classe ?? undefined,
    photoPath: row.photo_path ?? undefined,
    responsables: safeParse<Responsable[]>(row.responsables_json, []),
    aPai: row.a_pai === 1,
    paiDetails: row.pai_details ?? undefined,
    aPpre: row.a_ppre === 1,
    ppreDetails: row.ppre_details ?? undefined,
    aPap: row.a_pap === 1,
    papDetails: row.pap_details ?? undefined,
    allergies: row.allergies ?? undefined,
    autorisations: safeParse<Autorisations>(row.autorisations_json, {}),
    notesConfidentielles: row.notes_confidentielles ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function eleveToRow(e: Eleve): Omit<EleveRow, "created_at" | "updated_at"> {
  return {
    id: e.id,
    prenom: e.prenom,
    nom: e.nom,
    niveau: e.niveau,
    date_naissance: e.dateNaissance ?? null,
    date_entree_classe: e.dateEntreeClasse ?? null,
    photo_path: e.photoPath ?? null,
    responsables_json: JSON.stringify(e.responsables ?? []),
    a_pai: e.aPai ? 1 : 0,
    pai_details: e.paiDetails ?? null,
    a_ppre: e.aPpre ? 1 : 0,
    ppre_details: e.ppreDetails ?? null,
    a_pap: e.aPap ? 1 : 0,
    pap_details: e.papDetails ?? null,
    allergies: e.allergies ?? null,
    autorisations_json: JSON.stringify(e.autorisations ?? {}),
    notes_confidentielles: e.notesConfidentielles ?? null,
  };
}

// ---------------------------------------------------------------------------

interface CreneauRow {
  id: string;
  date: string;
  heure_debut: string;
  heure_fin: string;
  groupe: Creneau["groupe"];
  type_creneau: Creneau["typeCreneau"];
  discipline: string | null;
  seance_id: string | null;
  titre_libre: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function rowToCreneau(row: CreneauRow): Creneau {
  return {
    id: row.id,
    date: row.date,
    heureDebut: row.heure_debut,
    heureFin: row.heure_fin,
    groupe: row.groupe,
    typeCreneau: row.type_creneau,
    discipline: (row.discipline as Creneau["discipline"]) ?? undefined,
    seanceId: row.seance_id ?? undefined,
    titreLibre: row.titre_libre ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ---------------------------------------------------------------------------

interface SequenceRow {
  id: string;
  titre: string;
  discipline: string;
  niveau: Sequence["niveau"];
  periode: Sequence["periode"];
  objectifs_generaux: string | null;
  competences_programme_json: string;
  prerequis: string | null;
  nombre_seances_prevues: number;
  statut: Sequence["statut"];
  created_at: string;
  updated_at: string;
}

export function rowToSequence(row: SequenceRow): Sequence {
  return {
    id: row.id,
    titre: row.titre,
    discipline: row.discipline as Sequence["discipline"],
    niveau: row.niveau,
    periode: row.periode,
    objectifsGeneraux: row.objectifs_generaux ?? undefined,
    competencesProgramme: safeParse<string[]>(row.competences_programme_json, []),
    prerequis: row.prerequis ?? undefined,
    nombreSeancesPrevues: row.nombre_seances_prevues,
    statut: row.statut,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

interface SeanceRow {
  id: string;
  sequence_id: string;
  numero_ordre: number;
  titre: string;
  date_prevue: string | null;
  duree_minutes: number;
  objectifs: string | null;
  competences_json: string;
  prerequis: string | null;
  materiel: string | null;
  deroulement_json: string;
  differenciation: string | null;
  bilan_remediation: string | null;
  statut: Seance["statut"];
  created_at: string;
  updated_at: string;
}

export function rowToSeance(row: SeanceRow): Seance {
  return {
    id: row.id,
    sequenceId: row.sequence_id,
    numeroOrdre: row.numero_ordre,
    titre: row.titre,
    datePrevue: row.date_prevue ?? undefined,
    dureeMinutes: row.duree_minutes,
    objectifs: row.objectifs ?? undefined,
    competences: safeParse<string[]>(row.competences_json, []),
    prerequis: row.prerequis ?? undefined,
    materiel: row.materiel ?? undefined,
    deroulement: safeParse<EtapeDeroulement[]>(row.deroulement_json, []),
    differenciation: row.differenciation ?? undefined,
    bilanRemediation: row.bilan_remediation ?? undefined,
    statut: row.statut,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
