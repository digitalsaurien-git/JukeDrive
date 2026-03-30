# Plan de Correction : Authentification PKCE (Dropbox) 🔐

Dropbox rejette l'ancienne méthode de connexion (mode "Implicit" / Token direct). Nous devons passer à la méthode **PKCE** (plus sécurisée et obligatoire pour les nouvelles apps).

## Proposed Changes

### Mise à jour du Service Dropbox
#### [MODIFY] [dropboxService.js](file:///c:/Data/Antigravity/projects/jukebox/src/services/dropboxService.js)
- **getAuthUrl** : Changement du `response_type` vers `code`. Activation du mode PKCE qui génère un "code verifier" sécurisé.
- **handleAuthCallback** : L'URL ne contiendra plus le jeton directement, mais un code temporaire. Nous ajouterons une étape d'échange (Token Exchange) pour obtenir le jeton final.

### Mise à jour de l'Interface
#### [MODIFY] [App.jsx](file:///c:/Data/Antigravity/projects/jukebox/src/App.jsx)
- Adaptation du `useEffect` de démarrage pour gérer l'échange de jeton asynchrone (await).

## Verification Plan

### Manual Verification
1.  Cliquer sur "Se connecter avec Dropbox".
2.  Dropbox devrait maintenant afficher la page de demande d'autorisation au lieu de l'erreur `invalid_response_type`.
3.  Après acceptation, le retour sur l'app doit synchroniser les musiques.

---
Une fois validé, je déploie cette correction immédiatement !
