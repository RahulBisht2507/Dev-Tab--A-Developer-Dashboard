import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SpeedDial } from './components/SpeedDial';
import { DevFeeds } from './components/DevFeeds';
import { DevNotes } from './components/DevNotes';
import { FocusTimer } from './components/FocusTimer';
import { CommandPalette } from './components/CommandPalette';
import { ThemeSwitcher } from './components/ThemeSwitcher';
import { SettingsModal } from './components/SettingsModal';
import { MatrixBackground } from './components/MatrixBackground';
import { DevUtilsModal } from './components/DevUtilsModal';
import { GithubHeatmap } from './components/GithubHeatmap';
import { ServerMonitor } from './components/ServerMonitor';
import { CryptoStockTicker } from './components/CryptoStockTicker';
import { LofiPlayer } from './components/LofiPlayer';
import { UserSettings, ThemeType } from './types';
import { useStorage } from './hooks/useStorage';

const DEFAULT_SETTINGS: UserSettings = {
  userName: 'alex',
  theme: 'tokyonight',
  showFeeds: true,
  showScratchpad: true,
  showTimer: true,
  showSpeedDial: true,
  showMatrixRain: false,
  showGithubHeatmap: true,
  showServerMonitor: true,
  showCryptoTicker: true,
  showLofiPlayer: true,
  selectedLanguage: 'all',
  ambientSound: 'off',
  ambientVolume: 0.3,
};

export function App() {
  const [settings, setSettings] = useStorage<UserSettings>('devtab_settings', DEFAULT_SETTINGS);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isDevUtilsOpen, setIsDevUtilsOpen] = useState(false);

  // Set theme data attribute on root element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme || 'tokyonight');
  }, [settings.theme]);

  // Listen for command palette trigger custom event
  useEffect(() => {
    const handleOpen = () => setIsCommandPaletteOpen(true);
    window.addEventListener('open-command-palette', handleOpen);
    return () => window.removeEventListener('open-command-palette', handleOpen);
  }, []);

  const handleSelectTheme = (theme: ThemeType) => {
    setSettings({ ...settings, theme });
  };

  const handleLanguageChange = (selectedLanguage: string) => {
    setSettings({ ...settings, selectedLanguage });
  };

  return (
    <>
      {/* Background Matrix Canvas */}
      <MatrixBackground enabled={settings.showMatrixRain !== false} />

      <div className="devtab-container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Terminal Header */}
        <Header
          userName={settings.userName || 'developer'}
          theme={settings.theme}
          onOpenThemeModal={() => setIsThemeModalOpen(true)}
          onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenDevUtils={() => setIsDevUtilsOpen(true)}
        />

        {/* Crypto & Stock Ticker */}
        {settings.showCryptoTicker !== false && <CryptoStockTicker />}

        {/* GitHub Heatmap Banner */}
        {settings.showGithubHeatmap !== false && (
          <GithubHeatmap userName={settings.userName || 'alex'} />
        )}

        {/* Main Dashboard Layout */}
        <div className="dashboard-grid">
          {/* Left Main Column */}
          <div className="left-column">
            {settings.showSpeedDial !== false && <SpeedDial />}
            {settings.showFeeds !== false && (
              <DevFeeds
                selectedLanguage={settings.selectedLanguage || 'all'}
                onLanguageChange={handleLanguageChange}
              />
            )}
          </div>

          {/* Right Sidebar Column */}
          <div className="right-column">
            {settings.showServerMonitor !== false && <ServerMonitor />}
            {settings.showLofiPlayer !== false && <LofiPlayer />}
            {settings.showTimer !== false && <FocusTimer />}
            {settings.showScratchpad !== false && <DevNotes />}
          </div>
        </div>

        {/* Modals & Overlays */}
        <CommandPalette
          isOpen={isCommandPaletteOpen}
          onClose={() => setIsCommandPaletteOpen(false)}
        />

        <DevUtilsModal
          isOpen={isDevUtilsOpen}
          onClose={() => setIsDevUtilsOpen(false)}
        />

        <ThemeSwitcher
          isOpen={isThemeModalOpen}
          onClose={() => setIsThemeModalOpen(false)}
          currentTheme={settings.theme}
          onSelectTheme={handleSelectTheme}
        />

        <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          settings={settings}
          onUpdateSettings={setSettings}
        />
      </div>
    </>
  );
}

export default App;
