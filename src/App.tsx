import { useState, useEffect } from 'react';
import { initializeDatabase } from './db/seedData';
import { useSettingsStore } from './store/useSettingsStore';
import { useRegisterStore } from './store/useRegisterStore';
import { AppHeader, type NavTab } from './components/layout/AppHeader';
import { PosScreen } from './features/pos/PosScreen';
import { InventoryScreen } from './features/inventory/InventoryScreen';
import { SalesHistoryScreen } from './features/sales/SalesHistoryScreen';
import { CustomerScreen } from './features/customers/CustomerScreen';
import { RegisterScreen } from './features/register/RegisterScreen';
import { AnalyticsScreen } from './features/analytics/AnalyticsScreen';
import { SettingsScreen } from './features/settings/SettingsScreen';
import { ToastContainer } from './components/ui/ToastContainer';
import { KeyboardShortcutsModal } from './features/pos/components/KeyboardShortcutsModal';
import { Store } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('pos');
  const [isDbReady, setIsDbReady] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const { settings, loadSettings, isLoading: isSettingsLoading } = useSettingsStore();
  const { currentShift, loadActiveShift } = useRegisterStore();

  useEffect(() => {
    async function bootstrap() {
      await initializeDatabase();
      await Promise.all([loadSettings(), loadActiveShift()]);
      setIsDbReady(true);
    }
    bootstrap();
  }, [loadSettings, loadActiveShift]);

  // Global F1 shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        setIsHelpOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isDbReady || isSettingsLoading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-900 text-white select-none">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-600 shadow-xl shadow-sky-600/40 animate-bounce">
          <Store className="h-9 w-9 text-white" />
        </div>
        <h2 className="mt-4 text-lg font-black tracking-wide">
          Initializing Smart POS Terminal...
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Loading IndexedDB Offline Database & Seed Inventory
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen flex-col bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      {/* Top Application Header */}
      <AppHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        settings={settings}
        currentShift={currentShift}
        onOpenHelpModal={() => setIsHelpOpen(true)}
      />

      {/* Main Active View */}
      <main className="flex-1 overflow-hidden">
        {activeTab === 'pos' && <PosScreen settings={settings} />}
        {activeTab === 'inventory' && <InventoryScreen settings={settings} />}
        {activeTab === 'sales' && <SalesHistoryScreen settings={settings} />}
        {activeTab === 'customers' && <CustomerScreen settings={settings} />}
        {activeTab === 'register' && <RegisterScreen settings={settings} />}
        {activeTab === 'analytics' && <AnalyticsScreen settings={settings} />}
        {activeTab === 'settings' && <SettingsScreen />}
      </main>

      {/* Global Toast System */}
      <ToastContainer />

      {/* Global Keyboard Shortcut Help */}
      <KeyboardShortcutsModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
}

export default App;
