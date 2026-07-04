/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  LayoutDashboard,
  Settings,
  Image,
  Package,
  ShoppingBag,
  History,
  Users,
  LogOut,
  Plus,
  Minus,
  Edit2,
  Trash2,
  Check,
  X,
  Printer,
  Download,
  AlertCircle,
  Eye,
  Save,
  ChevronRight,
  TrendingUp,
  CreditCard,
  Layers,
  Lock,
  User,
  ExternalLink,
  MessageSquare,
  Upload,
  Database,
  Server
} from 'lucide-react';
import { ShopConfig, Banner, Product, Order, AdminUser, OrderStatus, PromoImage } from '../types';

interface AdminDashboardProps {
  dbStatus?: {
    connected: boolean;
    host: string;
    port: number;
    database: string;
    user: string;
    error: string;
    loading: boolean;
  };
  shopConfig: ShopConfig;
  onUpdateShopConfig: (config: ShopConfig) => void;
  banners: Banner[];
  onUpdateBanners: (banners: Banner[]) => void;
  promoImages: PromoImage[];
  onUpdatePromoImages: (promoImages: PromoImage[]) => void;
  products: Product[];
  onUpdateProducts: (products: Product[]) => void;
  orders: Order[];
  onUpdateOrders: (orders: Order[]) => void;
  adminUsers: AdminUser[];
  onUpdateAdminUsers: (users: AdminUser[]) => void;
  onPrintOrderInvoice: (order: Order) => void;
}

type AdminSubTab = 'overview' | 'shop_content' | 'banners' | 'promo_images' | 'products_stock' | 'orders_recap' | 'transaction_history' | 'user_accounts';

// Helper to upload image files to the server and get relative path
const uploadFile = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Gagal mengunggah gambar');
  }
  const data = await response.json();
  return data.url; // e.g. "assets/file-name.ext"
};

