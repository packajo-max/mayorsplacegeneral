import React, { useState } from 'react';
import { useBusiness } from '../context/BusinessContext';
import { useCart } from '../context/CartContext';
import { Product } from '../types';
import { Currency } from '../components/Currency';
import {
  Sprout,
  Search,
  ShoppingBag,
  Plus,
  Minus,
  CheckCircle2,
  PackageCheck,
  ArrowRight
} from 'lucide-react';

interface ShopPageProps {
  navigate: (path: string) => void;
  selectedProductId?: string;
}

export const ShopPage: React.FC<ShopPageProps> = ({ navigate }) => {
  const { products, categories, settings } = useBusiness();
  const { addToCart, items } = useCart();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [addedNotice, setAddedNotice] = useState<string | null>(null);

  const getQty = (productId: string, minQty: number = 1) => {
    return quantities[productId] !== undefined ? quantities[productId] : Math.max(1, minQty);
  };

  const handleQtyChange = (productId: string, delta: number, minQty: number = 1, maxStock: number = 9999) => {
    const current = getQty(productId, minQty);
    const updated = Math.max(minQty, Math.min(current + delta, maxStock));
    setQuantities((prev) => ({ ...prev, [productId]: updated }));
  };

  const handleAddToCart = (product: Product) => {
    const qty = getQty(product.id, product.minOrderQuantity || 1);
    addToCart(product, qty);
    setAddedNotice(`Added ${qty} ${product.unitOfSale} of "${product.name}" to cart.`);
    setTimeout(() => setAddedNotice(null), 3500);
  };

  const filteredProducts = products.filter((p) => {
    if (!p.active) return false;
    const matchCategory = activeCategory === 'all' || p.categoryId === activeCategory;
    const matchSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 bg-white text-[#0d472b]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#198754] uppercase tracking-wider block mb-1">
            Certified Nursery Seedlings & Agricultural Products
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#146C43] tracking-tight">
            Agricultural Products & Seedlings
          </h1>
          <p className="text-sm text-[#0d472b] mt-1 max-w-xl">
            High quality agricultural seedlings, cash crops, and farm inputs for individuals and commercial farmers.
          </p>
        </div>

        <button
          onClick={() => navigate('/cart')}
          className="self-start md:self-auto px-5 py-2.5 rounded-2xl bg-[#198754] hover:bg-[#146C43] text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>View Cart & Checkout</span>
        </button>
      </div>

      {/* Collection Notice Banner */}
      <div className="bg-[#F0F8F2] border-2 border-[#198754]/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm text-[#0d472b]">
        <div className="flex items-start sm:items-center gap-3">
          <PackageCheck className="w-5 h-5 text-[#198754] shrink-0 mt-0.5 sm:mt-0" />
          <div>
            <span className="font-bold text-[#146C43]">Fulfilment Notice: </span>
            The default arrangement is customer pickup or collection at: <span className="font-bold text-[#146C43]">{settings.collectionAddress}</span>.
          </div>
        </div>
        <div className="text-xs text-[#146C43] shrink-0">
          For inter-state delivery arrangements, call <span className="font-bold underline">{settings.businessPhone}</span>.
        </div>
      </div>

      {/* Added notice banner */}
      {addedNotice && (
        <div className="p-4 rounded-2xl bg-[#F0F8F2] border-2 border-[#198754] text-[#146C43] text-xs sm:text-sm flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-5 h-5 text-[#198754] shrink-0" />
            <span>{addedNotice}</span>
          </div>
          <button
            onClick={() => navigate('/cart')}
            className="text-xs font-bold text-[#198754] underline hover:text-[#146C43] cursor-pointer"
          >
            Go to Cart →
          </button>
        </div>
      )}

      {/* Categories & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-2 border-b border-[#198754]/20">
        <div className="w-full md:w-auto flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-[#198754] text-white shadow-xs'
                : 'bg-white border-2 border-[#198754]/30 text-[#146C43] hover:bg-[#F0F8F2]'
            }`}
          >
            All Products ({products.filter((p) => p.active).length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-[#198754] text-white shadow-xs'
                  : 'bg-white border-2 border-[#198754]/30 text-[#146C43] hover:bg-[#F0F8F2]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="w-full md:w-64 relative">
          <Search className="w-4 h-4 text-[#198754] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search seedlings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border-2 border-[#198754]/30 focus:border-[#198754] focus:outline-none bg-white text-[#0d472b]"
          />
        </div>
      </div>

      {/* Clean, Simple Vertical / List Format for Products */}
      <div className="space-y-4">
        {filteredProducts.map((product) => {
          const qty = getQty(product.id, product.minOrderQuantity || 1);
          const itemSubtotal = product.price * qty;
          const isOutOfStock = product.stock <= 0;
          const cartItem = items.find((i) => i.product.id === product.id);

          return (
            <div
              key={product.id}
              className="bg-white border-2 border-[#198754]/20 hover:border-[#198754] rounded-2xl sm:rounded-3xl p-4 sm:p-6 transition-all shadow-xs hover:shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              {/* Product Info with Photograph on left */}
              <div className="flex items-start gap-4 sm:gap-5 flex-1">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-[#F0F8F2] border border-[#198754]/30 shrink-0">
                  <img
                    src={product.imageUrls[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#146C43] bg-[#F0F8F2] border border-[#198754]/30 px-2 py-0.5 rounded-md">
                      {product.categoryName}
                    </span>
                    {product.stock <= 15 ? (
                      <span className="text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md">
                        Only {product.stock} available
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-[#146C43]">
                        Stock: {product.stock} units
                      </span>
                    )}
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-[#146C43] leading-snug">
                    {product.name}
                  </h3>

                  <p className="text-xs text-[#0d472b] leading-relaxed max-w-xl line-clamp-2">
                    {product.description}
                  </p>

                  <div className="text-xs text-[#0d472b] pt-1">
                    <span>Price: </span>
                    <Currency amount={product.price} className="font-bold text-[#146C43] text-sm" />
                    <span className="text-[#146C43]"> / {product.unitOfSale}</span>
                  </div>
                </div>
              </div>

              {/* Quantity Selector, Subtotal & Add to Cart button on right */}
              <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between md:justify-end gap-4 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-[#198754]/20">
                {/* Quantity selector: [-] 1 [+] */}
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#0d472b] font-bold">Quantity:</span>
                  <div className="flex items-center gap-1.5 bg-[#F0F8F2] border border-[#198754]/30 rounded-xl p-1">
                    <button
                      type="button"
                      onClick={() =>
                        handleQtyChange(
                          product.id,
                          -1,
                          product.minOrderQuantity || 1,
                          product.stock
                        )
                      }
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-white text-[#146C43] hover:bg-[#198754] hover:text-white border border-[#198754]/30 font-bold text-xs cursor-pointer transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center text-xs font-bold text-[#146C43]">
                      {qty}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleQtyChange(
                          product.id,
                          1,
                          product.minOrderQuantity || 1,
                          product.stock
                        )
                      }
                      disabled={qty >= product.stock}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-white text-[#146C43] hover:bg-[#198754] hover:text-white border border-[#198754]/30 font-bold text-xs cursor-pointer transition-colors disabled:opacity-40"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Subtotal calculation */}
                <div className="text-right min-w-[100px]">
                  <div className="text-[10px] text-[#146C43] font-bold uppercase">Subtotal</div>
                  <Currency amount={itemSubtotal} className="text-base font-black text-[#198754]" />
                </div>

                {/* Add to Cart button */}
                <button
                  type="button"
                  onClick={() => handleAddToCart(product)}
                  disabled={isOutOfStock}
                  className="px-5 py-2.5 rounded-xl bg-[#198754] hover:bg-[#146C43] disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{cartItem ? `Add More (${cartItem.quantity} in cart)` : 'Add to Cart'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
