import { useState, useCallback, useMemo } from 'react';
import type { CartItem, Product } from '@/src/types';
import Toast from 'react-native-toast-message';

// =============================================
// useCart — Custom hook quản lý giỏ hàng POS
//
// Tách cart logic ra khỏi POSScreen để:
//   1. Tái sử dụng ở màn hình khác nếu cần
//   2. Dễ test riêng lẻ
//   3. Giữ POSScreen chỉ lo UI
// =============================================

interface UseCartReturn {
  items: CartItem[];
  count: number;
  total: number;
  addItem: (product: Product) => void;
  updateQuantity: (productId: string, delta: number) => void;
  clearCart: () => void;
}

export function useCart(): UseCartReturn {
  const [items, setItems] = useState<CartItem[]>([]);

  // Thêm sản phẩm vào giỏ — kiểm tra stock limit
  const addItem = useCallback((product: Product) => {
    if (product.stockQuantity <= 0) {
      Toast.show({ type: 'error', text1: 'Sản phẩm đã hết hàng', text2: product.productName });
      return;
    }

    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);

      if (existing) {
        // Đã đạt giới hạn tồn kho → không thêm nữa
        if (existing.quantity >= product.stockQuantity) {
          Toast.show({
            type: 'error',
            text1: 'Vượt quá số lượng tồn kho',
            text2: product.productName,
          });
          return prev; // immutable — trả về prev để không re-render
        }
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }

      return [...prev, { product, quantity: 1 }];
    });

    Toast.show({ type: 'success', text1: 'Đã thêm vào giỏ', text2: product.productName });
  }, []);

  // Cập nhật số lượng: delta = +1 hoặc -1, quantity <= 0 → xóa item
  const updateQuantity = useCallback((productId: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((i) =>
          i.product.id === productId ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i,
        )
        .filter((i) => i.quantity > 0),
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const total = useMemo(
    () => items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    [items],
  );

  const count = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);

  return { items, count, total, addItem, updateQuantity, clearCart };
}
