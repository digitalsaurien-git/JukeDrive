import { useState, useCallback, useEffect } from 'react';
import { listFiles, getFileBlob, getFoldersInfo } from '../services/googleDrive';
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
            // 1. Récupération de tous les fichiers audio
            const files = await listFiles();
            
            // 2. Isolation des IDs de dossiers parents (Albums)
            const albumFolderIds = [...new Set(files.map(f => f.parents?.[0]).filter(Boolean))];
            const albumFolders = await getFoldersInfo(albumFolderIds);
            
            // 3. Isolation des IDs de dossiers grand-parents (Artistes)
            const artistFolderIds = [...new Set(Object.values(albumFolders).map(a => a.parents?.[0]).filter(Boolean))];
            const artistFolders = await getFoldersInfo(artistFolderIds);
            
            const newSongs = [];
            const newAlbums = {};

            for (const file of files) {
                const parentId = file.parents?.[0];
                const albumFolder = parentId ? albumFolders[parentId] : null;
                const albumName = albumFolder ? albumFolder.name : 'Unknown Album';
                
                const grandParentId = albumFolder?.parents?.[0];
                const artistFolder = grandParentId ? artistFolders[grandParentId] : null;
                const artistName = artistFolder ? artistFolder.name : 'Unknown Artist';

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
            setError("Erreur d'analyse. " + err.message);
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
