import React, { useState, useEffect } from 'react';
import './App.css';
import { initGapiClient, initTokenClient, login } from './services/googleDrive';
import { GOOGLE_CONFIG, setClientId } from './config';
import Sidebar from './components/Sidebar';
import MainView from './components/MainView';
import Player from './components/Player';
import { useMusicScanner } from './hooks/useMusicScanner';
import { usePlaylistStore } from './store/usePlaylistStore';

function App() {
  const [isApiLoaded, setIsApiLoaded] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const [currentView, setCurrentView] = useState('home');
  const [playingQueue, setPlayingQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const { isScanning, songs, albums, scan, loadMetadata, error } = useMusicScanner(accessToken);
  const { playlists, createPlaylist, addToPlaylist, removeFromPlaylist, deletePlaylist } = usePlaylistStore();

  useEffect(() => {
    const handleCallback = (token) => {
      console.log("Logged in successfully!");
      setAccessToken(token);
      // Auto-scan on login
      // scan(); 
    };

    const loadScripts = async () => {
       try {
         await initGapiClient();
         initTokenClient(handleCallback);
         setIsApiLoaded(true);
       } catch (err) {
         console.error('Failed to init Google APIs:', err);
       }
    };

    if (GOOGLE_CONFIG.CLIENT_ID) {
      // Small delay to ensure scripts are fully ready
      const timer = setTimeout(loadScripts, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  // When playing queue changes or scanning, try to load metadata for next songs
  useEffect(() => {
    if (accessToken && playingQueue.length > 0 && currentIndex >= 0) {
       const currentSong = playingQueue[currentIndex];
       if (!currentSong.metadata) {
          loadMetadata(currentSong.id).then(meta => {
             // Update the queue with metadata directly
             setPlayingQueue(prev => prev.map((s, i) => i === currentIndex ? { ...s, metadata: meta } : s));
          });
       }
    }
  }, [playingQueue, currentIndex, accessToken, loadMetadata]);

  // When scanning finishes, if we have new songs without metadata, we could optionally preload them
  // For UI simplicity, wait until they click play to load metadate (unless already cached)

  const handlePlayList = (list, startIndex = 0) => {
    setPlayingQueue(list);
    setCurrentIndex(startIndex);
  };

  const currentSong = currentIndex >= 0 && currentIndex < playingQueue.length ? playingQueue[currentIndex] : null;

  const handleNext = () => {
    if (currentIndex < playingQueue.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Loop or stop
      setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (!GOOGLE_CONFIG.CLIENT_ID) {
    return (
      <div className="app-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
         <div className="glass-panel" style={{ padding: '3rem', maxWidth: '500px', width: '100%', textAlign: 'center' }}>
            <h1 style={{ marginBottom: '1rem', color: 'var(--accent-color)' }}>Configuration Initiale</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              Veuillez configurer votre Google Cloud Client ID (OAuth 2.0 Web Client) pour accéder à Drive.
            </p>
            <input 
              type="text" 
              id="clientIdInput"
              placeholder="Ex: 123456789-xxxx.apps.googleusercontent.com" 
              style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.3)', color: 'white', marginBottom: '1rem' }}
            />
            <button 
              className="btn-primary" 
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => {
                const id = document.getElementById('clientIdInput').value;
                if (id) setClientId(id);
              }}
            >
              Enregistrer & Recharger
            </button>
         </div>
      </div>
    );
  }

  if (!accessToken) {
    return (
      <div className="app-container" style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem' }}>
          Juke<span style={{ color: 'var(--accent-color)' }}>Drive</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem' }}>
          Connectez votre dossier Google Drive pour lancer la musique.
        </p>
        <button className="btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.25rem' }} disabled={!isApiLoaded} onClick={login}>
          {isApiLoaded ? 'Se connecter avec Google' : 'Chargement...'}
        </button>
        {error && <div style={{ color: '#ef4444', marginTop: '1rem' }}>{error}</div>}
      </div>
    );
  }

  return (
    <div className="app-container">
      <Sidebar 
        currentView={currentView}
        onViewChange={setCurrentView}
        playlists={playlists}
        onCreatePlaylist={createPlaylist}
        onScan={scan}
        isScanning={isScanning}
        user={accessToken}
      />
      
      <MainView 
        currentView={currentView}
        songs={songs}
        albums={albums}
        playlists={playlists}
        onPlayList={handlePlayList}
        removeFromPlaylist={removeFromPlaylist}
        deletePlaylist={deletePlaylist}
        accessToken={accessToken}
      />

      <Player 
        currentSong={currentSong}
        playlist={playingQueue}
        onNext={handleNext}
        onPrev={handlePrev}
        accessToken={accessToken}
      />
    </div>
  );
}

export default App;
