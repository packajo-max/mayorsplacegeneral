import React from 'react';
import { useBusiness } from '../context/BusinessContext';

export const PrivacyPolicyPage: React.FC<{ navigate: (path: string) => void }> = () => {
  const { settings } = useBusiness();
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6 bg-white text-[#0d472b]">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-[#146C43]">Privacy Policy</h1>
        <p className="text-xs text-[#0d472b] font-medium">Effective Date: October 2026 • Africa/Lagos Timezone</p>
      </div>
      <div className="bg-white rounded-2xl border-2 border-[#198754]/30 p-8 shadow-xs space-y-6 text-sm text-[#0d472b] leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#146C43]">1. Information We Collect</h2>
          <p>
            {settings.businessName} operates on a customer-friendly model where public user accounts and password registrations are never required.
            When you book an appointment, purchase agricultural seedlings, register for a seminar, or request a live-streaming quote, we collect your name, phone number, physical pickup/venue address, and optional email address solely to process and fulfil your order.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#146C43]">2. Financial Data & Payment Processing</h2>
          <p>
            All electronic card and bank payments are processed securely through Paystack. We do not store or process debit card numbers, PINs, or CVV codes on our servers.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#146C43]">3. OTP Authentication & Record Privacy</h2>
          <p>
            To prevent unauthorized scraping or guessing of booking references, tracking records are guarded by a 6-digit one-time passcode (OTP) delivered to the verified telephone number entered during checkout.
          </p>
        </section>
      </div>
    </div>
  );
};

export const TermsPage: React.FC<{ navigate: (path: string) => void }> = () => {
  const { settings } = useBusiness();
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6 bg-white text-[#0d472b]">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-[#146C43]">Terms and Conditions</h1>
        <p className="text-xs text-[#0d472b] font-medium">Governing Law: Federal Republic of Nigeria</p>
      </div>
      <div className="bg-white rounded-2xl border-2 border-[#198754]/30 p-8 shadow-xs space-y-6 text-sm text-[#0d472b] leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#146C43]">1. Agricultural Products & Seedling Collection</h2>
          <p>
            All seedlings (cocoa, Tenera oil palm, kola nut, and fruit trees) are hardened nursery stock. Fulfilment is strictly by customer pickup at our specified nursery address ({settings.collectionAddress}) unless separate out-of-state logistics arrangements have been agreed directly with our office.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#146C43]">2. Live-Streaming Broadcasting Services</h2>
          <p>
            Our crew provides outside broadcast engineering and streaming to approved platforms (YouTube, Facebook, Zoom, or RTMP). Physical site access, stable power at the venue, and client platform credentials must be granted prior to the start time.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#146C43]">3. Payment Settlement</h2>
          <p>
            All bookings and orders are confirmed immediately upon authorized payment processing via Paystack.
          </p>
        </section>
      </div>
    </div>
  );
};

export const CancellationRefundPolicyPage: React.FC<{ navigate: (path: string) => void }> = () => {
  const { settings } = useBusiness();
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6 bg-white text-[#0d472b]">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-[#146C43]">Cancellation and Refund Policy</h1>
        <p className="text-xs text-[#0d472b] font-medium">Official Corporate Policy</p>
      </div>
      <div className="bg-white rounded-2xl border-2 border-[#198754]/30 p-8 shadow-xs space-y-6 text-sm text-[#0d472b] leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#146C43]">1. Appointments & Advisory Rescheduling</h2>
          <p>
            Clients may reschedule an advisory appointment with at least {settings.appointmentCancellationHours} hours notice without penalty. Cancellations made with less notice may forfeit the session fee.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#146C43]">2. Seminar Registration Cancellation</h2>
          <p>
            Because seminar seats are strictly capacity-controlled and materials are prepared in advance, registration cancellations submitted within 48 hours of the event date are non-refundable. A substitute attendee may be nominated.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#146C43]">3. Agricultural Seedlings Orders</h2>
          <p>
            Once seedlings have been tagged, bundled, and staged for pickup at the nursery, cancellation is not permitted due to perishable root hydration requirements. Unbatched orders may be refunded subject to management review.
          </p>
        </section>
      </div>
    </div>
  );
};
