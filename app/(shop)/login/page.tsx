"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import { normalizeVNPhone, useAuth } from "@/components/providers/AuthProvider";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

type AuthMode = "login" | "register";
type RegisterMethod = "phone" | "email";

function getAuthErrorMessage(err: unknown, registerMethod: RegisterMethod): string {
  const code = (err as { code?: string })?.code ?? "";

  switch (code) {
    case "custom/invalid-phone":
      return "Số điện thoại chưa đúng định dạng (gồm 10 số, bắt đầu bằng 0).";
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "Số điện thoại/Email hoặc mật khẩu chưa đúng.";
    case "auth/email-already-in-use":
      return registerMethod === "phone"
        ? "Số điện thoại này đã được đăng ký rồi. Hãy chuyển sang tab Đăng nhập."
        : "Email này đã được đăng ký rồi. Hãy chuyển sang tab Đăng nhập.";
    case "auth/weak-password":
      return "Mật khẩu cần ít nhất 6 ký tự.";
    case "auth/invalid-email":
      return "Định dạng email hoặc số điện thoại không hợp lệ.";
    case "auth/operation-not-allowed":
      return "Chưa bật phương thức Email/Password trên Firebase Console.";
    case "auth/too-many-requests":
      return "Bạn thử quá nhiều lần. Vui lòng đợi ít phút rồi thử lại.";
    default:
      return "Có lỗi xảy ra, vui lòng thử lại sau.";
  }
}

