import React, { useState } from 'react';
import { useBusiness } from '../context/BusinessContext';
import { ServiceItem } from '../types';
import { Currency } from '../components/Currency';
import { ConsultationBookingModal } from '../components/ConsultationBookingModal';
import {
  Clock,
  Sprout,
  Video,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Phone,
  MapPin,
  Calendar,
  CheckCircle2,
  FileText
} from 'lucide-react';

// Three authentic, realistic African photographs
import travelImg from '../assets/images/travel_consultation_nigerian_1791561580674.jpg';
import agricultureImg from '../assets/images/nigerian_farmer_seedlings_1791561599067.jpg';
import livestreamImg from '../assets/images/nigerian_event_livestreaming_1791561619935.jpg';

interface HomePageProps {
  navigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ navigate }) => {
  const { settings, services } = useBusiness();
  const [isAppointmentsExpanded, setIsAppointmentsExpanded] = useState(false);
  const [selectedServiceForModal, setSelectedServiceForModal] = useState<ServiceItem | null>(null);

  // Filter to active consultation services (strictly 3 services)
  const activeConsultationServices = services.filter((s) => s.active);

  const scrollToServices = () => {
    setIsAppointmentsExpanded(true);
    const el = document.getElementById('services-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/appointments');
    }
  };

  const handleBookService = (service: ServiceItem) => {
    setSelectedServiceForModal(service);
  };

  return (
    <div className="bg-[#FFFFFF] min-h-screen text-[#0d472b]">
      {/* 1. HOMEPAGE HERO SECTION */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-6">
        <div className="bg-[#F0F8F2] border border-[#198754]/30 rounded-3xl p-6 sm:p-10 lg:p-12 shadow-sm space-y-8">
          {/* Main Heading and Welcome Text */}
          <div className="space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#198754]/30 text-[#146C43] text-xs font-bold tracking-wide">
              <ShieldCheck className="w-4 h-4 text-[#198754]" />
              <span>Registered Commercial Enterprise</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#146C43] tracking-tight leading-tight uppercase">
              MAYORS PLACE GENERAL INVESTMENT LIMITED
            </h1>

            <h2 className="text-xl sm:text-2xl font-bold text-[#198754]">
              Welcome to Mayors Place General Investment Limited.
            </h2>

            <p className="text-base sm:text-lg text-[#0d472b] leading-relaxed max-w-2xl font-medium">
              Your trusted partner for consultations, agricultural products, and professional live-streaming services.
            </p>

            <div className="pt-2">
              <button
                onClick={scrollToServices}
                className="px-8 py-3.5 rounded-2xl bg-[#198754] hover:bg-[#146C43] text-white font-bold text-base shadow-sm hover:shadow-md transition-all flex items-center gap-2.5 cursor-pointer"
              >
                <Calendar className="w-5 h-5" />
                <span>Book Now</span>
                <ArrowRight className="w-5 h-5 ml-1" />
              </button>
            </div>
          </div>

          {/* 4. THREE REALISTIC AFRICAN PHOTOGRAPHS (HORIZONTAL ROW ON DESKTOP, RESPONSIVE ON MOBILE) */}
          <div className="pt-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5 items-stretch">
              {/* IMAGE ONE: TRAVEL AND CONSULTATIONS */}
              <div className="group bg-white border border-[#198754]/30 rounded-2xl p-2.5 shadow-sm hover:border-[#198754] transition-all flex flex-col">
                <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl bg-[#F0F8F2]">
                  <img
                    src={travelImg}
                    alt="Nigerian travel and educational consultation client at airport with luggage"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-white/95 text-[#146C43] text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-xs border border-[#198754]/20">
                    Travel & Consultations
                  </div>
                </div>
                <div className="p-3 text-center space-y-0.5">
                  <div className="text-sm font-bold text-[#146C43]">Travel & Consultations</div>
                  <div className="text-xs text-[#0d472b] font-medium">Guidance, Advisory & Business Packages</div>
                </div>
              </div>

              {/* IMAGE TWO: AGRICULTURAL PRODUCTS */}
              <div className="group bg-white border border-[#198754]/30 rounded-2xl p-2.5 shadow-sm hover:border-[#198754] transition-all flex flex-col">
                <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl bg-[#F0F8F2]">
                  <img
                    src={agricultureImg}
                    alt="Nigerian agricultural professional with healthy nursery seedlings and cocoa"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-white/95 text-[#146C43] text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-xs border border-[#198754]/20">
                    Agricultural Products
                  </div>
                </div>
                <div className="p-3 text-center space-y-0.5">
                  <div className="text-sm font-bold text-[#146C43]">Nursery Seedlings & Inputs</div>
                  <div className="text-xs text-[#0d472b] font-medium">Hardened Cocoa, Palm & Kola Nuts</div>
                </div>
              </div>

              {/* IMAGE THREE: LIVE-STREAMING AND EVENTS */}
              <div className="group bg-white border border-[#198754]/30 rounded-2xl p-2.5 shadow-sm hover:border-[#198754] transition-all flex flex-col">
                <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl bg-[#F0F8F2]">
                  <img
                    src={livestreamImg}
                    alt="Nigerian professional videographer operating live-stream broadcast camera"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-white/95 text-[#146C43] text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-xs border border-[#198754]/20">
                    Live-Streaming & Events
                  </div>
                </div>
                <div className="p-3 text-center space-y-0.5">
                  <div className="text-sm font-bold text-[#146C43]">Multi-Camera Live Coverage</div>
                  <div className="text-xs text-[#0d472b] font-medium">Weddings, Ceremonies & Conferences</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. THREE MAIN SERVICE CATEGORIES */}
      <section id="services-section" className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#146C43] tracking-tight">
            Our Services
          </h2>
          <p className="text-sm text-[#0d472b] font-medium">
            Explore our specialized divisions below and make your reservation or purchase.
          </p>
        </div>

        {/* Vertical list of 3 attractive white cards with green headings and green buttons */}
        <div className="space-y-5">
          {/* CARD ONE: APPOINTMENTS & CONSULTATIONS (WITH DROPDOWN / EXPANDABLE SECTION) */}
          <div className="bg-white border-2 border-[#198754]/30 hover:border-[#198754] rounded-3xl transition-all shadow-sm hover:shadow-md overflow-hidden">
            {/* Card Main Bar */}
            <div
              onClick={() => setIsAppointmentsExpanded(!isAppointmentsExpanded)}
              className="p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-6 cursor-pointer group"
            >
              <div className="flex items-start sm:items-center gap-5">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#F0F8F2] border border-[#198754]/30 text-[#198754] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Clock className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg sm:text-xl font-bold text-[#146C43] group-hover:text-[#198754] transition-colors">
                      Appointments & Consultations
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#F0F8F2] text-[#146C43] text-[11px] font-bold border border-[#198754]/30">
                      3 Services Available
                    </span>
                  </div>
                  <p className="text-sm text-[#0d472b] max-w-xl leading-relaxed font-normal">
                    Get professional assistance with travel enquiries, studying abroad, scholarship opportunities, and general advisory services.
                  </p>
                </div>
              </div>

              <div className="self-end sm:self-center shrink-0 flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsAppointmentsExpanded(!isAppointmentsExpanded);
                  }}
                  className="px-6 py-3 rounded-2xl bg-[#198754] hover:bg-[#146C43] text-white font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center gap-2 cursor-pointer uppercase tracking-wider"
                >
                  <span>{isAppointmentsExpanded ? 'Hide Services' : 'Select'}</span>
                  {isAppointmentsExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Expandable / Dropdown Section */}
            {isAppointmentsExpanded && (
              <div className="border-t-2 border-[#198754]/20 bg-[#F0F8F2]/60 p-5 sm:p-7 space-y-4 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#198754]/20">
                  <div>
                    <h4 className="text-base font-extrabold text-[#146C43]">
                      Available Consultation Services
                    </h4>
                    <p className="text-xs text-[#0d472b]">
                      Click &quot;Book Now&quot; on any service to open its booking form and secure your appointment.
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/appointments')}
                    className="text-xs font-bold text-[#198754] hover:text-[#146C43] hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                  >
                    <span>View on Full Appointments Page</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Vertical list of exactly the 3 consultation services */}
                <div className="space-y-4">
                  {activeConsultationServices.map((srv, idx) => (
                    <div
                      key={srv.id}
                      className="bg-white rounded-2xl border-2 border-[#198754]/30 hover:border-[#198754] p-5 sm:p-6 shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[#F0F8F2] text-[#198754] border border-[#198754]/30 flex items-center justify-center shrink-0 font-black text-sm">
                          {idx + 1}
                        </div>
                        <div className="space-y-1.5">
                          <h5 className="font-extrabold text-base sm:text-lg text-[#146C43]">
                            {srv.name}
                          </h5>
                          <p className="text-xs sm:text-sm text-[#0d472b] leading-relaxed max-w-2xl">
                            {srv.description}
                          </p>
                          <div className="flex items-center gap-3 pt-1">
                            <span className="text-xs font-bold text-[#146C43] flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-[#198754]" />
                              {srv.durationMinutes} mins
                            </span>
                            <span className="text-xs text-[#198754]">•</span>
                            <span className="text-xs text-[#146C43] font-semibold">
                              Automatic Consultation PDF Included
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#198754]/10">
                        <div className="text-left md:text-right">
                          <div className="text-[11px] text-[#0d472b] font-medium uppercase tracking-wider">Fee</div>
                          <Currency
                            amount={srv.price}
                            className="text-lg sm:text-xl font-black text-[#146C43]"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleBookService(srv)}
                          className="px-5 py-2.5 rounded-xl bg-[#198754] hover:bg-[#146C43] text-white font-bold text-xs sm:text-sm shadow-xs hover:shadow-md transition-all flex items-center gap-2 cursor-pointer uppercase tracking-wider"
                        >
                          <Calendar className="w-4 h-4" />
                          <span>Book Now</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* CARD TWO: AGRICULTURAL PRODUCTS & SEEDLINGS */}
          <div className="bg-white border-2 border-[#198754]/30 hover:border-[#198754] rounded-3xl p-6 sm:p-7 transition-all shadow-sm hover:shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-6 group">
            <div className="flex items-start sm:items-center gap-5">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#F0F8F2] border border-[#198754]/30 text-[#198754] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Sprout className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg sm:text-xl font-bold text-[#146C43] group-hover:text-[#198754] transition-colors">
                  Agricultural Products & Seedlings
                </h3>
                <p className="text-sm text-[#0d472b] max-w-xl leading-relaxed font-normal">
                  High quality agricultural seedlings, cash crops, and farm inputs for individuals and commercial farmers.
                </p>
              </div>
            </div>

            <div className="self-end sm:self-center shrink-0">
              <button
                onClick={() => navigate('/shop')}
                className="px-6 py-3 rounded-2xl bg-[#198754] hover:bg-[#146C43] text-white font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center gap-2 cursor-pointer uppercase tracking-wider"
              >
                <span>View Products</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* CARD THREE: LIVE-STREAMING & EVENT COVERAGE */}
          <div className="bg-white border-2 border-[#198754]/30 hover:border-[#198754] rounded-3xl p-6 sm:p-7 transition-all shadow-sm hover:shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-6 group">
            <div className="flex items-start sm:items-center gap-5">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#F0F8F2] border border-[#198754]/30 text-[#198754] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Video className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg sm:text-xl font-bold text-[#146C43] group-hover:text-[#198754] transition-colors">
                  Live-Streaming & Event Coverage
                </h3>
                <p className="text-sm text-[#0d472b] max-w-xl leading-relaxed font-normal">
                  Professional live streaming, audio-visual production, and multimedia coverage for weddings, funerals, conferences, and corporate events.
                </p>
              </div>
            </div>

            <div className="self-end sm:self-center shrink-0">
              <button
                onClick={() => navigate('/livestream')}
                className="px-6 py-3 rounded-2xl bg-[#198754] hover:bg-[#146C43] text-white font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center gap-2 cursor-pointer uppercase tracking-wider"
              >
                <span>Book Live-Stream</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK CONTACT BANNER (GREEN AND WHITE ONLY) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-12">
        <div className="bg-[#F0F8F2] border border-[#198754]/30 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm shadow-xs">
          <div className="flex items-center gap-3 text-[#0d472b] text-center sm:text-left">
            <MapPin className="w-5 h-5 text-[#198754] shrink-0" />
            <span>
              <strong className="text-[#146C43]">Corporate Office: </strong>
              {settings.businessAddress} • <strong className="text-[#146C43]">Nursery Pickup Hub: </strong>
              {settings.collectionAddress}
            </span>
          </div>
          <div className="shrink-0">
            <a
              href={`tel:${settings.businessPhone.replace(/\s+/g, '')}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#198754]/30 text-[#146C43] font-bold hover:bg-[#198754] hover:text-white transition-colors"
            >
              <Phone className="w-4 h-4 text-[#198754]" />
              <span>{settings.businessPhone}</span>
            </a>
          </div>
        </div>
      </section>

      {/* Booking Modal for Homepage Consultation Selection */}
      <ConsultationBookingModal
        isOpen={Boolean(selectedServiceForModal)}
        onClose={() => setSelectedServiceForModal(null)}
        service={selectedServiceForModal}
        navigate={navigate}
      />
    </div>
  );
};
