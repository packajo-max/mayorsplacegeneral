import React, { useEffect, useState } from 'react';
import { Currency } from '../components/Currency';
import { useBusiness } from '../context/BusinessContext';
import {
  CheckCircle2,
  Calendar,
  PackageCheck,
  ArrowRight,
  Loader2
} from 'lucide-react';

interface PaymentSuccessPageProps {
  navigate: (path: string) => void;
  reference?: string;
}

export const PaymentSuccessPage: React.FC<PaymentSuccessPageProps> = ({ navigate, reference }) => {
  const { settings } = useBusiness();
  const [loading, setLoading] = useState(true);
  const [verificationResult, setVerificationResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const queryRef = reference || new URLSearchParams(window.location.search).get('reference');

    if (!queryRef) {
      setError('No transaction reference found in callback.');
      setLoading(false);
      return;
    }

    const verifyTransaction = async () => {
      try {
        const res = await fetch(`/api/paystack/verify/${encodeURIComponent(queryRef)}`);
        const data = await res.json();
        if (!res.ok || !data.verified) {
          throw new Error(data.message || 'Payment verification could not be confirmed.');
        }
        setVerificationResult(data);
      } catch (err: any) {
        console.error('Verification error:', err);
        setError(err.message || 'Verification failed');
      } finally {
        setLoading(false);
      }
    };

    verifyTransaction();
  }, [reference]);

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4 bg-white text-[#0d472b]">
        <Loader2 className="w-12 h-12 text-[#198754] animate-spin mx-auto" />
        <h2 className="text-xl font-bold text-[#146C43]">Verifying Payment with Paystack...</h2>
        <p className="text-xs text-[#0d472b]">
          Please wait while our server confirms your transaction.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-5 bg-white text-[#0d472b]">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600 font-bold text-xl">
          ✕
        </div>
        <h2 className="text-2xl font-bold text-[#146C43]">Payment Verification Failed</h2>
        <p className="text-sm text-[#0d472b]">{error}</p>
        <div className="pt-2 flex justify-center gap-3">
          <button
            onClick={() => navigate('/payment-failed')}
            className="px-5 py-2.5 rounded-xl bg-[#198754] hover:bg-[#146C43] text-white text-xs font-bold cursor-pointer"
          >
            Review Payment Options
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 space-y-8 animate-in fade-in bg-white text-[#0d472b]">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 bg-[#F0F8F2] border-2 border-[#198754]/30 rounded-2xl flex items-center justify-center mx-auto text-[#198754] shadow-xs">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <span className="text-xs font-bold text-[#198754] uppercase tracking-wider block">
          Payment Confirmed
        </span>
        <h1 className="text-3xl font-extrabold text-[#146C43] tracking-tight">
          Payment Successful!
        </h1>
        <p className="text-sm text-[#0d472b] max-w-md mx-auto">
          Thank you for choosing MAYORS PLACE GENERAL INVESTMENT LIMITED. Your transaction has been verified server-side.
        </p>
      </div>

      {verificationResult && (
        <div className="bg-white rounded-2xl border-2 border-[#198754]/30 p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#198754]/20 text-xs">
            <div>
              <span className="text-[#0d472b] block font-mono font-bold">Reference</span>
              <span className="font-mono font-bold text-[#146C43] text-sm">
                {verificationResult.reference}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[#0d472b] block font-bold">Status</span>
              <span className="text-[#146C43] font-bold bg-[#F0F8F2] border border-[#198754]/30 px-2.5 py-0.5 rounded-full">
                Verified (NGN)
              </span>
            </div>
          </div>

          <div className="space-y-2.5 text-xs sm:text-sm">
            <div className="flex justify-between py-1 border-b border-[#198754]/10">
              <span className="text-[#0d472b]">Service Category:</span>
              <span className="font-bold text-[#146C43] capitalize">
                {verificationResult.category?.replace('_', ' ')}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#198754]/10">
              <span className="text-[#0d472b]">Customer Name:</span>
              <span className="font-bold text-[#146C43]">{verificationResult.customerName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#198754]/10">
              <span className="text-[#0d472b]">Contact Phone:</span>
              <span className="font-bold text-[#146C43]">{verificationResult.customerPhone}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#198754]/10">
              <span className="text-[#0d472b]">Service Fee:</span>
              <Currency amount={verificationResult.businessAmount} />
            </div>
            <div className="flex justify-between py-1 border-b border-[#198754]/10">
              <span className="text-[#0d472b]">Platform Fee:</span>
              <Currency amount={verificationResult.platformFee} />
            </div>
            <div className="flex justify-between py-2 border-b border-[#198754]/20 font-extrabold text-[#146C43] text-base">
              <span>Total Paid:</span>
              <Currency amount={verificationResult.totalAmount} className="text-[#198754] text-lg font-black" />
            </div>
          </div>

          {/* Fulfilment Guidance based on category */}
          {verificationResult.category === 'agricultural_order' ? (
            <div className="p-4 rounded-xl bg-[#F0F8F2] border-2 border-[#198754]/30 text-xs text-[#0d472b] space-y-1.5">
              <div className="font-bold text-[#146C43] flex items-center gap-1.5">
                <PackageCheck className="w-4 h-4 text-[#198754]" />
                Order Confirmed & Collection Pickup Address
              </div>
              <p>
                Your order payment has been verified. An SMS and email order confirmation have been dispatched. Your items will be prepared for collection at:{' '}
                <strong className="text-[#146C43]">{settings.collectionAddress}</strong>.
              </p>
            </div>
          ) : (verificationResult.requiresPDF && verificationResult.emailSent) ? (
            <div className="p-4 rounded-xl bg-[#F0F8F2] border-2 border-[#198754]/30 text-xs text-[#0d472b] space-y-2">
              <div className="font-bold text-[#146C43] flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#198754]" />
                Schedule Confirmed & PDF Guide Dispatched
              </div>
              <p>
                Your appointment slot is locked. An SMS confirmation and your prepared consultation advisory PDF guide have been dispatched to your provided contact details.
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-[#F0F8F2] border-2 border-[#198754]/30 text-xs text-[#0d472b] space-y-2">
              <div className="font-bold text-[#146C43] flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#198754]" />
                Appointment Schedule Confirmed
              </div>
              <p>
                Your appointment slot is locked. An SMS booking confirmation has been dispatched to your phone number. Our team will contact you prior to your scheduled session.
              </p>
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('/status')}
              className="flex-1 py-3 px-4 rounded-xl bg-[#198754] hover:bg-[#146C43] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <span>Track Booking / Order</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/')}
              className="py-3 px-5 rounded-xl bg-[#F0F8F2] hover:bg-[#198754] hover:text-white text-[#146C43] font-bold text-xs sm:text-sm cursor-pointer transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
