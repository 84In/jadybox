export type NailShape = "almond" | "coffin" | "round" | "square";
export type NailStyle = "pastel" | "luxury" | "minimal" | "party";
export type NailSize = "XS" | "S" | "M" | "L" | "Đo theo yêu cầu";

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  shape: NailShape;
  style: NailStyle;
  isBestSeller: boolean;
  inStock: boolean;
  createdAt: string;
}