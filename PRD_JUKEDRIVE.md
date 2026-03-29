# PRD (Google Antigravity) — JukeDrive

## 1) Mission (1 phrase)
Créer une application web de jukebox connectée à Google Drive pour permettre à un utilisateur non technique d’écouter, organiser et télécharger facilement sa musique stockée au format MP3.

## 2) Ce que je dois voir (resultat concret a l'ecran)
- Un écran d’accueil avec un gros bouton “Lancer le lecteur” 
- Une barre de recherche pour filtrer par album, artiste ou chanson
- Une vue liste (ou tuiles) des albums disponibles, affichant pochettes et noms
- Un bouton ou menu de création/modification de playlists (ajouter/supprimer des chansons)
- Un lecteur audio central avec commandes : play, pause, piste suivante/précédente, avance/retour rapide
- Un bouton “Télécharger l’album” sur chaque album pour télécharger le zip/mp3s sur l’ordinateur
- Un menu latéral ou un onglet “Playlists” pour accéder/lancer/modifier rapidement des playlists sauvegardées
- Message d’erreur clair si Google Drive n’est pas connecté ou dossier vide

**3 interactions utilisateur clés :**
- Sélectionner un album, un artiste ou une playlist pour l’écouter immédiatement
- Créer, renommer, modifier ou supprimer une playlist directement depuis l’interface
- Télécharger un ou plusieurs albums (ou playlists) au format MP3 localement

## 3) Perimetre (IN / OUT)
**IN** (livré maintenant) :
- Accès et lecture de fichiers MP3 depuis Google Drive (dans un répertoire désigné)
- Navigation par albums/artistes/playlists
- Création, édition et suppression de playlists
- Interface simple et design, adaptée au bureau
- Fonction “télécharger” pour récupérer un album ou une playlist
- Contrôles de lecture de base (lecture, pause, piste suivante/précédente)
- Recherche rapide par artiste, album ou chanson

**OUT** (exclu / plus tard) :
- Lecture sur mobile/tablette (v1 limitée navigateur desktop)
- Streaming multi-utilisateur, partage de playlists
- Synchronisation automatique avec d’autres services (Spotify, Apple Music…)
- Éditeur de métadonnées avancé (tags, pochettes…)
- Analyse intelligente du BPM ou recommandations personnalisées (v2+)
- Mode hors-ligne (hors téléchargement manuel)

## 4) Utilisateurs & contexte
- Utilisateur unique, non technique, utilisant principalement un ordinateur de bureau pendant le travail
- Usage quotidien ou fréquent (>3x/semaine)
- Objectif : écouter facilement sa propre musique, organiser par albums/playlists, télécharger/emmener des morceaux

## 5) Donnees / contenu
- Fichiers MP3 stockés sur Google Drive (dans un dossier “Musique” structuré par artistes/albums)
- Playlists : liste ordonnée de fichiers MP3 (mémorisées sur Drive sous forme de JSON ou spreadsheet simple)
- Métadonnées lues des fichiers (tags ID3 : artiste, titre, pochette si dispo)
- Historique simple de lecture (en local, pour la session)

## 6) Regles de qualite (non-negociables)
**DO :**
- Interface ultra-simple, aucune action cachée, boutons lisibles et accessibles
- Zéro configuration technique pour l’utilisateur final
- Accès sécurisé aux fichiers Google Drive (OAuth, consentement clair)
- Temps de chargement initial < 5 sec pour l’interface et les listes
- Modification de playlists en 2 clics maximum

**DON’T :**
- Ne jamais altérer ou déplacer les fichiers source sur Google Drive sans demande explicite
- Ne pas afficher d’options techniques (codec, bitrate…)
- Ne pas proposer de partage ou collaboration multi-comptes (usage personnel uniquement)

## 7) Decisions techniques
- Application web responsive, optimisée desktop (ReactJS ou équivalent simple)
- Utilisation de l’API officielle Google Drive pour lister/streamer/télécharger les MP3
- Authentification OAuth Google Drive unique
- Stockage local temporaire (localStorage/browser DB) pour l’état utilisateur et historique session
- Layout principal en 2 colonnes : navigation à gauche (albums/artistes/playlists), lecteur central et contenu à droite
- Conversion/zip des fichiers en téléchargement côté client via JS (si possible)

## 8) Plan de mission (etapes en langage humain)
1. **Connexion à Google Drive**  
   *Preuve :* Page d’accueil, bouton “Se connecter à Google Drive” fonctionne  
2. **Scan & affichage des albums/artistes**  
   *Preuve :* Liste des albums/artistes avec pochettes/noms correctement extraits du répertoire  
3. **Lecteur audio fonctionnel**  
   *Preuve :* L’utilisateur peut lancer la lecture d’un album/playlist, voir les contrôles play/pause, changer de piste  
4. **Création et édition de playlists**  
   *Preuve :* Ajout/suppression de chansons dans une playlist, sauvegarde persistée  
5. **Recherche, filtres et sélection rapide**  
   *Preuve :* Barre de recherche filtre dynamiquement les albums/artistes/playlists  
6. **Fonction de téléchargement**  
   *Preuve :* Bouton “Télécharger l’album” fonctionne, récupérer les MP3 sur le poste  
7. **Design simple, navigation intuitive**  
   *Preuve :* Utilisateur novice trouve toutes les actions en 15 secondes sans aide

## 9) Preuves attendues (pour valider sans technique)
- Captures d’écran des pages principales (accueil, lecteur, playlists, pop-up de téléchargement)
- Vidéo/walkthrough montrant : connexion, sélection d’album, lecture, création d’une playlist, téléchargement
- Guide rapide “1 minute” pour réaliser chaque action clé (écouter un album, créer une playlist, télécharger un album)

## 10) Checklist de validation (pass/fail)
- [ ] L’écran d’accueil charge en moins de 5 secondes
- [ ] L’utilisateur accède à Google Drive en 1 clic sans configuration manuelle
- [ ] La liste d’albums s’affiche avec pochettes et noms corrects
- [ ] La barre de recherche filtre instantanément la liste
- [ ] Le lecteur permet play/pause, piste suivante/précédente dès la page principale
- [ ] Sélectionner un album lance immédiatement la lecture de la première chanson
- [ ] Créer/sauvegarder une nouvelle playlist prend moins de 30 sec
- [ ] Il est possible d’ajouter/enlever des chansons d’une playlist en 2 clics
- [ ] Le bouton “Télécharger” d’un album/playlist fonctionne et récupère les fichiers
- [ ] Aucun fichier n’est modifié/supprimé sur Drive sans action explicite
- [ ] Les erreurs de connexion ou dossier vide sont gérées avec un message clair
- [ ] Toutes les fonctionnalités sont accessibles sur la même page ou via un menu simple
