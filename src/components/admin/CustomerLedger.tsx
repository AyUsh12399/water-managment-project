import React, { useState, useMemo } from 'react';
import { useWater } from '../../context/WaterContext';
import { Customer } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { CustomerProfileModal } from './CustomerProfileModal';
import { Search, UserPlus, Eye, Phone, MapPin, AlertCircle, CheckCircle, ShieldAlert } from 'lucide-react';

export const CustomerLedger: React.FC = () => {
  const { customers } = useWater();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Overdue' | 'Clear' | 'Active'>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Filtered customer list
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        !searchQuery ||
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.address.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (statusFilter !== 'all' && c.accountStatus !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [customers, searchQuery, statusFilter]);

  // Aggregate stats
  const totalDuesAll = customers.reduce((sum, c) => sum + c.outstandingDue, 0);
  const totalJarsAll = customers.reduce((sum, c) => sum + c.outstandingJars, 0);
  const overdueCount = customers.filter(c => c.accountStatus === 'Overdue').length;

  return (
    <div className="space-y-6">
      {/* Top Ledger Snapshot Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Outstanding Dues</span>
            <div className="text-2xl font-black text-ocean-950 mt-1">{formatCurrency(totalDuesAll)}</div>
            <span className="text-[11px] text-slate-500">{overdueCount} accounts have pending balances</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-ocean-50 text-ocean-600 flex items-center justify-center font-bold">
            ₹
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Jars With Customers</span>
            <div className="text-2xl font-black text-aqua-900 mt-1">{totalJarsAll} Jars</div>
            <span className="text-[11px] text-slate-500">20L reusable inventory in market</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-aqua-50 text-aqua-600 flex items-center justify-center font-bold">
            20L
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Customer Profiles</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{customers.length} Accounts</div>
            <span className="text-[11px] text-emerald-600 font-semibold">Protected against duplicates</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            ✓
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex-1 min-w-[280px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search customer by name, mobile number, or locality..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 text-sm outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({customers.length})
            </button>
            <button
              onClick={() => setStatusFilter('Overdue')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === 'Overdue' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Overdue ({overdueCount})
            </button>
            <button
              onClick={() => setStatusFilter('Clear')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === 'Clear' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Customer Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-bold uppercase text-[11px] text-slate-600">
                <th className="py-3.5 px-4">Customer Details</th>
                <th className="py-3.5 px-4 text-right">Total Purchases</th>
                <th className="py-3.5 px-4 text-right">Total Paid</th>
                <th className="py-3.5 px-4 text-right">Outstanding Due</th>
                <th className="py-3.5 px-4 text-right">Outstanding Jars</th>
                <th className="py-3.5 px-4">Last Payment</th>
                <th className="py-3.5 px-4">Account Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No customers match your search query.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map(cust => (
                  <tr key={cust.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Customer Info */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm">{cust.name}</div>
                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px] mt-0.5">
                        <Phone className="w-3 h-3 text-ocean-600" />
                        <span>+91 {cust.phone}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[220px]">
                        {cust.address}
                      </div>
                    </td>

                    {/* Total Purchases */}
                    <td className="py-3.5 px-4 text-right font-semibold text-slate-800">
                      {formatCurrency(cust.totalPurchases)}
                    </td>

                    {/* Total Paid */}
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-700">
                      {formatCurrency(cust.totalAmountPaid)}
                    </td>

                    {/* Outstanding Due */}
                    <td className="py-3.5 px-4 text-right">
                      <span className={`text-sm font-black ${
                        cust.outstandingDue > 0 ? 'text-red-600' : 'text-slate-800'
                      }`}>
                        {formatCurrency(cust.outstandingDue)}
                      </span>
                    </td>

                    {/* Outstanding Jars */}
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-extrabold text-aqua-950 text-sm px-2 py-0.5 rounded-lg bg-aqua-50 border border-aqua-200">
                        {cust.outstandingJars} Jars
                      </span>
                    </td>

                    {/* Last Payment Date */}
                    <td className="py-3.5 px-4 text-slate-600">
                      {cust.lastPaymentDate ? formatDate(cust.lastPaymentDate) : '-'}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        cust.outstandingDue === 0 ? 'bg-emerald-100 text-emerald-800' :
                        cust.accountStatus === 'Overdue' ? 'bg-amber-100 text-amber-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {cust.accountStatus}
                      </span>
                    </td>

                    {/* Action: View Details */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedCustomer(cust)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-ocean-50 hover:bg-ocean-100 text-ocean-700 font-bold text-xs border border-ocean-200 transition-all active:scale-95 shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Details</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Profile Modal */}
      {selectedCustomer && (
        <CustomerProfileModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
        />
      )}
    </div>
  );
};
