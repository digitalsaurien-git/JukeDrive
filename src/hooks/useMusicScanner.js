import { useState, useCallback, useEffect } from 'react';
import { scanDropboxMusic } from '../services/dropboxService';
import { DROPBOX_CONFIG } from '../config';

const CACHE_KEY = 'jukebox_box_cache';

export const useMusicScanner = (accessToken) => {
    const [isScanning, setIsScanning] = useState(false);
    const [songs, setSongs] = useState([]);
    const [albums, setAlbums] = useState({});
    const [artists, setArtists] = useState({});
    const [error, setError] = useState(null);

    useEffect(() => {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            const parsed = JSON.parse(cached);
            setSongs(parsed.songs || []);
            setAlbums(parsed.albums || {});
            setArtists(parsed.artists || {});
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
            const newArtists = {};

            audioFiles.forEach(file => {
                const parts = file.path_display.split('/');
                
                let artistName = 'Artiste Inconnu';
                let albumName = 'Album Inconnu';

                if (parts.length >= 4) {
                    artistName = parts[parts.length - 3] || 'Artiste Inconnu';
                    albumName = parts[parts.length - 2] || 'Album Inconnu';
                } else if (parts.length === 3) {
                    artistName = parts[parts.length - 2] || 'Artiste Inconnu';
                    albumName = "Titres Isolés";
                }

                // Éviter les noms de dossiers vides
                if (artistName === 'Reference' || artistName === 'Music' || artistName === 'Musique') {
                    artistName = 'Artiste Inconnu';
                }

                const cleanTitle = file.name.replace(/\.[^/.]+$/, "");

                const song = {
                    id: file.path_lower,
                    name: file.name,
                    path: file.path_lower,
                    metadata: {
                        title: cleanTitle,
                        artist: artistName,
                        album: albumName,
                        cover: null
                    }
                };

                newSongs.push(song);

                // Groupement par Album
                if (!newAlbums[albumName]) {
                    newAlbums[albumName] = { songs: [], artist: artistName, cover: null };
                }
                newAlbums[albumName].songs.push(song);

                // Groupement par Artiste
                if (!newArtists[artistName]) {
                    newArtists[artistName] = { albums: {} };
                }
                if (!newArtists[artistName].albums[albumName]) {
                    newArtists[artistName].albums[albumName] = { songs: [], cover: null };
                }
                newArtists[artistName].albums[albumName].songs.push(song);
            });

            setSongs(newSongs);
            setAlbums(newAlbums);
            setArtists(newArtists);
            localStorage.setItem(CACHE_KEY, JSON.stringify({ 
                songs: newSongs, 
                albums: newAlbums,
                artists: newArtists 
            }));
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
