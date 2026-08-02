import React, { useState } from 'react';
import { Github, Flame, Star, GitFork, MessageSquare, ExternalLink, RefreshCw } from 'lucide-react';
import { useFetchFeeds } from '../../hooks/useFetchFeeds';

interface DevFeedsProps {
  selectedLanguage: string;
  onLanguageChange: (lang: string) => void;
}

export const DevFeeds: React.FC<DevFeedsProps> = ({ selectedLanguage, onLanguageChange }) => {
  const [activeTab, setActiveTab] = useState<'github' | 'hackernews'>('github');
  const { hnStories, githubRepos, loading } = useFetchFeeds(selectedLanguage);

  const LANGUAGES = ['all', 'typescript', 'javascript', 'python', 'rust', 'go'];

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header & Tabs */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.75rem',
        marginBottom: '1rem',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '0.75rem'
      }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('github')}
            className="mono"
            style={{
              background: activeTab === 'github' ? 'var(--accent-color)' : 'var(--bg-secondary)',
              color: activeTab === 'github' ? '#fff' : 'var(--text-secondary)',
              border: '1px solid var(--border-color)',
              padding: '6px 14px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 500,
              transition: 'all 0.2s ease'
            }}
          >
            <Github size={16} />
            <span>GitHub Trending</span>
          </button>

          <button
            onClick={() => setActiveTab('hackernews')}
            className="mono"
            style={{
              background: activeTab === 'hackernews' ? 'var(--accent-color)' : 'var(--bg-secondary)',
              color: activeTab === 'hackernews' ? '#fff' : 'var(--text-secondary)',
              border: '1px solid var(--border-color)',
              padding: '6px 14px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 500,
              transition: 'all 0.2s ease'
            }}
          >
            <Flame size={16} color={activeTab === 'hackernews' ? '#fff' : '#ff6600'} />
            <span>Hacker News</span>
          </button>
        </div>

        {/* GitHub Language Filter */}
        {activeTab === 'github' && (
          <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }} className="mono">Lang:</span>
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                onClick={() => onLanguageChange(lang)}
                className="mono"
                style={{
                  background: selectedLanguage === lang ? 'var(--badge-bg)' : 'transparent',
                  color: selectedLanguage === lang ? 'var(--accent-color)' : 'var(--text-secondary)',
                  border: selectedLanguage === lang ? '1px solid var(--accent-color)' : 'none',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  textTransform: 'capitalize'
                }}
              >
                {lang}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Feed Content */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {loading && (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }} className="mono">
            <RefreshCw size={20} className="spin" style={{ display: 'inline', marginRight: '8px' }} />
            Fetching developer feeds...
          </div>
        )}

        {/* GitHub Trending View */}
        {activeTab === 'github' && !loading && (
          githubRepos.map((repo, idx) => (
            <a
              key={idx}
              href={repo.url}
              target="_blank"
              rel="noreferrer"
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                padding: '0.85rem 1rem',
                textDecoration: 'none',
                color: 'var(--text-primary)',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem'
              }}
              className="feed-item"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-accent)' }} className="mono">
                  {repo.owner} / <strong style={{ color: 'var(--text-primary)' }}>{repo.name}</strong>
                </span>
                <div style={{ display: 'flex', gap: '0.8rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }} className="mono">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Star size={13} color="#eac54f" /> {repo.stars.toLocaleString()}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <GitFork size={13} /> {repo.forks.toLocaleString()}
                  </span>
                </div>
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', opacity: 0.9, margin: '2px 0' }}>
                {repo.description}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '2px' }}>
                <span style={{
                  width: '9px',
                  height: '9px',
                  borderRadius: '50%',
                  backgroundColor: repo.languageColor || 'var(--accent-color)'
                }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }} className="mono">
                  {repo.language}
                </span>
              </div>
            </a>
          ))
        )}

        {/* Hacker News View */}
        {activeTab === 'hackernews' && (
          hnStories.map((story) => (
            <a
              key={story.id}
              href={story.url}
              target="_blank"
              rel="noreferrer"
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                padding: '0.85rem 1rem',
                textDecoration: 'none',
                color: 'var(--text-primary)',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                <span style={{ fontWeight: 500, fontSize: '0.92rem', lineHeight: '1.4' }}>
                  {story.title}
                </span>
                <ExternalLink size={14} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
              </div>

              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }} className="mono">
                <span style={{ color: '#ff6600', fontWeight: 600 }}>▲ {story.score} points</span>
                <span>by {story.by}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <MessageSquare size={12} /> {story.commentsCount} comments
                </span>
              </div>
            </a>
          ))
        )}
      </div>
    </div>
  );
};
