import React, { useState } from 'react';
import { X, Code, Key, Binary, Sliders, Regex, Copy, Check, AlertCircle } from 'lucide-react';

interface DevUtilsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DevUtilsModal: React.FC<DevUtilsModalProps> = ({ isOpen, onClose }) => {
  const [activeTool, setActiveTool] = useState<'json' | 'jwt' | 'base64' | 'css' | 'regex'>('json');
  const [copied, setCopied] = useState(false);

  // JSON Tool State
  const [jsonInput, setJsonInput] = useState('{\n  "name": "DevTab",\n  "version": 1.0,\n  "awesome": true\n}');
  const [jsonError, setJsonError] = useState<string | null>(null);

  // JWT Tool State
  const [jwtInput, setJwtInput] = useState('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFsZXggRGV2IiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');
  const [jwtHeader, setJwtHeader] = useState('');
  const [jwtPayload, setJwtPayload] = useState('');

  // Base64 Tool State
  const [base64Text, setBase64Text] = useState('DevTab Developer Extensions');
  const [base64Result, setBase64Result] = useState('');

  // CSS Generator State
  const [blur, setBlur] = useState(12);
  const [bgOpacity, setBgOpacity] = useState(0.25);
  const [borderRadius, setBorderRadius] = useState(14);
  const [shadowBlur, setShadowBlur] = useState(25);

