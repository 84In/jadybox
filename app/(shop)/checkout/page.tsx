"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Minus,
  Phone,
  Plus,
  ShoppingBag,
  Sparkles,
  Trash2,
  Truck,
  User,
} from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";
import { storeConfig } from "@/config/store";
import { siteConfig } from "@/config/site";
import { cn, formatVND } from "@/lib/utils";
import { useAuth } from "@/components/providers/AuthProvider";
import { createOrder } from "@/lib/firebase/firestore";

type PaymentMethod = "cod" | "bank";

export default function CheckoutPage() {
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    shippingFee,
    totalAmount,
    hydrated,
  } = useCart();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [orderPlaced, setOrderPlaced] = useState<{
    code: string;
    total: number;
    name: string;
  } | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const { user, profile } = useAuth();

  useEffect(() => {
    if (profile?.name && !fullName) setFullName(profile.name);
    if (profile?.phone && !phone) setPhone(profile.phone);
    if (profile?.address && !address) setAddress(profile.address);
  }, [profile]);

  const remainingForFreeShip = Math.max(
    0,
    storeConfig.freeShippingThreshold - subtotal,
  );
  const freeShipPercent = Math.min(
    100,
    Math.round((subtotal / storeConfig.freeShippingThreshold) * 100),
  );

  const canSubmit =
    items.length > 0 &&
    fullName.trim().length > 0 &&
    phone.trim().length >= 9 &&
    address.trim().length >= 5;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;

    try {
      setSubmitting(true);
      const orderCode = `JD${Date.now().toString().slice(-6)}`;

      await createOrder({
        userId: user?.uid ?? null,
        orderCode,
        items,
        subtotal,
        shippingFee,
        totalAmount,
        shippingInfo: {
          fullName: fullName.trim(),
          phone: phone.trim(),
          address: address.trim(),
          note: note.trim(),
        },
        paymentMethod,
      });

      setOrderPlaced({
        code: orderCode,
        total: totalAmount,
        name: fullName.trim(),
      });
      clearCart();
    } catch (error) {
      console.error("Lỗi tạo đơn hàng:", error);
      alert("Có lỗi khi gửi đơn hàng, bạn kiểm tra lại kết nối Firebase nhé.");
    } finally {
      setSubmitting(false);
    }
  };

  // 1. Màn hình đặt hàng thành công
  if (orderPlaced) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
        <div className="rounded-3xl border border-nail-200 bg-white p-8 text-center shadow-[var(--shadow-soft)] space-y-5">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-nail-100 text-nail-500">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <div className="space-y-1.5">
            <h1 className="font-serif text-2xl font-semibold text-nail-950">
              Đặt hàng thành công!
            </h1>
            <p className="text-sm text-muted-foreground">
              Cảm ơn{" "}
              <strong className="text-nail-900">{orderPlaced.name}</strong> đã
              chọn {siteConfig.name}. Tiệm sẽ liên hệ xác nhận size móng sớm
              nhất.
            </p>
          </div>

          <div className="rounded-2xl border border-nail-100 bg-nail-50 p-4 text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mã đơn hàng:</span>
              <span className="font-bold text-nail-950">
                #{orderPlaced.code}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tổng thanh toán:</span>
              <span className="font-bold text-nail-500">
                {formatVND(orderPlaced.total)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Thanh toán:</span>
              <span className="font-semibold text-nail-900">
                {paymentMethod === "cod"
                  ? "Thanh toán khi nhận hàng (COD)"
                  : "Chuyển khoản ngân hàng"}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 pt-2 sm:flex-row sm:justify-center">
            <Link
              href="/products"
              className="rounded-full bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-nail-600"
            >
              Tiếp tục mua sắm
            </Link>
            <Link
              href="/"
              className="rounded-full border border-nail-200 px-5 py-2.5 text-xs font-semibold text-nail-900 hover:bg-nail-100"
            >
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Chờ đọc localStorage
  if (!hydrated) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 text-center text-sm text-muted-foreground">
        Đang tải giỏ hàng...
      </div>
    );
  }

  // 2. Màn hình giỏ hàng trống
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center space-y-5">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-nail-100 text-nail-400">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <div className="space-y-1.5">
          <h1 className="font-serif text-2xl font-semibold text-nail-950">
            Giỏ hàng đang trống
          </h1>
          <p className="text-sm text-muted-foreground">
            Bạn chưa chọn mẫu Nail Box nào. Ghé xem bộ sưu tập mới nhất của Jady
            nhé!
          </p>
        </div>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-nail-600"
        >
          Khám phá Nail Box
        </Link>
      </div>
    );
  }

  // 3. Giao diện Giỏ hàng & Form thanh toán
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-nail-500"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Tiếp tục chọn mẫu
          </Link>
          <h1 className="mt-2 font-serif text-3xl font-semibold text-nail-950">
            Giỏ hàng & Thanh toán
          </h1>
        </div>
        <p className="text-xs font-semibold text-muted-foreground">
          {items.length} sản phẩm trong giỏ
        </p>
      </div>

      {/* Thanh tiến trình Freeship */}
      <div className="rounded-2xl border border-nail-200/80 bg-white/85 p-4 space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-nail-900">
          <Truck className="h-4 w-4 text-nail-500" />
          {remainingForFreeShip === 0 ? (
            <span className="text-nail-600">
              Tuyệt vời! Đơn hàng của bạn được{" "}
              <strong>Miễn phí vận chuyển</strong>.
            </span>
          ) : (
            <span>
              Mua thêm{" "}
              <strong className="text-nail-500">
                {formatVND(remainingForFreeShip)}
              </strong>{" "}
              để được <strong>Freeship</strong> nhé!
            </span>
          )}
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-nail-100">
          <div
            className="h-full rounded-full bg-nail-500 transition-all duration-300"
            style={{ width: `${freeShipPercent}%` }}
          />
        </div>
      </div>

      <form
        onSubmit={handlePlaceOrder}
        className="grid grid-cols-1 gap-8 lg:grid-cols-3"
      >
        {/* Cột trái (2/3): Danh sách món + Thông tin giao hàng */}
        <div className="space-y-8 lg:col-span-2">
          {/* Danh sách sản phẩm */}
          <section className="rounded-3xl border border-nail-200/80 bg-white/85 p-6 shadow-xs space-y-4">
            <h2 className="font-serif text-xl font-semibold text-nail-950">
              Sản phẩm đã chọn
            </h2>

            <div className="divide-y divide-nail-100">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.nailSize}`}
                  className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-nail-100 to-nail-200/70 text-nail-500">
                    <Sparkles className="h-6 w-6" />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <h3 className="truncate text-sm font-bold text-nail-950">
                      {item.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Size móng:{" "}
                      <span className="font-semibold text-nail-700">
                        {item.nailSize}
                      </span>
                    </p>
                    <p className="text-sm font-bold text-nail-500">
                      {formatVND(item.price)}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="inline-flex items-center rounded-full border border-nail-200 bg-white p-0.5">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.productId, item.nailSize, -1)
                        }
                        className="flex h-7 w-7 items-center justify-center rounded-full text-nail-900 hover:bg-nail-100"
                        aria-label="Giảm"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-7 text-center text-xs font-bold text-nail-950">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.productId, item.nailSize, 1)
                        }
                        className="flex h-7 w-7 items-center justify-center rounded-full text-nail-900 hover:bg-nail-100"
                        aria-label="Tăng"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.productId, item.nailSize)}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Thông tin nhận hàng */}
          <section className="rounded-3xl border border-nail-200/80 bg-white/85 p-6 shadow-xs space-y-4">
            <h2 className="font-serif text-xl font-semibold text-nail-950">
              Thông tin giao hàng
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-nail-900">
                  Họ và tên người nhận *
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-nail-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nguyễn Ngọc Anh"
                    className="w-full rounded-xl border border-nail-200 bg-nail-50/40 py-2.5 pl-10 pr-3 text-sm text-nail-950 focus:border-nail-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-nail-900">
                  Số điện thoại *
                </label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-nail-400" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0909 123 456"
                    className="w-full rounded-xl border border-nail-200 bg-nail-50/40 py-2.5 pl-10 pr-3 text-sm text-nail-950 focus:border-nail-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-nail-900">
                Địa chỉ nhận hàng *
              </label>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-nail-400" />
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện..."
                  className="w-full rounded-xl border border-nail-200 bg-nail-50/40 py-2.5 pl-10 pr-3 text-sm text-nail-950 focus:border-nail-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-nail-900">
                Ghi chú (số đo móng riêng hoặc yêu cầu thêm)
              </label>
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="VD: Số đo 5 ngón 15-11-12-11-9mm, giao giờ hành chính..."
                className="w-full rounded-xl border border-nail-200 bg-nail-50/40 p-3 text-sm text-nail-950 focus:border-nail-400 focus:outline-none"
              />
            </div>

            {/* Phương thức thanh toán */}
            <div className="space-y-2 pt-2">
              <p className="text-xs font-semibold text-nail-900">
                Phương thức thanh toán
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  {
                    value: "cod" as const,
                    title: "Thanh toán khi nhận hàng (COD)",
                    desc: "Kiểm tra hộp hàng rồi thanh toán",
                  },
                  {
                    value: "bank" as const,
                    title: "Chuyển khoản ngân hàng",
                    desc: "Quét mã QR VietQR sau khi đặt",
                  },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPaymentMethod(opt.value)}
                    className={cn(
                      "rounded-2xl border p-3.5 text-left transition",
                      paymentMethod === opt.value
                        ? "border-nail-500 bg-nail-50"
                        : "border-nail-200 bg-white hover:bg-nail-50/50",
                    )}
                  >
                    <p className="text-xs font-bold text-nail-950">
                      {opt.title}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {opt.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Cột phải (1/3): Tóm tắt đơn hàng */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24 rounded-3xl border border-nail-200 bg-white p-6 shadow-[var(--shadow-soft)] space-y-5">
            <h3 className="font-serif text-lg font-semibold text-nail-950 border-b border-nail-100 pb-4">
              Tóm tắt đơn hàng
            </h3>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tạm tính</span>
                <span className="font-semibold text-nail-950">
                  {formatVND(subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phí giao hàng</span>
                <span className="font-semibold text-nail-950">
                  {shippingFee === 0 ? (
                    <span className="text-nail-600">Miễn phí</span>
                  ) : (
                    formatVND(shippingFee)
                  )}
                </span>
              </div>
            </div>

            <div className="flex items-baseline justify-between border-t border-nail-100 pt-4">
              <span className="text-sm font-semibold text-nail-900">
                Tổng cộng
              </span>
              <span className="text-xl font-bold text-nail-500">
                {formatVND(totalAmount)}
              </span>
            </div>

            <button
              type="submit"
              disabled={!canSubmit || submitting}
              className={cn(
                "w-full rounded-full py-3.5 text-sm font-semibold transition",
                canSubmit && !submitting
                  ? "bg-primary text-primary-foreground shadow-sm hover:bg-nail-600"
                  : "cursor-not-allowed bg-nail-100 text-nail-400",
              )}
            >
              {submitting ? "Đang gửi đơn hàng..." : "Đặt hàng ngay"}
            </button>
          </div>
        </aside>
      </form>
    </div>
  );
}
