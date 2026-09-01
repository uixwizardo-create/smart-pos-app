import React from 'react';
import {
  Store,
  LayoutGrid,
  Package,
  FileText,
  Users,
  Calculator,
  TrendingUp,
  Settings,
  Sun,
  Moon,
  Keyboard,
  Wifi,
  Lock,
} from 'lucide-react';
import type { StoreSettings, CashShift } from '../../types';
import { useSettingsStore } from '../../store/useSettingsStore';
import { formatCurrency } from '../../utils/formatters';

export type NavTab = 'pos' | 'inventory' | 'sales' | 'customers' | 'register' | 'analytics' | 'settings';

interface AppHeaderProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  settings: StoreSettings;
  currentShift: CashShift | null;
  onOpenHelpModal: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  activeTab,
  onTabChange,
  settings,
  currentShift,
  onOpenHelpModal,
}) => {
  const { isDarkMode, toggleDarkMode } = useSettingsStore();

  const navItems = [
    { id: 'pos' as NavTab, label: 'POS Terminal', icon: LayoutGrid },
    { id: 'inventory' as NavTab, label: 'Inventory', icon: Package },
    { id: 'sales' as NavTab, label: 'Sales History', icon: FileText },
    { id: 'customers' as NavTab, label: 'Customer Dues', icon: Users },
    { id: 'register' as NavTab, label: 'Cash Register', icon: Calculator },
    { id: 'analytics' as NavTab, label: 'Analytics', icon: TrendingUp },
    { id: 'settings' as NavTab, label: 'Settings', icon: Settings },
  ];

  return (
    <header className="h-[64px] bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 px-4 flex items-center justify-between gap-4 select-none shrink-0">
      {/* Brand Identity - Clean & Minimal */}
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-600 text-white shadow-xs">
          <Store className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-sm font-extrabold text-slate-900 dark:text-white leading-none">
            {settings.storeName}
          </h1>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1">
            <span>{settings.branchName}</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
              <Wifi className="w-2.5 h-2.5" />
              Offline DB
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <nav className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Right Actions & Shift Status */}
      <div className="flex items-center gap-2">
        {/* Cash Shift Status */}
        {currentShift ? (
          <button
            type="button"
            onClick={() => onTabChange('register')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50/80 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold transition-all hover:bg-emerald-100"
          >
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] text-emerald-700 dark:text-emerald-400">Shift:</span>
            <span className="font-mono">{formatCurrency(currentShift.expectedCashInDrawer, settings.currencySymbol)}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onTabChange('register')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-bold hover:bg-rose-100"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Shift Closed</span>
          </button>
        )}

        {/* Shortcuts F1 Trigger */}
        <button
          type="button"
          onClick={onOpenHelpModal}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 cursor-pointer"
          title="Keyboard Shortcuts (F1)"
        >
          <Keyboard className="w-4 h-4" />
        </button>

        {/* Dark / Light Toggle */}
        <button
          type="button"
          onClick={toggleDarkMode}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 cursor-pointer"
          title="Toggle Dark/Light Mode"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>
      </div>
    </header>
  );
};
