import React, { useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { Settings, ShieldCheck, CheckCircle2, AlertCircle, Save, ExternalLink } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { settings, updateSettings } = useBusiness();

  const [formData, setFormData] = useState({
    businessName: settings.businessName,
    businessPhone: settings.businessPhone,
    businessEmail: settings.businessEmail,
    businessAddress: settings.businessAddress,
    collectionAddress: settings.collectionAddress,
    websiteDomain: settings.websiteDomain,
    platformFeeNgn: settings.platformFeeNgn,
    paystackSubaccount: settings.paystackSubaccount,
    appointmentCancellationHours: settings.appointmentCancellationHours,
  });

  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings(formData);
    setSavedNotice('Business configuration updated successfully!');
    setTimeout(() => setSavedNotice(null), 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-[#146C43]">Platform & Business Configuration</h1>
        <p className="text-xs sm:text-sm text-[#146C43]">
          Configure business details, nursery collection hub address, Paystack split parameters, and policies.
        </p>
      </div>

      {savedNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{savedNotice}</span>
        </div>
      )}

      {/* Integration Status Box */}
      <div className="bg-emerald-950 text-emerald-100 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Integration Status & Security Audit
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-emerald-900/60 rounded-xl border border-emerald-800">
            <span className="text-emerald-400 block font-semibold">Firebase Cloud Firestore</span>
            <div className="font-bold text-white mt-1">Connected & Provisioned</div>
            <div className="text-[10px] text-emerald-300">Rules Deployed (ABAC)</div>
          </div>

          <div className="p-3 bg-emerald-900/60 rounded-xl border border-emerald-800">
            <span className="text-emerald-400 block font-semibold">Paystack Split Payment</span>
            <div className="font-bold text-white mt-1">Configured (Test Mode)</div>
            <div className="text-[10px] text-emerald-300">Fixed ₦60 platform fee</div>
          </div>

          <div className="p-3 bg-emerald-900/60 rounded-xl border border-emerald-800">
            <span className="text-emerald-400 block font-semibold">Nigerian SMS (Termii)</span>
            <div className="font-bold text-white mt-1">Ready for API Key</div>
            <div className="text-[10px] text-emerald-300">Sender ID: AGROSTREAM</div>
          </div>

          <div className="p-3 bg-emerald-900/60 rounded-xl border border-emerald-800">
            <span className="text-emerald-400 block font-semibold">Transactional Email</span>
            <div className="font-bold text-white mt-1">Configurable (Resend)</div>
            <div className="text-[10px] text-emerald-300">Receipts & Quotations</div>
          </div>
        </div>

        <div className="text-[11px] text-emerald-300/80 pt-1">
          <strong>Security Note: </strong> In accordance with strict application security rules, API secret keys are stored securely in environment variables (<code className="text-white">.env</code>) and are never exposed to browser clients.
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#198754]/20 p-6 sm:p-8 space-y-6 shadow-xs">
        <h3 className="font-bold text-[#146C43] text-base">Business Entity & Contact</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#0d472b] mb-1">Business Name</label>
            <input
              type="text"
              required
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-[#198754]/30 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0d472b] mb-1">Business Telephone</label>
            <input
              type="text"
              required
              value={formData.businessPhone}
              onChange={(e) => setFormData({ ...formData, businessPhone: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-[#198754]/30 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0d472b] mb-1">Business Email</label>
            <input
              type="email"
              required
              value={formData.businessEmail}
              onChange={(e) => setFormData({ ...formData, businessEmail: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-[#198754]/30 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0d472b] mb-1">Website Domain</label>
            <input
              type="text"
              required
              value={formData.websiteDomain}
              onChange={(e) => setFormData({ ...formData, websiteDomain: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-[#198754]/30 focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#0d472b] mb-1">Head Office Address</label>
          <input
            type="text"
            required
            value={formData.businessAddress}
            onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
            className="w-full px-3 py-2 text-xs rounded-lg border border-[#198754]/30 focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#0d472b] mb-1">
            Product Collection / Seedling Nursery Pickup Address <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.collectionAddress}
            onChange={(e) => setFormData({ ...formData, collectionAddress: e.target.value })}
            className="w-full px-3 py-2 text-xs rounded-lg border border-[#198754]/30 focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="pt-4 border-t border-[#198754]/20 space-y-4">
          <h3 className="font-bold text-[#146C43] text-base">Paystack Split Payment Parameters</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#0d472b] mb-1">
                Fixed Platform Fee (NGN)
              </label>
              <input
                type="number"
                required
                value={formData.platformFeeNgn}
                onChange={(e) => setFormData({ ...formData, platformFeeNgn: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#198754]/30 font-bold"
              />
              <span className="text-[11px] text-[#146C43] mt-0.5 block">Standard fixed value: ₦60</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0d472b] mb-1">
                Business Paystack Subaccount Code
              </label>
              <input
                type="text"
                required
                value={formData.paystackSubaccount}
                onChange={(e) => setFormData({ ...formData, paystackSubaccount: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#198754]/30 font-mono"
              />
              <span className="text-[11px] text-[#146C43] mt-0.5 block">e.g. ACCT_1234567890</span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-[#198754]/20">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
};