export default function LoginPage() {
  const {
    user,
    loading,
    loginWithGoogle,
    loginWithIdentifier,
    registerWithEmail,
    registerWithPhone,
  } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState<AuthMode>("login");
  const [registerMethod, setRegisterMethod] = useState<RegisterMethod>("phone");

  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState(""); // Dùng cho SĐT hoặc Email
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [user, loading, router]);

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (mode === "register") {
      if (name.trim().length < 2) {
        setError("Vui lòng nhập họ và tên của bạn.");
        return;
      }
      if (registerMethod === "phone" && !normalizeVNPhone(identifier)) {
        setError("Số điện thoại chưa hợp lệ (ví dụ: 0909123456).");
        return;
      }
      if (password.length < 6) {
        setError("Mật khẩu phải có ít nhất 6 ký tự.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Mật khẩu xác nhận không khớp.");
        return;
      }
    }

    try {
      setSubmitting(true);
      if (mode === "login") {
        await loginWithIdentifier(identifier, password);
      } else if (registerMethod === "phone") {
        await registerWithPhone(name, identifier, password);
      } else {
        await registerWithEmail(name, identifier, password);
      }
      router.push("/");
    } catch (err) {
      setError(getAuthErrorMessage(err, registerMethod));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError("");
      setSubmitting(true);
      await loginWithGoogle();
      router.push("/");
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? "";
      if (code !== "auth/popup-closed-by-user") {
        setError("Không thể đăng nhập bằng Google. Vui lòng thử lại.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[75vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="rounded-3xl border border-nail-200 bg-white/95 p-7 sm:p-8 shadow-[var(--shadow-soft)] space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-nail-500 text-white shadow-sm">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="font-serif text-3xl font-semibold text-nail-950">
            {mode === "login"
              ? `Chào mừng đến ${siteConfig.shortName}`
              : "Tạo tài khoản mới"}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {mode === "login"
              ? "Đăng nhập bằng SĐT, Email hoặc tài khoản Google."
              : "Đăng ký nhanh bằng Số điện thoại hoặc Email."}
          </p>
        </div>

        {/* Thanh chuyển Tab Đăng nhập / Đăng ký */}
        <div className="grid grid-cols-2 rounded-full bg-nail-100/80 p-1">
          <button
            type="button"
            onClick={() => switchMode("login")}
            className={cn(
              "rounded-full py-2 text-xs font-bold transition",
              mode === "login"
                ? "bg-white text-nail-950 shadow-xs"
                : "text-muted-foreground hover:text-nail-900"
            )}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => switchMode("register")}
            className={cn(
              "rounded-full py-2 text-xs font-bold transition",
              mode === "register"
                ? "bg-white text-nail-950 shadow-xs"
                : "text-muted-foreground hover:text-nail-900"
            )}
          >
            Đăng ký
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-center text-xs font-medium text-destructive">
            {error}
          </div>
        )}

        {/* Form chính */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === "register" && (
            <>
              {/* Chọn đăng ký bằng SĐT hay Email */}
              <div className="flex items-center justify-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setRegisterMethod("phone");
                    setIdentifier("");
                    setError("");
                  }}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 font-semibold transition",
                    registerMethod === "phone"
                      ? "border-nail-500 bg-nail-50 text-nail-700"
                      : "border-nail-200 bg-white text-muted-foreground hover:bg-nail-50"
                  )}
                >
                  <Phone className="h-3.5 w-3.5" />
                  Dùng Số điện thoại
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRegisterMethod("email");
                    setIdentifier("");
                    setError("");
                  }}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 font-semibold transition",
                    registerMethod === "email"
                      ? "border-nail-500 bg-nail-50 text-nail-700"
                      : "border-nail-200 bg-white text-muted-foreground hover:bg-nail-50"
                  )}
                >
                  <Mail className="h-3.5 w-3.5" />
                  Dùng Email
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-nail-900">
                  Họ và tên
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-nail-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nguyễn Ngọc Anh"
                    className="w-full rounded-xl border border-nail-200 bg-nail-50/40 py-2.5 pl-10 pr-3 text-sm text-nail-950 focus:border-nail-400 focus:outline-none"
                  />
                </div>
              </div>
            </>
          )}

          {/* Ô nhập SĐT / Email */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-nail-900">
              {mode === "login"
                ? "Số điện thoại hoặc Email"
                : registerMethod === "phone"
                ? "Số điện thoại"
                : "Email"}
            </label>
            <div className="relative">
              {mode === "register" && registerMethod === "phone" ? (
                <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-nail-400" />
              ) : (
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-nail-400" />
              )}
              <input
                type={
                  mode === "register" && registerMethod === "phone"
                    ? "tel"
                    : mode === "register"
                    ? "email"
                    : "text"
                }
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={
                  mode === "login"
                    ? "0909 123 456 hoặc ban@email.com"
                    : registerMethod === "phone"
                    ? "0909 123 456"
                    : "ban@email.com"
                }
                className="w-full rounded-xl border border-nail-200 bg-nail-50/40 py-2.5 pl-10 pr-3 text-sm text-nail-950 focus:border-nail-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Mật khẩu */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-nail-900">
              Mật khẩu
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-nail-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ít nhất 6 ký tự"
                className="w-full rounded-xl border border-nail-200 bg-nail-50/40 py-2.5 pl-10 pr-10 text-sm text-nail-950 focus:border-nail-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-nail-400 hover:text-nail-600"
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {mode === "register" && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-nail-900">
                Nhập lại mật khẩu
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-nail-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu"
                  className="w-full rounded-xl border border-nail-200 bg-nail-50/40 py-2.5 pl-10 pr-3 text-sm text-nail-950 focus:border-nail-400 focus:outline-none"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || loading}
            className="mt-1 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-nail-600 disabled:opacity-60"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}
          </button>
        </form>

        {/* Đường kẻ ngăn cách */}
        <div className="relative flex items-center py-1">
          <div className="flex-grow border-t border-nail-200" />
          <span className="mx-3 shrink-0 text-[11px] font-semibold uppercase text-muted-foreground">
            Hoặc
          </span>
          <div className="flex-grow border-t border-nail-200" />
        </div>

        {/* Nút Google SSO */}
        <button
          type="button"
          disabled={submitting || loading}
          onClick={handleGoogleLogin}
          className="flex w-full items-center justify-center gap-3 rounded-full border border-nail-200 bg-white px-5 py-3 text-sm font-semibold text-nail-950 shadow-xs transition hover:border-nail-300 hover:bg-nail-50 disabled:opacity-60"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
            />
            <path
              fill="#34A853"
              d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.565 24 12.255 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 0 0 0 10.76l3.98-3.09z"
            />
            <path
              fill="#EA4335"
              d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0c-4.69 0-8.74 2.7-10.71 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
            />
          </svg>
          <span>Tiếp tục với Google</span>
        </button>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-nail-400" />
          <span>Thông tin tài khoản được bảo mật bởi Firebase Auth</span>
        </div>

        <div className="border-t border-nail-100 pt-4 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-nail-500"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Quay lại cửa hàng
          </Link>
        </div>
      </div>
    </div>
  );
}