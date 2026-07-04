import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import mysql from 'mysql2/promise';
import multer from 'multer';
import fs from 'fs';

import {
  initialShopConfig,
  initialBanners,
  initialProducts,
  initialAdminUsers,
  initialPromoImages,
} from './src/data/initialData.ts';

const app = express();
const PORT = 3000;

app.use(express.json());

// Create physical assets folder if it doesn't exist
const assetsDir = path.join(process.cwd(), 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Serve assets folder statically in both dev and production
app.use('/assets', express.static(assetsDir));

// Configure multer storage for physical image saving
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, assetsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// File Upload endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Tidak ada file yang diunggah' });
    }
    // Return relative URL (e.g., assets/file.jpg)
    const relativePath = `assets/${req.file.filename}`;
    res.json({ url: relativePath });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Initialize MySQL pool configuration from environment variables
const sqlHost = process.env.SQL_HOST || '127.0.0.1';
const sqlPort = parseInt(process.env.SQL_PORT || '3306', 10);
const sqlDbName = process.env.SQL_DB_NAME || 'db_jeres_studio';
const sqlUser = process.env.SQL_USER || 'root';
const sqlPassword = process.env.SQL_PASSWORD || '';

let isDbConnected = false;
let dbErrorDetails = '';
let pool: any = null;

