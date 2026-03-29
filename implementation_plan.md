# Plan d'Amélioration : JukeDrive v1.2

## 1. Analyse des problèmes actuels
- **Chevauchement d'Interface** : La barre du lecteur (`player-bar`) chevauche le menu de gauche (`sidebar`) en bas de l'écran car elle est centrée de manière absolue. Cela cache le bouton de statut de connexion.
- **Scan Silencieux ("Ne fait rien")** : Le scan de tous les fichiers audio du Drive retourne probablement 0 fichier ou échoue sans prévenir (les messages d'erreur ne sont pas affichés dans l'interface principale). De plus, si vos fichiers n'ont pas un MIME type standard `audio/`, la requête globale de Google Drive les ignorera.

## 2. Changements Proposés

### A. Correction UI (Sidebar & Player)
#### [MODIFY] [Sidebar.jsx](file:///c:/Data/Antigravity/projects/jukebox/src/components/Sidebar.jsx)
- Ajout d'un `paddingBottom: '120px'` (ou ajustement de la structure) sur la section basse du menu pour que le bouton "Connecté" et le bouton de Scan restent accessibles au-dessus de la barre de lecture.
- Affichage clair de l'erreur du scanner (s'il y en a une) juste en dessous du bouton "Scanner".

#### [MODIFY] [index.css](file:///c:/Data/Antigravity/projects/jukebox/src/index.css)
- Ajustements sur la largeur du `player-bar` pour s'insérer parfaitement sans gêner la sidebar.

### B. Moteur de Recherche Ciblé (Par ID de Dossier)
Puisque vous avez sagement proposé d'utiliser l'ID du dossier "MUSIC", c'est la solution la plus robuste pour contourner les limitations de recherche de Google.

#### [MODIFY] [App.jsx](file:///c:/Data/Antigravity/projects/jukebox/src/App.jsx)
- Ajout d'un deuxième champ dans la page de configuration initiale : "ID du dossier MUSIC (Optionnel)". Il sera sauvegardé dans le navigateur.

#### [MODIFY] [googleDrive.js](file:///c:/Data/Antigravity/projects/jukebox/src/services/googleDrive.js)
- Création d'une fonction `scanFolderTree(rootFolderId)` qui fera exactement :
  1. Trouver tous les dossiers "Auteurs" dans "MUSIC".
  2. Trouver tous les dossiers "Albums" dans ces Auteurs.
  3. Trouver toutes les chansons dans ces Albums.
- Cette méthode est 100% infaillible car elle ne dépend pas de l'indexation de Google sur les types de fichiers (elle prendra tout ce qui est dedans, de manière structurée !).

#### [MODIFY] [useMusicScanner.js](file:///c:/Data/Antigravity/projects/jukebox/src/hooks/useMusicScanner.js)
- Remplacement du scan global aveugle par ce scan ciblé sur votre ID de dossier s'il a été renseigné.

## 3. Demande d'Action

> [!IMPORTANT]
> Pour vérifier que je peux utiliser cette méthode à 3 niveaux, confirmez-moi que l'ID que vous me fournirez est bien celui du dossier **"MUSIC"**, et que sa structure stricte est toujours :
> **MUSIC** ➔ **Dossier d'Auteur** ➔ **Dossier d'Album** ➔ **Fichiers Audio**
> 
> *Si vous avez des chansons directement en vrac dans le dossier d'un auteur sans passer par un dossier d'album, dites-le moi pour que je prévoie ce cas de figure.*

Je peux implémenter ces deux corrections (Visuel + Scan par ID) dès que vous me validez ce comportement !
