import React from 'react';
import { useCart } from '../context/CartContext';
import { useBusiness } from '../context/BusinessContext';
import { Currency } from '../components/Currency';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  PackageCheck,
  ArrowLeft,
  Sprout
} from 'lucide-react';

interface CartPageProps {
  navigate: (path: string) => void;
}

export const CartPage: React.FC<CartPageProps> = ({ navigate }) => {
  const { items, updateQuantity, removeFromCart, clearCart, subtotal, platformFee, totalAmount } = useCart();
  const { settings } = useBusiness();

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-6 bg-white text-[#0d472b]">
        <div className="w-20 h-20 bg-[#F0F8F2] rounded-3xl flex items-center justify-center mx-auto text-[#198754] border-2 border-[#198754]/30">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-2xl font-bold text-[#146C43]">Your Cart is Empty</h2>
          <p className="text-[#0d472b] text-sm font-medium">
            You have not added any seedlings or agricultural products to your cart yet.
          </p>
        </div>
        <button
          onClick={() => navigate('/shop')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#198754] hover:bg-[#146C43] text-white font-bold text-sm shadow-md transition-all cursor-pointer"
        >
          <Sprout className="w-4 h-4" />
          <span>Explore Seedlings</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 bg-white text-[#0d472b]">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/shop')}
            className="text-xs font-bold text-[#198754] hover:underline flex items-center gap-1 mb-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Continue Shopping
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#146C43]">
            Shopping Cart ({items.length} {items.length === 1 ? 'item' : 'items'})
          </h1>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-red-600 hover:text-red-800 font-bold cursor-pointer"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Items List (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {items.map(({ product, quantity }) => {
            const itemTotal = product.price * quantity;
            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl border-2 border-[#198754]/20 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={product.imageUrls[0]}
                    alt={product.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-[#198754]/30 shrink-0"
                  />
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-[#146C43] bg-[#F0F8F2] border border-[#198754]/30 px-2 py-0.5 rounded-md">
                      {product.categoryName}
                    </span>
                    <h3 className="font-bold text-[#146C43] text-sm sm:text-base leading-snug">
                      {product.name}
                    </h3>
                    <div className="text-xs text-[#0d472b]">
                      <Currency amount={product.price} /> / {product.unitOfSale}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-[#198754]/20">
                  {/* Quantity control */}
                  <div className="flex items-center gap-1.5 bg-[#F0F8F2] border border-[#198754]/30 rounded-xl p-1">
                    <button
                      type="button"
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-white text-[#146C43] hover:bg-[#198754] hover:text-white border border-[#198754]/30 text-xs font-bold cursor-pointer transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-[#146C43]">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      disabled={quantity >= product.stock}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-white text-[#146C43] hover:bg-[#198754] hover:text-white border border-[#198754]/30 text-xs font-bold cursor-pointer transition-colors disabled:opacity-30"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Line Total */}
                  <div className="text-right min-w-[90px]">
                    <Currency amount={itemTotal} className="text-base font-bold text-[#198754]" />
                  </div>

                  <button
                    onClick={() => removeFromCart(product.id)}
                    className="p-2 text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Collection notice */}
          <div className="p-4 rounded-2xl bg-[#F0F8F2] border-2 border-[#198754]/30 text-xs text-[#0d472b] flex items-start gap-3">
            <PackageCheck className="w-5 h-5 text-[#198754] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#146C43]">Fulfilment Notice: </span>
              Default arrangement is customer pickup at the Mayors Place nursery hub ({settings.collectionAddress}).
              For inter-state haulage logistics questions, contact our office directly.
            </div>
          </div>
        </div>

        {/* Order Summary & Checkout Card (4 cols) */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl border-2 border-[#198754]/30 p-6 shadow-xs space-y-5 sticky top-28">
            <h3 className="font-bold text-[#146C43] text-base">Order Summary</h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-[#0d472b] text-xs">
                <span>Products Subtotal:</span>
                <Currency amount={subtotal} />
              </div>

              <div className="pt-3 border-t border-[#198754]/20 flex justify-between items-center text-base font-extrabold text-[#146C43]">
                <span>Total Amount:</span>
                <Currency amount={subtotal} className="text-[#198754] text-xl font-black" />
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-3.5 px-4 rounded-xl bg-[#198754] hover:bg-[#146C43] text-white font-bold text-sm shadow-md shadow-[#198754]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-[11px] text-[#0d472b] text-center leading-relaxed font-medium">
              No customer account required. You will receive an SMS order confirmation upon payment.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
