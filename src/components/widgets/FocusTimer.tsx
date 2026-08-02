import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Timer, Radio } from 'lucide-react';

export const FocusTimer: React.FC = () => {
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  
  // Ambient Sound State
  const [ambientSound, setAmbientSound] = useState<'off' | 'rain' | 'whitenoise' | 'synth'>('off');
  const [volume, setVolume] = useState<number>(0.3);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Timer interval effect
  useEffect(() => {
    let timer: any = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      // Play chime sound
      playChime();
      if (mode === 'work') {
        setMode('break');
        setTimeLeft(5 * 60);
      } else {
        setMode('work');
        setTimeLeft(25 * 60);
      }
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, mode]);

  // Web Audio Synthesizer for Ambient Noise
  useEffect(() => {
    if (ambientSound === 'off') {
      stopAmbientSound();
      return;
    }

    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();
      }

      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      stopAmbientSound(); // clear existing nodes

      const masterGain = ctx.createGain();
      masterGain.gain.value = volume;
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      if (ambientSound === 'whitenoise' || ambientSound === 'rain') {
        // Create 2-second white noise buffer
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = buffer;
        whiteNoise.loop = true;

        if (ambientSound === 'rain') {
          // Low-pass filter for rain sound
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.value = 1000;
          whiteNoise.connect(filter);
          filter.connect(masterGain);
        } else {
          whiteNoise.connect(masterGain);
        }

        whiteNoise.start();
        noiseNodeRef.current = whiteNoise;
      } else if (ambientSound === 'synth') {
        // Subtle synthwave pulse drone
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.value = 110; // A2 note

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 400;

        osc.connect(filter);
        filter.connect(masterGain);
        osc.start();
        noiseNodeRef.current = osc;
      }
    } catch (e) {
      console.warn('AudioContext error:', e);
    }
  }, [ambientSound]);

  // Volume adjustment
  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.value = volume;
    }
  }, [volume]);

  const stopAmbientSound = () => {
    if (noiseNodeRef.current) {
      try {
        (noiseNodeRef.current as any).stop?.();
        noiseNodeRef.current.disconnect();
      } catch {}
      noiseNodeRef.current = null;
    }
  };

  const playChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch {}
  };

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(mode === 'work' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="glass-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Timer size={18} color="var(--accent-color)" />
          <span>Dev Focus & Pomodoro</span>
        </h2>

        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button
            onClick={() => { setMode('work'); setTimeLeft(25 * 60); setIsRunning(false); }}
            className="mono"
            style={{
              background: mode === 'work' ? 'var(--accent-color)' : 'transparent',
              color: mode === 'work' ? '#fff' : 'var(--text-secondary)',
              border: 'none',
              padding: '2px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.75rem'
            }}
          >
            Work (25m)
          </button>
          <button
            onClick={() => { setMode('break'); setTimeLeft(5 * 60); setIsRunning(false); }}
            className="mono"
            style={{
              background: mode === 'break' ? 'var(--accent-color)' : 'transparent',
              color: mode === 'break' ? '#fff' : 'var(--text-secondary)',
              border: 'none',
              padding: '2px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.75rem'
            }}
          >
            Break (5m)
          </button>
        </div>
      </div>

      {/* Main Timer Display */}
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <div style={{ fontSize: '2.8rem', fontWeight: 700, letterSpacing: '-0.02em' }} className="mono">
          {formatTime(timeLeft)}
        </div>

        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button
            className="btn-icon"
            onClick={toggleTimer}
            style={{ background: isRunning ? '#ff5f56' : 'var(--accent-color)', color: '#fff', border: 'none', padding: '0.5rem 1.25rem' }}
          >
            {isRunning ? <Pause size={16} /> : <Play size={16} />}
            <span>{isRunning ? 'Pause' : 'Start Focus'}</span>
          </button>

          <button className="btn-icon" onClick={resetTimer} title="Reset Timer">
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Ambient Audio Synthesizer Bar */}
      <div style={{ marginTop: '1rem', paddingTop: '0.8rem', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }} className="mono">
            <Radio size={13} color="var(--accent-color)" />
            Ambient Soundscape
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {ambientSound !== 'off' ? <Volume2 size={14} color="var(--accent-color)" /> : <VolumeX size={14} color="var(--text-secondary)" />}
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              style={{ width: '60px', accentColor: 'var(--accent-color)' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {(['off', 'rain', 'whitenoise', 'synth'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setAmbientSound(type)}
              className="mono"
              style={{
                background: ambientSound === type ? 'var(--badge-bg)' : 'transparent',
                color: ambientSound === type ? 'var(--accent-color)' : 'var(--text-secondary)',
                border: ambientSound === type ? '1px solid var(--accent-color)' : '1px solid var(--border-color)',
                padding: '3px 8px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.72rem',
                textTransform: 'capitalize'
              }}
            >
              {type === 'off' ? 'Mute' : type === 'whitenoise' ? 'White Noise' : type === 'synth' ? 'Synth Drone' : type}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
