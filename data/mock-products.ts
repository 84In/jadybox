export interface NailProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  shape: string;
  style: string;
  badge?: string;
  gradient: string;
  imageUrl?: string;
  description?: string;
}
export const MOCK_PRODUCTS: NailProduct[] = [
  {
    id: "1",
    name: "Strawberry Milk Glaze",
    slug: "strawberry-milk-glaze",
    price: 185000,
    originalPrice: 220000,
    shape: "Almond",
    style: "Ngọt ngào",
    badge: "Best Seller",
    gradient: "from-nail-100 via-nail-200 to-rose-100",
  },
  {
    id: "2",
    name: "Coquette Ribbon Pearl",
    slug: "coquette-ribbon-pearl",
    price: 210000,
    shape: "Coffin",
    style: "Đính nơ & ngọc",
    badge: "Mới về",
    gradient: "from-pink-100 via-nail-100 to-amber-50",
  },
  {
    id: "3",
    name: "Blush French Minimal",
    slug: "blush-french-minimal",
    price: 160000,
    shape: "Round",
    style: "Tối giản",
    gradient: "from-rose-50 via-nail-100 to-pink-200/70",
  },
  {
    id: "4",
    name: "Rose Quartz Cat-Eye",
    slug: "rose-quartz-cat-eye",
    price: 230000,
    originalPrice: 260000,
    shape: "Almond",
    style: "Mắt mèo sang chảnh",
    badge: "Hot",
    gradient: "from-nail-200 via-rose-200 to-nail-100",
  },
];