export default function AdminDashboard({
  dbStatus,
  shopConfig,
  onUpdateShopConfig,
  banners,
  onUpdateBanners,
  promoImages,
  onUpdatePromoImages,
  products,
  onUpdateProducts,
  orders,
  onUpdateOrders,
  adminUsers,
  onUpdateAdminUsers,
  onPrintOrderInvoice,
}: AdminDashboardProps) {
  // Authentication states
  const [isLoggedIn, setIsLoggedIn] = React.useState<boolean>(() => {
    return localStorage.getItem('jeres_studio_is_logged_in') === 'true';
  });
  const [currentUser, setCurrentUser] = React.useState<AdminUser | null>(() => {
    const saved = localStorage.getItem('jeres_studio_current_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loginError, setLoginError] = React.useState('');

  // Active tab inside Dashboard
  const [subTab, setSubTab] = React.useState<AdminSubTab>('overview');

  // Modal / Editing states
  const [editingBanner, setEditingBanner] = React.useState<Banner | null>(null);
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);
  const [editingOrder, setEditingOrder] = React.useState<Order | null>(null);
  const [editingUser, setEditingUser] = React.useState<AdminUser | null>(null);

  // Form states for creating new items
  const [showAddBanner, setShowAddBanner] = React.useState(false);
  const [newBanner, setNewBanner] = React.useState<Omit<Banner, 'id'>>({
    imageUrl: '',
    title: '',
    description: '',
    active: true,
  });

  const [showAddProduct, setShowAddProduct] = React.useState(false);
  const [newProduct, setNewProduct] = React.useState<Omit<Product, 'id'>>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    images: [''],
    category: '',
  });

  const [showAddUser, setShowAddUser] = React.useState(false);
  const [newUser, setNewUser] = React.useState<Omit<AdminUser, 'id'>>({
    username: '',
    passwordHash: '',
    name: '',
    role: 'Staff',
  });

  // Drag and drop states for banner uploads
  const [dragActiveAdd, setDragActiveAdd] = React.useState(false);
  const [dragActiveEdit, setDragActiveEdit] = React.useState(false);

  // Form states and drag states for single promo images
  const [editingPromoImage, setEditingPromoImage] = React.useState<PromoImage | null>(null);
  const [showAddPromoImage, setShowAddPromoImage] = React.useState(false);
  const [newPromoImage, setNewPromoImage] = React.useState<Omit<PromoImage, 'id'>>({
    imageUrl: '',
    title: '',
    active: true,
  });

  const [dragActivePromoAdd, setDragActivePromoAdd] = React.useState(false);
  const [dragActivePromoEdit, setDragActivePromoEdit] = React.useState(false);

  // Custom delete confirmation modal state
  const [deleteConfirmation, setDeleteConfirmation] = React.useState<{
    isOpen: boolean;
    type: 'banner' | 'promo_image' | 'product' | 'order' | 'user';
    id: string;
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'banner',
    id: '',
    title: '',
    message: '',
  });



  // File upload change handler
  const handleBannerFileChange = async (file: File, isEdit: boolean) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('File yang diunggah harus berupa gambar!');
      return;
    }
    try {
      const url = await uploadFile(file);
      if (isEdit) {
        if (editingBanner) {
          setEditingBanner({ ...editingBanner, imageUrl: url });
        }
      } else {
        setNewBanner(prev => ({ ...prev, imageUrl: url }));
      }
    } catch (err: any) {
      alert(err.message || 'Gagal mengunggah gambar');
    }
  };

  const handleBannerDrag = (e: React.DragEvent, isEdit: boolean, active: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    if (isEdit) {
      setDragActiveEdit(active);
    } else {
      setDragActiveAdd(active);
    }
  };

  const handleBannerDrop = (e: React.DragEvent, isEdit: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    if (isEdit) {
      setDragActiveEdit(false);
    } else {
      setDragActiveAdd(false);
    }
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleBannerFileChange(e.dataTransfer.files[0], isEdit);
    }
  };

  // Single Promo image file handlers
  const handlePromoImageFileChange = async (file: File, isEdit: boolean) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('File yang diunggah harus berupa gambar!');
      return;
    }
    try {
      const url = await uploadFile(file);
      if (isEdit) {
        if (editingPromoImage) {
          setEditingPromoImage({ ...editingPromoImage, imageUrl: url });
        }
      } else {
        setNewPromoImage(prev => ({ ...prev, imageUrl: url }));
      }
    } catch (err: any) {
      alert(err.message || 'Gagal mengunggah gambar');
    }
  };

  const handlePromoImageDrag = (e: React.DragEvent, isEdit: boolean, active: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    if (isEdit) {
      setDragActivePromoEdit(active);
    } else {
      setDragActivePromoAdd(active);
    }
  };

  const handlePromoImageDrop = (e: React.DragEvent, isEdit: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    if (isEdit) {
      setDragActivePromoEdit(false);
    } else {
      setDragActivePromoAdd(false);
    }
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handlePromoImageFileChange(e.dataTransfer.files[0], isEdit);
    }
  };

  // Handle Admin Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const foundUser = adminUsers.find(
      u => u.username === username.toLowerCase() && u.passwordHash === password
    );
    if (foundUser) {
      setIsLoggedIn(true);
      setCurrentUser(foundUser);
      localStorage.setItem('jeres_studio_is_logged_in', 'true');
      localStorage.setItem('jeres_studio_current_user', JSON.stringify(foundUser));
      setUsername('');
      setPassword('');
    } else {
      setLoginError('Username atau password admin salah!');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    localStorage.removeItem('jeres_studio_is_logged_in');
    localStorage.removeItem('jeres_studio_current_user');
    localStorage.removeItem('jeres_studio_active_tab');
    setSubTab('overview');
  };

  // Helper: Format Rupiah Currency
  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  // ==================== Ringkasan / Overview Stats ====================
  const stats = React.useMemo(() => {
    const totalSales = orders
      .filter(o => o.status === 'Selesai')
      .reduce((acc, o) => acc + o.total, 0);
    const totalSalesCount = orders.filter(o => o.status === 'Selesai').length;
    const pendingOrdersCount = orders.filter(o => o.status === 'Pending').length;
    const totalStock = products.reduce((acc, p) => acc + p.stock, 0);

    return { totalSales, totalSalesCount, pendingOrdersCount, totalStock };
  }, [orders, products]);

  // ==================== Konten Toko (Shop Content) Management ====================
  const [localShopConfig, setLocalShopConfig] = React.useState<ShopConfig>({ ...shopConfig });
  const [dragActiveLogo, setDragActiveLogo] = React.useState(false);

  React.useEffect(() => {
    setLocalShopConfig({ ...shopConfig });
  }, [shopConfig]);

  const handleLogoFileChange = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('File yang diunggah harus berupa gambar!');
      return;
    }
    try {
      const url = await uploadFile(file);
      setLocalShopConfig(prev => ({ ...prev, logoUrl: url }));
    } catch (err: any) {
      alert(err.message || 'Gagal mengunggah gambar');
    }
  };

  const handleLogoDrag = (e: React.DragEvent, active: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveLogo(active);
  };

  const handleLogoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveLogo(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleLogoFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSaveShopConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateShopConfig(localShopConfig);
    alert('Informasi toko berhasil diperbarui!');
  };

  // ==================== Banners Management ====================
  const handleAddBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBanner.imageUrl || !newBanner.title) {
      alert('Teks judul dan gambar wajib diisi!');
      return;
    }
    const added: Banner = {
      id: `b-${Date.now()}`,
      ...newBanner,
    };
    onUpdateBanners([...banners, added]);
    setNewBanner({ imageUrl: '', title: '', description: '', active: true });
    setShowAddBanner(false);
  };

  const handleSaveEditBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner) return;
    const updated = banners.map(b => (b.id === editingBanner.id ? editingBanner : b));
    onUpdateBanners(updated);
    setEditingBanner(null);
  };

  const handleDeleteBanner = (id: string) => {
    setDeleteConfirmation({
      isOpen: true,
      type: 'banner',
      id,
      title: 'Hapus Banner',
      message: 'Apakah Anda yakin ingin menghapus banner ini?',
    });
  };

  const handleConfirmDelete = () => {
    const { type, id } = deleteConfirmation;
    if (type === 'banner') {
      onUpdateBanners(banners.filter(b => b.id !== id));
    } else if (type === 'promo_image') {
      onUpdatePromoImages(promoImages.filter(pm => pm.id !== id));
    } else if (type === 'product') {
      onUpdateProducts(products.filter(p => p.id !== id));
    } else if (type === 'order') {
      onUpdateOrders(orders.filter(o => o.id !== id));
    } else if (type === 'user') {
      onUpdateAdminUsers(adminUsers.filter(u => u.id !== id));
    }
    setDeleteConfirmation({ isOpen: false, type: 'banner', id: '', title: '', message: '' });
  };

  const handleToggleBannerActive = (id: string) => {
    const updated = banners.map(b => (b.id === id ? { ...b, active: !b.active } : b));
    onUpdateBanners(updated);
  };

  // ==================== Promo Single Images Management ====================
  const handleAddPromoImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromoImage.imageUrl) {
      alert('Gambar wajib diisi!');
      return;
    }
    const added: PromoImage = {
      id: `pm-${Date.now()}`,
      ...newPromoImage,
    };
    onUpdatePromoImages([...promoImages, added]);
    setNewPromoImage({ imageUrl: '', title: '', active: true });
    setShowAddPromoImage(false);
  };

  const handleSaveEditPromoImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPromoImage) return;
    const updated = promoImages.map(pm => (pm.id === editingPromoImage.id ? editingPromoImage : pm));
    onUpdatePromoImages(updated);
    setEditingPromoImage(null);
  };

  const handleDeletePromoImage = (id: string) => {
    setDeleteConfirmation({
      isOpen: true,
      type: 'promo_image',
      id,
      title: 'Hapus Gambar Promo',
      message: 'Apakah Anda yakin ingin menghapus gambar promo ini?',
    });
  };

  const handleTogglePromoImageActive = (id: string) => {
    const updated = promoImages.map(pm => (pm.id === id ? { ...pm, active: !pm.active } : pm));
    onUpdatePromoImages(updated);
  };

  // ==================== Products & Stock Management ====================
  const handleAddProductImageField = () => {
    setNewProduct({ ...newProduct, images: [...newProduct.images, ''] });
  };

  const handleRemoveProductImageField = (index: number) => {
    const updatedImages = newProduct.images.filter((_, i) => i !== index);
    setNewProduct({ ...newProduct, images: updatedImages });
  };

  const handleNewProductImageChange = (index: number, val: string) => {
    const updated = [...newProduct.images];
    updated[index] = val;
    setNewProduct({ ...newProduct, images: updated });
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanImages = newProduct.images.filter(img => img.trim() !== '');
    if (!newProduct.name || cleanImages.length === 0 || newProduct.price <= 0) {
      alert('Harap isi Nama, minimal 1 Foto, dan Harga Produk yang valid!');
      return;
    }

    const added: Product = {
      id: `p-${Date.now()}`,
      name: newProduct.name,
      description: newProduct.description,
      price: Number(newProduct.price),
      stock: Number(newProduct.stock),
      images: cleanImages,
      category: newProduct.category || 'Umum',
    };

    onUpdateProducts([...products, added]);
    setNewProduct({ name: '', description: '', price: 0, stock: 0, images: [''], category: '' });
    setShowAddProduct(false);
  };

  const handleSaveEditProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    const cleanImages = editingProduct.images.filter(img => img.trim() !== '');
    if (!editingProduct.name || cleanImages.length === 0 || editingProduct.price <= 0) {
      alert('Harap isi Nama, minimal 1 Foto, dan Harga Produk yang valid!');
      return;
    }
    const updatedProduct = { ...editingProduct, images: cleanImages };
    const updated = products.map(p => (p.id === updatedProduct.id ? updatedProduct : p));
    onUpdateProducts(updated);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (id: string) => {
    setDeleteConfirmation({
      isOpen: true,
      type: 'product',
      id,
      title: 'Hapus Produk',
      message: 'Apakah Anda yakin ingin menghapus produk ini dari katalog?',
    });
  };

  const handleQuickStockEdit = (id: string, newStock: number) => {
    if (newStock < 0) return;
    const updated = products.map(p => (p.id === id ? { ...p, stock: newStock } : p));
    onUpdateProducts(updated);
  };

  // ==================== Orders Recapitulation (Real-Time) ====================
  const handleUpdateOrderStatus = (id: string, newStatus: OrderStatus) => {
    const updated = orders.map(o => (o.id === id ? { ...o, status: newStatus } : o));
    onUpdateOrders(updated);
  };

  const handleSendWhatsAppNotification = (order: Order) => {
    const statusMessages: Record<OrderStatus, string> = {
      Pending: 'menunggu verifikasi pembayaran.',
      Diproses: 'sedang kami siapkan dan dikemas dengan aman.',
      Dikirim: `telah diserahkan ke pihak kurir (${order.courier}). Silakan tunggu kedatangannya ya!`,
      Selesai: 'telah selesai dikirim dan diterima dengan baik. Terima kasih telah berbelanja!',
      Dibatalkan: 'telah kami batalkan sesuai dengan pengajuan / kesepakatan bersama.'
    };

    const text = `Halo Kak *${order.customerName}*,
Kami dari toko *${shopConfig.name}* ingin menginformasikan status pesanan Anda dengan nomor invoice *${order.invoiceNumber}*.

Saat ini pesanan Kakak berstatus: *${order.status.toUpperCase()}* (${statusMessages[order.status]})

*Detail Pembelian:*
${order.items.map(item => `- ${item.name} x${item.quantity}`).join('\n')}

*Total Pembayaran:* ${formatRupiah(order.total)}
*Kurir:* ${order.courier}

Terima kasih atas kepercayaan Kakak berbelanja di *${shopConfig.name}*! Jika ada kendala silakan hubungi kami kembali.`;

    const cleanPhone = order.customerPhone.replace(/[^0-9]/g, '');
    const waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank', 'referrerPolicy=no-referrer');
  };

  // ==================== Transaction History & Export ====================
  // Format CSV and Download for Excel
  const handleExportExcel = () => {
    if (orders.length === 0) {
      alert('Tidak ada riwayat transaksi untuk diekspor!');
      return;
    }

    const headers = ['Nomor Invoice', 'Tanggal', 'Nama Pelanggan', 'WhatsApp', 'Jasa Kurir', 'Metode Bayar', 'Subtotal', 'Ongkir', 'Total Pembayaran', 'Status'];
    
    // Calculate total sums for recap
    const totalSubtotal = orders.reduce((sum, o) => sum + o.subtotal, 0);
    const totalShipping = orders.reduce((sum, o) => sum + o.shippingFee, 0);
    const totalPayment = orders.reduce((sum, o) => sum + o.total, 0);

    const formatExcelRupiah = (num: number): string => {
      return 'Rp' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    const escapeCsvField = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val);
      // If value contains comma, double-quote, or newline, escape quotes and wrap in quotes
      if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = orders.map(o => [
      o.invoiceNumber,
      new Date(o.createdAt).toLocaleString('id-ID'),
      o.customerName,
      o.customerPhone.match(/^\d+$/) ? `="${o.customerPhone}"` : o.customerPhone,
      o.courier,
      o.paymentMethod,
      formatExcelRupiah(o.subtotal),
      formatExcelRupiah(o.shippingFee),
      formatExcelRupiah(o.total),
      o.status
    ]);

    const emptyRow = ['', '', '', '', '', '', '', '', '', ''];
    const totalRow = [
      'TOTAL REKAPITULASI',
      '',
      '',
      '',
      '',
      '',
      formatExcelRupiah(totalSubtotal),
      formatExcelRupiah(totalShipping),
      formatExcelRupiah(totalPayment),
      ''
    ];

    const formattedHeaders = headers.map(escapeCsvField);
    const formattedRows = rows.map(r => r.map(escapeCsvField));
    const formattedTotal = totalRow.map(escapeCsvField);

    const csvString = [
      'sep=,',
      formattedHeaders.join(','),
      ...formattedRows.map(r => r.join(',')),
      emptyRow.join(','),
      formattedTotal.join(',')
    ].join('\n');

    // Create Blob with UTF-8 BOM to support Indonesian and other characters cleanly in Excel
    const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Rekap_Transaksi_${shopConfig.name}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Format HTML Print layout for all transaction history as a PDF report
  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const totalRevenue = orders.filter(o => o.status === 'Selesai').reduce((acc, o) => acc + o.total, 0);

    printWindow.document.write(`
      <html>
        <head>
          <title>Laporan Riwayat Transaksi - ${shopConfig.name}</title>
          <style>
            body { font-family: Arial, sans-serif; font-size: 11px; margin: 20px; line-height: 1.4; color: #333; }
            h1 { text-align: center; margin-bottom: 5px; font-size: 18px; color: #111; }
            h2 { text-align: center; margin-top: 0; font-weight: normal; font-size: 12px; color: #666; margin-bottom: 25px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; font-weight: bold; }
            .text-right { text-align: right; }
            .font-bold { font-weight: bold; }
            .badge { padding: 3px 6px; border-radius: 4px; font-size: 9px; font-weight: bold; text-transform: uppercase; }
            .badge-selesai { background-color: #d1fae5; color: #065f46; }
            .badge-proses { background-color: #dbeafe; color: #1e40af; }
            .badge-pending { background-color: #fef3c7; color: #92400e; }
            .badge-batal { background-color: #fee2e2; color: #991b1b; }
            .summary-box { margin-top: 30px; border-top: 2px solid #333; padding-top: 15px; font-size: 13px; }
            .flex-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
          </style>
        </head>
        <body onload="window.print();">
          <h1>LAPORAN RIWAYAT TRANSAKSI</h1>
          <h2>Toko Resmi: ${shopConfig.name} | Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}</h2>
          
          <table>
            <thead>
              <tr>
                <th>No Invoice</th>
                <th>Tanggal</th>
                <th>Pelanggan</th>
                <th>No WA</th>
                <th>Kurir</th>
                <th>Metode Bayar</th>
                <th>Status</th>
                <th class="text-right">Total Belanja</th>
              </tr>
            </thead>
            <tbody>
              ${orders.map(o => `
                <tr>
                  <td class="font-bold">${o.invoiceNumber}</td>
                  <td>${new Date(o.createdAt).toLocaleDateString('id-ID')}</td>
                  <td>${o.customerName}</td>
                  <td>${o.customerPhone}</td>
                  <td>${o.courier}</td>
                  <td>${o.paymentMethod}</td>
                  <td>
                    <span class="badge ${
                      o.status === 'Selesai' ? 'badge-selesai' :
                      o.status === 'Pending' ? 'badge-pending' :
                      o.status === 'Dibatalkan' ? 'badge-batal' : 'badge-proses'
                    }">${o.status}</span>
                  </td>
                  <td class="text-right font-bold">${formatRupiah(o.total)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="summary-box">
            <div class="flex-row">
              <span>Total Transaksi Tercatat:</span>
              <span class="font-bold">${orders.length} Pesanan</span>
            </div>
            <div class="flex-row">
              <span>Total Omset Berhasil (Selesai):</span>
              <span class="font-bold" style="color: #059669; font-size: 15px;">${formatRupiah(totalRevenue)}</span>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleSaveEditOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;
    if (editingOrder.items.length === 0) {
      alert('Pesanan harus memiliki minimal 1 barang belanja!');
      return;
    }
    const updated = orders.map(o => (o.id === editingOrder.id ? editingOrder : o));
    onUpdateOrders(updated);
    setEditingOrder(null);
  };

  const handleEditOrderItemChange = (index: number, field: 'quantity' | 'price', value: number) => {
    if (!editingOrder) return;
    const updatedItems = [...editingOrder.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    const newSubtotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setEditingOrder({
      ...editingOrder,
      items: updatedItems,
      subtotal: newSubtotal,
      total: newSubtotal + (editingOrder.shippingFee || 0)
    });
  };

  const handleRemoveOrderItem = (index: number) => {
    if (!editingOrder) return;
    const updatedItems = editingOrder.items.filter((_, idx) => idx !== index);
    const newSubtotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setEditingOrder({
      ...editingOrder,
      items: updatedItems,
      subtotal: newSubtotal,
      total: newSubtotal + (editingOrder.shippingFee || 0)
    });
  };

  const handleDeleteOrder = (id: string) => {
    setDeleteConfirmation({
      isOpen: true,
      type: 'order',
      id,
      title: 'Hapus Transaksi',
      message: 'Apakah Anda yakin ingin menghapus data transaksi ini dari rekapitulasi histori?',
    });
  };

  // ==================== User Admin Accounts Management ====================
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.username || !newUser.passwordHash || !newUser.name) {
      alert('Semua bidang wajib diisi!');
      return;
    }
    const exists = adminUsers.find(u => u.username === newUser.username.toLowerCase());
    if (exists) {
      alert('Username tersebut sudah terdaftar!');
      return;
    }

    const added: AdminUser = {
      id: `usr-${Date.now()}`,
      username: newUser.username.toLowerCase(),
      passwordHash: newUser.passwordHash,
      name: newUser.name,
      role: newUser.role,
    };

    onUpdateAdminUsers([...adminUsers, added]);
    setNewUser({ username: '', passwordHash: '', name: '', role: 'Staff' });
    setShowAddUser(false);
  };

  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    const exists = adminUsers.find(
      u => u.username === editingUser.username.toLowerCase() && u.id !== editingUser.id
    );
    if (exists) {
      alert('Username tersebut sudah digunakan oleh akun lain!');
      return;
    }
    const updated = adminUsers.map(u => (u.id === editingUser.id ? editingUser : u));
    onUpdateAdminUsers(updated);
    setEditingUser(null);
  };

  const handleDeleteUser = (id: string) => {
    if (currentUser?.id === id) {
       alert('Anda tidak bisa menghapus akun Anda sendiri yang sedang aktif digunakan!');
       return;
    }
    setDeleteConfirmation({
      isOpen: true,
      type: 'user',
      id,
      title: 'Hapus Akun Admin',
      message: 'Apakah Anda yakin ingin menghapus akun admin ini?',
    });
  };


  // ==================== LOGIN SCREEN ====================
  if (!isLoggedIn) {
    return (
      <div id="admin-login-screen" className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-4">
          <div className="mx-auto h-12 w-12 bg-emerald-600 rounded-full flex items-center justify-center text-white font-extrabold text-xl shadow-md">
            A
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Admin Portal</h2>
          <p className="text-xs text-gray-500 max-w-xs mx-auto">
            Silakan masuk menggunakan akun administratif toko Anda yang aman.
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-6 shadow-md rounded-2xl border border-gray-100 space-y-6">
            <form onSubmit={handleLogin} className="space-y-5">
              {loginError && (
                <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl flex items-center space-x-2 text-rose-700 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 flex items-center space-x-1">
                  <User className="w-3.5 h-3.5" />
                  <span>Username Admin</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masukkan username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 flex items-center space-x-1">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Password Keamanan</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md text-xs tracking-wide uppercase transition-colors cursor-pointer"
              >
                Verifikasi & Masuk
              </button>
            </form>

            <div className="border-t border-gray-100 pt-4 text-center">
              <span className="text-[10px] text-gray-400 font-mono">
                Default: admin / admin123
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== DASHBOARD PANEL ====================
  return (
    <div id="admin-dashboard-container" className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-100 shrink-0 flex flex-col justify-between py-6 px-4">
        <div className="space-y-6">
          {/* Active Admin Identity */}
          <div className="flex items-center space-x-3 p-2 bg-emerald-50/50 rounded-xl border border-emerald-100/50">
            <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
              {currentUser?.name.charAt(0) || 'A'}
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-800 line-clamp-1">{currentUser?.name}</h4>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full uppercase">
                {currentUser?.role}
              </span>
            </div>
          </div>

          {/* Nav Buttons */}
          <nav className="space-y-1">
            <button
              onClick={() => setSubTab('overview')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-colors cursor-pointer ${
                subTab === 'overview' ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-emerald-600'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>RINGKASAN STATS</span>
            </button>

            <button
              onClick={() => setSubTab('shop_content')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-colors cursor-pointer ${
                subTab === 'shop_content' ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-emerald-600'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>KONTEN TOKO</span>
            </button>

            <button
              onClick={() => setSubTab('banners')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-colors cursor-pointer ${
                subTab === 'banners' ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-emerald-600'
              }`}
            >
              <Image className="w-4 h-4" />
              <span>MANAJEMEN BANNER</span>
            </button>

            <button
              onClick={() => setSubTab('promo_images')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-colors cursor-pointer ${
                subTab === 'promo_images' ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-emerald-600'
              }`}
            >
              <Image className="w-4 h-4 text-emerald-500" />
              <span>GALERI PROMO DETAIL</span>
            </button>

            <button
              onClick={() => setSubTab('products_stock')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-colors cursor-pointer ${
                subTab === 'products_stock' ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-emerald-600'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>STOK & PRODUK</span>
            </button>

            <button
              onClick={() => setSubTab('orders_recap')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-colors cursor-pointer ${
                subTab === 'orders_recap' ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-emerald-600'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>REKAP PESANAN</span>
              {stats.pendingOrdersCount > 0 && (
                <span className="bg-rose-500 text-white text-[9px] font-bold h-5 px-1.5 rounded-full flex items-center justify-center ml-auto">
                  {stats.pendingOrdersCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setSubTab('transaction_history')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-colors cursor-pointer ${
                subTab === 'transaction_history' ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-emerald-600'
              }`}
            >
              <History className="w-4 h-4" />
              <span>RIWAYAT TRANSAKSI</span>
            </button>

            {currentUser?.role === 'Super Admin' && (
              <button
                onClick={() => setSubTab('user_accounts')}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-colors cursor-pointer ${
                  subTab === 'user_accounts' ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-emerald-600'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>KELOLA AKUN ADMIN</span>
              </button>
            )}
          </nav>
        </div>

        {/* Logout Section */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-3 py-2.5 text-gray-600 hover:bg-rose-50 hover:text-rose-600 rounded-xl text-xs font-bold tracking-wide transition-colors cursor-pointer mt-6"
        >
          <LogOut className="w-4 h-4" />
          <span>KELUAR PORTAL</span>
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
        
        {/* ==================== SUB-VIEW 1: OVERVIEW ==================== */}
        {subTab === 'overview' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Ringkasan Toko</h1>
              <span className="text-xs text-gray-400 font-mono">Real-time stats</span>
            </div>

            {/* Database Connection Status Card */}
            {dbStatus && (
              <div className={`p-5 rounded-2xl border ${
                dbStatus.connected 
                  ? 'bg-emerald-50/50 border-emerald-100/80 text-emerald-800' 
                  : 'bg-amber-50/40 border-amber-100/70 text-amber-800'
              } flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs`}>
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-xl shrink-0 ${
                    dbStatus.connected ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    <Database className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-extrabold uppercase tracking-wide">
                        Koneksi Database Laragon (MySQL)
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                        dbStatus.connected 
                          ? 'bg-emerald-200 text-emerald-950' 
                          : 'bg-amber-200 text-amber-950'
                      }`}>
                        {dbStatus.connected ? 'Terhubung (MySQL)' : 'Offline / Demo Mode'}
                      </span>
                    </div>
                    {dbStatus.connected ? (
                      <div className="text-xs text-emerald-700/90 mt-1 space-y-1">
                        <p>Aplikasi Anda terhubung langsung dengan database lokal Laragon Anda. Semua data toko, produk, dan transaksi disinkronkan secara real-time.</p>
                        <p className="font-mono text-[10px] text-emerald-900 bg-emerald-100/40 px-2 py-1 rounded w-fit mt-1">
                          Host: {dbStatus.host}:{dbStatus.port} | DB: {dbStatus.database} | User: {dbStatus.user}
                        </p>
                      </div>
                    ) : (
                      <div className="text-xs text-amber-700/90 mt-1 space-y-1.5 leading-relaxed max-w-3xl">
                        <p>
                          Pratinjau Awan ini berjalan di lingkungan Cloud Run sandboxed (tidak dapat menjangkau database localhost komputer Anda secara langsung). Aplikasi saat ini menggunakan penyimpanan browser cadangan <strong>(LocalStorage)</strong> agar tetap dapat dicoba secara lancar di internet.
                        </p>
                        <div className="bg-amber-100/50 p-3 rounded-xl border border-amber-200/50 mt-2 text-[11px] space-y-1">
                          <p className="font-bold text-amber-950 uppercase">Langkah Mengaktifkan Database Laragon MySQL Anda:</p>
                          <ol className="list-decimal pl-4 space-y-1 text-amber-900">
                            <li>Klik tombol menu ekspor/pengaturan di kanan atas halaman ini, lalu ekspor kode proyek sebagai <strong>ZIP atau unggah ke GitHub</strong>.</li>
                            <li>Buka folder proyek hasil ekspor di komputer Anda, lalu jalankan perintah: <code>npm install</code>.</li>
                            <li>Pastikan aplikasi <strong>Laragon</strong> Anda berjalan dan servis <strong>MySQL</strong> dalam keadaan aktif di komputer Anda.</li>
                            <li>Ketik <code>npm run dev</code> untuk memulai server lokal. Program akan otomatis mendeteksi Laragon pada port <code>3306</code>, membuat database dan tabel yang diperlukan, serta mengimpor data awal secara otomatis!</li>
                          </ol>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Revenue */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center space-x-4">
                <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs text-gray-400 font-semibold block uppercase">Total Omset</span>
                  <span className="text-lg font-black text-gray-900">{formatRupiah(stats.totalSales)}</span>
                </div>
              </div>

              {/* Transactions Count */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center space-x-4">
                <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs text-gray-400 font-semibold block uppercase">Sukses Terbayar</span>
                  <span className="text-lg font-black text-gray-900">{stats.totalSalesCount} Pesanan</span>
                </div>
              </div>

              {/* Pending Orders */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center space-x-4">
                <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs text-gray-400 font-semibold block uppercase">Pesanan Pending</span>
                  <span className="text-lg font-black text-gray-900">{stats.pendingOrdersCount} Pesanan</span>
                </div>
              </div>

              {/* Total Products Stock */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center space-x-4">
                <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs text-gray-400 font-semibold block uppercase">Total Stok</span>
                  <span className="text-lg font-black text-gray-900">{stats.totalStock} Unit</span>
                </div>
              </div>
            </div>

            {/* Notification alert for pending */}
            {stats.pendingOrdersCount > 0 && (
              <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center space-x-3 text-rose-800">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span className="text-xs font-semibold">Ada {stats.pendingOrdersCount} pesanan baru masuk menunggu tindakan Anda!</span>
                </div>
                <button
                  onClick={() => setSubTab('orders_recap')}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  Lihat Pesanan
                </button>
              </div>
            )}
          </div>
        )}

        {/* ==================== SUB-VIEW 2: SHOP CONTENT ==================== */}
        {subTab === 'shop_content' && (
          <div className="space-y-6">
            <div className="pb-4 border-b border-gray-100">
              <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Kelola Profil Toko</h1>
              <p className="text-xs text-gray-500 mt-1">Ubah informasi teks keterangan toko, nomor tujuan WA, logo, dan alamat fisik.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs max-w-3xl">
              <form onSubmit={handleSaveShopConfig} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 block">Nama Toko Online</label>
                    <input
                      type="text"
                      required
                      value={localShopConfig.name}
                      onChange={(e) => setLocalShopConfig({ ...localShopConfig, name: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 block">Nomor WhatsApp Admin (Untuk Menerima Order)</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: 6281234567890"
                      value={localShopConfig.whatsappNumber}
                      onChange={(e) => setLocalShopConfig({ ...localShopConfig, whatsappNumber: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:border-emerald-500"
                    />
                    <span className="text-[10px] text-gray-400 block font-light">Gunakan format kode negara (62...) tanpa tanda + atau spasi.</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 block">Keterangan / Deskripsi Toko (Hero Section)</label>
                  <textarea
                    required
                    rows={3}
                    value={localShopConfig.description}
                    onChange={(e) => setLocalShopConfig({ ...localShopConfig, description: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-2 border border-gray-100 p-4 rounded-xl bg-gray-50/50">
                  <label className="text-xs font-bold text-gray-700 block uppercase tracking-wider">Logo Toko (Kiri Atas)</label>
                  <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-5">
                    {/* Rectangular Logo Preview */}
                    <div className="relative group w-28 h-28 bg-white rounded-xl border border-gray-200 p-1.5 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
                      {localShopConfig.logoUrl && !localShopConfig.logoUrl.includes('unsplash.com') ? (
                        <img
                          src={localShopConfig.logoUrl}
                          alt="Logo Preview"
                          className="w-full h-full rounded-lg object-contain bg-gray-50/50"
                        />
                      ) : (
                        <div className="relative inline-flex flex-col items-center justify-center px-2 py-1 bg-white border border-gray-100 rounded-lg shadow-xs transform -skew-x-3 select-none shrink-0 scale-95">
                          <span className="text-[10px] italic font-black text-amber-500 tracking-tight leading-none drop-shadow-[0_0.5px_0_rgba(0,0,0,0.05)]">JERE'S</span>
                          <span className="text-[7.5px] italic font-extrabold text-pink-500 tracking-widest leading-none mt-0.5 uppercase">STUDIO</span>
                          <div className="bg-cyan-500 text-white text-[5.5px] font-black px-1 py-0.5 rounded-xs uppercase tracking-widest leading-none mt-0.5">
                            DESIGN
                          </div>
                        </div>
                      )}
                      <div 
                        onClick={() => document.getElementById('shop-logo-file-input')?.click()}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] text-white font-bold cursor-pointer text-center rounded-xl"
                      >
                        Ganti File
                      </div>
                    </div>

                    {/* Upload Dropzone & Manual Input Field */}
                    <div className="flex-1 w-full space-y-3">
                      <div
                        onDragEnter={(e) => handleLogoDrag(e, true)}
                        onDragOver={(e) => handleLogoDrag(e, true)}
                        onDragLeave={(e) => handleLogoDrag(e, false)}
                        onDrop={handleLogoDrop}
                        onClick={() => document.getElementById('shop-logo-file-input')?.click()}
                        className={`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-all flex items-center justify-center space-x-2 text-xs min-h-[56px] ${
                          dragActiveLogo
                            ? 'border-emerald-500 bg-emerald-50/50'
                            : 'border-gray-200 hover:border-emerald-400 bg-white'
                        }`}
                      >
                        <input
                          id="shop-logo-file-input"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleLogoFileChange(e.target.files[0]);
                            }
                          }}
                        />
                        <Upload className="w-4 h-4 text-emerald-500" />
                        <span className="font-semibold text-gray-600">
                          Unggah Berkas Baru <span className="font-normal text-gray-400">(Drag & Drop)</span>
                        </span>
                      </div>

                      <input
                        type="hidden"
                        value={localShopConfig.logoUrl}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 block">Alamat Fisik Toko (Ditampilkan di Invoice & Footer)</label>
                  <input
                    type="text"
                    required
                    value={localShopConfig.address}
                    onChange={(e) => setLocalShopConfig({ ...localShopConfig, address: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:border-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-sm cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ==================== SUB-VIEW 3: BANNERS ==================== */}
        {subTab === 'banners' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <div>
                <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Katalog Banner</h1>
                <p className="text-xs text-gray-500 mt-1">Kelola gambar slide promosi atas toko.</p>
              </div>
              <button
                onClick={() => setShowAddBanner(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-1.5 shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Banner</span>
              </button>
            </div>

            {/* List Banners Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {banners.map(banner => (
                <div key={banner.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs flex flex-col justify-between">
                  <div className="relative aspect-21/9 bg-gray-50">
                    <img src={banner.imageUrl || undefined} alt={banner.title} className="w-full h-full object-cover" />
                    <span className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      banner.active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {banner.active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1">
                      <h4 className="font-bold text-gray-800 text-sm line-clamp-1">{banner.title}</h4>
                      <p className="text-xs text-gray-500 line-clamp-2">{banner.description}</p>
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                      <button
                        onClick={() => handleToggleBannerActive(banner.id)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                          banner.active ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                        }`}
                      >
                        {banner.active ? 'Matikan' : 'Aktifkan'}
                      </button>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingBanner(banner)}
                          className="p-1.5 hover:bg-gray-50 text-gray-400 hover:text-emerald-600 rounded-lg cursor-pointer"
                          aria-label="Edit Banner"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBanner(banner.id)}
                          className="p-1.5 hover:bg-rose-50 text-gray-400 hover:text-rose-600 rounded-lg cursor-pointer"
                          aria-label="Hapus Banner"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ADD BANNER MODAL */}
            {showAddBanner && (
              <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
                <div className="bg-white p-6 rounded-2xl max-w-md w-full space-y-4 shadow-xl">
                  <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center space-x-1.5">
                    <Plus className="w-5 h-5 text-emerald-600" />
                    <span>Buat Banner Promosi Baru</span>
                  </h3>
                  <form onSubmit={handleAddBanner} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700">Judul Promosi *</label>
                      <input
                        type="text"
                        required
                        value={newBanner.title}
                        onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:border-emerald-500"
                        placeholder="Contoh: Diskon Kemerdekaan"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700">Keterangan Singkat</label>
                      <input
                        type="text"
                        value={newBanner.description}
                        onChange={(e) => setNewBanner({ ...newBanner, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:border-emerald-500"
                        placeholder="Contoh: Dapatkan voucher belanja Rp 50rb"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700">File Gambar Banner (Unggah / Drag & Drop) *</label>
                      <div
                        onDragEnter={(e) => handleBannerDrag(e, false, true)}
                        onDragOver={(e) => handleBannerDrag(e, false, true)}
                        onDragLeave={(e) => handleBannerDrag(e, false, false)}
                        onDrop={(e) => handleBannerDrop(e, false)}
                        onClick={() => document.getElementById('add-banner-file-input')?.click()}
                        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[140px] ${
                          dragActiveAdd
                            ? 'border-emerald-500 bg-emerald-50/50'
                            : newBanner.imageUrl
                            ? 'border-gray-300 bg-gray-50'
                            : 'border-gray-200 hover:border-emerald-400 bg-white'
                        }`}
                      >
                        <input
                          id="add-banner-file-input"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleBannerFileChange(e.target.files[0], false);
                            }
                          }}
                        />
                        {newBanner.imageUrl ? (
                          <div className="space-y-2 w-full flex flex-col items-center">
                            <img
                              src={newBanner.imageUrl}
                              alt="Preview"
                              className="h-20 object-contain rounded-lg shadow-xs max-w-full"
                            />
                            <p className="text-[10px] text-gray-500 truncate max-w-[200px]">Gambar Terpilih</p>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setNewBanner(prev => ({ ...prev, imageUrl: '' }));
                              }}
                              className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-[10px] font-bold border border-red-200 transition-colors"
                            >
                              Hapus Gambar
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                            <p className="text-xs font-semibold text-gray-700">Tarik & Lepas gambar di sini</p>
                            <p className="text-[10px] text-gray-400">atau klik untuk menelusuri file komputer Anda</p>
                          </div>
                        )}
                      </div>
                    </div>
                     <input
                        type="hidden"
                        value={newBanner.imageUrl}
                      />
                    <div className="flex space-x-3 pt-3 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => setShowAddBanner(false)}
                        className="flex-1 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 font-semibold rounded-xl text-xs border border-gray-200 transition-colors cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                      >
                        Simpan
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* EDIT BANNER MODAL */}
            {editingBanner && (
              <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
                <div className="bg-white p-6 rounded-2xl max-w-md w-full space-y-4 shadow-xl">
                  <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">Ubah Data Banner</h3>
                  <form onSubmit={handleSaveEditBanner} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700">Judul Promosi *</label>
                      <input
                        type="text"
                        required
                        value={editingBanner.title}
                        onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-hidden"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700">Keterangan Singkat</label>
                      <input
                        type="text"
                        value={editingBanner.description}
                        onChange={(e) => setEditingBanner({ ...editingBanner, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-hidden"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700">File Gambar Banner (Unggah / Drag & Drop) *</label>
                      <div
                        onDragEnter={(e) => handleBannerDrag(e, true, true)}
                        onDragOver={(e) => handleBannerDrag(e, true, true)}
                        onDragLeave={(e) => handleBannerDrag(e, true, false)}
                        onDrop={(e) => handleBannerDrop(e, true)}
                        onClick={() => document.getElementById('edit-banner-file-input')?.click()}
                        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[140px] ${
                          dragActiveEdit
                            ? 'border-emerald-500 bg-emerald-50/50'
                            : editingBanner.imageUrl
                            ? 'border-gray-300 bg-gray-50'
                            : 'border-gray-200 hover:border-emerald-400 bg-white'
                        }`}
                      >
                        <input
                          id="edit-banner-file-input"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleBannerFileChange(e.target.files[0], true);
                            }
                          }}
                        />
                        {editingBanner.imageUrl ? (
                          <div className="space-y-2 w-full flex flex-col items-center">
                            <img
                              src={editingBanner.imageUrl}
                              alt="Preview"
                              className="h-20 object-contain rounded-lg shadow-xs max-w-full"
                            />
                            <p className="text-[10px] text-gray-500 truncate max-w-[200px]">Gambar Terpilih</p>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingBanner({ ...editingBanner, imageUrl: '' });
                              }}
                              className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-[10px] font-bold border border-red-200 transition-colors"
                            >
                              Hapus Gambar
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                            <p className="text-xs font-semibold text-gray-700">Tarik & Lepas gambar di sini</p>
                            <p className="text-[10px] text-gray-400">atau klik untuk menelusuri file komputer Anda</p>
                          </div>
                        )}
                      </div>
                    </div>
                     <input
                        type="hidden"
                        value={editingBanner.imageUrl}
                      />
                    <div className="flex space-x-3 pt-3 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => setEditingBanner(null)}
                        className="flex-1 py-2 bg-gray-50 text-gray-600 border border-gray-200 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                      >
                        Simpan Perubahan
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== SUB-VIEW: PROMO IMAGES ==================== */}
        {subTab === 'promo_images' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <div>
                <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Katalog Galeri Promo Detail</h1>
                <p className="text-xs text-gray-500 mt-1">Kelola gambar promo single yang diletakkan di bawah banner slider utama (Tampil maks 3 kolom per baris).</p>
              </div>
              <button
                onClick={() => setShowAddPromoImage(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-1.5 shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Gambar Promo</span>
              </button>
            </div>

            {/* List Promo Images Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {promoImages.map(promo => (
                <div key={promo.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs flex flex-col justify-between">
                  <div className="relative aspect-[3/4] bg-gray-50">
                    <img src={promo.imageUrl || undefined} alt={promo.title || "Promo"} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <span className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      promo.active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {promo.active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1">
                      <h4 className="font-bold text-gray-800 text-sm line-clamp-1">{promo.title || "Tanpa Judul"}</h4>
                      <p className="text-[10px] text-gray-400 font-mono">ID: {promo.id}</p>
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                      <button
                        onClick={() => handleTogglePromoImageActive(promo.id)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                          promo.active ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                        }`}
                      >
                        {promo.active ? 'Matikan' : 'Aktifkan'}
                      </button>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingPromoImage(promo)}
                          className="p-1.5 hover:bg-gray-50 text-gray-400 hover:text-emerald-600 rounded-lg cursor-pointer"
                          aria-label="Edit Gambar Promo"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePromoImage(promo.id)}
                          className="p-1.5 hover:bg-rose-50 text-gray-400 hover:text-rose-600 rounded-lg cursor-pointer"
                          aria-label="Hapus Gambar Promo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {promoImages.length === 0 && (
                <div className="col-span-full bg-white border border-gray-100 rounded-2xl p-12 text-center text-gray-400">
                  Belum ada gambar promo yang ditambahkan. Silakan klik tombol di atas untuk menambah gambar pertama Anda!
                </div>
              )}
            </div>

            {/* ADD PROMO IMAGE MODAL */}
            {showAddPromoImage && (
              <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
                <div className="bg-white p-6 rounded-2xl max-w-md w-full space-y-4 shadow-xl">
                  <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center space-x-1.5">
                    <Plus className="w-5 h-5 text-emerald-600" />
                    <span>Unggah Gambar Promo Baru</span>
                  </h3>
                  <form onSubmit={handleAddPromoImage} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700">Teks Keterangan / Judul Promo (Opsional)</label>
                      <input
                        type="text"
                        value={newPromoImage.title}
                        onChange={(e) => setNewPromoImage({ ...newPromoImage, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:border-emerald-500"
                        placeholder="Contoh: Diskon Kilat Cuci Gudang"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700">File Gambar Promo (Unggah / Drag & Drop) *</label>
                      <div
                        onDragEnter={(e) => handlePromoImageDrag(e, false, true)}
                        onDragOver={(e) => handlePromoImageDrag(e, false, true)}
                        onDragLeave={(e) => handlePromoImageDrag(e, false, false)}
                        onDrop={(e) => handlePromoImageDrop(e, false)}
                        onClick={() => document.getElementById('add-promo-file-input')?.click()}
                        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[140px] ${
                          dragActivePromoAdd
                            ? 'border-emerald-500 bg-emerald-50/50'
                            : newPromoImage.imageUrl
                            ? 'border-gray-300 bg-gray-50'
                            : 'border-gray-200 hover:border-emerald-400 bg-white'
                        }`}
                      >
                        <input
                          id="add-promo-file-input"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handlePromoImageFileChange(e.target.files[0], false);
                            }
                          }}
                        />
                        {newPromoImage.imageUrl ? (
                          <div className="space-y-2 w-full flex flex-col items-center">
                            <img
                              src={newPromoImage.imageUrl}
                              alt="Preview"
                              className="h-20 object-contain rounded-lg shadow-xs max-w-full"
                              referrerPolicy="no-referrer"
                            />
                            <p className="text-[10px] text-gray-500 truncate max-w-[200px]">Gambar Terpilih</p>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setNewPromoImage({ ...newPromoImage, imageUrl: '' });
                              }}
                              className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-[10px] font-bold border border-red-200 transition-colors"
                            >
                              Hapus Gambar
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                            <p className="text-xs font-semibold text-gray-700">Tarik & Lepas gambar di sini</p>
                            <p className="text-[10px] text-gray-400">atau klik untuk menelusuri file komputer Anda</p>
                          </div>
                        )}
                      </div>
                    </div>
                     <input
                        type="hidden"
                        value={newPromoImage.imageUrl}
                      />
                    <div className="flex space-x-3 pt-3 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => setShowAddPromoImage(false)}
                        className="flex-1 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 font-semibold rounded-xl text-xs border border-gray-200 transition-colors cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                      >
                        Simpan
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* EDIT PROMO IMAGE MODAL */}
            {editingPromoImage && (
              <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
                <div className="bg-white p-6 rounded-2xl max-w-md w-full space-y-4 shadow-xl">
                  <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">Ubah Data Gambar Promo</h3>
                  <form onSubmit={handleSaveEditPromoImage} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700">Teks Keterangan / Judul Promo (Opsional)</label>
                      <input
                        type="text"
                        value={editingPromoImage.title}
                        onChange={(e) => setEditingPromoImage({ ...editingPromoImage, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:border-emerald-500"
                        placeholder="Contoh: Diskon Kilat Cuci Gudang"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700">File Gambar Promo (Unggah / Drag & Drop) *</label>
                      <div
                        onDragEnter={(e) => handlePromoImageDrag(e, true, true)}
                        onDragOver={(e) => handlePromoImageDrag(e, true, true)}
                        onDragLeave={(e) => handlePromoImageDrag(e, true, false)}
                        onDrop={(e) => handlePromoImageDrop(e, true)}
                        onClick={() => document.getElementById('edit-promo-file-input')?.click()}
                        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[140px] ${
                          dragActivePromoEdit
                            ? 'border-emerald-500 bg-emerald-50/50'
                            : editingPromoImage.imageUrl
                            ? 'border-gray-300 bg-gray-50'
                            : 'border-gray-200 hover:border-emerald-400 bg-white'
                        }`}
                      >
                        <input
                          id="edit-promo-file-input"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handlePromoImageFileChange(e.target.files[0], true);
                            }
                          }}
                        />
                        {editingPromoImage.imageUrl ? (
                          <div className="space-y-2 w-full flex flex-col items-center">
                            <img
                              src={editingPromoImage.imageUrl}
                              alt="Preview"
                              className="h-20 object-contain rounded-lg shadow-xs max-w-full"
                              referrerPolicy="no-referrer"
                            />
                            <p className="text-[10px] text-gray-500 truncate max-w-[200px]">Gambar Terpilih</p>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingPromoImage({ ...editingPromoImage, imageUrl: '' });
                              }}
                              className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-[10px] font-bold border border-red-200 transition-colors"
                            >
                              Hapus Gambar
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                            <p className="text-xs font-semibold text-gray-700">Tarik & Lepas gambar di sini</p>
                            <p className="text-[10px] text-gray-400">atau klik untuk menelusuri file komputer Anda</p>
                          </div>
                        )}
                      </div>
                    </div>
                     <input
                        type="hidden"
                        value={editingPromoImage.imageUrl}
                      />
                    <div className="flex space-x-3 pt-3 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => setEditingPromoImage(null)}
                        className="flex-1 py-2 bg-gray-50 text-gray-600 border border-gray-200 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                      >
                        Simpan Perubahan
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== SUB-VIEW 4: PRODUCTS & STOCK ==================== */}
        {subTab === 'products_stock' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <div>
                <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Katalog Produk & Stok</h1>
                <p className="text-xs text-gray-500 mt-1">Ubah stok barang instan, nama, harga, dan multi-foto slider.</p>
              </div>
              <button
                onClick={() => setShowAddProduct(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-1.5 shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Produk</span>
              </button>
            </div>

            {/* Products Stock Table */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase">
                      <th className="p-4 w-12 text-center">No</th>
                      <th className="p-4">Produk</th>
                      <th className="p-4">Kategori</th>
                      <th className="p-4">Harga</th>
                      <th className="p-4 text-center">Multi Foto Slider</th>
                      <th className="p-4 w-40 text-center">Stok Fisik</th>
                      <th className="p-4 w-28 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                    {products.map((product, index) => (
                      <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4 text-center font-bold text-gray-400">{index + 1}</td>
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <img
                              src={product.images[0] || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=80&h=80&fit=crop&q=80'}
                              alt={product.name}
                              className="w-11 h-11 object-cover rounded-xl bg-gray-50 border border-gray-100 shrink-0"
                            />
                            <div className="space-y-0.5">
                              <span className="font-bold text-gray-900 block line-clamp-1">{product.name}</span>
                              <p className="text-xs text-gray-400 line-clamp-1">{product.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="bg-gray-100 text-gray-600 font-semibold text-xs px-2.5 py-1 rounded-full uppercase">
                            {product.category || 'Umum'}
                          </span>
                        </td>
                        <td className="p-4 font-extrabold text-emerald-600">{formatRupiah(product.price)}</td>
                        <td className="p-4 text-center">
                          <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-md">
                            {product.images.length} Foto Slide
                          </span>
                        </td>
                        <td className="p-4">
                          {/* Stock Quick Editor Adjuster */}
                          <div className="flex items-center justify-center space-x-1 bg-gray-50 p-1.5 rounded-xl border border-gray-100 max-w-[130px] mx-auto">
                            <button
                              onClick={() => handleQuickStockEdit(product.id, product.stock - 1)}
                              className="p-1 rounded-lg text-gray-500 hover:bg-white border border-transparent hover:border-gray-100 cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="font-bold text-sm px-3">{product.stock}</span>
                            <button
                              onClick={() => handleQuickStockEdit(product.id, product.stock + 1)}
                              className="p-1 rounded-lg text-gray-500 hover:bg-white border border-transparent hover:border-gray-100 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => setEditingProduct(product)}
                              className="p-2 hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 rounded-xl cursor-pointer"
                              title="Edit Detail"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="p-2 hover:bg-rose-50 text-gray-400 hover:text-rose-600 rounded-xl cursor-pointer"
                              title="Hapus Produk"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ADD PRODUCT MODAL */}
            {showAddProduct && (
              <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
                <div className="bg-white p-6 rounded-2xl max-w-lg w-full space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
                  <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">Tambah Produk Baru</h3>
                  <form onSubmit={handleAddProduct} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1 col-span-2">
                        <label className="text-xs font-bold text-gray-700">Nama Produk *</label>
                        <input
                          type="text"
                          required
                          value={newProduct.name}
                          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-hidden"
                          placeholder="Contoh: Meja Kursi Kerja"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700">Kategori *</label>
                        <input
                          type="text"
                          required
                          value={newProduct.category}
                          onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-hidden"
                          placeholder="Contoh: Aksesoris"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700">Harga (Rupiah) *</label>
                        <input
                          type="number"
                          required
                          value={newProduct.price || ''}
                          onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-hidden"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700">Jumlah Stok Fisik *</label>
                        <input
                          type="number"
                          required
                          value={newProduct.stock}
                          onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700">Deskripsi Detail Produk</label>
                      <textarea
                        rows={3}
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-hidden"
                        placeholder="Keterangan lengkap detail produk..."
                      />
                    </div>

                    {/* Manage Multi Image fields */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-700 flex justify-between items-center">
                        <span>Multi Foto Slider (Masukan File Foto / Path / URL) *</span>
                        <button
                          type="button"
                          onClick={handleAddProductImageField}
                          className="text-xs text-emerald-600 hover:underline flex items-center space-x-1 cursor-pointer font-bold uppercase"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Tambah Foto</span>
                        </button>
                      </label>
                      <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                        {newProduct.images.map((img, i) => (
                          <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-2.5 relative">
                            <div className="flex items-start justify-between">
                              <span className="text-xs font-bold text-gray-500">Foto Ke-{i + 1}</span>
                              {newProduct.images.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveProductImageField(i)}
                                  className="text-xs text-rose-500 hover:text-rose-700 flex items-center space-x-0.5 cursor-pointer font-semibold"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>Hapus</span>
                                </button>
                              )}
                            </div>

                            <div className="flex items-center space-x-3">
                              {/* Mini preview */}
                              <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                                {img ? (
                                  <img src={img} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                ) : (
                                  <Image className="w-5 h-5 text-gray-400" />
                                )}
                              </div>

                              <div className="flex-1 space-y-1.5">
                                {/* Upload Button */}
                                <div className="flex items-center space-x-2">
                                  <button
                                    type="button"
                                    onClick={() => document.getElementById(`new-product-file-input-${i}`)?.click()}
                                    className="px-3 py-1.5 bg-emerald-55 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold border border-emerald-200 transition-colors cursor-pointer flex items-center space-x-1"
                                  >
                                    <Upload className="w-3.5 h-3.5" />
                                    <span>Unggah Foto</span>
                                  </button>
                                  <input
                                    id={`new-product-file-input-${i}`}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={async (e) => {
                                      if (e.target.files && e.target.files[0]) {
                                        const file = e.target.files[0];
                                        if (!file.type.startsWith('image/')) {
                                          alert('File harus berupa gambar!');
                                          return;
                                        }
                                        try {
                                          const url = await uploadFile(file);
                                          handleNewProductImageChange(i, url);
                                        } catch (err: any) {
                                          alert(err.message || 'Gagal mengunggah gambar');
                                        }
                                      }
                                    }}
                                  />
                                </div>

                                {/* URL Input */}
                                <input
                                  type="hidden"
                                  value={img}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex space-x-3 pt-3 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => setShowAddProduct(false)}
                        className="flex-1 py-2.5 bg-gray-55 hover:bg-gray-100 text-gray-600 border border-gray-200 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                      >
                        Buat Produk Baru
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* EDIT PRODUCT MODAL */}
            {editingProduct && (
              <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
                <div className="bg-white p-6 rounded-2xl max-w-lg w-full space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
                  <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">Ubah Data Produk</h3>
                  <form onSubmit={handleSaveEditProduct} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1 col-span-2">
                        <label className="text-xs font-bold text-gray-700">Nama Produk *</label>
                        <input
                          type="text"
                          required
                          value={editingProduct.name}
                          onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-hidden"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700">Kategori *</label>
                        <input
                          type="text"
                          required
                          value={editingProduct.category}
                          onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-hidden"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700">Harga (Rupiah) *</label>
                        <input
                          type="number"
                          required
                          value={editingProduct.price || ''}
                          onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-hidden"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700">Jumlah Stok Fisik *</label>
                        <input
                          type="number"
                          required
                          value={editingProduct.stock}
                          onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700">Deskripsi Detail Produk</label>
                      <textarea
                        rows={3}
                        value={editingProduct.description}
                        onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-hidden"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-700 flex justify-between items-center">
                        <span>Multi Foto Slider (Masukan File Foto / Path / URL) *</span>
                        <button
                          type="button"
                          onClick={() => setEditingProduct({ ...editingProduct, images: [...editingProduct.images, ''] })}
                          className="text-xs text-emerald-600 hover:underline flex items-center space-x-1 cursor-pointer font-bold uppercase"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Tambah Foto</span>
                        </button>
                      </label>
                      <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                        {editingProduct.images.map((img, i) => (
                          <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-2.5 relative">
                            <div className="flex items-start justify-between">
                              <span className="text-xs font-bold text-gray-500">Foto Ke-{i + 1}</span>
                              {editingProduct.images.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = editingProduct.images.filter((_, idx) => idx !== i);
                                    setEditingProduct({ ...editingProduct, images: updated });
                                  }}
                                  className="text-xs text-rose-500 hover:text-rose-700 flex items-center space-x-0.5 cursor-pointer font-semibold"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>Hapus</span>
                                </button>
                              )}
                            </div>

                            <div className="flex items-center space-x-3">
                              {/* Mini preview */}
                              <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                                {img ? (
                                  <img src={img} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                ) : (
                                  <Image className="w-5 h-5 text-gray-400" />
                                )}
                              </div>

                              <div className="flex-1 space-y-1.5">
                                {/* Upload Button */}
                                <div className="flex items-center space-x-2">
                                  <button
                                    type="button"
                                    onClick={() => document.getElementById(`edit-product-file-input-${i}`)?.click()}
                                    className="px-3 py-1.5 bg-emerald-55 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold border border-emerald-200 transition-colors cursor-pointer flex items-center space-x-1"
                                  >
                                    <Upload className="w-3.5 h-3.5" />
                                    <span>Unggah Foto</span>
                                  </button>
                                  <input
                                    id={`edit-product-file-input-${i}`}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={async (e) => {
                                      if (e.target.files && e.target.files[0]) {
                                        const file = e.target.files[0];
                                        if (!file.type.startsWith('image/')) {
                                          alert('File harus berupa gambar!');
                                          return;
                                        }
                                        try {
                                          const url = await uploadFile(file);
                                          const updated = [...editingProduct.images];
                                          updated[i] = url;
                                          setEditingProduct({ ...editingProduct, images: updated });
                                        } catch (err: any) {
                                          alert(err.message || 'Gagal mengunggah gambar');
                                        }
                                      }
                                    }}
                                  />
                                </div>

                                {/* URL Input */}
                                <input
                                  type="hidden"
                                  value={img}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex space-x-3 pt-3 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => setEditingProduct(null)}
                        className="flex-1 py-2.5 bg-gray-50 text-gray-600 border border-gray-200 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                      >
                        Simpan Perubahan
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== SUB-VIEW 5: ORDERS RECAP ==================== */}
        {subTab === 'orders_recap' && (
          <div className="space-y-6">
            <div className="pb-4 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Rekapitulasi Pesanan Pelanggan</h1>
                <p className="text-xs text-gray-500 mt-1">Status rekapitulasi data pesanan masuk dari pelanggan secara real-time.</p>
              </div>
              <span className="bg-emerald-50 text-emerald-700 font-bold text-xs px-3.5 py-1.5 rounded-full">
                {orders.length} Total Pesanan
              </span>
            </div>

            {/* List Active Orders Card */}
            {orders.length > 0 ? (
              <div className="space-y-5">
                {orders.map(order => (
                  <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
                    {/* Header bar of order card */}
                    <div className="px-6 py-4 bg-gray-50/70 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="flex items-center space-x-3">
                        <span className="font-extrabold text-sm text-gray-900">{order.invoiceNumber}</span>
                        <span className="text-xs text-gray-400">
                          {new Date(order.createdAt).toLocaleString('id-ID')}
                        </span>
                      </div>
                      
                      {/* Interactive Status Selector */}
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-400 font-bold">Status:</span>
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                          className={`text-xs font-bold rounded-lg px-2.5 py-1.5 border-none cursor-pointer focus:outline-hidden ${
                            order.status === 'Selesai' ? 'bg-emerald-100 text-emerald-800' :
                            order.status === 'Pending' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                            order.status === 'Dibatalkan' ? 'bg-rose-100 text-rose-800' : 'bg-indigo-100 text-indigo-800'
                          }`}
                        >
                          <option value="Pending">⏱ Pending (Verifikasi)</option>
                          <option value="Diproses">⚙ Diproses (Kemas)</option>
                          <option value="Dikirim">🚚 Dikirim (Kurir)</option>
                          <option value="Selesai">✅ Selesai (Diterima)</option>
                          <option value="Dibatalkan">❌ Dibatalkan</option>
                        </select>
                      </div>
                    </div>

                    {/* Order content detail */}
                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Products list */}
                      <div className="space-y-3 col-span-2">
                        <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">Daftar Barang Belanja</span>
                        <div className="space-y-3 divide-y divide-gray-50">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="pt-2 first:pt-0 flex items-center space-x-3">
                              <img
                                src={item.image || undefined}
                                alt={item.name}
                                className="w-10 h-10 rounded-lg object-cover bg-gray-50 border border-gray-100 shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <span className="text-sm font-semibold text-gray-800 block line-clamp-1">{item.name}</span>
                                <span className="text-xs text-gray-500 font-light">
                                  {item.quantity} x {formatRupiah(item.price)}
                                </span>
                              </div>
                              <span className="text-sm font-extrabold text-gray-900">
                                {formatRupiah(item.price * item.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="border-t border-dashed border-gray-100 pt-3 flex justify-between text-xs text-gray-500">
                          <span>Ongkos Kirim ({order.courier}):</span>
                          <span>{formatRupiah(order.shippingFee)}</span>
                        </div>
                        <div className="flex justify-between font-extrabold text-sm text-gray-900">
                          <span>Total Tagihan Pembayaran:</span>
                          <span className="text-emerald-600">{formatRupiah(order.total)}</span>
                        </div>
                      </div>

                      {/* Customer contact card */}
                      <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 space-y-3 text-xs leading-relaxed text-gray-600">
                        <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">Informasi Pembeli</span>
                        <div>
                          <strong className="text-gray-800 block">Nama Lengkap:</strong>
                          <span>{order.customerName}</span>
                        </div>
                        <div>
                          <strong className="text-gray-800 block">Nomor WA:</strong>
                          <span className="font-mono">{order.customerPhone}</span>
                        </div>
                        <div>
                          <strong className="text-gray-800 block">Alamat Kirim:</strong>
                          <span className="line-clamp-2">{order.customerAddress}</span>
                        </div>
                        <div>
                          <strong className="text-gray-800 block">Metode Bayar:</strong>
                          <span>{order.paymentMethod}</span>
                        </div>
                        {order.notes && (
                          <div className="bg-white p-2 rounded-lg border border-gray-100 italic">
                            <strong>Catatan:</strong> "{order.notes}"
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Operational Actions */}
                    <div className="px-6 py-4 bg-gray-50/30 border-t border-gray-100 flex flex-wrap gap-3 justify-end">
                      <button
                        onClick={() => setEditingOrder(order)}
                        className="bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold px-4 py-2 rounded-xl flex items-center space-x-1.5 cursor-pointer border border-amber-100/50 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                        <span>Edit Pesanan</span>
                      </button>

                      <button
                        onClick={() => handleSendWhatsAppNotification(order)}
                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold px-4 py-2 rounded-xl flex items-center space-x-1.5 cursor-pointer border border-emerald-100/50 transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Kirim WA Konfirmasi</span>
                      </button>

                      <button
                        onClick={() => onPrintOrderInvoice(order)}
                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold px-4 py-2 rounded-xl flex items-center space-x-1.5 cursor-pointer border border-indigo-100/50 transition-colors"
                      >
                        <Printer className="w-4 h-4" />
                        <span>Cetak Invoice A6</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="font-bold text-gray-800 text-sm">Belum Ada Pesanan Masuk</h3>
                <p className="text-xs text-gray-400 max-w-xs mx-auto mt-1">
                  Saat ini belum ada data pesanan baru dari pelanggan yang masuk ke rekapitulasi database online.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ==================== SUB-VIEW 6: TRANSACTION HISTORY ==================== */}
        {subTab === 'transaction_history' && (
          <div className="space-y-6">
            <div className="pb-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Riwayat Histori Transaksi</h1>
                <p className="text-xs text-gray-500 mt-1">Lihat riwayat pembelian dengan mudah yang bisa diekspor dalam format Excel atau PDF.</p>
              </div>
              
              {/* Export Controls buttons */}
              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <button
                  onClick={handleExportExcel}
                  className="bg-white hover:bg-gray-50 text-gray-700 font-bold text-xs px-4 py-2.5 rounded-xl border border-gray-200 flex items-center space-x-1.5 cursor-pointer shadow-xs shrink-0"
                >
                  <Download className="w-4 h-4 text-emerald-600" />
                  <span>Ekspor Excel (.csv)</span>
                </button>
                <button
                  onClick={handleExportPDF}
                  className="bg-white hover:bg-gray-50 text-gray-700 font-bold text-xs px-4 py-2.5 rounded-xl border border-gray-200 flex items-center space-x-1.5 cursor-pointer shadow-xs shrink-0"
                >
                  <Printer className="w-4 h-4 text-indigo-600" />
                  <span>Cetak PDF Laporan</span>
                </button>
              </div>
            </div>

            {/* List History Table */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm text-gray-700">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase">
                      <th className="p-4 w-32">Invoice</th>
                      <th className="p-4">Pelanggan</th>
                      <th className="p-4">Metode Bayar</th>
                      <th className="p-4">Tanggal</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Total Transaksi</th>
                      <th className="p-4 text-center w-28">Kelola</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-xs sm:text-sm">
                    {orders.map(order => (
                      <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4 font-extrabold text-gray-900">{order.invoiceNumber}</td>
                        <td className="p-4">
                          <div className="space-y-0.5">
                            <span className="font-bold block">{order.customerName}</span>
                            <span className="text-xs font-mono text-gray-400">{order.customerPhone}</span>
                          </div>
                        </td>
                        <td className="p-4">{order.paymentMethod}</td>
                        <td className="p-4 text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="p-4">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                            order.status === 'Selesai' ? 'bg-emerald-100 text-emerald-800' :
                            order.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                            order.status === 'Dibatalkan' ? 'bg-rose-100 text-rose-800' : 'bg-indigo-100 text-indigo-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="p-4 font-extrabold text-right text-emerald-600">{formatRupiah(order.total)}</td>
                        <td className="p-4">
                          <div className="flex items-center justify-center space-x-1">
                            <button
                              onClick={() => onPrintOrderInvoice(order)}
                              className="p-1.5 hover:bg-gray-50 text-gray-400 hover:text-emerald-600 rounded-lg cursor-pointer"
                              title="Cetak Invoice"
                            >
                              <Printer className="w-4 h-4 text-emerald-600" />
                            </button>
                            <button
                              onClick={() => setEditingOrder(order)}
                              className="p-1.5 hover:bg-gray-50 text-gray-400 hover:text-emerald-600 rounded-lg cursor-pointer"
                              title="Edit Transaksi"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteOrder(order.id)}
                              className="p-1.5 hover:bg-rose-50 text-gray-400 hover:text-rose-600 rounded-lg cursor-pointer"
                              title="Hapus Transaksi"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* GLOBAL EDIT PESANAN MODAL */}
        {editingOrder && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
            <div className="bg-white p-6 rounded-2xl max-w-xl w-full space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto border border-gray-100">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <h3 className="text-base font-black text-gray-900 flex items-center space-x-2 uppercase tracking-tight">
                  <Edit2 className="w-5 h-5 text-amber-500" />
                  <span>Ubah Data Pesanan: {editingOrder.invoiceNumber}</span>
                </h3>
                <button
                  onClick={() => setEditingOrder(null)}
                  className="text-gray-400 hover:text-gray-600 p-1 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEditOrder} className="space-y-5 text-xs">
                {/* Customer Information Section */}
                <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-150 space-y-3">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Informasi Utama Pelanggan</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-gray-700">Nama Lengkap *</label>
                      <input
                        type="text"
                        required
                        value={editingOrder.customerName}
                        onChange={(e) => setEditingOrder({ ...editingOrder, customerName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-hidden focus:border-amber-500 bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-gray-700">Nomor WhatsApp *</label>
                      <input
                        type="text"
                        required
                        value={editingOrder.customerPhone}
                        onChange={(e) => setEditingOrder({ ...editingOrder, customerPhone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-hidden focus:border-amber-500 bg-white font-mono"
                      />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label className="font-bold text-gray-700">Alamat Lengkap Pengiriman *</label>
                      <textarea
                        rows={2}
                        required
                        value={editingOrder.customerAddress}
                        onChange={(e) => setEditingOrder({ ...editingOrder, customerAddress: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-hidden focus:border-amber-500 bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-gray-700">Pilihan Kurir/Ekspedisi *</label>
                      <select
                        value={editingOrder.courier}
                        onChange={(e) => setEditingOrder({ ...editingOrder, courier: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-hidden focus:border-amber-500 bg-white font-medium"
                      >
                        <option value="-">- (Tanpa Kurir / Kosong)</option>
                        <option value="J&T Express">J&T Express (Regular)</option>
                        <option value="JNE Reguler">JNE (Reguler)</option>
                        <option value="Sicepat Reguler">Sicepat (Reguler)</option>
                        <option value="GoSend">GoSend (Instant / Jabodetabek)</option>
                        <option value="GrabExpress">GrabExpress (Instant / Jabodetabek)</option>
                        <option value="Cash On Delivery (COD)">COD (Ambil Sendiri / Bayar di Tempat)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-gray-700">Metode Pembayaran *</label>
                      <input
                        type="text"
                        required
                        value={editingOrder.paymentMethod}
                        onChange={(e) => setEditingOrder({ ...editingOrder, paymentMethod: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-hidden focus:border-amber-500 bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Order Items Section */}
                <div className="space-y-2.5">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Daftar Barang Belanja ({editingOrder.items.length})</span>
                  <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                    {editingOrder.items.map((item, idx) => (
                      <div key={idx} className="flex items-center space-x-3 p-3 bg-white border border-gray-150 rounded-xl shadow-xs relative">
                        <img
                          src={item.image || undefined}
                          alt={item.name}
                          className="w-10 h-10 rounded-lg object-cover bg-gray-50 border border-gray-100 shrink-0"
                        />
                        <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                          <div className="sm:col-span-5">
                            <span className="font-semibold text-gray-800 block truncate" title={item.name}>{item.name}</span>
                          </div>
                          <div className="sm:col-span-3 flex items-center space-x-1">
                            <span className="text-[10px] text-gray-400">Qty:</span>
                            <input
                              type="number"
                              min={1}
                              required
                              value={item.quantity}
                              onChange={(e) => handleEditOrderItemChange(idx, 'quantity', Math.max(1, Number(e.target.value)))}
                              className="w-14 px-2 py-1 border border-gray-200 rounded-lg text-center font-bold focus:outline-hidden focus:border-amber-500"
                            />
                          </div>
                          <div className="sm:col-span-4 flex items-center space-x-1">
                            <span className="text-[10px] text-gray-400">Rp:</span>
                            <input
                              type="number"
                              min={0}
                              required
                              value={item.price}
                              onChange={(e) => handleEditOrderItemChange(idx, 'price', Math.max(0, Number(e.target.value)))}
                              className="w-full px-2 py-1 border border-gray-200 rounded-lg font-mono focus:outline-hidden focus:border-amber-500"
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveOrderItem(idx)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                          title="Hapus Barang"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional Notes */}
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Catatan Khusus (Notes)</label>
                  <input
                    type="text"
                    placeholder="Misal: Warna merah, ukuran L, dll."
                    value={editingOrder.notes || ''}
                    onChange={(e) => setEditingOrder({ ...editingOrder, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-hidden focus:border-amber-500 bg-white"
                  />
                </div>

                {/* Pricing calculations section */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-150 space-y-2">
                  <div className="flex justify-between font-bold text-gray-600">
                    <span>Subtotal (Otomatis):</span>
                    <span>{formatRupiah(editingOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center font-bold text-gray-600">
                    <span>Ongkos Kirim:</span>
                    <div className="flex items-center space-x-1">
                      <span className="text-gray-400 font-mono">Rp</span>
                      <input
                        type="number"
                        min={0}
                        required
                        value={editingOrder.shippingFee}
                        onChange={(e) => {
                          const fee = Number(e.target.value);
                          setEditingOrder({ ...editingOrder, shippingFee: fee, total: editingOrder.subtotal + fee });
                        }}
                        className="w-24 px-2 py-1 border border-gray-200 rounded-lg font-mono text-right focus:outline-hidden focus:border-amber-500"
                      />
                    </div>
                  </div>
                  <div className="border-t border-dashed border-gray-200 pt-2 flex justify-between font-extrabold text-sm text-gray-900">
                    <span>Total Pembayaran Akhir:</span>
                    <span className="text-emerald-600 font-black">{formatRupiah(editingOrder.total)}</span>
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex space-x-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setEditingOrder(null)}
                    className="flex-1 py-2.5 bg-gray-50 text-gray-600 border border-gray-200 font-semibold rounded-xl transition-colors cursor-pointer hover:bg-gray-100"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center space-x-1"
                  >
                    <Check className="w-4 h-4" />
                    <span>Simpan Perubahan Pesanan</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ==================== SUB-VIEW 7: ADMIN USER ACCOUNTS ==================== */}
        {subTab === 'user_accounts' && currentUser?.role === 'Super Admin' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <div>
                <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Manajemen Akun Pengguna Aman</h1>
                <p className="text-xs text-gray-500 mt-1">Daftar staf dan admin dengan hak akses terverifikasi ke portal.</p>
              </div>
              <button
                onClick={() => setShowAddUser(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-1.5 shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Akun</span>
              </button>
            </div>

            {/* List Admins Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {adminUsers.map(user => (
                <div key={user.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs flex flex-col justify-between space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm uppercase">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 text-sm">{user.name}</h4>
                      <span className="text-[10px] text-gray-400 font-mono">@{user.username}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full uppercase">
                      {user.role}
                    </span>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingUser(user)}
                        className="p-1.5 hover:bg-gray-50 text-gray-400 hover:text-emerald-600 rounded-lg cursor-pointer"
                        title="Edit Akun"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={currentUser?.id === user.id}
                        className={`p-1.5 rounded-lg cursor-pointer ${
                          currentUser?.id === user.id ? 'opacity-30 text-gray-300' : 'hover:bg-rose-50 text-gray-400 hover:text-rose-600'
                        }`}
                        title="Hapus Akun"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ADD USER MODAL */}
            {showAddUser && (
              <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
                <div className="bg-white p-6 rounded-2xl max-w-sm w-full space-y-4 shadow-xl">
                  <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">Buat Akun Staf Baru</h3>
                  <form onSubmit={handleAddUser} className="space-y-4 text-sm">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700">Nama Lengkap *</label>
                      <input
                        type="text"
                        required
                        value={newUser.name}
                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-hidden"
                        placeholder="Budi Santoso"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700">Username *</label>
                      <input
                        type="text"
                        required
                        value={newUser.username}
                        onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-hidden"
                        placeholder="staffbudi"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700">Password Keamanan *</label>
                      <input
                        type="password"
                        required
                        value={newUser.passwordHash}
                        onChange={(e) => setNewUser({ ...newUser, passwordHash: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-hidden"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700">Hak Akses Sistem</label>
                      <select
                        value={newUser.role}
                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value as 'Super Admin' | 'Staff' })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-hidden bg-white"
                      >
                        <option value="Staff">Staff (Akses Terbatas)</option>
                        <option value="Super Admin">Super Admin (Akses Penuh)</option>
                      </select>
                    </div>

                    <div className="flex space-x-3 pt-3 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => setShowAddUser(false)}
                        className="flex-1 py-2 bg-gray-50 text-gray-600 border border-gray-200 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                      >
                        Buat Akun
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* EDIT USER MODAL */}
            {editingUser && (
              <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
                <div className="bg-white p-6 rounded-2xl max-w-sm w-full space-y-4 shadow-xl">
                  <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">Ubah Data Akun Admin</h3>
                  <form onSubmit={handleSaveEditUser} className="space-y-4 text-sm">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700">Nama Lengkap *</label>
                      <input
                        type="text"
                        required
                        value={editingUser.name}
                        onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-hidden"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700">Username *</label>
                      <input
                        type="text"
                        required
                        value={editingUser.username}
                        onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-hidden"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700">Password Baru *</label>
                      <input
                        type="password"
                        required
                        value={editingUser.passwordHash}
                        onChange={(e) => setEditingUser({ ...editingUser, passwordHash: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-hidden"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700">Hak Akses Sistem</label>
                      <select
                        value={editingUser.role}
                        onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as 'Super Admin' | 'Staff' })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-hidden bg-white"
                        disabled={currentUser?.id === editingUser.id}
                      >
                        <option value="Staff">Staff (Akses Terbatas)</option>
                        <option value="Super Admin">Super Admin (Akses Penuh)</option>
                      </select>
                    </div>

                    <div className="flex space-x-3 pt-3 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => setEditingUser(null)}
                        className="flex-1 py-2 bg-gray-50 text-gray-600 border border-gray-200 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                      >
                        Simpan Perubahan
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        )}
      </main>

      {/* Global Delete Confirmation Modal */}
      {deleteConfirmation.isOpen && (
        <div className="fixed inset-0 bg-black/60 z-55 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white p-6 rounded-2xl max-w-sm w-full space-y-4 shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="bg-rose-50 p-2 rounded-xl">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-gray-900">
                {deleteConfirmation.title}
              </h3>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              {deleteConfirmation.message}
            </p>
            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmation({ isOpen: false, type: 'banner', id: '', title: '', message: '' })}
                className="flex-1 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
