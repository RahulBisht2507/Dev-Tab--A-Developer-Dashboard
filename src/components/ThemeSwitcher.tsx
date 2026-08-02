import React from 'react';
import { X, Check } from 'lucide-react';
import { ThemeType } from '../types';

interface ThemeSwitcherProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeType;
  onSelectTheme: (theme: ThemeType) => void;
}

const THEMES: { id: ThemeType; name: string; primary: string; accent: string; desc: string }[] = [
  { id: 'vscode', name: 'VS Code Dark', primary: '#1e1e1e', accent: '#007acc', desc: 'Classic Microsoft VS Code editor look' },
  { id: 'tokyonight', name: 'Tokyo Night', primary: '#1a1b26', accent: '#7aa2f7', desc: 'Sleek neon theme inspired by Tokyo lights' },
  { id: 'cyberpunk', name: 'Cyberpunk Neon', primary: '#090a10', accent: '#00f0ff', desc: 'High-contrast glowing cyan & magenta' },
  { id: 'catppuccin', name: 'Catppuccin Mocha', primary: '#1e1e2e', accent: '#cba6f7', desc: 'Soothing warm pastel theme for coders' },
  { id: 'matrix', name: 'Matrix Green', primary: '#040a06', accent: '#00ff66', desc: 'Terminal green digital rain aesthetic' },
];

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem 1.25rem',
          borderBottom: '1px solid var(--border-color)'
        }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Select Color Theme</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {THEMES.map((theme) => (
            <div
              key={theme.id}
              onClick={() => {
                onSelectTheme(theme.id);
                onClose();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                background: theme.primary,
                border: currentTheme === theme.id ? `2px solid ${theme.accent}` : '1px solid var(--border-color)',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'transform 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <span style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: theme.accent,
                  boxShadow: `0 0 10px ${theme.accent}`
                }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.92rem', color: '#fff' }}>{theme.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)' }}>{theme.desc}</div>
                </div>
              </div>

              {currentTheme === theme.id && <Check size={18} color={theme.accent} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
