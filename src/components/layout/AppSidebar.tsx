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
  Lock,
} from 'lucide-react';
import type { StoreSettings, CashShift } from '../../types';
import { useSettingsStore } from '../../store/useSettingsStore';
import { formatCurrency } from '../../utils/formatters';

export type NavTab = 'pos' | 'inventory' | 'sales' | 'customers' | 'register' | 'analytics' | 'settings';

interface AppSidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  settings: StoreSettings;
  currentShift: CashShift | null;
  onOpenHelpModal: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
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
    <>
      {/* 💻 DESKTOP SLIM LEFT ICON RAIL (Matching Reference 1 & 3) */}
      <aside className="hidden md:flex flex-col items-center justify-between w-[72px] bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800/80 py-4 select-none shrink-0 z-30 h-screen">
        {/* Top Logo / Brand Tile */}
        <div className="flex flex-col items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/25 cursor-pointer transition-transform hover:scale-105 active:scale-95"
            title={`${settings.storeName} (${settings.branchName})`}
            onClick={() => onTabChange('pos')}
          >
            <Store className="h-6 w-6" />
          </div>

          <div className="w-8 h-[1px] bg-slate-100 dark:bg-slate-800" />
        </div>

        {/* Center Navigation Icons */}
        <nav className="flex flex-col items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`group relative flex h-11 w-11 items-center justify-center rounded-2xl transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 dark:bg-emerald-500/20 text-white dark:text-emerald-400 shadow-md shadow-slate-900/10'
                    : 'text-slate-400 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title={item.label}
              >
                <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />

                {/* Floating Tooltip Bubble */}
                <span className="absolute left-16 z-50 whitespace-nowrap rounded-xl bg-slate-900 dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-white opacity-0 shadow-xl transition-all duration-150 group-hover:opacity-100 pointer-events-none">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Utility Controls */}
        <div className="flex flex-col items-center gap-2.5">
          {/* Active Shift Indicator */}
          {currentShift ? (
            <button
              type="button"
              onClick={() => onTabChange('register')}
              className="group relative flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-600 transition-all hover:bg-emerald-100"
              title={`Shift Open: ${formatCurrency(currentShift.expectedCashInDrawer, settings.currencySymbol)}`}
            >
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="absolute left-16 whitespace-nowrap rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold text-white opacity-0 group-hover:opacity-100 pointer-events-none">
                Shift: {formatCurrency(currentShift.expectedCashInDrawer, settings.currencySymbol)}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onTabChange('register')}
              className="group relative flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-500 hover:bg-rose-100"
              title="Shift Closed"
            >
              <Lock className="w-4 h-4" />
            </button>
          )}

          {/* Keyboard Shortcuts F1 */}
          <button
            type="button"
            onClick={onOpenHelpModal}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Shortcuts Guide (F1)"
          >
            <Keyboard className="w-4 h-4" />
          </button>

          {/* Dark / Light Toggle */}
          <button
            type="button"
            onClick={toggleDarkMode}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle Theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </aside>

      {/* 📱 MOBILE BOTTOM NAVIGATION BAR (Screens < md) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 py-1.5 px-3 flex items-center justify-around select-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition-all ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-slate-400 hover:text-slate-600 dark:text-slate-400'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px]">{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
