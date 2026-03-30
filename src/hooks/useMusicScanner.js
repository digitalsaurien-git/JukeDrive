import { useState, useCallback, useEffect } from 'react';
import { scanMusicTree, getFileBlob } from '../services/googleDrive';
import { parseMetadata } from '../utils/metadata';
import { GOOGLE_CONFIG } from '../config';

const CACHE_KEY = 'jukedrive_music_cache';

export const useMusicScanner = (accessToken) => {
    const [isScanning, setIsScanning] = useState(false);
    const [songs, setSongs] = useState([]);
    const [albums, setAlbums] = useState({});
    const [error, setError] = useState(null);

    // Charger du cache au démarrage
    useEffect(() => {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            const parsed = JSON.parse(cached);
            setSongs(parsed.songs || []);
            setAlbums(parsed.albums || {});
        }
    }, []);

    const scan = useCallback(async () => {
        if (!accessToken) return;
        setIsScanning(true);
        setError(null);
        try {
            // ID du dossier Google Drive contenant la musique (depuis la config locale)
            const rootId = GOOGLE_CONFIG.MUSIC_FOLDER_ID;
            
            if (!rootId) {
                setError("ID du dossier MUSIC non configuré.");
                setIsScanning(false);
                return;
            }

            // Lancement de l'algorithme "Infaillible" (récupère 3 niveaux d'arborescence)
            const { audioFiles, folderLookup } = await scanMusicTree(rootId);
            
            if (audioFiles.length === 0) {
                setError("Aucun fichier audio trouvé dans le dossier fourni.");
                setIsScanning(false);
                return;
            }

            const newSongs = [];
            const newAlbums = {};

            for (const file of audioFiles) {
                const parentId = file.parents?.[0]; // Cet ID correspond soit à l'Album soit à l'Auteur
                const parentFolder = folderLookup[parentId];
                
                let albumName = 'Single / Inconnu';
                let artistName = 'Artiste Inconnu';

                if (parentFolder) {
                    // On vérifie le niveau de profondeur
                    const grandParentId = parentFolder.parents?.[0];
                    const grandParentFolder = folderLookup[grandParentId];
                    
                    if (grandParentFolder) {
                        // Cas classique : MUSIC -> Auteur -> Album -> MP3
                        albumName = parentFolder.name;
                        artistName = grandParentFolder.name;
                    } else {
                        // Cas secondaire : MUSIC -> Auteur -> MP3
                        artistName = parentFolder.name;
                        albumName = artistName + " (Singles)"; 
                    }
                }

                // Nettoyage esthétique du nom de la chanson
                const cleanTitle = file.name.replace(/\.[^/.]+$/, "");

                const meta = {
                    title: cleanTitle,
                    album: albumName,
                    artist: artistName,
                    cover: file.thumbnailLink || null // cover miniature via l'API Google
                };

                const song = {
                    id: file.id,
                    name: file.name,
                    thumbnail: file.thumbnailLink,
                    metadata: meta, 
                };
                newSongs.push(song);

                if (!newAlbums[albumName]) {
                    newAlbums[albumName] = { songs: [], cover: file.thumbnailLink, artist: artistName };
                }
                newAlbums[albumName].songs.push(song);
            }

            setSongs(newSongs);
            setAlbums(newAlbums);
            setIsScanning(false);
            
            // Cache pour rechargement instantané
            localStorage.setItem(CACHE_KEY, JSON.stringify({ songs: newSongs, albums: newAlbums }));
        } catch (err) {
            console.error("Scan error:", err);
            const errMsg = err.result?.error?.message || err.message || JSON.stringify(err);
            setError("Erreur (" + errMsg + ") - Relancez la page et vérifiez l'accès Drive.");
            setIsScanning(false);
        }
    }, [accessToken]);

    // Fonction pour charger les métadonnées d'une chanson spécifique
    const loadMetadata = useCallback(async (songId) => {
        if (!accessToken) return null;
        try {
            const blob = await getFileBlob(songId, accessToken);
            const meta = await parseMetadata(blob);
            
            setSongs(prev => prev.map(s => s.id === songId ? { ...s, metadata: meta } : s));
            
            // Mettre à jour les albums
            setAlbums(prev => {
                const albumName = meta.album || 'Unknown Album';
                const currentAlbum = prev[albumName] || { songs: [], cover: meta.cover, artist: meta.artist };
                if (!currentAlbum.songs.some(s => s.id === songId)) {
                    return {
                        ...prev,
                        [albumName]: {
                            ...currentAlbum,
                            songs: [...currentAlbum.songs, { id: songId, meta }],
                            cover: currentAlbum.cover || meta.cover,
                        }
                    };
                }
                return prev;
            });

            return meta;
        } catch (err) {
            console.error("Load meta error:", err);
            return null;
        }
    }, [accessToken]);

    return { isScanning, songs, albums, scan, loadMetadata, error };
};
