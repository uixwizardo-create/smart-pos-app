import React, { useState } from 'react';
import {
  Settings,
  Store,
  Printer,
  Download,
  Save,
  ChevronDown,
} from 'lucide-react';
import type { StoreSettings } from '../../types';
import { useSettingsStore } from '../../store/useSettingsStore';
import { SettingsService } from '../../services/settings.service';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToastStore } from '../../store/useToastStore';

export const SettingsScreen: React.FC = () => {
  const { settings, updateSettings } = useSettingsStore();
  const showToast = useToastStore((s) => s.showToast);

  const [form, setForm] = useState<StoreSettings>({ ...settings });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateSettings(form);
      showToast('Settings Saved', 'Store configuration updated successfully.', 'success');
    } catch (err) {
      showToast('Error', (err as Error).message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportBackup = async () => {
    try {
      const dataStr = await SettingsService.exportAllData();
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `pos-database-backup-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      showToast('Backup Exported', 'Database backup downloaded successfully.', 'success');
    } catch (err) {
      showToast('Export Error', (err as Error).message, 'error');
    }
  };

  return (
    <div className="flex h-full flex-col p-4 sm:p-6 space-y-5 overflow-y-auto max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-emerald-600" />
            Store Settings & Preferences
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure store receipt header, printer paper width, tax rates, and sounds
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={handleExportBackup}>
          <Download className="w-4 h-4 mr-1.5" />
          <span>Export Backup</span>
        </Button>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Store Profile Card */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Store className="w-4 h-4 text-emerald-600" />
            Store Profile (Printed on Invoices)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            <Input
              label="Store English Name *"
              required
              value={form.storeName}
              onChange={(e) => setForm({ ...form, storeName: e.target.value })}
            />
            <Input
              label="Store Bangla Name"
              value={form.storeNameBn}
              onChange={(e) => setForm({ ...form, storeNameBn: e.target.value })}
            />
            <Input
              label="Branch Name"
              value={form.branchName}
              onChange={(e) => setForm({ ...form, branchName: e.target.value })}
            />
            <Input
              label="Phone *"
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Input
              label="VAT / BIN Number"
              value={form.vatRegistrationNumber}
              onChange={(e) => setForm({ ...form, vatRegistrationNumber: e.target.value })}
            />
            <div className="sm:col-span-2">
              <Input
                label="Store Address *"
                required
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* POS Behavior & Receipt Setup Card */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Printer className="w-4 h-4 text-emerald-600" />
            Receipt Printing & Taxes
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Thermal Paper Width
              </label>
              <div className="relative">
                <select
                  value={form.paperSize}
                  onChange={(e) => setForm({ ...form, paperSize: e.target.value as '58mm' | '80mm' })}
                  className="h-10 w-full appearance-none rounded-2xl border border-slate-200 bg-white pl-3.5 pr-9 text-xs font-semibold focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white cursor-pointer"
                >
                  <option value="80mm">80mm (Standard POS)</option>
                  <option value="58mm">58mm (Compact)</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
            </div>

            <Input
              label="Currency Symbol"
              value={form.currencySymbol}
              onChange={(e) => setForm({ ...form, currencySymbol: e.target.value })}
            />

            <Input
              label="VAT Rate (%)"
              type="number"
              value={form.defaultTaxRate.toString()}
              onChange={(e) => setForm({ ...form, defaultTaxRate: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 pt-1">
            <Input
              label="Receipt Header Note"
              value={form.receiptHeaderNote}
              onChange={(e) => setForm({ ...form, receiptHeaderNote: e.target.value })}
            />
            <Input
              label="Receipt Return Policy Note"
              value={form.receiptFooterNote}
              onChange={(e) => setForm({ ...form, receiptFooterNote: e.target.value })}
            />
          </div>

          {/* Feature Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-850">
              <input
                type="checkbox"
                checked={form.enableSound}
                onChange={(e) => setForm({ ...form, enableSound: e.target.checked })}
                className="h-4 w-4 rounded-md text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Audio Beeps
              </span>
            </label>

            <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-850">
              <input
                type="checkbox"
                checked={form.enableTax}
                onChange={(e) => setForm({ ...form, enableTax: e.target.checked })}
                className="h-4 w-4 rounded-md text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Enable VAT
              </span>
            </label>

            <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-850">
              <input
                type="checkbox"
                checked={form.autoPrintReceipt}
                onChange={(e) => setForm({ ...form, autoPrintReceipt: e.target.checked })}
                className="h-4 w-4 rounded-md text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Auto-Prompt Print
              </span>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-3 pt-1">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSaving}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Store Settings
          </Button>
        </div>
      </form>
    </div>
  );
};
