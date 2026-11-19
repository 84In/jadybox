"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Check,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Sparkles,
  User,
} from "lucide-react";
import { storeConfig } from "@/config/store";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/AuthProvider";
import { createAppointment, getBookedSlots } from "@/lib/firebase/firestore";

const formatVND = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    amount,
  );

// Tạo danh sách 7 ngày tới tính từ hôm nay
function getUpcomingDays(count = 7) {
  const days = [];
  const weekdayLabels = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

  for (let i = 0; i < count; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");

    days.push({
      key: `${yyyy}-${mm}-${dd}`,
      weekday: i === 0 ? "Hôm nay" : weekdayLabels[d.getDay()],
      dateLabel: `${dd}/${mm}`,
    });
  }
  return days;
}

export default function BookingPage() {
  const upcomingDays = useMemo(() => getUpcomingDays(7), []);

  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([
    storeConfig.salonServices[0].id,
  ]);
  const [selectedDate, setSelectedDate] = useState<string>(upcomingDays[0].key);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { user, profile } = useAuth();

  useEffect(() => {
    let active = true;
    setLoadingSlots(true);
    getBookedSlots(selectedDate)
      .then((slots) => {
        if (active) setBookedSlots(slots);
      })
      .catch((err) => console.error("Lỗi tải lịch trống:", err))
      .finally(() => {
        if (active) setLoadingSlots(false);
      });
    return () => {
      active = false;
    };
  }, [selectedDate]);

  const toggleService = (id: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const selectedServices = storeConfig.salonServices.filter((s) =>
    selectedServiceIds.includes(s.id),
  );
  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const totalDuration = selectedServices.reduce(
    (sum, s) => sum + s.durationMin,
    0,
  );

  const canSubmit =
    selectedServices.length > 0 &&
    selectedDate &&
    selectedSlot &&
    customerName.trim().length > 0 &&
    phone.trim().length >= 9;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;

    try {
      setSubmitting(true);
      await createAppointment({
        userId: user?.uid ?? null,
        customerName: customerName.trim(),
        phone: phone.trim(),
        serviceIds: selectedServices.map((s) => s.id),
        serviceNames: selectedServices.map((s) => s.name),
        totalEstimatedPrice: totalPrice,
        date: selectedDate,
        timeSlot: selectedSlot,
        note: note.trim(),
      });

      // Khóa ngay khung giờ vừa đặt trong giao diện
      setBookedSlots((prev) => [...prev, selectedSlot]);
      setSubmitted(true);
    } catch (error) {
      console.error("Lỗi đặt lịch:", error);
      alert("Không thể lưu lịch hẹn, bạn kiểm tra lại cấu hình Firestore nhé.");
    } finally {
      setSubmitting(false);
    }
  };
  useEffect(() => {
    if (profile?.name && !customerName) setCustomerName(profile.name);
    if (profile?.phone && !phone) setPhone(profile.phone);
  }, [profile]);
  // Màn hình xác nhận đặt lịch thành công
  if (submitted) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
        <div className="rounded-3xl border border-nail-200 bg-white p-8 text-center shadow-[var(--shadow-soft)] space-y-5">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-nail-100 text-nail-500">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <div className="space-y-1.5">
            <h1 className="font-serif text-2xl font-semibold text-nail-950">
              Đặt lịch thành công!
            </h1>
            <p className="text-sm text-muted-foreground">
              Cảm ơn <strong className="text-nail-900">{customerName}</strong>,
              tiệm {siteConfig.shortName} đã giữ chỗ cho bạn.
            </p>
          </div>

          <div className="rounded-2xl bg-nail-50 p-4 text-left text-xs space-y-2 border border-nail-100">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Thời gian:</span>
              <span className="font-bold text-nail-950">
                {selectedSlot} — {selectedDate}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Dịch vụ:</span>
              <span className="font-semibold text-nail-900 text-right">
                {selectedServices.map((s) => s.name).join(", ")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tạm tính:</span>
              <span className="font-bold text-nail-500">
                {formatVND(totalPrice)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Địa chỉ:</span>
              <span className="font-medium text-nail-900 text-right">
                {siteConfig.contact.address}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 pt-2 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => {
                setSubmitted(false);
                setSelectedSlot("");
              }}
              className="rounded-full border border-nail-200 px-5 py-2.5 text-xs font-semibold text-nail-900 hover:bg-nail-100"
            >
              Đặt thêm lịch khác
            </button>
            <Link
              href="/products"
              className="rounded-full bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-nail-600"
            >
              Xem thêm Nail Box
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6">
      {/* Tiêu đề */}
      <div className="space-y-2 text-center md:text-left">
        <p className="text-xs font-bold uppercase tracking-widest text-nail-500">
          Trải nghiệm tại tiệm
        </p>
        <h1 className="font-serif text-3xl font-semibold text-nail-950 sm:text-4xl">
          Đặt lịch làm móng
        </h1>
        <p className="text-sm text-muted-foreground">
          Chọn trước dịch vụ và khung giờ đẹp để được phục vụ ngay không cần chờ
          đợi.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-8 lg:grid-cols-3"
      >
        {/* Cột trái (2/3): Các bước chọn */}
        <div className="space-y-8 lg:col-span-2">
          {/* Bước 1: Chọn dịch vụ */}
          <section className="rounded-3xl border border-nail-200/80 bg-white/85 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-nail-500 text-xs font-bold text-white">
                1
              </span>
              <h2 className="font-serif text-xl font-semibold text-nail-950">
                Chọn dịch vụ
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {storeConfig.salonServices.map((service) => {
                const active = selectedServiceIds.includes(service.id);
                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => toggleService(service.id)}
                    className={cn(
                      "flex items-start justify-between gap-3 rounded-2xl border p-4 text-left transition",
                      active
                        ? "border-nail-400 bg-nail-50 shadow-xs"
                        : "border-nail-200/70 bg-white hover:border-nail-300 hover:bg-nail-50/40",
                    )}
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-nail-950">
                        {service.name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-semibold text-nail-500">
                          {formatVND(service.price)}
                        </span>
                        <span>•</span>
                        <span>~{service.durationMin} phút</span>
                      </div>
                    </div>

                    <span
                      className={cn(
                        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition",
                        active
                          ? "border-nail-500 bg-nail-500 text-white"
                          : "border-nail-300 bg-white",
                      )}
                    >
                      {active && <Check className="h-3 w-3" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Bước 2: Chọn ngày & khung giờ */}
          <section className="rounded-3xl border border-nail-200/80 bg-white/85 p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-nail-500 text-xs font-bold text-white">
                2
              </span>
              <h2 className="font-serif text-xl font-semibold text-nail-950">
                Chọn ngày & giờ hẹn
              </h2>
            </div>

            {/* Chọn ngày (7 ngày tới) */}
            <div className="space-y-2.5">
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-nail-900">
                <CalendarDays className="h-4 w-4 text-nail-500" />
                Chọn ngày
              </label>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                {upcomingDays.map((day) => {
                  const active = selectedDate === day.key;
                  return (
                    <button
                      key={day.key}
                      type="button"
                      onClick={() => {
                        setSelectedDate(day.key);
                        setSelectedSlot("");
                      }}
                      className={cn(
                        "flex flex-col items-center rounded-2xl border py-2.5 px-2 transition",
                        active
                          ? "border-nail-500 bg-primary text-primary-foreground shadow-xs"
                          : "border-nail-200 bg-white text-nail-900 hover:bg-nail-50",
                      )}
                    >
                      <span className="text-[11px] font-medium opacity-85">
                        {day.weekday}
                      </span>
                      <span className="text-sm font-bold">{day.dateLabel}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Chọn khung giờ */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-nail-900">
                  <Clock className="h-4 w-4 text-nail-500" />
                  Chọn khung giờ
                </label>
                <span className="text-[11px] text-muted-foreground">
                  Ô mờ là giờ đã kín lịch
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
                {storeConfig.bookingTimeSlots.map((slot) => {
                  const isBooked = bookedSlots.includes(slot);
                  const active = selectedSlot === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={isBooked || loadingSlots}
                      onClick={() => setSelectedSlot(slot)}
                      className={cn(
                        "rounded-xl border py-2.5 text-sm font-semibold transition",
                        isBooked
                          ? "cursor-not-allowed border-nail-100 bg-nail-50/70 text-muted-foreground/40 line-through"
                          : active
                            ? "border-nail-500 bg-primary text-primary-foreground shadow-xs"
                            : "border-nail-200 bg-white text-nail-900 hover:border-nail-400 hover:bg-nail-50",
                      )}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Bước 3: Thông tin liên hệ */}
          <section className="rounded-3xl border border-nail-200/80 bg-white/85 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-nail-500 text-xs font-bold text-white">
                3
              </span>
              <h2 className="font-serif text-xl font-semibold text-nail-950">
                Thông tin của bạn
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-nail-900">
                  Họ và tên *
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-nail-400" />
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
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
                Ghi chú thêm (không bắt buộc)
              </label>
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="VD: Mình muốn tháo gel cũ trước, hoặc làm mẫu hồng mắt mèo..."
                className="w-full rounded-xl border border-nail-200 bg-nail-50/40 p-3 text-sm text-nail-950 focus:border-nail-400 focus:outline-none"
              />
            </div>
          </section>
        </div>

        {/* Cột phải (1/3): Tóm tắt lịch hẹn */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24 rounded-3xl border border-nail-200 bg-white p-6 shadow-[var(--shadow-soft)] space-y-5">
            <div className="flex items-center gap-2 border-b border-nail-100 pb-4">
              <Sparkles className="h-5 w-5 text-nail-500" />
              <h3 className="font-serif text-lg font-semibold text-nail-950">
                Tóm tắt lịch hẹn
              </h3>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Ngày hẹn</span>
                <span className="font-semibold text-nail-950">
                  {selectedDate}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Khung giờ</span>
                <span className="font-semibold text-nail-500">
                  {selectedSlot || "Chưa chọn"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  Thời lượng dự kiến
                </span>
                <span className="font-semibold text-nail-950">
                  ~{totalDuration} phút
                </span>
              </div>
            </div>

            {/* Danh sách dịch vụ đã tick */}
            <div className="border-t border-nail-100 pt-4 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-nail-900">
                Dịch vụ đã chọn ({selectedServices.length})
              </p>
              {selectedServices.length > 0 ? (
                <ul className="space-y-1.5 text-xs">
                  {selectedServices.map((s) => (
                    <li key={s.id} className="flex justify-between gap-2">
                      <span className="text-muted-foreground">{s.name}</span>
                      <span className="font-semibold text-nail-900">
                        {formatVND(s.price)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  Vui lòng chọn ít nhất 1 dịch vụ.
                </p>
              )}
            </div>

            {/* Tổng tạm tính */}
            <div className="flex items-baseline justify-between border-t border-nail-100 pt-4">
              <span className="text-sm font-semibold text-nail-900">
                Tạm tính
              </span>
              <span className="text-xl font-bold text-nail-500">
                {formatVND(totalPrice)}
              </span>
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className={cn(
                "w-full rounded-full py-3.5 text-sm font-semibold transition",
                canSubmit
                  ? "bg-primary text-primary-foreground shadow-sm hover:bg-nail-600"
                  : "cursor-not-allowed bg-nail-100 text-nail-400",
              )}
            >
              Xác nhận đặt lịch
            </button>

            <div className="flex items-start gap-2 rounded-xl bg-nail-50 p-3 text-[11px] text-muted-foreground">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-nail-400" />
              <span>{siteConfig.contact.address}</span>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}
