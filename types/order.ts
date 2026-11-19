import { NailSize } from "./product";

export type OrderStatus = "pending" | "confirmed" | "shipping" | "done" | "cancelled";

export interface CartItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  nailSize: NailSize;
  quantity: number;
}

export interface ShippingInfo {
  fullName: string;
  phone: string;
  address: string;
  note?: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  shippingInfo: ShippingInfo;
  status: OrderStatus;
  createdAt: string;
}