import { useState, useCallback, useEffect } from 'react';
import { listFiles, getFileBlob } from '../services/googleDrive';
import { parseMetadata } from '../utils/metadata';

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
            const files = await listFiles();
            const newSongs = [];
            const newAlbums = {};

            // Limiter à 10 fichiers pour le test initial / performance si trop de fichiers
            // Mais pour une version réelle, on pourrait vouloir tout scanner par lots.
            for (const file of files) {
                // Tentative de récupération des métadonnées (énergivore, idéalement on ferait ça en arrière-plan)
                // Pour l'instant, on se base sur le nom du fichier si on veut aller vite,
                // mais le PRD demande les pochettes/artistes.
                
                // Note: Récupérer le blob pour CHAQUE fichier est très lent au début.
                // On va d'abord lister, puis on extraira les métadonnées au fur et à mesure ou pour les fichiers manquants au cache.
                
                const song = {
                    id: file.id,
                    name: file.name,
                    thumbnail: file.thumbnailLink,
                    metadata: null, // Sera rempli plus tard pour économiser la bande passante au scan initial
                };
                newSongs.push(song);
            }

            setSongs(newSongs);
            setIsScanning(false);
            
            // Sauvegarder dans le cache (simplifié)
            localStorage.setItem(CACHE_KEY, JSON.stringify({ songs: newSongs, albums: newAlbums }));
        } catch (err) {
            console.error("Scan error:", err);
            setError(err.message);
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
