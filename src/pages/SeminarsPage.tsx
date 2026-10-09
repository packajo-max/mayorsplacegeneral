import React, { useState } from 'react';
import { useBusiness } from '../context/BusinessContext';
import { Seminar } from '../types';
import { Currency, FeeDisclosureBadge } from '../components/Currency';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Video,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  X
} from 'lucide-react';

interface SeminarsPageProps {
  navigate: (path: string) => void;
  selectedSeminarId?: string;
}

export const SeminarsPage: React.FC<SeminarsPageProps> = ({ navigate, selectedSeminarId }) => {
  const { seminars, settings } = useBusiness();
  const [activeSeminarModal, setActiveSeminarModal] = useState<Seminar | null>(() => {
    if (selectedSeminarId) {
      const found = seminars.find((s) => s.id === selectedSeminarId);
      if (found) return found;
    }
    return null;
  });

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const platformFee = settings.platformFeeNgn || 60;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSeminarModal) return;
    setErrorMessage(null);

    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMessage('Please provide your name and phone number.');
      return;
    }

    if (activeSeminarModal.registeredCount >= activeSeminarModal.capacity) {
      setErrorMessage('This seminar has reached its maximum seat capacity.');
      return;
    }

    setIsSubmitting(true);
    const regPrice = activeSeminarModal.registrationPrice;
    const totalAmount = regPrice + platformFee;
    const regRef = `SEM_${Date.now().toString().slice(-6)}`;

    try {
      const res = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'seminar',
          relatedId: regRef,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerEmail: customerEmail.trim() || undefined,
          businessAmount: regPrice,
          bookingData: {
            seminarId: activeSeminarModal.id,
            seminarTitle: activeSeminarModal.title,
            date: activeSeminarModal.date,
            time: activeSeminarModal.time,
            venue: activeSeminarModal.venue,
            price: regPrice,
            platformFee,
            totalAmount,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to initialize seminar ticket payment');
      }

      if (data.authorizationUrl.startsWith('/')) {
        navigate(data.authorizationUrl);
      } else {
        window.location.href = data.authorizationUrl;
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment initialization failed');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 bg-white text-[#0d472b]">
      <div className="max-w-3xl">
        <span className="text-xs font-bold text-[#198754] uppercase tracking-wider block mb-1">
          Capacity-Controlled Practical Education
        </span>
        <h1 className="text-3xl font-extrabold text-[#146C43] tracking-tight">
          Seminars & Agricultural Training
        </h1>
        <p className="text-[#0d472b] text-sm mt-2">
          Advance your agribusiness knowledge with certified practical masterclasses led by industry practitioners. Seats are strictly limited to maintain training quality.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {seminars.map((seminar) => {
          const availableSeats = Math.max(0, seminar.capacity - seminar.registeredCount);
          const isSoldOut = availableSeats <= 0;

          return (
            <div
              key={seminar.id}
              className="bg-white rounded-2xl border-2 border-[#198754]/20 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <div className="h-56 relative bg-[#F0F8F2] overflow-hidden">
                  <img
                    src={seminar.imageUrl}
                    alt={seminar.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-[#146C43]/90 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-xs flex items-center gap-1.5">
                    {seminar.isOnline ? (
                      <>
                        <Video className="w-3.5 h-3.5 text-white" />
                        Online Virtual Broadcast
                      </>
                    ) : (
                      <>
                        <MapPin className="w-3.5 h-3.5 text-white" />
                        In-Person Masterclass
                      </>
                    )}
                  </div>

                  <div className="absolute bottom-4 right-4 bg-white/95 text-[#146C43] text-xs font-bold px-2.5 py-1 rounded-md shadow-xs border border-[#198754]/30 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#198754]" />
                    <span>
                      {isSoldOut ? 'Sold Out' : `${availableSeats} Seats Remaining`}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <h3 className="text-lg font-bold text-[#146C43] leading-snug">
                    {seminar.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#0d472b] leading-relaxed">
                    {seminar.description}
                  </p>

                  <div className="space-y-2 text-xs text-[#0d472b] pt-2 border-t border-[#198754]/20">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#198754] shrink-0" />
                      <span>Date: <strong className="text-[#146C43]">{seminar.date}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#198754] shrink-0" />
                      <span>Time: <strong className="text-[#146C43]">{seminar.time}</strong></span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-[#198754] shrink-0 mt-0.5" />
                      <span className="line-clamp-2">Venue: {seminar.venue}</span>
                    </div>
                    <div className="text-[11px] text-[#146C43] font-bold">
                      Registration Deadline: {seminar.registrationDeadline}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0 border-t border-[#198754]/20 flex items-center justify-between mt-4">
                <div>
                  <div className="text-xs text-[#0d472b]">Registration Fee</div>
                  <Currency amount={seminar.registrationPrice} className="text-xl font-black text-[#146C43]" />
                </div>

                <button
                  onClick={() => setActiveSeminarModal(seminar)}
                  disabled={isSoldOut}
                  className="px-5 py-2.5 rounded-xl bg-[#198754] hover:bg-[#146C43] disabled:opacity-50 text-white font-bold text-xs sm:text-sm transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  {isSoldOut ? 'Sold Out' : 'Register Now'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Registration Modal */}
      {activeSeminarModal && (
        <div className="fixed inset-0 z-50 bg-[#146C43]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border-2 border-[#198754] animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setActiveSeminarModal(null)}
              className="absolute top-4 right-4 p-1.5 text-[#146C43] hover:text-[#198754] rounded-lg hover:bg-[#F0F8F2] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-[#198754] uppercase tracking-wide">
                  Seminar Registration
                </span>
                <h3 className="text-lg font-bold text-[#146C43] mt-0.5">
                  {activeSeminarModal.title}
                </h3>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#146C43] mb-1">
                    Participant Full Name <span className="text-[#198754]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maryam Bello"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border-2 border-[#198754]/30 focus:border-[#198754] focus:outline-none bg-white text-[#0d472b]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#146C43] mb-1">
                    Phone Number (Ticket dispatches here) <span className="text-[#198754]">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 08123456789"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border-2 border-[#198754]/30 focus:border-[#198754] focus:outline-none bg-white text-[#0d472b]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#146C43] mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. maryam@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border-2 border-[#198754]/30 focus:border-[#198754] focus:outline-none bg-white text-[#0d472b]"
                  />
                </div>

                <div className="p-3.5 bg-[#F0F8F2] border border-[#198754]/30 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between text-[#0d472b]">
                    <span>Seminar Registration:</span>
                    <Currency amount={activeSeminarModal.registrationPrice} />
                  </div>
                  <div className="flex justify-between text-[#0d472b]">
                    <span>Platform Fee (Fixed):</span>
                    <Currency amount={platformFee} />
                  </div>
                  <FeeDisclosureBadge feeNgn={platformFee} className="w-full justify-center" />
                  <div className="pt-2 border-t border-[#198754]/20 flex justify-between font-bold text-[#146C43] text-sm">
                    <span>Total Amount Payable:</span>
                    <Currency
                      amount={activeSeminarModal.registrationPrice + platformFee}
                      className="text-[#198754] font-black"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-[#198754] hover:bg-[#146C43] disabled:opacity-60 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? 'Reserving Seat...' : 'Pay via Paystack & Confirm Seat'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
