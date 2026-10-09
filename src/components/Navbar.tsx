import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useBusiness } from '../context/BusinessContext';
import { useAuth } from '../context/AuthContext';
import {
  ShoppingBag,
  Phone,
  ShieldCheck,
  Menu,
  X,
  Search,
  CheckCircle2,
  Calendar
} from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  navigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, navigate }) => {
  const { totalItemsCount } = useCart();
  const { settings } = useBusiness();
  const { isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Appointments', path: '/appointments' },
    { label: 'Agricultural Products', path: '/shop' },
    { label: 'Live Streaming', path: '/livestream' },
    { label: 'Contact', path: '/contact' },
  ];

  const handleNav = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#198754]/20 shadow-xs">
      {/* Top green notification strip */}
      <div className="bg-[#F0F8F2] text-[#146C43] text-xs py-2 px-4 border-b border-[#198754]/20">
        <div className="max-w-6xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-3">
            <span className="font-bold text-[#146C43] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#198754]" />
              MAYORS PLACE GENERAL INVESTMENT LIMITED
            </span>
            <span className="hidden sm:inline-block text-[#198754]/40">•</span>
            <span className="hidden sm:inline-block text-[#0d472b] font-medium">Nigeria (WAT / Lagos)</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href={`tel:${settings.businessPhone.replace(/\s+/g, '')}`}
              className="flex items-center gap-1.5 text-[#0d472b] hover:text-[#198754] transition-colors font-medium"
            >
              <Phone className="w-3.5 h-3.5 text-[#198754]" />
              <span>{settings.businessPhone}</span>
            </a>
            <button
              onClick={() => handleNav('/status')}
              className="hidden sm:flex items-center gap-1 text-[#0d472b] hover:text-[#198754] text-xs font-semibold cursor-pointer"
            >
              <Search className="w-3 h-3 text-[#198754]" />
              <span>Track Order / Booking</span>
            </button>
            <button
              onClick={() => handleNav('/admin')}
              className="text-xs text-[#146C43] hover:text-white bg-white hover:bg-[#198754] border border-[#198754]/30 px-2.5 py-0.5 rounded-full transition-colors flex items-center gap-1 font-semibold cursor-pointer"
            >
              <ShieldCheck className="w-3 h-3 text-[#198754]" />
              {isAdmin ? 'Admin' : 'Staff'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">
          {/* Business Logo / Brand */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => handleNav('/')}
          >
            <div className="w-11 h-11 rounded-2xl bg-[#198754] flex items-center justify-center text-white shadow-md shadow-[#198754]/20 group-hover:scale-105 transition-transform font-black text-xl">
              M
            </div>
            <div>
              <span className="text-lg sm:text-xl font-black tracking-tight text-[#146C43] block leading-tight group-hover:text-[#198754] transition-colors">
                MAYORS PLACE GENERAL INVESTMENT LIMITED
              </span>
              <span className="text-[11px] font-bold tracking-wider text-[#198754] uppercase block">
                Consultations • Agriculture • Live-Streaming
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => {
              const active = currentPath === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNav(item.path)}
                  className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                    active
                      ? 'bg-[#F0F8F2] text-[#146C43] border border-[#198754]/30'
                      : 'text-[#0d472b] hover:text-[#198754] hover:bg-[#F0F8F2]/60'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Actions: Cart & Book Now */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleNav('/cart')}
              className="relative p-2.5 rounded-xl border border-[#198754]/30 hover:border-[#198754] hover:bg-[#F0F8F2] text-[#146C43] transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 text-[#198754]" />
              <span className="hidden sm:inline text-xs font-bold text-[#146C43]">Cart</span>
              {totalItemsCount > 0 && (
                <span className="w-5 h-5 bg-[#198754] text-white rounded-full text-[11px] font-bold flex items-center justify-center shadow-xs">
                  {totalItemsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => handleNav('/appointments')}
              className="hidden lg:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#198754] hover:bg-[#146C43] text-white text-sm font-bold shadow-md shadow-[#198754]/20 transition-all cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Now</span>
            </button>

            {/* Mobile menu hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-[#146C43] hover:bg-[#F0F8F2] cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-[#198754]" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#198754]/20 bg-white px-4 pt-3 pb-6 space-y-1 shadow-lg animate-in slide-in-from-top duration-200">
          {navItems.map((item) => {
            const active = currentPath === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className={`w-full text-left px-4 py-3 rounded-xl text-base font-bold flex items-center justify-between cursor-pointer ${
                  active ? 'bg-[#F0F8F2] text-[#146C43] border border-[#198754]/30' : 'text-[#0d472b] hover:bg-[#F0F8F2]/60'
                }`}
              >
                <span>{item.label}</span>
              </button>
            );
          })}
          <div className="pt-3 border-t border-[#198754]/20 flex flex-col gap-2">
            <button
              onClick={() => handleNav('/status')}
              className="w-full py-2.5 px-4 rounded-xl bg-[#F0F8F2] text-[#146C43] text-sm font-bold flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Search className="w-4 h-4 text-[#198754]" />
                Track Order / Booking
              </span>
            </button>
            <button
              onClick={() => handleNav('/admin')}
              className="w-full py-2.5 px-4 rounded-xl bg-white border border-[#198754]/30 text-[#146C43] text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-[#198754]" />
              Staff / Admin Portal
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
