import React, { useState } from 'react';
import { Currency } from '../../components/Currency';
import { RefundRecord } from '../../types';
import { RotateCcw, CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';

export const AdminRefunds: React.FC = () => {
  const [refunds, setRefunds] = useState<RefundRecord[]>([
    {
      id: 'ref-001',
      paymentReference: 'AGRO_APPT_94102',
      relatedId: 'APT_94102',
      category: 'appointment',
      customerName: 'Mr. Kelechi Nwosu',
      customerPhone: '08023456789',
      amount: 25000,
      reason: 'Agronomist unable to travel due to state road construction; client requested refund.',
      status: 'processed',
      platformFeeRefunded: false,
      requestedAt: '2026-10-07T10:00:00Z',
      processedAt: '2026-10-07T14:30:00Z',
    },
  ]);

  const [notice, setNotice] = useState<string | null>(null);

  const handleUpdateStatus = (id: string, status: 'approved' | 'processed' | 'rejected') => {
    setRefunds((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status, processedAt: new Date().toISOString() } : r))
    );
    setNotice(`Refund record status updated to ${status}.`);
    setTimeout(() => setNotice(null), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[#146C43]">Refunds & Cancellation Requests</h1>
        <p className="text-xs sm:text-sm text-[#146C43]">
          Review customer cancellation claims, record audit justifications, and track Paystack refund settlement.
        </p>
      </div>

      {notice && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-[#198754]/20 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F0F8F2] text-[#146C43] uppercase border-b border-[#198754]/20">
              <tr>
                <th className="py-3 px-4">Ref & Customer</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Refund Amount</th>
                <th className="py-3 px-4">Reason & Justification</th>
                <th className="py-3 px-4">Platform Fee Policy</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#198754]/10">
              {refunds.map((r) => (
                <tr key={r.id} className="hover:bg-[#F0F8F2]">
                  <td className="py-3 px-4">
                    <div className="font-bold text-[#146C43]">{r.customerName}</div>
                    <div className="font-mono text-[#146C43] text-[11px]">{r.customerPhone}</div>
                    <div className="font-mono text-[10px] text-emerald-800">{r.paymentReference}</div>
                  </td>
                  <td className="py-3 px-4 capitalize font-semibold text-[#0d472b]">{r.category}</td>
                  <td className="py-3 px-4 font-bold text-emerald-950">
                    <Currency amount={r.amount} />
                  </td>
                  <td className="py-3 px-4 max-w-xs text-[#0d472b] leading-snug">{r.reason}</td>
                  <td className="py-3 px-4 text-[#146C43]">
                    {r.platformFeeRefunded ? (
                      <span className="text-emerald-700 font-semibold">Platform Fee Included</span>
                    ) : (
                      <span className="text-amber-800 font-semibold">₦60 Retained by Platform</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                        r.status === 'processed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : r.status === 'approved'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-1.5">
                    {r.status === 'pending' && (
                      <button
                        onClick={() => handleUpdateStatus(r.id, 'approved')}
                        className="px-2 py-1 bg-emerald-700 text-white rounded text-[11px] font-semibold"
                      >
                        Approve
                      </button>
                    )}
                    {r.status === 'approved' && (
                      <button
                        onClick={() => handleUpdateStatus(r.id, 'processed')}
                        className="px-2 py-1 bg-[#146C43] text-white rounded text-[11px] font-semibold"
                      >
                        Mark Processed
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
