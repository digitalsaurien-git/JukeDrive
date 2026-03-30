# Plan de Correction : Build & Sync 🛠️

Le déploiement a échoué car certains fichiers essayaient encore d'appeler l'ancien service Google Drive que j'avais supprimé. De plus, une bibliothèque de métadonnées cause un conflit avec l'outil de build moderne (Vite).

## Proposed Changes

### Correction de la Logique
#### [MODIFY] [downloader.js](file:///c:/Data/Antigravity/projects/jukebox/src/services/downloader.js)
- Suppression de l'import de `googleDrive`.
- Désactivation temporaire de la fonction de téléchargement (ou adaptation pour Dropbox) pour permettre au build de passer.

#### [MODIFY] [metadata.js](file:///c:/Data/Antigravity/projects/jukebox/src/utils/metadata.js)
- Vérification de l'import de `music-metadata-browser`. Si le problème persiste, nous passerons à une méthode plus légère pour la détection des tags.

### Configuration du Build
#### [NEW] [vite.config.js](file:///c:/Data/Antigravity/projects/jukebox/vite.config.js)
- Ajout d'un "polyfill" ou d'une configuration pour gérer les dépendances Node.js (comme `util`) dont certaines bibliothèques ont besoin.

### Synchronisation GitHub
- Je vais forcer une nouvelle synchronisation propre pour m'assurer que les commits apparaissent bien sur votre interface GitHub.

## Verification Plan

### Automated Tests
- `npm run build` doit se terminer sans erreur localement.

---
Je lance les corrections dès que vous me donnez le feu vert !
