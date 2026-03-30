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

    // Fonction utilitaire pour grouper les musiques existantes
    const groupMusic = (songList) => {
        const newAlbums = {};
        const newArtists = {};
        
        songList.forEach(song => {
            const artist = song.metadata.artist || 'Artiste Inconnu';
            const album = song.metadata.album || 'Album Inconnu';
            
            if (!newAlbums[album]) {
                newAlbums[album] = { songs: [], artist, cover: null };
            }
            newAlbums[album].songs.push(song);

            if (!newArtists[artist]) {
                newArtists[artist] = { albums: {} };
            }
            if (!newArtists[artist].albums[album]) {
                newArtists[artist].albums[album] = { songs: [], cover: null };
            }
            newArtists[artist].albums[album].songs.push(song);
        });
        return { albums: newAlbums, artists: newArtists };
    };

    useEffect(() => {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            const parsed = JSON.parse(cached);
            let currentSongs = parsed.songs || [];
            let currentAlbums = parsed.albums || {};
            let currentArtists = parsed.artists || {};
            
            // Migration AUTO : si on a des musiques mais pas d'artistes, on regroupe
            if (currentSongs.length > 0 && Object.keys(currentArtists).length === 0) {
                const grouped = groupMusic(currentSongs);
                currentAlbums = grouped.albums;
                currentArtists = grouped.artists;
            }

            setSongs(currentSongs);
            setAlbums(currentAlbums);
            setArtists(currentArtists);
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
            
            audioFiles.forEach(file => {
                // Chemin relatif : on enlève rootPath de path_display
                // Ex: rootPath = /REF/MUSIC, file = /REF/MUSIC/Artist/Album/Song.mp3
                // Relative = Artist/Album/Song.mp3
                let relPath = file.path_display;
                if (rootPath && relPath.toLowerCase().startsWith(rootPath.toLowerCase())) {
                    relPath = relPath.substring(rootPath.length);
                }
                
                // On nettoie les slashes au début (ex: /Artist/Album/Song.mp3 -> Artist/Album/Song.mp3)
                const parts = relPath.split('/').filter(p => p.length > 0);
                
                let artistName = 'Artiste Inconnu';
                let albumName = 'Album Inconnu';

                if (parts.length >= 3) {
                    // Artist/Album/Song.mp3 -> Artist=parts[0], Album=parts[1]
                    artistName = parts[0];
                    albumName = parts[1];
                } else if (parts.length === 2) {
                    // Artist/Song.mp3 -> Artist=parts[0]
                    artistName = parts[0];
                    albumName = "Titres Isolés";
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
            });

            const { albums: finalAlbums, artists: finalArtists } = groupMusic(newSongs);

            setSongs(newSongs);
            setAlbums(finalAlbums);
            setArtists(finalArtists);
            localStorage.setItem(CACHE_KEY, JSON.stringify({ 
                songs: newSongs, 
                albums: finalAlbums,
                artists: finalArtists 
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

    return { isScanning, songs, albums, artists, scan, loadMetadata, error };
};
