"use client";

import { useEffect, useState } from "react";
import {
  CalendarHeart,
  Clock,
  Package,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import {
  type AdminAppointment,
  type AdminOrder,
  type AppointmentStatus,
  getAllAppointments,
  getAllOrders,
  updateAppointmentStatus,
  updateOrderStatus,
} from "@/lib/firebase/firestore";
import type { OrderStatus } from "@/types/order";
import { cn, formatVND } from "@/lib/utils";
import { AdminProductsTab } from "@/components/features/admin/AdminProductsTab";

const ORDER_STATUS_LABELS: Record<
  OrderStatus,
  { label: string; color: string }
> = {
  pending: { label: "Chờ xác nhận", color: "bg-amber-100 text-amber-800" },
  confirmed: { label: "Đã xác nhận", color: "bg-sky-100 text-sky-800" },
  shipping: { label: "Đang giao", color: "bg-purple-100 text-purple-800" },
  done: { label: "Hoàn thành", color: "bg-emerald-100 text-emerald-800" },
  cancelled: { label: "Đã hủy", color: "bg-rose-100 text-rose-700" },
};

const APPOINTMENT_STATUS_LABELS: Record<
  AppointmentStatus,
  { label: string; color: string }
> = {
  pending: { label: "Chờ duyệt", color: "bg-amber-100 text-amber-800" },
  confirmed: { label: "Đã giữ chỗ", color: "bg-sky-100 text-sky-800" },
  done: { label: "Đã làm xong", color: "bg-emerald-100 text-emerald-800" },
  cancelled: { label: "Đã hủy", color: "bg-rose-100 text-rose-700" },
};

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<
    "orders" | "appointments" | "products"
  >("orders");
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordersData, appointmentsData] = await Promise.all([
        getAllOrders(),
        getAllAppointments(),
      ]);
      setOrders(ordersData);
      setAppointments(appointmentsData);
    } catch (error) {
      console.error("Lỗi tải dữ liệu admin:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOrderStatusChange = async (
    orderId: string,
    status: OrderStatus,
  ) => {
    try {
      setUpdatingId(orderId);
      await updateOrderStatus(orderId, status);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o)),
      );
    } catch (error) {
      console.error("Lỗi cập nhật đơn hàng:", error);
      alert("Không thể cập nhật trạng thái đơn hàng.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAppointmentStatusChange = async (
    appointmentId: string,
    status: AppointmentStatus,
  ) => {
    try {
      setUpdatingId(appointmentId);
      await updateAppointmentStatus(appointmentId, status);
      setAppointments((prev) =>
        prev.map((a) => (a.id === appointmentId ? { ...a, status } : a)),
      );
    } catch (error) {
      console.error("Lỗi cập nhật lịch hẹn:", error);
      alert("Không thể cập nhật trạng thái lịch hẹn.");
    } finally {
      setUpdatingId(null);
    }
  };

  const pendingOrdersCount = orders.filter(
    (o) => o.status === "pending",
  ).length;
  const pendingAppointmentsCount = appointments.filter(
    (a) => a.status === "pending",
  ).length;
  const totalRevenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <div className="space-y-8">
      {/* Tiêu đề & Nút tải lại */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-nail-950">
            Quản trị cửa hàng
          </h1>
          <p className="text-sm text-muted-foreground">
            Theo dõi đơn Nail Box, lịch hẹn làm móng và danh mục sản phẩm.
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-nail-200 bg-white px-4 py-2 text-xs font-semibold text-nail-900 shadow-xs transition hover:bg-nail-100 disabled:opacity-60"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
          Làm mới dữ liệu
        </button>
      </div>

      {/* 4 Thẻ thống kê */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          {
            label: "Tổng đơn hàng",
            value: orders.length,
            sub: `${pendingOrdersCount} đơn chờ duyệt`,
            icon: ShoppingBag,
          },
          {
            label: "Tổng lịch hẹn",
            value: appointments.length,
            sub: `${pendingAppointmentsCount} lịch chờ duyệt`,
            icon: CalendarHeart,
          },
          {
            label: "Doanh thu Nail Box",
            value: formatVND(totalRevenue),
            sub: "Không tính đơn đã hủy",
            icon: TrendingUp,
          },
          {
            label: "Cần xử lý ngay",
            value: pendingOrdersCount + pendingAppointmentsCount,
            sub: "Đơn & lịch mới",
            icon: Clock,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-nail-200/80 bg-white p-5 shadow-xs space-y-2"
          >
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold">{stat.label}</span>
              <stat.icon className="h-4 w-4 text-nail-500" />
            </div>
            <p className="text-2xl font-bold text-nail-950">{stat.value}</p>
            <p className="text-[11px] text-muted-foreground">{stat.sub}</p>
          </div>
        ))}
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
              : "bg-white text-nail-900 border border-nail-200 hover:bg-nail-100",
          )}
        >
          <Package className="h-4 w-4" />
          Đơn hàng ({orders.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("appointments")}
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold transition",
            activeTab === "appointments"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-white text-nail-900 border border-nail-200 hover:bg-nail-100",
          )}
        >
          <CalendarHeart className="h-4 w-4" />
          Lịch hẹn ({appointments.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("products")}
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold transition",
            activeTab === "products"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-white text-nail-900 border border-nail-200 hover:bg-nail-100",
          )}
        >
          <Sparkles className="h-4 w-4" />
          Sản phẩm
        </button>
      </div>

      {/* Nội dung Tab */}
      {activeTab === "products" ? (
        <AdminProductsTab />
      ) : loading ? (
        <div className="rounded-3xl border border-nail-200 bg-white p-12 text-center text-sm text-muted-foreground">
          Đang tải dữ liệu từ Firestore...
        </div>
      ) : activeTab === "orders" ? (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-nail-200 bg-white p-12 text-center text-sm text-muted-foreground">
              Chưa có đơn hàng nào.
            </div>
          ) : (
            orders.map((order) => {
              const badge =
                ORDER_STATUS_LABELS[order.status] ??
                ORDER_STATUS_LABELS.pending;
              return (
                <div
                  key={order.id}
                  className="rounded-2xl border border-nail-200/80 bg-white p-5 shadow-xs space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-nail-100 pb-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-bold text-nail-950">
                        #{order.orderCode || order.id.slice(0, 6)}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-[11px] font-bold",
                          badge.color,
                        )}
                      >
                        {badge.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleString("vi-VN")}
                      </span>
                    </div>

                    <select
                      value={order.status}
                      disabled={updatingId === order.id}
                      onChange={(e) =>
                        handleOrderStatusChange(
                          order.id,
                          e.target.value as OrderStatus,
                        )
                      }
                      className="rounded-full border border-nail-200 bg-nail-50 px-3 py-1.5 text-xs font-semibold text-nail-900 focus:border-nail-400 focus:outline-none"
                    >
                      <option value="pending">Chờ xác nhận</option>
                      <option value="confirmed">Đã xác nhận</option>
                      <option value="shipping">Đang giao</option>
                      <option value="done">Hoàn thành</option>
                      <option value="cancelled">Đã hủy</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 text-xs">
                    <div className="space-y-1">
                      <p className="font-bold text-nail-900">Khách nhận hàng</p>
                      <p className="text-nail-950 font-semibold">
                        {order.shippingInfo?.fullName} —{" "}
                        {order.shippingInfo?.phone}
                      </p>
                      <p className="text-muted-foreground">
                        {order.shippingInfo?.address}
                      </p>
                      {order.shippingInfo?.note && (
                        <p className="italic text-nail-600">
                          Ghi chú: {order.shippingInfo.note}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <p className="font-bold text-nail-900">
                        Sản phẩm ({order.items?.length ?? 0})
                      </p>
                      <ul className="space-y-1 text-muted-foreground">
                        {order.items?.map((item, idx) => (
                          <li key={idx} className="flex justify-between gap-2">
                            <span>
                              {item.name} (Size {item.nailSize}) ×{" "}
                              {item.quantity}
                            </span>
                            <span className="font-semibold text-nail-900">
                              {formatVND(item.price * item.quantity)}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <div className="flex justify-between border-t border-nail-100 pt-1.5 text-sm font-bold text-nail-600">
                        <span>
                          Tổng ({order.paymentMethod === "bank" ? "CK" : "COD"})
                        </span>
                        <span>{formatVND(order.totalAmount)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-nail-200 bg-white p-12 text-center text-sm text-muted-foreground">
              Chưa có lịch hẹn nào.
            </div>
          ) : (
            appointments.map((apt) => {
              const badge =
                APPOINTMENT_STATUS_LABELS[apt.status] ??
                APPOINTMENT_STATUS_LABELS.pending;
              return (
                <div
                  key={apt.id}
                  className="rounded-2xl border border-nail-200/80 bg-white p-5 shadow-xs space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-nail-100 pb-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="rounded-lg bg-nail-100 px-2.5 py-1 text-xs font-bold text-nail-700">
                        {apt.timeSlot} — {apt.date}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-[11px] font-bold",
                          badge.color,
                        )}
                      >
                        {badge.label}
                      </span>
                    </div>

                    <select
                      value={apt.status}
                      disabled={updatingId === apt.id}
                      onChange={(e) =>
                        handleAppointmentStatusChange(
                          apt.id,
                          e.target.value as AppointmentStatus,
                        )
                      }
                      className="rounded-full border border-nail-200 bg-nail-50 px-3 py-1.5 text-xs font-semibold text-nail-900 focus:border-nail-400 focus:outline-none"
                    >
                      <option value="pending">Chờ duyệt</option>
                      <option value="confirmed">Đã giữ chỗ</option>
                      <option value="done">Đã làm xong</option>
                      <option value="cancelled">Đã hủy (mở lại giờ)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 text-xs">
                    <div className="space-y-1">
                      <p className="font-semibold text-nail-950">
                        {apt.customerName} — {apt.phone}
                      </p>
                      {apt.note && (
                        <p className="italic text-nail-600">
                          Ghi chú: {apt.note}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1 md:text-right">
                      <p className="text-muted-foreground">
                        {apt.serviceNames?.join(", ")}
                      </p>
                      <p className="text-sm font-bold text-nail-600">
                        Tạm tính: {formatVND(apt.totalEstimatedPrice || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}