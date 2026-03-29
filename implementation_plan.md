# Plan d'Amélioration : JukeDrive v1.1

## Analyse des Retours Utilisateurs
1. **Design Cassé (Menu Vertical)** : Le problème visuel décrit et visible sur la capture d'écran est dû à une faute de frappe CSS dans le code React (`flex_direction: 'column'` au lieu de `flexDirection: 'column'`). Les boutons de navigation se superposent et cassent toute l'interface.
2. **Design Général "Très Moche"** : Le design actuel manque de marges respirantes, de contrastes réfléchis dans la sidebar et la page d'albums paraît vide.
3. **Ciblage du Dossier "musique"** : Actuellement, l'application scanne l'intégralité de Google Drive à la recherche du type technique `audio/mpeg`. Si Google a classé vos MP3 légèrement différemment ou si vous avez beaucoup de fichiers, la limite est vite atteinte, donnant l'impression que rien ne remonte. 

## Changements Proposés

### 1. Refonte UI/UX (Design & Composants)

#### [MODIFY] [Sidebar.jsx](file:///c:/Data/Antigravity/projects/jukebox/src/components/Sidebar.jsx)
- Correction du bug `flexDirection`.
- Restructuration des espacements et contrastes pour un design beaucoup plus premium (inspiré de Spotify/Apple Music sur desktop).
- Ajout d'une gestion propre de l'état "Scrollable" pour les playlists afin d'éviter qu'elles n'écrasent le reste.

#### [MODIFY] [MainView.jsx](file:///c:/Data/Antigravity/projects/jukebox/src/components/MainView.jsx)
- Amélioration de la présentation de l'écran d'accueil avec une grille plus "Biophilic" et des placeholders esthétiques si aucune pochette n'est trouvée.

### 2. Logique de Scan du Dossier "musique"

#### [MODIFY] [googleDrive.js](file:///c:/Data/Antigravity/projects/jukebox/src/services/googleDrive.js)
- Ajout d'une fonction `findMusicFolder(folderName)` pour rechercher spécifiquement le dossier (ex: "musique").
- Modification de la fonction `listFiles` pour qu'elle cible uniquement les fichiers audio contenus **dans** ce dossier spécifique (soit via le nom du dossier, soit par une recherche de tous les fichiers dont le nom contient `.mp3` ou `.flac`).

#### [MODIFY] [useMusicScanner.js](file:///c:/Data/Antigravity/projects/jukebox/src/hooks/useMusicScanner.js)
- Intégration d'une variable de configuration pour le nom du dossier racine (par défaut "musique" avec un M majuscule ou minuscule).

## Questions Ouvertes

> [!IMPORTANT]
> **Arborescence** : Dans votre dossier "musique", les fichiers `.mp3` sont-ils tous en vrac, ou sont-ils rangés dans des sous-dossiers (ex: `musique/Artiste/Album/chanson.mp3`) ? 
> (*S'il y a des sous-dossiers, la recherche Drive est un peu plus complexe et je vérifierai via le nom au lieu de chercher les "enfants directs" du dossier*).

## Plan de Vérification
### Vérification Visuelle
- Vous verrez instantanément la correction de la barre latérale gauche (alignement vertical correct).
### Vérification Fonctionnelle
- Au clic sur "Scanner le Drive", un ciblage plus large et/ou localisé au dossier "musique" garantira que vos fichiers remontent.
