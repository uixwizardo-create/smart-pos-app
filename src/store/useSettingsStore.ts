import { create } from 'zustand';
import type { StoreSettings } from '../types';
import { DEFAULT_SETTINGS } from '../db/seedData';
import { SettingsService } from '../services/settings.service';
import { soundManager } from '../utils/audio';

interface SettingsState {
  settings: StoreSettings;
  isDarkMode: boolean;
  isLoading: boolean;
  loadSettings: () => Promise<void>;
  updateSettings: (updates: Partial<StoreSettings>) => Promise<void>;
  toggleDarkMode: () => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  isDarkMode: false,
  isLoading: true,

  loadSettings: async () => {
    try {
      const loaded = await SettingsService.getSettings();
      soundManager.setEnabled(loaded.enableSound);
      set({ settings: loaded, isLoading: false });
    } catch {
      set({ settings: DEFAULT_SETTINGS, isLoading: false });
    }
  },

  updateSettings: async (updates) => {
    const updated = await SettingsService.updateSettings(updates);
    if (updates.enableSound !== undefined) {
      soundManager.setEnabled(updates.enableSound);
    }
    set({ settings: updated });
  },

  toggleDarkMode: () => {
    const next = !get().isDarkMode;
    if (next) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    set({ isDarkMode: next });
  },
}));
