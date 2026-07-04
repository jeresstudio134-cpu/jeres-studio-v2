/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  initialShopConfig,
  initialBanners,
  initialProducts,
  initialAdminUsers,
  initialPromoImages,
} from './data/initialData.ts';
import { ShopConfig, Banner, Product, CartItem, Order, AdminUser, PromoImage } from './types.ts';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import BannerSlider from './components/Banner';
import ProductsList from './components/Products';
import Cart from './components/Cart';
import Invoice from './components/Invoice';
import AdminDashboard from './components/AdminDashboard';
import { ShoppingBag, ArrowUp, Instagram, Facebook, Mail, Phone, MapPin, ZoomIn, X } from 'lucide-react';

export default function App() {
  // Tabs active state
  const [activeTab, setActiveTab] = React.useState<'home' | 'admin'>(() => {
    const isLoggedIn = localStorage.getItem('jeres_studio_is_logged_in') === 'true';
    const savedTab = localStorage.getItem('jeres_studio_active_tab') as 'home' | 'admin' | null;
    if (isLoggedIn) {
      return savedTab || 'admin';
    }
    return 'home';
  });

  React.useEffect(() => {
    localStorage.setItem('jeres_studio_active_tab', activeTab);
  }, [activeTab]);

  const [selectedPromoImage, setSelectedPromoImage] = React.useState<string | null>(null);

  // Application States, persisting in localStorage
  const [shopConfig, setShopConfig] = React.useState<ShopConfig>(() => {
    const local = localStorage.getItem('jeres_studio_shop_config');
    return local ? JSON.parse(local) : initialShopConfig;
  });

  const [banners, setBanners] = React.useState<Banner[]>(() => {
    const local = localStorage.getItem('jeres_studio_banners');
    return local ? JSON.parse(local) : initialBanners;
  });

  const [promoImages, setPromoImages] = React.useState<PromoImage[]>(() => {
    const local = localStorage.getItem('jeres_studio_promo_images');
    return local ? JSON.parse(local) : initialPromoImages;
  });

  const [products, setProducts] = React.useState<Product[]>(() => {
    const local = localStorage.getItem('jeres_studio_products');
    return local ? JSON.parse(local) : initialProducts;
  });

  const [adminUsers, setAdminUsers] = React.useState<AdminUser[]>(() => {
    const local = localStorage.getItem('jeres_studio_admin_users');
    return local ? JSON.parse(local) : initialAdminUsers;
  });

  const [cartItems, setCartItems] = React.useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = React.useState(false);

  // Initial mock orders if none exist
  const [orders, setOrders] = React.useState<Order[]>(() => {
    const local = localStorage.getItem('jeres_studio_orders') || localStorage.getItem('glow_tech_orders');
    if (local) {
      try {
        const parsed: Order[] = JSON.parse(local);
        return parsed.map((ord, idx) => {
          if (ord.invoiceNumber && ord.invoiceNumber.includes('/')) {
            const date = ord.createdAt ? new Date(ord.createdAt) : new Date();
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const paddedCount = String(idx + 1).padStart(3, '0');
            ord.invoiceNumber = `INV-${year}${month}${day}-${paddedCount}`;
          }
          return ord;
        });
      } catch (e) {
        // Fallback to default mock data
      }
    }

    const mockOrders: Order[] = [
      {
        id: 'ord-1',
        invoiceNumber: 'INV-20260622-001',
        customerName: 'Muhammad Miftah',
        customerPhone: '6285211223344',
        customerAddress: 'Kost Orange No. 5B, RT 02/09, Palmerah, Jakarta Barat, 11480',
        items: [
          {
            productId: 'p1',
            name: 'AeroSound Pro Wireless ANC Headphones',
            quantity: 1,
            price: 1850000,
            image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&h=150&fit=crop&q=80',
          },
          {
            productId: 'p5',
            name: 'LumensDesk Smart LED Desk Lamp',
            quantity: 2,
            price: 480000,
            image: 'https://images.unsplash.com/photo-1534073828943-f801091bb18c?w=150&h=150&fit=crop&q=80',
          }
        ],
        subtotal: 2810000,
        shippingFee: 25000,
        total: 2835000,
        status: 'Selesai',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000 * 3).toISOString(), // 3 days ago
        courier: 'Sicepat Reguler',
        paymentMethod: 'Transfer Bank BCA',
        notes: 'Minta dipacking bubble wrap tebal ya.',
      },
      {
        id: 'ord-2',
        invoiceNumber: 'INV-20260625-002',
        customerName: 'Siti Aminah',
        customerPhone: '628123456789',
        customerAddress: 'Perumahan Graha Indah Blok C3 No. 12, Sukolilo, Surabaya, Jawa Timur, 60111',
        items: [
          {
            productId: 'p2',
            name: 'KeyCraft K87 Minimalist Mechanical Keyboard',
            quantity: 1,
            price: 1250000,
            image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=150&h=150&fit=crop&q=80',
          }
        ],
        subtotal: 1250000,
        shippingFee: 25000,
        total: 1275000,
        status: 'Pending',
        createdAt: new Date().toISOString(), // Just now
        courier: 'J&T Express',
        paymentMethod: 'Transfer Bank Mandiri',
        notes: 'Kirim sesegera mungkin.',
      }
    ];
    return mockOrders;
  });

  // Database Connection Status State
  const [dbStatus, setDbStatus] = React.useState<{
    connected: boolean;
    host: string;
    port: number;
    database: string;
    user: string;
    error: string;
    loading: boolean;
  }>({
    connected: false,
    host: '',
    port: 3306,
    database: '',
    user: '',
    error: '',
    loading: true,
  });

  const prevOrdersRef = React.useRef<Order[]>([]);
  const prevProductsRef = React.useRef<Product[]>([]);

  // On mount, check database status and fetch values if connected
  React.useEffect(() => {
    async function loadDatabaseData() {
      try {
        const res = await fetch('/api/db-status');
        const data = await res.json();
        setDbStatus({ ...data, loading: false });

        if (data.connected) {
          console.log('Database connected! Loading live MySQL data...');
          
          const configRes = await fetch('/api/config');
          if (configRes.ok) {
            const configData = await configRes.json();
            setShopConfig(configData);
          }

          const productsRes = await fetch('/api/products');
          if (productsRes.ok) {
            const productsData = await productsRes.json();
            setProducts(productsData);
            prevProductsRef.current = productsData;
          }

          const ordersRes = await fetch('/api/orders');
          if (ordersRes.ok) {
            const ordersData = await ordersRes.json();
            setOrders(ordersData);
            prevOrdersRef.current = ordersData;
          }

          const bannersRes = await fetch('/api/banners');
          if (bannersRes.ok) {
            const bannersData = await bannersRes.json();
            setBanners(bannersData);
          }

          const promoRes = await fetch('/api/promo-images');
          if (promoRes.ok) {
            const promoData = await promoRes.json();
            setPromoImages(promoData);
          }

          const adminUsersRes = await fetch('/api/admin-users');
          if (adminUsersRes.ok) {
            const adminUsersData = await adminUsersRes.json();
            setAdminUsers(adminUsersData);
          }
        }
      } catch (err) {
        console.error('Failed to communicate with full-stack database API:', err);
        setDbStatus(prev => ({ ...prev, loading: false, error: 'Full-stack server API unreachable' }));
      }
    }
    loadDatabaseData();
  }, []);

  const [currentPrintingOrder, setCurrentPrintingOrder] = React.useState<Order | null>(null);

  // Sync state to localStorage on modification
  React.useEffect(() => {
    localStorage.setItem('jeres_studio_shop_config', JSON.stringify(shopConfig));
    if (dbStatus.connected) {
      fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shopConfig),
      }).catch(err => console.error('Failed sync shopConfig:', err));
    }
  }, [shopConfig, dbStatus.connected]);

  React.useEffect(() => {
    localStorage.setItem('jeres_studio_banners', JSON.stringify(banners));
    if (dbStatus.connected) {
      fetch('/api/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(banners),
      }).catch(err => console.error('Failed sync banners:', err));
    }
  }, [banners, dbStatus.connected]);

  React.useEffect(() => {
    localStorage.setItem('jeres_studio_promo_images', JSON.stringify(promoImages));
    if (dbStatus.connected) {
      fetch('/api/promo-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(promoImages),
      }).catch(err => console.error('Failed sync promoImages:', err));
    }
  }, [promoImages, dbStatus.connected]);

  React.useEffect(() => {
    localStorage.setItem('jeres_studio_products', JSON.stringify(products));
    if (dbStatus.connected) {
      // Find deleted products
      if (prevProductsRef.current.length > products.length) {
        const deleted = prevProductsRef.current.filter(p => !products.some(curr => curr.id === p.id));
        for (const p of deleted) {
          fetch(`/api/products/${p.id}`, { method: 'DELETE' })
            .catch(err => console.error('Failed to delete product in MySQL:', err));
        }
      } else {
        fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(products),
        }).catch(err => console.error('Failed sync products:', err));
      }
    }
    prevProductsRef.current = products;
  }, [products, dbStatus.connected]);

  React.useEffect(() => {
    localStorage.setItem('jeres_studio_orders', JSON.stringify(orders));
    if (dbStatus.connected && prevOrdersRef.current.length > 0) {
      // Find orders that were updated
      for (const order of orders) {
        const prev = prevOrdersRef.current.find(o => o.id === order.id);
        if (prev) {
          if (prev.status !== order.status || prev.courier !== order.courier || prev.paymentMethod !== order.paymentMethod) {
            fetch(`/api/orders/${order.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                status: order.status,
                courier: order.courier,
                paymentMethod: order.paymentMethod,
              }),
            }).catch(err => console.error('Failed updating order status in MySQL:', err));
          }
        }
      }
    }
    prevOrdersRef.current = orders;
  }, [orders, dbStatus.connected]);

  React.useEffect(() => {
    localStorage.setItem('jeres_studio_admin_users', JSON.stringify(adminUsers));
    if (dbStatus.connected) {
      fetch('/api/admin-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminUsers),
      }).catch(err => console.error('Failed sync adminUsers:', err));
    }
  }, [adminUsers, dbStatus.connected]);

  // Cart operations
  const handleAddToCart = (product: Product) => {
    setCartItems(prev => {
      const exists = prev.find(item => item.product.id === product.id);
      if (exists) {
        // Guard stock limit
        if (exists.quantity >= product.stock) {
          alert('Stok barang tidak mencukupi untuk jumlah yang Anda inginkan!');
          return prev;
        }
        return prev.map(item =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setCartOpen(true);
  };

  const handleUpdateCartQuantity = (productId: string, delta: number) => {
    setCartItems(prev => {
      return prev.map(item => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return item;
          // Guard stock limit
          if (newQty > item.product.stock) {
            alert('Jumlah pesanan melebihi stok fisik produk saat ini!');
            return item;
          }
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const handleRemoveCartItem = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Checkout submit handler
  const handleCheckoutSuccess = (orderDetails: Omit<Order, 'id' | 'invoiceNumber' | 'createdAt' | 'status'>) => {
    // Generate Invoice Number based on today's date & sequence
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const count = orders.length + 1;
    const paddedCount = String(count).padStart(3, '0');
    const invoiceNumber = `INV-${year}${month}${day}-${paddedCount}`;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      invoiceNumber,
      createdAt: new Date().toISOString(),
      status: 'Pending',
      ...orderDetails,
    };

    // Deduct Stock from local products state
    const updatedProducts = products.map(p => {
      const purchased = orderDetails.items.find(item => item.productId === p.id);
      if (purchased) {
        return { ...p, stock: Math.max(0, p.stock - purchased.quantity) };
      }
      return p;
    });

    if (dbStatus.connected) {
      fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      }).catch(err => console.error('Failed to save order to MySQL:', err));
    }

    setProducts(updatedProducts);
    setOrders(prev => [newOrder, ...prev]);
    setCartItems([]);
    setCartOpen(false);

    // Automatically trigger A6 Invoice preview modal
    setCurrentPrintingOrder(newOrder);
  };

  const handleExploreClick = () => {
    const catalog = document.getElementById('products-catalog-section');
    if (catalog) {
      catalog.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      
      {/* Header & Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartItemsCount={totalCartCount}
        onOpenCart={() => setCartOpen(true)}
        shopConfig={shopConfig}
      />

      {/* Main Body */}
      <div className="flex-1">
        {activeTab === 'home' ? (
          /* ==================== HOME VIEW ==================== */
          <div className="space-y-4">
            {/* Hero Section */}
            <Hero shopConfig={shopConfig} onExploreClick={handleExploreClick} />

            {/* Banner Section */}
            <BannerSlider banners={banners} />

            {/* Promo Single Images Grid Section */}
            {promoImages && promoImages.filter(p => p.active).length > 0 && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 mb-6">
                <div className="flex items-center space-x-2.5 mb-6 border-b border-gray-100 pb-3">
                  <div className="w-1 h-6 bg-emerald-500 rounded-full"></div>
                  <h3 className="text-xl font-extrabold text-gray-900 tracking-tight uppercase">Galeri Cetak & Promo Detail</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {promoImages.filter(p => p.active).map((promo) => (
                    <div
                      key={promo.id}
                      onClick={() => setSelectedPromoImage(promo.imageUrl)}
                      className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:scale-[1.02] transition-all duration-300 border border-gray-100 cursor-pointer group"
                      title="Klik untuk memperbesar gambar"
                    >
                      <img
                        src={promo.imageUrl || undefined}
                        alt={promo.title || "Promo Studio"}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      {/* Hover Overlay with Zoom Button */}
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300 flex flex-col justify-end p-4">
                        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-xs text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <ZoomIn className="w-4 h-4" />
                        </div>
                        {promo.title && (
                          <div className="text-white drop-shadow-sm font-bold text-sm bg-black/45 px-3 py-1.5 rounded-lg w-fit backdrop-blur-xs">
                            {promo.title}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Products Catalog with Sliding Photos */}
            <ProductsList products={products} onAddToCart={handleAddToCart} />
          </div>
        ) : (
          /* ==================== ADMIN VIEW ==================== */
          <AdminDashboard
            shopConfig={shopConfig}
            onUpdateShopConfig={setShopConfig}
            banners={banners}
            onUpdateBanners={setBanners}
            promoImages={promoImages}
            onUpdatePromoImages={setPromoImages}
            products={products}
            onUpdateProducts={setProducts}
            orders={orders}
            onUpdateOrders={setOrders}
            adminUsers={adminUsers}
            onUpdateAdminUsers={setAdminUsers}
            onPrintOrderInvoice={setCurrentPrintingOrder}
          />
        )}
      </div>

      {/* Shopping Cart Drawer */}
      <Cart
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        shopConfig={shopConfig}
        onCheckout={handleCheckoutSuccess}
      />

      {/* A6 Invoice Modal */}
      <Invoice
        order={currentPrintingOrder}
        shopConfig={shopConfig}
        onClose={() => setCurrentPrintingOrder(null)}
      />

      {/* Footer (Address details shown as requested) */}
      {activeTab === 'home' && (
        <footer id="footer-section" className="bg-white border-t border-gray-100 py-12 mt-16 text-gray-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Shop Brief */}
            <div className="space-y-4">
              <h3 className="font-extrabold text-gray-900 text-lg uppercase tracking-tight">{shopConfig.name}</h3>
              <p className="text-xs leading-relaxed text-gray-500 font-light">
                {shopConfig.description}
              </p>
            </div>

            {/* Physical Location Address */}
            <div id="footer-address" className="space-y-3">
              <h4 className="font-bold text-gray-900 text-sm flex items-center space-x-1.5 uppercase tracking-wide">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Alamat Fisik Toko</span>
              </h4>
              <p className="text-xs leading-relaxed text-gray-500 font-light">
                {shopConfig.address || "Jl. Jenderal Sudirman No. 42, Jakarta Selatan, DKI Jakarta"}
              </p>
            </div>

            {/* Contact Socials */}
            <div className="space-y-4">
              <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide">Hubungi Kami</h4>
              <div className="space-y-2 text-xs">
                <a
                  href={`https://wa.me/${shopConfig.whatsappNumber}`}
                  target="_blank"
                  referrerPolicy="no-referrer"
                  className="flex items-center space-x-2 text-emerald-600 hover:underline"
                >
                  <Phone className="w-4 h-4" />
                  <span>+{shopConfig.whatsappNumber} (WhatsApp)</span>
                </a>
                <div className="flex items-center space-x-2 text-gray-400">
                  <Mail className="w-4 h-4" />
                  <span>support@{shopConfig.name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'toko'}.com</span>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-gray-50 mt-10 pt-6 text-center text-[10px] text-gray-400 font-mono flex flex-col sm:flex-row justify-between items-center gap-3">
            <span>&copy; {new Date().getFullYear()} {shopConfig.name}. Hak Cipta Dilindungi Undang-Undang.</span>
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="p-1 rounded-full hover:bg-gray-50 transition-colors flex items-center space-x-1 text-emerald-600 font-bold cursor-pointer"
            >
              <span>Kembali Ke Atas</span>
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </footer>
      )}

      {/* Fullscreen Lightbox for Promo Images */}
      {selectedPromoImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xs p-4 cursor-zoom-out animate-fade-in"
          onClick={() => setSelectedPromoImage(null)}
        >
          {/* Close Button */}
          <button
            onClick={() => setSelectedPromoImage(null)}
            className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 text-white hover:text-red-400 p-3 rounded-full backdrop-blur-xs transition-colors duration-200 cursor-pointer border border-white/20"
            title="Tutup (Esc)"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Lightbox Image Box */}
          <div
            className="relative max-w-5xl w-full max-h-[85vh] flex flex-col items-center justify-center cursor-default animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedPromoImage || undefined}
              alt="Promo Detail"
              className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl border border-white/10"
              referrerPolicy="no-referrer"
            />
            <p className="mt-4 text-center text-sm font-semibold text-gray-300 tracking-wide bg-black/40 px-4 py-2 rounded-full border border-white/5">
              Klik di mana saja di luar gambar atau tombol X untuk menutup
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
