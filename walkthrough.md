# Présentation de JukeDrive

**JukeDrive** est désormais opérationnel ! L'application web a été construite exactement selon les spécifications (PRD) pour offrir une expérience de bout en bout autour du stockage Google Drive.

## Réalisations Techniques

L'application a été découpée en plusieurs modules React (basés sur Vite) et des services utilitaires :

### 1. Authentification "Zéro Config"
- Une page d'accueil simple accueillera l'utilisateur s'il n'a pas encore configuré de `CLIENT_ID`.
- Il peut coller son ID Google Cloud Console directement dans l'interface (stocké en local via `localStorage`).
- Une fois configuré, un bouton "Se connecter avec Google" gère l'authentification OAuth 2.0 (Google Identity Services) de façon transparente et sécurisée.

### 2. Moteur de Découverte & Métadonnées
- **Scan du Drive** : Un service (`googleDrive.js`) lance une requête ciblée sur les fichiers `.mp3`.
- **Analyse** : Au lancement de la lecture ou lors du scan, la librairie `music-metadata-browser` télécharge le fichier dans un Blob côté client pour lire les tags ID3 (Artiste, Titre, Album, Pochettes).
- **Cache Local** : Les albums extraits sont mis en cache dans le navigateur.

### 3. Interface Utilisateur (Biophilic/Glassmorphism)
- **Sidebar** : Navigation rapide entre l'Accueil, les Albums, et les Playlists générées par l'utilisateur.
- **Grille d'Albums** : Les albums sont agrégés dynamiquement, affichant leur couverture avec un effet de survol "Play".
- **Barre de Recherche** : Permet de filtrer en temps réel tous les albums et artistes depuis la vue "Albums".

### 4. Player Audio & Téléchargement
- **Lecteur Central** : Un lecteur robuste (`Player.jsx`) gère la queue de lecture (Playlists ou Albums complets) avec contrôles Play/Pause, Next/Prev et barre de progression.
- **Téléchargement Zippé** : La librairie `jszip` intercepte l'ordre de téléchargement, compresse les fichiers mp3 de l'album ciblé, et déclenche le téléchargement du .zip sur l'ordinateur via `file-saver`.

## Prochaines Étapes pour Validation

Vérifiez l'application !
Puisque vous avez lancé le serveur (avec `npm run dev`), vous pouvez vous rendre sur l'interface (généralement `http://localhost:5173` ou ce qui est affiché dans votre terminal).

### 🛠️ Pour démarrer :
1. Renseignez votre `CLIENT_ID` Google Cloud dans l'écran de configuration initial. (Assurez-vous que l'URI de développement soit dans les URI autorisées de votre console Google).
2. Cliquez sur **Se connecter avec Google** et autorisez l'application.
3. Cliquez sur le bouton "Scanner le Drive" dans le menu de gauche pour initialiser la bibliothèque.

> [!TIP]
> Si rien ne remonte, vérifiez que le compte Google Drive connecté contient bien des musiques `.mp3` à la racine ou dans son arborescence (la recherche est globale par type MIME `audio/mpeg`).

L'application est 100% côté client, aucune donnée ne transite vers un autre serveur que Google.
