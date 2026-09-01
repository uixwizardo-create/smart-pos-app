import { useEffect } from 'react';

interface ShortcutHandlers {
  onSearchFocus?: () => void;
  onPayment?: () => void;
  onHoldCart?: () => void;
  onSelectCustomer?: () => void;
  onHelp?: () => void;
  onClearCart?: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers, enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // F1: Help Modal
      if (e.key === 'F1') {
        e.preventDefault();
        handlers.onHelp?.();
      }
      // F2: Focus Search
      else if (e.key === 'F2') {
        e.preventDefault();
        handlers.onSearchFocus?.();
      }
      // F4: Hold / Park Cart
      else if (e.key === 'F4') {
        e.preventDefault();
        handlers.onHoldCart?.();
      }
      // F8: Select Customer
      else if (e.key === 'F8') {
        e.preventDefault();
        handlers.onSelectCustomer?.();
      }
      // F9: Checkout / Pay
      else if (e.key === 'F9') {
        e.preventDefault();
        handlers.onPayment?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers, enabled]);
}
