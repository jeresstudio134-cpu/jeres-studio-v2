/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ChevronLeft, ChevronRight, ShoppingCart, Search, Filter, AlertTriangle, Sparkles, X, ZoomIn } from 'lucide-react';
import { Product } from '../types';

interface ProductsProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

// Sub-component for individual product cards with their own independent photo slider
function ProductCard({ product, onAddToCart }: { product: Product; onAddToCart: (product: Product) => void; key?: React.Key }) {
  const [imgIndex, setImgIndex] = React.useState(0);
  const [isFullscreenOpen, setIsFullscreenOpen] = React.useState(false);
  const validImages = product.images ? product.images.filter(img => img && img.trim() !== '') : [];
  const images = validImages.length > 0 ? validImages : ['https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&h=600&fit=crop&q=80'];

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImgIndex(prev => (prev - 1 + images.length) % images.length);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImgIndex(prev => (prev + 1) % images.length);
  };

  // Format price in Indonesian Rupiah
  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const isOutOfStock = product.stock <= 0;

  return (
    <div id={`product-card-${product.id}`} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col group overflow-hidden h-full">
      {/* Product Image Slider */}
      <div 
        className="relative aspect-square w-full bg-gray-50 overflow-hidden group/img cursor-pointer"
        onClick={() => setIsFullscreenOpen(true)}
        title="Klik untuk melihat detail & slide gambar produk"
      >
        <img
          src={images[imgIndex]}
          alt={`${product.name} - Gambar ${imgIndex + 1}`}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 select-none"
        />

        {/* Hover zoom icon indicator */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
          <div className="bg-black/50 text-white p-2.5 rounded-full backdrop-blur-xs">
            <ZoomIn className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Categories Tag */}
        <span className="absolute top-3 left-3 z-20 bg-black/60 backdrop-blur-xs text-white text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full">
          {product.category || 'Umum'}
        </span>

        {/* Stock Alert Tag */}
        {product.stock > 0 && product.stock <= 5 && (
          <span className="absolute top-3 right-3 z-20 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-md flex items-center space-x-1 shadow-sm">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Sisa {product.stock}</span>
          </span>
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 z-20 flex items-center justify-center backdrop-blur-xs">
            <span className="bg-rose-600 text-white text-xs font-extrabold tracking-widest uppercase px-4 py-2 rounded-lg shadow-md">
              Stok Habis
            </span>
          </div>
        )}

        {/* Sliding Buttons on hover */}
        {images.length > 1 && !isOutOfStock && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-25 bg-white/95 hover:bg-white text-gray-800 p-1.5 rounded-full shadow-md opacity-0 group-hover/img:opacity-100 transition-all duration-300 cursor-pointer focus:outline-hidden"
              aria-label="Gambar Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-25 bg-white/95 hover:bg-white text-gray-800 p-1.5 rounded-full shadow-md opacity-0 group-hover/img:opacity-100 transition-all duration-300 cursor-pointer focus:outline-hidden"
              aria-label="Gambar Selanjutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Carousel indicators */}
        {images.length > 1 && !isOutOfStock && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex space-x-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  setImgIndex(i);
                }}
                className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${
                  i === imgIndex ? 'bg-emerald-500 w-3' : 'bg-white/60 hover:bg-white'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-3.5">
        <div 
          className="space-y-1 cursor-pointer group/title"
          onClick={() => setIsFullscreenOpen(true)}
          title="Klik untuk melihat detail & deskripsi produk"
        >
          <h3 className="font-semibold text-gray-900 group-hover/title:text-emerald-600 transition-colors line-clamp-1 text-sm">
            {product.name}
          </h3>
          <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed h-7">
            {product.description}
          </p>
        </div>

        <div className="pt-1 flex items-center justify-between gap-1.5">
          <div 
            className="flex flex-col min-w-0 cursor-pointer group/price"
            onClick={() => setIsFullscreenOpen(true)}
            title="Klik untuk melihat detail & deskripsi produk"
          >
            <span className="text-[10px] text-gray-400 truncate group-hover/price:text-emerald-500 transition-colors">Harga Terbaik</span>
            <span className="text-sm sm:text-base font-extrabold text-emerald-600 truncate">
              {formatRupiah(product.price)}
            </span>
          </div>

          <button
            onClick={() => onAddToCart(product)}
            disabled={isOutOfStock}
            className={`px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg font-medium text-[11px] sm:text-xs flex items-center space-x-1 shrink-0 transition-all cursor-pointer focus:outline-hidden ${
              isOutOfStock
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-100 hover:shadow-md hover:shadow-emerald-600/10'
            }`}
          >
            <ShoppingCart className="w-3 h-3" />
            <span>{isOutOfStock ? 'Habis' : 'Beli'}</span>
          </button>
        </div>
      </div>

      {/* Product Detail Modal */}
      {isFullscreenOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in"
          onClick={() => setIsFullscreenOpen(false)}
        >
          {/* Modal Card Container */}
          <div
            className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden relative flex flex-col md:flex-row max-h-[92vh] border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsFullscreenOpen(false)}
              className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 p-2 rounded-full transition-all duration-200 cursor-pointer z-55"
              title="Tutup"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Left Column: Image Viewer */}
            <div className="w-full md:w-1/2 bg-gray-50 flex flex-col justify-center relative aspect-square md:aspect-auto md:h-full min-h-[260px] max-h-[340px] md:max-h-none overflow-hidden">
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src={images[imgIndex]}
                  alt={`${product.name} - Gambar ${imgIndex + 1}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain select-none"
                />

                {/* Left/Right controls inside modal */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setImgIndex(prev => (prev - 1 + images.length) % images.length);
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-md transition-all cursor-pointer z-30"
                      title="Sebelumnya"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setImgIndex(prev => (prev + 1) % images.length);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-md transition-all cursor-pointer z-30"
                      title="Selanjutnya"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}

                {/* Tag Category inside image */}
                <span className="absolute top-4 left-4 z-20 bg-black/60 text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full">
                  {product.category || 'Umum'}
                </span>
              </div>

              {/* Indicator bar/dots for multi images */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex space-x-1.5 bg-black/25 px-3 py-1.5 rounded-full backdrop-blur-xs">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setImgIndex(i)}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        i === imgIndex ? 'w-4 bg-emerald-500' : 'w-1.5 bg-white/60 hover:bg-white'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Detailed Product Info */}
            <div className="w-full md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto max-h-[48vh] md:max-h-none">
              <div className="space-y-4">
                <div>
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full inline-block">
                    {product.category || 'Umum'}
                  </span>
                  <h3 className="text-lg font-extrabold text-gray-900 mt-2 leading-tight">
                    {product.name}
                  </h3>
                </div>

                <div className="border-t border-b border-gray-100 py-3 flex items-baseline justify-between gap-2">
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Harga</span>
                    <span className="text-xl font-black text-emerald-600 truncate">
                      {formatRupiah(product.price)}
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Status Stok</span>
                    {isOutOfStock ? (
                      <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md inline-block mt-0.5">
                        Habis
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md inline-block mt-0.5">
                        Ada ({product.stock})
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Deskripsi Lengkap</h4>
                  <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line max-h-[160px] md:max-h-[220px] overflow-y-auto pr-1">
                    {product.description}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 mt-5 flex space-x-2">
                <button
                  onClick={() => setIsFullscreenOpen(false)}
                  className="flex-1 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 text-[11px] font-bold rounded-xl transition-all cursor-pointer text-center"
                >
                  Tutup
                </button>
                <button
                  onClick={() => {
                    onAddToCart(product);
                    setIsFullscreenOpen(false);
                  }}
                  disabled={isOutOfStock}
                  className={`flex-2 py-2.5 rounded-xl font-bold text-[11px] flex items-center justify-center space-x-1.5 transition-all cursor-pointer focus:outline-hidden ${
                    isOutOfStock
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/10 hover:shadow-emerald-600/20'
                  }`}
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>{isOutOfStock ? 'Stok Habis' : 'Tambah'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductsList({ products, onAddToCart }: ProductsProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('Semua');

  // Dynamically extract categories
  const categories = React.useMemo(() => {
    const list = new Set(products.map(p => p.category || 'Umum'));
    return ['Semua', ...Array.from(list)];
  }, [products]);

  // Filter products based on search & category
  const filteredProducts = React.useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'Semua' || (product.category || 'Umum') === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  return (
    <div id="products-catalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 scroll-mt-20">
      {/* Header section with search and filter */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-8 border-b border-gray-100 mb-8">
        <div className="space-y-1">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-emerald-600 animate-pulse" />
            <span>Koleksi Produk Unggulan</span>
          </h2>
          <p className="text-sm text-gray-500">
            Jelajahi berbagai pilihan gadget dan aksesoris berkualitas tinggi dengan foto multi-dimensi.
          </p>
        </div>

        {/* Filters Controls */}
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              id="product-search-input"
              type="text"
              placeholder="Cari produk impian..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-white"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
            <Filter className="w-4 h-4 text-gray-400 shrink-0 hidden sm:block" />
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  selectedCategory === category
                    ? 'bg-emerald-600 text-white shadow-xs shadow-emerald-600/10'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <div className="max-w-xs mx-auto space-y-3">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-gray-800">Produk Tidak Ditemukan</h3>
            <p className="text-xs text-gray-500">
              Kami tidak dapat menemukan produk yang sesuai dengan pencarian "{searchTerm}" dalam kategori "{selectedCategory}".
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('Semua');
              }}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 underline cursor-pointer"
            >
              Reset Filter Pencarian
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
