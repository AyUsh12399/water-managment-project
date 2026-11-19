import React, { useState } from 'react';
import { useWater } from '../../context/WaterContext';
import { useAuth } from '../../context/AuthContext';
import { Order, PaymentMethod } from '../../types';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { 
  Truck, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  RotateCcw, 
  DollarSign, 
  Clock, 
  FileText,
  Navigation,
  X
} from 'lucide-react';

export const DeliveryDashboard: React.FC = () => {
  const { currentUser, role } = useAuth();
  const { orders, customers, updateDeliveryStatus, completeDelivery } = useWater();

  // Modals
  const [completingOrder, setCompletingOrder] = useState<Order | null>(null);
  const [actualDeliveredJars, setActualDeliveredJars] = useState<number>(0);
  const [emptyJarsCollected, setEmptyJarsCollected] = useState<number>(0);
  const [amountCollected, setAmountCollected] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [deliveryNotes, setDeliveryNotes] = useState<string>('');

  const [failingOrder, setFailingOrder] = useState<Order | null>(null);
  const [failReason, setFailReason] = useState<string>('');

  // Delivery driver only sees orders assigned to them (or all if simulated by owner)
  const assignedOrders = orders.filter(o => {
    if (role === 'owner') return true; // Owner can preview all
    return o.assignedDeliveryPersonId === currentUser?.id;
  });

  const activeDeliveries = assignedOrders.filter(o => 
    ['Confirmed', 'Out for Delivery'].includes(o.deliveryStatus)
  );

  const completedDeliveries = assignedOrders.filter(o => 
    o.deliveryStatus === 'Delivered'
  );

  const handleOpenCompleteModal = (order: Order) => {
    // Default delivered jars to the sum of 20L jars in order
    const defaultJarCount = order.items
      .filter(i => i.isJar20L)
      .reduce((sum, i) => sum + i.quantity, 0);

    const pendingAmount = Math.max(0, order.totalAmount - order.paidAmount);

    setCompletingOrder(order);
    setActualDeliveredJars(defaultJarCount);
    setEmptyJarsCollected(defaultJarCount); // usually equal exchange
    setAmountCollected(pendingAmount);
    setPaymentMethod('Cash');
    setDeliveryNotes('');
  };

  const handleConfirmCompletion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingOrder) return;

    completeDelivery(
      completingOrder.id,
      actualDeliveredJars,
      emptyJarsCollected,
      amountCollected,
      paymentMethod,
      deliveryNotes.trim() || undefined
    );

    setCompletingOrder(null);
  };

  const handleConfirmFailure = (e: React.FormEvent) => {
    e.preventDefault();
    if (!failingOrder || !failReason.trim()) return;

    updateDeliveryStatus(failingOrder.id, 'Failed', failReason.trim());
    setFailingOrder(null);
    setFailReason('');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4">
      {/* Driver Header Card */}
      <div className="bg-gradient-to-r from-ocean-900 to-ocean-800 text-white rounded-3xl p-6 sm:p-7 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-black shadow-md">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                Delivery Dispatch Console
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {currentUser?.name || 'Delivery Partner'}
            </h2>
            <p className="text-xs text-slate-300">
              Only assigned runs are displayed. Direct dial &amp; GPS navigation integrated.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-center">
          <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-xs">
            <span className="text-[10px] uppercase font-bold text-slate-300 block">Pending</span>
            <span className="text-xl font-black text-white">{activeDeliveries.length}</span>
          </div>
          <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-xs">
            <span className="text-[10px] uppercase font-bold text-slate-300 block">Delivered</span>
            <span className="text-xl font-black text-emerald-400">{completedDeliveries.length}</span>
          </div>
        </div>
      </div>

      {/* Active Orders List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
            <span>Pending Deliveries</span>
            <span className="bg-ocean-100 text-ocean-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {activeDeliveries.length}
            </span>
          </h3>
          <span className="text-xs text-slate-500 font-medium">Prioritize orders marked Out for Delivery</span>
        </div>

        {activeDeliveries.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center font-bold">
              ✓
            </div>
            <h4 className="font-bold text-slate-800 text-base">All Caught Up!</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              There are no pending deliveries assigned to your vehicle right now. New dispatch orders from the owner will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeDeliveries.map(order => {
              const customer = customers.find(c => c.id === order.customerId);
              const pendingDue = Math.max(0, order.totalAmount - order.paidAmount);
              const jarCount = order.items
                .filter(i => i.isJar20L)
                .reduce((s, i) => s + i.quantity, 0);

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border-2 border-slate-200/90 hover:border-ocean-300 shadow-sm p-5 space-y-4 transition-all"
                >
                  {/* Top Bar: Customer & Status */}
                  <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-black text-slate-900">{order.customerName}</h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                          #{order.id}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1 font-semibold text-ocean-700">
                          <Phone className="w-3.5 h-3.5 text-ocean-600" />
                          +91 {order.customerPhone}
                        </span>
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${
                      order.deliveryStatus === 'Out for Delivery'
                        ? 'bg-sky-100 text-sky-800 animate-pulse-subtle'
                        : 'bg-indigo-100 text-indigo-800'
                    }`}>
                      {order.deliveryStatus}
                    </span>
                  </div>

                  {/* Address with click to navigate */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="font-semibold text-slate-900 block">{order.deliveryAddress}</span>
                        {order.landmark && (
                          <span className="text-slate-500 text-[11px] block">Landmark: {order.landmark}</span>
                        )}
                      </div>
                    </div>

                    {order.specialInstructions && (
                      <div className="border-t border-slate-200 pt-2 flex items-start gap-2 text-amber-800">
                        <FileText className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span className="italic">"{order.specialInstructions}"</span>
                      </div>
                    )}

                    {/* Quick Dial & Maps Links */}
                    <div className="pt-1 flex items-center gap-2">
                      <a
                        href={`tel:+91${order.customerPhone}`}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 font-bold text-xs text-slate-800 transition-colors shadow-2xs"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Call Customer</span>
                      </a>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.deliveryAddress)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 font-bold text-xs text-slate-800 transition-colors shadow-2xs"
                      >
                        <Navigation className="w-3.5 h-3.5 text-ocean-600" />
                        <span>Open Maps</span>
                      </a>
                    </div>
                  </div>

                  {/* Products to Deliver & Empty Jars to Collect */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* Items */}
                    <div className="p-3 rounded-xl bg-ocean-50/60 border border-ocean-100 space-y-1">
                      <span className="text-[10px] font-bold text-ocean-800 uppercase tracking-wider block">
                        Products to Deliver
                      </span>
                      {order.items.map((item, idx) => (
                        <div key={idx} className="font-semibold text-slate-900 flex justify-between">
                          <span>{item.quantity}x {item.productName}</span>
                          <span className="text-slate-500 font-normal">(@ {formatCurrency(item.priceAtOrder)})</span>
                        </div>
                      ))}
                    </div>

                    {/* Collection Reminder: Money & Jars */}
                    <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1 text-amber-950">
                      <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                        Collections Required
                      </span>
                      <div className="flex justify-between font-bold">
                        <span>Payment Due:</span>
                        <span className="text-red-600 font-black">{formatCurrency(pendingDue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Customer Jar Debt:</span>
                        <span className="font-black text-ocean-900">{customer?.outstandingJars || 0} Jars Held</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions for Delivery Driver */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
                    {order.deliveryStatus === 'Confirmed' && (
                      <button
                        onClick={() => updateDeliveryStatus(order.id, 'Out for Delivery')}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm transition-all"
                      >
                        <Truck className="w-4 h-4" />
                        <span>Start Run (Out for Delivery)</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleOpenCompleteModal(order)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all active:scale-95"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Mark Delivered &amp; Collect</span>
                    </button>

                    <button
                      onClick={() => setFailingOrder(order)}
                      className="px-3.5 py-2.5 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 text-xs font-semibold transition-colors"
                    >
                      Delivery Failed
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL: Complete Delivery */}
      {completingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setCompletingOrder(null)} />
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 z-10 space-y-4 my-8">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-600">Proof of Delivery</span>
                <h3 className="font-extrabold text-lg text-slate-900">
                  Complete Delivery for #{completingOrder.id}
                </h3>
                <p className="text-xs text-slate-500">Customer: {completingOrder.customerName}</p>
              </div>
              <button onClick={() => setCompletingOrder(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmCompletion} className="space-y-4 text-xs">
              {/* Jar Collection Fields */}
              <div className="p-4 rounded-2xl bg-aqua-50 border border-aqua-200 space-y-3">
                <div className="flex items-center gap-1.5 font-bold text-aqua-950">
                  <RotateCcw className="w-4 h-4 text-aqua-600" />
                  <span>20L Reusable Jar Reconciliation</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Actual 20L Jars Delivered *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={actualDeliveredJars}
                      onChange={e => setActualDeliveredJars(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-black text-slate-900 bg-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Empty Jars Collected *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={emptyJarsCollected}
                      onChange={e => setEmptyJarsCollected(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-black text-slate-900 bg-white outline-none"
                    />
                  </div>
                </div>

                <p className="text-[10px] text-aqua-800">
                  Net change to customer jar balance: <strong>{actualDeliveredJars - emptyJarsCollected >= 0 ? `+${actualDeliveredJars - emptyJarsCollected}` : actualDeliveredJars - emptyJarsCollected} Jars</strong>
                </p>
              </div>

              {/* Payment Collection Fields */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
                <div className="flex items-center gap-1.5 font-bold text-emerald-950">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>Payment Collection</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Amount Collected (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={amountCollected}
                      onChange={e => setAmountCollected(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-black text-slate-900 bg-white outline-none"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      Total order value: {formatCurrency(completingOrder.totalAmount)}
                    </span>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Payment Method *
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold outline-none"
                    >
                      <option value="Cash">Cash</option>
                      <option value="UPI">UPI (QR / App)</option>
                      <option value="Other">Other / Credit</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Delivery Notes (Optional)
                </label>
                <input
                  type="text"
                  value={deliveryNotes}
                  onChange={e => setDeliveryNotes(e.target.value)}
                  placeholder="e.g. Left near security desk / Collected 2 Bisleri jars"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCompletingOrder(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md active:scale-95 transition-all"
                >
                  Confirm Delivery &amp; Record Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Delivery Failed */}
      {failingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60" onClick={() => setFailingOrder(null)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 z-10 space-y-4">
            <div className="flex items-center gap-2 text-amber-600">
              <AlertCircle className="w-5 h-5" />
              <h3 className="font-bold text-lg text-slate-900">Mark Delivery as Failed</h3>
            </div>
            <p className="text-xs text-slate-500">
              <strong>Delivery Protection:</strong> Failed deliveries will NOT deduct or alter customer jar balances, and will NOT charge or credit payments.
            </p>

            <form onSubmit={handleConfirmFailure} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Failure Reason *</label>
                <select
                  required
                  value={failReason}
                  onChange={e => setFailReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold outline-none"
                >
                  <option value="">-- Choose Reason --</option>
                  <option value="Customer door locked / unavailable">Customer door locked / unavailable</option>
                  <option value="Phone not reachable">Phone not reachable</option>
                  <option value="Customer asked to reschedule">Customer asked to reschedule</option>
                  <option value="Incorrect delivery address">Incorrect delivery address</option>
                  <option value="Vehicle breakdown / Traffic delay">Vehicle breakdown / Traffic delay</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setFailingOrder(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!failReason}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold disabled:opacity-50"
                >
                  Confirm Failed Attempt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
