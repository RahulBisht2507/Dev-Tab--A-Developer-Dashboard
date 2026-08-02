import React, { useState, useRef, useEffect } from 'react';
import { Music, Play, Pause, Volume2, VolumeX, Radio } from 'lucide-react';

const STATIONS = [
  { id: 'chillhop', name: 'Chillhop Lofi', url: 'https://stream.zeno.fm/f3wvbbqmdg8uv' },
  { id: 'synthwave', name: 'Cyberpunk Synthwave', url: 'https://stream.zeno.fm/0544q44b7h8uv' },
  { id: 'codechill', name: 'Code & Chill Beats', url: 'https://stream.zeno.fm/4gq31v1y9h8uv' },
];

export const LofiPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedStation, setSelectedStation] = useState(STATIONS[0]);
  const [volume, setVolume] = useState(0.4);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

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
        <h2 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Music size={18} color="var(--accent-color)" />
          <span>Lo-Fi Beats Radio</span>
        </h2>

        {isPlaying && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <span style={{ width: '3px', height: '14px', background: 'var(--accent-color)', borderRadius: '2px', animation: 'bounce 0.8s infinite alternate' }} />
            <span style={{ width: '3px', height: '20px', background: 'var(--accent-color)', borderRadius: '2px', animation: 'bounce 0.6s 0.2s infinite alternate' }} />
            <span style={{ width: '3px', height: '10px', background: 'var(--accent-color)', borderRadius: '2px', animation: 'bounce 0.7s 0.4s infinite alternate' }} />
          </div>
        )}
      </div>

      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '10px',
        padding: '0.85rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem'
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
          <button
            onClick={() => setIsMuted(!isMuted)}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
          >
            {isMuted || volume === 0 ? <VolumeX size={15} /> : <Volume2 size={15} color="var(--accent-color)" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              setVolume(parseFloat(e.target.value));
              setIsMuted(false);
            }}
            style={{ width: '55px', accentColor: 'var(--accent-color)' }}
          />
        </div>
      </div>

      {/* Station Selector */}
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
              padding: '3px 8px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.73rem',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Radio size={11} />
            <span>{station.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
