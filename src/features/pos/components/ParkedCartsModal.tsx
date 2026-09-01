import React, { useEffect } from 'react';
import { ShoppingBag, ArrowRight, Clock } from 'lucide-react';
import { useCartStore } from '../../../store/useCartStore';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { formatCurrency, formatDateTime } from '../../../utils/formatters';

interface ParkedCartsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currencySymbol?: string;
}

export const ParkedCartsModal: React.FC<ParkedCartsModalProps> = ({
  isOpen,
  onClose,
  currencySymbol = '৳',
}) => {
  const { holdCarts, loadHoldCarts, recallParkedCart } = useCartStore();

  useEffect(() => {
    if (isOpen) {
      loadHoldCarts();
    }
  }, [isOpen, loadHoldCarts]);

  const handleRecall = async (id: string) => {
    await recallParkedCart(id);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Parked / Held Carts"
      description="Recall orders that were placed on hold"
      maxWidth="lg"
    >
      {holdCarts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <ShoppingBag className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-2" />
          <h4 className="text-base font-bold text-slate-700 dark:text-slate-300">
            No parked carts found
          </h4>
          <p className="text-xs text-slate-400 mt-1">
            Press F4 on the POS screen to hold an active customer's cart.
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {holdCarts.map((cart) => {
            const total = cart.items.reduce((sum, item) => sum + item.total, 0);
            const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);

            return (
              <div
                key={cart.id}
                className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-extrabold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 px-2 py-0.5 rounded-md">
                      {cart.holdNumber}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {cart.customerName || 'Walk-in Customer'}
                    </h4>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDateTime(cart.createdAt)}
                    </span>
                    <span>•</span>
                    <span>{totalItems} items</span>
                    {cart.note && (
                      <>
                        <span>•</span>
                        <span className="italic">"{cart.note}"</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                      {formatCurrency(total, currencySymbol)}
                    </div>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleRecall(cart.id)}
                  >
                    Recall Cart
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
};
