import React, { useState } from 'react';
import { Code2, CheckSquare, Plus, Trash2, Copy, Check } from 'lucide-react';
import { DevTask } from '../../types';
import { useStorage } from '../../hooks/useStorage';

const DEFAULT_SNIPPET = `// DevTab Quick Scratchpad
const devSession = {
  activeTask: 'Build custom Chrome extension',
  status: 'In Progress 🚀',
  notes: 'Shortcut: Ctrl+K for search palette',
};

console.log(devSession);`;

const INITIAL_TASKS: DevTask[] = [
  { id: '1', text: 'Set up Vite + React + TS Chrome Extension', completed: true, priority: 'high', createdAt: Date.now() },
  { id: '2', text: 'Customize DevTab theme and speed dial links', completed: false, priority: 'high', createdAt: Date.now() },
  { id: '3', text: 'Review GitHub trending repos', completed: false, priority: 'medium', createdAt: Date.now() },
];

export const DevNotes: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'scratchpad'>('tasks');
  const [snippet, setSnippet] = useStorage<string>('devtab_code_snippet', DEFAULT_SNIPPET);
  const [tasks, setTasks] = useStorage<DevTask[]>('devtab_tasks', INITIAL_TASKS);
  const [newTaskText, setNewTaskText] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [copied, setCopied] = useState(false);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    const newTask: DevTask = {
      id: Date.now().toString(),
      text: newTaskText.trim(),
      completed: false,
      priority,
      createdAt: Date.now(),
    };

    setTasks([newTask, ...tasks]);
    setNewTaskText('');
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Header Tabs */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '0.6rem'
      }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('tasks')}
            className="mono"
            style={{
              background: activeTab === 'tasks' ? 'var(--badge-bg)' : 'transparent',
              color: activeTab === 'tasks' ? 'var(--accent-color)' : 'var(--text-secondary)',
              border: activeTab === 'tasks' ? '1px solid var(--accent-color)' : 'none',
              padding: '4px 10px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <CheckSquare size={14} />
            <span>Sprint Tasks ({tasks.filter((t) => !t.completed).length})</span>
          </button>

          <button
            onClick={() => setActiveTab('scratchpad')}
            className="mono"
            style={{
              background: activeTab === 'scratchpad' ? 'var(--badge-bg)' : 'transparent',
              color: activeTab === 'scratchpad' ? 'var(--accent-color)' : 'var(--text-secondary)',
              border: activeTab === 'scratchpad' ? '1px solid var(--accent-color)' : 'none',
              padding: '4px 10px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <Code2 size={14} />
            <span>Scratchpad</span>
          </button>
        </div>

        {activeTab === 'scratchpad' && (
          <button
            onClick={handleCopySnippet}
            className="mono btn-icon"
            style={{ padding: '2px 8px', fontSize: '0.75rem' }}
          >
            {copied ? <Check size={12} color="#27c93f" /> : <Copy size={12} />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>
        )}
      </div>

      {/* Sprint Tasks Tab */}
      {activeTab === 'tasks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <form onSubmit={handleAddTask} style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              placeholder="Add sprint task (e.g. Fix bug #402)..."
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              style={{
                flex: 1,
                padding: '0.5rem 0.75rem',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '0.85rem'
              }}
            />
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="mono"
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)',
                borderRadius: '8px',
                padding: '0.4rem',
                fontSize: '0.75rem'
              }}
            >
              <option value="low">Low</option>
              <option value="medium">Med</option>
              <option value="high">High</option>
            </select>
            <button
              type="submit"
              className="btn-icon"
              style={{ background: 'var(--accent-color)', color: '#fff', border: 'none' }}
            >
              <Plus size={16} />
            </button>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '220px', overflowY: 'auto' }}>
            {tasks.map((task) => (
              <div
                key={task.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.5rem 0.75rem',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  opacity: task.completed ? 0.6 : 1,
                  transition: 'all 0.2s ease'
                }}
              >
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                  style={{ accentColor: 'var(--accent-color)', cursor: 'pointer', width: '16px', height: '16px' }}
                />
                <span style={{
                  flex: 1,
                  fontSize: '0.85rem',
                  textDecoration: task.completed ? 'line-through' : 'none',
                  color: task.completed ? 'var(--text-secondary)' : 'var(--text-primary)'
                }}>
                  {task.text}
                </span>

                <span
                  className="mono"
                  style={{
                    fontSize: '0.65rem',
                    padding: '1px 5px',
                    borderRadius: '4px',
                    textTransform: 'uppercase',
                    background: task.priority === 'high' ? 'rgba(255, 95, 86, 0.2)' : task.priority === 'medium' ? 'rgba(255, 189, 46, 0.2)' : 'rgba(39, 201, 63, 0.2)',
                    color: task.priority === 'high' ? '#ff5f56' : task.priority === 'medium' ? '#ffbd2e' : '#27c93f'
                  }}
                >
                  {task.priority}
                </span>

                <button
                  onClick={() => deleteTask(task.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', opacity: 0.7 }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Code Scratchpad Tab */}
      {activeTab === 'scratchpad' && (
        <div style={{ position: 'relative' }}>
          <textarea
            value={snippet}
            onChange={(e) => setSnippet(e.target.value)}
            className="mono"
            rows={8}
            placeholder="// Type notes or code snippets here..."
            style={{
              width: '100%',
              background: 'var(--code-bg)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '0.75rem',
              fontSize: '0.85rem',
              lineHeight: '1.5',
              outline: 'none',
              resize: 'vertical'
            }}
          />
        </div>
      )}
    </div>
  );
};
