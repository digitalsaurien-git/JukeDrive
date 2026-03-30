import { useState, useCallback, useEffect } from 'react';
import { scanDropboxMusic } from '../services/dropboxService';
import { DROPBOX_CONFIG } from '../config';

const CACHE_KEY = 'jukebox_box_cache';

export const useMusicScanner = (accessToken) => {
    const [isScanning, setIsScanning] = useState(false);
    const [songs, setSongs] = useState([]);
    const [albums, setAlbums] = useState({});
    const [error, setError] = useState(null);

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
            const rootPath = DROPBOX_CONFIG.ROOT_PATH || '';
            const audioFiles = await scanDropboxMusic(rootPath);
            
            if (audioFiles.length === 0) {
                setError("Aucun fichier audio trouvé dans votre Dropbox.");
                setIsScanning(false);
                return;
            }

            const newSongs = [];
            const newAlbums = {};

            audioFiles.forEach(file => {
                // Dropbox donne le chemin complet : /MUSIC/Artist/Album/Song.mp3
                const parts = file.path_display.split('/');
                // On essaie de deviner Artiste / Album selon la profondeur
                // Si /MUSIC/Artist/Album/Song.mp3 -> parts est ["", "MUSIC", "Artist", "Album", "Song.mp3"]
                
                let artistName = 'Artiste Inconnu';
                let albumName = 'Album Inconnu';

                if (parts.length >= 4) {
                    artistName = parts[parts.length - 3];
                    albumName = parts[parts.length - 2];
                } else if (parts.length === 3) {
                    artistName = parts[parts.length - 2];
                    albumName = artistName + " (Singles)";
                }

                const cleanTitle = file.name.replace(/\.[^/.]+$/, "");

                const song = {
                    id: file.path_lower, // Le chemin est l'ID unique chez Dropbox
                    name: file.name,
                    path: file.path_lower,
                    metadata: {
                        title: cleanTitle,
                        artist: artistName,
                        album: albumName,
                        cover: null // Le SDK Dropbox ne donne pas de miniature facilement sans appel extra
                    }
                };

                newSongs.push(song);

                if (!newAlbums[albumName]) {
                    newAlbums[albumName] = { songs: [], artist: artistName, cover: null };
                }
                newAlbums[albumName].songs.push(song);
            });

            setSongs(newSongs);
            setAlbums(newAlbums);
            localStorage.setItem(CACHE_KEY, JSON.stringify({ songs: newSongs, albums: newAlbums }));
            setIsScanning(false);
        } catch (err) {
            console.error("Scan error details:", err);
            setError(`Erreur Scan : ${err.message || "Vérifiez vos permissions Dropbox"}`);
            setIsScanning(false);
        }
    }, [accessToken]);

    // Dropbox charge les métadonnées différemment, on verra ça plus tard si besoin
    const loadMetadata = useCallback(async (songId) => {
        return null;
    }, []);

    return { isScanning, songs, albums, scan, loadMetadata, error };
};
