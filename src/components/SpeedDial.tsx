import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ExternalLink } from 'lucide-react';
import { ShortcutItem } from '../types';
import { useStorage } from '../hooks/useStorage';

const INITIAL_SHORTCUTS: ShortcutItem[] = [
  { id: '1', title: 'GitHub', url: 'https://github.com', category: 'dev', hotkey: '1' },
  { id: '2', title: 'ChatGPT', url: 'https://chat.openai.com', category: 'tool', hotkey: '2' },
  { id: '3', title: 'StackOverflow', url: 'https://stackoverflow.com', category: 'dev', hotkey: '3' },
  { id: '4', title: 'Vercel', url: 'https://vercel.com', category: 'tool', hotkey: '4' },
  { id: '5', title: 'LeetCode', url: 'https://leetcode.com', category: 'dev', hotkey: '5' },
  { id: '6', title: 'Figma', url: 'https://figma.com', category: 'tool', hotkey: '6' },
  { id: '7', title: 'Dev.to', url: 'https://dev.to', category: 'social', hotkey: '7' },
  { id: '8', title: 'AWS Console', url: 'https://aws.amazon.com/console', category: 'tool', hotkey: '8' },
];

export const SpeedDial: React.FC = () => {
  const [shortcuts, setShortcuts] = useStorage<ShortcutItem[]>('devtab_shortcuts', INITIAL_SHORTCUTS);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');

  // Keybindings for 1-9 hotkeys when not inside an input field
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      const num = parseInt(e.key, 10);
      if (!isNaN(num) && num >= 1 && num <= shortcuts.length) {
        const targetShortcut = shortcuts[num - 1];
        if (targetShortcut) {
          window.location.href = targetShortcut.url;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);

  const handleAddShortcut = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;

    let formattedUrl = newUrl.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    const newShortcut: ShortcutItem = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      url: formattedUrl,
      category: 'custom',
      hotkey: shortcuts.length < 9 ? (shortcuts.length + 1).toString() : undefined,
    };

    setShortcuts([...shortcuts, newShortcut]);
    setNewTitle('');
    setNewUrl('');
    setIsAdding(false);
  };

  const handleDeleteShortcut = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const updated = shortcuts.filter((s) => s.id !== id);
    // Re-index hotkeys
    const reindexed = updated.map((item, idx) => ({
      ...item,
      hotkey: idx < 9 ? (idx + 1).toString() : undefined,
    }));
    setShortcuts(reindexed);
  };

  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch {
      return '';
    }
  };

  return (
    <div className="glass-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ExternalLink size={18} color="var(--accent-color)" />
          <span>Speed Dial & Hotkeys</span>
        </h2>
        <button
          className="btn-icon"
          style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}
          onClick={() => setIsAdding(!isAdding)}
        >
          <Plus size={14} />
          <span>Add Shortcut</span>
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddShortcut} style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '1rem',
          padding: '0.75rem',
          background: 'var(--bg-secondary)',
          borderRadius: '10px',
          border: '1px solid var(--border-color)',
          flexWrap: 'wrap'
        }}>
          <input
            type="text"
            placeholder="Title (e.g. GitHub)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            style={{
              flex: 1,
              minWidth: '120px',
              padding: '0.4rem 0.6rem',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              borderRadius: '6px',
              fontSize: '0.85rem'
            }}
          />
          <input
            type="text"
            placeholder="URL (e.g. github.com)"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            style={{
              flex: 2,
              minWidth: '160px',
              padding: '0.4rem 0.6rem',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              borderRadius: '6px',
              fontSize: '0.85rem'
            }}
          />
          <button type="submit" className="btn-icon" style={{ background: 'var(--accent-color)', color: '#fff', border: 'none' }}>
            Save
          </button>
        </form>
      )}

      <div className="speed-dial-grid">
        {shortcuts.map((item) => (
          <a
            key={item.id}
            href={item.url}
            className="speed-dial-item"
            title={`${item.title} (${item.url})`}
          >
            {item.hotkey && <span className="hotkey-badge">{item.hotkey}</span>}
            <button
              className="delete-btn"
              onClick={(e) => handleDeleteShortcut(item.id, e)}
              title="Delete shortcut"
              style={{
                position: 'absolute',
                top: '6px',
                left: '6px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                opacity: 0.5,
                cursor: 'pointer',
              }}
            >
              <Trash2 size={12} />
            </button>

            <div className="speed-dial-icon">
              <img
                src={getFaviconUrl(item.url)}
                alt={item.title}
                style={{ width: '22px', height: '22px', borderRadius: '4px' }}
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <span className="speed-dial-title">{item.title}</span>
          </a>
        ))}
      </div>
    </div>
  );
};
