import React, { useState, useEffect } from 'react';
import { useBusiness } from '../context/BusinessContext';
import { ServiceItem } from '../types';
import { Currency } from '../components/Currency';
import {
  Clock,
  Calendar as CalendarIcon,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Mail,
  Download
} from 'lucide-react';

interface AppointmentsPageProps {
  navigate: (path: string) => void;
  selectedServiceId?: string;
}

export const AppointmentsPage: React.FC<AppointmentsPageProps> = ({ navigate, selectedServiceId }) => {
  const { services, settings } = useBusiness();
  const activeServices = services.filter((s) => s.active);

  const [selectedService, setSelectedService] = useState<ServiceItem | null>(() => {
    if (selectedServiceId) {
      const found = activeServices.find((s) => s.id === selectedServiceId);
      if (found) return found;
    }
    return activeServices[0] || null;
  });

  useEffect(() => {
    const urlParam = selectedServiceId || new URLSearchParams(window.location.search).get('service');
    if (urlParam && activeServices.length > 0) {
      const matched = activeServices.find((s) => s.id === urlParam);
      if (matched) {
        setSelectedService(matched);
      }
    }
  }, [selectedServiceId, activeServices]);

  const [date, setDate] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [selectedSlot, setSelectedSlot] = useState<string>('10:00 AM');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const businessPrice = selectedService?.price || 0;
  const platformFee = settings.platformFeeNgn || 60;
  const totalAmount = businessPrice + platformFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedService) {
      setErrorMessage('Please select an appointment or consultation service.');
      return;
    }
    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMessage('Please provide your full name and contact phone number.');
      return;
    }
    if (!customerEmail.trim()) {
      setErrorMessage('Please enter your email address so we can dispatch your consultation advisory PDF.');
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
      const isConsultation = selectedService.name.toLowerCase().includes('consultation') || businessPrice === 25000;
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
            serviceId: selectedService.id,
            serviceName: selectedService.name,
            product_name: selectedService.name,
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

      const redirectUrl = data.authorizationUrl || data.authorization_url;
      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        throw new Error('No authorization URL received from payment provider.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during booking checkout.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 bg-white text-[#0d472b]">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0F8F2] border border-[#198754]/30 text-[#146C43] text-xs font-bold">
          <CalendarIcon className="w-3.5 h-3.5 text-[#198754]" />
          <span>Professional Consultation Schedule</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#146C43] tracking-tight">
          Appointments & Consultations
        </h1>
        <p className="text-sm text-[#0d472b] max-w-2xl leading-relaxed">
          Book an advisory session for General Information, Guidance and Other Services, our Tourist / Business Package, or a dedicated Consultation session.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-[#F0F8F2] border-2 border-red-500 text-red-700 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
          <span className="font-semibold">{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Services selection list (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#146C43]">
              Available Consultation Services ({activeServices.length})
            </h2>
            <span className="text-xs text-[#198754] font-bold">
              Green and White Guaranteed
            </span>
          </div>

          <div className="space-y-3.5">
            {activeServices.map((service) => {
              const isSelected = selectedService?.id === service.id;
              return (
                <div
                  key={service.id}
                  onClick={() => setSelectedService(service)}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isSelected
                      ? 'border-[#198754] bg-[#F0F8F2] shadow-sm ring-2 ring-[#198754]/20'
                      : 'border-[#198754]/20 bg-white hover:border-[#198754]/50 hover:bg-[#F0F8F2]/40'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#F0F8F2] text-[#198754] border border-[#198754]/30 flex items-center justify-center shrink-0 mt-0.5">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-[#146C43] text-base leading-snug">
                        {service.name}
                      </h3>
                      <p className="text-xs text-[#0d472b] leading-relaxed">
                        {service.description}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-[#146C43] pt-1">
                        <span className="font-semibold text-[#198754] flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {service.durationMinutes} mins
                        </span>
                        <span>•</span>
                        <Currency amount={service.price} className="font-black text-[#146C43] text-sm" />
                      </div>
                    </div>
                  </div>

                  <div className="self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedService(service);
                      }}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-[#198754] text-white shadow-xs'
                          : 'bg-[#F0F8F2] hover:bg-[#198754] hover:text-white text-[#146C43] border border-[#198754]/30'
                      }`}
                    >
                      <span>{isSelected ? 'Book Now (Active)' : 'Book Now'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Schedule Date & Slot Selection */}
          <div className="bg-white border-2 border-[#198754]/20 rounded-2xl p-6 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-[#146C43]">
              Select Appointment Date & Time
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#146C43] mb-1">
                  Preferred Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 text-sm rounded-xl border-2 border-[#198754]/30 focus:border-[#198754] focus:outline-none bg-white text-[#0d472b]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#146C43] mb-1">
                  Time Slot (WAT / Lagos)
                </label>
                <select
                  value={selectedSlot}
                  onChange={(e) => setSelectedSlot(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border-2 border-[#198754]/30 focus:border-[#198754] focus:outline-none bg-white text-[#0d472b]"
                >
                  {(selectedService?.timeSlots || ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM']).map(
                    (slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>

            {selectedService?.bookingInstructions && (
              <div className="p-3 bg-[#F0F8F2] rounded-xl text-xs text-[#146C43] border border-[#198754]/30">
                <span className="font-bold">Preparation Advice: </span>
                {selectedService.bookingInstructions}
              </div>
            )}
          </div>
        </div>

        {/* Right: Booking Form & Checkout Summary (5 cols) */}
        <div className="lg:col-span-5">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl border-2 border-[#198754]/30 p-6 sm:p-7 shadow-xs space-y-5 sticky top-28"
          >
            <div>
              <h3 className="text-base font-bold text-[#146C43]">
                Client Information
              </h3>
              <p className="text-xs text-[#0d472b] mt-0.5">
                No customer account required. We verify appointments via SMS & email.
              </p>
            </div>

            <div className="space-y-3.5">
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
                  className="w-full px-3 py-2 text-sm rounded-xl border-2 border-[#198754]/30 focus:border-[#198754] focus:outline-none bg-white text-[#0d472b]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#146C43] mb-1">
                  Phone Number (For Confirmation SMS) <span className="text-[#198754]">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 08031234567"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border-2 border-[#198754]/30 focus:border-[#198754] focus:outline-none bg-white text-[#0d472b]"
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
                  className="w-full px-3 py-2 text-sm rounded-xl border-2 border-[#198754]/30 focus:border-[#198754] focus:outline-none bg-white text-[#0d472b]"
                />
                <span className="text-[11px] text-[#146C43] mt-1 block">
                  Automatic consultation advisory PDF pack will be dispatched to this email upon booking.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#146C43] mb-1">
                  Consultation Notes or Enquiries (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Briefly state your key questions or enquiry details..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border-2 border-[#198754]/30 focus:border-[#198754] focus:outline-none bg-white text-[#0d472b]"
                />
              </div>
            </div>

            {/* Price breakdown */}
            <div className="pt-4 border-t border-[#198754]/20 space-y-2 text-sm">
              <div className="flex justify-between text-[#0d472b] text-xs">
                <span>Selected Service:</span>
                <span className="font-bold text-[#146C43] text-right max-w-[200px] truncate">{selectedService?.name}</span>
              </div>
              <div className="flex justify-between text-[#0d472b]">
                <span>Consultation Fee:</span>
                <Currency amount={businessPrice} className="font-bold text-[#146C43]" />
              </div>

              <div className="pt-3 border-t border-[#198754]/20 flex justify-between items-center text-base font-extrabold text-[#146C43]">
                <span>Total Amount:</span>
                <Currency amount={businessPrice} className="text-[#198754] text-lg font-black" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !selectedService}
              className="w-full py-3.5 px-4 rounded-xl bg-[#198754] hover:bg-[#146C43] disabled:opacity-60 text-white font-bold text-sm shadow-md shadow-[#198754]/20 transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
            >
              {isSubmitting ? (
                <span>Initializing Checkout...</span>
              ) : (
                <>
                  <span>Pay with Paystack</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-[11px] text-[#146C43] text-center flex items-center justify-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-[#198754] shrink-0" />
              <span>Double-booking protected by server concurrency validation.</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
