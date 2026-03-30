import React, { useState, useEffect } from 'react';
import './App.css';
import { getAuthUrl, handleAuthCallback, initDropbox } from './services/dropboxService';
import { DROPBOX_CONFIG, setDropboxAppKey, setDropboxRoot } from './config';
import Sidebar from './components/Sidebar';
import MainView from './components/MainView';
import Player from './components/Player';
import { useMusicScanner } from './hooks/useMusicScanner';
import { usePlaylistStore } from './store/usePlaylistStore';

function App() {
  const [accessToken, setAccessToken] = useState(null);
  const [currentView, setCurrentView] = useState('home');
  const [playingQueue, setPlayingQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const { isScanning, songs, albums, scan, loadMetadata, error } = useMusicScanner(accessToken);
  const { playlists, createPlaylist, addToPlaylist, removeFromPlaylist, deletePlaylist } = usePlaylistStore();

  useEffect(() => {
    const token = handleAuthCallback();
    if (token) {
      setAccessToken(token);
      initDropbox(token);
    }
  }, []);

  const handleLogin = async () => {
    if (!DROPBOX_CONFIG.APP_KEY) {
      alert("App Key manquante !");
      return;
    }
    const url = await getAuthUrl(DROPBOX_CONFIG.APP_KEY);
    window.location.href = url;
  };

  const handlePlayList = (list, startIndex = 0) => {
    setPlayingQueue(list);
    setCurrentIndex(startIndex);
  };

  const currentSong = currentIndex >= 0 && currentIndex < playingQueue.length ? playingQueue[currentIndex] : null;

  const handleNext = () => {
    if (currentIndex < playingQueue.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // CONFIGURATION INITIALE
  if (!DROPBOX_CONFIG.APP_KEY) {
    return (
      <div className="app-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
         <div className="glass-panel" style={{ padding: '3rem', maxWidth: '500px', width: '100%', textAlign: 'center' }}>
            <h1 style={{ marginBottom: '1rem', color: 'var(--accent-color)' }}>Config JukeBox-Box</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              Connectez votre Dropbox (2 To d'espace !)
            </p>
            
            <div style={{ textAlign: 'left', marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: '4px' }}>Dropbox App Key :</label>
              <input 
                type="text" 
                id="appKeyInput"
                placeholder="Votre App Key de la console dev" 
                style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.3)', color: 'white', marginTop: '0.25rem' }}
              />
            </div>

            <div style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: '4px' }}>Dossier Musique (Optionnel) :</label>
              <input 
                type="text" 
                id="rootPathInput"
                placeholder="Ex: /MUSIC" 
                style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.3)', color: 'white', marginTop: '0.25rem' }}
              />
            </div>

            <button 
              className="btn-primary" 
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => {
                const key = document.getElementById('appKeyInput').value;
                const path = document.getElementById('rootPathInput').value;
                if (key) setDropboxAppKey(key);
                if (path) setDropboxRoot(path);
              }}
            >
              Enregistrer
            </button>
         </div>
      </div>
    );
  }

  // ÉCRAN DE CONNEXION
  if (!accessToken) {
    return (
      <div className="app-container" style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem' }}>
          JukeBox<span style={{ color: 'var(--accent-color)' }}>-Box</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem' }}>
          Votre bibliothèque Dropbox personnelle.
        </p>
        <button className="btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.25rem' }} onClick={handleLogin}>
          Se connecter avec Dropbox
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
        error={error}
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
        isDropbox={true}
      />

      <Player 
        currentSong={currentSong}
        playlist={playingQueue}
        onNext={handleNext}
        onPrev={handlePrev}
        accessToken={accessToken}
        isDropbox={true}
      />
    </div>
  );
}

export default App;
