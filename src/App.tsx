import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Header } from './components/layout/Header';
import { SpeedDial } from './components/widgets/SpeedDial';
import { DevFeeds } from './components/widgets/DevFeeds';
import { DevNotes } from './components/widgets/DevNotes';
import { FocusTimer } from './components/widgets/FocusTimer';
import { CommandPalette } from './components/modals/CommandPalette';
import { ThemeSwitcher } from './components/modals/ThemeSwitcher';
import { SettingsModal } from './components/modals/SettingsModal';
import { MatrixBackground } from './components/layout/MatrixBackground';
import { DevUtilsModal } from './components/modals/DevUtilsModal';
import { GithubHeatmap } from './components/widgets/GithubHeatmap';
import { ServerMonitor } from './components/widgets/ServerMonitor';
import { CryptoStockTicker } from './components/widgets/CryptoStockTicker';
import { LofiPlayer } from './components/widgets/LofiPlayer';
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
  backgroundType: 'matrix',
  customBackgroundUrl: '',
  spotifyPlayerMode: 'lofi',
};

export function App() {
  const [settings, setSettings] = useStorage<UserSettings>('devtab_settings', DEFAULT_SETTINGS);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isDevUtilsOpen, setIsDevUtilsOpen] = useState(false);

  const [layout, setLayout] = useStorage<{leftColumn: string[], rightColumn: string[]}>('devtab_layout', {
    leftColumn: ['speedDial', 'devFeeds'],
    rightColumn: ['serverMonitor', 'lofiPlayer', 'focusTimer', 'devNotes']
  });

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination } = result;

    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const newLayout = { ...layout };
    const sourceCol = newLayout[source.droppableId as keyof typeof newLayout];
    const destCol = newLayout[destination.droppableId as keyof typeof newLayout];
    
    const [moved] = sourceCol.splice(source.index, 1);
    destCol.splice(destination.index, 0, moved);

    setLayout(newLayout);
  };

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
      {/* Dynamic Backgrounds */}
      {(!settings.backgroundType || settings.backgroundType === 'matrix') && (
        <MatrixBackground enabled={settings.showMatrixRain !== false} />
      )}
      {settings.backgroundType === 'unsplash' && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0,
          backgroundImage: `url(${settings.customBackgroundUrl || 'https://source.unsplash.com/1920x1080/?nature,code'})`,
          backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.6
        }} />
      )}
      {settings.backgroundType === 'color' && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0,
          backgroundColor: settings.customBackgroundUrl || 'var(--bg-primary)'
        }} />
      )}
      {settings.backgroundType === 'image' && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0,
          backgroundImage: `url(${settings.customBackgroundUrl})`,
          backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.8
        }} />
      )}

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
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="dashboard-grid">
            <Droppable droppableId="leftColumn">
              {(provided) => (
                <div className="left-column" {...provided.droppableProps} ref={provided.innerRef}>
                  {layout.leftColumn.map((widgetId, index) => {
                    const WIDGETS: Record<string, { el: JSX.Element, show: boolean }> = {
                      speedDial: { el: <SpeedDial />, show: settings.showSpeedDial !== false },
                      devFeeds: { el: <DevFeeds selectedLanguage={settings.selectedLanguage || 'all'} onLanguageChange={handleLanguageChange} />, show: settings.showFeeds !== false },
                      serverMonitor: { el: <ServerMonitor />, show: settings.showServerMonitor !== false },
                      lofiPlayer: { el: <LofiPlayer />, show: settings.showLofiPlayer !== false },
                      focusTimer: { el: <FocusTimer />, show: settings.showTimer !== false },
                      devNotes: { el: <DevNotes />, show: settings.showScratchpad !== false },
                    };
                    
                    const widget = WIDGETS[widgetId];
                    if (!widget || !widget.show) return null;

                    return (
                      <Draggable key={widgetId} draggableId={widgetId} index={index}>
                        {(provided) => (
                          <div ref={provided.innerRef} {...provided.draggableProps} style={{ ...provided.draggableProps.style, marginBottom: '1.25rem' }}>
                            <div {...provided.dragHandleProps} style={{ display: 'flex', justifyContent: 'center', cursor: 'grab', opacity: 0.3, paddingBottom: '4px' }}>
                              <div style={{ width: '40px', height: '4px', background: 'var(--text-secondary)', borderRadius: '2px' }} />
                            </div>
                            {widget.el}
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>

            <Droppable droppableId="rightColumn">
              {(provided) => (
                <div className="right-column" {...provided.droppableProps} ref={provided.innerRef}>
                  {layout.rightColumn.map((widgetId, index) => {
                    const WIDGETS: Record<string, { el: JSX.Element, show: boolean }> = {
                      speedDial: { el: <SpeedDial />, show: settings.showSpeedDial !== false },
                      devFeeds: { el: <DevFeeds selectedLanguage={settings.selectedLanguage || 'all'} onLanguageChange={handleLanguageChange} />, show: settings.showFeeds !== false },
                      serverMonitor: { el: <ServerMonitor />, show: settings.showServerMonitor !== false },
                      lofiPlayer: { el: <LofiPlayer />, show: settings.showLofiPlayer !== false },
                      focusTimer: { el: <FocusTimer />, show: settings.showTimer !== false },
                      devNotes: { el: <DevNotes />, show: settings.showScratchpad !== false },
                    };
                    
                    const widget = WIDGETS[widgetId];
                    if (!widget || !widget.show) return null;

                    return (
                      <Draggable key={widgetId} draggableId={widgetId} index={index}>
                        {(provided) => (
                          <div ref={provided.innerRef} {...provided.draggableProps} style={{ ...provided.draggableProps.style, marginBottom: '1.25rem' }}>
                            <div {...provided.dragHandleProps} style={{ display: 'flex', justifyContent: 'center', cursor: 'grab', opacity: 0.3, paddingBottom: '4px' }}>
                              <div style={{ width: '40px', height: '4px', background: 'var(--text-secondary)', borderRadius: '2px' }} />
                            </div>
                            {widget.el}
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        </DragDropContext>

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
