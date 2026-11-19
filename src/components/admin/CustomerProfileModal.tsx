import React, { useState } from 'react';
import { Customer, FinancialTransaction, JarTransaction, Order, PaymentMethod } from '../../types';
import { useWater } from '../../context/WaterContext';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters';
import { downloadCustomerStatementPDF } from '../../utils/exportUtils';
import { 
  X, 
  Download, 
  CreditCard, 
  PlusCircle, 
  Clock, 
  RotateCcw, 
  Edit2, 
  CheckCircle2, 
  AlertCircle,
  Phone,
  MapPin,
  Calendar,
  FileText,
  DollarSign
} from 'lucide-react';

interface CustomerProfileModalProps {
  customer: Customer | null;
  onClose: () => void;
}

export const CustomerProfileModal: React.FC<CustomerProfileModalProps> = ({ customer, onClose }) => {
  const { 
    financialTransactions, 
    jarTransactions, 
    orders, 
    recordCustomerPayment, 
    addManualDue, 
    manualJarAdjustment,
    updateCustomer 
  } = useWater();

  const [activeTab, setActiveTab] = useState<'financial' | 'jars' | 'orders'>('financial');

  // Sub-action modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [paymentRef, setPaymentRef] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  const [showDueModal, setShowDueModal] = useState(false);
  const [dueAmount, setDueAmount] = useState<number>(0);
  const [dueDescription, setDueDescription] = useState('');

  const [showJarAdjModal, setShowJarAdjModal] = useState(false);
  const [jarAdjCount, setJarAdjCount] = useState<number>(0);
  const [jarAdjReason, setJarAdjReason] = useState('');

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(customer?.name || '');
  const [editPhone, setEditPhone] = useState(customer?.phone || '');
  const [editAddress, setEditAddress] = useState(customer?.address || '');
  const [editLandmark, setEditLandmark] = useState(customer?.landmark || '');
  const [editNotes, setEditNotes] = useState(customer?.notes || '');

  if (!customer) return null;

  // Filter transactions for this customer
  const custFinancialTxs = financialTransactions
    .filter(t => t.customerId === customer.id)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const custJarTxs = jarTransactions
    .filter(j => j.customerId === customer.id)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const custOrders = orders.filter(o => o.customerId === customer.id);

  // Financial Calculations matching prompt summary:
  // Previous Due + New Orders - Total Payments = Current Due
  const totalDebits = custFinancialTxs.reduce((sum, t) => sum + t.debit, 0);
  const totalCredits = custFinancialTxs.reduce((sum, t) => sum + t.credit, 0);
  const calculatedDue = totalDebits - totalCredits;

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentAmount <= 0) return;
    recordCustomerPayment(
      customer.id, 
      paymentAmount, 
      paymentMethod, 
      paymentRef.trim() || undefined, 
      paymentNotes.trim() || undefined
    );
    setShowPaymentModal(false);
    setPaymentAmount(0);
    setPaymentRef('');
    setPaymentNotes('');
  };

  const handleAddManualDue = (e: React.FormEvent) => {
    e.preventDefault();
    if (dueAmount <= 0 || !dueDescription.trim()) return;
    addManualDue(customer.id, dueAmount, dueDescription.trim());
    setShowDueModal(false);
    setDueAmount(0);
    setDueDescription('');
  };

  const handleManualJarAdj = (e: React.FormEvent) => {
    e.preventDefault();
    if (jarAdjCount === 0 || !jarAdjReason.trim()) return;
    manualJarAdjustment(customer.id, jarAdjCount, jarAdjReason.trim());
    setShowJarAdjModal(false);
    setJarAdjCount(0);
    setJarAdjReason('');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateCustomer(customer.id, {
      name: editName.trim() || customer.name,
      phone: editPhone.trim() || customer.phone,
      address: editAddress.trim() || customer.address,
      landmark: editLandmark.trim(),
      notes: editNotes.trim(),
    });
    setIsEditingProfile(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in zoom-in-95 duration-200 my-6 flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="bg-ocean-950 text-white p-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-ocean-600 to-aqua-400 flex items-center justify-center text-white text-xl font-black shadow-md">
              {customer.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black tracking-tight text-white">{customer.name}</h2>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  customer.outstandingDue === 0 ? 'bg-emerald-400 text-emerald-950' :
                  customer.accountStatus === 'Overdue' ? 'bg-amber-400 text-amber-950' :
                  'bg-ocean-200 text-ocean-900'
                }`}>
                  {customer.accountStatus}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 mt-1">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-aqua-400" />
                  +91 {customer.phone}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-aqua-400" />
                  {customer.address}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions in Header */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => downloadCustomerStatementPDF(customer, custFinancialTxs, custJarTxs)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs transition-all active:scale-95"
            >
              <Download className="w-4 h-4 text-aqua-300" />
              <span>Download Statement (PDF)</span>
            </button>
            <button
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs transition-colors"
              title="Edit Customer Profile"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Edit Profile Banner (Collapsible) */}
        {isEditingProfile && (
          <form onSubmit={handleSaveProfile} className="bg-slate-50 border-b border-slate-200 p-4 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-0.5">Customer Name</label>
              <input
                type="text"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-0.5">Phone Number</label>
              <input
                type="tel"
                value={editPhone}
                onChange={e => setEditPhone(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-0.5">Address</label>
              <input
                type="text"
                value={editAddress}
                onChange={e => setEditAddress(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-ocean-700 text-white font-bold text-xs hover:bg-ocean-800"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Summary Metric Cards (Financial vs Jar Ledger) */}
        <div className="p-6 bg-slate-50/50 border-b border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Financial Summary (Exactly matches Prompt Part 3 Example) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-ocean-600" />
                <h4 className="font-bold text-sm text-slate-900 uppercase tracking-wide">
                  Financial Summary
                </h4>
              </div>
              <span className="text-xs font-black text-ocean-900 bg-ocean-50 px-2.5 py-1 rounded-full border border-ocean-100">
                Monetary Dues
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Previous Due</span>
                <span className="text-sm font-extrabold text-slate-800">
                  {formatCurrency(custFinancialTxs.find(t => t.description.includes('Previous Due'))?.debit || 0)}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Total Purchases</span>
                <span className="text-sm font-extrabold text-slate-800">{formatCurrency(customer.totalPurchases)}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Total Payments</span>
                <span className="text-sm font-extrabold text-emerald-700">{formatCurrency(customer.totalAmountPaid)}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-ocean-50 border border-ocean-100">
                <span className="text-[10px] text-ocean-700 font-bold uppercase block">Current Due</span>
                <span className="text-base font-black text-ocean-950">{formatCurrency(customer.outstandingDue)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => {
                  setPaymentAmount(customer.outstandingDue > 0 ? customer.outstandingDue : 0);
                  setShowPaymentModal(true);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all active:scale-95"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Record Payment</span>
              </button>

              <button
                onClick={() => setShowDueModal(true)}
                className="flex items-center justify-center gap-1 py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-all"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Manual Due</span>
              </button>
            </div>
          </div>

          {/* Card 2: Jar Summary (Part 4 Formula Implementation) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-aqua-600" />
                <h4 className="font-bold text-sm text-slate-900 uppercase tracking-wide">
                  20L Reusable Jar Summary
                </h4>
              </div>
              <span className="text-xs font-black text-aqua-900 bg-aqua-50 px-2.5 py-1 rounded-full border border-aqua-200">
                Formula: Prev + Deliv - Return
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Previous Balance</span>
                <span className="text-sm font-extrabold text-slate-800">{customer.previousJarBalance} Jars</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">New Delivered</span>
                <span className="text-sm font-extrabold text-slate-800">{customer.newJarsDelivered} Jars</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Empties Returned</span>
                <span className="text-sm font-extrabold text-emerald-700">{customer.emptyJarsReturned} Jars</span>
              </div>
              <div className="p-2.5 rounded-xl bg-aqua-50 border border-aqua-200">
                <span className="text-[10px] text-aqua-800 font-bold uppercase block">Current Jars Held</span>
                <span className="text-base font-black text-aqua-950">{customer.outstandingJars} Jars</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setShowJarAdjModal(true)}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-aqua-300 hover:bg-aqua-50 text-aqua-900 font-bold text-xs transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5 text-aqua-600" />
                <span>Adjust Jar Balance Manually</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation for Ledgers */}
        <div className="border-b border-slate-200 px-6 bg-white flex items-center gap-6">
          <button
            onClick={() => setActiveTab('financial')}
            className={`py-3.5 font-bold text-xs uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'financial'
                ? 'border-ocean-600 text-ocean-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Chronological Financial Ledger ({custFinancialTxs.length})
          </button>
          <button
            onClick={() => setActiveTab('jars')}
            className={`py-3.5 font-bold text-xs uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'jars'
                ? 'border-ocean-600 text-ocean-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Jar Movement Ledger ({custJarTxs.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3.5 font-bold text-xs uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'orders'
                ? 'border-ocean-600 text-ocean-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Order History ({custOrders.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: Financial Ledger Table */}
          {activeTab === 'financial' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs text-slate-500">
                <span>Immutable audit trail of all charges and payments. Historical transactions are never overwritten.</span>
                <span className="font-semibold text-slate-700">Running Due: {formatCurrency(customer.outstandingDue)}</span>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 font-bold uppercase text-[10px] text-slate-500">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Description</th>
                      <th className="py-3 px-4 text-right">Debit (+Due)</th>
                      <th className="py-3 px-4 text-right">Credit (-Paid)</th>
                      <th className="py-3 px-4 text-right">Balance Due</th>
                      <th className="py-3 px-4">Method / Ref</th>
                      <th className="py-3 px-4">Recorded By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {custFinancialTxs.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400">
                          No financial transactions recorded for this customer yet.
                        </td>
                      </tr>
                    ) : (
                      custFinancialTxs.map(tx => (
                        <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                            {formatDate(tx.date)}
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-900">
                            {tx.description}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-red-600">
                            {tx.debit > 0 ? formatCurrency(tx.debit) : '-'}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-emerald-600">
                            {tx.credit > 0 ? formatCurrency(tx.credit) : '-'}
                          </td>
                          <td className="py-3 px-4 text-right font-extrabold text-slate-900">
                            {formatCurrency(tx.balanceAfter)}
                          </td>
                          <td className="py-3 px-4 text-slate-500">
                            {tx.paymentMethod ? (
                              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-medium text-[10px]">
                                {tx.paymentMethod} {tx.paymentReference ? `(${tx.paymentReference})` : ''}
                              </span>
                            ) : '-'}
                          </td>
                          <td className="py-3 px-4 text-slate-500 text-[11px]">
                            {tx.recordedBy}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: Jar Ledger Table */}
          {activeTab === 'jars' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs text-slate-500">
                <span>Reusable 20-Litre jar movement history recorded by delivery personnel.</span>
                <span className="font-semibold text-slate-700">Currently with Customer: {customer.outstandingJars} Jars</span>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 font-bold uppercase text-[10px] text-slate-500">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Description</th>
                      <th className="py-3 px-4 text-right">Jars Delivered</th>
                      <th className="py-3 px-4 text-right">Empties Returned</th>
                      <th className="py-3 px-4 text-right">Balance Held</th>
                      <th className="py-3 px-4">Recorded By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {custJarTxs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          No jar transactions recorded yet.
                        </td>
                      </tr>
                    ) : (
                      custJarTxs.map(j => (
                        <tr key={j.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                            {formatDate(j.date)}
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-900">
                            {j.description}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-ocean-700">
                            {j.jarsDelivered > 0 ? `+${j.jarsDelivered}` : '-'}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-emerald-600">
                            {j.jarsReturned > 0 ? `-${j.jarsReturned}` : '-'}
                          </td>
                          <td className="py-3 px-4 text-right font-black text-slate-900">
                            {j.balanceAfter} Jars
                          </td>
                          <td className="py-3 px-4 text-slate-500 text-[11px]">
                            {j.recordedBy}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: Order History */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 font-bold uppercase text-[10px] text-slate-500">
                      <th className="py-3 px-4">Order ID</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Products</th>
                      <th className="py-3 px-4 text-right">Total Amount</th>
                      <th className="py-3 px-4">Payment</th>
                      <th className="py-3 px-4">Delivery Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {custOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          No orders placed by this customer yet.
                        </td>
                      </tr>
                    ) : (
                      custOrders.map(o => (
                        <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-ocean-900">
                            #{o.id}
                          </td>
                          <td className="py-3 px-4 text-slate-500">
                            {formatDateTime(o.createdAt)}
                          </td>
                          <td className="py-3 px-4 text-slate-700">
                            {o.items.map(i => `${i.quantity}x ${i.productName}`).join(', ')}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-slate-900">
                            {formatCurrency(o.totalAmount)}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              o.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                              o.paymentStatus === 'Partial' ? 'bg-amber-100 text-amber-800' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {o.paymentStatus}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-slate-700">
                              {o.deliveryStatus}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* SUB-MODAL: Record Payment */}
        {showPaymentModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/60" onClick={() => setShowPaymentModal(false)} />
            <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 z-10 space-y-4">
              <h3 className="font-bold text-lg text-slate-900">Record Customer Payment</h3>
              <p className="text-xs text-slate-500">
                Payment will be credited to {customer.name}'s account and deducted from outstanding dues immediately.
              </p>

              <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={paymentAmount || ''}
                    onChange={e => setPaymentAmount(parseFloat(e.target.value) || 0)}
                    placeholder="e.g. 500"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 outline-none focus:border-emerald-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Current outstanding due: {formatCurrency(customer.outstandingDue)}
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Method *</label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold outline-none"
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                    <option value="Bank Transfer">Bank Transfer / NEFT</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Reference / UTR (Optional)</label>
                  <input
                    type="text"
                    value={paymentRef}
                    onChange={e => setPaymentRef(e.target.value)}
                    placeholder="e.g. UPI/431289/GPay"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Notes</label>
                  <input
                    type="text"
                    value={paymentNotes}
                    onChange={e => setPaymentNotes(e.target.value)}
                    placeholder="e.g. Collected during routine delivery"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm"
                  >
                    Confirm Payment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* SUB-MODAL: Add Manual Due */}
        {showDueModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/60" onClick={() => setShowDueModal(false)} />
            <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 z-10 space-y-4">
              <h3 className="font-bold text-lg text-slate-900">Add Manual Due to Customer</h3>
              <p className="text-xs text-slate-500">
                Adds a debit entry to the ledger (e.g. jar breakage fee, special transport charge, opening balance).
              </p>

              <form onSubmit={handleAddManualDue} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Due Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={dueAmount || ''}
                    onChange={e => setDueAmount(parseFloat(e.target.value) || 0)}
                    placeholder="e.g. 200"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Reason / Description *</label>
                  <input
                    type="text"
                    required
                    value={dueDescription}
                    onChange={e => setDueDescription(e.target.value)}
                    placeholder="e.g. Jar damaged fee / Opening balance adjustment"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowDueModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-ocean-700 hover:bg-ocean-800 text-white font-bold shadow-sm"
                  >
                    Add Due
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* SUB-MODAL: Adjust Jar Balance Manually */}
        {showJarAdjModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/60" onClick={() => setShowJarAdjModal(false)} />
            <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 z-10 space-y-4">
              <h3 className="font-bold text-lg text-slate-900">Adjust Jar Balance Manually</h3>
              <p className="text-xs text-slate-500">
                Current jars in customer custody: <strong>{customer.outstandingJars} Jars</strong>.
                Enter positive number to add jars or negative number to deduct.
              </p>

              <form onSubmit={handleManualJarAdj} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Adjustment Count (+ or -) *</label>
                  <input
                    type="number"
                    required
                    value={jarAdjCount || ''}
                    onChange={e => setJarAdjCount(parseInt(e.target.value) || 0)}
                    placeholder="e.g. +2 or -1"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    New balance will become: {Math.max(0, customer.outstandingJars + jarAdjCount)} Jars
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Audit Reason *</label>
                  <input
                    type="text"
                    required
                    value={jarAdjReason}
                    onChange={e => setJarAdjReason(e.target.value)}
                    placeholder="e.g. Customer returned 1 jar directly to hub / Jar lost"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowJarAdjModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-aqua-600 hover:bg-aqua-700 text-white font-bold shadow-sm"
                  >
                    Update Jar Ledger
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
