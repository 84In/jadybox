import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { MOCK_PRODUCTS, type NailProduct } from "@/data/mock-products";
import { db } from "@/lib/firebase/client";
import { storeConfig } from "@/config/store";
import type { CartItem, ShippingInfo } from "@/types/order";

export interface CreateOrderInput {
  userId: string | null;
  orderCode: string;
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  shippingInfo: ShippingInfo;
  paymentMethod: "cod" | "bank";
}

export interface CreateAppointmentInput {
  userId: string | null;
  customerName: string;
  phone: string;
  serviceIds: string[];
  serviceNames: string[];
  totalEstimatedPrice: number;
  date: string;
  timeSlot: string;
  note?: string;
}

// 1. Lưu đơn hàng Nail Box mới lên Firestore
export async function createOrder(data: CreateOrderInput) {
  const colRef = collection(db, storeConfig.collections.orders);
  const docRef = await addDoc(colRef, {
    ...data,
    status: "pending",
    createdAt: new Date().toISOString(),
    createdAtServer: serverTimestamp(),
  });
  return docRef.id;
}

// 2. Lưu lịch hẹn tại tiệm lên Firestore
export async function createAppointment(data: CreateAppointmentInput) {
  const colRef = collection(db, storeConfig.collections.appointments);
  const docRef = await addDoc(colRef, {
    ...data,
    status: "pending",
    createdAt: new Date().toISOString(),
    createdAtServer: serverTimestamp(),
  });
  return docRef.id;
}

// 3. Lấy danh sách khung giờ đã có khách đặt theo ngày ("YYYY-MM-DD")
export async function getBookedSlots(dateKey: string): Promise<string[]> {
  const colRef = collection(db, storeConfig.collections.appointments);
  const q = query(colRef, where("date", "==", dateKey));
  const snapshot = await getDocs(q);

  const booked: string[] = [];
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    if (data.status !== "cancelled" && data.timeSlot) {
      booked.push(data.timeSlot);
    }
  });
  return booked;
}
import type { OrderStatus } from "@/types/order";

export type AppointmentStatus = "pending" | "confirmed" | "done" | "cancelled";

export interface AdminOrder extends CreateOrderInput {
  id: string;
  status: OrderStatus;
  createdAt: string;
}

export interface AdminAppointment extends CreateAppointmentInput {
  id: string;
  status: AppointmentStatus;
  createdAt: string;
}

// 4. Lấy toàn bộ đơn hàng (mới nhất lên đầu)
export async function getAllOrders(): Promise<AdminOrder[]> {
  const colRef = collection(db, storeConfig.collections.orders);
  const q = query(colRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<AdminOrder, "id">),
  }));
}

// 5. Cập nhật trạng thái đơn hàng
export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const docRef = doc(db, storeConfig.collections.orders, orderId);
  await updateDoc(docRef, { status });
}

// 6. Lấy toàn bộ lịch hẹn tại tiệm (mới nhất lên đầu)
export async function getAllAppointments(): Promise<AdminAppointment[]> {
  const colRef = collection(db, storeConfig.collections.appointments);
  const q = query(colRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<AdminAppointment, "id">),
  }));
}

// 7. Cập nhật trạng thái lịch hẹn
export async function updateAppointmentStatus(
  appointmentId: string,
  status: AppointmentStatus,
) {
  const docRef = doc(db, storeConfig.collections.appointments, appointmentId);
  await updateDoc(docRef, { status });
}

// 8. Lấy đơn hàng của riêng 1 khách hàng
export async function getUserOrders(userId: string): Promise<AdminOrder[]> {
  const colRef = collection(db, storeConfig.collections.orders);
  const q = query(colRef, where("userId", "==", userId));
  const snapshot = await getDocs(q);

  return snapshot.docs
    .map((d) => ({
      id: d.id,
      ...(d.data() as Omit<AdminOrder, "id">),
    }))
    .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
}

// 9. Lấy lịch hẹn của riêng 1 khách hàng
export async function getUserAppointments(
  userId: string,
): Promise<AdminAppointment[]> {
  const colRef = collection(db, storeConfig.collections.appointments);
  const q = query(colRef, where("userId", "==", userId));
  const snapshot = await getDocs(q);

  return snapshot.docs
    .map((d) => ({
      id: d.id,
      ...(d.data() as Omit<AdminAppointment, "id">),
    }))
    .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
}
const PRODUCTS_COLLECTION = "products";

export type ProductInput = Omit<NailProduct, "id">;

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// 10. Lấy danh sách sản phẩm từ Firestore
export async function getProducts(): Promise<NailProduct[]> {
  const colRef = collection(db, PRODUCTS_COLLECTION);
  const q = query(colRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((d) => ({
    id: d.id,
    ...(d.data() as ProductInput),
  }));
}

// 11. Lấy chi tiết 1 sản phẩm theo slug
export async function getProductBySlug(slug: string): Promise<NailProduct | null> {
  const colRef = collection(db, PRODUCTS_COLLECTION);
  const q = query(colRef, where("slug", "==", slug));
  const snapshot = await getDocs(q);

  if (snapshot.empty) return null;
  const firstDoc = snapshot.docs[0];
  return {
    id: firstDoc.id,
    ...(firstDoc.data() as ProductInput),
  };
}

// 12. Tạo sản phẩm mới
export async function createProduct(data: ProductInput): Promise<string> {
  const colRef = collection(db, PRODUCTS_COLLECTION);
  const docRef = await addDoc(colRef, {
    ...data,
    createdAt: new Date().toISOString(),
    createdAtServer: serverTimestamp(),
  });
  return docRef.id;
}

// 13. Cập nhật sản phẩm
export async function updateProduct(id: string, data: Partial<ProductInput>) {
  const docRef = doc(db, PRODUCTS_COLLECTION, id);
  await updateDoc(docRef, data);
}

// 14. Xóa sản phẩm
export async function deleteProduct(id: string) {
  const docRef = doc(db, PRODUCTS_COLLECTION, id);
  await deleteDoc(docRef);
}

// 15. Nhập nhanh toàn bộ MOCK_PRODUCTS lên Firestore (chạy 1 lần)
export async function seedMockProducts() {
  for (const item of MOCK_PRODUCTS) {
    const { id: _unused, ...rest } = item;
    await createProduct(rest);
  }
}