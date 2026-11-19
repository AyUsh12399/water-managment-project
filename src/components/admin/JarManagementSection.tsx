import React, { useState } from 'react';
import { useWater } from '../../context/WaterContext';
import { formatDate, formatDateTime } from '../../utils/formatters';
import { RotateCcw, AlertTriangle, ShieldCheck, Search, Filter, Plus, ArrowRight } from 'lucide-react';

export const JarManagementSection: React.FC = () => {
  const { customers, jarTransactions, manualJarAdjustment } = useWater();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [adjustmentCount, setAdjustmentCount] = useState<number>(0);
  const [adjustmentReason, setAdjustmentReason] = useState<string>('');
  const [showAdjModal, setShowAdjModal] = useState(false);

  // Totals across system
  const totalOutstandingJars = customers.reduce((sum, c) => sum + c.outstandingJars, 0);
  const totalDelivered = customers.reduce((sum, c) => sum + c.newJarsDelivered, 0);
  const totalReturned = customers.reduce((sum, c) => sum + c.emptyJarsReturned, 0);

  const filteredCustomers = customers.filter(c => 
    !searchQuery || 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  );

  const handleApplyAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || adjustmentCount === 0 || !adjustmentReason.trim()) return;
    manualJarAdjustment(selectedCustomerId, adjustmentCount, adjustmentReason.trim());
    setShowAdjModal(false);
    setAdjustmentCount(0);
    setAdjustmentReason('');
    setSelectedCustomerId('');
  };

  return (
    <div className="space-y-6">
      {/* Mathematical Rule Banner */}
      <div className="bg-gradient-to-r from-ocean-900 to-aqua-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg space-y-4">
        <div className="flex items-center gap-2 text-aqua-300 text-xs font-bold uppercase tracking-wider">
          <RotateCcw className="w-4 h-4" />
          <span>Core Inventory Balance Formula</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Current Outstanding Jars = Previous Balance + Delivered - Empties Returned
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Monetary dues and jar dues are strictly decoupled. When delivery drivers confirm a drop-off, the app records both actual delivered 20L jars and returned empties to recalculate customer balances automatically.
            </p>
          </div>
          <button
            onClick={() => setShowAdjModal(true)}
            className="flex items-center gap-2 bg-aqua-500 hover:bg-aqua-400 text-ocean-950 font-black text-xs px-5 py-3 rounded-xl shadow-md transition-all shrink-0 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Manual Jar Adjustment</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Jars With Customers</span>
          <div className="text-3xl font-black text-ocean-950 mt-1">{totalOutstandingJars}</div>
          <span className="text-[11px] text-ocean-700 font-semibold">Active 20L jars in circulation</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Lifetime Delivered</span>
          <div className="text-3xl font-black text-slate-800 mt-1">{totalDelivered}</div>
          <span className="text-[11px] text-slate-500">Recorded across deliveries</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Empties Recovered</span>
          <div className="text-3xl font-black text-emerald-700 mt-1">{totalReturned}</div>
          <span className="text-[11px] text-emerald-600 font-semibold">Sanitized for refilling</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Average Return Rate</span>
          <div className="text-3xl font-black text-aqua-800 mt-1">
            {totalDelivered > 0 ? `${Math.round((totalReturned / totalDelivered) * 100)}%` : '100%'}
          </div>
          <span className="text-[11px] text-slate-500">Circulation efficiency</span>
        </div>
      </div>

      {/* Customer Jar Balance Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Individual Customer Jar Balances</h3>
            <p className="text-xs text-slate-500">Live breakdown of 20L jars held by each customer account.</p>
          </div>

          <div className="w-72 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Filter by customer..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-100 rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-bold uppercase text-[10px] text-slate-500">
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Mobile</th>
                <th className="py-3 px-4 text-right">Previous Balance</th>
                <th className="py-3 px-4 text-right">Delivered Jars</th>
                <th className="py-3 px-4 text-right">Empties Returned</th>
                <th className="py-3 px-4 text-right">Current Jars Held</th>
                <th className="py-3 px-4 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.map(c => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">{c.name}</td>
                  <td className="py-3 px-4 text-slate-500 font-mono">+91 {c.phone}</td>
                  <td className="py-3 px-4 text-right text-slate-700">{c.previousJarBalance}</td>
                  <td className="py-3 px-4 text-right font-semibold text-ocean-700">+{c.newJarsDelivered}</td>
                  <td className="py-3 px-4 text-right font-semibold text-emerald-700">-{c.emptyJarsReturned}</td>
                  <td className="py-3 px-4 text-right font-black text-sm text-aqua-950">
                    <span className="px-2 py-0.5 rounded bg-aqua-50 border border-aqua-200">
                      {c.outstandingJars} Jars
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedCustomerId(c.id);
                        setShowAdjModal(true);
                      }}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-ocean-700 font-semibold text-[11px]"
                    >
                      Adjust
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Global Jar Transactions Log */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-5 space-y-3">
        <h3 className="text-base font-bold text-slate-900">Recent Jar Circulation Events</h3>
        <div className="overflow-x-auto border border-slate-100 rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-bold uppercase text-[10px] text-slate-500">
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4">Customer</th>
                <th className="py-2.5 px-4">Activity Description</th>
                <th className="py-2.5 px-4 text-right">Delivered</th>
                <th className="py-2.5 px-4 text-right">Returned</th>
                <th className="py-2.5 px-4 text-right">Customer Balance</th>
                <th className="py-2.5 px-4">Recorded By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {jarTransactions.slice(0, 10).map(t => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-4 text-slate-500 whitespace-nowrap">{formatDate(t.date)}</td>
                  <td className="py-2.5 px-4 font-bold text-slate-900">{t.customerName}</td>
                  <td className="py-2.5 px-4 text-slate-700">{t.description}</td>
                  <td className="py-2.5 px-4 text-right font-bold text-ocean-700">
                    {t.jarsDelivered > 0 ? `+${t.jarsDelivered}` : '-'}
                  </td>
                  <td className="py-2.5 px-4 text-right font-bold text-emerald-700">
                    {t.jarsReturned > 0 ? `-${t.jarsReturned}` : '-'}
                  </td>
                  <td className="py-2.5 px-4 text-right font-black text-slate-900">{t.balanceAfter} Jars</td>
                  <td className="py-2.5 px-4 text-slate-500">{t.recordedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Adjustment Modal */}
      {showAdjModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60" onClick={() => setShowAdjModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 z-10 space-y-4">
            <h3 className="font-bold text-lg text-slate-900">Adjust Jar Ledger</h3>
            <p className="text-xs text-slate-500">
              Apply a manual jar correction (e.g. jar breakage, lost jar, direct hub return).
            </p>

            <form onSubmit={handleApplyAdjustment} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Customer *</label>
                <select
                  required
                  value={selectedCustomerId}
                  onChange={e => setSelectedCustomerId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold outline-none"
                >
                  <option value="">-- Choose Customer --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} (+91 {c.phone}) - Currently {c.outstandingJars} Jars
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Adjustment (+ or -) *</label>
                <input
                  type="number"
                  required
                  value={adjustmentCount || ''}
                  onChange={e => setAdjustmentCount(parseInt(e.target.value) || 0)}
                  placeholder="e.g. +3 or -2"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-sm outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason for Audit Log *</label>
                <input
                  type="text"
                  required
                  value={adjustmentReason}
                  onChange={e => setAdjustmentReason(e.target.value)}
                  placeholder="e.g. Return of 2 jars directly at factory"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdjModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-aqua-600 hover:bg-aqua-700 text-white font-bold"
                >
                  Apply Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
