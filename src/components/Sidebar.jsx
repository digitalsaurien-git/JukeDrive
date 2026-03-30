import React from 'react';
import { Home, Disc, ListMusic, Plus, Search, RefreshCw, LogOut, Album, Mic2 } from 'lucide-react';

const Sidebar = ({ 
  onViewChange, 
  currentView, 
  playlists, 
  onCreatePlaylist, 
  onScan, 
  isScanning,
  error,
  user,
  globalSearch,
  setGlobalSearch
}) => {
  return (
    <aside className="sidebar">
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          background: 'var(--accent-color)', 
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Disc size={24} color="white" />
        </div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.5px' }}>JukeBox-Box</h1>
      </div>

      <div className="search-container" style={{ marginBottom: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '0.5rem 0.75rem' }}>
        <Search size={18} color="rgba(255,255,255,0.4)" />
        <input 
          type="text" 
          placeholder="Recherche globale..." 
          style={{ background: 'none', border: 'none', color: 'white', padding: '0.5rem', fontSize: '0.85rem', width: '100%', outline: 'none' }}
          value={globalSearch}
          onChange={(e) => {
            setGlobalSearch(e.target.value);
            if (e.target.value.length > 0 && currentView !== 'search') {
               onViewChange('search');
            } else if (e.target.value.length === 0 && currentView === 'search') {
               onViewChange('home');
            }
          }}
        />
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
        <button 
          className={`nav-item ${currentView === 'home' ? 'active' : ''}`}
          onClick={() => onViewChange('home')}
        >
          <Home size={20} />
          <span>Accueil</span>
        </button>

        <button 
          className={`nav-item ${currentView === 'albums' ? 'active' : ''}`}
          onClick={() => onViewChange('albums')}
        >
          <Album size={20} />
          <span>Albums</span>
        </button>

        <button 
          className={`nav-item ${currentView === 'artists' ? 'active' : ''}`}
          onClick={() => onViewChange('artists')}
        >
          <Mic2 size={20} />
          <span>Artistes</span>
        </button>

        <div style={{ margin: '1.5rem 0 0.75rem 0', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Playlists
        </div>

        {playlists.map(p => (
          <button 
            key={p.id}
            className={`nav-item ${currentView === `playlist-${p.id}` ? 'active' : ''}`}
            onClick={() => onViewChange(`playlist-${p.id}`)}
          >
            <ListMusic size={20} />
            <span>{p.name}</span>
          </button>
        ))}

        <button className="nav-item btn-add-playlist" onClick={() => {
          const name = prompt("Nom de la playlist :");
          if (name) onCreatePlaylist(name);
        }}>
          <Plus size={20} />
          <span>Créer une playlist</span>
        </button>
      </nav>

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '120px' }}>
        {user && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button className="btn-scan" onClick={onScan} disabled={isScanning}>
              <RefreshCw size={18} className={isScanning ? 'spin' : ''} />
              <span>{isScanning ? 'Analyse...' : 'Analyser Dropbox'}</span>
            </button>
            <div style={{ padding: '0 0.5rem' }}>
              <input 
                type="text" 
                placeholder="Dossier (ex: /MUSIC)" 
                defaultValue={localStorage.getItem('jukedrive_dropbox_root') || ''}
                onBlur={(e) => {
                  localStorage.setItem('jukedrive_dropbox_root', e.target.value);
                  // Rafraîchir sans recharger toute la page
                  window.location.reload(); 
                }}
                style={{ 
                  width: '100%', 
                  background: 'rgba(255,255,255,0.05)', 
                  border: '1px solid var(--glass-border)', 
                  borderRadius: '8px', 
                  padding: '0.5rem', 
                  color: 'white',
                  fontSize: '0.75rem',
                  outline: 'none'
                }} 
              />
            </div>
            {error && (
              <div style={{ color: '#ef4444', fontSize: '0.75rem', textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', borderRadius: '8px' }}>
                {error}
              </div>
            )}
          </div>
        )}
        
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#444' }}></div>
            <div style={{ flex: 1, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Connecté
            </div>
            <LogOut size={16} style={{ cursor: 'pointer', opacity: 0.6 }} />
          </div>
        )}
      </div>

      <style>{`
        .nav-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
          font-weight: 500;
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.05);
          color: white;
        }

        .nav-item.active {
          background: var(--accent-color);
          color: white;
        }

        .btn-add-playlist {
          color: var(--accent-color);
          margin-top: 0.5rem;
        }

        .btn-scan {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem;
          border-radius: 12px;
          border: 1px solid var(--accent-color);
          background: transparent;
          color: var(--accent-color);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-scan:hover:not(:disabled) {
          background: var(--accent-color);
          color: white;
        }

        .btn-scan:disabled {
          opacity: 0.5;
          cursor: wait;
        }

        .spin {
          animation: rotate 2s linear infinite;
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
