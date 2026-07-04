/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ShopConfig, Banner, Product, AdminUser, PromoImage } from '../types.js';

export const initialShopConfig: ShopConfig = {
  name: "Jeres Studio",
  description: "Temukan koleksi perangkat teknologi premium, aksesoris meja kerja minimalis, dan gadget pintar dengan kualitas terbaik untuk meningkatkan produktivitas harian Anda.",
  whatsappNumber: "6281234567890", // Standard Indonesian country code format
  logoUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=150&h=150&fit=crop&q=80",
  address: "Jl. Sudirman No. 42, Jakarta Selatan, DKI Jakarta, 12190"
};

export const initialBanners: Banner[] = [
  {
    id: "b1",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&h=400&fit=crop&q=80",
    title: "Teknologi Audio Premium",
    description: "Nikmati diskon hingga 25% untuk seluruh perangkat audio nirkabel akhir pekan ini.",
    active: true
  },
  {
    id: "b2",
    imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=1200&h=400&fit=crop&q=80",
    title: "Ruang Kerja Produktif",
    description: "Koleksi keyboard mekanikal dan aksesoris ergonomis untuk workstation impian Anda.",
    active: true
  },
  {
    id: "b3",
    imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&h=400&fit=crop&q=80",
    title: "Gaya Hidup Pintar",
    description: "Pantau kesehatan dan notifikasi harian Anda dengan jam tangan pintar generasi terbaru.",
    active: true
  }
];

export const initialProducts: Product[] = [
  {
    id: "p1",
    name: "AeroSound Pro Wireless ANC Headphones",
    description: "Headphone nirkabel premium dengan fitur Active Noise Cancellation (ANC) tingkat lanjut, masa pakai baterai hingga 40 jam, dan kualitas suara resolusi tinggi yang memanjakan telinga Anda.",
    price: 1850000,
    stock: 12,
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop&q=80",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&h=600&fit=crop&q=80",
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&h=600&fit=crop&q=80"
    ],
    category: "Audio"
  },
  {
    id: "p2",
    name: "KeyCraft K87 Minimalist Mechanical Keyboard",
    description: "Keyboard mekanis tenkeyless (87 tombol) dengan switch taktil kustom, pencahayaan LED putih hangat, dan konektivitas dual-mode Bluetooth/Kabel yang cocok untuk mengetik dalam waktu lama.",
    price: 1250000,
    stock: 8,
    images: [
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&h=600&fit=crop&q=80",
      "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&h=600&fit=crop&q=80",
      "https://images.unsplash.com/photo-1595225476474-87563907a212?w=600&h=600&fit=crop&q=80"
    ],
    category: "Aksesoris"
  },
  {
    id: "p3",
    name: "ApexFit Watch GT3 Smartwatch",
    description: "Jam tangan pintar dengan layar AMOLED 1.43 inci, pemantau detak jantung 24/7, sensor oksigen darah (SpO2), pelacak olahraga GPS internal, dan ketahanan air hingga kedalaman 50 meter.",
    price: 2100000,
    stock: 5,
    images: [
      "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&h=600&fit=crop&q=80",
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&h=600&fit=crop&q=80",
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop&q=80"
    ],
    category: "Gadget"
  },
  {
    id: "p4",
    name: "LeatherCraft Premium Laptop Sleeve 14\"",
    description: "Sleeve laptop eksklusif buatan tangan menggunakan kulit sapi asli berkualitas tinggi dengan lapisan dalam serat lembut mikro, memberikan perlindungan ekstra dari goresan dan debu dengan gaya yang elegan.",
    price: 650000,
    stock: 15,
    images: [
      "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&h=600&fit=crop&q=80",
      "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&h=600&fit=crop&q=80",
      "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&h=600&fit=crop&q=80"
    ],
    category: "Aksesoris"
  },
  {
    id: "p5",
    name: "LumensDesk Smart LED Desk Lamp",
    description: "Lampu meja kerja pintar dengan kontrol sentuh sensitif, kecerahan dan suhu warna (hangat ke dingin) yang dapat disesuaikan, serta dilengkapi dengan pengisi daya nirkabel Qi internal untuk ponsel Anda.",
    price: 480000,
    stock: 20,
    images: [
      "https://images.unsplash.com/photo-1534073828943-f801091bb18c?w=600&h=600&fit=crop&q=80",
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&h=600&fit=crop&q=80",
      "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600&h=600&fit=crop&q=80"
    ],
    category: "Aksesoris"
  }
];

export const initialAdminUsers: AdminUser[] = [
  {
    id: "admin1",
    username: "admin",
    passwordHash: "admin123", // Simple plain password for security context
    name: "Ahmad Subarjo",
    role: "Super Admin"
  },
  {
    id: "admin2",
    username: "staff",
    passwordHash: "staff123",
    name: "Budi Santoso",
    role: "Staff"
  }
];

export const initialPromoImages: PromoImage[] = [
  {
    id: "pm1",
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=400&fit=crop&q=80",
    title: "Cetak Banner Custom",
    active: true
  },
  {
    id: "pm2",
    imageUrl: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=600&h=400&fit=crop&q=80",
    title: "Cetak Stiker Unik",
    active: true
  },
  {
    id: "pm3",
    imageUrl: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600&h=400&fit=crop&q=80",
    title: "Cetak Kaos & Apparel",
    active: true
  }
];