  // Regex State
  const [regexPattern, setRegexPattern] = useState('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}');
  const [regexFlags, setRegexFlags] = useState('gi');
  const [regexText, setRegexText] = useState('Contact us at support@devtab.io or alex@github.com for assistance.');
  const [regexMatches, setRegexMatches] = useState<string[]>([]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // JSON Formatter
  const formatJson = (pretty: boolean) => {
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(parsed, null, pretty ? 2 : 0));
      setJsonError(null);
    } catch (err: any) {
      setJsonError(err.message || 'Invalid JSON syntax');
    }
  };

  // JWT Decoder
  const decodeJwt = () => {
    try {
      const parts = jwtInput.trim().split('.');
      if (parts.length < 2) throw new Error('Invalid JWT structure (must have 3 dot-separated parts)');
      const headerObj = JSON.parse(atob(parts[0]));
      const payloadObj = JSON.parse(atob(parts[1]));
      setJwtHeader(JSON.stringify(headerObj, null, 2));
      setJwtPayload(JSON.stringify(payloadObj, null, 2));
    } catch (err: any) {
      setJwtHeader('');
      setJwtPayload(`Error decoding JWT: ${err.message}`);
    }
  };

  // Base64 Process
  const handleBase64 = (encode: boolean) => {
    try {
      if (encode) setBase64Result(btoa(base64Text));
      else setBase64Result(atob(base64Text));
    } catch (err: any) {
      setBase64Result(`Base64 Error: ${err.message}`);
    }
  };

  // Regex Tester
  const testRegex = () => {
    try {
      const re = new RegExp(regexPattern, regexFlags);
      const matches = regexText.match(re) || [];
      setRegexMatches(matches);
    } catch {
      setRegexMatches([]);
    }
  };

  const generatedCss = `background: rgba(255, 255, 255, ${bgOpacity});
backdrop-filter: blur(${blur}px);
-webkit-backdrop-filter: blur(${blur}px);
border-radius: ${borderRadius}px;
box-shadow: 0 8px ${shadowBlur}px rgba(0, 0, 0, 0.4);`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '720px', width: '92%' }}>
        {/* Header Tabs */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.85rem 1.25rem',
          background: 'var(--bg-primary)',
          borderBottom: '1px solid var(--border-color)',
          overflowX: 'auto'
        }}>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {[
              { id: 'json', label: 'JSON Tool', icon: Code },
              { id: 'jwt', label: 'JWT Decoder', icon: Key },
              { id: 'base64', label: 'Base64', icon: Binary },
              { id: 'css', label: 'CSS Glass', icon: Sliders },
              { id: 'regex', label: 'Regex Sandbox', icon: Regex },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTool(id as any)}
                className="mono"
                style={{
                  background: activeTool === id ? 'var(--accent-color)' : 'transparent',
                  color: activeTool === id ? '#fff' : 'var(--text-secondary)',
                  border: 'none',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  whiteSpace: 'nowrap'
                }}
              >
                <Icon size={14} />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Tool Body */}
        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '75vh', overflowY: 'auto' }}>
          {/* JSON Tool */}
          {activeTool === 'json' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn-icon" onClick={() => formatJson(true)}>Prettify JSON</button>
                <button className="btn-icon" onClick={() => formatJson(false)}>Minify JSON</button>
                <button className="btn-icon" onClick={() => copyToClipboard(jsonInput)}>
                  {copied ? <Check size={14} color="#27c93f" /> : <Copy size={14} />} Copy
                </button>
              </div>

              {jsonError && (
                <div style={{ background: 'rgba(255, 95, 86, 0.15)', color: '#ff5f56', padding: '0.5rem 0.8rem', borderRadius: '6px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }} className="mono">
                  <AlertCircle size={14} /> {jsonError}
                </div>
              )}

              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                className="mono"
                rows={12}
                style={{
                  width: '100%',
                  background: 'var(--code-bg)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  fontSize: '0.85rem'
                }}
              />
            </div>
          )}

          {/* JWT Decoder */}
          {activeTool === 'jwt' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }} className="mono">Paste JWT Token:</label>
              <textarea
                value={jwtInput}
                onChange={(e) => setJwtInput(e.target.value)}
                className="mono"
                rows={3}
                style={{ width: '100%', background: 'var(--code-bg)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.5rem', fontSize: '0.8rem' }}
              />
              <button className="btn-icon" onClick={decodeJwt} style={{ width: 'fit-content', background: 'var(--accent-color)', color: '#fff', border: 'none' }}>
                Decode JWT
              </button>

              {jwtPayload && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-color)' }} className="mono">HEADER:</span>
                    <pre className="mono" style={{ background: 'var(--code-bg)', padding: '0.6rem', borderRadius: '6px', fontSize: '0.75rem', overflowX: 'auto', border: '1px solid var(--border-color)' }}>
                      {jwtHeader || '{}'}
                    </pre>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-accent)' }} className="mono">PAYLOAD:</span>
                    <pre className="mono" style={{ background: 'var(--code-bg)', padding: '0.6rem', borderRadius: '6px', fontSize: '0.75rem', overflowX: 'auto', border: '1px solid var(--border-color)' }}>
                      {jwtPayload}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Base64 Tool */}
          {activeTool === 'base64' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <textarea
                value={base64Text}
                onChange={(e) => setBase64Text(e.target.value)}
                className="mono"
                rows={4}
                placeholder="Enter text to encode or base64 to decode..."
                style={{ width: '100%', background: 'var(--code-bg)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.6rem', fontSize: '0.85rem' }}
              />

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn-icon" onClick={() => handleBase64(true)} style={{ background: 'var(--accent-color)', color: '#fff', border: 'none' }}>Base64 Encode</button>
                <button className="btn-icon" onClick={() => handleBase64(false)}>Base64 Decode</button>
              </div>

              {base64Result && (
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }} className="mono">Result:</span>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '4px' }}>
                    <input
                      readOnly
                      value={base64Result}
                      className="mono"
                      style={{ flex: 1, background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.5rem', color: 'var(--accent-color)', fontSize: '0.85rem' }}
                    />
                    <button className="btn-icon" onClick={() => copyToClipboard(base64Result)}>Copy</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CSS Glass Generator */}
          {activeTool === 'css' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <label style={{ fontSize: '0.8rem' }} className="mono">Blur ({blur}px):</label>
                  <input type="range" min="0" max="40" value={blur} onChange={(e) => setBlur(Number(e.target.value))} style={{ accentColor: 'var(--accent-color)' }} />

                  <label style={{ fontSize: '0.8rem' }} className="mono">Bg Opacity ({bgOpacity}):</label>
                  <input type="range" min="0" max="1" step="0.05" value={bgOpacity} onChange={(e) => setBgOpacity(Number(e.target.value))} style={{ accentColor: 'var(--accent-color)' }} />

                  <label style={{ fontSize: '0.8rem' }} className="mono">Border Radius ({borderRadius}px):</label>
                  <input type="range" min="0" max="40" value={borderRadius} onChange={(e) => setBorderRadius(Number(e.target.value))} style={{ accentColor: 'var(--accent-color)' }} />

                  <label style={{ fontSize: '0.8rem' }} className="mono">Shadow Blur ({shadowBlur}px):</label>
                  <input type="range" min="0" max="60" value={shadowBlur} onChange={(e) => setShadowBlur(Number(e.target.value))} style={{ accentColor: 'var(--accent-color)' }} />
                </div>

                {/* Live Preview Box */}
                <div style={{
                  background: `rgba(255, 255, 255, ${bgOpacity})`,
                  backdropFilter: `blur(${blur}px)`,
                  WebkitBackdropFilter: `blur(${blur}px)`,
                  borderRadius: `${borderRadius}px`,
                  boxShadow: `0 8px ${shadowBlur}px rgba(0, 0, 0, 0.4)`,
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '160px',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '0.95rem'
                }} className="mono">
                  Glass Preview Box
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }} className="mono">Generated CSS:</span>
                  <button className="btn-icon" onClick={() => copyToClipboard(generatedCss)} style={{ padding: '2px 8px', fontSize: '0.75rem' }}>
                    {copied ? <Check size={12} color="#27c93f" /> : <Copy size={12} />} Copy CSS
                  </button>
                </div>
                <pre className="mono" style={{ background: 'var(--code-bg)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--accent-color)', border: '1px solid var(--border-color)' }}>
                  {generatedCss}
                </pre>
              </div>
            </div>
          )}

          {/* Regex Sandbox */}
          {activeTool === 'regex' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  value={regexPattern}
                  onChange={(e) => setRegexPattern(e.target.value)}
                  placeholder="Regex pattern (e.g. [a-z]+)"
                  className="mono"
                  style={{ flex: 3, background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.5rem', color: 'var(--accent-color)', fontSize: '0.85rem' }}
                />
                <input
                  type="text"
                  value={regexFlags}
                  onChange={(e) => setRegexFlags(e.target.value)}
                  placeholder="Flags (gi)"
                  className="mono"
                  style={{ flex: 1, background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}
                />
                <button className="btn-icon" onClick={testRegex} style={{ background: 'var(--accent-color)', color: '#fff', border: 'none' }}>
                  Test Regex
                </button>
              </div>

              <textarea
                value={regexText}
                onChange={(e) => setRegexText(e.target.value)}
                className="mono"
                rows={4}
                placeholder="Test text..."
                style={{ width: '100%', background: 'var(--code-bg)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.6rem', fontSize: '0.85rem' }}
              />

              <div className="mono" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Matches Found: <strong style={{ color: 'var(--accent-color)' }}>{regexMatches.length}</strong>
              </div>

              {regexMatches.length > 0 && (
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {regexMatches.map((m, idx) => (
                    <span key={idx} className="mono" style={{ background: 'var(--badge-bg)', color: 'var(--accent-color)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', border: '1px solid var(--accent-color)' }}>
                      {m}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
