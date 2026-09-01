import { create } from 'zustand';
import type { CashShift, CashMovement } from '../types';
import { RegisterService } from '../services/register.service';

interface RegisterState {
  currentShift: CashShift | null;
  movements: CashMovement[];
  isLoading: boolean;
  loadActiveShift: () => Promise<void>;
  openShift: (cashierName: string, startingCash: number) => Promise<CashShift>;
  closeShift: (actualCountedCash: number, closingNote?: string) => Promise<CashShift>;
  recordCashMovement: (type: 'cash_in' | 'cash_out', amount: number, reason: string) => Promise<void>;
}

export const useRegisterStore = create<RegisterState>((set, get) => ({
  currentShift: null,
  movements: [],
  isLoading: true,

  loadActiveShift: async () => {
    try {
      const shift = await RegisterService.getCurrentShift();
      if (shift) {
        const movements = await RegisterService.getMovementsForShift(shift.id);
        set({ currentShift: shift, movements, isLoading: false });
      } else {
        set({ currentShift: null, movements: [], isLoading: false });
      }
    } catch {
      set({ currentShift: null, movements: [], isLoading: false });
    }
  },

  openShift: async (cashierName, startingCash) => {
    const newShift = await RegisterService.openShift(cashierName, startingCash);
    set({ currentShift: newShift, movements: [] });
    return newShift;
  },

  closeShift: async (actualCountedCash, closingNote) => {
    const closed = await RegisterService.closeShift(actualCountedCash, closingNote);
    set({ currentShift: null, movements: [] });
    return closed;
  },

  recordCashMovement: async (type, amount, reason) => {
    await RegisterService.recordCashMovement(type, amount, reason);
    await get().loadActiveShift();
  },
}));
