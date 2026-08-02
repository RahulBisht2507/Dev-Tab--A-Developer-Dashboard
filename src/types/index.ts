export type ThemeType = 'vscode' | 'tokyonight' | 'cyberpunk' | 'catppuccin' | 'matrix';

export interface ShortcutItem {
  id: string;
  title: string;
  url: string;
  icon?: string;
  category?: 'dev' | 'tool' | 'social' | 'custom';
  hotkey?: string;
}

export interface DevTask {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: number;
}

export interface TrendingRepo {
  owner: string;
  name: string;
  description: string;
  language: string;
  languageColor: string;
  stars: number;
  forks: number;
  url: string;
}

export interface HNStory {
  id: number;
  title: string;
  url: string;
  score: number;
  by: string;
  commentsCount: number;
  time: number;
}

export interface SearchEngine {
  id: string;
  name: string;
  prefix: string;
  url: string;
  placeholder: string;
}

export interface ServerTarget {
  id: string;
  name: string;
  url: string;
  status: 'online' | 'offline' | 'checking';
  latency?: number;
  lastChecked?: number;
}

export interface CryptoItem {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
}

export interface UserSettings {
  userName: string;
  theme: ThemeType;
  showFeeds: boolean;
  showScratchpad: boolean;
  showTimer: boolean;
  showSpeedDial: boolean;
  showMatrixRain: boolean;
  showGithubHeatmap: boolean;
  showServerMonitor: boolean;
  showCryptoTicker: boolean;
  showLofiPlayer: boolean;
  selectedLanguage: string;
  ambientSound: 'off' | 'rain' | 'white-noise' | 'synthwave';
  ambientVolume: number;
}
