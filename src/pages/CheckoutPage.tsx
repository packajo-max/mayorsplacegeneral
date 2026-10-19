import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useBusiness } from '../context/BusinessContext';
import { Currency, FeeDisclosureBadge } from '../components/Currency';
import {
  ShoppingBag,
  ArrowRight,
  PackageCheck,
  ShieldCheck,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';

interface CheckoutPageProps {
  navigate: (path: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ navigate }) => {
  const { items, subtotal, platformFee, totalAmount, clearCart } = useCart();
  const { settings } = useBusiness();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [collectionNotes, setCollectionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4 bg-white text-[#0d472b]">
        <h2 className="text-xl font-bold text-[#146C43]">Your cart is empty</h2>
        <p className="text-[#0d472b] text-sm">Please select seedlings before proceeding to checkout.</p>
        <button
          onClick={() => navigate('/shop')}
          className="px-5 py-2.5 rounded-xl bg-[#198754] text-white font-bold text-sm shadow-xs cursor-pointer"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMessage('Please provide your full name and phone number for collection verification.');
      return;
    }

    setIsSubmitting(true);
    const orderRef = `ORD_${Date.now().toString().slice(-6)}`;

    try {
      const orderItems = items.map((i) => ({
        productId: i.product.id,
        name: i.product.name,
        price: i.product.price,
        quantity: i.quantity,
        unitOfSale: i.product.unitOfSale,
        total: i.product.price * i.quantity,
      }));

      const res = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'agricultural_order',
          relatedId: orderRef,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerEmail: customerEmail.trim() || undefined,
          businessAmount: subtotal,
          metadata: {
            product_name: orderItems.length > 0 ? orderItems.map((i) => i.name).join(', ') : 'Agricultural Shop Products',
            product_price: subtotal,
            product_type: 'agricultural_order',
            requires_pdf: false,
          },
          bookingData: {
            orderReference: orderRef,
            items: orderItems,
            subtotal,
            platformFee,
            totalAmount,
            collectionNotes: collectionNotes.trim(),
            collectionAddress: settings.collectionAddress,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Payment initialization failed');
      }

      // Clear local cart
      clearCart();

      if (data.authorizationUrl.startsWith('/')) {
        navigate(data.authorizationUrl);
      } else {
        window.location.href = data.authorizationUrl;
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setErrorMessage(err.message || 'Payment initialization failed');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 bg-white text-[#0d472b]">
      <div>
        <button
          onClick={() => navigate('/cart')}
          className="text-xs font-bold text-[#198754] hover:underline flex items-center gap-1 mb-1 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Cart
        </button>
        <h1 className="text-3xl font-extrabold text-[#146C43] tracking-tight">
          Checkout & Collection Details
        </h1>
        <p className="text-sm text-[#0d472b] mt-1">
          No customer registration or password required. Complete your order securely via Paystack.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
          <span className="font-semibold">{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border-2 border-[#198754]/30 p-6 sm:p-8 shadow-xs space-y-5">
            <div>
              <h3 className="text-base font-bold text-[#146C43]">
                Contact & Collection Details
              </h3>
              <p className="text-xs text-[#0d472b] mt-0.5">
                Your phone number is used for SMS collection notifications and order tracking.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#146C43] mb-1">
                  Full Name <span className="text-[#198754]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Adeola Balogun"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border-2 border-[#198754]/30 focus:border-[#198754] focus:outline-none bg-white text-[#0d472b]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#146C43] mb-1">
                  Phone Number <span className="text-[#198754]">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 08031234567"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border-2 border-[#198754]/30 focus:border-[#198754] focus:outline-none bg-white text-[#0d472b]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#146C43] mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  placeholder="e.g. adeola@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border-2 border-[#198754]/30 focus:border-[#198754] focus:outline-none bg-white text-[#0d472b]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#146C43] mb-1">
                  Pickup Representative or Delivery Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Name of vehicle driver, estimated collection date..."
                  value={collectionNotes}
                  onChange={(e) => setCollectionNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border-2 border-[#198754]/30 focus:border-[#198754] focus:outline-none bg-white text-[#0d472b]"
                />
              </div>
            </div>

            {/* Collection Instructions */}
            <div className="p-4 rounded-xl bg-[#F0F8F2] border-2 border-[#198754]/30 text-xs text-[#0d472b] space-y-1.5">
              <div className="font-bold text-[#146C43] flex items-center gap-1.5">
                <PackageCheck className="w-4 h-4 text-[#198754]" />
                Collection Pickup Address
              </div>
              <p className="leading-relaxed">
                {settings.collectionAddress}
              </p>
              <div className="text-[11px] text-[#146C43] pt-1 font-medium">
                Please present your unique Order Reference upon pickup. For out-of-state freight logistics, contact{' '}
                <span className="font-bold underline">{settings.businessPhone}</span>.
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl bg-[#198754] hover:bg-[#146C43] disabled:opacity-60 text-white font-bold text-sm shadow-md shadow-[#198754]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? 'Connecting to Paystack...' : 'Pay with Paystack'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Summary (5 cols) */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-2xl border-2 border-[#198754]/30 p-6 shadow-xs space-y-5 sticky top-28">
            <h3 className="font-bold text-[#146C43] text-base">Order Review</h3>

            <div className="divide-y divide-[#198754]/10 max-h-60 overflow-y-auto space-y-2.5">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="pt-2.5 first:pt-0 flex justify-between items-center text-xs">
                  <div>
                    <div className="font-bold text-[#146C43]">{product.name}</div>
                    <div className="text-[#0d472b]">
                      {quantity} × <Currency amount={product.price} /> ({product.unitOfSale})
                    </div>
                  </div>
                  <Currency amount={product.price * quantity} className="font-bold text-[#198754]" />
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-[#198754]/20 space-y-2 text-xs">
              <div className="flex justify-between text-[#0d472b]">
                <span>Seedlings Subtotal:</span>
                <Currency amount={subtotal} />
              </div>

              <div className="flex justify-between items-center text-[#0d472b]">
                <span>Platform Fee:</span>
                <Currency amount={platformFee} />
              </div>

              <FeeDisclosureBadge feeNgn={platformFee} className="w-full justify-center" />

              <div className="pt-3 border-t border-[#198754]/20 flex justify-between items-center text-base font-extrabold text-[#146C43]">
                <span>Total Amount:</span>
                <Currency amount={totalAmount} className="text-[#198754] text-xl font-black" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
