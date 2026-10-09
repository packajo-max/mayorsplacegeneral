import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

export const FaqPage: React.FC<{ navigate: (path: string) => void }> = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Do I need to create a customer account or password?',
      a: 'No. At MAYORS PLACE GENERAL INVESTMENT LIMITED, customers never need to create an account or password. Simply select your service or seedlings, provide your name and phone number, and complete payment securely via Paystack. You can track your booking status securely anytime using an OTP sent to your phone.',
    },
    {
      q: 'What is the ₦60 platform fee?',
      a: 'A fixed platform fee of ₦60 is charged once per successful paid transaction. For an agricultural shopping cart with multiple products, the ₦60 fee applies only once per checkout, not per individual item.',
    },
    {
      q: 'How does seedling pickup and collection work?',
      a: 'The default fulfilment arrangement is customer pickup or collection at our designated nursery hub. When your order is placed, you receive a reference code. Once batched and staged, you receive an SMS notifying you to collect your seedlings. For inter-state transport, please call us directly to discuss arrangements.',
    },
    {
      q: 'What consultation services do you offer?',
      a: 'MAYORS PLACE GENERAL INVESTMENT LIMITED provides three dedicated consultation and advisory services: General Information, Guidance and Other Services (₦300,000), Tourist / Business Package (₦300,000), and Consultation (₦25,000).',
    },
    {
      q: 'What events do you live-stream?',
      a: 'We broadcast weddings, naming ceremonies, birthdays, funerals, housewarmings, church programmes, graduations, conferences, and corporate events across Nigeria.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 bg-white text-[#0d472b]">
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0F8F2] text-[#146C43] text-xs font-bold border border-[#198754]/30">
          <HelpCircle className="w-3.5 h-3.5 text-[#198754]" />
          <span>Help & Information</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#146C43] tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="text-[#0d472b] text-sm">
          Everything you need to know about MAYORS PLACE services, seedlings, and payments.
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl border-2 border-[#198754]/20 overflow-hidden shadow-xs"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full p-5 text-left font-bold text-[#146C43] flex justify-between items-center gap-4 text-sm sm:text-base hover:text-[#198754] cursor-pointer"
              >
                <span>{faq.q}</span>
                {isOpen ? <ChevronUp className="w-5 h-5 text-[#198754] shrink-0" /> : <ChevronDown className="w-5 h-5 text-[#146C43] shrink-0" />}
              </button>
              {isOpen && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-[#0d472b] leading-relaxed border-t border-[#198754]/10 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
