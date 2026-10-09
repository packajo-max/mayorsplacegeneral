import React, { useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { Product } from '../../types';
import { Currency } from '../../components/Currency';
import { Sprout, Plus, Search, AlertTriangle, Edit, Check, X } from 'lucide-react';

export const AdminProducts: React.FC = () => {
  const { products, categories, updateProductStock, addProduct, updateProduct } = useBusiness();
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [search, setSearch] = useState('');
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [newStockVal, setNewStockVal] = useState<number>(0);

  // New product form
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(1000);
  const [unitOfSale, setUnitOfSale] = useState('Per Polybag Seedling');
  const [stock, setStock] = useState(100);
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'cat-cocoa');

  const filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesLowStock = !filterLowStock || p.stock <= 15;
    return matchesSearch && matchesLowStock;
  });

  const handleSaveStock = (productId: string) => {
    updateProductStock(productId, newStockVal);
    setEditingStockId(null);
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const cat = categories.find((c) => c.id === categoryId);
    await addProduct({
      name: name.trim(),
      description: description.trim() || 'High yielding acclimatized variety.',
      imageUrls: ['https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80'],
      categoryId,
      categoryName: cat?.name || 'Seedlings',
      price,
      unitOfSale,
      stock,
      active: true,
      isFeatured: false,
    });

    setIsAdding(false);
    setName('');
    setDescription('');
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#146C43]">Products & Seedling Inventory</h1>
          <p className="text-xs sm:text-sm text-[#146C43]">
            Audit inventory levels, adjust selling units, and configure seedling varieties.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setFilterLowStock(!filterLowStock)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              filterLowStock
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'bg-white text-[#0d472b] border border-[#198754]/20 hover:bg-[#F0F8F2]'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Show Low Stock (≤ 15)</span>
          </button>
        </div>

        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Search seedlings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#198754]/30 bg-white"
          />
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-[#198754]/20 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F0F8F2] text-[#146C43] uppercase border-b border-[#198754]/20">
              <tr>
                <th className="py-3 px-4">Seedling / Product</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Unit of Sale</th>
                <th className="py-3 px-4">Stock In Nursery</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#198754]/10">
              {filtered.map((prod) => {
                const isLow = prod.stock <= 15;
                const isEditing = editingStockId === prod.id;

                return (
                  <tr key={prod.id} className="hover:bg-[#F0F8F2]">
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#146C43]">{prod.name}</div>
                      <div className="text-[11px] text-[#146C43] line-clamp-1">{prod.description}</div>
                    </td>
                    <td className="py-3 px-4 text-[#0d472b]">{prod.categoryName}</td>
                    <td className="py-3 px-4 font-bold text-[#146C43]">
                      <Currency amount={prod.price} />
                    </td>
                    <td className="py-3 px-4 text-[#146C43]">{prod.unitOfSale}</td>
                    <td className="py-3 px-4">
                      {isEditing ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            value={newStockVal}
                            onChange={(e) => setNewStockVal(Number(e.target.value))}
                            className="w-16 px-1.5 py-1 border rounded text-xs"
                          />
                          <button
                            onClick={() => handleSaveStock(prod.id)}
                            className="p-1 text-emerald-700 hover:bg-emerald-50 rounded"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingStockId(null)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                              isLow ? 'bg-red-100 text-red-800' : 'bg-emerald-50 text-emerald-800'
                            }`}
                          >
                            {prod.stock} units
                          </span>
                          <button
                            onClick={() => {
                              setEditingStockId(prod.id);
                              setNewStockVal(prod.stock);
                            }}
                            className="text-[#198754] hover:text-[#0d472b]"
                            title="Edit Stock"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        {prod.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => updateProduct({ ...prod, active: !prod.active })}
                        className="text-[11px] font-semibold text-emerald-700 hover:underline"
                      >
                        {prod.active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4">
            <h3 className="font-bold text-[#146C43] text-base">Add New Agricultural Seedling / Input</h3>
            <form onSubmit={handleCreateProduct} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#0d472b] mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#198754]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0d472b] mb-1">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#198754]/30 bg-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#0d472b] mb-1">Price (NGN)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#198754]/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0d472b] mb-1">Initial Stock</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#198754]/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0d472b] mb-1">Unit of Sale</label>
                <input
                  type="text"
                  value={unitOfSale}
                  onChange={(e) => setUnitOfSale(e.target.value)}
                  placeholder="e.g. Per Polybag Seedling, Pack of 100, 50kg Bag"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#198754]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0d472b] mb-1">Botanical & Care Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#198754]/30"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="w-1/2 py-2 rounded-lg border text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 rounded-lg bg-emerald-700 text-white text-xs font-bold"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
