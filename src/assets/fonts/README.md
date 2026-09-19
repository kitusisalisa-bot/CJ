# Police cursive scolaire — à installer manuellement

Pour des raisons de licence, aucun fichier de police n'est fourni dans ce dépôt :
je ne peux pas redistribuer un binaire de police sans vérifier ses droits.
L'application est prête à charger une police cursive 100 % locale — il ne reste
qu'à déposer les fichiers ici.

## Polices cursives scolaires françaises à envisager

| Police | Auteur | Licence | Remarque |
|---|---|---|---|
| **Cursive Standard** | Fabien Cuffel | Gratuite pour un usage pédagogique non commercial (voir conditions sur le site de l'auteur avant diffusion) | Très utilisée en école primaire française |
| **Belle Allure** | Fabien Cuffel | Commerciale (licence à acheter) | Référence historique Éducation nationale |
| **Cursive Dumont Maternelle/École** | Danièle Dumont / Hatier | Commerciale | Modèle recommandé dans plusieurs manuels |
| **École (Écriture A/B)** | Ministère / divers éditeurs libres | Variable | Vérifier la licence au cas par cas |

**Avant tout usage dans une classe ou toute distribution de l'application**,
vérifiez la licence exacte auprès de l'auteur/éditeur — certaines polices
« cursive école » sont gratuites uniquement pour un usage personnel.

## Marche à suivre

1. Téléchargez les fichiers `.woff2` (et `.woff` en secours) de la police choisie.
2. Placez-les ici : `src/assets/fonts/cursive-regular.woff2` (+ `.woff`).
3. Le fichier `src/components/projection/projection.css` déclare déjà le
   `@font-face` correspondant (`--font-cursive`) — aucune autre modification
   n'est nécessaire, la police s'applique automatiquement au Mode Classe.
4. Si vous changez le nom de fichier, mettez à jour les chemins `src: url(...)`
   dans `projection.css`.

Aucun de ces fichiers n'est jamais transmis à un serveur : ils sont servis
depuis le bundle de l'application (dossier `dist/` embarqué par Tauri).
