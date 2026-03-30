import React, { useState } from 'react';
import { Play, Download, Trash2, Search, Album } from 'lucide-react';
import { downloadAlbum, downloadPlaylist } from '../services/downloader';

const MainView = ({ 
  currentView, 
  onViewChange,
  songs, 
  albums, 
  artists,
  playlists, 
  onPlayList,
  removeFromPlaylist,
  deletePlaylist,
  accessToken
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [selectedAlbum, setSelectedAlbum] = useState(null);

  // Reset drill-down when view changes from sidebar
  React.useEffect(() => {
    if (['home', 'albums', 'artists', 'playlists'].includes(currentView)) {
      setSelectedArtist(null);
      setSelectedAlbum(null);
    }
  }, [currentView]);

  if (currentView === 'home') {
    return (
      <div className="content-main">
        <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem', letterSpacing: '-1px' }}>
          Bienvenue sur <span style={{ color: 'var(--accent-color)' }}>JukeBox-Box</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', marginBottom: '3rem', maxWidth: '600px' }}>
          Votre bibliothèque musicale personnelle, propulsée par vos 2 To de stockage Dropbox. Branchez vos écouteurs et profitez.
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

  // VUE ARTISTES
  if (currentView === 'artists' && !selectedArtist) {
    const filteredArtists = Object.keys(artists).filter(name => 
      name.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort();

    return (
      <div className="content-main">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '700' }}>Artistes</h1>
          <div className="search-container" style={{ margin: 0, width: '300px' }}>
            <Search size={20} color="var(--text-secondary)" />
            <input 
              type="text" 
              placeholder="Rechercher un artiste..." 
              className="search-input"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="album-grid">
          {filteredArtists.map(artistName => (
            <div key={artistName} className="album-card glass-panel" onClick={() => setSelectedArtist(artistName)}>
              <div className="album-cover" style={{ borderRadius: '50%', background: 'linear-gradient(135deg, #333, #111)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-color)' }}>{artistName[0]}</span>
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', textAlign: 'center', marginTop: '1rem' }}>{artistName}</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center' }}>{Object.keys(artists[artistName].albums).length} albums</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // VUE ALBUMS DE L'ARTISTE
  if (selectedArtist && !selectedAlbum) {
    const artistAlbums = artists[selectedArtist].albums;
    return (
      <div className="content-main">
        <div style={{ marginBottom: '2rem' }}>
          <button onClick={() => setSelectedArtist(null)} style={{ background: 'none', border: 'none', color: 'var(--accent-color)', cursor: 'pointer', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            ← Retour aux artistes
          </button>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '700' }}>{selectedArtist}</h1>
        </div>

        <div className="album-grid">
          {Object.entries(artistAlbums).map(([albumName, albumData]) => (
            <div key={albumName} className="album-card glass-panel" onClick={() => setSelectedAlbum({ name: albumName, data: albumData })}>
              <div className="album-cover" style={{ background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Album size={48} color="#555" />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', marginTop: '0.5rem' }}>{albumName}</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{albumData.songs.length} titres</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // VUE DÉTAIL ALBUM (TITRES)
  if (selectedAlbum) {
    return (
      <div className="content-main">
        <button onClick={() => setSelectedAlbum(null)} style={{ background: 'none', border: 'none', color: 'var(--accent-color)', cursor: 'pointer', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          ← Retour à l'artiste
        </button>
        
        <div style={{ display: 'flex', gap: '2rem', marginBottom: '3rem', alignItems: 'flex-end' }}>
          <div style={{ width: '200px', height: '200px', background: '#222', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
             <Album size={80} color="#444" />
          </div>
          <div>
            <p style={{ fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Album</p>
            <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '0.5rem' }}>{selectedAlbum.name}</h1>
            <p style={{ fontSize: '1.1rem' }}>
              <span style={{ fontWeight: '600' }}>{selectedArtist}</span> • {selectedAlbum.data.songs.length} titres
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {selectedAlbum.data.songs.map((song, index) => (
            <div 
              key={song.id} 
              className="track-row" 
              style={{ display: 'flex', alignItems: 'center', padding: '0.75rem 1rem', borderRadius: '8px', cursor: 'pointer' }}
              onClick={() => onPlayList(selectedAlbum.data.songs, index)}
            >
              <div style={{ width: '30px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{index + 1}</div>
              <div style={{ flex: 1, fontWeight: '500' }}>{song.metadata?.title || song.name}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{selectedArtist}</div>
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
            <div key={albumName} className="album-card glass-panel" style={{ padding: '1rem' }} onClick={() => {
                setSelectedArtist(albumData.artist);
                setSelectedAlbum({ name: albumName, data: albumData });
            }}>
              <div className="album-cover" style={{ background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Album size={48} color="#555" />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.25rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{albumName}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>{albumData.artist || 'Artiste Inconnu'}</p>
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
              >
                <div style={{ width: '40px', color: 'var(--text-secondary)', fontWeight: '600' }}>{index + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{song.metadata?.title || song.name}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{song.metadata?.artist || 'Inconnu'} • {song.metadata?.album || 'Inconnu'}</div>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); removeFromPlaylist(playlist.id, song.id); }}
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.5rem' }}
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
