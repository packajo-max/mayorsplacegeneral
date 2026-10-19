import React, { useState, useEffect } from 'react';
import { ServiceItem } from '../types';
import { useBusiness } from '../context/BusinessContext';
import { Currency, FeeDisclosureBadge } from './Currency';
import {
  X,
  Clock,
  Calendar,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Mail,
  Download,
  CheckCircle2,
} from 'lucide-react';

interface ConsultationBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: ServiceItem | null;
  navigate: (path: string) => void;
}

export const ConsultationBookingModal: React.FC<ConsultationBookingModalProps> = ({
  isOpen,
  onClose,
  service,
  navigate,
}) => {
  const { settings } = useBusiness();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [selectedSlot, setSelectedSlot] = useState('10:00 AM');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pdfDispatchedNotice, setPdfDispatchedNotice] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setPdfDispatchedNotice(null);
      if (service?.timeSlots && service.timeSlots.length > 0) {
        setSelectedSlot(service.timeSlots[0]);
      }
    }
  }, [isOpen, service]);

  if (!isOpen || !service) return null;

  const businessPrice = service.price;
  const platformFee = settings.platformFeeNgn || 60;
  const totalAmount = businessPrice + platformFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMessage('Please provide your full name and phone number.');
      return;
    }
    if (!customerEmail.trim()) {
      setErrorMessage('Please enter your email address so we can send your consultation advisory PDF guide.');
      return;
    }
    if (!date || !selectedSlot) {
      setErrorMessage('Please choose your preferred appointment date and time slot.');
      return;
    }

    setIsSubmitting(true);

    try {
      const bookingRef = `APT_${Date.now().toString().slice(-6)}`;

      // Initialize Paystack payment
      const isConsultation = service.name.toLowerCase().includes('consultation') || businessPrice === 25000;
      const res = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'appointment',
          relatedId: bookingRef,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerEmail: customerEmail.trim(),
          businessAmount: businessPrice,
          metadata: {
            serviceId: service.id,
            serviceName: service.name,
            product_name: service.name,
            product_price: businessPrice,
            product_type: isConsultation ? 'consultation' : 'appointment',
            requires_pdf: isConsultation,
            appointmentDate: date,
            appointmentTime: selectedSlot,
            notes: notes.trim(),
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to initialize payment.');
      }

      if (data.authorizationUrl) {
        window.location.href = data.authorizationUrl;
      } else {
        throw new Error('No authorization URL received.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during booking.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl border-2 border-[#198754] w-full max-w-xl max-h-[92vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6 text-[#0d472b]">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#198754]/20 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0F8F2] text-[#146C43] text-xs font-bold border border-[#198754]/30 mb-2">
              <Calendar className="w-3.5 h-3.5 text-[#198754]" />
              <span>Consultation Booking</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#146C43] leading-snug">
              {service.name}
            </h2>
            <p className="text-xs text-[#0d472b] mt-1">
              {service.description}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#146C43] hover:bg-[#F0F8F2] hover:text-[#198754] transition-colors cursor-pointer shrink-0"
            aria-label="Close dialog"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-50 border-2 border-red-500 text-red-700 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
        )}

        {/* Selected Service & Price Tag */}
        <div className="p-4 rounded-2xl bg-[#F0F8F2] border border-[#198754]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="text-xs font-bold text-[#146C43] uppercase tracking-wider">
              Selected Service Fee
            </div>
            <div className="text-xs text-[#0d472b]">
              Duration: <span className="font-bold text-[#146C43]">{service.durationMinutes} minutes</span>
            </div>
          </div>
          <div className="text-right">
            <Currency amount={service.price} className="text-2xl font-black text-[#146C43]" />
          </div>
        </div>

        {/* Booking Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#146C43] mb-1">
                Preferred Date <span className="text-[#198754]">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#198754]/30 focus:border-[#198754] focus:outline-none bg-white text-[#0d472b] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#146C43] mb-1">
                Preferred Time Slot (WAT) <span className="text-[#198754]">*</span>
              </label>
              <select
                value={selectedSlot}
                onChange={(e) => setSelectedSlot(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#198754]/30 focus:border-[#198754] focus:outline-none bg-white text-[#0d472b] text-sm"
              >
                {(service.timeSlots || ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM']).map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#146C43] mb-1">
              Full Name <span className="text-[#198754]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Adeola Johnson"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#198754]/30 focus:border-[#198754] focus:outline-none bg-white text-[#0d472b] text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#146C43] mb-1">
                Phone Number <span className="text-[#198754]">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="e.g. 08031234567"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#198754]/30 focus:border-[#198754] focus:outline-none bg-white text-[#0d472b] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#146C43] mb-1">
                Email Address <span className="text-[#198754]">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="e.g. adeola@example.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#198754]/30 focus:border-[#198754] focus:outline-none bg-white text-[#0d472b] text-sm"
              />
            </div>
          </div>

          <div className="p-3 bg-[#F0F8F2] rounded-xl border border-[#198754]/30 text-xs text-[#0d472b] flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#198754] shrink-0" />
            <span>
              <strong>Automatic PDF Dispatch:</strong> After booking submission, our configured email service automatically sends your prepared consultation advisory PDF guide to your email address.
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#146C43] mb-1">
              Enquiry Details or Specific Questions (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Outline your primary questions or specific needs..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border-2 border-[#198754]/30 focus:border-[#198754] focus:outline-none bg-white text-[#0d472b] text-sm"
            />
          </div>

          {/* Pricing Breakdown */}
          <div className="pt-3 border-t border-[#198754]/20 space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between text-[#0d472b]">
              <span>Consultation Fee:</span>
              <Currency amount={businessPrice} className="font-bold text-[#146C43]" />
            </div>
            <div className="flex justify-between text-[#0d472b]">
              <span>Platform Processing Fee:</span>
              <Currency amount={platformFee} />
            </div>
            <FeeDisclosureBadge feeNgn={platformFee} className="w-full justify-center" />

            <div className="pt-2 border-t border-[#198754]/20 flex justify-between items-center text-base font-extrabold text-[#146C43]">
              <span>Total Payable:</span>
              <Currency amount={totalAmount} className="text-xl font-black text-[#198754]" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#198754] hover:bg-[#146C43] disabled:opacity-60 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
          >
            {isSubmitting ? (
              <span>Processing & Preparing Advisory PDF...</span>
            ) : (
              <>
                <span>Confirm & Pay with Paystack</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="text-[11px] text-[#146C43] text-center flex items-center justify-center gap-1 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-[#198754] shrink-0" />
            <span>Secure split-payment checkout powered by Paystack.</span>
          </div>
        </form>
      </div>
    </div>
  );
};
