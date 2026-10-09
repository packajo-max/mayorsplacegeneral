import React, { useState } from 'react';
import { useBusiness } from '../context/BusinessContext';
import { LIVESTREAM_EVENT_TYPES, LIVESTREAM_PACKAGES } from '../lib/constants';
import { Currency, FeeDisclosureBadge } from '../components/Currency';
import {
  Video,
  Radio,
  CheckCircle,
  Clock,
  Sparkles,
  MapPin,
  Calendar,
  Phone,
  ArrowRight,
  AlertCircle,
  FileText
} from 'lucide-react';

interface LiveStreamPageProps {
  navigate: (path: string) => void;
}

export const LiveStreamPage: React.FC<LiveStreamPageProps> = ({ navigate }) => {
  const { settings } = useBusiness();
  const [activeTab, setActiveTab] = useState<'packages' | 'custom_quote'>('packages');

  const [selectedPackage, setSelectedPackage] = useState<any>(LIVESTREAM_PACKAGES[0]);
  const [eventType, setEventType] = useState(LIVESTREAM_EVENT_TYPES[0]);
  const [eventDate, setEventDate] = useState(() => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek.toISOString().split('T')[0];
  });
  const [startTime, setStartTime] = useState('10:00 AM');
  const [location, setLocation] = useState('');
  const [durationHours, setDurationHours] = useState(4);
  const [audienceSize, setAudienceSize] = useState('100 - 300 online guests');
  const [preferredPlatform, setPreferredPlatform] = useState('YouTube Live + Zoom');
  const [technicalRequirements, setTechnicalRequirements] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enquirySuccessRef, setEnquirySuccessRef] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const platformFee = settings.platformFeeNgn || 60;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerName.trim() || !customerPhone.trim() || !location.trim()) {
      setErrorMessage('Please provide your name, contact phone number, and physical event location.');
      return;
    }

    setIsSubmitting(true);

    try {
      const isFixed = activeTab === 'packages' && selectedPackage.price > 0;
      const ref = `LIV_${Date.now().toString().slice(-6)}`;

      if (isFixed) {
        // Fixed package direct Paystack payment flow
        const businessAmount = selectedPackage.price;
        const totalAmount = businessAmount + platformFee;

        const res = await fetch('/api/paystack/initialize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            category: 'livestream',
            relatedId: ref,
            customerName: customerName.trim(),
            customerPhone: customerPhone.trim(),
            customerEmail: customerEmail.trim() || undefined,
            businessAmount,
            bookingData: {
              enquiryReference: ref,
              packageName: selectedPackage.name,
              eventType,
              eventDate,
              startTime,
              location: location.trim(),
              durationHours,
              preferredPlatform,
              technicalRequirements: technicalRequirements.trim(),
              pricingType: 'fixed',
              quotedPrice: businessAmount,
              platformFee,
              totalAmount,
            },
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to initialize booking payment');
        }

        if (data.authorizationUrl.startsWith('/')) {
          navigate(data.authorizationUrl);
        } else {
          window.location.href = data.authorizationUrl;
        }
      } else {
        // Custom Quotation Request flow
        const bookingData = {
          enquiryReference: ref,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerEmail: customerEmail.trim() || undefined,
          eventType,
          eventDate,
          startTime,
          location: location.trim(),
          durationHours,
          audienceSize,
          preferredPlatform,
          technicalRequirements: technicalRequirements.trim(),
          notes: notes.trim(),
          pricingType: 'custom_quote',
          quoteStatus: 'pending_review',
          paymentStatus: 'unpaid',
          createdAt: new Date().toISOString(),
        };

        const existingQuotes = JSON.parse(localStorage.getItem('agro_quotes_list') || '[]');
        localStorage.setItem('agro_quotes_list', JSON.stringify([bookingData, ...existingQuotes]));

        setEnquirySuccessRef(ref);
        setIsSubmitting(false);
      }
    } catch (err: any) {
      console.error('Livestream booking failed:', err);
      setErrorMessage(err.message || 'Submission failed');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 bg-white text-[#0d472b]">
      {/* Header */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-[#198754] uppercase tracking-wider block">
          Broadcast Engineering & Event Media
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#146C43] tracking-tight">
          Live-Streaming & Event Coverage
        </h1>
        <p className="text-sm text-[#0d472b] max-w-2xl leading-relaxed">
          Professional live streaming, audio-visual production, and multimedia coverage for weddings, funerals, conferences, and corporate events.
        </p>
      </div>

      {/* Mode selection tabs */}
      <div className="flex border-b border-[#198754]/20">
        <button
          onClick={() => {
            setActiveTab('packages');
            setEnquirySuccessRef(null);
          }}
          className={`py-3 px-5 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'packages'
              ? 'border-[#198754] text-[#146C43] bg-[#F0F8F2]'
              : 'border-transparent text-[#0d472b] hover:text-[#198754]'
          }`}
        >
          <span>Fixed Broadcast Packages</span>
        </button>
        <button
          onClick={() => {
            setActiveTab('custom_quote');
            setEnquirySuccessRef(null);
          }}
          className={`py-3 px-5 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'custom_quote'
              ? 'border-[#198754] text-[#146C43] bg-[#F0F8F2]'
              : 'border-transparent text-[#0d472b] hover:text-[#198754]'
          }`}
        >
          <Sparkles className="w-4 h-4 text-[#198754]" />
          <span>Custom Event Quotation</span>
        </button>
      </div>

      {enquirySuccessRef ? (
        <div className="bg-[#F0F8F2] border-2 border-[#198754] rounded-3xl p-8 max-w-xl mx-auto text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-white border border-[#198754]/30 rounded-2xl flex items-center justify-center text-[#198754] mx-auto shadow-xs">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-[#146C43]">
            Quotation Request Submitted!
          </h2>
          <p className="text-sm text-[#0d472b] leading-relaxed">
            Your enquiry reference is <span className="font-mono font-bold text-[#198754] text-base">{enquirySuccessRef}</span>.
            Our technical director is reviewing your event specifications. You will receive an SMS and email notification with your customized quotation shortly.
          </p>
          <div className="pt-3 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => navigate(`/quote/${enquirySuccessRef}`)}
              className="px-5 py-2.5 rounded-xl bg-[#198754] hover:bg-[#146C43] text-white font-bold text-xs shadow-xs cursor-pointer"
            >
              View Quote Details
            </button>
            <button
              onClick={() => {
                setEnquirySuccessRef(null);
                setActiveTab('packages');
              }}
              className="px-5 py-2.5 rounded-xl bg-white border-2 border-[#198754]/30 text-[#146C43] hover:bg-[#F0F8F2] font-semibold text-xs cursor-pointer"
            >
              Book Another Event
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Event Packages & Types (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-xs font-bold text-[#146C43] uppercase tracking-wider">
              {activeTab === 'packages' ? 'Select Broadcast Package' : 'Custom Event Quotation'}
            </h3>

            {activeTab === 'packages' ? (
              <div className="space-y-3.5">
                {LIVESTREAM_PACKAGES.map((pkg) => {
                  const isSelected = selectedPackage.id === pkg.id;
                  return (
                    <div
                      key={pkg.id}
                      onClick={() => setSelectedPackage(pkg)}
                      className={`p-5 rounded-2xl border-2 transition-all cursor-pointer space-y-2.5 ${
                        isSelected
                          ? 'border-[#198754] bg-[#F0F8F2] shadow-sm ring-2 ring-[#198754]/20'
                          : 'border-[#198754]/20 bg-white hover:border-[#198754]/50 hover:bg-[#F0F8F2]/40'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h4 className="font-bold text-[#146C43] text-base">{pkg.name}</h4>
                          <span className="text-xs text-[#198754] font-semibold">
                            {pkg.durationHours} hours coverage
                          </span>
                        </div>
                        {pkg.price > 0 ? (
                          <Currency amount={pkg.price} className="text-lg font-black text-[#198754]" />
                        ) : (
                          <span className="text-[11px] font-bold bg-[#F0F8F2] border border-[#198754]/30 text-[#146C43] px-2 py-0.5 rounded-md">
                            Custom Quote
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-[#0d472b] leading-relaxed">{pkg.description}</p>

                      <div className="space-y-1 pt-2 border-t border-[#198754]/20">
                        {pkg.features.map((feat: string, i: number) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-[#0d472b]">
                            <CheckCircle className="w-3.5 h-3.5 text-[#198754] shrink-0" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-[#F0F8F2] border-2 border-[#198754]/30 p-6 rounded-2xl space-y-3 text-xs leading-relaxed text-[#0d472b]">
                <h4 className="text-sm font-bold text-[#146C43] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#198754]" />
                  Custom Quotation Process
                </h4>
                <p>1. Enter your ceremony or conference venue, date, and expected hours.</p>
                <p>2. Specify multi-camera, audio relay, or drone requirements.</p>
                <p>3. Receive an official quotation via SMS with direct Paystack payment link.</p>
              </div>
            )}
          </div>

          {/* Right Column: Event Form (7 cols) */}
          <div className="lg:col-span-7">
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl border-2 border-[#198754]/30 p-6 sm:p-7 shadow-xs space-y-5"
            >
              <div>
                <h3 className="text-base font-bold text-[#146C43]">
                  {activeTab === 'packages'
                    ? `Book ${selectedPackage.name}`
                    : 'Submit Event Details for Quotation'}
                </h3>
                <p className="text-xs text-[#0d472b] mt-0.5">
                  Enter event information. No customer account required.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                  <span className="font-semibold">{errorMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#146C43] mb-1">
                    Event Type <span className="text-[#198754]">*</span>
                  </label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border-2 border-[#198754]/30 focus:border-[#198754] focus:outline-none bg-white text-[#0d472b]"
                  >
                    {LIVESTREAM_EVENT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#146C43] mb-1">
                    Event Date <span className="text-[#198754]">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 text-sm rounded-xl border-2 border-[#198754]/30 focus:border-[#198754] focus:outline-none bg-white text-[#0d472b]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#146C43] mb-1">
                    Event Start Time (WAT / Lagos) <span className="text-[#198754]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 10:00 AM"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border-2 border-[#198754]/30 focus:border-[#198754] focus:outline-none bg-white text-[#0d472b]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#146C43] mb-1">
                    Expected Duration (Hours)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={24}
                    value={durationHours}
                    onChange={(e) => setDurationHours(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-xl border-2 border-[#198754]/30 focus:border-[#198754] focus:outline-none bg-white text-[#0d472b]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#146C43] mb-1">
                  Event Venue / Physical Address <span className="text-[#198754]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Landmark Centre, Water Corporation Road, Victoria Island, Lagos"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border-2 border-[#198754]/30 focus:border-[#198754] focus:outline-none bg-white text-[#0d472b]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#146C43] mb-1">
                  Additional Technical Requirements (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Drone footage, projector feeds, wireless mics, YouTube or Zoom links..."
                  value={technicalRequirements}
                  onChange={(e) => setTechnicalRequirements(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border-2 border-[#198754]/30 focus:border-[#198754] focus:outline-none bg-white text-[#0d472b]"
                />
              </div>

              {/* Customer Contact */}
              <div className="pt-3 border-t border-[#198754]/20 space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#146C43] mb-1">
                      Full Name <span className="text-[#198754]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Chief Adeleke"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl border-2 border-[#198754]/30 focus:border-[#198754] focus:outline-none bg-white text-[#0d472b]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#146C43] mb-1">
                      Phone Number (For SMS) <span className="text-[#198754]">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 08023456789"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl border-2 border-[#198754]/30 focus:border-[#198754] focus:outline-none bg-white text-[#0d472b]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#146C43] mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. adeleke@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border-2 border-[#198754]/30 focus:border-[#198754] focus:outline-none bg-white text-[#0d472b]"
                  />
                </div>
              </div>

              {/* Price disclosure if fixed */}
              {activeTab === 'packages' && selectedPackage.price > 0 && (
                <div className="p-4 bg-[#F0F8F2] border border-[#198754]/30 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between text-[#0d472b]">
                    <span>Package Price:</span>
                    <Currency amount={selectedPackage.price} />
                  </div>
                  <div className="flex justify-between text-[#0d472b]">
                    <span>Platform Fee (Fixed):</span>
                    <Currency amount={platformFee} />
                  </div>
                  <FeeDisclosureBadge feeNgn={platformFee} className="w-full justify-center" />
                  <div className="pt-2 border-t border-[#198754]/20 flex justify-between font-bold text-[#146C43] text-sm">
                    <span>Total Payable:</span>
                    <Currency
                      amount={selectedPackage.price + platformFee}
                      className="text-[#198754] font-black text-base"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl bg-[#198754] hover:bg-[#146C43] disabled:opacity-60 text-white font-bold text-sm shadow-md shadow-[#198754]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  'Processing...'
                ) : activeTab === 'packages' && selectedPackage.price > 0 ? (
                  <>
                    <span>Proceed to Paystack Payment</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Submit Enquiry for Quotation</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
