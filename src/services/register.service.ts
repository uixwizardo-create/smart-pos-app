import { db } from '../db/database';
import type { CashShift, CashMovement } from '../types';

export class RegisterService {
  static async getCurrentShift(): Promise<CashShift | undefined> {
    return await db.shifts.filter(s => s.status === 'open').first();
  }

  static async openShift(cashierName: string, startingCash: number): Promise<CashShift> {
    const active = await this.getCurrentShift();
    if (active) {
      throw new Error('A shift is already open! Please close the current shift first.');
    }

    const newShift: CashShift = {
      id: 'shift-' + Date.now(),
      cashierName,
      openedAt: new Date().toISOString(),
      status: 'open',
      startingCash,
      cashSales: 0,
      cardSales: 0,
      bkashSales: 0,
      nagadSales: 0,
      dueSales: 0,
      totalSales: 0,
      totalOrders: 0,
      cashIn: 0,
      cashOut: 0,
      expectedCashInDrawer: startingCash,
    };

    await db.shifts.add(newShift);
    return newShift;
  }

  static async recordCashMovement(type: 'cash_in' | 'cash_out', amount: number, reason: string): Promise<CashMovement> {
    const shift = await this.getCurrentShift();
    if (!shift) throw new Error('No open shift found to record cash movement.');

    const movement: CashMovement = {
      id: 'mov-' + Date.now(),
      shiftId: shift.id,
      type,
      amount,
      reason,
      createdAt: new Date().toISOString(),
    };

    await db.cashMovements.add(movement);

    const cashInDelta = type === 'cash_in' ? amount : 0;
    const cashOutDelta = type === 'cash_out' ? amount : 0;
    const expectedDrawer = shift.expectedCashInDrawer + cashInDelta - cashOutDelta;

    await db.shifts.update(shift.id, {
      cashIn: shift.cashIn + cashInDelta,
      cashOut: shift.cashOut + cashOutDelta,
      expectedCashInDrawer: expectedDrawer,
    });

    return movement;
  }

  static async closeShift(actualCountedCash: number, closingNote?: string): Promise<CashShift> {
    const shift = await this.getCurrentShift();
    if (!shift) throw new Error('No active shift to close.');

    const difference = actualCountedCash - shift.expectedCashInDrawer;
    const closedAt = new Date().toISOString();

    const updatedShift: Partial<CashShift> = {
      status: 'closed',
      closedAt,
      actualCountedCash,
      cashDifference: difference,
      closingNote: closingNote || '',
    };

    await db.shifts.update(shift.id, updatedShift);
    return { ...shift, ...updatedShift } as CashShift;
  }

  static async getShiftHistory(): Promise<CashShift[]> {
    return await db.shifts.reverse().sortBy('openedAt');
  }

  static async getMovementsForShift(shiftId: string): Promise<CashMovement[]> {
    return await db.cashMovements.where('shiftId').equals(shiftId).reverse().sortBy('createdAt');
  }
}
