/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, Send, CreditCard, Truck, User, MapPin, FileText } from 'lucide-react';
import { CartItem, ShopConfig, Product, Order } from '../types.ts';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  shopConfig: ShopConfig;
  onCheckout: (orderDetails: Omit<Order, 'id' | 'invoiceNumber' | 'createdAt' | 'status'>) => void;
}

export default function Cart({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  shopConfig,
  onCheckout,
}: CartProps) {
  const [step, setStep] = React.useState<'cart' | 'checkout'>('cart');
  
  // Checkout Form States
  const [name, setName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [courier, setCourier] = React.useState('-');
  const [paymentMethod, setPaymentMethod] = React.useState('Transfer Bank Mandiri');
  const [notes, setNotes] = React.useState('');
  const [formErrors, setFormErrors] = React.useState<{ [key: string]: string }>({});

  if (!isOpen) return null;

  // Pricing calculations
  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const shippingFee = (subtotal > 0 && courier !== '-' && courier !== 'Cash On Delivery (COD)') ? 25000 : 0;
  const total = subtotal + shippingFee;

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const handleNextStep = () => {
    if (cartItems.length === 0) return;
    setStep('checkout');
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    if (!name.trim()) errors.name = 'Nama lengkap wajib diisi.';
    if (!phone.trim()) {
      errors.phone = 'Nomor WhatsApp wajib diisi.';
    } else if (!/^\d{9,15}$/.test(phone.replace(/[^0-9]/g, ''))) {
      errors.phone = 'Masukkan nomor WhatsApp yang valid (9-15 digit).';
    }
    if (!address.trim()) errors.address = 'Alamat lengkap wajib diisi.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Package order data
    const orderItems = cartItems.map(item => ({
      productId: item.product.id,
      name: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
      image: item.product.images[0] || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=150&h=150&fit=crop&q=80',
    }));

    // Trigger parent app action to log checkout & reduce stock
    onCheckout({
      customerName: name,
      customerPhone: phone,
      customerAddress: address,
      items: orderItems,
      subtotal,
      shippingFee,
      total,
      courier,
      paymentMethod,
      notes,
    });

    // Generate WhatsApp Text message
    const formattedInvoice = `*PESANAN BARU - ${shopConfig.name}*
----------------------------------------
Halo Admin *${shopConfig.name}*, saya ingin melakukan pemesanan produk berikut:

*Detail Belanja:*
${cartItems.map((item, index) => `${index + 1}. *${item.product.name}*
   » Jumlah: ${item.quantity} x ${formatRupiah(item.product.price)}
   » Subtotal: *${formatRupiah(item.product.price * item.quantity)}*`).join('\n\n')}

----------------------------------------
*Subtotal:* ${formatRupiah(subtotal)}
*Ongkos Kirim:* ${formatRupiah(shippingFee)}
*Total Pembayaran:* *${formatRupiah(total)}*

*Data Pengiriman & Pelanggan:*
👤 *Nama:* ${name}
📞 *No. WhatsApp:* ${phone}
🚚 *Kurir:* ${courier}
💳 *Metode Pembayaran:* ${paymentMethod}
📍 *Alamat Lengkap:* ${address}
📝 *Catatan Tambahan:* ${notes || '-'}

----------------------------------------
Mohon segera diproses dan diinformasikan nomor rekening pembayarannya ya min. Terima kasih!`;

    // Format WA link (using standard formatting)
    const cleanPhone = shopConfig.whatsappNumber.replace(/[^0-9]/g, '');
    const waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(formattedInvoice)}`;
    
    // Open WhatsApp in a new tab
    window.open(waUrl, '_blank', 'referrerPolicy=no-referrer');

    // Reset checkout form and close cart
    setName('');
    setPhone('');
    setAddress('');
    setNotes('');
    setStep('cart');
  };

  return (
    <div id="cart-sidebar-backdrop" className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
      {/* Drawer Container */}
      <div id="cart-sidebar-drawer" className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-left relative">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <ShoppingBag className="w-5.5 h-5.5 text-emerald-600" />
            <h2 className="text-lg font-bold text-gray-900">
              {step === 'cart' ? 'Keranjang Belanja' : 'Detail Checkout'}
            </h2>
            <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {cartItems.length} Item
            </span>
          </div>
          <button
            id="close-cart-button"
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors cursor-pointer"
          >
            <X className="w-5.5 h-5.5" />
          </button>
        </div>

        {/* Dynamic Step Content */}
        {step === 'cart' ? (
          /* STEP 1: CART LIST */
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cartItems.length > 0 ? (
              <>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Daftar Belanja</span>
                  <button
                    id="clear-cart-button"
                    onClick={onClearCart}
                    className="text-xs text-rose-600 hover:text-rose-700 hover:underline flex items-center space-x-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Kosongkan</span>
                  </button>
                </div>

                <div className="space-y-4 divide-y divide-gray-50">
                  {cartItems.map(item => (
                    <div key={item.product.id} className="pt-4 first:pt-0 flex space-x-4 items-start">
                      {/* Product Image */}
                      <img
                        src={item.product.images[0] || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=100&h=100&fit=crop&q=80'}
                        alt={item.product.name}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-xl object-cover bg-gray-50 border border-gray-100 shrink-0"
                      />
                      
                      {/* Name and actions */}
                      <div className="flex-1 space-y-1">
                        <h4 className="text-sm font-semibold text-gray-900 line-clamp-1">{item.product.name}</h4>
                        <div className="text-sm font-bold text-emerald-600">
                          {formatRupiah(item.product.price)}
                        </div>
                        
                        {/* Quantity adjuster */}
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                            <button
                              onClick={() => onUpdateQuantity(item.product.id, -1)}
                              className="p-1 rounded-md text-gray-600 hover:bg-white active:bg-gray-100 transition-colors cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold text-gray-800 px-2.5">{item.quantity}</span>
                            <button
                              onClick={() => onUpdateQuantity(item.product.id, 1)}
                              disabled={item.quantity >= item.product.stock}
                              className={`p-1 rounded-md text-gray-600 hover:bg-white active:bg-gray-100 transition-colors cursor-pointer ${
                                item.quantity >= item.product.stock ? 'opacity-40 cursor-not-allowed' : ''
                              }`}
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            onClick={() => onRemoveItem(item.product.id)}
                            className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                            aria-label="Hapus Item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-gray-800 text-base">Keranjang Anda Kosong</h3>
                  <p className="text-xs text-gray-500 max-w-xs mx-auto">
                    Koleksi produk berkualitas kami sedang menanti Anda. Tambahkan produk ke keranjang untuk memesan.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-xs cursor-pointer"
                >
                  Mulai Belanja
                </button>
              </div>
            )}
          </div>
        ) : (
          /* STEP 2: CHECKOUT FORM */
          <form id="checkout-form" onSubmit={handleSubmitCheckout} className="flex-1 overflow-y-auto p-6 space-y-5">
            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 flex items-start space-x-3">
              <Truck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-800 space-y-1">
                <span className="font-bold block">Pesanan Terintegrasi WhatsApp API</span>
                <p className="leading-relaxed text-emerald-700">
                  Setelah menekan tombol kirim, Anda akan diarahkan ke WhatsApp untuk mengirimkan rincian invoice pemesanan langsung ke admin.
                </p>
              </div>
            </div>

            {/* Input fields */}
            <div className="space-y-4">
              {/* Nama Lengkap */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  <span>Nama Lengkap Pelanggan *</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Muhammad Miftah"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 ${
                    formErrors.name ? 'border-rose-400 focus:border-rose-500' : 'border-gray-200 focus:border-emerald-500'
                  }`}
                />
                {formErrors.name && <p className="text-[10px] text-rose-500 font-semibold">{formErrors.name}</p>}
              </div>

              {/* Nomor WhatsApp */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 flex items-center space-x-1.5">
                  <Send className="w-3.5 h-3.5 text-gray-400" />
                  <span>Nomor WhatsApp Aktif *</span>
                </label>
                <input
                  type="tel"
                  placeholder="Contoh: 081234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 ${
                    formErrors.phone ? 'border-rose-400 focus:border-rose-500' : 'border-gray-200 focus:border-emerald-500'
                  }`}
                />
                <span className="text-[10px] text-gray-400 block font-light leading-relaxed">
                  Gunakan nomor WhatsApp aktif Anda untuk konfirmasi pemesanan dari admin.
                </span>
                {formErrors.phone && <p className="text-[10px] text-rose-500 font-semibold">{formErrors.phone}</p>}
              </div>

              {/* Alamat Pengiriman */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  <span>Alamat Lengkap Pengiriman *</span>
                </label>
                <textarea
                  placeholder="Tuliskan nama jalan, nomor rumah, RT/RW, kecamatan, kota/kabupaten, dan kode pos"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 ${
                    formErrors.address ? 'border-rose-400 focus:border-rose-500' : 'border-gray-200 focus:border-emerald-500'
                  }`}
                />
                {formErrors.address && <p className="text-[10px] text-rose-500 font-semibold">{formErrors.address}</p>}
              </div>

              {/* Kurir Pengiriman */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 flex items-center space-x-1.5">
                  <Truck className="w-3.5 h-3.5 text-gray-400" />
                  <span>Pilihan Jasa Kurir</span>
                </label>
                <select
                  value={courier}
                  onChange={(e) => setCourier(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:border-emerald-500 bg-white"
                >
                  <option value="-">- (Tanpa Kurir / Kosong)</option>
                  <option value="J&T Express">J&T Express (Regular)</option>
                  <option value="JNE Reguler">JNE (Reguler)</option>
                  <option value="Sicepat Reguler">Sicepat (Reguler)</option>
                  <option value="GoSend Instant">GoSend (Instant / Jabodetabek)</option>
                  <option value="GrabExpress Instant">GrabExpress (Instant / Jabodetabek)</option>
                  <option value="Cash On Delivery (COD)">COD (Ambil Sendiri / Bayar di Tempat)</option>
                </select>
              </div>

              {/* Metode Pembayaran */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 flex items-center space-x-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                  <span>Metode Pembayaran Transfer</span>
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:border-emerald-500 bg-white"
                >
                  <option value="Transfer Bank Mandiri">Transfer Bank Mandiri (123-00-112233-4)</option>
                  <option value="Transfer Bank BCA">Transfer Bank BCA (884-9128-444)</option>
                  <option value="Transfer Bank BRI">Transfer Bank BRI (0012-01-000456-30-2)</option>
                  <option value="QRIS / E-Wallet (GoPay/OVO/Dana)">QRIS / E-Wallet (Otomatis)</option>
                  <option value="Cash On Delivery (COD)">Cash On Delivery (COD / Bayar Saat Terima)</option>
                </select>
              </div>

              {/* Catatan Tambahan */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 flex items-center space-x-1.5">
                  <FileText className="w-3.5 h-3.5 text-gray-400" />
                  <span>Catatan Khusus (Opsional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Warna hitam, kirim setelah jam kerja, dll"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>
          </form>
        )}

        {/* Footer Billing Breakdown and Actions */}
        {cartItems.length > 0 && (
          <div className="border-t border-gray-100 bg-gray-50/50 p-6 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Total Barang ({cartItems.length})</span>
                <span className="font-semibold text-gray-800">{formatRupiah(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Ongkos Kirim (Flat)</span>
                <span className="font-semibold text-gray-800">{formatRupiah(shippingFee)}</span>
              </div>
              <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between items-center">
                <span className="font-bold text-gray-800">Total Belanja</span>
                <span className="text-lg font-extrabold text-emerald-600">{formatRupiah(total)}</span>
              </div>
            </div>

            {/* Step triggers */}
            {step === 'cart' ? (
              <button
                id="cart-checkout-step-button"
                onClick={handleNextStep}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/10 hover:shadow-emerald-600/20 transition-all text-sm flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>Lanjut ke Checkout</span>
              </button>
            ) : (
              <div className="flex space-x-3">
                <button
                  type="button"
                  id="checkout-back-button"
                  onClick={() => setStep('cart')}
                  className="px-4 py-3.5 bg-white hover:bg-gray-100 text-gray-600 border border-gray-200 font-semibold rounded-xl text-sm transition-colors cursor-pointer"
                >
                  Kembali
                </button>
                <button
                  type="submit"
                  form="checkout-form"
                  id="checkout-submit-button"
                  className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/10 hover:shadow-emerald-600/20 transition-all text-sm flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim via WhatsApp</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
