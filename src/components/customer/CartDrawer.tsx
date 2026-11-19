import React from 'react';
import { useWater } from '../../context/WaterContext';
import { formatCurrency } from '../../utils/formatters';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { ProductImage } from '../common/ProductImage';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onProceedToCheckout,
}) => {
  const { cart, products, updateCartQuantity, removeFromCart, clearCart, cartTotalAmount } = useWater();

  if (!isOpen) return null;

  const cartEntries = Object.entries(cart);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          {/* Drawer Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-ocean-50/50">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-ocean-600 text-white flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Your Water Cart</h3>
                <p className="text-xs text-slate-500">
                  {cartEntries.length} {cartEntries.length === 1 ? 'product' : 'products'} selected
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cartEntries.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-ocean-50 text-ocean-400 mx-auto flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-base">Your cart is empty</h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                    Select 20L jars or bottle cases from the catalogue to get pure water delivered.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-ocean-700 text-white text-xs font-semibold hover:bg-ocean-800 shadow-sm transition-all"
                >
                  Browse Catalogue
                </button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center text-xs text-slate-500 pb-1">
                  <span>Selected Items</span>
                  <button 
                    onClick={clearCart}
                    className="text-red-500 hover:text-red-700 font-medium hover:underline"
                  >
                    Clear All
                  </button>
                </div>

                {cartEntries.map(([productId, quantity]) => {
                  const product = products.find(p => p.id === productId);
                  if (!product) return null;
                  const itemTotal = product.price * quantity;

                  return (
                    <div 
                      key={productId}
                      className="flex items-center gap-4 p-3.5 rounded-2xl border border-slate-100 hover:border-slate-200 bg-slate-50/60 transition-all"
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-white border border-slate-200">
                        <ProductImage imageType={product.imageType} className="w-full h-full p-1" />
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <h4 className="font-bold text-slate-900 text-sm truncate">
                          {product.name}
                        </h4>
                        <div className="text-xs text-slate-500 font-medium">
                          {formatCurrency(product.price)} each
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 pt-1">
                          <div className="flex items-center border border-slate-200 rounded-lg bg-white">
                            <button
                              onClick={() => updateCartQuantity(productId, quantity - 1)}
                              className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-50"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-7 text-center font-bold text-xs text-slate-800">
                              {quantity}
                            </span>
                            <button
                              onClick={() => updateCartQuantity(productId, quantity + 1)}
                              className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-50"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromCart(productId)}
                            className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                            title="Remove product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-extrabold text-sm text-ocean-900">
                          {formatCurrency(itemTotal)}
                        </span>
                        {product.isJar20L && (
                          <div className="text-[10px] text-ocean-600 font-semibold">20L Jar</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>

          {/* Drawer Footer */}
          {cartEntries.length > 0 && (
            <div className="p-6 border-t border-slate-100 bg-white space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-600 text-xs">
                  <span>Subtotal</span>
                  <span>{formatCurrency(cartTotalAmount)}</span>
                </div>
                <div className="flex justify-between text-slate-600 text-xs">
                  <span>Estimated Delivery</span>
                  <span className="text-emerald-600 font-semibold">FREE (Local Distribution Hub)</span>
                </div>
                <div className="border-t border-slate-100 pt-2 flex justify-between font-black text-lg text-slate-900">
                  <span>Total Order Amount</span>
                  <span className="text-ocean-900">{formatCurrency(cartTotalAmount)}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onProceedToCheckout();
                }}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-ocean-700 to-ocean-800 hover:from-ocean-800 hover:to-ocean-900 text-white font-bold text-sm py-3.5 px-6 rounded-xl shadow-lg shadow-ocean-700/20 active:scale-98 transition-all"
              >
                <span>Proceed to Order Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[11px] text-center text-slate-400">
                🔒 Guest Checkout • No Account Required • Payment at Delivery / UPI
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
