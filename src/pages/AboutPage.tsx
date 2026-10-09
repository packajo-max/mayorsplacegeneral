import React from 'react';
import { useBusiness } from '../context/BusinessContext';
import { Clock, Sprout, Video, CheckCircle2, ShieldCheck } from 'lucide-react';

export const AboutPage: React.FC<{ navigate: (path: string) => void }> = () => {
  const { settings } = useBusiness();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10 bg-white text-[#0d472b]">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F0F8F2] border border-[#198754]/30 text-[#146C43] text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-[#198754]" />
          <span>About Our Organization</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#146C43] tracking-tight uppercase">
          MAYORS PLACE GENERAL INVESTMENT LIMITED
        </h1>
        <h2 className="text-lg font-bold text-[#198754]">
          Welcome to Mayors Place General Investment Limited.
        </h2>
        <p className="text-[#0d472b] text-sm sm:text-base leading-relaxed font-medium">
          Your trusted partner for consultations, agricultural products, and professional live-streaming services.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border-2 border-[#198754]/20 p-6 shadow-xs space-y-2.5">
          <div className="w-12 h-12 bg-[#F0F8F2] rounded-xl flex items-center justify-center text-[#198754] border border-[#198754]/30">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#146C43]">Appointments & Consultations</h3>
          <p className="text-xs text-[#0d472b] leading-relaxed">
            Get professional assistance with travel enquiries, studying abroad, scholarship opportunities, and general advisory services.
          </p>
        </div>

        <div className="bg-white rounded-2xl border-2 border-[#198754]/20 p-6 shadow-xs space-y-2.5">
          <div className="w-12 h-12 bg-[#F0F8F2] rounded-xl flex items-center justify-center text-[#198754] border border-[#198754]/30">
            <Sprout className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#146C43]">Agricultural Products & Seedlings</h3>
          <p className="text-xs text-[#0d472b] leading-relaxed">
            High quality agricultural seedlings, cash crops, and farm inputs for individuals and commercial farmers.
          </p>
        </div>

        <div className="bg-white rounded-2xl border-2 border-[#198754]/20 p-6 shadow-xs space-y-2.5">
          <div className="w-12 h-12 bg-[#F0F8F2] rounded-xl flex items-center justify-center text-[#198754] border border-[#198754]/30">
            <Video className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#146C43]">Live-Streaming & Event Coverage</h3>
          <p className="text-xs text-[#0d472b] leading-relaxed">
            Professional live streaming, audio-visual production, and multimedia coverage for weddings, funerals, conferences, and corporate events.
          </p>
        </div>
      </div>

      <div className="bg-[#F0F8F2] border-2 border-[#198754]/30 rounded-3xl p-6 sm:p-8 space-y-2 text-[#0d472b]">
        <h3 className="text-lg font-bold text-[#146C43]">Corporate Location & Central Nursery Hub</h3>
        <p className="text-xs sm:text-sm text-[#0d472b] leading-relaxed">
          Head Office: {settings.businessAddress} • Seedling Nursery Pickup: {settings.collectionAddress}
        </p>
      </div>
    </div>
  );
};
