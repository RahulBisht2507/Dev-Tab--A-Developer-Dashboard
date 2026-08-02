import React, { useState, useRef, useEffect } from 'react';
import { Music, Play, Pause, Volume2, VolumeX, Radio, SkipBack, SkipForward, LogIn, Disc } from 'lucide-react';
import { useSpotify } from '../../hooks/useSpotify';
import { UserSettings } from '../../types';
import { useStorage } from '../../hooks/useStorage';

const STATIONS = [
  { id: 'chillhop', name: 'Chillhop Lofi', url: 'https://stream.zeno.fm/f3wvbbqmdg8uv' },
  { id: 'synthwave', name: 'Cyberpunk Synthwave', url: 'https://stream.zeno.fm/0544q44b7h8uv' },
  { id: 'codechill', name: 'Code & Chill Beats', url: 'https://stream.zeno.fm/4gq31v1y9h8uv' },
];

export const LofiPlayer: React.FC = () => {
  const [settings] = useStorage<UserSettings>('devtab_settings', {} as any);
  
  const [mode, setMode] = useState<'lofi' | 'spotify'>('lofi');
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedStation, setSelectedStation] = useState(STATIONS[0]);
  const [volume, setVolume] = useState(0.4);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const { token, currentTrack, error, login, logout, controlPlayback } = useSpotify(settings.spotifyClientId);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Pause lofi when switching to spotify
  useEffect(() => {
    if (mode === 'spotify' && isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [mode, isPlaying]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.src = selectedStation.url;
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  const changeStation = (station: typeof STATIONS[0]) => {
    setSelectedStation(station);
    if (audioRef.current) {
      audioRef.current.src = station.url;
      if (isPlaying) {
        audioRef.current.play();
      }
    }
  };

  return (
    <div className="glass-card">
      <audio ref={audioRef} preload="none" />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '2px', borderRadius: '8px' }}>
          <button
            onClick={() => setMode('lofi')}
            style={{
              background: mode === 'lofi' ? 'var(--bg-primary)' : 'transparent',
              color: mode === 'lofi' ? 'var(--text-primary)' : 'var(--text-secondary)',
              border: 'none', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
            }}
          >
            <Radio size={12} /> Lo-Fi
          </button>
          <button
            onClick={() => setMode('spotify')}
            style={{
              background: mode === 'spotify' ? '#1DB954' : 'transparent',
              color: mode === 'spotify' ? '#fff' : 'var(--text-secondary)',
              border: 'none', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
            }}
          >
            <Disc size={12} /> Spotify
          </button>
        </div>

        {(isPlaying || (mode === 'spotify' && currentTrack?.isPlaying)) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <span style={{ width: '3px', height: '14px', background: mode === 'spotify' ? '#1DB954' : 'var(--accent-color)', borderRadius: '2px', animation: 'bounce 0.8s infinite alternate' }} />
            <span style={{ width: '3px', height: '20px', background: mode === 'spotify' ? '#1DB954' : 'var(--accent-color)', borderRadius: '2px', animation: 'bounce 0.6s 0.2s infinite alternate' }} />
            <span style={{ width: '3px', height: '10px', background: mode === 'spotify' ? '#1DB954' : 'var(--accent-color)', borderRadius: '2px', animation: 'bounce 0.7s 0.4s infinite alternate' }} />
          </div>
        )}
      </div>

      {mode === 'lofi' ? (
        <>
          <div style={{
            background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px',
            padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem'
          }}>
            <button
              className="btn-icon"
              onClick={togglePlay}
              style={{ background: 'var(--accent-color)', color: '#fff', border: 'none', width: '38px', height: '38px', borderRadius: '50%', justifyContent: 'center', flexShrink: 0 }}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: '2px' }} />}
            </button>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '0.88rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {selectedStation.name}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }} className="mono">
                {isPlaying ? 'Playing Live Radio...' : 'Paused'}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button onClick={() => setIsMuted(!isMuted)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                {isMuted || volume === 0 ? <VolumeX size={15} /> : <Volume2 size={15} color="var(--accent-color)" />}
              </button>
              <input
                type="range" min="0" max="1" step="0.05" value={isMuted ? 0 : volume}
                onChange={(e) => { setVolume(parseFloat(e.target.value)); setIsMuted(false); }}
                style={{ width: '55px', accentColor: 'var(--accent-color)' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
            {STATIONS.map((station) => (
              <button
                key={station.id}
                onClick={() => changeStation(station)}
                className="mono"
                style={{
                  background: selectedStation.id === station.id ? 'var(--badge-bg)' : 'transparent',
                  color: selectedStation.id === station.id ? 'var(--accent-color)' : 'var(--text-secondary)',
                  border: selectedStation.id === station.id ? '1px solid var(--accent-color)' : '1px solid var(--border-color)',
                  padding: '3px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.73rem', display: 'flex', alignItems: 'center', gap: '4px'
                }}
              >
                <Radio size={11} />
                <span>{station.name}</span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div style={{
          background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px',
          padding: '0.85rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem'
        }}>
          {!token ? (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              {error ? (
                <p style={{ fontSize: '0.75rem', color: '#ff5f56', marginBottom: '0.5rem' }}>{error}</p>
              ) : (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.8rem' }}>Connect Spotify to control playback</p>
              )}
              <button
                onClick={login}
                style={{ background: '#1DB954', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <LogIn size={14} /> Connect Spotify
              </button>
            </div>
          ) : !currentTrack ? (
            <div style={{ textAlign: 'center', padding: '1rem 0', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
              <p>No active Spotify session found.</p>
              <p style={{ fontSize: '0.7rem', marginTop: '0.2rem', opacity: 0.7 }}>Play something on your phone or desktop app first.</p>
              <button onClick={logout} style={{ marginTop: '0.8rem', background: 'none', border: 'none', color: '#ff5f56', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}>Disconnect</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {currentTrack.albumArt ? (
                  <img src={currentTrack.albumArt} alt="Album Art" style={{ width: '45px', height: '45px', borderRadius: '6px', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '45px', height: '45px', borderRadius: '6px', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Music size={20} color="var(--text-secondary)" />
                  </div>
                )}
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-primary)' }}>
                    {currentTrack.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {currentTrack.artist}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <button onClick={() => controlPlayback('previous')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}>
                    <SkipBack size={16} />
                  </button>
                  <button
                    onClick={() => controlPlayback(currentTrack.isPlaying ? 'pause' : 'play')}
                    style={{ background: '#1DB954', color: '#fff', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  >
                    {currentTrack.isPlaying ? <Pause size={16} /> : <Play size={16} style={{ marginLeft: '2px' }} />}
                  </button>
                  <button onClick={() => controlPlayback('next')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}>
                    <SkipForward size={16} />
                  </button>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                 <button onClick={logout} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.65rem', cursor: 'pointer', opacity: 0.7 }}>Disconnect</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

