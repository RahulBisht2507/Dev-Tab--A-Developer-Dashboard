import React, { useState, useEffect } from 'react';
import { Activity, Plus, RefreshCw, Trash2, Globe } from 'lucide-react';
import { ServerTarget } from '../../types';
import { useStorage } from '../../hooks/useStorage';

const INITIAL_SERVERS: ServerTarget[] = [
  { id: '1', name: 'GitHub API', url: 'https://api.github.com', status: 'checking' },
  { id: '2', name: 'Vercel CDN', url: 'https://vercel.com', status: 'checking' },
  { id: '3', name: 'HackerNews API', url: 'https://hacker-news.firebaseio.com/v0/topstories.json', status: 'checking' },
];

export const ServerMonitor: React.FC = () => {
  const [servers, setServers] = useStorage<ServerTarget[]>('devtab_servers', INITIAL_SERVERS);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');

  const checkServer = async (server: ServerTarget): Promise<ServerTarget> => {
    const startTime = performance.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      await fetch(server.url, {
        method: 'HEAD',
        mode: 'no-cors',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const latency = Math.round(performance.now() - startTime);

      return {
        ...server,
        status: 'online',
        latency,
        lastChecked: Date.now(),
      };
    } catch {
      const latency = Math.round(performance.now() - startTime);
      return {
        ...server,
        status: latency < 3500 ? 'online' : 'offline',
        latency: latency < 3500 ? latency : undefined,
        lastChecked: Date.now(),
      };
    }
  };

  const refreshAll = async () => {
    const updated = await Promise.all(servers.map((s) => checkServer(s)));
    setServers(updated);
  };

  useEffect(() => {
    refreshAll();
    const interval = setInterval(refreshAll, 60000); // refresh every 60s
    return () => clearInterval(interval);
  }, []);

  const handleAddServer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newUrl.trim()) return;

    let formattedUrl = newUrl.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    const newTarget: ServerTarget = {
      id: Date.now().toString(),
      name: newName.trim(),
      url: formattedUrl,
      status: 'checking',
    };

    const updated = [...servers, newTarget];
    setServers(updated);
    checkServer(newTarget).then((checked) => {
      setServers((prev) => prev.map((s) => (s.id === checked.id ? checked : s)));
    });

    setNewName('');
    setNewUrl('');
    setIsAdding(false);
  };

  const handleDeleteServer = (id: string) => {
    setServers(servers.filter((s) => s.id !== id));
  };

  return (
    <div className="glass-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={18} color="var(--accent-color)" />
          <span>API & Server Monitor</span>
        </h2>

        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button className="btn-icon" onClick={refreshAll} title="Refresh Server Latency">
            <RefreshCw size={13} />
          </button>
          <button className="btn-icon" onClick={() => setIsAdding(!isAdding)}>
            <Plus size={13} />
          </button>
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleAddServer} style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.8rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Name (e.g. Auth API)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            style={{ flex: 1, minWidth: '110px', padding: '0.4rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '0.8rem' }}
          />
          <input
            type="text"
            placeholder="URL (e.g. api.example.com)"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            style={{ flex: 2, minWidth: '150px', padding: '0.4rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '0.8rem' }}
          />
          <button type="submit" className="btn-icon" style={{ background: 'var(--accent-color)', color: '#fff', border: 'none' }}>
            Add
          </button>
        </form>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {servers.map((server) => (
          <div
            key={server.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.6rem 0.85rem',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span
                style={{
                  width: '9px',
                  height: '9px',
                  borderRadius: '50%',
                  backgroundColor: server.status === 'online' ? '#27c93f' : server.status === 'offline' ? '#ff5f56' : '#ffbd2e',
                  boxShadow: server.status === 'online' ? '0 0 8px #27c93f' : 'none'
                }}
              />
              <span style={{ fontWeight: 500, fontSize: '0.85rem' }}>{server.name}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }} className="mono">
              <span style={{ fontSize: '0.78rem', color: server.status === 'online' ? 'var(--text-accent)' : 'var(--text-secondary)' }}>
                {server.latency ? `${server.latency}ms` : server.status}
              </span>
              <a href={server.url} target="_blank" rel="noreferrer" style={{ color: 'var(--text-secondary)', display: 'flex' }}>
                <Globe size={13} />
              </a>
              <button
                onClick={() => handleDeleteServer(server.id)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', opacity: 0.6, cursor: 'pointer' }}
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