async function initDatabase() {
  try {
    // Attempt connection
    pool = mysql.createPool({
      host: sqlHost,
      port: sqlPort,
      user: sqlUser,
      password: sqlPassword,
      database: sqlDbName,
      connectionLimit: 10,
      waitForConnections: true,
      connectTimeout: 5000,
    });

    const conn = await pool.getConnection();
    await conn.ping();
    console.log(`Connected to Laragon MySQL database: ${sqlDbName} at ${sqlHost}:${sqlPort}`);
    isDbConnected = true;

    // Create tables if not exist
    await conn.query(`
      CREATE TABLE IF NOT EXISTS shop_config (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        tagline VARCHAR(255),
        address TEXT,
        gmail VARCHAR(255),
        wa VARCHAR(255),
        dana VARCHAR(255),
        logo_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await conn.query(`
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

    await conn.query(`
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

    await conn.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id VARCHAR(255) NOT NULL,
        product_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        quantity INT NOT NULL,
        price INT NOT NULL,
        image TEXT,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id VARCHAR(255) PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS banners (
        id VARCHAR(255) PRIMARY KEY,
        image_url TEXT NOT NULL,
        title VARCHAR(255),
        description TEXT,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS promo_images (
        id VARCHAR(255) PRIMARY KEY,
        image_url TEXT NOT NULL,
        title VARCHAR(255),
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seed shop_config if empty
    const [configRows]: any = await conn.query('SELECT COUNT(*) as count FROM shop_config');
    if (configRows[0].count === 0) {
      await conn.query(
        'INSERT INTO shop_config (name, tagline, address, wa, logo_url) VALUES (?, ?, ?, ?, ?)',
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
    const [prodRows]: any = await conn.query('SELECT COUNT(*) as count FROM products');
    if (prodRows[0].count === 0) {
      for (const p of initialProducts) {
        await conn.query(
          'INSERT INTO products (id, name, description, price, stock, image, category, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
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
    const [adminRows]: any = await conn.query('SELECT COUNT(*) as count FROM admin_users');
    if (adminRows[0].count === 0) {
      for (const u of initialAdminUsers) {
        await conn.query(
          'INSERT INTO admin_users (id, username, password_hash, name, role) VALUES (?, ?, ?, ?, ?)',
          [u.id, u.username, u.passwordHash, u.name, u.role]
        );
      }
    }

    // Seed banners if empty
    const [bannerRows]: any = await conn.query('SELECT COUNT(*) as count FROM banners');
    if (bannerRows[0].count === 0) {
      for (const b of initialBanners) {
        await conn.query(
          'INSERT INTO banners (id, image_url, title, description, active) VALUES (?, ?, ?, ?, ?)',
          [b.id, b.imageUrl, b.title, b.description, b.active]
        );
      }
    }

    // Seed promo_images if empty
    const [promoRows]: any = await conn.query('SELECT COUNT(*) as count FROM promo_images');
    if (promoRows[0].count === 0) {
      for (const p of initialPromoImages) {
        await conn.query(
          'INSERT INTO promo_images (id, image_url, title, active) VALUES (?, ?, ?, ?)',
          [p.id, p.imageUrl, p.title, p.active]
        );
      }
    }

    conn.release();
  } catch (err: any) {
    isDbConnected = false;
    dbErrorDetails = err.message || String(err);
    console.error('Failed to initialize Laragon MySQL database. Falling back to local states.', err);
  }
}

initDatabase();

// --- API ENDPOINTS ---

// Database status
app.get('/api/db-status', (req, res) => {
  res.json({
    connected: isDbConnected,
    host: sqlHost,
    port: sqlPort,
    database: sqlDbName,
    user: sqlUser,
    error: dbErrorDetails,
  });
});

// Shop configuration
app.get('/api/config', async (req, res) => {
  if (!isDbConnected) return res.status(503).json({ error: 'Database offline' });
  try {
    const [rows]: any = await pool.query('SELECT * FROM shop_config LIMIT 1');
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
  if (!isDbConnected) return res.status(503).json({ error: 'Database offline' });
  try {
    const { name, description, address, whatsappNumber, logoUrl, tagline, gmail, wa, dana } = req.body;
    const [rows]: any = await pool.query('SELECT id FROM shop_config LIMIT 1');
    if (rows.length > 0) {
      await pool.query(
        'UPDATE shop_config SET name = ?, tagline = ?, address = ?, gmail = ?, wa = ?, dana = ?, logo_url = ? WHERE id = ?',
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
        'INSERT INTO shop_config (name, tagline, address, wa, logo_url, gmail, dana) VALUES (?, ?, ?, ?, ?, ?, ?)',
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
  if (!isDbConnected) return res.status(503).json({ error: 'Database offline' });
  try {
    const [rows]: any = await pool.query('SELECT * FROM products');
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
  if (!isDbConnected) return res.status(503).json({ error: 'Database offline' });
  try {
    const list = req.body; // array or single
    const productsArray = Array.isArray(list) ? list : [list];

    for (const p of productsArray) {
      await pool.query(
        'INSERT INTO products (id, name, description, price, stock, image, category, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name = ?, description = ?, price = ?, stock = ?, image = ?, category = ?, status = ?',
        [
          p.id,
          p.name,
          p.description || '',
          p.price,
          p.stock || 0,
          p.image || (p.images && p.images[0]) || '',
          p.category || '',
          p.status || 'Ready',
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
  if (!isDbConnected) return res.status(503).json({ error: 'Database offline' });
  try {
    await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Banners list
app.get('/api/banners', async (req, res) => {
  if (!isDbConnected) return res.status(503).json({ error: 'Database offline' });
  try {
    const [rows]: any = await pool.query('SELECT * FROM banners');
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
  if (!isDbConnected) return res.status(503).json({ error: 'Database offline' });
  try {
    const bannersList = req.body;
    await pool.query('DELETE FROM banners');
    for (const b of bannersList) {
      await pool.query(
        'INSERT INTO banners (id, image_url, title, description, active) VALUES (?, ?, ?, ?, ?)',
        [b.id, b.imageUrl, b.title || '', b.description || '', b.active ? 1 : 0]
      );
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Promo images list
app.get('/api/promo-images', async (req, res) => {
  if (!isDbConnected) return res.status(503).json({ error: 'Database offline' });
  try {
    const [rows]: any = await pool.query('SELECT * FROM promo_images');
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
  if (!isDbConnected) return res.status(503).json({ error: 'Database offline' });
  try {
    const list = req.body;
    await pool.query('DELETE FROM promo_images');
    for (const p of list) {
      await pool.query(
        'INSERT INTO promo_images (id, image_url, title, active) VALUES (?, ?, ?, ?)',
        [p.id, p.imageUrl, p.title || '', p.active ? 1 : 0]
      );
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Orders details
app.get('/api/orders', async (req, res) => {
  if (!isDbConnected) return res.status(503).json({ error: 'Database offline' });
  try {
    const [orderRows]: any = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    const ordersWithItems = [];

    for (const ord of orderRows) {
      const [itemRows]: any = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [ord.id]);
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
  if (!isDbConnected) return res.status(503).json({ error: 'Database offline' });
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
      'INSERT INTO orders (id, invoice_number, customer_name, customer_phone, customer_address, subtotal, shipping_fee, total, status, courier, payment_method, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
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
        'INSERT INTO order_items (order_id, product_id, name, quantity, price, image) VALUES (?, ?, ?, ?, ?, ?)',
        [id, item.productId, item.name, item.quantity, item.price, item.image || '']
      );

      await pool.query('UPDATE products SET stock = GREATEST(0, stock - ?) WHERE id = ?', [
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
  if (!isDbConnected) return res.status(503).json({ error: 'Database offline' });
  try {
    const { status, courier, paymentMethod } = req.body;
    await pool.query(
      'UPDATE orders SET status = ?, courier = ?, payment_method = ? WHERE id = ?',
      [status, courier || '', paymentMethod || '', req.params.id]
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Users management
app.get('/api/admin-users', async (req, res) => {
  if (!isDbConnected) return res.status(503).json({ error: 'Database offline' });
  try {
    const [rows]: any = await pool.query('SELECT * FROM admin_users');
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
  if (!isDbConnected) return res.status(503).json({ error: 'Database offline' });
  try {
    const list = req.body;
    await pool.query('DELETE FROM admin_users');
    for (const u of list) {
      await pool.query(
        'INSERT INTO admin_users (id, username, password_hash, name, role) VALUES (?, ?, ?, ?, ?)',
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
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
