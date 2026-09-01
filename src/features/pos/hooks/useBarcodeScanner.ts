import { useEffect, useRef } from 'react';
import { ProductService } from '../../../services/product.service';
import { useCartStore } from '../../../store/useCartStore';
import { soundManager } from '../../../utils/audio';
import { useToastStore } from '../../../store/useToastStore';

export function useBarcodeScanner(enabled: boolean = true) {
  const bufferRef = useRef<string>('');
  const lastKeyTimeRef = useRef<number>(0);
  const addItem = useCartStore((s) => s.addItem);
  const showToast = useToastStore((s) => s.showToast);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = async (e: KeyboardEvent) => {
      // Ignore if user is typing in standard inputs / textareas / modals
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // If Enter is pressed inside an input, don't trigger global scanner
        return;
      }

      const currentTime = Date.now();
      const timeDiff = currentTime - lastKeyTimeRef.current;
      lastKeyTimeRef.current = currentTime;

      // If typing speed is too slow (> 120ms between characters), reset buffer (likely manual keyboard user)
      if (timeDiff > 120) {
        bufferRef.current = '';
      }

      if (e.key === 'Enter') {
        const scannedCode = bufferRef.current.trim();
        bufferRef.current = '';

        if (scannedCode.length >= 3) {
          e.preventDefault();
          try {
            const product = await ProductService.getProductByBarcode(scannedCode);
            if (product) {
              if (product.stock <= 0) {
                soundManager.playErrorBuzz();
                showToast('Out of Stock', `${product.name} has 0 stock remaining.`, 'error');
              } else {
                addItem(product, 1);
                showToast('Item Added', `${product.name} added to cart`, 'success');
              }
            } else {
              soundManager.playErrorBuzz();
              showToast('Barcode Not Found', `No product found for code: ${scannedCode}`, 'warning');
            }
          } catch {
            soundManager.playErrorBuzz();
          }
        }
      } else if (e.key.length === 1) {
        bufferRef.current += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, addItem, showToast]);
}
