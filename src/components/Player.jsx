import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { getFileBlob } from '../services/googleDrive';

const Player = ({ currentSong, playlist, onNext, onPrev, accessToken }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentSong && accessToken) {
      setIsLoading(true);
      // Clean up previous URL
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      setAudioUrl(null);
      
      getFileBlob(currentSong.id, accessToken)
        .then(blob => {
          const url = URL.createObjectURL(blob);
          setAudioUrl(url);
          setIsLoading(false);
        })
        .catch(err => {
          console.error("Erreur de chargement audio", err);
          setIsLoading(false);
        });
    }
  }, [currentSong, accessToken]);

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Play error:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, audioUrl]);

  useEffect(() => {
    // When a new song comes in and URL is set, auto-play
    if (audioUrl && currentSong) {
      setIsPlaying(true);
      if (audioRef.current) {
         audioRef.current.play().catch(e => console.error("Play error:", e));
      }
    }
  }, [audioUrl, currentSong]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleProgressChange = (e) => {
    if (audioRef.current) {
      const newTime = Number(e.target.value);
      audioRef.current.currentTime = newTime;
      setProgress(newTime);
    }
  };

  const handleEnded = () => {
    onNext();
  };

  const formatTime = (time) => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="player-bar">
      {audioUrl && (
        <audio 
          ref={audioRef} 
          src={audioUrl} 
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onLoadedMetadata={() => setDuration(audioRef.current.duration)}
        />
      )}
      
      <div style={{ display: 'flex', alignItems: 'center', width: '30%', gap: '1rem' }}>
        {currentSong ? (
          <>
            <div style={{ width: '60px', height: '60px', borderRadius: '8px', background: '#222', overflow: 'hidden' }}>
              {currentSong.metadata?.cover ? (
                <img src={currentSong.metadata.cover} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>🎶</div>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <span style={{ fontWeight: '600', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {currentSong.metadata?.title || currentSong.name}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {currentSong.metadata?.artist || 'Artiste inconnu'}
              </span>
            </div>
          </>
        ) : (
          <div style={{ color: 'var(--text-secondary)' }}>Aucun titre sélectionné</div>
        )}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button onClick={onPrev} disabled={!currentSong} style={{ background: 'none', border: 'none', color: currentSong ? 'var(--text-primary)' : 'var(--text-secondary)', cursor: currentSong ? 'pointer' : 'default' }}>
            <SkipBack size={24} />
          </button>
          
          <button onClick={togglePlay} disabled={!currentSong || isLoading} style={{ 
            background: 'var(--accent-color)', 
            border: 'none', 
            borderRadius: '50%', 
            width: '48px', 
            height: '48px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'white',
            cursor: (!currentSong || isLoading) ? 'wait' : 'pointer',
            opacity: (!currentSong || isLoading) ? 0.7 : 1
          }}>
            {isPlaying ? <Pause size={24} /> : <Play size={24} style={{ marginLeft: '4px' }} />}
          </button>

          <button onClick={onNext} disabled={!currentSong} style={{ background: 'none', border: 'none', color: currentSong ? 'var(--text-primary)' : 'var(--text-secondary)', cursor: currentSong ? 'pointer' : 'default' }}>
            <SkipForward size={24} />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%', maxWidth: '600px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <span>{formatTime(progress)}</span>
          <input 
            type="range" 
            min="0" 
            max={duration || 100} 
            value={progress} 
            onChange={handleProgressChange}
            style={{ flex: 1, height: '4px', accentColor: 'var(--accent-color)', cursor: 'pointer' }}
            disabled={!currentSong || !duration}
          />
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div style={{ width: '30%', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)' }}>
        <Volume2 size={20} />
        <input 
          type="range" 
          min="0" max="1" step="0.05" 
          defaultValue="1" 
          onChange={(e) => { if (audioRef.current) audioRef.current.volume = Number(e.target.value); }}
          style={{ width: '100px', height: '4px', accentColor: 'var(--accent-color)', cursor: 'pointer' }}
        />
      </div>
    </div>
  );
};

export default Player;
