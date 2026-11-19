import Link from "next/link";
import { ArrowRight, CalendarHeart, Gem, HeartHandshake, Sparkles } from "lucide-react";
import { MOCK_PRODUCTS } from "@/data/mock-products";
import { ProductCard } from "@/components/features/products/ProductCard";
import { siteConfig } from "@/config/site";

export default function HomePage() {
  return (
    <div className="space-y-20 pb-8">
      {/* 1. HERO BANNER */}
      <section className="relative overflow-hidden bg-gradient-to-b from-nail-100/70 via-nail-50 to-background pt-12 pb-16 md:pt-20 md:pb-24">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 sm:px-6 md:grid-cols-2">
          <div className="space-y-6 text-center md:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-nail-200 bg-white/80 px-4 py-1.5 text-xs font-bold text-nail-600 shadow-xs">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{siteConfig.tagline}</span>
            </div>

            <h1 className="font-serif text-4xl font-semibold leading-tight text-nail-950 sm:text-5xl lg:text-6xl">
              Tỏa sáng cùng bộ móng{" "}
              <span className="text-nail-500 italic">của riêng bạn</span>
            </h1>

            <p className="mx-auto max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base md:mx-0">
              Nail Box thiết kế thủ công chuẩn size từng ngón tay — thay đổi phong
              cách chỉ trong 5 phút tại nhà, hoặc ghé tiệm Jady để được chăm sóc
              móng chuẩn salon.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2 md:justify-start">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-nail-600"
              >
                Khám phá Nail Box
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/booking"
                className="inline-flex items-center gap-2 rounded-full border border-nail-300 bg-white/80 px-6 py-3 text-sm font-semibold text-nail-900 transition hover:bg-nail-100"
              >
                <CalendarHeart className="h-4 w-4 text-nail-500" />
                Đặt lịch tại tiệm
              </Link>
            </div>
          </div>

          {/* Khung Visual Hero (sau này thay bằng ảnh chụp mẫu tay thật) */}
          <div className="relative mx-auto w-full max-w-md">
            <div className="aspect-[4/5] rounded-[2rem] border border-nail-200 bg-gradient-to-tr from-nail-200/80 via-nail-100 to-white p-6 shadow-[var(--shadow-soft)] flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-nail-700">
                  BST Xuân - Hè
                </span>
                <span className="text-xs font-semibold text-nail-600">
                  100% Sơn Gel Cao Cấp
                </span>
              </div>

              <div className="my-auto text-center space-y-2 text-nail-500/80">
                <Sparkles className="mx-auto h-12 w-12" />
                <p className="font-serif text-lg font-medium text-nail-900">
                  Ảnh Hero Nail Box Jady
                </p>
                <p className="text-xs text-muted-foreground">
                  (Tỷ lệ gợi ý 4:5 — Nền hồng / be tối giản)
                </p>
              </div>

              <div className="rounded-2xl bg-white/90 p-3.5 backdrop-blur-sm border border-nail-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-nail-950">Tặng kèm bộ dụng cụ</p>
                  <p className="text-[11px] text-muted-foreground">
                    Keo dán, dũa mini, que đẩy da & bông cồn
                  </p>
                </div>
                <span className="rounded-full bg-nail-500 px-2.5 py-1 text-[11px] font-bold text-white">
                  Free
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ĐIỂM NỔI BẬT */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              icon: Gem,
              title: "Sơn gel thủ công 100%",
              desc: "Vẽ tay tỉ mỉ từng bộ bằng sơn gel cao cấp, giữ độ bóng bền như làm ngoài tiệm.",
            },
            {
              icon: HeartHandshake,
              title: "Chuẩn form mọi dáng tay",
              desc: "Đủ size XS - L hoặc đo theo số đo riêng từng ngón, ôm sát tự nhiên không cộm.",
            },
            {
              icon: Sparkles,
              title: "Tái sử dụng nhiều lần",
              desc: "Tháo lắp dễ dàng, bảo quản tốt có thể dùng lại 3–5 lần cho mọi dịp đi tiệc.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="flex items-start gap-4 rounded-2xl border border-nail-200/70 bg-white/80 p-5"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-nail-100 text-nail-500">
                <item.icon className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-nail-950">{item.title}</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. MẪU NAIL BOX BÁN CHẠY */}
      <section className="mx-auto max-w-6xl space-y-8 px-4 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div className="space-y-1.5">
            <p className="text-xs font-bold uppercase tracking-widest text-nail-500">
              Được yêu thích nhất
            </p>
            <h2 className="font-serif text-3xl font-semibold text-nail-950">
              Bộ sưu tập Best Seller
            </h2>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-nail-600 transition hover:text-nail-500"
          >
            Xem tất cả mẫu
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {MOCK_PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 4. BANNER ĐẶT LỊCH TẠI CỬA HÀNG */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-nail-200 bg-gradient-to-r from-nail-100 via-nail-50 to-rose-100/80 p-8 sm:p-12">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="max-w-xl space-y-3">
              <span className="inline-block rounded-full bg-white px-3 py-1 text-xs font-bold text-nail-600">
                Trải nghiệm trực tiếp tại {siteConfig.shortName}
              </span>
              <h2 className="font-serif text-2xl font-semibold text-nail-950 sm:text-3xl">
                Muốn thư giãn & làm móng trực tiếp tại tiệm?
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Chọn dịch vụ yêu thích và giữ trước khung giờ đẹp mà không cần
                chờ đợi. Mở cửa hàng ngày: {siteConfig.contact.openHours}.
              </p>
            </div>

            <Link
              href="/booking"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-nail-600"
            >
              <CalendarHeart className="h-4 w-4" />
              Đặt lịch hẹn ngay
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}