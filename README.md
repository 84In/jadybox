# Jady Box — Salon thu nhỏ trong tầm tay

Ứng dụng web bán **Nail Box** thủ công và **đặt lịch làm móng tại cửa hàng** cho thương hiệu **Jady Box**, phát triển theo kiến trúc Next.js App Router kết hợp Firebase.

## Tech Stack
- **Framework:** Next.js (App Router), TypeScript
- **Styling & UI:** Tailwind CSS v4, shadcn/ui, Lucide Icons
- **Backend & Auth:** Firebase Authentication (Google SSO, Email/Password, SĐT/Mật khẩu) & Cloud Firestore

## Tính năng chính
- **Khám phá & lọc Nail Box (`/`, `/products`, `/products/[slug]`):** Tìm kiếm theo tên/phong cách, lọc theo form móng (*Almond*, *Coffin*, *Round*, *Square*), sắp xếp giá và thêm giỏ hàng theo size.
- **Giỏ hàng & Thanh toán (`/checkout`):** Quản lý giỏ hàng, tính phí ship / miễn ship theo ngưỡng, tự động điền thông tin cá nhân và lưu đơn hàng vào Firestore.
- **Đặt lịch tại tiệm (`/booking`):** Chọn dịch vụ, ngày và khung giờ làm móng; tự động khóa các khung giờ đã được đặt.
- **Tài khoản & Lịch sử (`/profile`):** Xem trạng thái đơn hàng, lịch hẹn cá nhân và cập nhật họ tên, số điện thoại, địa chỉ.
- **Quản trị cửa hàng (`/admin`):** Phân quyền theo `role: "admin"`, thống kê tổng quan, quản lý sản phẩm, cập nhật trạng thái đơn hàng và lịch hẹn.

## Cấu trúc thư mục nổi bật
- `config/` — Cấu hình thông tin thương hiệu, điều hướng, khung giờ, dịch vụ và biến môi trường.
- `lib/firebase/` — Khởi tạo Firebase Client SDK và các hàm thao tác Firestore.
- `components/` — Giao diện chung (`Header`, `Footer`), provider xác thực và component theo nghiệp vụ.
- `app/` — Các tuyến trang cửa hàng, đăng nhập/đăng ký, hồ sơ cá nhân và trang quản trị.

## Chạy dự án ở môi trường local
1. Cài đặt thư viện:
   ```bash
   pnpm install
