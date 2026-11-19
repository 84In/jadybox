"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { MOCK_PRODUCTS } from "@/data/mock-products";
import { ProductCard } from "@/components/features/products/ProductCard";
import { storeConfig } from "@/config/store";
import { cn } from "@/lib/utils";

type SortOption = "default" | "price-asc" | "price-desc";

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [selectedShape, setSelectedShape] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("default");

  const filteredProducts = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    const list = MOCK_PRODUCTS.filter((item) => {
      const matchSearch =
        !keyword ||
        item.name.toLowerCase().includes(keyword) ||
        item.style.toLowerCase().includes(keyword);

      const matchShape =
        selectedShape === "all" ||
        item.shape.toLowerCase() === selectedShape.toLowerCase();

      return matchSearch && matchShape;
    });

    if (sortBy === "price-asc") {
      return [...list].sort((a, b) => a.price - b.price);
    }
    if (sortBy === "price-desc") {
      return [...list].sort((a, b) => b.price - a.price);
    }
    return list;
  }, [search, selectedShape, sortBy]);

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6">
      {/* Tiêu đề trang */}
      <div className="space-y-2 text-center md:text-left">
        <p className="text-xs font-bold uppercase tracking-widest text-nail-500">
          Bộ sưu tập Jady
        </p>
        <h1 className="font-serif text-3xl font-semibold text-nail-950 sm:text-4xl">
          Tất cả mẫu Nail Box
        </h1>
        <p className="text-sm text-muted-foreground">
          Thiết kế thủ công 100% sơn gel cao cấp — tặng kèm đầy đủ bộ dụng cụ dán móng.
        </p>
      </div>

      {/* Thanh tìm kiếm & Sắp xếp */}
      <div className="flex flex-col gap-4 rounded-2xl border border-nail-200/80 bg-white/80 p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-nail-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm mẫu móng, phong cách (mắt mèo, nơ...)"
            className="w-full rounded-full border border-nail-200 bg-nail-50/50 py-2.5 pl-10 pr-4 text-sm text-nail-950 placeholder:text-muted-foreground/70 focus:border-nail-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-nail-500 shrink-0" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="rounded-full border border-nail-200 bg-white px-4 py-2 text-xs font-semibold text-nail-900 focus:border-nail-400 focus:outline-none"
          >
            <option value="default">Sắp xếp: Nổi bật</option>
            <option value="price-asc">Giá: Thấp đến cao</option>
            <option value="price-desc">Giá: Cao đến thấp</option>
          </select>
        </div>
      </div>

      {/* Bộ lọc Form móng */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setSelectedShape("all")}
          className={cn(
            "rounded-full px-4 py-1.5 text-xs font-semibold transition",
            selectedShape === "all"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "border border-nail-200 bg-white text-nail-900 hover:bg-nail-100"
          )}
        >
          Tất cả form
        </button>

        {storeConfig.nailShapes.map((shape) => (
          <button
            key={shape.value}
            type="button"
            onClick={() => setSelectedShape(shape.value)}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-semibold transition",
              selectedShape === shape.value
                ? "bg-primary text-primary-foreground shadow-xs"
                : "border border-nail-200 bg-white text-nail-900 hover:bg-nail-100"
            )}
          >
            {shape.label}
          </button>
        ))}
      </div>

      {/* Lưới sản phẩm */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-nail-200 bg-white/60 py-16 text-center">
          <Sparkles className="h-8 w-8 text-nail-400" />
          <p className="mt-3 font-serif text-lg font-semibold text-nail-950">
            Chưa tìm thấy mẫu phù hợp
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Thử đổi từ khóa hoặc chọn lại bộ lọc form móng nhé.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setSelectedShape("all");
            }}
            className="mt-4 rounded-full bg-secondary px-5 py-2 text-xs font-semibold text-secondary-foreground hover:bg-accent"
          >
            Xóa bộ lọc
          </button>
        </div>
      )}
    </div>
  );
}