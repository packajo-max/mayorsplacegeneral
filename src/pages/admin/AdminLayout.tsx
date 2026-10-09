import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useBusiness } from '../../context/BusinessContext';
import {
  LayoutDashboard,
  Calendar,
  GraduationCap,
  Sprout,
  ShoppingBag,
  Video,
  CreditCard,
  RotateCcw,
  Bell,
  Settings,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  ExternalLink
} from 'lucide-react';

interface AdminLayoutProps {
  currentAdminTab: string;
  setAdminTab: (tab: string) => void;
  navigate: (path: string) => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentAdminTab,
  setAdminTab,
  navigate,
  children,
}) => {
  const { user, isAdmin, logout, loginWithGoogle, loginAsDemoAdmin } = useAuth();
  const { settings } = useBusiness();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // If not authenticated as admin, show secure login prompt
  if (!isAdmin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-white text-[#0d472b]">
        <div className="bg-white rounded-3xl border-2 border-[#198754]/30 p-8 sm:p-10 max-w-md w-full shadow-md text-center space-y-6">
          <div className="w-16 h-16 bg-[#F0F8F2] rounded-2xl flex items-center justify-center text-[#198754] mx-auto border-2 border-[#198754]/30">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-black text-[#146C43] uppercase">
              MAYORS PLACE Staff Portal
            </h2>
            <p className="text-xs sm:text-sm text-[#0d472b]">
              Restricted to authorized administrators and corporate staff.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => loginWithGoogle()}
              className="w-full py-3 px-4 rounded-xl bg-[#198754] hover:bg-[#146C43] text-white font-bold text-sm shadow-md shadow-[#198754]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-white" />
              <span>Sign in with Google</span>
            </button>

            <button
              onClick={() => loginAsDemoAdmin()}
              className="w-full py-2.5 px-4 rounded-xl bg-[#F0F8F2] hover:bg-[#198754] hover:text-white text-[#146C43] font-bold text-xs transition-colors cursor-pointer border border-[#198754]/30"
            >
              Demo Staff Access (Preview Environment)
            </button>
          </div>

          <div className="text-[11px] text-[#0d472b]">
            Protected by Firebase Authentication & Firestore ABAC Security Rules.
          </div>
        </div>
      </div>
    );
  }

  const adminNavItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'seminars', label: 'Seminars', icon: GraduationCap },
    { id: 'products', label: 'Products & Stock', icon: Sprout },
    { id: 'orders', label: 'Orders & Fulfilment', icon: ShoppingBag },
    { id: 'livestream', label: 'Live-Streaming & Quotes', icon: Video },
    { id: 'payments', label: 'Payments & Splits', icon: CreditCard },
    { id: 'refunds', label: 'Refunds & Cancellations', icon: RotateCcw },
    { id: 'notifications', label: 'Notification Logs', icon: Bell },
    { id: 'settings', label: 'Platform Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-white text-[#0d472b] flex flex-col lg:flex-row">
      {/* Mobile Top Header */}
      <div className="lg:hidden bg-[#146C43] text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-white" />
          <span className="font-bold text-sm">MAYORS PLACE Staff Portal</span>
        </div>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-1.5 rounded-lg bg-[#0f5132] text-white cursor-pointer"
        >
          {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`${
          mobileSidebarOpen ? 'block' : 'hidden'
        } lg:block w-full lg:w-64 bg-[#146C43] text-white shrink-0 border-r border-[#198754] p-4 flex flex-col justify-between`}
      >
        <div className="space-y-6">
          <div className="px-3 py-2 border-b border-[#198754]/50 pb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#F0F8F2] block">
              Administration Portal
            </span>
            <div className="font-black text-white text-sm truncate uppercase">
              MAYORS PLACE GENERAL INVESTMENT LIMITED
            </div>
            <div className="text-[11px] text-[#F0F8F2] truncate mt-0.5">
              {user?.email || 'Logged in as Staff Admin'}
            </div>
          </div>

          <nav className="space-y-1">
            {adminNavItems.map((item) => {
              const active = currentAdminTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setAdminTab(item.id);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-3 transition-all cursor-pointer ${
                    active
                      ? 'bg-white text-[#146C43] shadow-xs'
                      : 'text-white hover:bg-[#0f5132]'
                  }`}
                >
                  <item.icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#146C43]' : 'text-white'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-[#198754]/50 space-y-2">
          <button
            onClick={() => navigate('/')}
            className="w-full text-left px-3 py-2 rounded-lg text-xs text-white hover:bg-[#0f5132] flex items-center justify-between cursor-pointer"
          >
            <span>View Public Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => logout()}
            className="w-full text-left px-3 py-2 rounded-lg text-xs text-[#F0F8F2] hover:text-white hover:bg-[#0f5132] flex items-center gap-2 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full bg-white">
        {children}
      </main>
    </div>
  );
};
