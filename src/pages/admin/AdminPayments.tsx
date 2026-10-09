import React, { useState } from 'react';
import { Currency } from '../../components/Currency';
import { PaymentRecord } from '../../types';
import { CreditCard, Download, Search, ShieldCheck } from 'lucide-react';

export const AdminPayments: React.FC = () => {
  const [payments, setPayments] = useState<PaymentRecord[]>([
    {
      id: 'pay-001',
      internalReference: 'AGRO_APPT_001',
      paystackReference: 'PSTK_APPT_94102',
      category: 'appointment',
      relatedId: 'APT_94102',
      customerName: 'Chief Babatunde Adeleke',
      customerPhone: '08031234567',
      customerEmail: 'babatunde@example.com',
      businessAmount: 35000,
      platformFee: 60,
      totalAmountCharged: 35060,
      currency: 'NGN',
      status: 'verified',
      splitConfig: { subaccount: 'ACCT_1234567890', transaction_charge: 6000, bearer: 'subaccount' },
      verifiedAt: '2026-10-09T08:05:00Z',
      createdAt: '2026-10-09T08:00:00Z',
    },
    {
      id: 'pay-002',
      internalReference: 'AGRO_ORD_001',
      paystackReference: 'PSTK_ORD_81402',
      category: 'agricultural_order',
      relatedId: 'ORD_942103',
      customerName: 'Barrister Olanrewaju Thomas',
      customerPhone: '08023456789',
      businessAmount: 57500,
      platformFee: 60,
      totalAmountCharged: 57560,
      currency: 'NGN',
      status: 'verified',
      splitConfig: { subaccount: 'ACCT_1234567890', transaction_charge: 6000, bearer: 'subaccount' },
      verifiedAt: '2026-10-09T08:18:00Z',
      createdAt: '2026-10-09T08:15:00Z',
    },
    {
      id: 'pay-003',
      internalReference: 'AGRO_SEM_001',
      paystackReference: 'PSTK_SEM_50123',
      category: 'seminar',
      relatedId: 'SEM_50123',
      customerName: 'Dr. Segun Balogun',
      customerPhone: '08023456789',
      businessAmount: 15000,
      platformFee: 60,
      totalAmountCharged: 15060,
      currency: 'NGN',
      status: 'verified',
      splitConfig: { subaccount: 'ACCT_1234567890', transaction_charge: 6000, bearer: 'subaccount' },
      verifiedAt: '2026-10-08T12:00:00Z',
      createdAt: '2026-10-08T11:58:00Z',
    },
  ]);

  const [search, setSearch] = useState('');

  const filtered = payments.filter((p) => {
    return (
      p.internalReference.toLowerCase().includes(search.toLowerCase()) ||
      p.paystackReference.toLowerCase().includes(search.toLowerCase()) ||
      p.customerName.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleExportCSV = () => {
    const headers = 'Internal Ref,Paystack Ref,Category,Customer,Business NGN,Platform Fee NGN,Total Charged NGN,Bearer,Status,Date\n';
    const rows = payments
      .map(
        (p) =>
          `"${p.internalReference}","${p.paystackReference}","${p.category}","${p.customerName}",${p.businessAmount},${p.platformFee},${p.totalAmountCharged},"${p.splitConfig?.bearer || 'subaccount'}","${p.status}","${p.createdAt}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Paystack_Transactions_Audit.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#146C43]">Payments & Split Reconciliation</h1>
          <p className="text-xs sm:text-sm text-[#146C43]">
            Reconciled Paystack transactions, integer kobo accuracy, and fixed ₦60 platform fee allocations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search references or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-[#198754]/30 bg-white"
          />
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-1.5 rounded-xl bg-[#146C43] hover:bg-black text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#198754]/20 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F0F8F2] text-[#146C43] uppercase border-b border-[#198754]/20">
              <tr>
                <th className="py-3 px-4">Internal & Paystack Ref</th>
                <th className="py-3 px-4">Customer & Category</th>
                <th className="py-3 px-4">Business Proceeds</th>
                <th className="py-3 px-4">Platform Fee</th>
                <th className="py-3 px-4">Total Charged</th>
                <th className="py-3 px-4">Split Bearer</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#198754]/10">
              {filtered.map((pay) => (
                <tr key={pay.id} className="hover:bg-[#F0F8F2]">
                  <td className="py-3 px-4">
                    <div className="font-mono font-bold text-[#146C43]">{pay.internalReference}</div>
                    <div className="font-mono text-[#146C43] text-[11px]">{pay.paystackReference}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-[#146C43]">{pay.customerName}</div>
                    <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                      {pay.category.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-emerald-950">
                    <Currency amount={pay.businessAmount} />
                  </td>
                  <td className="py-3 px-4 font-bold text-amber-800">
                    <Currency amount={pay.platformFee} />
                  </td>
                  <td className="py-3 px-4 font-black text-[#146C43]">
                    <Currency amount={pay.totalAmountCharged} />
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[11px] font-mono text-[#0d472b] bg-[#F0F8F2] px-2 py-0.5 rounded">
                      bearer: "subaccount"
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                      {pay.status}
                    </span>
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
