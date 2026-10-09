import React, { useState } from 'react';
import { useBusiness } from '../context/BusinessContext';
import { Phone, Mail, MapPin, PackageCheck, Send, CheckCircle2 } from 'lucide-react';

export const ContactPage: React.FC<{ navigate: (path: string) => void }> = () => {
  const { settings } = useBusiness();
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10 bg-white text-[#0d472b]">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs font-bold text-[#198754] uppercase tracking-wider block">
          Get in Touch
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#146C43] tracking-tight">
          Contact Us
        </h1>
        <p className="text-[#0d472b] text-sm">
          Have questions about travel consultation, seedling collection, or live streaming?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border-2 border-[#198754]/30 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-[#146C43] text-base">Office & Support Contacts</h3>

            <div className="space-y-3.5 text-xs sm:text-sm text-[#0d472b]">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#198754] mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-[#146C43] block">Office Location</span>
                  <span>{settings.businessAddress}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <PackageCheck className="w-5 h-5 text-[#198754] mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-[#146C43] block">Seedling Pickup Address</span>
                  <span>{settings.collectionAddress}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#198754] shrink-0" />
                <div>
                  <span className="font-bold text-[#146C43] block">Telephone & WhatsApp</span>
                  <a href={`tel:${settings.businessPhone}`} className="text-[#198754] hover:underline font-bold">
                    {settings.businessPhone}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#198754] shrink-0" />
                <div>
                  <span className="font-bold text-[#146C43] block">Email Address</span>
                  <a href={`mailto:${settings.businessEmail}`} className="text-[#198754] hover:underline font-bold">
                    {settings.businessEmail}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Message Form */}
        <div className="bg-white rounded-2xl border-2 border-[#198754]/30 p-6 sm:p-7 shadow-xs">
          {submitted ? (
            <div className="py-10 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-[#198754] mx-auto" />
              <h4 className="font-bold text-[#146C43] text-lg">Message Sent!</h4>
              <p className="text-xs text-[#0d472b]">
                Thank you. A member of the MAYORS PLACE team will contact you shortly.
              </p>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSubmitted(true);
              }}
              className="space-y-3.5"
            >
              <h3 className="font-bold text-[#146C43] text-base">Send Us a Direct Message</h3>

              <div>
                <label className="block text-xs font-bold text-[#146C43] mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Samuel Adekunle"
                  className="w-full px-3 py-2 text-sm rounded-xl border-2 border-[#198754]/30 focus:border-[#198754] focus:outline-none bg-white text-[#0d472b]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#146C43] mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 08031234567"
                  className="w-full px-3 py-2 text-sm rounded-xl border-2 border-[#198754]/30 focus:border-[#198754] focus:outline-none bg-white text-[#0d472b]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#146C43] mb-1">Message</label>
                <textarea
                  required
                  rows={4}
                  placeholder="What would you like to inquire about?"
                  className="w-full px-3 py-2 text-sm rounded-xl border-2 border-[#198754]/30 focus:border-[#198754] focus:outline-none bg-white text-[#0d472b]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-[#198754] hover:bg-[#146C43] text-white font-bold text-sm shadow-md shadow-[#198754]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Submit Message</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
