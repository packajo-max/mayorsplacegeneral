import React, { useState } from 'react';
import { Currency } from '../components/Currency';
import { useBusiness } from '../context/BusinessContext';
import {
  CreditCard,
  ShieldCheck,
  ArrowRight,
  Server
} from 'lucide-react';

interface PaymentTestCheckoutPageProps {
  navigate: (path: string) => void;
}

export const PaymentTestCheckoutPage: React.FC<PaymentTestCheckoutPageProps> = ({ navigate }) => {
  const { settings } = useBusiness();
  const searchParams = new URLSearchParams(window.location.search);
  const reference = searchParams.get('reference') || `TEST_PAY_${Date.now()}`;
  const totalAmount = Number(searchParams.get('amount') || 30060);
  const platformFee = Number(searchParams.get('fee') || 60);
  const businessAmount = Math.max(0, totalAmount - platformFee);

  const paystackFee = Math.round(
    Math.min(2000, totalAmount * 0.015 + (totalAmount >= 2500 ? 100 : 0))
  );

  const subaccountNetSettlement = Math.max(0, businessAmount - paystackFee);

  const [cardNumber, setCardNumber] = useState('4084 0840 8408 4081');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('408');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSimulateSuccess = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/paystack/verify/${encodeURIComponent(reference)}?simulate=true`);
      await res.json();
      navigate(`/payment-success?reference=${reference}`);
    } catch {
      navigate(`/payment-success?reference=${reference}`);
    }
  };

  const handleSimulateFailure = () => {
    navigate('/payment-failed');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8 animate-in fade-in bg-white text-[#0d472b]">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0F8F2] text-[#146C43] text-xs font-bold border border-[#198754]/30">
          <Server className="w-3.5 h-3.5 text-[#198754]" />
          <span>Paystack Split-Payment Sandbox</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#146C43]">
          Paystack Transaction Simulator
        </h1>
        <p className="text-xs sm:text-sm text-[#0d472b] max-w-lg mx-auto">
          Testing split calculations, fixed ₦60 platform fee allocation, and subaccount bearer parameters.
        </p>
      </div>

      {/* Split Calculation Verification Breakdown */}
      <div className="bg-[#146C43] text-white rounded-3xl p-6 shadow-sm space-y-4 border border-[#198754]">
        <h3 className="text-sm font-bold text-[#F0F8F2] uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-white" />
          Paystack Settlement Calculation
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-[#0f5132] border border-[#198754]/50 space-y-1">
            <span className="text-[#F0F8F2] block font-medium">1. Total Charged to Customer</span>
            <Currency amount={totalAmount} className="text-lg font-bold text-white" />
            <div className="text-[11px] text-[#F0F8F2]">Total in Kobo: {Math.round(totalAmount * 100).toLocaleString()} kobo</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#0f5132] border border-[#198754]/50 space-y-1">
            <span className="text-[#F0F8F2] block font-medium">2. Platform Provider (Main)</span>
            <Currency amount={platformFee} className="text-lg font-bold text-white" />
            <div className="text-[11px] text-[#F0F8F2]">Fixed Platform Fee: 6,000 kobo</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#0f5132] border border-[#198754]/50 space-y-1">
            <span className="text-[#F0F8F2] block font-medium">3. Business Subaccount Allocation</span>
            <Currency amount={businessAmount} className="text-lg font-bold text-white" />
            <div className="text-[11px] text-[#F0F8F2]">Subaccount: {settings.paystackSubaccount}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#0f5132] border border-[#198754]/50 space-y-1">
            <span className="text-[#F0F8F2] block font-medium">4. Paystack Processing Fee</span>
            <Currency amount={paystackFee} className="text-lg font-bold text-white" />
            <div className="text-[11px] text-[#F0F8F2]">Bearer: "subaccount"</div>
          </div>
        </div>

        <div className="pt-2 border-t border-[#198754]/50 flex justify-between items-center text-xs">
          <span className="text-[#F0F8F2] font-medium">Net Settlement to MAYORS PLACE:</span>
          <Currency amount={subaccountNetSettlement} className="text-base font-bold text-white" />
        </div>
      </div>

      {/* Test Card Checkout Form */}
      <div className="bg-white rounded-2xl border-2 border-[#198754]/30 p-6 sm:p-8 shadow-xs space-y-5 max-w-lg mx-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[#198754]/20">
          <div>
            <span className="text-xs text-[#0d472b] font-mono font-bold">Reference</span>
            <div className="font-mono font-bold text-[#146C43] text-xs sm:text-sm">{reference}</div>
          </div>
          <div className="text-right">
            <span className="text-xs text-[#0d472b] font-bold">Total Payable</span>
            <Currency amount={totalAmount} className="text-[#198754] font-black text-base" />
          </div>
        </div>

        <div className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-[#146C43] mb-1">
              Test Card Number
            </label>
            <div className="relative">
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border-2 border-[#198754]/30 focus:border-[#198754] focus:outline-none font-mono bg-white text-[#0d472b]"
              />
              <CreditCard className="w-5 h-5 text-[#198754] absolute right-3 top-2.5" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#146C43] mb-1">Expiry</label>
              <input
                type="text"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border-2 border-[#198754]/30 focus:border-[#198754] focus:outline-none font-mono bg-white text-[#0d472b]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#146C43] mb-1">CVV</label>
              <input
                type="text"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border-2 border-[#198754]/30 focus:border-[#198754] focus:outline-none font-mono bg-white text-[#0d472b]"
              />
            </div>
          </div>
        </div>

        <div className="pt-2 space-y-2">
          <button
            onClick={handleSimulateSuccess}
            disabled={isProcessing}
            className="w-full py-3.5 px-4 rounded-xl bg-[#198754] hover:bg-[#146C43] disabled:opacity-60 text-white font-bold text-sm shadow-md shadow-[#198754]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isProcessing ? 'Verifying with Server...' : `Pay NGN ${totalAmount.toLocaleString()} (Test Success)`}
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleSimulateFailure}
            disabled={isProcessing}
            className="w-full py-2.5 px-4 rounded-xl bg-[#F0F8F2] hover:bg-[#198754] hover:text-white border border-[#198754]/30 text-[#146C43] text-xs font-bold transition-colors cursor-pointer"
          >
            Simulate Cancelled / Failed Payment
          </button>
        </div>
      </div>
    </div>
  );
};
