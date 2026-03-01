import { useAdb } from './hooks/useAdb';
import { WelcomeScreen } from './components/WelcomeScreen';
import { MainLayout } from './layouts/MainLayout';
import type { ViewState } from './layouts/Sidebar';
import { PackageExplorerView } from './views/PackageExplorerView';
import { DashboardView, RecommendedView, BackupRestoreView, LogsView, SettingsView } from './views/VariousViews';
import { HelpDocsView } from './views/HelpDocsView';

function App() {
  const { isConnected, connect, disconnect, connecting, error } = useAdb();

  const renderView = (view: ViewState, onViewChange: (v: ViewState) => void) => {
    switch (view) {
      case 'dashboard':
        return <DashboardView onViewChange={onViewChange} />;
      case 'packages':
        return <PackageExplorerView />;
      case 'recommended':
        return <RecommendedView />;
      case 'backup':
        return <BackupRestoreView />;
      case 'logs':
        return <LogsView />;
      case 'settings':
        return <SettingsView />;
      case 'help':
        return <HelpDocsView />;
      default:
        return <PackageExplorerView />;
    }
  };

  return (
    <div className="text-[var(--color-brand-secondary)] min-h-screen selection:bg-[var(--color-brand-primary)] selection:text-white font-sans">
      {!isConnected ? (
        <WelcomeScreen
          onConnect={connect}
          connecting={connecting}
          error={error}
        />
      ) : (
        <MainLayout onDisconnect={disconnect}>
          {(currentView, setCurrentView) => renderView(currentView, setCurrentView)}
        </MainLayout>
      )}
    </div>
  );
}

export default App;
