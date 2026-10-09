import React from 'react';
import { useBusiness } from '../context/BusinessContext';
import { Phone, Mail, MapPin, PackageCheck, ShieldCheck } from 'lucide-react';

interface FooterProps {
  navigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  const { settings } = useBusiness();

  return (
    <footer className="bg-[#146C43] text-white border-t border-[#198754] mt-16">
      {/* Top Banner Notice: Customer Collection */}
      <div className="bg-[#0f5132] border-b border-[#198754]/40 py-3.5 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2.5">
            <PackageCheck className="w-4 h-4 text-white shrink-0" />
            <div>
              <span className="font-bold text-white">Seedling Pickup & Fulfilment Hub: </span>
              <span className="text-[#F0F8F2] font-medium">{settings.collectionAddress}</span>
            </div>
          </div>
          <div className="text-xs text-[#F0F8F2]">
            For inter-state delivery arrangements, call <span className="font-bold text-white underline">{settings.businessPhone}</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: Brand & Contact */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-9 h-9 rounded-xl bg-white text-[#146C43] flex items-center justify-center font-black text-base shadow-xs">
                M
              </div>
              <span className="text-lg sm:text-xl font-black tracking-tight text-white uppercase">
                MAYORS PLACE GENERAL INVESTMENT LIMITED
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#F0F8F2] leading-relaxed max-w-sm">
              Your trusted partner for consultations, agricultural products, and professional live-streaming services.
            </p>
            <div className="space-y-2 text-xs text-[#F0F8F2] pt-2">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-white mt-0.5 shrink-0" />
                <span>{settings.businessAddress}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-white shrink-0" />
                <a href={`tel:${settings.businessPhone}`} className="hover:text-white underline font-semibold transition-colors">
                  {settings.businessPhone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-white shrink-0" />
                <a href={`mailto:${settings.businessEmail}`} className="hover:text-white underline font-semibold transition-colors">
                  {settings.businessEmail}
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Core Services */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F0F8F2] mb-3 border-b border-[#198754]/60 pb-1">
              Our Services
            </h4>
            <ul className="space-y-2.5 text-xs text-white">
              <li>
                <button onClick={() => navigate('/appointments')} className="hover:text-[#F0F8F2] hover:underline transition-colors text-left cursor-pointer">
                  Appointments & Consultations
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/shop')} className="hover:text-[#F0F8F2] hover:underline transition-colors text-left cursor-pointer">
                  Agricultural Products & Seedlings
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/livestream')} className="hover:text-[#F0F8F2] hover:underline transition-colors text-left cursor-pointer">
                  Live-Streaming & Event Coverage
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/cart')} className="hover:text-[#F0F8F2] hover:underline transition-colors text-left cursor-pointer">
                  Shopping Cart
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/status')} className="text-white font-bold hover:underline transition-colors text-left cursor-pointer flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Track Order / Booking
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Trust & Policies */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F0F8F2] mb-3 border-b border-[#198754]/60 pb-1">
              Information & Policies
            </h4>
            <ul className="space-y-2.5 text-xs text-white">
              <li>
                <button onClick={() => navigate('/cancellation-policy')} className="hover:text-[#F0F8F2] hover:underline transition-colors text-left cursor-pointer">
                  Cancellation & Refunds
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/terms')} className="hover:text-[#F0F8F2] hover:underline transition-colors text-left cursor-pointer">
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/privacy')} className="hover:text-[#F0F8F2] hover:underline transition-colors text-left cursor-pointer">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/contact')} className="hover:text-[#F0F8F2] hover:underline transition-colors text-left cursor-pointer">
                  Contact Us
                </button>
              </li>
            </ul>
            <div className="mt-4 pt-3 border-t border-[#198754]/60 text-[11px] text-[#F0F8F2]">
              <span className="font-bold text-white">Paystack Verified Checkout</span>
              <div className="text-[10px] text-[#F0F8F2] mt-0.5">Fixed ₦60 platform fee applied per paid transaction.</div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="border-t border-[#198754]/60 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#F0F8F2] gap-3">
          <div>
            © {new Date().getFullYear()} MAYORS PLACE GENERAL INVESTMENT LIMITED. All rights reserved.
          </div>
          <div className="flex items-center gap-3">
            <span>Currency: NGN (₦)</span>
            <span>•</span>
            <span>Timezone: Africa/Lagos (WAT)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
