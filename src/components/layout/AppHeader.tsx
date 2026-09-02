import React, { useState } from 'react';
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
  Menu,
  X,
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'pos' as NavTab, label: 'POS Terminal', icon: LayoutGrid },
    { id: 'inventory' as NavTab, label: 'Inventory', icon: Package },
    { id: 'sales' as NavTab, label: 'Sales History', icon: FileText },
    { id: 'customers' as NavTab, label: 'Customer Dues', icon: Users },
    { id: 'register' as NavTab, label: 'Cash Register', icon: Calculator },
    { id: 'analytics' as NavTab, label: 'Analytics', icon: TrendingUp },
    { id: 'settings' as NavTab, label: 'Settings', icon: Settings },
  ];

  const handleTabSelect = (tab: NavTab) => {
    onTabChange(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="h-[60px] md:h-[64px] bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 px-3 md:px-4 flex items-center justify-between gap-2 md:gap-4 select-none shrink-0 z-30 relative">
        {/* Brand Identity */}
        <div className="flex items-center gap-2 md:gap-2.5 min-w-0">
          <div className="flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-xl bg-sky-600 text-white shadow-xs shrink-0">
            <Store className="h-4 w-4 md:h-5 md:w-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xs md:text-sm font-extrabold text-slate-900 dark:text-white leading-none truncate">
              {settings.storeName}
            </h1>
            <div className="flex items-center gap-1.5 text-[9px] md:text-[10px] text-slate-400 mt-0.5 md:mt-1 truncate">
              <span className="truncate">{settings.branchName}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
                <Wifi className="w-2.5 h-2.5" />
                Offline DB
              </span>
            </div>
          </div>
        </div>

        {/* Desktop Navigation Tabs (Hidden on tablet/mobile < xl) */}
        <nav className="hidden xl:flex items-center gap-1 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl">
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

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
          {/* Cash Shift Status Badge */}
          {currentShift ? (
            <button
              type="button"
              onClick={() => onTabChange('register')}
              className="flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 rounded-xl bg-emerald-50/80 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[11px] md:text-xs font-bold transition-all hover:bg-emerald-100"
            >
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="hidden sm:inline text-emerald-700 dark:text-emerald-400 font-normal">Shift:</span>
              <span className="font-mono">{formatCurrency(currentShift.expectedCashInDrawer, settings.currencySymbol)}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onTabChange('register')}
              className="flex items-center gap-1 px-2 md:px-3 py-1 md:py-1.5 rounded-xl bg-rose-50 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-[11px] md:text-xs font-bold hover:bg-rose-100"
            >
              <Lock className="w-3 h-3 md:w-3.5 md:h-3.5" />
              <span className="hidden sm:inline">Shift Closed</span>
            </button>
          )}

          {/* Shortcuts F1 Trigger (Hidden on small screens) */}
          <button
            type="button"
            onClick={onOpenHelpModal}
            className="hidden md:flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 cursor-pointer"
            title="Keyboard Shortcuts (F1)"
          >
            <Keyboard className="w-4 h-4" />
          </button>

          {/* Dark / Light Toggle */}
          <button
            type="button"
            onClick={toggleDarkMode}
            className="flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 cursor-pointer"
            title="Toggle Dark/Light Mode"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* Mobile Menu Hamburger (Visible on < xl screens) */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex xl:hidden h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer border border-slate-200 dark:border-slate-700"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer / Slide-Down Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-x-0 top-[60px] md:top-[64px] z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-2xl xl:hidden p-4 animate-in slide-in-from-top-2 duration-150">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleTabSelect(item.id)}
                  className={`flex items-center gap-2.5 p-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-500 text-sky-600 dark:text-sky-400'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4 text-current" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};
