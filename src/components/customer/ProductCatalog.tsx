import React, { useState } from 'react';
import { useWater } from '../../context/WaterContext';
import { ProductImage } from '../common/ProductImage';
import { formatCurrency } from '../../utils/formatters';
import { Plus, Minus, ShoppingCart, Check, ShieldCheck, Sparkles, Truck, Droplets } from 'lucide-react';

interface ProductCatalogProps {
  onOpenCheckout: () => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({ onOpenCheckout }) => {
  const { products, cart, addToCart, updateCartQuantity } = useWater();
  const [quantities, setQuantities] = useState<{ [productId: string]: number }>({});
  const [filterCategory, setFilterCategory] = useState<'all' | 'jar_20l' | 'bottle_case'>('all');
  const [recentlyAdded, setRecentlyAdded] = useState<string | null>(null);

  const getQty = (productId: string) => quantities[productId] || 1;

  const handleIncrement = (productId: string) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: (prev[productId] || 1) + 1
    }));
  };

  const handleDecrement = (productId: string) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] || 1) - 1)
    }));
  };

  const handleAddToCart = (productId: string) => {
    const qty = getQty(productId);
    addToCart(productId, qty);
    setRecentlyAdded(productId);
    setTimeout(() => setRecentlyAdded(null), 1500);
  };

  const filteredProducts = products.filter(p => {
    if (!p.isActive) return false;
    if (filterCategory === 'all') return true;
    return p.category === filterCategory;
  });

  return (
    <div className="space-y-12">
      {/* Hero Water Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ocean-900 via-ocean-800 to-ocean-950 text-white p-8 sm:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-aqua-400/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ocean-700/50 border border-ocean-600/50 text-aqua-300 text-xs font-semibold backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Instant Guest Ordering • No Account Required</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-white">
            Pure, Certified Drinking Water <span className="text-aqua-400">Delivered Fast.</span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            Order premium 20-Litre jars and sealed bottle cases directly to your home or office. Automatic jar balance reconciliation, transparent pricing, and real-time live tracking.
          </p>

          <div className="pt-4 flex flex-wrap gap-4 text-xs sm:text-sm text-slate-200">
            <div className="flex items-center gap-2 bg-ocean-800/80 px-3.5 py-2 rounded-xl border border-ocean-700/60">
              <Truck className="w-4 h-4 text-aqua-400" />
              <span>Same-Day Scheduled Delivery</span>
            </div>
            <div className="flex items-center gap-2 bg-ocean-800/80 px-3.5 py-2 rounded-xl border border-ocean-700/60">
              <Droplets className="w-4 h-4 text-aqua-400" />
              <span>Sanitized &amp; Ozonized 20L Jars</span>
            </div>
            <div className="flex items-center gap-2 bg-ocean-800/80 px-3.5 py-2 rounded-xl border border-ocean-700/60">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Official Genuine Brands</span>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Our Water Catalogue</h2>
          <p className="text-sm text-slate-500">Select products, customize quantity, and checkout in seconds.</p>
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterCategory === 'all'
                ? 'bg-white text-ocean-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Products ({products.filter(p => p.isActive).length})
          </button>
          <button
            onClick={() => setFilterCategory('jar_20l')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterCategory === 'jar_20l'
                ? 'bg-white text-ocean-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            20L Jars
          </button>
          <button
            onClick={() => setFilterCategory('bottle_case')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterCategory === 'bottle_case'
                ? 'bg-white text-ocean-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bottle Cases
          </button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(product => {
          const inCartCount = cart[product.id] || 0;
          const currentQty = getQty(product.id);
          const isJustAdded = recentlyAdded === product.id;

          return (
            <div
              key={product.id}
              className="group bg-white rounded-2xl border border-slate-200/80 hover:border-ocean-300 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Product Image Section */}
                <div className="relative overflow-hidden bg-slate-50">
                  <ProductImage imageType={product.imageType} className="h-48 w-full" alt={product.name} />
                  
                  {product.badge && (
                    <span className="absolute top-3 right-3 px-2.5 py-1 text-[11px] font-bold rounded-full bg-ocean-600 text-white shadow-sm">
                      {product.badge}
                    </span>
                  )}
                  {product.isJar20L && (
                    <span className="absolute top-3 left-3 px-2 py-0.5 text-[10px] font-semibold rounded bg-white/90 text-ocean-800 shadow-sm border border-slate-200">
                      Reusable Jar
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="p-5 space-y-3">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-ocean-600">
                      {product.capacity}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight group-hover:text-ocean-700 transition-colors">
                      {product.name}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>

                  <div className="flex items-baseline gap-2 pt-1">
                    <span className="text-2xl font-extrabold text-ocean-900">
                      {formatCurrency(product.price)}
                    </span>
                    <span className="text-xs text-slate-500">
                      {product.isJar20L ? '/ per refill jar' : '/ per boxed case'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="p-5 pt-0 border-t border-slate-100 mt-2 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  {/* Quantity selector */}
                  <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                    <button
                      type="button"
                      onClick={() => handleDecrement(product.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-xs transition-all active:scale-90"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center font-bold text-sm text-slate-900">
                      {currentQty}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleIncrement(product.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-xs transition-all active:scale-90"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Add to Cart button */}
                  <button
                    type="button"
                    onClick={() => handleAddToCart(product.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all shadow-sm active:scale-95 ${
                      isJustAdded
                        ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                        : 'bg-ocean-700 hover:bg-ocean-800 text-white shadow-ocean-700/20'
                    }`}
                  >
                    {isJustAdded ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Added!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4 text-aqua-300" />
                        <span>Add to Cart</span>
                      </>
                    )}
                  </button>
                </div>

                {inCartCount > 0 && (
                  <div className="flex items-center justify-between text-xs text-ocean-700 bg-ocean-50/80 px-3 py-1.5 rounded-lg border border-ocean-100 font-medium">
                    <span>In Cart: {inCartCount} units</span>
                    <span className="font-bold">{formatCurrency(product.price * inCartCount)}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Bottom Cart Bar for Mobile */}
      {Object.keys(cart).length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 w-[92%] max-w-md bg-ocean-950 text-white rounded-2xl p-4 shadow-2xl border border-ocean-800 flex items-center justify-between animate-in fade-in slide-in-from-bottom-4">
          <div className="space-y-0.5">
            <div className="text-xs text-aqua-400 font-bold uppercase tracking-wider">
              {Object.values(cart).reduce((a, b) => a + b, 0)} Items Selected
            </div>
            <div className="text-lg font-black text-white">
              {formatCurrency(
                Object.entries(cart).reduce((sum, [pId, qty]) => {
                  const prod = products.find(p => p.id === pId);
                  return sum + (prod ? prod.price * qty : 0);
                }, 0)
              )}
            </div>
          </div>
          <button
            onClick={onOpenCheckout}
            className="flex items-center gap-2 bg-gradient-to-r from-aqua-500 to-ocean-500 hover:from-aqua-600 hover:to-ocean-600 text-ocean-950 font-black text-sm px-5 py-2.5 rounded-xl shadow-lg active:scale-95 transition-all"
          >
            <span>Proceed to Checkout</span>
            <span>→</span>
          </button>
        </div>
      )}
    </div>
  );
};
