# Tâches JukeDrive v1.1 - Refonte UI et Recherche de Fichiers

- [x] **Interface & Design Premium**
    - [x] Corriger le bug CSS (`flex_direction`) dans `Sidebar.jsx`.
    - [x] Améliorer l'espacement, les couleurs et le style de `Sidebar.jsx`.
    - [x] Refondre `MainView.jsx` pour un design chaleureux et aéré (cartes albums mieux dimensionnées, page d'accueil enrichie).
    - [x] Ajuster le fichier global `index.css`.
- [x] **Moteur de Recherche Google Drive (Dossier MUSIC)**
    - [x] Modifier `googleDrive.js` pour rechercher le dossier principal (ex: `name = 'MUSIC' or name = 'musique'`).
    - [x] Implémenter une logique de récupération des fichiers audio robustes (changement du mimeType à `mimeType contains 'audio/'` ou ciblage d'extensions).
    - [x] Mettre à jour `useMusicScanner.js` pour tolérer les sous-dossiers et afficher d'éventuels messages d'état de scan.
