import React from 'react';
import { X, User, Layout, ShieldAlert } from 'lucide-react';
import { UserSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onUpdateSettings: (newSettings: UserSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem 1.25rem',
          borderBottom: '1px solid var(--border-color)'
        }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>DevTab Preferences</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '75vh', overflowY: 'auto' }}>
          {/* Developer Name */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <User size={15} color="var(--accent-color)" />
              Developer Handle / GitHub Username
            </label>
            <input
              type="text"
              value={settings.userName}
              onChange={(e) => onUpdateSettings({ ...settings, userName: e.target.value })}
              className="mono"
              placeholder="e.g. alex"
              style={{
                padding: '0.55rem 0.75rem',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '0.9rem'
              }}
            />
          </div>

          {/* Active Widgets Toggle */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Layout size={15} color="var(--accent-color)" />
              Active Widgets & Backgrounds
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
              {[
                { key: 'showMatrixRain', label: 'Matrix Digital Rain Canvas' },
                { key: 'showCryptoTicker', label: 'Market & Crypto Ticker Bar' },
                { key: 'showSpeedDial', label: 'Speed Dial Shortcuts' },
                { key: 'showGithubHeatmap', label: 'GitHub Activity Heatmap' },
                { key: 'showServerMonitor', label: 'API Uptime Monitor' },
                { key: 'showLofiPlayer', label: 'Lo-Fi Beats Radio' },
                { key: 'showFeeds', label: 'GitHub & HN Feeds' },
                { key: 'showScratchpad', label: 'Sprint Tasks & Notes' },
                { key: 'showTimer', label: 'Focus Pomodoro & Audio' },
              ].map(({ key, label }) => (
                <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', cursor: 'pointer', background: 'var(--bg-primary)', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  <input
                    type="checkbox"
                    checked={(settings as any)[key] !== false}
                    onChange={(e) => onUpdateSettings({ ...settings, [key]: e.target.checked })}
                    style={{ accentColor: 'var(--accent-color)', width: '15px', height: '15px' }}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Data Reset */}
          <div style={{ paddingTop: '0.8rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
              <ShieldAlert size={14} />
              <span>Reset devtab storage cache</span>
            </div>
            <button
              className="mono"
              onClick={() => {
                if (confirm('Reset all DevTab local data to default?')) {
                  localStorage.clear();
                  if (typeof chrome !== 'undefined' && chrome.storage) {
                    chrome.storage.local.clear();
                  }
                  window.location.reload();
                }
              }}
              style={{
                background: 'rgba(255, 95, 86, 0.15)',
                color: '#ff5f56',
                border: '1px solid rgba(255, 95, 86, 0.3)',
                padding: '4px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.78rem'
              }}
            >
              Reset Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
