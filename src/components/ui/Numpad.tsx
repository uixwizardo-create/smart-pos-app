import React from 'react';
import { Delete, RotateCcw } from 'lucide-react';
import { Button } from './Button';

export interface NumpadProps {
  value: string;
  onChange: (newValue: string) => void;
  onSubmit?: () => void;
  targetAmount?: number;
  currencySymbol?: string;
}

export const Numpad: React.FC<NumpadProps> = ({
  value,
  onChange,
  targetAmount,
  currencySymbol = '৳',
}) => {
  const handleDigit = (digit: string) => {
    if (digit === '.' && value.includes('.')) return;
    if (value === '0' && digit !== '.') {
      onChange(digit);
    } else {
      onChange(value + digit);
    }
  };

  const handleBackspace = () => {
    if (value.length <= 1) {
      onChange('');
    } else {
      onChange(value.slice(0, -1));
    }
  };

  const handleClear = () => {
    onChange('');
  };

  const handleQuickAdd = (addAmount: number) => {
    const currentNum = parseFloat(value) || 0;
    onChange((currentNum + addAmount).toString());
  };

  const handleExactCash = () => {
    if (targetAmount !== undefined) {
      onChange(Math.ceil(targetAmount).toString());
    }
  };

  return (
    <div className="space-y-3">
      {/* Quick Cash Presets */}
      <div className="grid grid-cols-4 gap-2">
        {targetAmount !== undefined && (
          <button
            type="button"
            onClick={handleExactCash}
            className="h-10 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-200 text-xs font-bold hover:bg-sky-200 transition-colors border border-sky-300 dark:border-sky-800"
          >
            Exact ({currencySymbol}{Math.ceil(targetAmount)})
          </button>
        )}
        <button
          type="button"
          onClick={() => handleQuickAdd(100)}
          className="h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 transition-colors border border-slate-200 dark:border-slate-700"
        >
          +100
        </button>
        <button
          type="button"
          onClick={() => handleQuickAdd(500)}
          className="h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 transition-colors border border-slate-200 dark:border-slate-700"
        >
          +500
        </button>
        <button
          type="button"
          onClick={() => handleQuickAdd(1000)}
          className="h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 transition-colors border border-slate-200 dark:border-slate-700"
        >
          +1000
        </button>
      </div>

      {/* Main 4x3 Keypad Grid */}
      <div className="grid grid-cols-3 gap-2 select-none">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
          <Button
            key={digit}
            type="button"
            variant="secondary"
            className="h-14 text-xl font-bold rounded-xl active:scale-95 transition-all text-slate-900 dark:text-white"
            onClick={() => handleDigit(digit)}
          >
            {digit}
          </Button>
        ))}
        <Button
          type="button"
          variant="outline"
          className="h-14 text-sm font-semibold rounded-xl text-slate-600 dark:text-slate-300"
          onClick={handleClear}
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          Clear
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="h-14 text-xl font-bold rounded-xl active:scale-95 transition-all text-slate-900 dark:text-white"
          onClick={() => handleDigit('0')}
        >
          0
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-14 text-sm font-semibold rounded-xl text-slate-600 dark:text-slate-300"
          onClick={handleBackspace}
        >
          <Delete className="w-5 h-5 text-rose-500" />
        </Button>
      </div>
    </div>
  );
};
