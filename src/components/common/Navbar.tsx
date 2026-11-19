import React, { useState } from 'react';
import { 
  Droplets, 
  ShoppingCart, 
  Search, 
  ShieldCheck, 
  Truck, 
  Menu, 
  X, 
  UserCheck, 
  ChevronDown,
  PhoneCall
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWater } from '../../context/WaterContext';
import { formatCurrency } from '../../utils/formatters';

interface NavbarProps {
  activeTab: 'catalog' | 'track' | 'admin' | 'delivery';
  setActiveTab: (tab: 'catalog' | 'track' | 'admin' | 'delivery') => void;
  setIsCartOpen: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, setIsCartOpen }) => {
  const { currentUser, role, allUsers, loginAs, setRoleGuest } = useAuth();
  const { cartTotalCount, cartTotalAmount } = useWater();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      {/* Top Notification / Emergency Order Bar */}
      <div className="bg-ocean-950 text-ocean-100 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-medium">Same-Day Express Water Delivery Active Across Salt Lake &amp; Kolkata</span>
          </div>
          <div className="flex items-center gap-4 text-slate-300">
            <a href="tel:+919876543210" className="flex items-center gap-1 hover:text-white transition-colors">
              <PhoneCall className="w-3.5 h-3.5 text-aqua-400" />
              <span>Direct Order Line: <strong className="text-white">+91 98765 43210</strong></span>
            </a>
            <span className="hidden sm:inline text-slate-500">|</span>
            <span className="hidden sm:inline">Clean, Sealed &amp; UV Purified</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <div 
            onClick={() => setActiveTab('catalog')} 
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-ocean-700 via-ocean-600 to-aqua-500 flex items-center justify-center text-white shadow-md shadow-ocean-500/20 group-hover:scale-105 transition-transform">
              <Droplets className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-ocean-900 to-ocean-700 bg-clip-text text-transparent">
                  AquaFlow
                </span>
                <span className="text-xs font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-ocean-100 text-ocean-800 border border-ocean-200">
                  Pro
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium tracking-wide">
                Enterprise Water Distribution System
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                activeTab === 'catalog'
                  ? 'bg-ocean-50 text-ocean-700 font-semibold shadow-sm'
                  : 'text-slate-600 hover:text-ocean-700 hover:bg-slate-50'
              }`}
            >
              Order Water (Catalogue)
            </button>

            <button
              onClick={() => setActiveTab('track')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                activeTab === 'track'
                  ? 'bg-ocean-50 text-ocean-700 font-semibold shadow-sm'
                  : 'text-slate-600 hover:text-ocean-700 hover:bg-slate-50'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Track Order</span>
            </button>

            <button
              onClick={() => setActiveTab('delivery')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                activeTab === 'delivery'
                  ? 'bg-ocean-50 text-ocean-700 font-semibold shadow-sm'
                  : 'text-slate-600 hover:text-ocean-700 hover:bg-slate-50'
              }`}
            >
              <Truck className="w-4 h-4 text-emerald-600" />
              <span>Delivery Portal</span>
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                activeTab === 'admin'
                  ? 'bg-ocean-50 text-ocean-700 font-semibold shadow-sm'
                  : 'text-slate-600 hover:text-ocean-700 hover:bg-slate-50'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-ocean-600" />
              <span>Owner Dashboard</span>
            </button>
          </nav>

          {/* Right Action Icons: Role Switcher & Cart */}
          <div className="flex items-center gap-3">
            {/* Quick Role Switcher Pill (Great for Pair Programming & Testing Scenarios) */}
            <div className="relative">
              <button
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 transition-all shadow-sm"
                title="Switch active role profile"
              >
                <div className={`w-2 h-2 rounded-full ${
                  role === 'owner' ? 'bg-indigo-600' :
                  role === 'delivery' ? 'bg-emerald-500' : 'bg-ocean-500'
                }`} />
                <span>
                  {currentUser ? `${currentUser.name} (${role.toUpperCase()})` : 'Customer (Guest)'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {isRoleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-1.5 text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                    Simulate Role / Profile
                  </div>
                  <button
                    onClick={() => {
                      setRoleGuest();
                      setIsRoleDropdownOpen(false);
                      setActiveTab('catalog');
                    }}
                    className="w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 text-slate-700"
                  >
                    <div>
                      <div className="font-semibold">Customer (Guest)</div>
                      <div className="text-[10px] text-slate-500">Public ordering &amp; order tracking</div>
                    </div>
                    {role === 'customer' && <span className="text-ocean-600 font-bold">✓</span>}
                  </button>
                  <div className="border-t border-slate-100 my-1"></div>
                  {allUsers.map(user => (
                    <button
                      key={user.id}
                      onClick={() => {
                        loginAs(user.id);
                        setIsRoleDropdownOpen(false);
                        if (user.role === 'owner') setActiveTab('admin');
                        if (user.role === 'delivery') setActiveTab('delivery');
                      }}
                      className="w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 text-slate-700"
                    >
                      <div>
                        <div className="font-semibold">{user.name}</div>
                        <div className="text-[10px] text-slate-500 capitalize">{user.role} Role</div>
                      </div>
                      {currentUser?.id === user.id && <span className="text-ocean-600 font-bold">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Trigger Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 bg-gradient-to-r from-ocean-700 to-ocean-800 hover:from-ocean-800 hover:to-ocean-900 text-white px-4 py-2.5 rounded-xl shadow-md shadow-ocean-700/20 active:scale-95 transition-all"
            >
              <ShoppingCart className="w-5 h-5 text-aqua-300" />
              <span className="hidden sm:inline font-semibold text-sm">Cart</span>
              {cartTotalCount > 0 ? (
                <span className="bg-aqua-400 text-ocean-950 font-black text-xs px-2 py-0.5 rounded-full shadow-sm animate-pulse-subtle">
                  {cartTotalCount} | {formatCurrency(cartTotalAmount)}
                </span>
              ) : (
                <span className="bg-ocean-900/60 text-slate-300 text-xs px-2 py-0.5 rounded-full">
                  0
                </span>
              )}
            </button>

            {/* Mobile menu toggle button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 py-3 space-y-1">
            <button
              onClick={() => {
                setActiveTab('catalog');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
                activeTab === 'catalog' ? 'bg-ocean-50 text-ocean-700 font-bold' : 'text-slate-700'
              }`}
            >
              Product Catalogue
            </button>
            <button
              onClick={() => {
                setActiveTab('track');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
                activeTab === 'track' ? 'bg-ocean-50 text-ocean-700 font-bold' : 'text-slate-700'
              }`}
            >
              Track Order
            </button>
            <button
              onClick={() => {
                setActiveTab('delivery');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
                activeTab === 'delivery' ? 'bg-ocean-50 text-ocean-700 font-bold' : 'text-slate-700'
              }`}
            >
              Delivery Person Portal
            </button>
            <button
              onClick={() => {
                setActiveTab('admin');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
                activeTab === 'admin' ? 'bg-ocean-50 text-ocean-700 font-bold' : 'text-slate-700'
              }`}
            >
              Owner Admin Dashboard
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
