# Tâches JukeDrive - Jukebox Web App

- [x] **Initialisation du Projet**
    - [x] Création du projet Vite (React) dans `./jukebox`
    - [x] Installation des dépendances (`lucide-react`, `music-metadata-browser`, `jszip`, `file-saver`)
- [x] **Authentification & Google API**
    - [x] Ajout du script GSI dans `index.html`
    - [x] Implémentation du service d'authentification OAuth 2.0
    - [x] Service `googleDrive.js` pour lister et lire les fichiers
- [x] **Navigation & Métadonnées**
    - [x] Hook `useMusicScanner` pour le scan et le cache local des tags ID3
    - [x] Vue Grille des Albums avec pochettes
    - [x] Barre de recherche interactive (Artiste / Album / Titre)
- [x] **Lecteur Audio**
    - [x] Barre de lecture centrale avec contrôleurs de base
    - [x] Gestion de la file d'attente (Playlists)
- [x] **Gestion des Playlists**
    - [x] Création, édition et suppression de playlists
    - [x] Persistance locale (LocalStorage)
- [x] **Module de Téléchargement**
    - [x] Fonction de zipping pour les albums entiers
- [x] **Polissage UI**
    - [x] Thème Dark Glassmorphism
    - [x] Gestion des états de chargement et erreurs

