import React, { useState } from 'react';
import { Currency } from '../components/Currency';
import {
  Search,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface StatusPageProps {
  navigate: (path: string) => void;
}

export const StatusPage: React.FC<StatusPageProps> = () => {
  const [reference, setReference] = useState('');
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [demoCodeNotice, setDemoCodeNotice] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [verifiedRecord, setVerifiedRecord] = useState<any | null>(null);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!reference.trim() || !phone.trim()) {
      setErrorMessage('Please provide your reference code and registered phone number.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/tracking/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference: reference.trim(), phone: phone.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Unable to request verification code');
      }

      setOtpSent(true);
      if (data.testDemoCode) {
        setDemoCodeNotice(data.testDemoCode);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification request failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!otpCode.trim()) {
      setErrorMessage('Please enter the 6-digit code received.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/tracking/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference: reference.trim(), phone: phone.trim(), code: otpCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Verification code failed');
      }

      setVerifiedRecord(data.record);
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid or expired code.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8 bg-white text-[#0d472b]">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0F8F2] text-[#146C43] text-xs font-bold border border-[#198754]/30">
          <ShieldCheck className="w-3.5 h-3.5 text-[#198754]" />
          <span>Secure Customer Verification</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[#146C43] tracking-tight">
          Track Your Booking or Order
        </h1>
        <p className="text-sm text-[#0d472b]">
          To protect customer privacy and prevent unauthorized reference guessing, we authenticate requests via a one-time passcode (OTP) sent to your registered phone.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3 max-w-lg mx-auto">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
          <span className="font-semibold">{errorMessage}</span>
        </div>
      )}

      {!verifiedRecord ? (
        <div className="bg-white rounded-2xl border-2 border-[#198754]/30 p-6 sm:p-8 shadow-xs max-w-lg mx-auto space-y-6">
          {!otpSent ? (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#146C43] mb-1">
                  Reference Code <span className="text-[#198754]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ORD_123456 or APT_654321"
                  value={reference}
                  onChange={(e) => setReference(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 text-sm rounded-xl border-2 border-[#198754]/30 focus:border-[#198754] focus:outline-none font-mono uppercase bg-white text-[#0d472b]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#146C43] mb-1">
                  Registered Phone Number <span className="text-[#198754]">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 08031234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border-2 border-[#198754]/30 focus:border-[#198754] focus:outline-none bg-white text-[#0d472b]"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-[#198754] hover:bg-[#146C43] disabled:opacity-60 text-white font-bold text-sm shadow-md shadow-[#198754]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? 'Verifying...' : 'Request Verification Code'}
                <KeyRound className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="p-3 bg-[#F0F8F2] rounded-xl text-xs text-[#146C43] border border-[#198754]/30 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#198754] shrink-0" />
                <span>Verification code sent to phone ending in ...{phone.slice(-4)}</span>
              </div>

              {demoCodeNotice && (
                <div className="p-3 bg-[#F0F8F2] border border-[#198754]/30 rounded-xl text-xs text-[#146C43] font-mono">
                  [DEMO TEST CODE: <strong className="text-sm font-bold text-[#198754]">{demoCodeNotice}</strong>]
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#146C43] mb-1">
                  Enter 6-Digit Code <span className="text-[#198754]">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="e.g. 123456"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full px-3 py-2 text-lg text-center tracking-widest font-mono rounded-xl border-2 border-[#198754]/30 focus:border-[#198754] focus:outline-none bg-white text-[#0d472b]"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="py-2.5 px-3 rounded-xl border-2 border-[#198754]/30 text-xs font-bold text-[#146C43] hover:bg-[#F0F8F2] cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#198754] hover:bg-[#146C43] disabled:opacity-60 text-white font-bold text-sm shadow-md shadow-[#198754]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? 'Verifying...' : 'Verify & View Record'}
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border-2 border-[#198754]/30 p-6 sm:p-8 shadow-xs max-w-xl mx-auto space-y-5 animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-[#198754]/20">
            <div>
              <span className="text-xs text-[#0d472b] font-mono font-bold">Reference</span>
              <h3 className="text-xl font-bold font-mono text-[#146C43]">{verifiedRecord.reference}</h3>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                verifiedRecord.status === 'confirmed' || verifiedRecord.status === 'paid'
                  ? 'bg-[#F0F8F2] text-[#146C43] border border-[#198754]/30'
                  : 'bg-[#F0F8F2] text-[#198754] border border-[#198754]/30'
              }`}
            >
              {verifiedRecord.status || 'Active'}
            </span>
          </div>

          <div className="space-y-2.5 text-xs sm:text-sm">
            {verifiedRecord.serviceName && (
              <div className="flex justify-between py-1.5 border-b border-[#198754]/10">
                <span className="text-[#0d472b]">Service:</span>
                <span className="font-bold text-[#146C43]">{verifiedRecord.serviceName}</span>
              </div>
            )}
            {verifiedRecord.eventType && (
              <div className="flex justify-between py-1.5 border-b border-[#198754]/10">
                <span className="text-[#0d472b]">Event:</span>
                <span className="font-bold text-[#146C43]">{verifiedRecord.eventType}</span>
              </div>
            )}
            {verifiedRecord.date && (
              <div className="flex justify-between py-1.5 border-b border-[#198754]/10">
                <span className="text-[#0d472b]">Scheduled Date / Time:</span>
                <span className="font-bold text-[#146C43]">
                  {verifiedRecord.date} {verifiedRecord.time ? `at ${verifiedRecord.time}` : ''}
                </span>
              </div>
            )}
            {verifiedRecord.location && (
              <div className="flex justify-between py-1.5 border-b border-[#198754]/10">
                <span className="text-[#0d472b]">Location:</span>
                <span className="font-bold text-[#146C43] text-right">{verifiedRecord.location}</span>
              </div>
            )}
            {verifiedRecord.items && Array.isArray(verifiedRecord.items) && (
              <div className="py-2 border-b border-[#198754]/10 space-y-1">
                <span className="text-[#0d472b] block mb-1 font-bold">Purchased Seedlings:</span>
                {verifiedRecord.items.map((it: any, i: number) => (
                  <div key={i} className="flex justify-between text-xs pl-2 text-[#0d472b]">
                    <span>
                      {it.quantity} × {it.name}
                    </span>
                    <Currency amount={it.total} />
                  </div>
                ))}
              </div>
            )}
            {verifiedRecord.totalAmount !== undefined && (
              <div className="flex justify-between py-2 border-b border-[#198754]/20 font-bold text-[#146C43]">
                <span>Total Amount Paid:</span>
                <Currency amount={verifiedRecord.totalAmount} className="text-[#198754] text-base" />
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setVerifiedRecord(null);
              setOtpSent(false);
              setOtpCode('');
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-[#F0F8F2] hover:bg-[#198754] hover:text-white text-[#146C43] text-xs font-bold transition-colors cursor-pointer"
          >
            Check Another Booking
          </button>
        </div>
      )}
    </div>
  );
};
