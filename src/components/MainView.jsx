import React, { useState } from 'react';
import { Play, Download, Trash2, Search, Album } from 'lucide-react';
import { downloadAlbum, downloadPlaylist } from '../services/downloader';

const MainView = ({ 
  currentView, 
  songs, 
  albums, 
  playlists, 
  onPlaySong, 
  onPlayList,
  removeFromPlaylist,
  deletePlaylist,
  accessToken
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (currentView === 'home') {
    return (
      <div className="content-main">
        <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem', letterSpacing: '-1px' }}>
          Bienvenue sur <span style={{ color: 'var(--accent-color)' }}>JukeDrive</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', marginBottom: '3rem', maxWidth: '600px' }}>
          Votre bibliothèque musicale personnelle, propulsée par Google Drive. Branchez vos écouteurs et profitez.
        </p>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '4rem' }}>
          <button className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }} onClick={() => onPlayList(songs, 0)}>
            <Play size={24} /> Lancer la lecture aléatoire
          </button>
        </div>

        <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Derniers Albums Découverts</h2>
        <div className="album-grid">
          {Object.entries(albums).slice(0, 5).map(([albumName, albumData]) => (
            <div key={albumName} className="album-card" onClick={() => onPlayList(albumData.songs, 0)}>
              <div className="album-cover" style={{ background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {albumData.cover ? (
                   <img src={albumData.cover} alt={albumName} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
                ) : (
                   <Album size={48} color="#555" />
                )}
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.25rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{albumName}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{albumData.artist || 'Artiste Inconnu'}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (currentView === 'albums') {
    const filteredAlbums = Object.entries(albums).filter(([albumName, album]) => 
      albumName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (album.artist && album.artist.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
      <div className="content-main">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '700' }}>Tous les Albums</h1>
          
          <div className="search-container" style={{ margin: 0, width: '300px' }}>
            <Search size={20} color="var(--text-secondary)" />
            <input 
              type="text" 
              placeholder="Rechercher un album..." 
              className="search-input"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="album-grid">
          {filteredAlbums.map(([albumName, albumData]) => (
            <div key={albumName} className="album-card glass-panel" style={{ padding: '1rem' }}>
              <div 
                className="album-cover" 
                style={{ background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                onClick={() => onPlayList(albumData.songs, 0)}
              >
                {albumData.cover ? (
                   <img src={albumData.cover} alt={albumName} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
                ) : (
                   <Album size={48} color="#555" />
                )}
                <div className="play-overlay" style={{ position: 'absolute', display: 'flex', justifyContent: 'center', alignItems: 'center', opacity: 0, transition: '0.2s', background: 'rgba(0,0,0,0.5)', width: '100%', height: '100%', borderRadius: '12px', top:0, left:0}}>
                   <Play size={48} color="white" />
                </div>
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.25rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{albumName}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>{albumData.artist || 'Artiste Inconnu'}</p>
              
              <button 
                onClick={(e) => { e.stopPropagation(); downloadAlbum(albumName, albumData.songs, accessToken); }}
                style={{ width: '100%', background: 'rgba(255,255,255,0.1)', border: 'none', padding: '0.5rem', borderRadius: '8px', color: 'white', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', transition: '0.2s' }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              >
                <Download size={16} /> Télécharger
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (currentView.startsWith('playlist-')) {
    const playlistId = currentView.split('-')[1];
    const playlist = playlists.find(p => p.id === playlistId);

    if (!playlist) return <div className="content-main">Playlist introuvable</div>;

    return (
      <div className="content-main">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>{playlist.name}</h1>
            <p style={{ color: 'var(--text-secondary)' }}>{playlist.songs.length} titres</p>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn-primary" onClick={() => onPlayList(playlist.songs, 0)} disabled={playlist.songs.length === 0}>
              <Play size={20} /> Lecture
            </button>
            <button 
              onClick={() => downloadPlaylist(playlist.name, playlist.songs, accessToken)} 
              disabled={playlist.songs.length === 0}
              style={{ background: 'rgba(255,255,255,0.1)', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Download size={20} /> Télécharger
            </button>
            <button 
              onClick={() => deletePlaylist(playlist.id)} 
              style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.5)', padding: '0.75rem 1.5rem', borderRadius: '8px', color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Trash2 size={20} /> Supprimer
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {playlist.songs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
              Cette playlist est vide. Ajoutez des chansons depuis l'onglet Albums !
            </div>
          ) : (
            playlist.songs.map((song, index) => (
              <div 
                key={song.id} 
                className="glass-panel" 
                style={{ display: 'flex', alignItems: 'center', padding: '1rem', cursor: 'pointer', transition: '0.2s' }}
                onClick={() => onPlayList(playlist.songs, index)}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
              >
                <div style={{ width: '40px', color: 'var(--text-secondary)', fontWeight: '600' }}>{index + 1}</div>
                <div style={{ width: '48px', height: '48px', borderRadius: '6px', background: '#333', marginRight: '1rem', overflow: 'hidden' }}>
                    {song.metadata?.cover ? <img src={song.metadata.cover} style={{width:'100%', height:'100%', objectFit: 'cover'}} /> : null}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{song.metadata?.title || song.name}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{song.metadata?.artist || 'Inconnu'} • {song.metadata?.album || 'Inconnu'}</div>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); removeFromPlaylist(playlist.id, song.id); }}
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.5rem' }}
                  title="Retirer de la playlist"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return <div className="content-main">Vue introuvable</div>;
};

export default MainView;
