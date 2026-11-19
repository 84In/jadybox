"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ShoppingBag, Sparkles } from "lucide-react";
import type { NailProduct } from "@/data/mock-products";
import { useCart } from "@/components/providers/CartProvider";

const formatVND = (price: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    price,
  );

export function ProductCard({ product }: { product: NailProduct }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleQuickAdd = () => {
    addItem({
      productId: product.id,
      name: product.name,
      image: product.imageUrl || "", 
      price: product.price,
      nailSize: "S", // Size mặc định khi thêm nhanh
      quantity: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-nail-200/80 bg-card p-3 shadow-[var(--shadow-soft)] transition hover:-translate-y-1 hover:border-nail-300">
      {/* Khung ảnh tỷ lệ 1:1 */}
      {product.imageUrl ? (
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="flex flex-col items-center gap-1.5 text-nail-500/70 transition group-hover:scale-105">
          <Sparkles className="h-7 w-7" />
          <span className="text-xs font-semibold">Ảnh Nail Box</span>
        </div>
      )}
      <div className="flex flex-col items-center gap-1.5 text-nail-500/70 transition group-hover:scale-105">
        <Sparkles className="h-7 w-7" />
        <span className="text-xs font-semibold">Ảnh Nail Box</span>
      </div>

      {product.badge && (
        <span className="absolute left-2.5 top-2.5 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-nail-600 shadow-sm backdrop-blur-sm">
          {product.badge}
        </span>
      )}

      {/* Thông tin sản phẩm */}
      <div className="flex flex-1 flex-col justify-between pt-3.5 px-1">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
            <span>Form {product.shape}</span>
            <span>{product.style}</span>
          </div>
          <Link href={`/products/${product.slug}`}>
            <h3 className="line-clamp-1 text-base font-bold text-nail-950 transition group-hover:text-nail-500">
              {product.name}
            </h3>
          </Link>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-nail-500">
              {formatVND(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-muted-foreground line-through">
                {formatVND(product.originalPrice)}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleQuickAdd}
            aria-label="Thêm vào giỏ"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-nail-100 text-nail-700 transition hover:bg-primary hover:text-white"
          >
            {added ? (
              <Check className="h-4 w-4 text-nail-600" />
            ) : (
              <ShoppingBag className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
