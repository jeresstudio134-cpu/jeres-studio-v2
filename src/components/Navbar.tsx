/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShoppingCart, LayoutDashboard, Store, Menu, X } from 'lucide-react';
import { ShopConfig } from '../types';

interface NavbarProps {
  activeTab: 'home' | 'admin';
  setActiveTab: (tab: 'home' | 'admin') => void;
  cartItemsCount: number;
  onOpenCart: () => void;
  shopConfig: ShopConfig;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  cartItemsCount,
  onOpenCart,
  shopConfig,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <nav id="app-navbar" className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center">
            <button
              id="logo-button"
              onClick={() => {
                setActiveTab('home');
                setMobileMenuOpen(false);
              }}
              className="flex items-center space-x-3 group cursor-pointer focus:outline-hidden"
            >
              {shopConfig.logoUrl && !shopConfig.logoUrl.includes('unsplash.com') ? (
                <img
                  id="navbar-logo"
                  src={shopConfig.logoUrl}
                  alt={shopConfig.name}
                  referrerPolicy="no-referrer"
                  className="h-12 w-auto max-w-[160px] rounded-lg object-contain group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="relative inline-flex flex-col items-center justify-center px-2.5 py-1.5 bg-white border border-gray-100 rounded-xl shadow-xs transform -skew-x-3 select-none shrink-0 group-hover:scale-105 transition-transform duration-200">
                  <span className="text-[11px] italic font-black text-amber-500 tracking-tight leading-none drop-shadow-[0_0.5px_0_rgba(0,0,0,0.05)]">JERE'S</span>
                  <span className="text-[8px] italic font-extrabold text-pink-500 tracking-widest leading-none mt-0.5 uppercase">STUDIO</span>
                  <div className="bg-cyan-500 text-white text-[6px] font-black px-1.5 py-0.5 rounded-xs uppercase tracking-widest leading-none mt-0.5">
                    DESIGN
                  </div>
                </div>
              )}
              <span id="navbar-shop-name" className="text-xl font-bold tracking-tight text-gray-900 group-hover:text-emerald-600 transition-colors">
                {shopConfig.name}
              </span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              id="nav-home"
              onClick={() => setActiveTab('home')}
              className={`flex items-center space-x-2 text-sm font-medium transition-colors cursor-pointer py-2 border-b-2 ${
                activeTab === 'home'
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-gray-600 hover:text-emerald-600'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Beranda</span>
            </button>

            <button
              id="nav-admin"
              onClick={() => setActiveTab('admin')}
              className={`flex items-center space-x-2 text-sm font-medium transition-colors cursor-pointer py-2 border-b-2 ${
                activeTab === 'admin'
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-gray-600 hover:text-emerald-600'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Admin Dashboard</span>
            </button>
          </div>

          {/* Cart & Mobile Trigger */}
          <div className="flex items-center space-x-4">
            <button
              id="cart-trigger-button"
              onClick={onOpenCart}
              className="relative p-2.5 rounded-full text-gray-600 hover:bg-gray-50 hover:text-emerald-600 transition-all focus:outline-hidden cursor-pointer"
              aria-label="Keranjang Belanja"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartItemsCount > 0 && (
                <span
                  id="cart-badge"
                  className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse border-2 border-white"
                >
                  {cartItemsCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 md:hidden focus:outline-hidden cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Panel */}
      {mobileMenuOpen && (
        <div id="mobile-navigation-panel" className="md:hidden bg-white border-b border-gray-100 transition-all">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <button
              id="mobile-nav-home"
              onClick={() => {
                setActiveTab('home');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium transition-colors cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-emerald-600'
              }`}
            >
              <Store className="w-5 h-5" />
              <span>Beranda Toko</span>
            </button>

            <button
              id="mobile-nav-admin"
              onClick={() => {
                setActiveTab('admin');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium transition-colors cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-emerald-600'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Admin Dashboard</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
