import React from 'react';
import { useBusiness } from '../context/BusinessContext';
import { AlertTriangle, Phone, RefreshCw, ArrowLeft, ArrowRight } from 'lucide-react';

interface PaymentFailedPageProps {
  navigate: (path: string) => void;
}

export const PaymentFailedPage: React.FC<PaymentFailedPageProps> = ({ navigate }) => {
  const { settings } = useBusiness();

  return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6 bg-white text-[#0d472b]">
      <div className="w-16 h-16 bg-[#F0F8F2] border-2 border-[#198754]/40 rounded-full flex items-center justify-center mx-auto text-[#198754]">
        <AlertTriangle className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-bold text-[#146C43] uppercase tracking-wide">
          Transaction Incomplete or Cancelled
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#146C43]">
          Payment Was Not Completed
        </h1>
        <p className="text-xs sm:text-sm text-[#0d472b] leading-relaxed max-w-md mx-auto">
          The transaction could not be verified by Paystack, was interrupted, or may still be processing with your bank. No money has been deducted from unverified slots.
        </p>
      </div>

      <div className="p-4 bg-[#F0F8F2] rounded-2xl border-2 border-[#198754]/30 text-xs text-left text-[#0d472b] space-y-2">
        <div className="font-bold text-[#146C43]">What happens next?</div>
        <p>• If money was debited by your bank, Paystack typically settles or rolls back within 24 hours.</p>
        <p>• Any temporary seat or seedling reservation will be released safely to prevent inventory lock.</p>
        <p>• You may re-attempt payment or contact our office for direct bank transfer support.</p>
      </div>

      <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
        <button
          onClick={() => navigate('/cart')}
          className="py-3 px-5 rounded-xl bg-[#198754] hover:bg-[#146C43] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Try Again</span>
        </button>
        <button
          onClick={() => navigate('/')}
          className="py-3 px-5 rounded-xl bg-white border-2 border-[#198754]/30 hover:bg-[#F0F8F2] text-[#146C43] font-bold text-xs sm:text-sm cursor-pointer"
        >
          Return to Home
        </button>
      </div>

      <div className="pt-4 text-xs text-[#0d472b]">
        Need support? Call us directly:{' '}
        <a href={`tel:${settings.businessPhone}`} className="text-[#146C43] font-bold underline">
          {settings.businessPhone}
        </a>
      </div>
    </div>
  );
};
