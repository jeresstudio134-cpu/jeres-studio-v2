/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, ShoppingBag, ArrowDown } from 'lucide-react';
import { ShopConfig } from '../types';

interface HeroProps {
  shopConfig: ShopConfig;
  onExploreClick: () => void;
}

export default function Hero({ shopConfig, onExploreClick }: HeroProps) {
  return (
    <div id="hero-section" className="relative overflow-hidden bg-radial from-emerald-500/10 via-transparent to-transparent py-16 sm:py-24 border-b border-gray-100">
      {/* Decorative backdrop blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-300/10 rounded-full blur-3xl -translate-y-12"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-300/10 rounded-full blur-3xl translate-y-12"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          {/* Tagline Badge */}
          <div className="inline-flex items-center space-x-2 bg-emerald-50 border border-emerald-100 px-4 py-1.5 rounded-full text-emerald-700 text-xs sm:text-sm font-semibold tracking-wide uppercase">
            <Sparkles className="w-4 h-4 text-emerald-600 animate-spin" style={{ animationDuration: '3s' }} />
            <span>Katalog Belanja Online Resmi</span>
          </div>

          {/* Main Title */}
          <h1 id="hero-title" className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 leading-tight">
            Selamat Datang di
            <span className="block mt-2 bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              {shopConfig.name}
            </span>
          </h1>

          {/* Shop Description */}
          <p id="hero-description" className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
            {shopConfig.description || "Temukan berbagai produk berkualitas tinggi untuk memenuhi segala kebutuhan gaya hidup modern Anda dengan transaksi mudah dan pengiriman cepat."}
          </p>

          {/* Call To Actions */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              id="hero-explore-btn"
              onClick={onExploreClick}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg shadow-emerald-600/10 hover:shadow-emerald-600/20 hover:-translate-y-0.5 transition-all cursor-pointer focus:outline-hidden"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Belanja Sekarang</span>
            </button>
            <button
              id="hero-address-btn"
              onClick={() => {
                const element = document.getElementById('footer-address');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold px-8 py-3.5 rounded-xl border border-gray-200 transition-colors cursor-pointer focus:outline-hidden"
            >
              <span>Info Alamat Toko</span>
              <ArrowDown className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
