import React, { useState, useEffect } from 'react';
import './App.css';
import { getAuthUrl, getImplicitAuthUrl, handleAuthCallback, initDropbox, validateToken } from './services/dropboxService';
import { DROPBOX_CONFIG, setDropboxAppKey, setDropboxRoot } from './config';
import Sidebar from './components/Sidebar';
import MainView from './components/MainView';
import Player from './components/Player';
import { useMusicScanner } from './hooks/useMusicScanner';
import { usePlaylistStore } from './store/usePlaylistStore';

function App() {
  const [accessToken, setAccessToken] = useState(null);
  const [isExpertMode, setIsExpertMode] = useState(false);
  const [manualToken, setManualToken] = useState('');
  const [authError, setAuthError] = useState(null);
  const [logs, setLogs] = useState(["Initialisation..."]);
  const [currentView, setCurrentView] = useState('home');

  const addLog = (msg) => setLogs(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${msg}`]);
  const [playingQueue, setPlayingQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [globalSearch, setGlobalSearch] = useState('');

  const { isScanning, songs, albums, artists, scan, loadMetadata, error } = useMusicScanner(accessToken);
  const { playlists, createPlaylist, addToPlaylist, removeFromPlaylist, deletePlaylist } = usePlaylistStore();

  useEffect(() => {
    const initAuth = async () => {
      const urlInfo = `URL: ${window.location.search ? '?' : ''}${window.location.hash ? '#' : ''} ${window.location.pathname}`;
      addLog(`Diag: ${urlInfo}`);
      
      try {
        const token = await handleAuthCallback();
        if (token) {
          if (window.location.hash || window.location.search) {
             addLog("Token détecté dans l'URL ! Connexion...");
          } else {
             addLog("Token chargé de la session précédente.");
          }
          setAccessToken(token);
          initDropbox(token);
          addLog("Dropbox initialisé.");
        } else {
          addLog("Aucun token trouvé (URL vide).");
        }
      } catch (err) {
        addLog(`ERREUR: ${err.message}`);
        setAuthError(err.message || "Erreur d'authentification");
      }
    };
    initAuth();
  }, []);

  const handleLogin = async () => {
    setAuthError(null);
    addLog("Lancement OAuth standard (Code)...");
    if (!DROPBOX_CONFIG.APP_KEY) {
      alert("App Key manquante !");
      return;
    }
    try {
      const url = await getAuthUrl(DROPBOX_CONFIG.APP_KEY);
      addLog("Redirection vers Dropbox...");
      window.location.href = url;
    } catch (err) {
      addLog("Impossible de générer l'URL d'auth.");
      setAuthError("Impossible de contacter Dropbox. Vérifiez votre proxy.");
    }
  };

  const handleFastLogin = async () => {
    setAuthError(null);
    addLog("Lancement Connexion DIRECTE (Zéro-Proxy)...");
    if (!DROPBOX_CONFIG.APP_KEY) {
      alert("App Key manquante !");
      return;
    }
    try {
      const url = await getImplicitAuthUrl(DROPBOX_CONFIG.APP_KEY);
      addLog("Redirection vers Dropbox (Mode Implicit)...");
      window.location.href = url;
    } catch (err) {
      addLog("Échec de la redirection directe.");
      setAuthError("Échec de la connexion directe.");
    }
  };

  const handleManualConnect = async () => {
    setAuthError(null);
    if (!manualToken) return;
    const ok = await validateToken(manualToken);
    if (ok) {
      setAccessToken(manualToken);
      initDropbox(manualToken);
    } else {
      setAuthError("Token invalide ou accès bloqué par le proxy.");
    }
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
      <div className="app-container" style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', textAlign: 'center', padding: '2rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem' }}>
          JukeBox<span style={{ color: 'var(--accent-color)' }}>-Box</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem', maxWidth: '400px' }}>
          Votre bibliothèque Dropbox personnelle, même derrière un proxy sécurisé.
        </p>

        {!isExpertMode ? (
          <>
            <button className="btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.25rem' }} onClick={handleLogin}>
              Se connecter avec Dropbox
            </button>
            <button 
              onClick={() => setIsExpertMode(true)}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', marginTop: '2rem', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.9rem' }}
            >
              Mode Expert (Proxy / Pro)
            </button>
          </>
        ) : (
          <div className="glass-panel" style={{ padding: '2rem', maxWidth: '450px', width: '100%', textAlign: 'left' }}>
            <h3 style={{ marginBottom: '1rem' }}>Mode Expert (Proxy / Pro)</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Utilisez la connexion directe si le mode standard bloque. Dropbox renverra le token directement dans l'URL.
            </p>
            
            <button className="btn-primary" style={{ width: '100%', marginBottom: '2rem', background: 'linear-gradient(135deg, #4ade80, #22c55e)' }} onClick={handleFastLogin}>
              🚀 Connexion Directe (Zéro-Proxy)
            </button>

            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Ou générez un token <a href="https://www.dropbox.com/developers/apps" target="_blank" rel="noreferrer" style={{ color: '#4ade80', textDecoration: 'underline' }}>ici dans la console Dropbox</a> et collez-le :
              </p>
              <input 
                type="password" 
                placeholder="Access Token..."
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.3)', color: 'white', marginBottom: '1rem' }}
              />
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn-primary" style={{ flex: 1 }} onClick={handleManualConnect}>
                  Valider le Token
                </button>
                <button 
                  onClick={() => setIsExpertMode(false)}
                  style={{ background: 'rgba(255,255,255,0.1)', border: 'none', padding: '0.75rem 1rem', borderRadius: '8px', color: 'white', cursor: 'pointer' }}
                >
                  Retour
                </button>
              </div>
            </div>
          </div>
        )}

        {(authError || error) && (
          <div style={{ 
            marginTop: '2rem', 
            padding: '1rem', 
            borderRadius: '8px', 
            background: 'rgba(239, 68, 68, 0.1)', 
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#f87171',
            maxWidth: '400px',
            fontSize: '0.9rem'
          }}>
            <b>Erreur :</b> {authError || error}
          </div>
        )}

        <div style={{ marginTop: '3rem', width: '100%', maxWidth: '450px', background: 'rgba(0,0,0,0.5)', borderRadius: '12px', padding: '1rem', textAlign: 'left', border: '1px solid var(--glass-border)' }}>
           <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
             Diagnostic de connexion :
           </h4>
           <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#4ade80', lineHeight: '1.4' }}>
              {logs.map((log, i) => <div key={i}>{log}</div>)}
           </div>
        </div>
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
        globalSearch={globalSearch}
        setGlobalSearch={setGlobalSearch}
      />
      
      <MainView 
        currentView={currentView}
        onViewChange={setCurrentView}
        songs={songs}
        albums={albums}
        artists={artists}
        playlists={playlists}
        onPlayList={handlePlayList}
        removeFromPlaylist={removeFromPlaylist}
        deletePlaylist={deletePlaylist}
        accessToken={accessToken}
        isDropbox={true}
        globalSearch={globalSearch}
      />

      <Player 
        currentSong={currentSong}
        playlist={playingQueue}
        onNext={handleNext}
        onPrev={handlePrev}
        accessToken={accessToken}
        isDropbox={true}
        addLog={addLog}
      />

      {/* Log Console Floating Support */}
      <div style={{ position: 'fixed', bottom: '100px', right: '20px', zIndex: 1000, width: '300px', background: 'rgba(0,0,0,0.85)', borderRadius: '12px', padding: '0.75rem', border: '1px solid var(--glass-border)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
           <h4 style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.3rem' }}>
             Diagnostic System
           </h4>
           <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: '#4ade80', lineHeight: '1.4' }}>
              {logs.map((log, i) => <div key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '2px 0' }}>{log}</div>)}
           </div>
      </div>
    </div>
  );
}

export default App;
