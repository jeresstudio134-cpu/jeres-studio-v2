/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ShopConfig {
  name: string;
  description: string;
  whatsappNumber: string;
  logoUrl: string;
  address: string;
}

export interface Banner {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
  active: boolean;
}

export interface PromoImage {
  id: string;
  imageUrl: string;
  title?: string;
  active: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  category: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = 'Pending' | 'Diproses' | 'Dikirim' | 'Selesai' | 'Dibatalkan';

export interface Order {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: {
    productId: string;
    name: string;
    quantity: number;
    price: number;
    image: string;
  }[];
  subtotal: number;
  shippingFee: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  courier: string;
  paymentMethod: string;
  notes?: string;
}

export interface AdminUser {
  id: string;
  username: string;
  passwordHash: string; // stored plainly for simple secure mock demo, but we will call it passwordHash
  name: string;
  role: 'Super Admin' | 'Staff';
}
