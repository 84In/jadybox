"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarHeart,
  CheckCircle2,
  Loader2,
  LogOut,
  MapPin,
  Package,
  Pencil,
  Phone,
  ShieldCheck,
  ShoppingBag,
  User as UserIcon,
} from "lucide-react";
import { normalizeVNPhone, useAuth } from "@/components/providers/AuthProvider";
import {
  type AdminAppointment,
  type AdminOrder,
  type AppointmentStatus,
  getUserAppointments,
  getUserOrders,
} from "@/lib/firebase/firestore";
import type { OrderStatus } from "@/types/order";
import { cn, formatVND } from "@/lib/utils";

const ORDER_STATUS_MAP: Record<OrderStatus, { label: string; color: string }> = {
  pending: { label: "Chờ xác nhận", color: "bg-amber-100 text-amber-800" },
  confirmed: { label: "Đã xác nhận", color: "bg-sky-100 text-sky-800" },
  shipping: { label: "Đang giao hàng", color: "bg-purple-100 text-purple-800" },
  done: { label: "Hoàn thành", color: "bg-emerald-100 text-emerald-800" },
  cancelled: { label: "Đã hủy", color: "bg-rose-100 text-rose-700" },
};

const APPOINTMENT_STATUS_MAP: Record<
  AppointmentStatus,
  { label: string; color: string }
> = {
  pending: { label: "Chờ tiệm duyệt", color: "bg-amber-100 text-amber-800" },
  confirmed: { label: "Đã giữ chỗ", color: "bg-sky-100 text-sky-800" },
  done: { label: "Đã hoàn thành", color: "bg-emerald-100 text-emerald-800" },
  cancelled: { label: "Đã hủy", color: "bg-rose-100 text-rose-700" },
};

type ProfileTab = "orders" | "appointments" | "info";

