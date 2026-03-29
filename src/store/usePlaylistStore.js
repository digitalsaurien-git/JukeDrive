import { useState, useCallback, useEffect } from 'react';

const PLAYLIST_CACHE_KEY = 'jukedrive_playlists';

export const usePlaylistStore = () => {
    const [playlists, setPlaylists] = useState([]);

    useEffect(() => {
        const cached = localStorage.getItem(PLAYLIST_CACHE_KEY);
        if (cached) {
            setPlaylists(JSON.parse(cached));
        }
    }, []);

    const saveToCache = (newPlaylists) => {
        setPlaylists(newPlaylists);
        localStorage.setItem(PLAYLIST_CACHE_KEY, JSON.stringify(newPlaylists));
    };

    const createPlaylist = useCallback((name) => {
        const newPlaylist = {
            id: Date.now().toString(),
            name,
            songs: [],
            createdAt: new Date().toISOString(),
        };
        saveToCache([...playlists, newPlaylist]);
    }, [playlists]);

    const addToPlaylist = useCallback((playlistId, song) => {
        const newPlaylists = playlists.map(p => {
            if (p.id === playlistId) {
                if (p.songs.some(s => s.id === song.id)) return p;
                return { ...p, songs: [...p.songs, song] };
            }
            return p;
        });
        saveToCache(newPlaylists);
    }, [playlists]);

    const removeFromPlaylist = useCallback((playlistId, songId) => {
        const newPlaylists = playlists.map(p => {
            if (p.id === playlistId) {
                return { ...p, songs: p.songs.filter(s => s.id !== songId) };
            }
            return p;
        });
        saveToCache(newPlaylists);
    }, [playlists]);

    const deletePlaylist = useCallback((playlistId) => {
        saveToCache(playlists.filter(p => p.id !== playlistId));
    }, [playlists]);

    return { playlists, createPlaylist, addToPlaylist, removeFromPlaylist, deletePlaylist };
};
