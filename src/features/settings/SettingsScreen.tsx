import React, { useState } from 'react';
import {
  Settings,
  Store,
  Printer,
  Download,
  Save,
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
    <div className="flex h-[calc(100vh-70px)] flex-col p-6 space-y-5 overflow-y-auto max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-7 h-7 text-sky-600" />
            Store Settings & Configuration
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure store invoice identity, receipt paper width, taxes, and system sound preferences
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="md" onClick={handleExportBackup}>
            <Download className="w-4 h-4 mr-1.5" />
            Export JSON Backup
          </Button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Store Profile Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Store className="w-4 h-4 text-sky-600" />
            Store Profile (Printed on Invoices)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              label="Contact Mobile / Phone *"
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <Input
              label="Contact Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Input
              label="VAT / BIN Registration Number"
              value={form.vatRegistrationNumber}
              onChange={(e) => setForm({ ...form, vatRegistrationNumber: e.target.value })}
            />
            <div className="md:col-span-2">
              <Input
                label="Full Physical Address *"
                required
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* POS Behavior & Receipt Setup Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Printer className="w-4 h-4 text-sky-600" />
            Receipt Printing & Tax Rates
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Thermal Paper Width
              </label>
              <select
                value={form.paperSize}
                onChange={(e) => setForm({ ...form, paperSize: e.target.value as '58mm' | '80mm' })}
                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                <option value="80mm">80mm (Standard POS Thermal)</option>
                <option value="58mm">58mm (Compact Mobile POS)</option>
              </select>
            </div>

            <Input
              label="Currency Symbol"
              value={form.currencySymbol}
              onChange={(e) => setForm({ ...form, currencySymbol: e.target.value })}
            />

            <Input
              label="Default VAT / Tax Rate (%)"
              type="number"
              value={form.defaultTaxRate.toString()}
              onChange={(e) => setForm({ ...form, defaultTaxRate: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={form.enableSound}
                onChange={(e) => setForm({ ...form, enableSound: e.target.checked })}
                className="h-4 w-4 rounded-md text-sky-600"
              />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Audio Feedback (Scan & Cash Beep)
              </span>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={form.enableTax}
                onChange={(e) => setForm({ ...form, enableTax: e.target.checked })}
                className="h-4 w-4 rounded-md text-sky-600"
              />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Enable VAT / Tax Calculation
              </span>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={form.autoPrintReceipt}
                onChange={(e) => setForm({ ...form, autoPrintReceipt: e.target.checked })}
                className="h-4 w-4 rounded-md text-sky-600"
              />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Auto-Prompt Receipt on Sale
              </span>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="submit"
            variant="primary"
            size="xl"
            isLoading={isSaving}
          >
            <Save className="w-5 h-5 mr-2" />
            Save Store Settings
          </Button>
        </div>
      </form>
    </div>
  );
};
