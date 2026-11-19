import React, { useState } from 'react';
import { useWater } from '../../context/WaterContext';
import { Product } from '../../types';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { ProductImage } from '../common/ProductImage';
import { 
  Tag, 
  Plus, 
  History, 
  ShieldAlert, 
  Check, 
  AlertCircle, 
  Edit3, 
  Power, 
  X,
  Lock
} from 'lucide-react';

export const ProductPricingSection: React.FC = () => {
  const { products, priceHistory, updateProductPrice, addProduct, toggleProductStatus, editProduct } = useWater();

  // Price Edit Modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newPrice, setNewPrice] = useState<number>(0);
  const [priceChangeReason, setPriceChangeReason] = useState<string>('');

  // Add Product Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdShortName, setNewProdShortName] = useState('');
  const [newProdCapacity, setNewProdCapacity] = useState('20 Litre');
  const [newProdCategory, setNewProdCategory] = useState<'jar_20l' | 'bottle_case'>('jar_20l');
  const [newProdPrice, setNewProdPrice] = useState<number>(50);
  const [newProdDescription, setNewProdDescription] = useState('');
  const [newProdBadge, setNewProdBadge] = useState('');

  const handleOpenPriceEdit = (p: Product) => {
    setSelectedProduct(p);
    setNewPrice(p.price);
    setPriceChangeReason('');
  };

  const handleConfirmPriceUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || newPrice < 0 || !priceChangeReason.trim()) return;

    updateProductPrice(selectedProduct.id, newPrice, priceChangeReason.trim());
    setSelectedProduct(null);
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim() || newProdPrice < 0) return;

    addProduct({
      name: newProdName.trim(),
      shortName: newProdShortName.trim() || newProdName.trim(),
      capacity: newProdCapacity.trim(),
      category: newProdCategory,
      price: newProdPrice,
      isActive: true,
      isJar20L: newProdCategory === 'jar_20l',
      description: newProdDescription.trim() || 'Premium purified drinking water.',
      badge: newProdBadge.trim() || undefined,
      imageType: 'custom',
    });

    setShowAddModal(false);
    setNewProdName('');
    setNewProdShortName('');
    setNewProdPrice(50);
    setNewProdDescription('');
  };

  return (
    <div className="space-y-8">
      {/* Critical Pricing Rule Banner */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-2">
        <div className="flex items-center gap-2 text-amber-800 text-xs font-bold uppercase tracking-wider">
          <Lock className="w-4 h-4 text-amber-600" />
          <span>Critical Architecture Rule: Price Snapshot Protection</span>
        </div>
        <h3 className="text-xl font-black text-amber-950 tracking-tight">
          Historical Orders Retain Their Original Product Prices
        </h3>
        <p className="text-xs sm:text-sm text-amber-900 leading-relaxed max-w-4xl">
          When product prices are modified below, the updated price applies <strong>strictly to new orders placed after the change</strong>. Past orders preserve their immutable unit price snapshot (<code className="bg-amber-100 px-1 py-0.5 rounded text-amber-950 font-mono">priceAtOrder</code>), and past customer dues are <strong>never recalculated</strong>. Every price revision creates a permanent audit log entry.
        </p>
      </div>

      {/* Top Header & Add Product Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Product &amp; Pricing Management</h2>
          <p className="text-xs text-slate-500">Configure catalog prices, manage availability, and view full historical rate revisions.</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-ocean-700 hover:bg-ocean-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all self-start sm:self-auto active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(product => {
          return (
            <div
              key={product.id}
              className={`bg-white rounded-2xl border transition-all overflow-hidden flex flex-col justify-between shadow-xs ${
                product.isActive ? 'border-slate-200 hover:border-ocean-300' : 'border-slate-200 bg-slate-50/60 opacity-75'
              }`}
            >
              <div>
                {/* Image & Status Badge */}
                <div className="relative bg-slate-50">
                  <ProductImage imageType={product.imageType} className="h-44 w-full" alt={product.name} />
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      product.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {product.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                  {product.badge && (
                    <span className="absolute top-3 left-3 px-2 py-0.5 text-[10px] font-bold rounded bg-ocean-600 text-white">
                      {product.badge}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-5 space-y-2">
                  <div className="text-[11px] font-bold text-ocean-600 uppercase tracking-wider">
                    {product.capacity} • {product.isJar20L ? '20L Jar' : 'Case'}
                  </div>
                  <h3 className="font-extrabold text-base text-slate-900">{product.name}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{product.description}</p>

                  <div className="pt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-black text-ocean-950">
                      {formatCurrency(product.price)}
                    </span>
                    <span className="text-xs text-slate-500">current unit price</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-5 pt-0 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => handleOpenPriceEdit(product)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-ocean-50 hover:bg-ocean-100 text-ocean-700 font-bold text-xs border border-ocean-200 transition-all active:scale-95"
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>Update Price</span>
                </button>

                <button
                  onClick={() => toggleProductStatus(product.id)}
                  className={`p-2.5 rounded-xl border transition-colors ${
                    product.isActive 
                      ? 'border-slate-200 hover:bg-slate-100 text-slate-600' 
                      : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  }`}
                  title={product.isActive ? 'Disable Product' : 'Enable Product'}
                >
                  <Power className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Price Revision Audit Trail Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-ocean-600" />
          <div>
            <h3 className="font-bold text-base text-slate-900">Official Price Change Audit History</h3>
            <p className="text-xs text-slate-500">Permanent record of previous prices, new prices, timestamps, and admin responsible.</p>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-100 rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-bold uppercase text-[10px] text-slate-500">
                <th className="py-3 px-4">Date &amp; Time</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4 text-right">Previous Price</th>
                <th className="py-3 px-4 text-right">New Price</th>
                <th className="py-3 px-4 text-right">Difference</th>
                <th className="py-3 px-4">Admin Responsible</th>
                <th className="py-3 px-4">Revision Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {priceHistory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No price changes have been recorded yet.
                  </td>
                </tr>
              ) : (
                priceHistory.map(h => {
                  const diff = h.newPrice - h.previousPrice;
                  return (
                    <tr key={h.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {formatDateTime(h.timestamp)}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {h.productName}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-500 line-through">
                        {formatCurrency(h.previousPrice)}
                      </td>
                      <td className="py-3 px-4 text-right font-black text-ocean-900 text-sm">
                        {formatCurrency(h.newPrice)}
                      </td>
                      <td className={`py-3 px-4 text-right font-bold ${
                        diff >= 0 ? 'text-red-600' : 'text-emerald-600'
                      }`}>
                        {diff >= 0 ? `+${formatCurrency(diff)}` : `-${formatCurrency(Math.abs(diff))}`}
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {h.adminName}
                      </td>
                      <td className="py-3 px-4 text-slate-600 italic">
                        {h.reason || 'Routine price update'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Update Price */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setSelectedProduct(null)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 z-10 space-y-4">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-ocean-600">Dynamic Pricing</span>
                <h3 className="font-bold text-lg text-slate-900">Update Price for {selectedProduct.name}</h3>
              </div>
              <button onClick={() => setSelectedProduct(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-ocean-50 border border-ocean-100 text-xs text-ocean-900 space-y-1">
              <div className="flex justify-between">
                <span>Current Listed Price:</span>
                <span className="font-bold">{formatCurrency(selectedProduct.price)}</span>
              </div>
              <p className="text-[11px] text-ocean-700">
                Note: Existing customer orders and past dues will remain strictly untouched at original snapshot rates.
              </p>
            </div>

            <form onSubmit={handleConfirmPriceUpdate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">New Product Price (₹) *</label>
                <input
                  type="number"
                  required
                  min={0}
                  step="1"
                  value={newPrice || ''}
                  onChange={e => setNewPrice(parseFloat(e.target.value) || 0)}
                  placeholder="e.g. 95"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-base font-black text-slate-900 outline-none focus:border-ocean-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Audit Reason for Change *</label>
                <input
                  type="text"
                  required
                  value={priceChangeReason}
                  onChange={e => setPriceChangeReason(e.target.value)}
                  placeholder="e.g. Manufacturer rate hike / Special summer promotion"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!priceChangeReason.trim()}
                  className="px-5 py-2 rounded-xl bg-ocean-700 hover:bg-ocean-800 text-white font-bold shadow-sm transition-all disabled:opacity-50"
                >
                  Apply New Price
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add New Product */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setShowAddModal(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 z-10 space-y-4">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-ocean-600">Product Catalogue</span>
                <h3 className="font-bold text-lg text-slate-900">Add New Water Product</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Product Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newProdName}
                    onChange={e => setNewProdName(e.target.value)}
                    placeholder="e.g. Kinley – 20 Litre Jar"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Short Name</label>
                  <input
                    type="text"
                    value={newProdShortName}
                    onChange={e => setNewProdShortName(e.target.value)}
                    placeholder="e.g. Kinley 20L"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={newProdCategory}
                    onChange={e => setNewProdCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none font-semibold"
                  >
                    <option value="jar_20l">20L Jar</option>
                    <option value="bottle_case">Bottle Case</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Capacity Tag</label>
                  <input
                    type="text"
                    value={newProdCapacity}
                    onChange={e => setNewProdCapacity(e.target.value)}
                    placeholder="e.g. 20 Litre"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Initial Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={newProdPrice || ''}
                    onChange={e => setNewProdPrice(parseFloat(e.target.value) || 0)}
                    placeholder="e.g. 50"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newProdDescription}
                  onChange={e => setNewProdDescription(e.target.value)}
                  placeholder="Purified mineral drinking water description..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Badge (Optional)</label>
                <input
                  type="text"
                  value={newProdBadge}
                  onChange={e => setNewProdBadge(e.target.value)}
                  placeholder="e.g. New Launch / Best Seller"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-ocean-700 hover:bg-ocean-800 text-white font-bold"
                >
                  Create Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
