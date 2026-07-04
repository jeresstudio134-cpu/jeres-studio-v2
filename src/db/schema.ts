import { relations } from 'drizzle-orm';
import { int, mysqlTable, serial, varchar, text, timestamp, boolean } from 'drizzle-orm/mysql-core';

// Users table (uses Firebase UID as primary/unique key)
export const users = mysqlTable('users', {
  id: serial('id').primaryKey(),
  uid: varchar('uid', { length: 255 }).notNull().unique(), // Firebase Auth UID
  email: varchar('email', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Shop Configuration table
export const shopConfig = mysqlTable('shop_config', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  tagline: varchar('tagline', { length: 255 }),
  address: text('address'),
  gmail: varchar('gmail', { length: 255 }),
  wa: varchar('wa', { length: 255 }),
  dana: varchar('dana', { length: 255 }),
  logoUrl: text('logo_url'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Products table
export const products = mysqlTable('products', {
  id: varchar('id', { length: 255 }).primaryKey(), // Using text IDs to match existing frontend client IDs (e.g., 'p1', 'p2')
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  price: int('price').notNull(),
  stock: int('stock').default(0),
  image: text('image'),
  category: varchar('category', { length: 255 }),
  status: varchar('status', { length: 50 }).default('Ready'), // Ready, Out of Stock, PO
  createdAt: timestamp('created_at').defaultNow(),
});

// Orders table
export const orders = mysqlTable('orders', {
  id: varchar('id', { length: 255 }).primaryKey(), // Matching 'ord-1' etc.
  invoiceNumber: varchar('invoice_number', { length: 255 }).notNull().unique(),
  customerName: varchar('customer_name', { length: 255 }).notNull(),
  customerPhone: varchar('customer_phone', { length: 50 }).notNull(),
  customerAddress: text('customer_address').notNull(),
  subtotal: int('subtotal').notNull(),
  shippingFee: int('shipping_fee').notNull(),
  total: int('total').notNull(),
  status: varchar('status', { length: 50 }).default('Pending'), // Pending, Proses, Selesai, Dibatalkan
  courier: varchar('courier', { length: 100 }),
  paymentMethod: varchar('payment_method', { length: 100 }),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Order items table (one-to-many relationship with orders)
export const orderItems = mysqlTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: varchar('order_id', { length: 255 }).references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  productId: varchar('product_id', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  quantity: int('quantity').notNull(),
  price: int('price').notNull(),
  image: text('image'),
});

// Relations Definitions
export const usersRelations = relations(users, ({ many }) => ({
  // Define relations if users own any other resources
}));

export const ordersRelations = relations(orders, ({ many }) => ({
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
}));
