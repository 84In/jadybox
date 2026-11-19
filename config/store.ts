export const storeConfig = {
  currency: "VND",
  locale: "vi-VN",
  shippingFee: 25000,
  freeShippingThreshold: 300000,

  nailShapes: [
    { value: "almond", label: "Nhọn hạnh nhân (Almond)" },
    { value: "coffin", label: "Thang (Coffin)" },
    { value: "round", label: "Tròn ngắn (Round)" },
    { value: "square", label: "Vuông (Square)" },
  ],

  nailStyles: [
    { value: "pastel", label: "Ngọt ngào / Pastel" },
    { value: "luxury", label: "Sang chảnh / Đính đá" },
    { value: "minimal", label: "Tối giản / Trơn" },
    { value: "party", label: "Dạ hội / Nổi bật" },
  ],

  nailSizes: ["XS", "S", "M", "L", "Đo theo yêu cầu"] as const,

  bookingTimeSlots: [
    "09:00",
    "10:30",
    "13:30",
    "15:00",
    "16:30",
    "18:00",
    "19:30",
  ] as const,

  salonServices: [
    { id: "cut-skin", name: "Nhặt da & sơn gel trơn", price: 120000, durationMin: 45 },
    { id: "remove-gel", name: "Tháo móng / phá gel", price: 40000, durationMin: 20 },
    { id: "nail-extension", name: "Úp móng / nối gel", price: 150000, durationMin: 60 },
    { id: "design-basic", name: "Design theo mẫu (cơ bản)", price: 100000, durationMin: 45 },
  ],

  collections: {
    users: "users",
    products: "products",
    orders: "orders",
    appointments: "appointments",
  },
} as const;