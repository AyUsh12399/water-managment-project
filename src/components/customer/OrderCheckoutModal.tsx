import React, { useState } from 'react';
import { useWater } from '../../context/WaterContext';
import { formatCurrency, isValidIndianPhone } from '../../utils/formatters';
import { Order } from '../../types';
import { X, ShieldCheck, MapPin, Phone, User, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface OrderCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const OrderCheckoutModal: React.FC<OrderCheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess,
}) => {
  const { cart, products, createOrder, cartTotalAmount } = useWater();

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Safeguard states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Idempotency key per open checkout session to prevent duplicate orders
  const [idempotencyKey] = useState(() => `idemp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);

  if (!isOpen) return null;

  const cartEntries = Object.entries(cart);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!customerName.trim()) {
      setErrorMessage('Please enter your full name');
      return;
    }

    if (!isValidIndianPhone(customerPhone)) {
      setErrorMessage('Please enter a valid 10-digit mobile number (e.g. 9876543210)');
      return;
    }

    if (!deliveryAddress.trim() || deliveryAddress.trim().length < 5) {
      setErrorMessage('Please provide a complete delivery address (building, flat/office, street)');
      return;
    }

    if (cartEntries.length === 0) {
      setErrorMessage('Your cart is empty. Please select products first.');
      return;
    }

    // Duplicate Order Protection: prevent double click submissions
    setIsSubmitting(true);

    try {
      const items = cartEntries.map(([productId, quantity]) => ({
        productId,
        quantity,
      }));

      const result = await createOrder({
        customerName,
        customerPhone,
        deliveryAddress,
        landmark,
        specialInstructions,
        items,
        idempotencyKey,
      });

      if (result.success && result.order) {
        // Trigger celebratory confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#0284c7', '#38bdf8', '#0ea5e9', '#06b6d4', '#10b981'],
        });

        onOrderSuccess(result.order);
      } else {
        setErrorMessage(result.message || 'Failed to place order. Please try again.');
      }
    } catch (err) {
      console.error('Order creation error:', err);
      setErrorMessage('An unexpected error occurred while placing your order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={() => !isSubmitting && onClose()}
      />

      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in zoom-in-95 duration-200 my-8">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-ocean-900 to-ocean-800 text-white p-6 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-aqua-400"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-aqua-300">
                Customer Delivery Form
              </span>
            </div>
            <h3 className="text-xl font-extrabold text-white">Complete Your Water Order</h3>
            <p className="text-xs text-slate-300">
              No login required. We will assign a delivery driver immediately.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-ocean-800 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Customer Details */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Contact &amp; Delivery Information
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-ocean-600" />
                  <span>Customer Name *</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 text-sm outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-ocean-600" />
                  <span>Mobile Number *</span>
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="10-digit number (e.g. 9876543210)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 text-sm outline-none transition-all"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Used for delivery SMS, driver coordination, and order tracking.
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-ocean-600" />
                <span>Delivery Address *</span>
              </label>
              <textarea
                required
                rows={2}
                value={deliveryAddress}
                onChange={e => setDeliveryAddress(e.target.value)}
                placeholder="Flat / House No., Building Name, Floor, Street, Area"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 text-sm outline-none transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nearby Landmark (Optional)
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={e => setLandmark(e.target.value)}
                  placeholder="e.g. Near Metro Station / Behind Temple"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 text-sm outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-ocean-600" />
                  <span>Special Instructions</span>
                </label>
                <input
                  type="text"
                  value={specialInstructions}
                  onChange={e => setSpecialInstructions(e.target.value)}
                  placeholder="e.g. Call before coming, keep at door"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 text-sm outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Order Summary & Pricing Breakdown */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Order Items Snapshot
            </h4>
            
            <div className="divide-y divide-slate-200 text-xs">
              {cartEntries.map(([productId, qty]) => {
                const product = products.find(p => p.id === productId);
                if (!product) return null;
                return (
                  <div key={productId} className="py-1.5 flex justify-between items-center text-slate-700">
                    <div>
                      <span className="font-semibold text-slate-900">{qty}x</span> {product.name}
                      {product.isJar20L && (
                        <span className="ml-1 text-[10px] text-ocean-600 font-medium">(20L Jar)</span>
                      )}
                    </div>
                    <span className="font-bold text-slate-900">{formatCurrency(product.price * qty)}</span>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-slate-200 pt-2 flex items-center justify-between text-sm">
              <span className="font-bold text-slate-700">Total Order Amount</span>
              <span className="font-black text-xl text-ocean-900">{formatCurrency(cartTotalAmount)}</span>
            </div>

            <p className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Prices are locked at order creation. Pay via Cash or UPI when delivery arrives.</span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-all disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-gradient-to-r from-ocean-700 to-ocean-800 hover:from-ocean-800 hover:to-ocean-900 text-white font-bold text-sm px-7 py-3 rounded-xl shadow-lg shadow-ocean-700/20 active:scale-95 transition-all disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Placing Order...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-aqua-300" />
                  <span>Confirm Order ({formatCurrency(cartTotalAmount)})</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
