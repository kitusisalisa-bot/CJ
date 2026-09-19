# Cahier Journal — GS/CE2 (application locale hors-ligne)

Application desktop 100 % locale pour gérer le cahier journal, l'emploi du
temps, les séquences pédagogiques et le mode « tableau projeté » d'une classe
à double niveau **Grande Section (10 élèves) / CE2 (14 élèves)**.

## 1. Stack technique retenue

| Couche | Choix | Pourquoi |
|---|---|---|
| Shell desktop | **Tauri 2** (Rust) | Binaire natif ~10-20 Mo (vs. ~150 Mo Electron), pas de runtime Chromium embarqué séparé, aucune dépendance réseau par défaut : **aucun plugin HTTP n'est installé**, donc aucune requête réseau n'est possible depuis le frontend. Compilation simple avec `cargo`/`npm`. |
| UI | **React 18 + TypeScript + Vite** | Écosystème mature, hot-reload rapide, typage strict de bout en bout (composants ↔ modèles ↔ SQL). |
| Style | **Tailwind CSS** | Permet un thème double-niveau (couleurs GS/CE2) cohérent sans fichiers CSS épars, et un mode plein écran sobre pour le vidéoprojecteur. |
| Données | **SQLite** via `tauri-plugin-sql` | Base fichier unique, locale, dans le dossier de données applicatif de l'utilisateur (`~/.local/share/…` / `%APPDATA%\…` / `~/Library/Application Support/…` selon l'OS). Migrations versionnées rejouées automatiquement au démarrage. |
| État global | **Zustand** | Alternative légère à Redux, suffisante pour un store « cahier journal » et un store « élèves », sans boilerplate. |
| Police | **Police cursive scolaire embarquée en `@font-face` local** | Voir `src/assets/fonts/README.md` — aucun appel à Google Fonts ou CDN. |

### Pourquoi pas de chiffrement SQLCipher par défaut ?

SQLCipher complique sensiblement la compilation multiplateforme (toolchains
OpenSSL/LibreSSL par OS) pour un gain de sécurité marginal dès lors que :
- le fichier vit dans le dossier de profil utilisateur, déjà protégé par les
  permissions du compte système ;
- l'app n'expose aucune API réseau (surface d'attaque distante nulle).

Recommandation pragmatique conforme RGPD : **chiffrer le disque du poste**
(BitLocker/FileVault/LUKS) — c'est la mesure qui protège réellement contre le
vol de l'ordinateur — et chiffrer uniquement les **exports manuels** (zip
avec mot de passe) pour le transport de sauvegardes. Si un chiffrement de la
base elle-même est requis en plus, `tauri-plugin-sql` peut être remplacé par
un accès SQLite via `rusqlite` + `sqlcipher` côté Rust (commande exposée en
`#[tauri::command]`) — je peux le faire en session suivante si tu confirmes
que c'est nécessaire pour ton contexte (ex. poste partagé non chiffré).

## 2. Arborescence du projet

```
CJ/
├── index.html
├── package.json
├── tsconfig.json / tsconfig.node.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── .eslintrc.cjs
├── src/
│   ├── main.tsx                 # point d'entrée React
│   ├── App.tsx                  # bascule Cahier journal ↔ Mode Classe
│   ├── index.css                # Tailwind + réglages globaux
│   ├── vite-env.d.ts
│   ├── types/
│   │   └── models.ts             # interfaces TS (Eleve, Sequence, Seance, Creneau, ...)
│   ├── db/
│   │   ├── client.ts              # connexion SQLite unique + génération d'id
│   │   ├── mappers.ts             # conversion lignes SQL ⇄ objets TS (JSON columns)
│   │   └── repositories/
│   │       ├── eleves.ts
│   │       ├── creneaux.ts
│   │       ├── rituels.ts
│   │       ├── notionsSemaine.ts
│   │       └── devoirs.ts
│   ├── stores/
│   │   ├── useCahierJournal.ts    # semaine affichée, créneaux par jour
│   │   └── useEleves.ts
│   ├── components/
│   │   ├── cahier-journal/
│   │   │   ├── CahierJournalDoubleNiveau.tsx   # composant principal (deliverable #4)
│   │   │   ├── VueJournee.tsx      # colonnes GS | CE2 en parallèle
│   │   │   ├── VueSemaine.tsx      # aperçu de la semaine
│   │   │   ├── ColonneNiveau.tsx   # sous-colonnes dirigé / autonomie
│   │   │   ├── CreneauCard.tsx
│   │   │   ├── CreneauForm.tsx     # création de créneau
│   │   │   ├── RituelsPanel.tsx    # date, météo, chaque jour compte, phono, vocabulaire
│   │   │   └── PlanificateurNotions.tsx  # objectifs prioritaires hebdo par niveau
│   │   └── projection/
│   │       ├── TableauCursifProjection.tsx   # Mode Classe plein écran (deliverable #4)
│   │       ├── DateDuJour.tsx
│   │       ├── Minuteur.tsx
│   │       └── projection.css       # @font-face police cursive locale
│   └── assets/
│       └── fonts/
│           └── README.md           # instructions + licences polices cursives FR
└── src-tauri/
    ├── Cargo.toml
    ├── build.rs
    ├── tauri.conf.json              # CSP stricte, pas de plugin réseau
    ├── capabilities/default.json    # permissions minimales (sql, fs, dialog)
    ├── migrations/
    │   └── 0001_init.sql            # schéma SQLite complet (deliverable #3)
    └── src/
        ├── main.rs
        └── lib.rs                   # enregistrement des plugins + migrations
```

