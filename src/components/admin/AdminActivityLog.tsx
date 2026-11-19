import React, { useState, useMemo } from 'react';
import { useWater } from '../../context/WaterContext';
import { formatDateTime } from '../../utils/formatters';
import { Search, Filter, Shield, Clock, ArrowRight, UserCheck } from 'lucide-react';

export const AdminActivityLog: React.FC = () => {
  const { auditLogs } = useWater();
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');

  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        !searchQuery ||
        log.details.toLowerCase().includes(q) ||
        log.adminName.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (actionFilter !== 'all' && log.action !== actionFilter) {
        return false;
      }

      return true;
    });
  }, [auditLogs, searchQuery, actionFilter]);

  const uniqueActions = Array.from(new Set(auditLogs.map(l => l.action)));

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-ocean-600 text-xs font-bold uppercase tracking-wider">
            <Shield className="w-4 h-4" />
            <span>Immutable Security Audit Trail</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Administrative Activity Log
          </h2>
          <p className="text-xs text-slate-500">
            Chronological audit history tracking price changes, manual dues, payment entries, jar reconciliations, and cancellations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="w-64 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Filter audit records..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-ocean-500"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={actionFilter}
              onChange={e => setActionFilter(e.target.value)}
              className="bg-transparent outline-none cursor-pointer"
            >
              <option value="all">All Action Types ({auditLogs.length})</option>
              {uniqueActions.map(action => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-bold uppercase text-[10px] text-slate-500">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Admin Responsible</th>
                <th className="py-3 px-4">Activity Description</th>
                <th className="py-3 px-4">Previous Value</th>
                <th className="py-3 px-4">Updated Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No activity logs recorded matching criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => {
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                        {formatDateTime(log.timestamp)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          log.action === 'Price Change' ? 'bg-amber-100 text-amber-900 border border-amber-200' :
                          log.action === 'Payment Entry' ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' :
                          log.action === 'Manual Due' ? 'bg-rose-100 text-rose-900 border border-rose-200' :
                          log.action === 'Order Cancellation' ? 'bg-red-100 text-red-900 border border-red-200' :
                          log.action === 'Jar Adjustment' ? 'bg-aqua-100 text-aqua-900 border border-aqua-200' :
                          'bg-ocean-100 text-ocean-900 border border-ocean-200'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800 whitespace-nowrap">
                        {log.adminName}
                      </td>
                      <td className="py-3 px-4 text-slate-800 max-w-sm">
                        {log.details}
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {log.previousValue || '-'}
                      </td>
                      <td className="py-3 px-4 text-slate-900 font-bold font-mono text-[11px]">
                        {log.updatedValue || '-'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
