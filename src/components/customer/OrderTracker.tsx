import React, { useState, useEffect } from 'react';
import { useWater } from '../../context/WaterContext';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { Order } from '../../types';
import { 
  Search, 
  Truck, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  MapPin, 
  Phone, 
  XCircle, 
  Package,
  Droplets,
  ArrowRight
} from 'lucide-react';

interface OrderTrackerProps {
  initialOrderId?: string;
  initialPhone?: string;
}

export const OrderTracker: React.FC<OrderTrackerProps> = ({ initialOrderId = '', initialPhone = '' }) => {
  const { orders } = useWater();
  const [searchOrderId, setSearchOrderId] = useState(initialOrderId);
  const [searchPhone, setSearchPhone] = useState(initialPhone);
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialOrderId) {
      handleSearch(initialOrderId, initialPhone);
    }
  }, [initialOrderId, initialPhone]);

  const handleSearch = (orderIdToSearch?: string, phoneToSearch?: string) => {
    const id = (orderIdToSearch !== undefined ? orderIdToSearch : searchOrderId).trim();
    const phone = (phoneToSearch !== undefined ? phoneToSearch : searchPhone).trim().replace(/\D/g, '');

    setError(null);
    setSearched(true);

    if (!id && !phone) {
      setError('Please enter either your Order ID or registered 10-digit Mobile Number.');
      setTrackedOrder(null);
      return;
    }

    // Secure search: find by Order ID or phone
    const match = orders.find(o => {
      const idMatch = id ? o.id.toLowerCase() === id.toLowerCase() : false;
      const phoneMatch = phone ? o.customerPhone.slice(-10) === phone.slice(-10) : false;

      if (id && phone) {
        return idMatch && phoneMatch;
      }
      return idMatch || phoneMatch;
    });

    if (match) {
      setTrackedOrder(match);
    } else {
      setTrackedOrder(null);
      setError('No matching order found. Please check your Order ID and phone number.');
    }
  };

  const getStepStatus = (stepIndex: number, status: Order['deliveryStatus']) => {
    const statusMap: { [key: string]: number } = {
      'New': 1,
      'Confirmed': 2,
      'Out for Delivery': 3,
      'Delivered': 4,
      'Failed': 3, // Shows stopped at out for delivery
      'Cancelled': 1,
    };
    const currentStep = statusMap[status] || 1;
    if (currentStep > stepIndex) return 'completed';
    if (currentStep === stepIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6">
      {/* Search Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-ocean-600">
            Real-Time Logistics Tracking
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Track Your Water Delivery
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Enter your unique Order ID (e.g. ORD-20261111-XXXX) or your 10-digit mobile number to view live driver assignment, dispatch time, and delivery progress.
          </p>
        </div>

        <form 
          onSubmit={e => {
            e.preventDefault();
            handleSearch();
          }} 
          className="grid grid-cols-1 sm:grid-cols-12 gap-3"
        >
          <div className="sm:col-span-5">
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Order ID
            </label>
            <input
              type="text"
              value={searchOrderId}
              onChange={e => setSearchOrderId(e.target.value)}
              placeholder="e.g. ORD-20261111-4091"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 text-sm outline-none uppercase font-mono"
            />
          </div>

          <div className="sm:col-span-4">
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Mobile Number (10 Digits)
            </label>
            <input
              type="tel"
              maxLength={10}
              value={searchPhone}
              onChange={e => setSearchPhone(e.target.value.replace(/\D/g, ''))}
              placeholder="e.g. 9876543210"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 text-sm outline-none font-mono"
            />
          </div>

          <div className="sm:col-span-3 flex items-end">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-ocean-700 hover:bg-ocean-800 text-white font-bold text-sm py-2.5 px-5 rounded-xl shadow-md transition-all active:scale-95"
            >
              <Search className="w-4 h-4" />
              <span>Track Order</span>
            </button>
          </div>
        </form>

        {error && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Tracked Order Details */}
      {trackedOrder && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden animate-in fade-in duration-300">
          {/* Status Top Banner */}
          <div className={`p-6 text-white flex flex-wrap items-center justify-between gap-4 ${
            trackedOrder.deliveryStatus === 'Delivered' ? 'bg-gradient-to-r from-emerald-600 to-teal-700' :
            trackedOrder.deliveryStatus === 'Cancelled' ? 'bg-gradient-to-r from-red-600 to-rose-700' :
            trackedOrder.deliveryStatus === 'Failed' ? 'bg-gradient-to-r from-amber-600 to-orange-700' :
            'bg-gradient-to-r from-ocean-900 via-ocean-800 to-ocean-700'
          }`}>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-white/80">
                  Live Dispatch Status
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-white/20 text-white border border-white/30">
                  {trackedOrder.deliveryStatus}
                </span>
              </div>
              <h3 className="text-2xl font-black text-white mt-1">
                Order #{trackedOrder.id}
              </h3>
              <p className="text-xs text-white/80">
                Placed on {formatDateTime(trackedOrder.createdAt)}
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs text-white/80 block">Total Amount</span>
              <span className="text-2xl font-black text-white">
                {formatCurrency(trackedOrder.totalAmount)}
              </span>
              <span className={`text-[10px] font-bold block uppercase px-2 py-0.5 rounded-full mt-1 ${
                trackedOrder.paymentStatus === 'Paid' ? 'bg-emerald-400 text-emerald-950' :
                trackedOrder.paymentStatus === 'Partial' ? 'bg-amber-300 text-amber-950' :
                'bg-white/20 text-white'
              }`}>
                Payment: {trackedOrder.paymentStatus}
              </span>
            </div>
          </div>

          {/* Stepper Progress Bar */}
          <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50">
            {trackedOrder.deliveryStatus === 'Cancelled' ? (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold">Order Cancelled</h4>
                  <p className="text-xs mt-0.5">
                    Reason: {trackedOrder.cancellationReason || 'Cancelled by customer or dispatcher request.'}
                  </p>
                </div>
              </div>
            ) : trackedOrder.deliveryStatus === 'Failed' ? (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold">Delivery Attempt Failed</h4>
                  <p className="text-xs mt-0.5">
                    Reason: {trackedOrder.cancellationReason || 'Delivery could not be completed. Our team will reschedule.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {/* Step 1: New */}
                <div className="space-y-2 text-center sm:text-left">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      getStepStatus(1, trackedOrder.deliveryStatus) === 'completed' || getStepStatus(1, trackedOrder.deliveryStatus) === 'current'
                        ? 'bg-ocean-600 text-white shadow-sm'
                        : 'bg-slate-200 text-slate-500'
                    }`}>
                      1
                    </div>
                    <div className="hidden sm:block flex-1 h-1 bg-slate-200 ml-2">
                      <div className={`h-full ${
                        getStepStatus(2, trackedOrder.deliveryStatus) !== 'upcoming' ? 'bg-ocean-600' : 'bg-transparent'
                      }`} />
                    </div>
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-900">Order Placed</h5>
                    <p className="text-[10px] text-slate-500">Visible to Dispatch</p>
                  </div>
                </div>

                {/* Step 2: Confirmed */}
                <div className="space-y-2 text-center sm:text-left">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      getStepStatus(2, trackedOrder.deliveryStatus) === 'completed' || getStepStatus(2, trackedOrder.deliveryStatus) === 'current'
                        ? 'bg-ocean-600 text-white shadow-sm'
                        : 'bg-slate-200 text-slate-500'
                    }`}>
                      2
                    </div>
                    <div className="hidden sm:block flex-1 h-1 bg-slate-200 ml-2">
                      <div className={`h-full ${
                        getStepStatus(3, trackedOrder.deliveryStatus) !== 'upcoming' ? 'bg-ocean-600' : 'bg-transparent'
                      }`} />
                    </div>
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-900">Confirmed by Hub</h5>
                    <p className="text-[10px] text-slate-500">
                      {trackedOrder.confirmedAt ? formatDateTime(trackedOrder.confirmedAt) : 'Pending Confirmation'}
                    </p>
                  </div>
                </div>

                {/* Step 3: Out for Delivery */}
                <div className="space-y-2 text-center sm:text-left">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      getStepStatus(3, trackedOrder.deliveryStatus) === 'completed' || getStepStatus(3, trackedOrder.deliveryStatus) === 'current'
                        ? 'bg-ocean-600 text-white shadow-sm'
                        : 'bg-slate-200 text-slate-500'
                    }`}>
                      3
                    </div>
                    <div className="hidden sm:block flex-1 h-1 bg-slate-200 ml-2">
                      <div className={`h-full ${
                        getStepStatus(4, trackedOrder.deliveryStatus) !== 'upcoming' ? 'bg-emerald-600' : 'bg-transparent'
                      }`} />
                    </div>
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-900">Out for Delivery</h5>
                    <p className="text-[10px] text-slate-500">
                      {trackedOrder.assignedDeliveryPersonName || 'Assigning Delivery Van'}
                    </p>
                  </div>
                </div>

                {/* Step 4: Delivered */}
                <div className="space-y-2 text-center sm:text-left">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      trackedOrder.deliveryStatus === 'Delivered'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-200 text-slate-500'
                    }`}>
                      ✓
                    </div>
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-900">Delivered</h5>
                    <p className="text-[10px] text-slate-500">
                      {trackedOrder.deliveredAt ? formatDateTime(trackedOrder.deliveredAt) : 'Estimated Today'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Content Grid */}
          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Delivery Recipient Info */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Delivery Details
              </h4>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                <div>
                  <span className="text-slate-500 block">Recipient Customer</span>
                  <span className="font-bold text-slate-900 text-sm">{trackedOrder.customerName}</span>
                </div>

                <div>
                  <span className="text-slate-500 block">Delivery Address</span>
                  <span className="font-semibold text-slate-800">{trackedOrder.deliveryAddress}</span>
                  {trackedOrder.landmark && (
                    <span className="text-slate-500 block mt-0.5">Landmark: {trackedOrder.landmark}</span>
                  )}
                </div>

                <div>
                  <span className="text-slate-500 block">Mobile Number</span>
                  <span className="font-semibold text-slate-800">+91 {trackedOrder.customerPhone}</span>
                </div>

                {trackedOrder.assignedDeliveryPersonName && (
                  <div className="border-t border-slate-200 pt-2 flex items-center justify-between">
                    <div>
                      <span className="text-slate-500 block">Assigned Driver</span>
                      <span className="font-bold text-ocean-700">{trackedOrder.assignedDeliveryPersonName}</span>
                    </div>
                    <span className="px-2 py-1 rounded bg-ocean-100 text-ocean-800 text-[10px] font-semibold">
                      En Route
                    </span>
                  </div>
                )}

                {trackedOrder.deliveryNotes && (
                  <div className="border-t border-slate-200 pt-2 text-slate-600">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Driver Delivery Notes:</span>
                    <span>"{trackedOrder.deliveryNotes}"</span>
                  </div>
                )}
              </div>
            </div>

            {/* Ordered Items Summary with Price Snapshot */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Products &amp; Quantities
              </h4>

              <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
                {trackedOrder.items.map((item, idx) => (
                  <div key={idx} className="p-3.5 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-slate-900">{item.quantity}x</span> {item.productName}
                      <span className="text-slate-400 block text-[11px]">
                        Locked Price Snapshot: {formatCurrency(item.priceAtOrder)} / unit
                      </span>
                    </div>
                    <span className="font-bold text-slate-900 text-sm">
                      {formatCurrency(item.subtotal)}
                    </span>
                  </div>
                ))}

                <div className="p-4 bg-slate-50 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Order Subtotal</span>
                    <span>{formatCurrency(trackedOrder.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Amount Paid</span>
                    <span className="text-emerald-700 font-bold">{formatCurrency(trackedOrder.paidAmount)}</span>
                  </div>
                  <div className="flex justify-between font-black text-sm text-slate-900 border-t border-slate-200 pt-2">
                    <span>Pending Due</span>
                    <span className="text-ocean-900">
                      {formatCurrency(Math.max(0, trackedOrder.totalAmount - trackedOrder.paidAmount))}
                    </span>
                  </div>
                </div>
              </div>

              {trackedOrder.actualDeliveredJars !== undefined && trackedOrder.actualDeliveredJars > 0 && (
                <div className="p-3 rounded-xl bg-ocean-50 border border-ocean-200 text-xs text-ocean-900 flex justify-between items-center font-medium">
                  <span>Jars Delivered: <strong>{trackedOrder.actualDeliveredJars}</strong></span>
                  <span>Empty Jars Returned: <strong>{trackedOrder.emptyJarsCollected || 0}</strong></span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
