import React, { useState, useEffect } from 'react';
import {
  Calculator,
  ArrowUpRight,
  ArrowDownLeft,
  Lock,
  Unlock,
  AlertTriangle,
  History,
} from 'lucide-react';
import type { CashShift, StoreSettings } from '../../types';
import { useRegisterStore } from '../../store/useRegisterStore';
import { RegisterService } from '../../services/register.service';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { useToastStore } from '../../store/useToastStore';

interface RegisterScreenProps {
  settings: StoreSettings;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ settings }) => {
  const { currentShift, loadActiveShift, openShift, closeShift, recordCashMovement } =
    useRegisterStore();

  const [shiftHistory, setShiftHistory] = useState<CashShift[]>([]);
  const showToast = useToastStore((s) => s.showToast);

  // Open Shift Modal
  const [isOpenShiftModalOpen, setIsOpenShiftModalOpen] = useState(false);
  const [openCashierName, setOpenCashierName] = useState(settings.cashierName);
  const [openStartingCash, setOpenStartingCash] = useState('2000');

  // Close Shift Modal
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [countedCash, setCountedCash] = useState('');
  const [closingNote, setClosingNote] = useState('');

  // Cash Movement Modal (Cash In / Out)
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [movementType, setMovementType] = useState<'cash_in' | 'cash_out'>('cash_out');
  const [movementAmount, setMovementAmount] = useState('');
  const [movementReason, setMovementReason] = useState('');

  useEffect(() => {
    loadActiveShift();
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const list = await RegisterService.getShiftHistory();
    setShiftHistory(list);
  };

  const handleOpenShift = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await openShift(openCashierName, parseFloat(openStartingCash) || 0);
      showToast('Shift Opened', `New shift started with ${formatCurrency(parseFloat(openStartingCash) || 0, settings.currencySymbol)} float.`, 'success');
      setIsOpenShiftModalOpen(false);
      await loadHistory();
    } catch (err) {
      showToast('Error', (err as Error).message, 'error');
    }
  };

  const handleCloseShift = async (e: React.FormEvent) => {
    e.preventDefault();
    const actual = parseFloat(countedCash) || 0;
    try {
      const closed = await closeShift(actual, closingNote);
      showToast('Shift Closed', `Shift closed with discrepancy: ${formatCurrency(closed.cashDifference || 0, settings.currencySymbol)}`, 'info');
      setIsCloseModalOpen(false);
      await loadHistory();
    } catch (err) {
      showToast('Error', (err as Error).message, 'error');
    }
  };

  const handleRecordMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(movementAmount) || 0;
    if (amount <= 0 || !movementReason.trim()) return;

    try {
      await recordCashMovement(movementType, amount, movementReason.trim());
      showToast('Movement Recorded', `Recorded ${movementType === 'cash_in' ? 'Cash In' : 'Cash Out'} of ${formatCurrency(amount, settings.currencySymbol)}`, 'success');
      setMovementAmount('');
      setMovementReason('');
      setIsMovementModalOpen(false);
    } catch (err) {
      showToast('Error', (err as Error).message, 'error');
    }
  };

  return (
    <div className="flex h-[calc(100vh-70px)] flex-col p-6 space-y-4 overflow-y-auto">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Calculator className="w-7 h-7 text-sky-600" />
            Cash Drawer & Register Shifts
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage daily cash float, cashier reconciliation, petty expenses, and day-end closing
          </p>
        </div>

        {currentShift ? (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                setMovementType('cash_out');
                setIsMovementModalOpen(true);
              }}
            >
              <ArrowDownLeft className="w-4 h-4 mr-1 text-rose-500" />
              Cash Out (Expense)
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                setMovementType('cash_in');
                setIsMovementModalOpen(true);
              }}
            >
              <ArrowUpRight className="w-4 h-4 mr-1 text-emerald-500" />
              Cash In (Float)
            </Button>
            <Button
              variant="destructive"
              size="md"
              onClick={() => {
                setCountedCash(currentShift.expectedCashInDrawer.toString());
                setIsCloseModalOpen(true);
              }}
            >
              <Lock className="w-4 h-4 mr-1.5" />
              Close Shift (Day End)
            </Button>
          </div>
        ) : (
          <Button
            variant="success"
            size="lg"
            onClick={() => setIsOpenShiftModalOpen(true)}
          >
            <Unlock className="w-5 h-5 mr-1.5" />
            Open New Register Shift
          </Button>
        )}
      </div>

      {/* Active Shift Dashboard */}
      {currentShift ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Expected Cash in Drawer */}
          <div className="rounded-2xl border border-sky-200 bg-sky-50/70 p-5 dark:border-sky-900 dark:bg-sky-950/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-800 dark:text-sky-300">
                Expected in Drawer
              </span>
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="text-3xl font-black text-sky-900 dark:text-white mt-1">
              {formatCurrency(currentShift.expectedCashInDrawer, settings.currencySymbol)}
            </div>
            <div className="text-[11px] text-sky-700 dark:text-sky-300 mt-2">
              Float: {formatCurrency(currentShift.startingCash, settings.currencySymbol)} • Cash Sales: {formatCurrency(currentShift.cashSales, settings.currencySymbol)}
            </div>
          </div>

          {/* Digital Sales */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Digital / Card Sales
            </span>
            <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              {formatCurrency(
                currentShift.bkashSales + currentShift.nagadSales + currentShift.cardSales,
                settings.currencySymbol
              )}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
              bKash: {formatCurrency(currentShift.bkashSales, settings.currencySymbol)} • Card: {formatCurrency(currentShift.cardSales, settings.currencySymbol)}
            </div>
          </div>

          {/* Total Turnover */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Shift Sales
            </span>
            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {formatCurrency(currentShift.totalSales, settings.currencySymbol)}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
              Completed Orders: <b>{currentShift.totalOrders}</b>
            </div>
          </div>

          {/* Cashier Info */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Cashier
            </span>
            <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">
              {currentShift.cashierName}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
              Opened: {formatDateTime(currentShift.openedAt)}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/50 p-6 text-center dark:border-amber-900/50 dark:bg-amber-950/20">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
          <h3 className="text-lg font-bold text-amber-900 dark:text-amber-200">
            No Cash Shift is Currently Open
          </h3>
          <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
            Open a shift with initial starting cash before processing sales to ensure accurate cash reconciliation.
          </p>
        </div>
      )}

      {/* Shift History Table */}
      <div className="flex-1 flex flex-col space-y-2 pt-2">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <History className="w-4 h-4" />
          Shift Closing History & Discrepancy Audits
        </h3>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3.5">Cashier</th>
                  <th className="px-4 py-3.5">Opened</th>
                  <th className="px-4 py-3.5">Closed</th>
                  <th className="px-4 py-3.5 text-right">Total Sales</th>
                  <th className="px-4 py-3.5 text-right">Expected Cash</th>
                  <th className="px-4 py-3.5 text-right">Counted Cash</th>
                  <th className="px-4 py-3.5 text-right">Difference (Over/Short)</th>
                  <th className="px-4 py-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {shiftHistory.map((s) => {
                  const isClosed = s.status === 'closed';
                  const diff = s.cashDifference || 0;

                  return (
                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                        {s.cashierName}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {formatDateTime(s.openedAt)}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {s.closedAt ? formatDateTime(s.closedAt) : '— (Active)'}
                      </td>
                      <td className="px-4 py-3 text-right font-bold">
                        {formatCurrency(s.totalSales, settings.currencySymbol)}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">
                        {formatCurrency(s.expectedCashInDrawer, settings.currencySymbol)}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-white">
                        {s.actualCountedCash !== undefined
                          ? formatCurrency(s.actualCountedCash, settings.currencySymbol)
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-right font-bold">
                        {isClosed ? (
                          diff === 0 ? (
                            <span className="text-emerald-600">Exact Matched (0.00)</span>
                          ) : diff > 0 ? (
                            <span className="text-sky-600">+{formatCurrency(diff, settings.currencySymbol)} (Over)</span>
                          ) : (
                            <span className="text-rose-600">{formatCurrency(diff, settings.currencySymbol)} (Short)</span>
                          )
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={isClosed ? 'neutral' : 'success'}>
                          {s.status}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Open Shift Modal */}
      <Modal
        isOpen={isOpenShiftModalOpen}
        onClose={() => setIsOpenShiftModalOpen(false)}
        title="Open Register Shift"
        maxWidth="sm"
      >
        <form onSubmit={handleOpenShift} className="space-y-4">
          <Input
            label="Cashier Name *"
            required
            value={openCashierName}
            onChange={(e) => setOpenCashierName(e.target.value)}
          />
          <Input
            label={`Starting Cash Float (${settings.currencySymbol}) *`}
            type="number"
            required
            value={openStartingCash}
            onChange={(e) => setOpenStartingCash(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsOpenShiftModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="success">
              Start Shift
            </Button>
          </div>
        </form>
      </Modal>

      {/* Close Shift Modal */}
      <Modal
        isOpen={isCloseModalOpen}
        onClose={() => setIsCloseModalOpen(false)}
        title="Close Register Shift (Day End)"
        description="Count the actual physical cash inside the register drawer"
        maxWidth="md"
      >
        <form onSubmit={handleCloseShift} className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-1">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Expected Cash in Drawer:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {currentShift && formatCurrency(currentShift.expectedCashInDrawer, settings.currencySymbol)}
              </span>
            </div>
          </div>

          <Input
            label={`Actual Physical Cash Counted (${settings.currencySymbol}) *`}
            type="number"
            required
            value={countedCash}
            onChange={(e) => setCountedCash(e.target.value)}
          />

          <Input
            label="Closing Notes / Comments"
            value={closingNote}
            onChange={(e) => setClosingNote(e.target.value)}
            placeholder="e.g. End of shift, cash handed over to manager"
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsCloseModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive">
              Confirm & Close Shift
            </Button>
          </div>
        </form>
      </Modal>

      {/* Cash Movement Modal */}
      <Modal
        isOpen={isMovementModalOpen}
        onClose={() => setIsMovementModalOpen(false)}
        title="Record Cash Drawer Movement"
        maxWidth="sm"
      >
        <form onSubmit={handleRecordMovement} className="space-y-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMovementType('cash_out')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold border ${
                movementType === 'cash_out'
                  ? 'bg-rose-600 text-white border-rose-600'
                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              Cash Out (Expense / Payout)
            </button>
            <button
              type="button"
              onClick={() => setMovementType('cash_in')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold border ${
                movementType === 'cash_in'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              Cash In (Float Top-up)
            </button>
          </div>

          <Input
            label={`Amount (${settings.currencySymbol}) *`}
            type="number"
            required
            value={movementAmount}
            onChange={(e) => setMovementAmount(e.target.value)}
          />

          <Input
            label="Reason / Note *"
            required
            value={movementReason}
            onChange={(e) => setMovementReason(e.target.value)}
            placeholder="e.g. Bought receipt paper roll"
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsMovementModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Record Movement
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
