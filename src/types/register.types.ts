export type ShiftStatus = 'open' | 'closed';

export interface CashMovement {
  id: string;
  shiftId: string;
  type: 'cash_in' | 'cash_out';
  amount: number;
  reason: string;
  createdAt: string;
}

export interface CashShift {
  id: string;
  cashierName: string;
  openedAt: string;
  closedAt?: string;
  status: ShiftStatus;
  startingCash: number;
  cashSales: number;
  cardSales: number;
  bkashSales: number;
  nagadSales: number;
  dueSales: number;
  totalSales: number;
  totalOrders: number;
  cashIn: number;
  cashOut: number;
  expectedCashInDrawer: number;
  actualCountedCash?: number;
  cashDifference?: number;
  closingNote?: string;
}
