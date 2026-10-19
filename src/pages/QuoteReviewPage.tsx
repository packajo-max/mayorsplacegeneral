import React, { useState, useEffect } from 'react';
import { Currency } from '../components/Currency';
import { useBusiness } from '../context/BusinessContext';
import {
  FileText,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

interface QuoteReviewPageProps {
  navigate: (path: string) => void;
  quoteId?: string;
}

export const QuoteReviewPage: React.FC<QuoteReviewPageProps> = ({ navigate, quoteId }) => {
  const { settings } = useBusiness();
  const [quote, setQuote] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cleanId = quoteId || window.location.pathname.split('/').pop() || '';

  useEffect(() => {
    try {
      const savedQuotes = JSON.parse(localStorage.getItem('agro_quotes_list') || '[]');
      const found = savedQuotes.find((q: any) => q.enquiryReference === cleanId);
      if (found) {
        setQuote(found);
      } else {
        setQuote({
          enquiryReference: cleanId || 'LIV_SAMPLE_123',
          customerName: 'Chief Emmanuel Adeleke',
          customerPhone: '08031234567',
          eventType: 'Grand Golden Jubilee & Reception',
          eventDate: '2026-11-28',
          startTime: '11:00 AM (WAT)',
          location: 'Federal Palace Hotel Grand Hall, Victoria Island, Lagos',
          durationHours: 6,
          preferredPlatform: 'YouTube Live 4K + Zoom VIP Interactive',
          quotedPrice: 165000,
          quoteStatus: 'quoted',
          quoteConditions: 'Includes 3-camera 4K live switching, bonded dual Starlink + MTN LTE network, master recording flash drive, and digital lower-third titles.',
          quoteExpiresAt: '2026-11-20',
          pricingType: 'custom_quote',
          paymentStatus: 'unpaid',
        });
      }
    } catch {
      setError('Could not load quotation details.');
    } finally {
      setLoading(false);
    }
  }, [cleanId]);

  const platformFee = settings.platformFeeNgn || 60;
  const quotedPrice = quote?.quotedPrice || 0;
  const totalPayable = quotedPrice + platformFee;

  const handleAcceptAndPay = async () => {
    if (!quote || quotedPrice <= 0) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'livestream',
          relatedId: quote.enquiryReference,
          customerName: quote.customerName,
          customerPhone: quote.customerPhone,
          customerEmail: quote.customerEmail,
          businessAmount: quotedPrice,
          bookingData: {
            ...quote,
            platformFee,
            totalAmount: totalPayable,
            quoteStatus: 'accepted',
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Payment gateway failed');
      }

      if (data.authorizationUrl.startsWith('/')) {
        navigate(data.authorizationUrl);
      } else {
        window.location.href = data.authorizationUrl;
      }
    } catch (err: any) {
      setError(err.message || 'Payment initialization failed');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-sm text-[#0d472b] bg-white">Loading quotation...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8 animate-in fade-in bg-white text-[#0d472b]">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0F8F2] text-[#146C43] text-xs font-bold border border-[#198754]/30">
          <FileText className="w-3.5 h-3.5 text-[#198754]" />
          <span>Official Event Quotation</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[#146C43] tracking-tight">
          Review & Accept Quotation
        </h1>
        <p className="text-xs sm:text-sm text-[#0d472b]">
          Enquiry Reference: <span className="font-mono font-bold text-[#146C43]">{quote.enquiryReference}</span>
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border-2 border-[#198754]/30 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#198754]/20">
          <div>
            <span className="text-xs text-[#0d472b] font-bold">Client Name</span>
            <div className="font-bold text-[#146C43] text-base">{quote.customerName}</div>
          </div>
          <div className="text-right">
            <span className="text-xs text-[#0d472b] font-bold">Status</span>
            <div className="text-[#146C43] font-bold text-xs bg-[#F0F8F2] border border-[#198754]/30 px-2.5 py-0.5 rounded-full capitalize">
              {quote.quoteStatus || 'Pending Acceptance'}
            </div>
          </div>
        </div>

        {/* Event details */}
        <div className="space-y-2.5 text-xs sm:text-sm">
          <div className="flex justify-between py-1 border-b border-[#198754]/10">
            <span className="text-[#0d472b]">Event Description:</span>
            <span className="font-bold text-[#146C43]">{quote.eventType}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-[#198754]/10">
            <span className="text-[#0d472b]">Event Date:</span>
            <span className="font-bold text-[#146C43]">{quote.eventDate}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-[#198754]/10">
            <span className="text-[#0d472b]">Start Time:</span>
            <span className="font-bold text-[#146C43]">{quote.startTime}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-[#198754]/10">
            <span className="text-[#0d472b]">Physical Venue:</span>
            <span className="font-bold text-[#146C43] text-right max-w-xs">{quote.location}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-[#198754]/10">
            <span className="text-[#0d472b]">Coverage Duration:</span>
            <span className="font-bold text-[#146C43]">{quote.durationHours} Hours</span>
          </div>
        </div>

        {/* Scope and Conditions */}
        {quote.quoteConditions && (
          <div className="p-4 bg-[#F0F8F2] rounded-xl border border-[#198754]/30 text-xs space-y-1 text-[#0d472b]">
            <span className="font-bold block uppercase tracking-wide text-[#146C43]">
              Quotation Scope & Equipment:
            </span>
            <p className="leading-relaxed text-[#0d472b]">{quote.quoteConditions}</p>
          </div>
        )}

        {/* Price Breakdown */}
        <div className="pt-3 border-t border-[#198754]/20 space-y-2 text-xs sm:text-sm">
          <div className="flex justify-between text-[#0d472b]">
            <span>Production Quotation Fee:</span>
            <Currency amount={quotedPrice} />
          </div>
          <div className="pt-3 border-t border-[#198754]/20 flex justify-between font-extrabold text-[#146C43] text-base sm:text-lg">
            <span>Total Payable:</span>
            <Currency amount={quotedPrice} className="text-[#198754] text-xl font-black" />
          </div>
        </div>

        <button
          onClick={handleAcceptAndPay}
          disabled={isSubmitting || quotedPrice <= 0}
          className="w-full py-3.5 px-4 rounded-xl bg-[#198754] hover:bg-[#146C43] disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-[#198754]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {isSubmitting ? 'Initializing Paystack...' : 'Accept Quotation & Pay via Paystack'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
