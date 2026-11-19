"use client";

import { useEffect, useState } from "react";
import {
  Database,
  Loader2,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import type { NailProduct } from "@/data/mock-products";
import {
  createProduct,
  deleteProduct,
  generateSlug,
  getProducts,
  seedMockProducts,
  updateProduct,
} from "@/lib/firebase/firestore";
import { formatVND } from "@/lib/utils";

const SHAPES = ["Almond", "Coffin", "Round", "Square"];
const GRADIENTS = [
  "from-nail-100 via-nail-200 to-rose-100",
  "from-pink-100 via-nail-100 to-amber-50",
  "from-rose-50 via-nail-100 to-pink-200/70",
  "from-nail-200 via-rose-200 to-nail-100",
];

const EMPTY_FORM = {
  name: "",
  price: "",
  originalPrice: "",
  shape: "Almond",
  style: "",
  badge: "",
  imageUrl: "",
  description: "",
  gradient: GRADIENTS[0],
};

export function AdminProductsTab() {
  const [products, setProducts] = useState<NailProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      console.error("Lỗi tải sản phẩm:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openCreateForm = () => {
    setEditingId(null);
    setForm({
      ...EMPTY_FORM,
      gradient: GRADIENTS[products.length % GRADIENTS.length],
    });
    setShowForm(true);
  };

  const openEditForm = (product: NailProduct) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      price: String(product.price),
      originalPrice: product.originalPrice ? String(product.originalPrice) : "",
      shape: product.shape,
      style: product.style,
      badge: product.badge ?? "",
      imageUrl: product.imageUrl ?? "",
      description: product.description ?? "",
      gradient: product.gradient || GRADIENTS[0],
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = Number(form.price);
    const originalPriceNum = form.originalPrice ? Number(form.originalPrice) : undefined;

    if (!form.name.trim() || !priceNum || priceNum <= 0) {
      alert("Vui lòng nhập tên sản phẩm và giá bán hợp lệ.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      slug: generateSlug(form.name.trim()),
      price: priceNum,
      ...(originalPriceNum && originalPriceNum > priceNum
        ? { originalPrice: originalPriceNum }
        : {}),
      shape: form.shape,
      style: form.style.trim() || "Thiết kế thủ công",
      ...(form.badge.trim() ? { badge: form.badge.trim() } : {}),
      ...(form.imageUrl.trim() ? { imageUrl: form.imageUrl.trim() } : {}),
      ...(form.description.trim() ? { description: form.description.trim() } : {}),
      gradient: form.gradient,
    };

    try {
      setSaving(true);
      if (editingId) {
        await updateProduct(editingId, payload);
      } else {
        await createProduct(payload);
      }
      setShowForm(false);
      setEditingId(null);
      await fetchProducts();
    } catch (err) {
      console.error("Lỗi lưu sản phẩm:", err);
      alert("Không thể lưu sản phẩm, kiểm tra lại kết nối Firestore nhé.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product: NailProduct) => {
    if (!confirm(`Bạn có chắc muốn xóa mẫu "${product.name}"?`)) return;
    try {
      await deleteProduct(product.id);
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
    } catch (err) {
      console.error("Lỗi xóa sản phẩm:", err);
      alert("Không thể xóa sản phẩm.");
    }
  };

  const handleSeed = async () => {
    try {
      setSeeding(true);
      await seedMockProducts();
      await fetchProducts();
    } catch (err) {
      console.error("Lỗi nhập dữ liệu mẫu:", err);
      alert("Không thể nhập dữ liệu mẫu.");
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Thanh thao tác */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Quản lý trực tiếp danh sách Nail Box hiển thị trên cửa hàng.
        </p>
        <div className="flex flex-wrap gap-2">
          {products.length === 0 && !loading && (
            <button
              type="button"
              onClick={handleSeed}
              disabled={seeding}
              className="inline-flex items-center gap-1.5 rounded-full border border-nail-200 bg-white px-4 py-2 text-xs font-semibold text-nail-900 hover:bg-nail-100 disabled:opacity-60"
            >
              {seeding ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Database className="h-3.5 w-3.5 text-nail-500" />
              )}
              Nhập nhanh mẫu có sẵn
            </button>
          )}
          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-nail-600"
          >
            <Plus className="h-4 w-4" />
            Thêm mẫu Nail Box
          </button>
        </div>
      </div>

      {/* Form Thêm / Sửa sản phẩm */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-nail-200 bg-white p-6 shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between border-b border-nail-100 pb-3">
            <h3 className="font-serif text-lg font-semibold text-nail-950">
              {editingId ? "Chỉnh sửa mẫu Nail Box" : "Thêm mẫu Nail Box mới"}
            </h3>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-full p-1.5 text-muted-foreground hover:bg-nail-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-nail-900">
                Tên mẫu móng *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="VD: Strawberry Milk Glaze"
                className="w-full rounded-xl border border-nail-200 bg-nail-50/40 px-3 py-2 text-sm focus:border-nail-400 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-nail-900">
                Form móng *
              </label>
              <select
                value={form.shape}
                onChange={(e) => setForm({ ...form, shape: e.target.value })}
                className="w-full rounded-xl border border-nail-200 bg-nail-50/40 px-3 py-2 text-sm focus:border-nail-400 focus:outline-none"
              >
                {SHAPES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-nail-900">
                Giá bán (VNĐ) *
              </label>
              <input
                type="number"
                required
                min={1000}
                step={1000}
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="185000"
                className="w-full rounded-xl border border-nail-200 bg-nail-50/40 px-3 py-2 text-sm focus:border-nail-400 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-nail-900">
                Giá gốc gạch ngang (tùy chọn)
              </label>
              <input
                type="number"
                min={0}
                step={1000}
                value={form.originalPrice}
                onChange={(e) =>
                  setForm({ ...form, originalPrice: e.target.value })
                }
                placeholder="220000"
                className="w-full rounded-xl border border-nail-200 bg-nail-50/40 px-3 py-2 text-sm focus:border-nail-400 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-nail-900">
                Phong cách
              </label>
              <input
                type="text"
                value={form.style}
                onChange={(e) => setForm({ ...form, style: e.target.value })}
                placeholder="VD: Ngọt ngào, Mắt mèo, Đính nơ..."
                className="w-full rounded-xl border border-nail-200 bg-nail-50/40 px-3 py-2 text-sm focus:border-nail-400 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-nail-900">
                Nhãn nổi bật (tùy chọn)
              </label>
              <input
                type="text"
                value={form.badge}
                onChange={(e) => setForm({ ...form, badge: e.target.value })}
                placeholder="VD: Best Seller, Mới về, Hot"
                className="w-full rounded-xl border border-nail-200 bg-nail-50/40 px-3 py-2 text-sm focus:border-nail-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-nail-900">
              Link ảnh sản phẩm (URL hoặc `/images/ten-anh.jpg`)
            </label>
            <input
              type="text"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              placeholder="https://... hoặc để trống để dùng nền pastel mặc định"
              className="w-full rounded-xl border border-nail-200 bg-nail-50/40 px-3 py-2 text-sm focus:border-nail-400 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-nail-900">
              Mô tả ngắn (tùy chọn)
            </label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Sơn gel 3 lớp bền màu, tặng kèm bộ dụng cụ dán móng..."
              className="w-full rounded-xl border border-nail-200 bg-nail-50/40 px-3 py-2 text-sm focus:border-nail-400 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-full border border-nail-200 px-5 py-2 text-xs font-semibold text-nail-900 hover:bg-nail-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2 text-xs font-semibold text-primary-foreground hover:bg-nail-600 disabled:opacity-60"
            >
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {editingId ? "Lưu cập nhật" : "Thêm sản phẩm"}
            </button>
          </div>
        </form>
      )}

      {/* Danh sách sản phẩm */}
      {loading ? (
        <div className="rounded-3xl border border-nail-200 bg-white p-12 text-center text-sm text-muted-foreground">
          Đang tải danh sách sản phẩm...
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-nail-200 bg-white p-12 text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Chưa có sản phẩm nào trên Firestore.
          </p>
          <p className="text-xs text-muted-foreground">
            Bấm <strong>Nhập nhanh mẫu có sẵn</strong> ở góc trên để tạo ngay 4 mẫu ban đầu.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex flex-col justify-between rounded-2xl border border-nail-200/80 bg-white p-4 shadow-xs space-y-3"
            >
              <div className="flex gap-3.5">
                <div
                  className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br ${
                    product.gradient || GRADIENTS[0]
                  } flex items-center justify-center`}
                >
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Sparkles className="h-5 w-5 text-nail-500/70" />
                  )}
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-full bg-nail-100 px-2 py-0.5 text-[10px] font-bold text-nail-700">
                      {product.shape}
                    </span>
                    {product.badge && (
                      <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                        {product.badge}
                      </span>
                    )}
                  </div>
                  <h4 className="truncate text-sm font-bold text-nail-950">
                    {product.name}
                  </h4>
                  <p className="text-xs font-bold text-nail-600">
                    {formatVND(product.price)}
                    {product.originalPrice && (
                      <span className="ml-1.5 text-[11px] font-normal text-muted-foreground line-through">
                        {formatVND(product.originalPrice)}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-nail-100 pt-3">
                <button
                  type="button"
                  onClick={() => openEditForm(product)}
                  className="inline-flex items-center gap-1 rounded-full border border-nail-200 px-3 py-1 text-xs font-semibold text-nail-900 hover:bg-nail-50"
                >
                  <Pencil className="h-3 w-3" />
                  Sửa
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(product)}
                  className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                >
                  <Trash2 className="h-3 w-3" />
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}