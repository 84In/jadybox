"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarHeart,
  Check,
  Gift,
  Minus,
  Plus,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import type { NailProduct } from "@/data/mock-products";
import { storeConfig } from "@/config/store";
import { cn } from "@/lib/utils";
import type { NailSize } from "@/types/product";

import { useCart } from "@/components/providers/CartProvider";

const formatVND = (price: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

export function ProductDetailClient({ product }: { product: NailProduct }) {
  const [selectedSize, setSelectedSize] = useState<string>(storeConfig.nailSizes[1]); // Mặc định S
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const { addItem } = useCart();

  const handleAddToCart = () => {
  addItem({
    productId: product.id,
    name: product.name,
    image: "",
    price: product.price,
    nailSize: selectedSize as NailSize,
    quantity,
  });
  setAdded(true);
  setTimeout(() => setAdded(false), 1800);
};
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
      {/* Quay lại */}
      <Link
        href="/products"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition hover:text-nail-500"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại danh sách Nail Box
      </Link>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        {/* Cột trái: Ảnh sản phẩm */}
        <div
          className={`relative aspect-square overflow-hidden rounded-3xl border border-nail-200 bg-gradient-to-br ${product.gradient} flex items-center justify-center shadow-[var(--shadow-soft)]`}
        >
          <div className="flex flex-col items-center gap-2 text-nail-500/80">
            <Sparkles className="h-12 w-12" />
            <span className="font-serif text-lg font-medium text-nail-900">
              {product.name}
            </span>
            <span className="text-xs text-muted-foreground">(Ảnh sản phẩm 1:1)</span>
          </div>

          {product.badge && (
            <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3.5 py-1 text-xs font-bold text-nail-600 shadow-xs">
              {product.badge}
            </span>
          )}
        </div>

        {/* Cột phải: Thông tin & Chọn Size */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="rounded-full bg-nail-100 px-3 py-1 text-nail-700">
                Form {product.shape}
              </span>
              <span className="rounded-full bg-white border border-nail-200 px-3 py-1 text-muted-foreground">
                {product.style}
              </span>
            </div>

            <h1 className="font-serif text-3xl font-semibold text-nail-950 sm:text-4xl">
              {product.name}
            </h1>

            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold text-nail-500">
                {formatVND(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatVND(product.originalPrice)}
                </span>
              )}
            </div>

            <p className="text-sm leading-relaxed text-muted-foreground">
              Bộ Nail Box vẽ tay tỉ mỉ bằng sơn gel chuẩn salon, bền màu và có thể tái
              sử dụng 3–5 lần. Đổi bộ móng mới lung linh chỉ sau 5 phút dán tại nhà.
            </p>

            {/* Chọn Size móng */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-nail-900">
                  Chọn size móng
                </span>
                <span className="text-xs text-nail-500 font-semibold">
                  Đã chọn: {selectedSize}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {storeConfig.nailSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={cn(
                      "rounded-xl px-4 py-2 text-xs font-semibold transition",
                      selectedSize === size
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "border border-nail-200 bg-white text-nail-900 hover:bg-nail-100"
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Chọn Số lượng */}
            <div className="flex items-center gap-4 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-nail-900">
                Số lượng
              </span>
              <div className="inline-flex items-center rounded-full border border-nail-200 bg-white p-1">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-nail-900 hover:bg-nail-100"
                  aria-label="Giảm số lượng"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-10 text-center text-sm font-bold text-nail-950">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-nail-900 hover:bg-nail-100"
                  aria-label="Tăng số lượng"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Quà tặng kèm */}
            <div className="flex items-start gap-3 rounded-2xl border border-nail-200/70 bg-white/80 p-4">
              <Gift className="mt-0.5 h-5 w-5 shrink-0 text-nail-500" />
              <div className="text-xs leading-relaxed text-muted-foreground">
                <strong className="text-nail-950">Tặng kèm bộ kit 5 món:</strong> Keo
                nước, miếng dán silicon, dũa mini, que đẩy da và bông cồn lau móng.
              </div>
            </div>
          </div>

          {/* Nút hành động */}
          <div className="flex flex-col gap-3 sm:flex-row pt-2">
            <button
              type="button"
              onClick={handleAddToCart}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-nail-600"
            >
              {added ? (
                <>
                  <Check className="h-4 w-4" />
                  Đã thêm vào giỏ!
                </>
              ) : (
                <>
                  <ShoppingBag className="h-4 w-4" />
                  Thêm vào giỏ — {formatVND(product.price * quantity)}
                </>
              )}
            </button>

            <Link
              href="/booking"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-nail-300 bg-white px-5 py-3.5 text-sm font-semibold text-nail-900 transition hover:bg-nail-100"
            >
              <CalendarHeart className="h-4 w-4 text-nail-500" />
              Làm trực tiếp tại tiệm
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}