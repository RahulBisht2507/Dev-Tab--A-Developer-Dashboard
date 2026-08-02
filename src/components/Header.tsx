import React, { useState, useEffect } from 'react';
import { Terminal, Settings, Palette, Search, Clock, Wrench } from 'lucide-react';
import { ThemeType } from '../types';

interface HeaderProps {
  userName: string;
  theme: ThemeType;
  onOpenThemeModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenCommandPalette: () => void;
  onOpenDevUtils: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  userName,
  theme,
  onOpenThemeModal,
  onOpenSettingsModal,
  onOpenCommandPalette,
  onOpenDevUtils,
}) => {
  const [time, setTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDigits = (n: number) => n.toString().padStart(2, '0');
  const hours = formatDigits(time.getHours());
  const minutes = formatDigits(time.getMinutes());
  const seconds = formatDigits(time.getSeconds());

  const dateString = time.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const utcTime = `${formatDigits(time.getUTCHours())}:${formatDigits(time.getUTCMinutes())} UTC`;

  return (
    <header className="terminal-header">
      <div className="terminal-title-group">
        <div className="terminal-dots">
          <span className="dot dot-red" />
          <span className="dot dot-yellow" />
          <span className="dot dot-green" />
        </div>
        <div className="prompt-text">
          <Terminal size={18} />
          <span>{userName}@dev-machine:~$</span>
          <span className="mono" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginLeft: '0.5rem' }}>
            uptime --active
          </span>
        </div>
      </div>

      <div className="time-display">
        <span className="digital-time">
          {hours}:{minutes}<span style={{ opacity: 0.6, fontSize: '1.4rem' }}>:{seconds}</span>
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span className="digital-date">{dateString}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-color)' }} className="mono">
            <Clock size={11} style={{ display: 'inline', marginRight: '4px' }} />
            {utcTime}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
        <button
          className="btn-icon mono"
          onClick={onOpenCommandPalette}
          title="Search or press Ctrl+K"
        >
          <Search size={15} />
          <span>Search</span>
          <kbd style={{
            background: 'var(--bg-card)',
            padding: '2px 5px',
            borderRadius: '4px',
            fontSize: '0.7rem',
            border: '1px solid var(--border-color)'
          }}>
            Ctrl+K
          </kbd>
        </button>

        <button className="btn-icon mono" onClick={onOpenDevUtils} title="DevUtils (JSON, JWT, Base64, CSS, Regex)">
          <Wrench size={15} color="var(--accent-color)" />
          <span>DevUtils</span>
        </button>

        <button className="btn-icon" onClick={onOpenThemeModal} title={`Current Theme: ${theme}`}>
          <Palette size={16} />
          <span style={{ textTransform: 'capitalize' }}>{theme}</span>
        </button>

        <button className="btn-icon" onClick={onOpenSettingsModal} title="DevTab Settings">
          <Settings size={16} />
        </button>
      </div>
    </header>
  );
};
