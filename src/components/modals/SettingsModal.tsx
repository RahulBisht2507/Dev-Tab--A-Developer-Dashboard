import React from 'react';
import { X, User, Layout, ShieldAlert } from 'lucide-react';
import { UserSettings } from '../../types';

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
  const [activeTab, setActiveTab] = React.useState<'general' | 'background' | 'commands'>('general');
  const [customCommands, setCustomCommands] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (isOpen) {
      try {
        const stored = localStorage.getItem('devtab_custom_commands');
        if (stored) {
          setCustomCommands(JSON.parse(stored).data || []);
        }
      } catch (e) {}
    }
  }, [isOpen]);

  const saveCustomCommands = (commands: any[]) => {
    setCustomCommands(commands);
    localStorage.setItem('devtab_custom_commands', JSON.stringify({ data: commands, timestamp: Date.now() }));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>DevTab Preferences</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)' }}>
          {(['general', 'background', 'commands'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1, padding: '0.8rem', background: 'none', border: 'none', cursor: 'pointer',
                fontWeight: activeTab === tab ? 600 : 400,
                color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-secondary)',
                borderBottom: activeTab === tab ? '2px solid var(--accent-color)' : '2px solid transparent',
                textTransform: 'capitalize'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '70vh', overflowY: 'auto' }}>
          
          {activeTab === 'general' && (
            <>
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
                  style={{ padding: '0.55rem 0.75rem', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Layout size={15} color="var(--accent-color)" />
                  Active Widgets
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                  {[
                    { key: 'showCryptoTicker', label: 'Market & Crypto Ticker' },
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

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" color="#1DB954"><circle cx="12" cy="12" r="10"></circle><path d="M8 11.5c3.5-1.5 8-1.5 10 .5"></path><path d="M7 14.5c3-1.5 7-1.5 9 .5"></path><path d="M9 17c2-1 5-1 7 0"></path></svg>
                  Spotify Integration
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <input
                    type="text"
                    value={settings.spotifyClientId || ''}
                    onChange={(e) => onUpdateSettings({ ...settings, spotifyClientId: e.target.value })}
                    className="mono"
                    placeholder="Enter Spotify Client ID"
                    style={{ padding: '0.55rem 0.75rem', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                  />
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Required for Spotify Connect. Get one from the <a href="https://developer.spotify.com/dashboard" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-color)' }}>Spotify Developer Dashboard</a>.
                  </p>
                </div>
              </div>

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
                      window.location.reload();
                    }
                  }}
                  style={{ background: 'rgba(255, 95, 86, 0.15)', color: '#ff5f56', border: '1px solid rgba(255, 95, 86, 0.3)', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer' }}
                >
                  Reset Data
                </button>
              </div>
            </>
          )}

          {activeTab === 'background' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Background Type</label>
                <select
                  value={settings.backgroundType || 'matrix'}
                  onChange={(e) => onUpdateSettings({ ...settings, backgroundType: e.target.value as any })}
                  style={{ padding: '0.5rem', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)' }}
                >
                  <option value="matrix">Matrix Digital Rain</option>
                  <option value="unsplash">Unsplash Image</option>
                  <option value="image">Custom Image URL</option>
                  <option value="color">Solid Color</option>
                </select>
              </div>

              {settings.backgroundType === 'matrix' && (
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <input
                    type="checkbox"
                    checked={settings.showMatrixRain !== false}
                    onChange={(e) => onUpdateSettings({ ...settings, showMatrixRain: e.target.checked })}
                  />
                  Enable Matrix Rain Animation
                </label>
              )}

              {['unsplash', 'image', 'color'].includes(settings.backgroundType || '') && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                    {settings.backgroundType === 'color' ? 'Color (HEX/RGB)' : 'Image URL'}
                  </label>
                  <input
                    type="text"
                    value={settings.customBackgroundUrl || ''}
                    onChange={(e) => onUpdateSettings({ ...settings, customBackgroundUrl: e.target.value })}
                    placeholder={settings.backgroundType === 'color' ? '#1a1b26' : 'https://...'}
                    style={{ padding: '0.5rem', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)' }}
                  />
                  {settings.backgroundType === 'unsplash' && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Leave empty for a random image, or add keywords like: https://source.unsplash.com/1920x1080/?cyberpunk
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'commands' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                Define custom shortcuts for the Command Palette (Ctrl+K).
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {customCommands.map((cmd, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="Prefix (e.g. loc)"
                      value={cmd.prefix}
                      onChange={(e) => {
                        const newCmds = [...customCommands];
                        newCmds[idx].prefix = e.target.value;
                        saveCustomCommands(newCmds);
                      }}
                      style={{ width: '80px', padding: '0.4rem', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '0.8rem' }}
                    />
                    <input
                      type="text"
                      placeholder="Name (e.g. Localhost)"
                      value={cmd.name}
                      onChange={(e) => {
                        const newCmds = [...customCommands];
                        newCmds[idx].name = e.target.value;
                        saveCustomCommands(newCmds);
                      }}
                      style={{ width: '120px', padding: '0.4rem', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '0.8rem' }}
                    />
                    <input
                      type="text"
                      placeholder="URL (e.g. http://localhost:3000/)"
                      value={cmd.url}
                      onChange={(e) => {
                        const newCmds = [...customCommands];
                        newCmds[idx].url = e.target.value;
                        saveCustomCommands(newCmds);
                      }}
                      style={{ flex: 1, padding: '0.4rem', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '0.8rem' }}
                    />
                    <button
                      onClick={() => saveCustomCommands(customCommands.filter((_, i) => i !== idx))}
                      style={{ background: 'none', border: 'none', color: '#ff5f56', cursor: 'pointer', padding: '0.4rem' }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={() => saveCustomCommands([...customCommands, { id: Date.now().toString(), name: '', prefix: '', url: '', placeholder: 'Custom command...' }])}
                style={{ padding: '0.5rem', background: 'var(--bg-secondary)', border: '1px dashed var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                + Add Custom Command
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
