"use client";

import Link from "next/link";
import { ArrowLeft, Loader2, LogOut, ShieldAlert, Sparkles } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { siteConfig } from "@/config/site";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-nail-50">
        <div className="flex items-center gap-2 text-sm font-semibold text-nail-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          Đang kiểm tra quyền truy cập...
        </div>
      </div>
    );
  }

  if (!user || profile?.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-nail-50 px-4">
        <div className="w-full max-w-md rounded-3xl border border-nail-200 bg-white p-8 text-center shadow-[var(--shadow-soft)] space-y-5">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-nail-100 text-nail-500">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div className="space-y-1.5">
            <h1 className="font-serif text-2xl font-semibold text-nail-950">
              Khu vực dành riêng cho Admin
            </h1>
            <p className="text-sm text-muted-foreground">
              {user
                ? `Tài khoản ${user.email} hiện chưa có quyền quản trị.`
                : "Vui lòng đăng nhập bằng tài khoản quản trị để tiếp tục."}
            </p>
          </div>
          <div className="flex flex-col gap-2.5 sm:flex-row sm:justify-center">
            {!user && (
              <Link
                href="/login"
                className="rounded-full bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-nail-600"
              >
                Đăng nhập
              </Link>
            )}
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-1.5 rounded-full border border-nail-200 px-5 py-2.5 text-xs font-semibold text-nail-900 hover:bg-nail-100"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Về cửa hàng
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-nail-50/60">
      <header className="sticky top-0 z-40 border-b border-nail-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-nail-500 text-white">
                <Sparkles className="h-4 w-4" />
              </span>
              <span className="font-serif text-xl font-bold text-nail-950">
                {siteConfig.name}
              </span>
            </Link>
            <span className="rounded-full bg-nail-100 px-2.5 py-0.5 text-[11px] font-bold text-nail-700">
              Admin
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-semibold text-muted-foreground transition hover:text-nail-600"
            >
              Xem trang bán hàng
            </Link>
            <button
              type="button"
              onClick={() => logout()}
              className="inline-flex items-center gap-1.5 rounded-full border border-nail-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-nail-900 hover:bg-nail-100"
            >
              <LogOut className="h-3.5 w-3.5" />
              Thoát
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}