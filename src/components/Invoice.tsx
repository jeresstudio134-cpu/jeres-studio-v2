/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Printer, Download, Sparkles } from 'lucide-react';
import { Order, ShopConfig } from '../types.ts';

interface InvoiceProps {
  order: Order | null;
  shopConfig: ShopConfig;
  onClose: () => void;
}

export default function Invoice({ order, shopConfig, onClose }: InvoiceProps) {
  if (!order) return null;

  // Detect if running inside iframe (AI Studio Preview)
  const isInIframe = React.useMemo(() => {
    try {
      return window.self !== window.top;
    } catch (e) {
      return true;
    }
  }, []);

  // Format IDR Price
  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(order.createdAt).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div id="invoice-modal-backdrop" className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div id="invoice-modal" className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-emerald-600 animate-pulse" />
            <span className="font-bold text-gray-900 text-sm">Invoice Otomatis A6 Siap</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isInIframe && (
          <div className="mx-6 mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start space-x-2 shadow-xs">
            <div className="bg-amber-100 p-1 rounded-md shrink-0 mt-0.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
            </div>
            <div className="space-y-1">
              <span className="font-extrabold text-amber-950 block text-[11px]">Informasi Cetak Jendela Preview</span>
              <p className="leading-relaxed text-[10px] font-medium text-amber-800">
                Browser membatasi fitur cetak langsung (<code className="font-mono bg-amber-100/60 px-1 py-0.5 rounded-xs">window.print()</code>) di dalam jendela preview AI Studio (iframe) demi keamanan.
              </p>
              <strong className="block text-[10px] text-amber-950 font-extrabold leading-normal">
                Tenang! Anda tidak perlu mendeploy aplikasi ini terlebih dahulu. Cukup klik tombol "Buka di Tab Baru" di pojok kanan atas preview browser Anda, lalu coba klik tombol "Cetak Invoice A6" lagi di tab baru tersebut. Tombol cetak akan langsung berfungsi 100%!
              </strong>
            </div>
          </div>
        )}

        {/* Modal Body: A6 Thermal Styling Preview */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-100/50 flex justify-center items-start">
          
          {/* Printable Element Frame */}
          <div
            id="a6-printable-invoice"
            className="bg-white p-6 shadow-md border border-gray-200 border-dashed rounded-lg w-full max-w-[420px] text-gray-800 my-2"
          >
            {/* Invoice Header (Dua kolom seperti Gambar 2) */}
            <div className="grid grid-cols-12 gap-2 pb-3 border-b-2 border-black items-start text-[11px] text-black">
              {/* Kolom Kiri: Informasi Toko */}
              <div className="col-span-7 space-y-0.5">
                <div className="font-extrabold text-sm uppercase text-black">Turen Malang</div>
                <div><span className="font-semibold">Gmail:</span> jeresstudio134@gmail.com</div>
                <div><span className="font-semibold">WA:</span> 089685640976</div>
                <div><span className="font-semibold">Dana:</span> 089685640976 a/n Mohammad Miftah</div>
                <div className="pt-1 text-[10px] italic font-bold text-gray-900 leading-tight">
                  Graphic Design, Banner, Percetakan, Stiker Cutting, Apparel dll.
                </div>
              </div>

              {/* Kolom Kanan: Logo Racing/Sports & Sosial Media */}
              <div className="col-span-5 flex flex-col items-end space-y-2">
                {/* Logo Jeres Studio Design - Matches Landing Page / Shop Logo */}
                {shopConfig.logoUrl && !shopConfig.logoUrl.includes('unsplash.com') ? (
                  <img
                    src={shopConfig.logoUrl}
                    alt={shopConfig.name}
                    className="h-18 w-auto max-w-[160px] rounded-lg object-contain"
                  />
                ) : (
                  <div className="relative inline-flex flex-col items-center justify-center px-4 py-2.5 bg-white border border-gray-200 rounded-xl shadow-xs transform -skew-x-3 select-none shrink-0 print:border-black">
                    <span className="text-[17px] italic font-black text-amber-500 tracking-tight leading-none drop-shadow-[0_0.5px_0_rgba(0,0,0,0.05)]">JERE'S</span>
                    <span className="text-[11px] italic font-extrabold text-pink-500 tracking-widest leading-none mt-1.5 uppercase">STUDIO</span>
                    <div className="bg-cyan-500 text-white text-[8.5px] font-black px-2.5 py-0.5 rounded-xs uppercase tracking-widest leading-none mt-1.5 print:bg-black">
                      DESIGN
                    </div>
                  </div>
                )}

                {/* Sosial Media Stack */}
                <div className="space-y-0.5 text-[8px] text-right font-medium">
                  <div className="flex items-center justify-end space-x-1">
                    <svg className="w-2 h-2 text-black" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.59 4.23.95 1.2 2.27 2.04 3.74 2.41V10.7c-1.24-.07-2.45-.51-3.48-1.29-.62-.47-1.15-1.07-1.55-1.77-.04 1.49-.02 2.98-.03 4.47-.04 2.22-.59 4.45-1.73 6.31-1.25 2.05-3.32 3.51-5.65 3.94-1.99.38-4.09.11-5.91-.77-1.82-.87-3.33-2.43-4.14-4.32-.86-2-1.01-4.27-.41-6.38.58-2.03 1.94-3.83 3.76-4.94 1.76-1.08 3.88-1.51 5.92-1.21 1.26.18 2.47.69 3.49 1.49v4.29c-.73-.55-1.61-.87-2.53-.94-.96-.08-1.94.13-2.8.59-.83.44-1.49 1.15-1.88 2.01-.4.86-.5 1.84-.28 2.78.21.94.72 1.78 1.44 2.41.74.64 1.69.99 2.67.99 1.05-.01 2.07-.42 2.82-1.15.82-.79 1.24-1.91 1.24-3.03V.02z"/>
                    </svg>
                    <span className="font-semibold text-black">JERESSTUDIO</span>
                  </div>
                  <div className="flex items-center justify-end space-x-1">
                    <svg className="w-2 h-2 text-black" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                    <span className="font-semibold text-black">JERESSTUDIO</span>
                  </div>
                  <div className="flex items-center justify-end space-x-1">
                    <svg className="w-2 h-2 text-black" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11C4.483 20.455 12 20.455 12 20.455s7.517 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                    <span className="font-semibold text-black">JERES STUDIO</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Baris Meta Invoice (Bold & Italic) */}
            <div className="flex justify-between items-start py-2 text-[11px] text-black italic font-extrabold tracking-tight border-b-2 border-black">
              <div className="space-y-0.5">
                <div>{order.invoiceNumber}</div>
                <div className="text-[10px] font-bold">Kurir/Kirim: <span className="font-black uppercase">{order.courier || '-'}</span></div>
              </div>
              <div className="text-right text-[10px] space-y-0.5">
                <div>Customer : <span className="font-black">{order.customerName}</span></div>
                <div>Tgl order : {formattedDate}</div>
              </div>
            </div>

            {/* Tabel Item Pembelian dengan Grid Garis Penuh & Header Biru Muda */}
            <div className="mt-2.5">
              <table className="w-full border-collapse border border-black text-black">
                <thead>
                  <tr className="bg-[#c2dbff] border-b border-black text-[11px] font-bold">
                    <th className="border-r border-black p-1 text-center w-8">No</th>
                    <th className="border-r border-black p-1 text-left">Item</th>
                    <th className="border-r border-black p-1 text-center w-10">Qty</th>
                    <th className="border-r border-black p-1 text-right w-20">Harga</th>
                    <th className="p-1 text-right w-24">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Item Riil */}
                  {order.items.map((item, index) => (
                    <tr key={index} className="border-b border-black text-[10px] leading-tight">
                      <td className="border-r border-black p-1 text-center">{index + 1}</td>
                      <td className="border-r border-black p-1 font-semibold">{item.name}</td>
                      <td className="border-r border-black p-1 text-center">{item.quantity}</td>
                      <td className="border-r border-black p-1 text-right">Rp{formatRupiah(item.price).replace('Rp\u00a0', '').replace('Rp', '')}</td>
                      <td className="p-1 text-right">Rp{formatRupiah(item.price * item.quantity).replace('Rp\u00a0', '').replace('Rp', '')}</td>
                    </tr>
                  ))}
                  {/* Mengisi baris kosong agar minimal 4 baris seperti nota manual */}
                  {Array.from({ length: Math.max(0, 4 - order.items.length) }).map((_, i) => (
                    <tr key={`empty-${i}`} className="border-b border-black text-[10px] h-5">
                      <td className="border-r border-black p-1"></td>
                      <td className="border-r border-black p-1"></td>
                      <td className="border-r border-black p-1"></td>
                      <td className="border-r border-black p-1"></td>
                      <td className="p-1"></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Rincian Pembayaran (Kiri Kotak Keterangan, Kanan Rincian Total) */}
            <div className="grid grid-cols-12 gap-3 mt-2.5 text-black text-[11px] items-start">
              {/* Kolom Kiri: Kotak Keterangan */}
              <div className="col-span-6">
                <div className="border border-black p-1.5 rounded-xs h-20 print:h-18 flex flex-col justify-between">
                  <div className="font-extrabold italic mb-0.5 text-[9px]">Keterangan:</div>
                  <div className="text-[9px] leading-tight line-clamp-4 font-medium flex-1 overflow-y-auto">
                    {order.notes || "Mohon periksa barang belanjaan Anda setelah serah terima."}
                  </div>
                </div>
              </div>

              {/* Kolom Kanan: Perincian Grand Total */}
              <div className="col-span-6 space-y-1 text-right text-[10px]">
                <div className="flex justify-between font-bold">
                  <span>Subtotal</span>
                  <span>{formatRupiah(order.subtotal || (order.total - (order.shippingFee || 0)))}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Ongkir</span>
                  <span>{formatRupiah(order.shippingFee || 0)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Diskon</span>
                  <span>Rp0</span>
                </div>
                <div className="flex justify-between font-extrabold border-t border-black pt-1">
                  <span>GrandTotal</span>
                  <span>{formatRupiah(order.total)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Bayar</span>
                  <span>{formatRupiah(order.total)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Kekurangan</span>
                  <span>Rp0</span>
                </div>
                <div className="flex justify-between font-extrabold border-t border-black pt-0.5 text-[11px]">
                  <span>Status</span>
                  <span className="text-black uppercase font-black">
                    {order.status === 'Selesai' ? 'Lunas' : 'Belum Lunas'}
                  </span>
                </div>
              </div>
            </div>

            {/* Perhatian di bagian bawah (Kotak Border Merah, Italic) */}
            <div className="border border-red-500 bg-red-50/50 p-1.5 text-center mt-2.5 print:mt-1.5 text-[9px] font-bold text-red-600 italic">
              Perhatian: Mohon periksa kembali pesanan Anda sebelum meninggalkan tempat.
            </div>
          </div>

        </div>

        {/* Modal Actions */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-white hover:bg-gray-100 text-gray-700 font-semibold border border-gray-200 rounded-xl text-xs transition-colors cursor-pointer"
          >
            Tutup
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 shadow-sm cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Invoice A6</span>
          </button>
        </div>
      </div>
    </div>
  );
}
