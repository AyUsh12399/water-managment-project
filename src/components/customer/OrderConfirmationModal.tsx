import React, { useState } from 'react';
import { Order } from '../../types';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { CheckCircle2, Copy, Check, Truck, ArrowRight, ShieldCheck, Phone, MapPin } from 'lucide-react';

interface OrderConfirmationModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onTrackOrder: (orderId: string, phone: string) => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  order,
  isOpen,
  onClose,
  onTrackOrder,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !order) return null;

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(order.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in zoom-in-95 duration-200 my-8">
        {/* Header with success badge */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-6 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto text-white shadow-inner">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-200">
              Order Confirmed &amp; Dispatched to Hub
            </span>
            <h3 className="text-2xl font-black text-white mt-1">Thank You, {order.customerName}!</h3>
            <p className="text-xs text-emerald-100 mt-1 max-w-sm mx-auto">
              Your water delivery request is now live in our system and visible on the owner dispatch board.
            </p>
          </div>
        </div>

        {/* Order ID Pill */}
        <div className="p-6 space-y-6">
          <div className="bg-ocean-50 rounded-2xl p-4 border border-ocean-200/80 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-ocean-700 uppercase tracking-wider block">
                Unique Order ID (Keep Safe For Tracking)
              </span>
              <span className="font-mono text-lg font-black text-ocean-950">
                {order.id}
              </span>
            </div>
            <button
              onClick={handleCopyOrderId}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-ocean-200 hover:bg-ocean-100 text-ocean-800 text-xs font-semibold shadow-xs transition-all active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-ocean-600" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Delivery Details */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold uppercase tracking-wider text-slate-400">Delivery Information</h4>
            
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-start gap-2 text-slate-700">
                <MapPin className="w-3.5 h-3.5 text-ocean-600 mt-0.5 shrink-0" />
                <span>
                  <strong>Address:</strong> {order.deliveryAddress}
                  {order.landmark && ` (Landmark: ${order.landmark})`}
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Phone className="w-3.5 h-3.5 text-ocean-600 shrink-0" />
                <span><strong>Phone:</strong> +91 {order.customerPhone}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Truck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span><strong>Status:</strong> <span className="text-emerald-700 font-bold uppercase">{order.deliveryStatus}</span></span>
              </div>
            </div>
          </div>

          {/* Items Summary */}
          <div className="space-y-2 text-xs">
            <h4 className="font-bold uppercase tracking-wider text-slate-400">Order Items</h4>
            <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
              {order.items.map((item, i) => (
                <div key={i} className="p-2.5 flex justify-between items-center bg-white">
                  <div>
                    <span className="font-semibold text-slate-900">{item.quantity}x</span> {item.productName}
                    <span className="text-[10px] text-slate-500 ml-1">(@ {formatCurrency(item.priceAtOrder)})</span>
                  </div>
                  <span className="font-bold text-slate-900">{formatCurrency(item.subtotal)}</span>
                </div>
              ))}
              <div className="p-3 bg-slate-50 flex justify-between items-center text-sm font-black text-slate-900">
                <span>Total Due</span>
                <span className="text-ocean-900 text-base">{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Pay on Delivery via <strong>Cash or UPI</strong> when driver arrives. Empty jars will be counted and deducted from your jar balance.</span>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={() => onTrackOrder(order.id, order.customerPhone)}
              className="w-full sm:flex-1 flex items-center justify-center gap-2 bg-ocean-700 hover:bg-ocean-800 text-white font-bold text-xs py-3 px-4 rounded-xl shadow-md transition-all"
            >
              <span>Track Live Delivery Status</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
