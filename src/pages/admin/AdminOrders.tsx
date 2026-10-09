import React, { useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { Order, FulfilmentStatus } from '../../types';
import { Currency } from '../../components/Currency';
import { dispatchNotification, formatOrderReadyMessage } from '../../lib/notifications';
import {
  ShoppingBag,
  Search,
  PackageCheck,
  CheckCircle,
  Clock,
  Phone,
  Eye,
  X
} from 'lucide-react';

export const AdminOrders: React.FC = () => {
  const { settings } = useBusiness();
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'ord-001',
      orderReference: 'ORD_942103',
      customerName: 'Barrister Olanrewaju Thomas',
      customerPhone: '08023456789',
      customerEmail: 'thomas@example.com',
      items: [
        { productId: 'prod-cocoa-hybrid', name: 'TC-1 Hybrid Cocoa Seedlings', price: 650, quantity: 50, unitOfSale: 'Per Polybag', total: 32500 },
        { productId: 'prod-organic-fertilizer', name: 'Fortified Organic Compost', price: 12500, quantity: 2, unitOfSale: '50kg Bag', total: 25000 },
      ],
      subtotal: 57500,
      platformFee: 60,
      totalAmount: 57560,
      paymentReference: 'AGRO_ORD_001',
      paystackReference: 'PSTK_ORD_001',
      status: 'paid',
      fulfilmentStatus: 'awaiting_fulfilment',
      collectionNotes: 'Representative driving a Toyota Hilux will collect on Friday.',
      createdAt: '2026-10-09T08:15:00Z',
    },
    {
      id: 'ord-002',
      orderReference: 'ORD_819432',
      customerName: 'Mrs. Folake Adeyemi',
      customerPhone: '08123456780',
      items: [
        { productId: 'prod-oil-palm-tenera', name: 'NIFOR Certified Tenera Oil Palm Seedlings', price: 1850, quantity: 20, unitOfSale: 'Per Seedling', total: 37000 },
      ],
      subtotal: 37000,
      platformFee: 60,
      totalAmount: 37060,
      paymentReference: 'AGRO_ORD_002',
      paystackReference: 'PSTK_ORD_002',
      status: 'paid',
      fulfilmentStatus: 'ready_for_collection',
      createdAt: '2026-10-09T09:00:00Z',
    },
  ]);

  const [search, setSearch] = useState('');
  const [activeOrderModal, setActiveOrderModal] = useState<Order | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const filteredOrders = orders.filter((o) => {
    return (
      o.orderReference.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerPhone.includes(search)
    );
  });

  const handleUpdateFulfilment = async (orderId: string, nextStatus: FulfilmentStatus) => {
    const updated = orders.map((o) => {
      if (o.id === orderId) {
        return { ...o, fulfilmentStatus: nextStatus };
      }
      return o;
    });
    setOrders(updated);

    const targetOrder = orders.find((o) => o.id === orderId);
    if (targetOrder && nextStatus === 'ready_for_collection') {
      // Dispatch automated SMS
      const msg = formatOrderReadyMessage(targetOrder.orderReference, settings.collectionAddress);
      await dispatchNotification({
        type: 'order_ready_for_collection',
        recipientPhone: targetOrder.customerPhone,
        recipientEmail: targetOrder.customerEmail,
        relatedReference: targetOrder.orderReference,
        message: msg,
        channel: 'both',
      });

      setNotice(`Order ${targetOrder.orderReference} marked ready! Customer notified via SMS.`);
      setTimeout(() => setNotice(null), 4000);
    }
    if (activeOrderModal && activeOrderModal.id === orderId) {
      setActiveOrderModal({ ...activeOrderModal, fulfilmentStatus: nextStatus });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#146C43]">Seedling Orders & Collection Fulfilment</h1>
          <p className="text-xs sm:text-sm text-[#146C43]">
            Track paid seedling orders, mark items ready for customer collection, and notify buyers.
          </p>
        </div>

        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Search reference, customer, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-[#198754]/30 bg-white"
          />
        </div>
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
                <th className="py-3 px-4">Order Ref & Customer</th>
                <th className="py-3 px-4">Line Items</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Fulfilment Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#198754]/10">
              {filteredOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-[#F0F8F2]">
                  <td className="py-3 px-4">
                    <div className="font-bold font-mono text-emerald-900">{ord.orderReference}</div>
                    <div className="font-semibold text-[#146C43]">{ord.customerName}</div>
                    <div className="text-[#146C43] font-mono text-[11px]">{ord.customerPhone}</div>
                  </td>
                  <td className="py-3 px-4 max-w-xs">
                    <div className="text-[#146C43]">
                      {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-bold text-[#146C43]">
                    <Currency amount={ord.totalAmount} />
                    <div className="text-[10px] text-[#198754]">incl. ₦{ord.platformFee} fee</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                      {ord.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        ord.fulfilmentStatus === 'collected'
                          ? 'bg-[#F0F8F2] text-[#146C43]'
                          : ord.fulfilmentStatus === 'ready_for_collection'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {ord.fulfilmentStatus.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-1.5">
                    <button
                      onClick={() => setActiveOrderModal(ord)}
                      className="p-1.5 rounded-lg bg-[#F0F8F2] hover:bg-[#F0F8F2] text-[#0d472b]"
                      title="Inspect Order"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    {ord.fulfilmentStatus === 'awaiting_fulfilment' && (
                      <button
                        onClick={() => handleUpdateFulfilment(ord.id, 'ready_for_collection')}
                        className="px-2 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-[11px]"
                      >
                        Mark Ready
                      </button>
                    )}
                    {ord.fulfilmentStatus === 'ready_for_collection' && (
                      <button
                        onClick={() => handleUpdateFulfilment(ord.id, 'collected')}
                        className="px-2 py-1 rounded-lg bg-[#0f5132] hover:bg-black text-white font-semibold text-[11px]"
                      >
                        Mark Collected
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {activeOrderModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 relative">
            <button
              onClick={() => setActiveOrderModal(null)}
              className="absolute top-4 right-4 p-1.5 text-[#198754] hover:text-[#0d472b] rounded-lg hover:bg-[#F0F8F2]"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-xs text-[#198754] font-mono">Order Details</span>
              <h3 className="text-lg font-bold font-mono text-emerald-950">
                {activeOrderModal.orderReference}
              </h3>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b">
                <span className="text-[#146C43]">Customer Name:</span>
                <span className="font-bold">{activeOrderModal.customerName}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-[#146C43]">Contact Phone:</span>
                <span className="font-bold font-mono">{activeOrderModal.customerPhone}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-[#146C43]">Payment Status:</span>
                <span className="font-bold uppercase text-emerald-700">{activeOrderModal.status}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-[#146C43]">Pickup Notes:</span>
                <span className="font-medium text-[#146C43]">{activeOrderModal.collectionNotes || 'None'}</span>
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <span className="text-xs font-bold text-[#0d472b] block">Ordered Seedlings:</span>
              {activeOrderModal.items.map((it, i) => (
                <div key={i} className="flex justify-between text-xs py-1 border-b border-[#198754]/10">
                  <span>
                    {it.quantity} × {it.name} ({it.unitOfSale})
                  </span>
                  <Currency amount={it.total} className="font-semibold" />
                </div>
              ))}
              <div className="flex justify-between text-xs pt-1">
                <span className="text-[#146C43]">Platform Fee:</span>
                <Currency amount={activeOrderModal.platformFee} />
              </div>
              <div className="flex justify-between text-sm font-bold pt-2 border-t text-[#146C43]">
                <span>Total Amount:</span>
                <Currency amount={activeOrderModal.totalAmount} className="text-emerald-950 text-base" />
              </div>
            </div>

            <div className="pt-3 flex gap-2">
              {activeOrderModal.fulfilmentStatus !== 'collected' && (
                <button
                  onClick={() => handleUpdateFulfilment(activeOrderModal.id, 'ready_for_collection')}
                  className="w-1/2 py-2.5 rounded-xl bg-emerald-700 text-white font-bold text-xs"
                >
                  Mark Ready & Notify
                </button>
              )}
              <button
                onClick={() => setActiveOrderModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#198754]/30 text-[#0d472b] font-semibold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
