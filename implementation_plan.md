# Plan d'implémentation - JukeDrive

**JukeDrive** est une application web Jukebox premium permettant de transformer un dossier Google Drive en une bibliothèque musicale interactive.

## Points d'attention & Choix Techniques

> [!IMPORTANT]
> - **Authentification Google** : L'application nécessite un `CLIENT_ID` Google Cloud. Pour une expérience "Zéro Config", je vais implémenter une interface permettant à l'utilisateur de saisir son ID au premier lancement (sauvegardé en local).
> - **Performances** : L'extraction des métadonnées ID3 (pochettes, artistes) nécessite le téléchargement partiel/total des fichiers. Je vais mettre en place un système de cache dans le `localStorage` pour éviter de re-scanner les fichiers à chaque visite.
> - **Téléchargement** : Le téléchargement multiple sera géré via `jszip` pour générer une archive .zip à la volée côté client.

## Architecture Proposée

- **Frontend** : React 18 (Vite) + Lucide Icons.
- **Styles** : CSS natif avec un thème "Dark Glassmorphism" adapté au bureau.
- **APIs** : Google Drive API v3 + Google Identity Services (GIS).
- **Bibliothèques Clés** :
  - `music-metadata-browser` : Extraction des tags ID3 (Artiste, Album, Cover).
  - `jszip` : Création des archives de téléchargement.
  - `file-saver` : Déclenchement des téléchargements.

---

## Étapes de réalisation

### 1. Initialisation du Projet
- Structure de base dans le dossier `jukebox`.
- Configuration de Vite et installation des dépendances.

### 2. Module d'Authentification & Google Drive
- `App.jsx` : Intégration de Google Identity Services.
- `services/googleDrive.js` : Service pour lister les fichiers `.mp3` et récupérer les contenus.

### 3. Moteur de Scan & Métadonnées
- `hooks/useMusicScanner.js` : Hook pour parcourir le Drive, extraire les métadonnées via `music-metadata-browser` et gérer le cache local.
- `utils/metadata.js` : Helper pour l'extraction propre des tags.

### 4. Interface Jukebox (Layout)
- `components/Sidebar.jsx` : Navigation Artistes / Albums / Playlists.
- `components/MainView.jsx` : Grille d'albums et liste de chansons.
- `components/Player.jsx` : Lecteur central avec contrôles évolués.

### 5. Gestion des Playlists
- `store/usePlaylistStore.js` : Gestion de l'état des playlists (création, ajout, suppression).
- Persistance des playlists sur Google Drive (fichier `jukedrive_playlists.json`) ou LocalStorage selon la préférence de stabilité.

### 6. Module de Téléchargement
- `services/downloader.js` : Logique de zipping via `jszip` pour les albums complets ou sélections.

### 7. Polissage UI/UX
- Animations de transition fluides.
- Mode "Squelette" pendant le chargement des métadonnées.
- Gestion des erreurs (Drive non connecté, dossier vide).

---

## Questions Ouvertes

> [!CAUTION]
> **Client ID Google** : Possédez-vous déjà un `CLIENT_ID` Google Cloud Console ? Si non, je peux vous guider pour en créer un ou mettre en place un mode "Demo" avec des données simulées pour que vous puissiez tester l'interface immédiatement.

## Plan de Vérification

### Tests Automatisés / Web
- Utilisation de l'outil `browser` pour vérifier le rendu visuel.
- Simulation de la connexion (si Client ID fourni).

### Vérification Manuelle
- Lancer le lecteur -> Vérifier le chargement du bouton.
- Rechercher un artiste -> Vérifier le filtrage.
- Cliquer sur un album -> Vérifier que la lecture démarre.
- Télécharger -> Vérifier la réception du fichier.
