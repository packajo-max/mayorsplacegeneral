import React, { useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { LiveStreamBooking } from '../../types';
import { Currency } from '../../components/Currency';
import { dispatchNotification, formatQuoteReadyMessage } from '../../lib/notifications';
import {
  Video,
  Radio,
  FileText,
  Calendar,
  CheckCircle,
  Clock,
  ArrowRight,
  Send,
  X
} from 'lucide-react';

export const AdminLivestream: React.FC = () => {
  const { settings } = useBusiness();

  const [enquiries, setEnquiries] = useState<any[]>([
    {
      id: 'liv-001',
      enquiryReference: 'LIV_841029',
      customerName: 'Engr. Dapo Alabi',
      customerPhone: '08031234567',
      customerEmail: 'dapo@example.com',
      eventType: 'Golden Jubilee & Family Thanksgiving',
      eventDate: '2026-11-28',
      startTime: '10:00 AM',
      location: 'The Civic Centre, Victoria Island, Lagos',
      durationHours: 6,
      audienceSize: '300 online guests',
      preferredPlatform: 'YouTube Live 4K + Zoom VIP Interactive',
      technicalRequirements: 'Need 3 wireless camera angles, wireless lapel microphones, and digital lower-thirds.',
      pricingType: 'custom_quote',
      quoteStatus: 'pending_review',
      paymentStatus: 'unpaid',
      createdAt: '2026-10-09T08:45:00Z',
    },
    {
      id: 'liv-002',
      enquiryReference: 'LIV_721094',
      customerName: 'Pastor Joshua Kayode',
      customerPhone: '08123456789',
      eventType: 'Annual Church Believers Convention',
      eventDate: '2026-12-10',
      startTime: '09:00 AM',
      location: 'RCCG Mega Arena, Redemption Camp, Ogun State',
      durationHours: 8,
      pricingType: 'fixed',
      quotedPrice: 185000,
      quoteStatus: 'accepted',
      paymentStatus: 'paid',
      createdAt: '2026-10-09T09:00:00Z',
    },
  ]);

  // Quoting modal state
  const [activeQuotingItem, setActiveQuotingItem] = useState<any | null>(null);
  const [quotePrice, setQuotePrice] = useState<number>(145000);
  const [conditions, setConditions] = useState(
    'Includes 3 4K cinema cameras, wireless audio receivers, dual Starlink bonding, and raw 1080p recording flash drive.'
  );
  const [expiryDate, setExpiryDate] = useState('2026-11-20');
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handleSendQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeQuotingItem || quotePrice <= 0) return;

    const updated = enquiries.map((enq) => {
      if (enq.id === activeQuotingItem.id) {
        return {
          ...enq,
          quotedPrice: quotePrice,
          quoteConditions: conditions,
          quoteExpiresAt: expiryDate,
          quoteStatus: 'quoted',
        };
      }
      return enq;
    });
    setEnquiries(updated);

    // Save into localStorage for client review lookup
    const existingQuotes = JSON.parse(localStorage.getItem('agro_quotes_list') || '[]');
    const newQuoteObj = {
      ...activeQuotingItem,
      quotedPrice: quotePrice,
      quoteConditions: conditions,
      quoteExpiresAt: expiryDate,
      quoteStatus: 'quoted',
    };
    localStorage.setItem(
      'agro_quotes_list',
      JSON.stringify([newQuoteObj, ...existingQuotes.filter((q: any) => q.enquiryReference !== activeQuotingItem.enquiryReference)])
    );

    // Dispatch SMS notification to customer with quotation link
    const msg = formatQuoteReadyMessage(
      activeQuotingItem.enquiryReference,
      activeQuotingItem.eventType,
      settings.websiteDomain
    );

    await dispatchNotification({
      type: 'quote_dispatched',
      recipientPhone: activeQuotingItem.customerPhone,
      recipientEmail: activeQuotingItem.customerEmail,
      relatedReference: activeQuotingItem.enquiryReference,
      message: msg,
      channel: 'both',
    });

    setSuccessNotice(`Official quotation sent to ${activeQuotingItem.customerName} (${activeQuotingItem.customerPhone})`);
    setActiveQuotingItem(null);
    setTimeout(() => setSuccessNotice(null), 4000);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[#146C43]">Live-Streaming Bookings & Custom Quotes</h1>
        <p className="text-xs sm:text-sm text-[#146C43]">
          Review customer broadcast enquiries, generate itemized quotations, and monitor paid bookings.
        </p>
      </div>

      {successNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-[#198754]/20 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F0F8F2] text-[#146C43] uppercase border-b border-[#198754]/20">
              <tr>
                <th className="py-3 px-4">Enquiry Ref & Client</th>
                <th className="py-3 px-4">Event Details</th>
                <th className="py-3 px-4">Date & Venue</th>
                <th className="py-3 px-4">Quoted Amount</th>
                <th className="py-3 px-4">Quote Status</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#198754]/10">
              {enquiries.map((enq) => (
                <tr key={enq.id} className="hover:bg-[#F0F8F2]">
                  <td className="py-3 px-4">
                    <div className="font-bold font-mono text-emerald-900">{enq.enquiryReference}</div>
                    <div className="font-semibold text-[#146C43]">{enq.customerName}</div>
                    <div className="text-[#146C43] font-mono text-[11px]">{enq.customerPhone}</div>
                  </td>
                  <td className="py-3 px-4 max-w-xs">
                    <div className="font-bold text-[#146C43]">{enq.eventType}</div>
                    <div className="text-[11px] text-[#146C43] line-clamp-1">{enq.technicalRequirements}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-[#146C43]">{enq.eventDate}</div>
                    <div className="text-[#146C43] text-[11px] truncate max-w-xs">{enq.location}</div>
                  </td>
                  <td className="py-3 px-4 font-bold text-[#146C43]">
                    {enq.quotedPrice ? (
                      <Currency amount={enq.quotedPrice} />
                    ) : (
                      <span className="text-[#198754] italic">Pending Quote</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                        enq.quoteStatus === 'quoted'
                          ? 'bg-blue-100 text-blue-800'
                          : enq.quoteStatus === 'accepted'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {enq.quoteStatus?.replace('_', ' ') || 'Pending'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                        enq.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-[#F0F8F2] text-[#0d472b]'
                      }`}
                    >
                      {enq.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {enq.quoteStatus === 'pending_review' ? (
                      <button
                        onClick={() => {
                          setActiveQuotingItem(enq);
                          setQuotePrice(120000);
                        }}
                        className="px-3 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px]"
                      >
                        Create Quote
                      </button>
                    ) : (
                      <a
                        href={`/quote/${enq.enquiryReference}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-semibold text-emerald-800 underline"
                      >
                        View Link
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Quote Modal */}
      {activeQuotingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 relative">
            <button
              onClick={() => setActiveQuotingItem(null)}
              className="absolute top-4 right-4 p-1.5 text-[#198754] hover:text-[#0d472b] rounded-lg hover:bg-[#F0F8F2]"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-xs text-[#198754] font-mono">Quotation Generator</span>
              <h3 className="text-lg font-bold text-[#146C43]">
                Create Quotation for {activeQuotingItem.customerName}
              </h3>
              <p className="text-xs text-[#146C43]">
                Event: {activeQuotingItem.eventType} ({activeQuotingItem.eventDate})
              </p>
            </div>

            <form onSubmit={handleSendQuote} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#0d472b] mb-1">
                  Quoted Service Amount (NGN) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={1000}
                  value={quotePrice}
                  onChange={(e) => setQuotePrice(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[#198754]/30 font-bold"
                />
                <span className="text-[11px] text-[#198754] mt-0.5 block">
                  A fixed ₦{settings.platformFeeNgn} platform fee will automatically be added upon checkout.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0d472b] mb-1">
                  Quotation Conditions & Technical Equipment
                </label>
                <textarea
                  rows={3}
                  value={conditions}
                  onChange={(e) => setConditions(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#198754]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0d472b] mb-1">
                  Quotation Expiry Date
                </label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#198754]/30"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveQuotingItem(null)}
                  className="w-1/2 py-2.5 rounded-xl border border-[#198754]/30 text-[#0d472b] font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Quotation Link</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
