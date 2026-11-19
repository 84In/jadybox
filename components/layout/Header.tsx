"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu, ShoppingBag, Sparkles, User, X } from "lucide-react";
import { siteConfig } from "@/config/site";
import { navConfig } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { useCart } from "@/components/providers/CartProvider";
import { useAuth } from "@/components/providers/AuthProvider";

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { totalItems, hydrated } = useCart();
  const { user, profile, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-nail-200/80 bg-nail-50/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-nail-500 text-white shadow-sm transition group-hover:scale-105">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="font-serif text-2xl font-bold tracking-wide text-nail-950">
            {siteConfig.name}
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navConfig.mainNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-semibold transition-colors hover:text-nail-500",
                  isActive ? "text-nail-500" : "text-nail-900",
                )}
              >
                {item.title}
              </Link>
            );
          })}
        </nav>

        {/* Actions (Giỏ hàng + Tài khoản + Menu Mobile) */}
        <div className="flex items-center gap-2">
          <Link
            href="/checkout"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-nail-900 transition hover:bg-nail-100"
            aria-label="Giỏ hàng"
          >
            <ShoppingBag className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-nail-500 text-[10px] font-bold text-white">
              {hydrated ? totalItems : 0}
            </span>
          </Link>

          {user ? (
            <Link
              className="flex items-center gap-2 hover:opacity-80"
              href="/profile"
            >
              <div className="hidden sm:flex items-center gap-2 rounded-full border border-nail-200 bg-white pl-1.5 pr-2.5 py-1">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={profile?.name ?? "Avatar"}
                    className="h-7 w-7 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-nail-100 text-xs font-bold text-nail-700">
                    {(profile?.name ?? "J")[0]}
                  </span>
                )}

                <span className="max-w-[100px] truncate text-xs font-semibold text-nail-950">
                  {profile?.name ?? user.displayName}
                </span>
                <button
                  type="button"
                  onClick={() => logout()}
                  title="Đăng xuất"
                  className="ml-1 flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition hover:bg-nail-100 hover:text-nail-600"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            </Link>
          ) : (
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition hover:bg-nail-600"
            >
              <User className="h-3.5 w-3.5" />
              Đăng nhập
            </Link>
          )}

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-nail-900 hover:bg-nail-100 md:hidden"
            aria-label="Mở menu"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <div className="border-t border-nail-200 bg-nail-50 px-4 py-4 md:hidden">
          <nav className="flex flex-col space-y-3">
            {navConfig.mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "rounded-xl px-3 py-2 text-sm font-semibold transition",
                  pathname === item.href
                    ? "bg-nail-100 text-nail-600"
                    : "text-nail-900 hover:bg-nail-100/70",
                )}
              >
                {item.title}
              </Link>
            ))}

            {user ? (
              <Link href="/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5 min-w-0">
              <div className="mt-2 flex items-center justify-between rounded-2xl border border-nail-200 bg-white p-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={profile?.name ?? "Avatar"}
                      className="h-8 w-8 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-nail-100 text-xs font-bold text-nail-700">
                      {(profile?.name ?? "J")[0]}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-nail-950">
                      {profile?.name ?? user.displayName}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {profile?.phone || profile?.email || user.email}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMobileOpen(false);
                  }}
                  className="ml-2 inline-flex shrink-0 items-center gap-1 rounded-full bg-nail-100 px-3 py-1.5 text-xs font-semibold text-nail-700 hover:bg-nail-200"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Thoát
                </button>
              </div>
              </Link>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                <User className="h-4 w-4" />
                Đăng nhập
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
