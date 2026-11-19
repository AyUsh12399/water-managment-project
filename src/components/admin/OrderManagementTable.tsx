import React, { useState, useMemo } from 'react';
import { useWater } from '../../context/WaterContext';
import { useAuth } from '../../context/AuthContext';
import { Order, OrderStatus, PaymentStatus } from '../../types';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { 
  Search, 
  Filter, 
  CheckCircle, 
  Truck, 
  XCircle, 
  UserPlus, 
  Eye, 
  Edit3, 
  Calendar,
  X,
  AlertTriangle,
  Phone
} from 'lucide-react';

export const OrderManagementTable: React.FC = () => {
  const { orders, confirmOrder, assignDeliveryPerson, cancelOrder, editOrderDetails } = useWater();
  const { allUsers } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'yesterday' | 'week'>('all');

  // Modals state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [assigningOrder, setAssigningOrder] = useState<Order | null>(null);
  const [cancellingOrder, setCancellingOrder] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editAddress, setEditAddress] = useState('');
  const [editInstructions, setEditInstructions] = useState('');

  const deliveryPersonnel = allUsers.filter(u => u.role === 'delivery');

  // Filtering
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Search
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        !searchQuery ||
        order.id.toLowerCase().includes(q) ||
        order.customerName.toLowerCase().includes(q) ||
        order.customerPhone.includes(q) ||
        order.deliveryAddress.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      // Status
      if (statusFilter !== 'all' && order.deliveryStatus !== statusFilter) {
        return false;
      }

      // Date
      if (dateFilter !== 'all') {
        const orderDate = new Date(order.createdAt).toDateString();
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();

        if (dateFilter === 'today' && orderDate !== today) return false;
        if (dateFilter === 'yesterday' && orderDate !== yesterday) return false;
        if (dateFilter === 'week') {
          const sevenDaysAgo = Date.now() - 7 * 86400000;
          if (new Date(order.createdAt).getTime() < sevenDaysAgo) return false;
        }
      }

      return true;
    });
  }, [orders, searchQuery, statusFilter, dateFilter]);

  const handleAssignDriver = (driverId: string) => {
    if (!assigningOrder) return;
    const driver = deliveryPersonnel.find(d => d.id === driverId);
    if (driver) {
      assignDeliveryPerson(assigningOrder.id, driver.id, driver.name);
    }
    setAssigningOrder(null);
  };

  const handleConfirmCancel = () => {
    if (!cancellingOrder || !cancelReason.trim()) return;
    cancelOrder(cancellingOrder.id, cancelReason.trim());
    setCancellingOrder(null);
    setCancelReason('');
  };

  const handleSaveEdit = () => {
    if (!editingOrder) return;
    editOrderDetails(editingOrder.id, {
      deliveryAddress: editAddress.trim() || editingOrder.deliveryAddress,
      specialInstructions: editInstructions.trim(),
    });
    setEditingOrder(null);
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex-1 min-w-[280px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by Order ID, Customer Name, Mobile Number, or Street..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 text-sm outline-none transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="New">New</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Failed">Failed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value as any)}
              className="bg-transparent text-xs font-semibold text-slate-700 outline-none cursor-pointer"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">Last 7 Days</option>
            </select>
          </div>

          <span className="text-xs font-medium text-slate-500">
            Showing {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}
          </span>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Order ID &amp; Date</th>
                <th className="py-3.5 px-4">Customer &amp; Phone</th>
                <th className="py-3.5 px-4">Address</th>
                <th className="py-3.5 px-4">Products &amp; Qty</th>
                <th className="py-3.5 px-4">Amount &amp; Payment</th>
                <th className="py-3.5 px-4">Delivery Status</th>
                <th className="py-3.5 px-4">Assigned Driver</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No matching orders found. Try adjusting search or filters.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => {
                  return (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Order ID & Date */}
                      <td className="py-3.5 px-4 align-top">
                        <span className="font-mono font-bold text-ocean-900 block">
                          {order.id}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {formatDateTime(order.createdAt)}
                        </span>
                      </td>

                      {/* Customer & Phone */}
                      <td className="py-3.5 px-4 align-top">
                        <span className="font-bold text-slate-900 block">{order.customerName}</span>
                        <a 
                          href={`tel:+91${order.customerPhone}`} 
                          className="text-[11px] text-ocean-600 hover:underline flex items-center gap-1 mt-0.5"
                        >
                          <Phone className="w-3 h-3 text-ocean-500" />
                          <span>+91 {order.customerPhone}</span>
                        </a>
                      </td>

                      {/* Address */}
                      <td className="py-3.5 px-4 align-top max-w-[200px]">
                        <span className="text-slate-800 line-clamp-2">{order.deliveryAddress}</span>
                        {order.landmark && (
                          <span className="text-[10px] text-slate-400 block">Near: {order.landmark}</span>
                        )}
                      </td>

                      {/* Products */}
                      <td className="py-3.5 px-4 align-top max-w-[200px]">
                        <div className="space-y-0.5">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="text-slate-700 truncate">
                              <strong>{item.quantity}x</strong> {item.productName}
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Amount & Payment */}
                      <td className="py-3.5 px-4 align-top">
                        <span className="font-extrabold text-slate-900 text-sm block">
                          {formatCurrency(order.totalAmount)}
                        </span>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase mt-1 ${
                          order.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                          order.paymentStatus === 'Partial' ? 'bg-amber-100 text-amber-800' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {order.paymentStatus}
                        </span>
                      </td>

                      {/* Delivery Status */}
                      <td className="py-3.5 px-4 align-top">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${
                          order.deliveryStatus === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                          order.deliveryStatus === 'Out for Delivery' ? 'bg-sky-100 text-sky-800' :
                          order.deliveryStatus === 'Confirmed' ? 'bg-indigo-100 text-indigo-800' :
                          order.deliveryStatus === 'Cancelled' ? 'bg-red-100 text-red-800' :
                          order.deliveryStatus === 'Failed' ? 'bg-amber-100 text-amber-800' :
                          'bg-ocean-100 text-ocean-800'
                        }`}>
                          {order.deliveryStatus}
                        </span>
                      </td>

                      {/* Assigned Driver */}
                      <td className="py-3.5 px-4 align-top">
                        {order.assignedDeliveryPersonName ? (
                          <span className="font-semibold text-slate-800 text-[11px] block">
                            {order.assignedDeliveryPersonName}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic block">
                            Not Assigned
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 align-top text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Confirm Button for New */}
                          {order.deliveryStatus === 'New' && (
                            <button
                              onClick={() => confirmOrder(order.id)}
                              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-[11px] shadow-xs transition-all"
                              title="Confirm Order"
                            >
                              Confirm
                            </button>
                          )}

                          {/* Assign Driver */}
                          {['New', 'Confirmed', 'Out for Delivery'].includes(order.deliveryStatus) && (
                            <button
                              onClick={() => setAssigningOrder(order)}
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors"
                              title="Assign Delivery Driver"
                            >
                              <UserPlus className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Edit Details */}
                          {order.deliveryStatus !== 'Delivered' && order.deliveryStatus !== 'Cancelled' && (
                            <button
                              onClick={() => {
                                setEditingOrder(order);
                                setEditAddress(order.deliveryAddress);
                                setEditInstructions(order.specialInstructions || '');
                              }}
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors"
                              title="Edit Delivery Details"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* View Details */}
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-ocean-700 transition-colors"
                            title="View Full Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Cancel Order */}
                          {order.deliveryStatus !== 'Delivered' && order.deliveryStatus !== 'Cancelled' && (
                            <button
                              onClick={() => setCancellingOrder(order)}
                              className="p-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 transition-colors"
                              title="Cancel Order"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: View Order Details */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setSelectedOrder(null)} />
          <div className="relative w-full max-w-xl bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 z-10 space-y-4">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-ocean-600">Order Inspection</span>
                <h3 className="font-extrabold text-xl text-slate-900 font-mono">#{selectedOrder.id}</h3>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block">Customer</span>
                <span className="font-bold text-slate-900">{selectedOrder.customerName}</span>
                <span className="block text-slate-500">+91 {selectedOrder.customerPhone}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Delivery Status</span>
                <span className="font-bold text-ocean-700">{selectedOrder.deliveryStatus}</span>
                <span className="block text-slate-500">Payment: {selectedOrder.paymentStatus}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block">Address</span>
                <span className="font-semibold text-slate-800">{selectedOrder.deliveryAddress}</span>
              </div>
              {selectedOrder.specialInstructions && (
                <div className="col-span-2">
                  <span className="text-slate-400 block">Instructions</span>
                  <span className="italic text-slate-600">{selectedOrder.specialInstructions}</span>
                </div>
              )}
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
              {selectedOrder.items.map((item, idx) => (
                <div key={idx} className="p-2.5 flex justify-between items-center">
                  <div>
                    <span className="font-bold">{item.quantity}x</span> {item.productName}
                    <span className="text-[10px] text-slate-400 ml-1">(@ {formatCurrency(item.priceAtOrder)})</span>
                  </div>
                  <span className="font-bold text-slate-900">{formatCurrency(item.subtotal)}</span>
                </div>
              ))}
              <div className="p-3 bg-slate-50 flex justify-between font-black text-sm text-slate-900">
                <span>Total Amount</span>
                <span className="text-ocean-900">{formatCurrency(selectedOrder.totalAmount)}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Assign Delivery Person */}
      {assigningOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setAssigningOrder(null)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 z-10 space-y-4">
            <h3 className="font-bold text-lg text-slate-900">
              Assign Delivery Driver for #{assigningOrder.id}
            </h3>
            <p className="text-xs text-slate-500">
              Select an authorized delivery partner to dispatch this order to their mobile portal.
            </p>

            <div className="space-y-2 pt-2">
              {deliveryPersonnel.map(driver => (
                <button
                  key={driver.id}
                  onClick={() => handleAssignDriver(driver.id)}
                  className="w-full p-3 rounded-xl border border-slate-200 hover:border-ocean-500 hover:bg-ocean-50 text-left flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-ocean-100 text-ocean-700 font-bold flex items-center justify-center text-xs">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900">{driver.name}</div>
                      <div className="text-[10px] text-slate-500">+91 {driver.phone}</div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-ocean-600">Assign →</span>
                </button>
              ))}
            </div>

            <div className="flex justify-end pt-3">
              <button
                onClick={() => setAssigningOrder(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Cancel Order */}
      {cancellingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setCancellingOrder(null)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 z-10 space-y-4">
            <div className="flex items-center gap-2.5 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold text-lg text-slate-900">Cancel Order #{cancellingOrder.id}</h3>
            </div>
            <p className="text-xs text-slate-500">
              Cancelling this order will automatically reverse any uncollected customer ledger dues and update customer balances safely with an audit trail.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cancellation Reason *
              </label>
              <textarea
                required
                rows={3}
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                placeholder="e.g. Customer cancelled via phone / Duplicate order / Address out of service"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setCancellingOrder(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Go Back
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={!cancelReason.trim()}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Edit Order Details */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setEditingOrder(null)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 z-10 space-y-4">
            <h3 className="font-bold text-lg text-slate-900">Edit Order Details #{editingOrder.id}</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Delivery Address</label>
                <textarea
                  rows={2}
                  value={editAddress}
                  onChange={e => setEditAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-ocean-500 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Special Instructions</label>
                <input
                  type="text"
                  value={editInstructions}
                  onChange={e => setEditInstructions(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-ocean-500 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingOrder(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-5 py-2 bg-ocean-700 hover:bg-ocean-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
              >
                Save Updates
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
