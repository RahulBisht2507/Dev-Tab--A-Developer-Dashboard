import { useState, useEffect, useCallback } from 'react';

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';
const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';

export interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
  albumArt: string;
  isPlaying: boolean;
  duration_ms: number;
  progress_ms: number;
}

// PKCE Helper Functions
function generateRandomString(length: number) {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

async function generateCodeChallenge(codeVerifier: string) {
  const data = new TextEncoder().encode(codeVerifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function useSpotify(clientId?: string) {
  const [token, setToken] = useState<string | null>(null);
  const [currentTrack, setCurrentTrack] = useState<SpotifyTrack | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check for token in URL or LocalStorage
  useEffect(() => {
    let localToken = localStorage.getItem('devtab_spotify_access_token');
    
    // Check if we just returned from OAuth with a code
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code && clientId) {
      const codeVerifier = localStorage.getItem('devtab_spotify_code_verifier');
      const redirectUri = window.location.origin + window.location.pathname;

      if (!codeVerifier) {
          setError('Authentication failed (missing code verifier)');
          return;
      }

      // Exchange code for token
      const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
        client_id: clientId,
        code_verifier: codeVerifier
      });

      fetch(SPOTIFY_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString()
      })
      .then(res => res.json())
      .then(data => {
        if (data.access_token) {
          localStorage.setItem('devtab_spotify_access_token', data.access_token);
          if (data.refresh_token) {
            localStorage.setItem('devtab_spotify_refresh_token', data.refresh_token);
          }
          setToken(data.access_token);
          // Clean up URL
          window.history.replaceState(null, '', window.location.pathname);
        } else {
          setError('Failed to retrieve access token.');
        }
      })
      .catch(err => {
        console.error('Token exchange error', err);
        setError('Token exchange error');
      });

      return;
    }

    if (localToken) {
      setToken(localToken);
    }
  }, [clientId]);

  const login = async () => {
    if (!clientId) {
      setError('Please configure your Spotify Client ID in settings.');
      return;
    }
    const redirectUri = window.location.origin + window.location.pathname;
    const scopes = [
      'user-read-playback-state',
      'user-modify-playback-state',
      'user-read-currently-playing',
    ].join(' ');

    const codeVerifier = generateRandomString(128);
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    localStorage.setItem('devtab_spotify_code_verifier', codeVerifier);

    const args = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      scope: scopes,
      redirect_uri: redirectUri,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge
    });

    window.location.href = `${SPOTIFY_AUTH_URL}?${args.toString()}`;
  };

  const logout = () => {
    setToken(null);
    setCurrentTrack(null);
    localStorage.removeItem('devtab_spotify_access_token');
    localStorage.removeItem('devtab_spotify_refresh_token');
    localStorage.removeItem('devtab_spotify_code_verifier');
  };

  const fetchCurrentlyPlaying = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${SPOTIFY_API_BASE}/me/player/currently-playing`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.status === 204) {
        // No active device
        setCurrentTrack(null);
        return;
      }
      if (res.status === 401) {
        logout();
        return;
      }
      
      const data = await res.json();
      if (data && data.item) {
        setCurrentTrack({
          id: data.item.id,
          name: data.item.name,
          artist: data.item.artists.map((a: any) => a.name).join(', '),
          albumArt: data.item.album.images[0]?.url || '',
          isPlaying: data.is_playing,
          duration_ms: data.item.duration_ms,
          progress_ms: data.progress_ms
        });
      }
    } catch (e) {
      console.warn('Failed to fetch Spotify status', e);
    }
  }, [token]);

  // Poll for track updates
  useEffect(() => {
    if (!token) return;
    fetchCurrentlyPlaying();
    const interval = setInterval(fetchCurrentlyPlaying, 5000);
    return () => clearInterval(interval);
  }, [token, fetchCurrentlyPlaying]);

  const controlPlayback = async (action: 'play' | 'pause' | 'next' | 'previous') => {
    if (!token) return;
    try {
      const method = action === 'next' || action === 'previous' ? 'POST' : 'PUT';
      await fetch(`${SPOTIFY_API_BASE}/me/player/${action}`, {
        method,
        headers: { Authorization: `Bearer ${token}` }
      });
      // Optimistic update
      if (action === 'play' || action === 'pause') {
        setCurrentTrack(prev => prev ? { ...prev, isPlaying: action === 'play' } : null);
      }
      setTimeout(fetchCurrentlyPlaying, 500);
    } catch (e) {
      console.warn(`Failed to ${action} Spotify`, e);
    }
  };

  return { token, currentTrack, error, login, logout, controlPlayback };
}
