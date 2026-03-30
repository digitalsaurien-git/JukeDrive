# Plan d'Amélioration : JukeDrive v1.2 (Correctif Auth inclus)

## 1. Analyse des problèmes actuels
- **Erreur Google OAuth (redirect_uri_mismatch)** : Lorsque l'application est déployée sur Vercel (`juke-drive.vercel.app`), Google rejette la demande car l'URL de l'application n'est pas autorisée dans votre console Google Cloud.
- **Chevauchement d'Interface** : La barre du lecteur (`player-bar`) chevauche le menu de gauche (`sidebar`) en bas de l'écran car elle est centrée de manière absolue. Cela cache le bouton de statut de connexion.
- **Scan Silencieux ("Ne fait rien")** : Le scan de tous les fichiers audio du Drive retourne probablement 0 fichier ou échoue sans prévenir. Le scan est basé sur l'indexation Google qui peut être lente ou incomplète pour les fichiers audio.

## 2. Changements Proposés

### A. Résolution de l'erreur "redirect_uri_mismatch"
Cette correction doit être faite dans votre **Console Google Cloud**, car c'est une sécurité côté Google.

> [!IMPORTANT]
> **Action requise de votre part :**
> 1. Allez sur la [Console Google Cloud](https://console.cloud.google.com/apis/credentials).
> 2. Cliquez sur votre **Identifiant Client OAuth 2.0** que vous utilisez pour JukeDrive.
> 3. Dans la section **Origines JavaScript autorisées**, ajoutez : `https://juke-drive.vercel.app`
> 4. (Par sécurité) Dans la section **URI de redirection autorisés**, ajoutez aussi : `https://juke-drive.vercel.app`
> 5. Enregistrez et attendez 5 à 10 minutes que Google mette à jour ses serveurs.

### B. Correction UI (Sidebar & Player)
#### [MODIFY] [Sidebar.jsx](file:///c:/Data/Antigravity/projects/jukebox/src/components/Sidebar.jsx)
- Ajout d'un `paddingBottom: '120px'` sur la sidebar pour que le bouton "Connecté" reste visible au-dessus du lecteur.
- Affichage de l'erreur du scanner si le token expire ou si la recherche échoue.

#### [MODIFY] [index.css](file:///c:/Data/Antigravity/projects/jukebox/src/index.css)
- Ajustements pour que le `player-bar` ne recouvre pas les contrôles essentiels.

### C. Moteur de Recherche "Scan Profond" (Arborescence MUSIC)
#### [MODIFY] [googleDrive.js](file:///c:/Data/Antigravity/projects/jukebox/src/services/googleDrive.js)
- Implémentation du `scanMusicTree(rootId)` qui parcourt récursivement : **MUSIC > Artiste > Album > Chansons**.
- Cela garantit de trouver TOUS vos fichiers, même si Google ne les a pas encore indexés comme "audio".

## 3. Questions Ouvertes

- **Structure des dossiers** : Me confirmez-vous que vos musiques sont bien rangées selon `MUSIC / Artiste / Album / Chanson.mp3` ? Si oui, le nouveau scanner sera parfait.
- **ID du dossier** : Je vais ajouter un champ dans la page de config pour que vous puissiez coller l'ID de votre dossier "MUSIC".

---

Je peux commencer par appliquer les corrections de code (UI + Scanner) pendant que vous mettez à jour votre console Google Cloud. Voulez-vous que je procède ?