export default function ProfilePage() {
  const { user, profile, loading, updateUserProfile, logout } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<ProfileTab>("orders");
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
  const [fetching, setFetching] = useState(true);

  // State cho form cập nhật thông tin cá nhân
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  // Đổ sẵn dữ liệu hiện có vào form
  useEffect(() => {
    if (profile) {
      setFullName(profile.name || "");
      setPhone(profile.phone || "");
      setAddress(profile.address || "");
    }
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    let active = true;

    setFetching(true);
    Promise.all([getUserOrders(user.uid), getUserAppointments(user.uid)])
      .then(([userOrders, userAppointments]) => {
        if (!active) return;
        setOrders(userOrders);
        setAppointments(userAppointments);
      })
      .catch((err) => console.error("Lỗi tải lịch sử cá nhân:", err))
      .finally(() => {
        if (active) setFetching(false);
      });

    return () => {
      active = false;
    };
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError("");
    setSaveMessage("");

    if (fullName.trim().length < 2) {
      setSaveError("Họ tên cần có ít nhất 2 ký tự.");
      return;
    }

    let formattedPhone = phone.trim();
    if (formattedPhone) {
      const normalized = normalizeVNPhone(formattedPhone);
      if (!normalized) {
        setSaveError("Số điện thoại chưa hợp lệ (gồm 10 số, bắt đầu bằng 0).");
        return;
      }
      formattedPhone = normalized;
    }

    try {
      setSaving(true);
      await updateUserProfile({
        name: fullName,
        phone: formattedPhone,
        address,
      });
      setPhone(formattedPhone);
      setSaveMessage("Đã lưu thông tin cá nhân thành công!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (err) {
      console.error("Lỗi cập nhật hồ sơ:", err);
      setSaveError("Không thể lưu thông tin lúc này, bạn thử lại nhé.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-nail-500" />
      </div>
    );
  }

  const displayName = profile?.name || user.displayName || "Khách hàng Jady";
  const displayContact = profile?.phone || profile?.email || user.email || "";

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 space-y-8">
      {/* Thẻ thông tin tài khoản */}
      <div className="flex flex-col gap-4 rounded-3xl border border-nail-200 bg-white p-6 shadow-[var(--shadow-soft)] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={displayName}
              className="h-14 w-14 rounded-full object-cover border border-nail-200"
            />
          ) : (
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-nail-100 text-xl font-bold text-nail-700">
              {displayName[0]?.toUpperCase()}
            </span>
          )}
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl font-semibold text-nail-950">
                {displayName}
              </h1>
              {profile?.role === "admin" && (
                <span className="rounded-full bg-nail-500 px-2.5 py-0.5 text-[10px] font-bold text-white">
                  Admin
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{displayContact}</p>
            {profile?.address && (
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 shrink-0 text-nail-400" />
                <span className="line-clamp-1">{profile.address}</span>
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setActiveTab("info")}
            className="inline-flex items-center gap-1.5 rounded-full border border-nail-200 bg-nail-50 px-4 py-2 text-xs font-semibold text-nail-900 transition hover:bg-nail-100"
          >
            <Pencil className="h-3.5 w-3.5" />
            Sửa thông tin
          </button>

          {profile?.role === "admin" && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 rounded-full bg-nail-100 px-4 py-2 text-xs font-bold text-nail-700 transition hover:bg-nail-200"
            >
              <ShieldCheck className="h-4 w-4" />
              Trang Quản trị
            </Link>
          )}

          <button
            type="button"
            onClick={async () => {
              await logout();
              router.push("/");
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-nail-200 bg-white px-4 py-2 text-xs font-semibold text-nail-900 transition hover:bg-nail-50"
          >
            <LogOut className="h-3.5 w-3.5" />
            Đăng xuất
          </button>
        </div>
      </div>

      {/* Thanh chuyển Tab */}
      <div className="flex flex-wrap gap-2 border-b border-nail-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("orders")}
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold transition",
            activeTab === "orders"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "border border-nail-200 bg-white text-nail-900 hover:bg-nail-50"
          )}
        >
          <Package className="h-4 w-4" />
          Đơn Nail Box ({orders.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("appointments")}
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold transition",
            activeTab === "appointments"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "border border-nail-200 bg-white text-nail-900 hover:bg-nail-50"
          )}
        >
          <CalendarHeart className="h-4 w-4" />
          Lịch hẹn tại tiệm ({appointments.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("info")}
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold transition",
            activeTab === "info"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "border border-nail-200 bg-white text-nail-900 hover:bg-nail-50"
          )}
        >
          <UserIcon className="h-4 w-4" />
          Thông tin cá nhân
        </button>
      </div>

      {/* Nội dung Tab */}
      {activeTab === "info" ? (
        <form
          onSubmit={handleSaveProfile}
          className="rounded-3xl border border-nail-200 bg-white p-6 sm:p-8 shadow-xs space-y-5"
        >
          <div className="space-y-1">
            <h2 className="font-serif text-xl font-semibold text-nail-950">
              Cập nhật thông tin nhận hàng
            </h2>
            <p className="text-xs text-muted-foreground">
              Thông tin này sẽ được tự động điền sẵn mỗi khi bạn đặt Nail Box hoặc đặt lịch tại tiệm.
            </p>
          </div>

          {saveError && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-xs font-medium text-destructive">
              {saveError}
            </div>
          )}

          {saveMessage && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {saveMessage}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-nail-900">
                Họ và tên *
              </label>
              <div className="relative">
                <UserIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-nail-400" />
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
                Số điện thoại
              </label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-nail-400" />
                <input
                  type="tel"
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
              Địa chỉ giao hàng mặc định
            </label>
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-nail-400" />
              <textarea
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố..."
                className="w-full rounded-xl border border-nail-200 bg-nail-50/40 py-2.5 pl-10 pr-3 text-sm text-nail-950 focus:border-nail-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-nail-600 disabled:opacity-60"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      ) : fetching ? (
        <div className="rounded-3xl border border-nail-200 bg-white p-12 text-center text-sm text-muted-foreground">
          Đang tải lịch sử của bạn...
        </div>
      ) : activeTab === "orders" ? (
        orders.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-nail-200 bg-white p-12 text-center space-y-4">
            <ShoppingBag className="mx-auto h-8 w-8 text-nail-300" />
            <p className="text-sm text-muted-foreground">
              Bạn chưa có đơn đặt Nail Box nào.
            </p>
            <Link
              href="/products"
              className="inline-flex rounded-full bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-nail-600"
            >
              Khám phá mẫu Nail Box
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const badge =
                ORDER_STATUS_MAP[order.status] ?? ORDER_STATUS_MAP.pending;
              return (
                <div
                  key={order.id}
                  className="rounded-2xl border border-nail-200/80 bg-white p-5 shadow-xs space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-nail-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-nail-950">
                        #{order.orderCode || order.id.slice(0, 6)}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-[11px] font-bold",
                          badge.color
                        )}
                      >
                        {badge.label}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleString("vi-VN")}
                    </span>
                  </div>

                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    {order.items?.map((item, idx) => (
                      <li key={idx} className="flex justify-between gap-2">
                        <span>
                          {item.name} (Size {item.nailSize}) × {item.quantity}
                        </span>
                        <span className="font-semibold text-nail-900">
                          {formatVND(item.price * item.quantity)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-nail-100 pt-3 text-xs">
                    <span className="text-muted-foreground">
                      Giao đến: {order.shippingInfo?.address}
                    </span>
                    <span className="text-sm font-bold text-nail-600">
                      Tổng: {formatVND(order.totalAmount)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : appointments.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-nail-200 bg-white p-12 text-center space-y-4">
          <CalendarHeart className="mx-auto h-8 w-8 text-nail-300" />
          <p className="text-sm text-muted-foreground">
            Bạn chưa đặt lịch làm móng tại tiệm lần nào.
          </p>
          <Link
            href="/booking"
            className="inline-flex rounded-full bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-nail-600"
          >
            Đặt lịch ngay
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((apt) => {
            const badge =
              APPOINTMENT_STATUS_MAP[apt.status] ??
              APPOINTMENT_STATUS_MAP.pending;
            return (
              <div
                key={apt.id}
                className="rounded-2xl border border-nail-200/80 bg-white p-5 shadow-xs space-y-2.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-lg bg-nail-100 px-2.5 py-1 text-xs font-bold text-nail-700">
                    {apt.timeSlot} — {apt.date}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-[11px] font-bold",
                      badge.color
                    )}
                  >
                    {badge.label}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Dịch vụ: {apt.serviceNames?.join(", ")}
                </p>
                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-muted-foreground">
                    {apt.note ? `Ghi chú: ${apt.note}` : "Không có ghi chú"}
                  </span>
                  <span className="text-sm font-bold text-nail-600">
                    Tạm tính: {formatVND(apt.totalEstimatedPrice || 0)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}