**Modules non couverts dans cette session** (structure prête, à développer
ensuite) : éditeur complet de fiches de préparation détachées du cahier
journal, fiches élèves (formulaire), agenda de rendez-vous. Les tables SQL et
types TypeScript correspondants existent déjà (`sequences`, `seances`,
`rendez_vous`, `eleves`) — il reste à écrire les composants d'édition.

## 3. Modèles de données

- **Schéma SQLite** : `src-tauri/migrations/0001_init.sql` — tables `eleves`,
  `sequences`, `seances`, `creneaux`, `rituels`, `notions_semaine`, `devoirs`,
  `rendez_vous`, `parametres`. Contraintes `CHECK` pour les énumérations
  (niveau, type de créneau, statut...), clés étrangères `ON DELETE
  CASCADE`/`SET NULL` cohérentes avec l'usage (supprimer une séquence
  supprime ses séances ; supprimer une séance libère juste le créneau).
- **Interfaces TypeScript** : `src/types/models.ts` — types miroir en
  camelCase, avec types imbriqués (`Responsable[]`, `EtapeDeroulement[]` pour
  le déroulement pas à pas façon fiche Éduscol).
- **Le double niveau** est modélisé par la colonne `creneaux.groupe` :
  `GS_DIRIGE | GS_AUTONOME | CE2_DIRIGE | CE2_AUTONOME | COMMUN`. Un même
  horaire peut avoir jusqu'à 4 créneaux en parallèle (GS dirigé + GS
  autonomie + CE2 dirigé + CE2 autonomie), ce qui correspond à ton
  fonctionnement réel (groupe guidé / groupe autonome par niveau).

## 4. Composants livrés

- **`CahierJournalDoubleNiveau.tsx`** : en-tête avec navigation semaine,
  bascule vue Jour/Semaine, bouton **Mode Classe**. La vue Jour affiche les
  créneaux communs (groupe classe) puis deux colonnes GS/CE2 (chacune
  subdivisée dirigé/autonomie), le panneau de rituels et le planificateur de
  notions prioritaires de la semaine.
- **`TableauCursifProjection.tsx`** (« Mode Classe ») : plein écran
  (API Fullscreen, sortie avec Échap), date du jour en cursive, rituels du
  jour, créneau commun éventuel, deux colonnes GS/CE2 mettant en évidence le
  créneau en cours (calculé à partir de l'heure réelle) avec sa consigne en
  grand, devoirs du jour, minuteur intégré, curseur de taille de police.

## 5. Lancer le projet

```bash
npm install

# Développement (ouvre la fenêtre Tauri avec hot-reload)
npm run tauri:dev

# Build de production (installeur natif dans src-tauri/target/release/bundle/)
npm run tauri:build

# Juste le frontend dans un navigateur (sans SQLite, pour itérer sur l'UI)
npm run dev
```

Prérequis : Node.js ≥ 18, Rust stable (`rustup`), et les dépendances système
Tauri de ton OS (voir la doc officielle Tauri « Prerequisites » selon
Windows/macOS/Linux — WebView2 sur Windows, `webkit2gtk` sur Linux, rien de
plus sur macOS).

`npm run build` (type-check + bundle Vite seul, sans Tauri) a été vérifié en
session : compile sans erreur TypeScript et sans erreur ESLint.

## 6. RGPD / sécurité — récapitulatif

- **Aucune dépendance réseau** : ni plugin HTTP Tauri, ni fetch/XHR dans le
  code frontend, ni CDN (polices et styles embarqués). La CSP de
  `index.html` et de `tauri.conf.json` bloque explicitement tout ce qui
  n'est pas `'self'`.
- **Stockage** : fichier SQLite unique dans le dossier de données applicatif
  de l'utilisateur, jamais synchronisé.
- **Export/Import** : à implémenter dans `src/lib/export-import.ts` (non
  livré cette session) — prévu : export JSON complet ou copie du fichier
  `.db` via `tauri-plugin-dialog` (déjà installé et déclaré dans les
  capacités), pour sauvegarde manuelle sur clé USB par exemple.
- **Données sensibles** : `notes_confidentielles`, PAI/PPRE/PAP et
  allergies sont dans la table `eleves`, jamais dans les tables de
  planification — pense à limiter l'affichage de ces champs dans le futur
  écran « Fiche élève » (masquage par défaut, affichage sur clic).

## 7. Police cursive

Aucun binaire de police n'est inclus (question de licence — voir
`src/assets/fonts/README.md`). Le mécanisme `@font-face` est prêt dans
`src/components/projection/projection.css` ; il suffit de déposer les
fichiers `.woff2`/`.woff` au bon endroit pour que le Mode Classe l'utilise
automatiquement, avec un repli propre sur la police cursive système en
attendant.
