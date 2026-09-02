import { useState, useEffect } from 'react';
import { initializeDatabase } from './db/seedData';
import { useSettingsStore } from './store/useSettingsStore';
import { useRegisterStore } from './store/useRegisterStore';
import { AppSidebar, type NavTab } from './components/layout/AppSidebar';
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
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-950 text-white select-none">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 shadow-xl shadow-emerald-600/40 animate-bounce">
          <Store className="h-9 w-9 text-white" />
        </div>
        <h2 className="mt-4 text-lg font-black tracking-wide">
          Initializing Smart POS Terminal...
        </h2>
        <p className="text-xs text-slate-400 mt-1 font-mono">
          Loading IndexedDB Offline Database & Seed Inventory
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-[#f6f8fb] dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 overflow-hidden">
      {/* 🚀 Left Minimalist Navigation Rail (Image 1 & 3 Reference) */}
      <AppSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        settings={settings}
        currentShift={currentShift}
        onOpenHelpModal={() => setIsHelpOpen(true)}
      />

      {/* Main Screen Canvas */}
      <main className="flex-1 h-screen overflow-hidden pb-14 md:pb-0">
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
