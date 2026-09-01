import { useState, useCallback, useEffect } from 'react';
import { scanDropboxMusic } from '../services/dropboxService';
import { DROPBOX_CONFIG } from '../config';

const CACHE_KEY = 'jukedrive_music_cache_v2';
const LEGACY_CACHE_KEY = 'jukebox_box_cache';

const compactSongs = (songList) => ({
    version: 2,
    tracks: songList.map(song => [
        song.path,
        song.name,
        song.metadata.title,
        song.metadata.artist,
        song.metadata.album
    ])
});

const expandSongs = (cache) => {
    if (cache?.version === 2 && Array.isArray(cache.tracks)) {
        return cache.tracks.map(([path, name, title, artist, album]) => ({
            id: path,
            name,
            path,
            metadata: {
                title,
                artist,
                album,
                cover: null
            }
        }));
    }

    return Array.isArray(cache?.songs) ? cache.songs : [];
};

const saveCompactCache = (songList) => {
    try {
        localStorage.removeItem(LEGACY_CACHE_KEY);
        localStorage.setItem(CACHE_KEY, JSON.stringify(compactSongs(songList)));
        return true;
    } catch (error) {
        console.warn('Cache musical non enregistré : stockage navigateur insuffisant.', error);
        try {
            localStorage.removeItem(CACHE_KEY);
        } catch {
            // Le scan reste utilisable même si le stockage local est indisponible.
        }
        return false;
    }
};

export const useMusicScanner = (accessToken) => {
    const [isScanning, setIsScanning] = useState(false);
    const [songs, setSongs] = useState([]);
    const [albums, setAlbums] = useState({});
    const [artists, setArtists] = useState({});
    const [error, setError] = useState(null);

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
        try {
            const compactCache = localStorage.getItem(CACHE_KEY);
            const legacyCache = localStorage.getItem(LEGACY_CACHE_KEY);
            const cached = compactCache || legacyCache;

            if (!cached) return;

            const currentSongs = expandSongs(JSON.parse(cached));
            const grouped = groupMusic(currentSongs);

            setSongs(currentSongs);
            setAlbums(grouped.albums);
            setArtists(grouped.artists);

            if (!compactCache && legacyCache) {
                saveCompactCache(currentSongs);
            }
        } catch (cacheError) {
            console.warn('Cache musical invalide, il sera recréé au prochain scan.', cacheError);
            localStorage.removeItem(CACHE_KEY);
            localStorage.removeItem(LEGACY_CACHE_KEY);
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
                setError('Aucun fichier audio trouvé dans votre Dropbox.');
                return;
            }

            const newSongs = audioFiles.map(file => {
                let relPath = file.path_display;

                if (rootPath && relPath.toLowerCase().startsWith(rootPath.toLowerCase())) {
                    relPath = relPath.substring(rootPath.length);
                }

                const parts = relPath.split('/').filter(part => part.length > 0);
                let artistName = 'Artiste Inconnu';
                let albumName = 'Album Inconnu';

                if (parts.length >= 3) {
                    artistName = parts[0];
                    albumName = parts[1];
                } else if (parts.length === 2) {
                    artistName = parts[0];
                    albumName = 'Titres Isolés';
                }

                return {
                    id: file.path_lower,
                    name: file.name,
                    path: file.path_lower,
                    metadata: {
                        title: file.name.replace(/\.[^/.]+$/, ''),
                        artist: artistName,
                        album: albumName,
                        cover: null
                    }
                };
            });

            const grouped = groupMusic(newSongs);

            setSongs(newSongs);
            setAlbums(grouped.albums);
            setArtists(grouped.artists);
            saveCompactCache(newSongs);
        } catch (scanError) {
            console.error('Scan error details:', scanError);
            setError(`Erreur Scan : ${scanError.message || 'Vérifiez vos permissions Dropbox'}`);
        } finally {
            setIsScanning(false);
        }
    }, [accessToken]);

    const loadMetadata = useCallback(async () => null, []);

    return { isScanning, songs, albums, artists, scan, loadMetadata, error };
};
