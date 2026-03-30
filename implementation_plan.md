# Plan de Migration : JukeBox-Box (Dropbox Edition) 📦

Ce plan vise à abandonner les contraintes d'authentification de Google Drive au profit de votre compte Dropbox 2 To, offrant plus de stabilité et de stockage pour vos MP3.

## Étape PRÉALABLE (Action Requise de votre part)
Pour que l'application puisse parler à votre Dropbox, vous devez enregistrer une "App" :

1.  Allez sur la [Console Developer Dropbox](https://www.dropbox.com/developers/apps/create).
2.  Choisissez **"Scoped Access"**.
3.  Type d'accès : **"Full Dropbox"** (recommandé pour votre structure /MUSIC).
4.  Nommez votre application (ex: "MonJukeBox_Mog") et créez-la.
5.  Dans l'onglet **Permissions**, cochez : `files.metadata.read` et `files.content.read`. **Cliquez sur "Submit"** en bas.
6.  Dans l'onglet **Settings**, sous "Redirect URIs", ajoutez : `https://juke-drive.vercel.app` (si vous testez sur Vercel) et `http://localhost:5173` (pour le développement).
7.  Récupérez votre **"App key"** (Identifiant client).

## Proposed Changes

### Configuration & Dépendances
#### [MODIFY] [package.json](file:///c:/Data/Antigravity/projects/jukebox/package.json)
- Ajout de la bibliothèque `dropbox`.

#### [MODIFY] [config.js](file:///c:/Data/Antigravity/projects/jukebox/src/config.js)
- Remplacement du Client ID Google par le `DROPBOX_APP_KEY`.
- Stockage d'un `DROPBOX_ACCESS_TOKEN` dans le localStorage après connexion.

#### [NEW] [dropboxService.js](file:///c:/Data/Antigravity/projects/jukebox/src/services/dropboxService.js)
- Implémentation de `loginDropbox()` (OAuth2 avec PKCE).
- Implémentation du scanner récursif `scanDropboxMusic(rootPath)`.
- Implémentation de `getStreamUrl(path)` pour générer des liens `temporaryLink` (valides 4h).

### Logique Applicative
#### [MODIFY] [App.jsx](file:///c:/Data/Antigravity/projects/jukebox/src/App.jsx)
- Changement de l'interface de connexion pour Dropbox.
- Mise à jour du flux de "Callback" après authentification.

#### [MODIFY] [useMusicScanner.js](file:///c:/Data/Antigravity/projects/jukebox/src/hooks/useMusicScanner.js)
- Remplacement des appels à `googleDrive` par `dropboxService`.
- Adaptation du parsing de l'arborescence (Dropbox utilise des chemins `/Mon/Chemin/Musique.mp3`).

#### [MODIFY] [Player.jsx](file:///c:/Data/Antigravity/projects/jukebox/src/components/Player.jsx)
- Récupération du lien de streaming Dropbox avant de lancer la lecture d'une nouvelle chanson.

## Questions Ouvertes

> [!IMPORTANT]
> - **Chemin Racine** : Souhaitez-vous que le scanner commence par défaut dans un dossier spécifique (ex: `/MUSIC`) ou qu'il scanne tout votre Dropbox ?
> - **Connexion** : Préférez-vous une connexion par "Pop-up" ou par "Redirection" ? (La redirection est plus robuste, mais le pop-up est plus fluide).

---

Une fois que vous me validez ce plan et que vous avez votre **App Key**, je lance la transformation !
