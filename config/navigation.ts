export const navConfig = {
  mainNav: [
    { title: "Trang chủ", href: "/" },
    { title: "Nail Box", href: "/products" },
    { title: "Đặt lịch", href: "/booking" },
  ],
  footerNav: [
    { title: "Hướng dẫn đo móng", href: "/guide" },
    { title: "Chính sách đổi trả", href: "/policy" },
    { title: "Liên hệ", href: "/contact" },
  ],
  adminNav: [
    { title: "Tổng quan", href: "/admin" },
    { title: "Sản phẩm", href: "/admin/products" },
    { title: "Đơn hàng", href: "/admin/orders" },
    { title: "Lịch hẹn", href: "/admin/bookings" },
  ],
} as const;