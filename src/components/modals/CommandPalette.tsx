import React, { useState, useEffect, useRef } from 'react';
import { Search, Globe, Github, Terminal, BookOpen, Package, Youtube, Calculator, X } from 'lucide-react';
import { SearchEngine } from '../../types';

const SEARCH_ENGINES: SearchEngine[] = [
  { id: 'google', name: 'Google', prefix: '', url: 'https://www.google.com/search?q=', placeholder: 'Search web or type prefix (gh, so, mdn, npm)...' },
  { id: 'github', name: 'GitHub', prefix: 'gh', url: 'https://github.com/search?q=', placeholder: 'Search GitHub repos or code...' },
  { id: 'stackoverflow', name: 'StackOverflow', prefix: 'so', url: 'https://stackoverflow.com/search?q=', placeholder: 'Search StackOverflow questions...' },
  { id: 'mdn', name: 'MDN Web', prefix: 'mdn', url: 'https://developer.mozilla.org/en-US/search?q=', placeholder: 'Search MDN documentation...' },
  { id: 'npm', name: 'npm', prefix: 'npm', url: 'https://www.npmjs.com/search?q=', placeholder: 'Search npm packages...' },
  { id: 'youtube', name: 'YouTube', prefix: 'yt', url: 'https://www.youtube.com/results?search_query=', placeholder: 'Search YouTube tutorials...' },
];

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedEngine, setSelectedEngine] = useState<SearchEngine>(SEARCH_ENGINES[0]);
  const [calcResult, setCalcResult] = useState<string | null>(null);
  const [customEngines, setCustomEngines] = useState<SearchEngine[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('devtab_custom_commands');
      if (stored) {
        setCustomEngines(JSON.parse(stored).data || []);
      }
    } catch (e) {}
  }, [isOpen]);

  const allEngines = [...SEARCH_ENGINES, ...customEngines];

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setCalcResult(null);
    }
  }, [isOpen]);

  // Global Ctrl+K hotkey
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open palette
          const event = new CustomEvent('open-command-palette');
          window.dispatchEvent(event);
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Process prefix & math calculations
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setCalcResult(null);
      return;
    }

    // Check for prefix match (e.g. "gh react" or "so flexbox")
    const spaceIndex = trimmed.indexOf(' ');
    if (spaceIndex > 0) {
      const firstWord = trimmed.slice(0, spaceIndex).toLowerCase();
      const matched = allEngines.find((e) => e.prefix === firstWord);
      if (matched && matched.id !== selectedEngine.id) {
        setSelectedEngine(matched);
      }
    }

    // Try inline math calculation
    try {
      if (/^[0-9+\-*/().\s^%]+$/.test(trimmed) && /[0-9]/.test(trimmed)) {
        // Safe math evaluation
        const sanitized = trimmed.replace(/\^/g, '**');
        const res = new Function(`"use strict"; return (${sanitized})`)();
        if (typeof res === 'number' && !isNaN(res)) {
          setCalcResult(`Result: ${res}`);
          return;
        }
      }
    } catch {
      // Ignore evaluation errors
    }

    setCalcResult(null);
  }, [query, selectedEngine.id]);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    let finalQuery = query.trim();
    let engine = selectedEngine;

    // Check if query starts with prefix
    const parts = finalQuery.split(' ');
    const potentialPrefix = parts[0].toLowerCase();
    const matchedPrefix = allEngines.find((s) => s.prefix === potentialPrefix);

    if (matchedPrefix && parts.length > 1) {
      engine = matchedPrefix;
      finalQuery = parts.slice(1).join(' ');
    }

    const targetUrl = `${engine.url}${encodeURIComponent(finalQuery)}`;
    window.location.href = targetUrl;
  };

  const getEngineIcon = (id: string) => {
    switch (id) {
      case 'github': return <Github size={16} />;
      case 'stackoverflow': return <Terminal size={16} />;
      case 'mdn': return <BookOpen size={16} />;
      case 'npm': return <Package size={16} />;
      case 'youtube': return <Youtube size={16} />;
      default: return <Globe size={16} />;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Search Engine Selector Tabs */}
        <div style={{
          display: 'flex',
          gap: '0.4rem',
          padding: '0.75rem 1rem',
          background: 'var(--bg-primary)',
          borderBottom: '1px solid var(--border-color)',
          overflowX: 'auto'
        }}>
          {allEngines.map((engine) => (
            <button
              key={engine.id}
              onClick={() => setSelectedEngine(engine)}
              className="mono"
              style={{
                background: selectedEngine.id === engine.id ? 'var(--accent-color)' : 'transparent',
                color: selectedEngine.id === engine.id ? '#fff' : 'var(--text-secondary)',
                border: 'none',
                padding: '4px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              {getEngineIcon(engine.id)}
              <span>{engine.name}</span>
              {engine.prefix && (
                <span style={{
                  fontSize: '0.65rem',
                  opacity: 0.8,
                  background: 'rgba(0,0,0,0.2)',
                  padding: '1px 4px',
                  borderRadius: '3px'
                }}>
                  {engine.prefix}
                </span>
              )}
            </button>
          ))}

          <button
            onClick={onClose}
            style={{
              marginLeft: 'auto',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSearch} style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg-primary)', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <Search size={20} color="var(--accent-color)" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={selectedEngine.placeholder}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text-primary)',
                fontFamily: 'inherit',
                fontSize: '1.05rem',
              }}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Calculator Output */}
          {calcResult && (
            <div style={{
              background: 'var(--badge-bg)',
              color: 'var(--accent-color)',
              padding: '0.6rem 1rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.95rem'
            }} className="mono">
              <Calculator size={18} />
              <span>{calcResult}</span>
            </div>
          )}

          {/* Quick Hints */}
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.75rem' }} className="mono">
            <span>Tip: type prefix e.g. <strong style={{ color: 'var(--accent-color)' }}>gh react</strong> or <strong style={{ color: 'var(--accent-color)' }}>so css grid</strong></span>
            <span>Press <kbd style={{ background: 'var(--bg-tertiary)', padding: '1px 4px', borderRadius: '3px' }}>↵ Enter</kbd> to search</span>
          </div>
        </form>
      </div>
    </div>
  );
};
