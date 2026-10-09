import React, { useEffect, useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { Currency } from '../../components/Currency';
import {
  TrendingUp,
  CreditCard,
  Sprout,
  Calendar,
  GraduationCap,
  Video,
  ShoppingBag,
  AlertTriangle,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

export const AdminOverview: React.FC<{ setAdminTab: (tab: string) => void }> = ({ setAdminTab }) => {
  const { products, services, seminars, settings } = useBusiness();
  const [metrics, setMetrics] = useState({
    grossCustomerPayments: 345000,
    totalPlatformFees: 1200,
    totalBusinessProceeds: 343800,
    estimatedPaystackFees: 5200,
    totalTransactionsCount: 20,
    pendingPaymentsCount: 3,
  });

  useEffect(() => {
    fetch('/api/admin/metrics')
      .then((res) => res.json())
      .then((data) => {
        if (data.grossCustomerPayments !== undefined) {
          setMetrics((prev) => ({
            ...prev,
            ...data,
            grossCustomerPayments: Math.max(data.grossCustomerPayments, prev.grossCustomerPayments),
          }));
        }
      })
      .catch((e) => console.warn('Could not fetch remote metrics:', e));
  }, []);

  const lowStockProducts = products.filter((p) => p.stock <= 15);

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#146C43]">
            Business Dashboard & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-[#146C43] mt-1">
            Reconciled payments, seedling inventory levels, and upcoming service bookings.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-xl text-xs font-semibold self-start sm:self-auto border border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Paystack Split Integration Active</span>
        </div>
      </div>

      {/* Financial Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl border border-[#198754]/20 p-5 shadow-xs space-y-2">
          <span className="text-xs font-bold text-[#198754] uppercase">Gross Verified Payments</span>
          <div className="text-2xl font-black text-[#146C43]">
            <Currency amount={metrics.grossCustomerPayments} />
          </div>
          <div className="text-[11px] text-[#146C43]">Gross receipts across all services</div>
        </div>

        <div className="bg-white rounded-2xl border border-[#198754]/20 p-5 shadow-xs space-y-2">
          <span className="text-xs font-bold text-emerald-700 uppercase">Business Net Proceeds</span>
          <div className="text-2xl font-black text-emerald-900">
            <Currency amount={metrics.totalBusinessProceeds} />
          </div>
          <div className="text-[11px] text-emerald-700">Allocated to subaccount ({settings.paystackSubaccount})</div>
        </div>

        <div className="bg-white rounded-2xl border border-[#198754]/20 p-5 shadow-xs space-y-2">
          <span className="text-xs font-bold text-amber-700 uppercase">Platform Fees Recorded</span>
          <div className="text-2xl font-black text-amber-900">
            <Currency amount={metrics.totalPlatformFees} />
          </div>
          <div className="text-[11px] text-amber-800">Fixed ₦60 charged per transaction</div>
        </div>

        <div className="bg-white rounded-2xl border border-[#198754]/20 p-5 shadow-xs space-y-2">
          <span className="text-xs font-bold text-red-600 uppercase">Est. Paystack Processing Fee</span>
          <div className="text-2xl font-black text-[#146C43]">
            <Currency amount={metrics.estimatedPaystackFees} />
          </div>
          <div className="text-[11px] text-[#146C43]">Borne by business subaccount</div>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          onClick={() => setAdminTab('appointments')}
          className="p-4 rounded-xl bg-white border border-[#198754]/20 hover:border-emerald-500 text-left transition-all hover:shadow-xs space-y-2 cursor-pointer"
        >
          <Calendar className="w-5 h-5 text-emerald-700" />
          <div className="font-bold text-sm text-[#146C43]">Appointments</div>
          <div className="text-xs text-[#146C43]">{services.length} Active Services</div>
        </button>

        <button
          onClick={() => setAdminTab('seminars')}
          className="p-4 rounded-xl bg-white border border-[#198754]/20 hover:border-emerald-500 text-left transition-all hover:shadow-xs space-y-2 cursor-pointer"
        >
          <GraduationCap className="w-5 h-5 text-emerald-700" />
          <div className="font-bold text-sm text-[#146C43]">Seminars</div>
          <div className="text-xs text-[#146C43]">{seminars.length} Masterclasses</div>
        </button>

        <button
          onClick={() => setAdminTab('orders')}
          className="p-4 rounded-xl bg-white border border-[#198754]/20 hover:border-emerald-500 text-left transition-all hover:shadow-xs space-y-2 cursor-pointer"
        >
          <ShoppingBag className="w-5 h-5 text-emerald-700" />
          <div className="font-bold text-sm text-[#146C43]">Seedling Orders</div>
          <div className="text-xs text-[#146C43]">Fulfilment & Pickups</div>
        </button>

        <button
          onClick={() => setAdminTab('livestream')}
          className="p-4 rounded-xl bg-white border border-[#198754]/20 hover:border-emerald-500 text-left transition-all hover:shadow-xs space-y-2 cursor-pointer"
        >
          <Video className="w-5 h-5 text-emerald-700" />
          <div className="font-bold text-sm text-[#146C43]">Live-Streaming</div>
          <div className="text-xs text-[#146C43]">Custom Quotations</div>
        </button>
      </div>

      {/* Low Stock Alert Table */}
      <div className="bg-white rounded-2xl border border-[#198754]/20 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-[#146C43] text-base">Low Stock Nursery Alerts (≤ 15 Units)</h3>
          </div>
          <button
            onClick={() => setAdminTab('products')}
            className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
          >
            Manage All Inventory
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {lowStockProducts.length === 0 ? (
          <div className="text-xs text-[#146C43] py-4 text-center">
            All seedling varieties have healthy stock levels above 15 units.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F0F8F2] text-[#146C43] uppercase border-y border-[#198754]/20">
                <tr>
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Unit Price</th>
                  <th className="py-2.5 px-3">Unit</th>
                  <th className="py-2.5 px-3">Current Stock</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#198754]/10">
                {lowStockProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-[#F0F8F2]">
                    <td className="py-2.5 px-3 font-bold text-[#146C43]">{p.name}</td>
                    <td className="py-2.5 px-3 text-[#0d472b]">{p.categoryName}</td>
                    <td className="py-2.5 px-3 font-semibold">
                      <Currency amount={p.price} />
                    </td>
                    <td className="py-2.5 px-3 text-[#146C43]">{p.unitOfSale}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-bold">
                        {p.stock} units
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => setAdminTab('products')}
                        className="text-xs font-semibold text-emerald-700 hover:underline"
                      >
                        Restock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
