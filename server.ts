import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });


import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { Pool } from '@neondatabase/serverless';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

import {
  initialShopConfig,
  initialBanners,
  initialProducts,
  initialAdminUsers,
  initialPromoImages,
} from './src/data/initialData.js';

const app = express();
const PORT = 3000;

app.use(express.json());

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer storage in-memory for direct Cloudinary upload
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Helper function to upload buffer to Cloudinary
const uploadToCloudinary = (fileBuffer: Buffer, folder = 'jeres_studio') => {
  return new Promise<{ secure_url: string }>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error('Cloudinary upload failed'));
        resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

// File Upload endpoint using Cloudinary
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Tidak ada file yang diunggah' });
    }
    const result = await uploadToCloudinary(req.file.buffer);
    res.json({ url: result.secure_url });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Initialize Neon PostgreSQL connection from environment variables
const databaseUrl = process.env.DATABASE_URL || '';

let isDbConnected = false;
let dbErrorDetails = '';
let pool: Pool | null = null;

async function initDatabase() {
  try {
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is missing.');
    }
    // Attempt connection
    pool = new Pool({
      connectionString: databaseUrl,
    });

    const client = await pool.connect();
    console.log(`Connected to Neon PostgreSQL database!`);
    isDbConnected = true;

    // Create tables if not exist in PostgreSQL syntax
    await client.query(`
      CREATE TABLE IF NOT EXISTS shop_config (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        tagline VARCHAR(255),
        address TEXT,
        gmail VARCHAR(255),
        wa VARCHAR(255),
        dana VARCHAR(255),
        logo_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price INT NOT NULL,
        stock INT DEFAULT 0,
        image TEXT,
        category VARCHAR(255),
        status VARCHAR(50) DEFAULT 'Ready',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(255) PRIMARY KEY,
        invoice_number VARCHAR(255) NOT NULL UNIQUE,
        customer_name VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(50) NOT NULL,
        customer_address TEXT NOT NULL,
        subtotal INT NOT NULL,
        shipping_fee INT NOT NULL,
        total INT NOT NULL,
        status VARCHAR(50) DEFAULT 'Pending',
        courier VARCHAR(100),
        payment_method VARCHAR(100),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id VARCHAR(255) NOT NULL,
        product_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        quantity INT NOT NULL,
        price INT NOT NULL,
        image TEXT,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id VARCHAR(255) PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS banners (
        id VARCHAR(255) PRIMARY KEY,
        image_url TEXT NOT NULL,
        title VARCHAR(255),
        description TEXT,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS promo_images (
        id VARCHAR(255) PRIMARY KEY,
        image_url TEXT NOT NULL,
        title VARCHAR(255),
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seed shop_config if empty
    const { rows: configRows } = await client.query('SELECT COUNT(*) as count FROM shop_config');
    if (parseInt(configRows[0].count, 10) === 0) {
      await client.query(
        'INSERT INTO shop_config (name, tagline, address, wa, logo_url) VALUES ($1, $2, $3, $4, $5)',
        [
          initialShopConfig.name,
          initialShopConfig.description || 'Toko Online Terpercaya',
          initialShopConfig.address,
          initialShopConfig.whatsappNumber,
          initialShopConfig.logoUrl,
        ]
      );
    }

    // Seed products if empty
    const { rows: prodRows } = await client.query('SELECT COUNT(*) as count FROM products');
    if (parseInt(prodRows[0].count, 10) === 0) {
      for (const p of initialProducts) {
        await client.query(
          'INSERT INTO products (id, name, description, price, stock, image, category, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
          [
            p.id,
            p.name,
            p.description,
            p.price,
            p.stock,
            p.images?.[0] || '',
            p.category,
            p.stock > 0 ? 'Ready' : 'Out of Stock',
          ]
        );
      }
    }

    // Seed admin_users if empty
    const { rows: adminRows } = await client.query('SELECT COUNT(*) as count FROM admin_users');
    if (parseInt(adminRows[0].count, 10) === 0) {
      for (const u of initialAdminUsers) {
        await client.query(
          'INSERT INTO admin_users (id, username, password_hash, name, role) VALUES ($1, $2, $3, $4, $5)',
          [u.id, u.username, u.passwordHash, u.name, u.role]
        );
      }
    }

    // Seed banners if empty
    const { rows: bannerRows } = await client.query('SELECT COUNT(*) as count FROM banners');
    if (parseInt(bannerRows[0].count, 10) === 0) {
      for (const b of initialBanners) {
        await client.query(
          'INSERT INTO banners (id, image_url, title, description, active) VALUES ($1, $2, $3, $4, $5)',
          [b.id, b.imageUrl, b.title, b.description, b.active]
        );
      }
    }

    // Seed promo_images if empty
    const { rows: promoRows } = await client.query('SELECT COUNT(*) as count FROM promo_images');
    if (parseInt(promoRows[0].count, 10) === 0) {
      for (const p of initialPromoImages) {
        await client.query(
          'INSERT INTO promo_images (id, image_url, title, active) VALUES ($1, $2, $3, $4)',
          [p.id, p.imageUrl, p.title, p.active]
        );
      }
    }

    client.release();
  } catch (err: any) {
    isDbConnected = false;
    dbErrorDetails = err.message || String(err);
    console.error('Failed to initialize Neon PostgreSQL database. Falling back to local states.', err);
  }
}

initDatabase();

// --- API ENDPOINTS ---

// Database status
app.get('/api/db-status', (req, res) => {
  res.json({
    connected: isDbConnected,
    host: databaseUrl ? new URL(databaseUrl).hostname : 'localhost',
    port: databaseUrl ? parseInt(new URL(databaseUrl).port || '5432', 10) : 5432,
    database: databaseUrl ? new URL(databaseUrl).pathname.substring(1) : 'Neon PostgreSQL',
    user: databaseUrl ? new URL(databaseUrl).username : 'cloud_user',
    error: dbErrorDetails,
  });
});

// Shop configuration
app.get('/api/config', async (req, res) => {
  if (!isDbConnected || !pool) return res.status(503).json({ error: 'Database offline' });
  try {
    const { rows } = await pool.query('SELECT * FROM shop_config LIMIT 1');
    if (rows.length > 0) {
      const row = rows[0];
      res.json({
        name: row.name,
        description: row.tagline || '',
        tagline: row.tagline || '',
        address: row.address || '',
        gmail: row.gmail || '',
        whatsappNumber: row.wa || '',
        dana: row.dana || '',
        logoUrl: row.logo_url || '',
      });
    } else {
      res.json(initialShopConfig);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/config', async (req, res) => {
  if (!isDbConnected || !pool) return res.status(503).json({ error: 'Database offline' });
  try {
    const { name, description, address, whatsappNumber, logoUrl, tagline, gmail, wa, dana } = req.body;
    const { rows } = await pool.query('SELECT id FROM shop_config LIMIT 1');
    if (rows.length > 0) {
      await pool.query(
        'UPDATE shop_config SET name = $1, tagline = $2, address = $3, gmail = $4, wa = $5, dana = $6, logo_url = $7 WHERE id = $8',
        [
          name,
          tagline || description || '',
          address,
          gmail || '',
          wa || whatsappNumber || '',
          dana || '',
          logoUrl,
          rows[0].id,
        ]
      );
    } else {
      await pool.query(
        'INSERT INTO shop_config (name, tagline, address, wa, logo_url, gmail, dana) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [
          name,
          tagline || description || '',
          address,
          wa || whatsappNumber || '',
          logoUrl,
          gmail || '',
          dana || '',
        ]
      );
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Products catalog
app.get('/api/products', async (req, res) => {
  if (!isDbConnected || !pool) return res.status(503).json({ error: 'Database offline' });
  try {
    const { rows } = await pool.query('SELECT * FROM products');
    const mapped = rows.map((r: any) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      price: r.price,
      stock: r.stock,
      image: r.image,
      images: [r.image],
      category: r.category,
      status: r.status,
    }));
    res.json(mapped);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', async (req, res) => {
  if (!isDbConnected || !pool) return res.status(503).json({ error: 'Database offline' });
  try {
    const list = req.body; // array or single
    const productsArray = Array.isArray(list) ? list : [list];

    for (const p of productsArray) {
      await pool.query(
        'INSERT INTO products (id, name, description, price, stock, image, category, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, price = EXCLUDED.price, stock = EXCLUDED.stock, image = EXCLUDED.image, category = EXCLUDED.category, status = EXCLUDED.status',
        [
          p.id,
          p.name,
          p.description || '',
          p.price,
          p.stock || 0,
          p.image || (p.images && p.images[0]) || '',
          p.category || '',
          p.status || 'Ready',
        ]
      );
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  if (!isDbConnected || !pool) return res.status(503).json({ error: 'Database offline' });
  try {
    await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Banners list
app.get('/api/banners', async (req, res) => {
  if (!isDbConnected || !pool) return res.status(503).json({ error: 'Database offline' });
  try {
    const { rows } = await pool.query('SELECT * FROM banners');
    const mapped = rows.map((r: any) => ({
      id: r.id,
      imageUrl: r.image_url,
      title: r.title,
      description: r.description,
      active: !!r.active,
    }));
    res.json(mapped);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/banners', async (req, res) => {
  if (!isDbConnected || !pool) return res.status(503).json({ error: 'Database offline' });
  try {
    const bannersList = req.body;
    await pool.query('DELETE FROM banners');
    for (const b of bannersList) {
      await pool.query(
        'INSERT INTO banners (id, image_url, title, description, active) VALUES ($1, $2, $3, $4, $5)',
        [b.id, b.imageUrl, b.title || '', b.description || '', b.active ? true : false]
      );
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Promo images list
app.get('/api/promo-images', async (req, res) => {
  if (!isDbConnected || !pool) return res.status(503).json({ error: 'Database offline' });
  try {
    const { rows } = await pool.query('SELECT * FROM promo_images');
    const mapped = rows.map((r: any) => ({
      id: r.id,
      imageUrl: r.image_url,
      title: r.title,
      active: !!r.active,
    }));
    res.json(mapped);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/promo-images', async (req, res) => {
  if (!isDbConnected || !pool) return res.status(503).json({ error: 'Database offline' });
  try {
    const list = req.body;
    await pool.query('DELETE FROM promo_images');
    for (const p of list) {
      await pool.query(
        'INSERT INTO promo_images (id, image_url, title, active) VALUES ($1, $2, $3, $4)',
        [p.id, p.imageUrl, p.title || '', p.active ? true : false]
      );
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Orders details
app.get('/api/orders', async (req, res) => {
  if (!isDbConnected || !pool) return res.status(503).json({ error: 'Database offline' });
  try {
    const { rows: orderRows } = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    const ordersWithItems = [];

    for (const ord of orderRows) {
      const { rows: itemRows } = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [ord.id]);
      ordersWithItems.push({
        id: ord.id,
        invoiceNumber: ord.invoice_number,
        customerName: ord.customer_name,
        customerPhone: ord.customer_phone,
        customerAddress: ord.customer_address,
        subtotal: ord.subtotal,
        shippingFee: ord.shipping_fee,
        total: ord.total,
        status: ord.status,
        courier: ord.courier || '',
        paymentMethod: ord.payment_method || '',
        notes: ord.notes || '',
        createdAt: ord.created_at,
        items: itemRows.map((it: any) => ({
          productId: it.product_id,
          name: it.name,
          quantity: it.quantity,
          price: it.price,
          image: it.image || '',
        })),
      });
    }
    res.json(ordersWithItems);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orders', async (req, res) => {
  if (!isDbConnected || !pool) return res.status(503).json({ error: 'Database offline' });
  try {
    const {
      id,
      invoiceNumber,
      customerName,
      customerPhone,
      customerAddress,
      subtotal,
      shippingFee,
      total,
      status,
      courier,
      paymentMethod,
      notes,
      items,
    } = req.body;

    await pool.query(
      'INSERT INTO orders (id, invoice_number, customer_name, customer_phone, customer_address, subtotal, shipping_fee, total, status, courier, payment_method, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)',
      [
        id,
        invoiceNumber,
        customerName,
        customerPhone,
        customerAddress,
        subtotal,
        shippingFee,
        total,
        status || 'Pending',
        courier || '',
        paymentMethod || '',
        notes || '',
      ]
    );

    for (const item of items) {
      await pool.query(
        'INSERT INTO order_items (order_id, product_id, name, quantity, price, image) VALUES ($1, $2, $3, $4, $5, $6)',
        [id, item.productId, item.name, item.quantity, item.price, item.image || '']
      );

      await pool.query('UPDATE products SET stock = GREATEST(0, stock - $1) WHERE id = $2', [
        item.quantity,
        item.productId,
      ]);
    }

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/orders/:id', async (req, res) => {
  if (!isDbConnected || !pool) return res.status(503).json({ error: 'Database offline' });
  try {
    const { status, courier, paymentMethod } = req.body;
    await pool.query(
      'UPDATE orders SET status = $1, courier = $2, payment_method = $3 WHERE id = $4',
      [status, courier || '', paymentMethod || '', req.params.id]
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Users management
app.get('/api/admin-users', async (req, res) => {
  if (!isDbConnected || !pool) return res.status(503).json({ error: 'Database offline' });
  try {
    const { rows } = await pool.query('SELECT * FROM admin_users');
    const mapped = rows.map((r: any) => ({
      id: r.id,
      username: r.username,
      passwordHash: r.password_hash,
      name: r.name,
      role: r.role,
    }));
    res.json(mapped);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin-users', async (req, res) => {
  if (!isDbConnected || !pool) return res.status(503).json({ error: 'Database offline' });
  try {
    const list = req.body;
    await pool.query('DELETE FROM admin_users');
    for (const u of list) {
      await pool.query(
        'INSERT INTO admin_users (id, username, password_hash, name, role) VALUES ($1, $2, $3, $4, $5)',
        [u.id, u.username, u.passwordHash, u.name, u.role]
      );
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Vite Setup as Middleware / Static asset routing
async function startServer() {
  // HANYA JALANKAN INI SAAT DI LOKAL (KOMPUTER), BUKAN DI VERCEL
  if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Di Vercel (Production), kita biarkan Vercel yang menangani file statis frontend.
    // Kita hanya butuh backend Express-nya.
    console.log("Running in Vercel Production mode (API only)");
  }
}

// PENTING: Hapus startServer(); dari sini, biarkan Vercel yang memanggil app
// startServer(); 

// Ekspor app agar Vercel bisa membacanya sebagai Serverless Function
export default app;
