"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { CartItem } from "@/types/order";
import { storeConfig } from "@/config/store";

const CART_STORAGE_KEY = "jady_box_cart";

interface CartContextType {
  items: CartItem[];
  addItem: (newItem: CartItem) => void;
  updateQuantity: (productId: string, nailSize: string, delta: number) => void;
  removeItem: (productId: string, nailSize: string) => void;
  clearCart: () => void;
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  totalItems: number;
  hydrated: boolean;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch {
        setItems([]);
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, hydrated]);

  const addItem = (newItem: CartItem) => {
    setItems((prev) => {
      const idx = prev.findIndex(
        (i) => i.productId === newItem.productId && i.nailSize === newItem.nailSize
      );
      if (idx > -1) {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          quantity: updated[idx].quantity + newItem.quantity,
        };
        return updated;
      }
      return [...prev, newItem];
    });
  };

  const updateQuantity = (productId: string, nailSize: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((i) =>
          i.productId === productId && i.nailSize === nailSize
            ? { ...i, quantity: i.quantity + delta }
            : i
        )
        .filter((i) => i.quantity > 0)
    );
  };

  const removeItem = (productId: string, nailSize: string) => {
    setItems((prev) =>
      prev.filter((i) => !(i.productId === productId && i.nailSize === nailSize))
    );
  };

  const clearCart = () => setItems([]);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shippingFee =
    subtotal === 0 || subtotal >= storeConfig.freeShippingThreshold
      ? 0
      : storeConfig.shippingFee;
  const totalAmount = subtotal + shippingFee;
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        subtotal,
        shippingFee,
        totalAmount,
        totalItems,
        hydrated,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart phải được dùng bên trong CartProvider");
  }
  return ctx;
}