/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import { Banner } from '../types.ts';

interface BannerSliderProps {
  banners: Banner[];
}

export default function BannerSlider({ banners }: BannerSliderProps) {
  const activeBanners = banners.filter(b => b.active);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);

  // Auto-play interval
  React.useEffect(() => {
    if (activeBanners.length <= 1 || selectedImage) return;
    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % activeBanners.length);
    }, 5000); // 5 seconds interval
    return () => clearInterval(interval);
  }, [activeBanners.length, selectedImage]);

  if (activeBanners.length === 0) {
    return null;
  }

  const prevSlide = () => {
    setCurrentIndex(prevIndex => (prevIndex - 1 + activeBanners.length) % activeBanners.length);
  };

  const nextSlide = () => {
    setCurrentIndex(prevIndex => (prevIndex + 1) % activeBanners.length);
  };

  return (
    <div id="banner-slider-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="relative group overflow-hidden rounded-2xl border border-gray-100 shadow-md aspect-21/9 md:aspect-3/1">
        {/* Banner Images */}
        <div className="w-full h-full relative">
          {activeBanners.map((banner, index) => (
            <div
              key={banner.id}
              onClick={() => setSelectedImage(banner.imageUrl)}
              className={`absolute inset-0 w-full h-full cursor-pointer group/slide transition-opacity duration-1000 ease-in-out ${
                index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
              title="Klik untuk memperbesar gambar promo / daftar harga"
            >
              {/* Image */}
              <img
                src={banner.imageUrl || undefined}
                alt={banner.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover select-none transition-transform duration-700 group-hover/slide:scale-105"
              />
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/40 to-transparent flex flex-col justify-end p-6 sm:p-10 md:p-12">
                {/* Floating Zoom Badge */}
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-xs text-white p-2 rounded-full opacity-0 group-hover/slide:opacity-100 transition-opacity duration-300">
                  <ZoomIn className="w-4 h-4" />
                </div>

                <div className="max-w-2xl text-white space-y-2">
                  <h2 className="text-xl sm:text-2xl md:text-3.5xl font-extrabold tracking-tight drop-shadow-sm leading-tight">
                    {banner.title}
                  </h2>
                  <p className="text-xs sm:text-sm md:text-base text-gray-200 line-clamp-2 leading-relaxed font-light">
                    {banner.description}
                  </p>
                  <p className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase pt-1">
                    🔍 Klik untuk melihat resolusi penuh / daftar harga lengkap
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        {activeBanners.length > 1 && (
          <>
            <button
              id="banner-prev-slide"
              onClick={(e) => {
                e.stopPropagation();
                prevSlide();
              }}
              className="absolute top-1/2 left-4 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer focus:outline-hidden"
              aria-label="Slide Sebelumnya"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              id="banner-next-slide"
              onClick={(e) => {
                e.stopPropagation();
                nextSlide();
              }}
              className="absolute top-1/2 right-4 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer focus:outline-hidden"
              aria-label="Slide Selanjutnya"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Indicator Dots */}
        {activeBanners.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
            {activeBanners.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(index);
                }}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  index === currentIndex ? 'w-6 bg-emerald-500' : 'w-2 bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Pindah ke slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal / Fullscreen Viewer */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xs p-4 cursor-zoom-out animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          {/* Close Button */}
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 text-white hover:text-red-400 p-3 rounded-full backdrop-blur-xs transition-colors duration-200 cursor-pointer border border-white/20"
            title="Tutup (Esc)"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Lightbox Image Box */}
          <div
            className="relative max-w-5xl w-full max-h-[85vh] flex flex-col items-center justify-center cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage || undefined}
              alt="Daftar Harga Cetak / Promo Detail"
              className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl border border-white/10"
            />
            
            <p className="mt-4 text-center text-sm font-semibold text-gray-300 tracking-wide bg-black/40 px-4 py-2 rounded-full border border-white/5">
              Tekan di mana saja di luar gambar atau tombol X untuk menutup
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
