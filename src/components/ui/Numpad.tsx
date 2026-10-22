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
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
        {targetAmount !== undefined && (
          <button
            type="button"
            onClick={handleExactCash}
            className="h-11 sm:h-12 px-1 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-200 border border-sky-300 dark:border-sky-800 hover:bg-sky-100 dark:hover:bg-sky-900 transition-colors flex flex-col items-center justify-center cursor-pointer shadow-xs active:scale-95"
            title={`Exact Amount: ${currencySymbol}${Math.ceil(targetAmount).toLocaleString('en-BD')}`}
          >
            <span className="text-[9px] uppercase font-bold tracking-wider leading-none text-sky-600 dark:text-sky-400">
              Exact
            </span>
            <span className="text-xs font-black font-mono leading-tight mt-0.5 truncate max-w-full">
              {currencySymbol}{Math.ceil(targetAmount).toLocaleString('en-BD')}
            </span>
          </button>
        )}
        {[100, 500, 1000].map((addAmount) => (
          <button
            key={addAmount}
            type="button"
            onClick={() => handleQuickAdd(addAmount)}
            className="h-11 sm:h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-extrabold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700 flex items-center justify-center cursor-pointer shadow-xs active:scale-95"
          >
            +{addAmount}
          </button>
        ))}
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
