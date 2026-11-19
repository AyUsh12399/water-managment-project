import React, { useState } from 'react';
import { useWater } from '../../context/WaterContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { exportDailyClosingReportCSV } from '../../utils/exportUtils';
import { 
  Calendar, 
  Download, 
  DollarSign, 
  Truck, 
  RotateCcw, 
  FileText, 
  CheckCircle, 
  Clock, 
  XCircle,
  Printer
} from 'lucide-react';

export const DailyClosingReport: React.FC = () => {
  const { getDailyClosingReport } = useWater();
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  const report = getDailyClosingReport(selectedDate);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Date Selection & Export Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-ocean-600 block">
            End of Day Financial &amp; Inventory Closing
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Daily Business Closing Report</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Revenue reflects verified cash &amp; UPI collections deposited, not merely orders placed.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Date Picker */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700">
            <Calendar className="w-4 h-4 text-ocean-600" />
            <span>Select Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="bg-transparent font-bold outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={() => exportDailyClosingReportCSV(report)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-ocean-700 hover:bg-ocean-800 text-white font-bold text-xs shadow-sm transition-all active:scale-95"
          >
            <Download className="w-4 h-4 text-aqua-300" />
            <span>Export CSV / Excel</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Actual Revenue Collected */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-5 rounded-2xl shadow-md space-y-1">
          <span className="text-[10px] uppercase font-bold text-emerald-200 tracking-wider">
            Total Revenue Collected
          </span>
          <div className="text-3xl font-black text-white">
            {formatCurrency(report.totalRevenueCollected)}
          </div>
          <span className="text-[11px] text-emerald-100 block">
            Actual Cash + UPI received on {formatDate(selectedDate)}
          </span>
        </div>

        {/* Total Orders Placed */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Orders Processed
          </span>
          <div className="text-3xl font-black text-slate-900">
            {report.totalOrders}
          </div>
          <div className="flex gap-2 text-[11px] text-slate-500">
            <span className="text-emerald-600 font-bold">{report.deliveredOrders} Delivered</span>
            <span>•</span>
            <span className="text-amber-600 font-bold">{report.pendingDeliveries} Pending</span>
          </div>
        </div>

        {/* 20L Jars Handled */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            20L Jar Activity Today
          </span>
          <div className="text-3xl font-black text-aqua-950">
            {report.totalJarsDelivered} <span className="text-sm font-normal text-slate-500">Delivered</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold">
            {report.totalEmptyJarsReturned} Empty Jars Recovered
          </div>
        </div>

        {/* Outstanding Dues */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Total Outstanding Dues
          </span>
          <div className="text-3xl font-black text-red-600">
            {formatCurrency(report.totalOutstandingDues)}
          </div>
          <span className="text-[11px] text-slate-500 block">
            System-wide customer balance
          </span>
        </div>
      </div>

      {/* Payment Method Inflow Breakdown */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-extrabold text-slate-900 text-base">Payment Collections Inflow Breakdown</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-emerald-800 uppercase block">Cash Collected</span>
              <div className="text-2xl font-black text-emerald-950 mt-1">
                {formatCurrency(report.cashCollected)}
              </div>
              <span className="text-[10px] text-emerald-700">Physical currency with drivers</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              💵
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-sky-800 uppercase block">UPI Collected</span>
              <div className="text-2xl font-black text-sky-950 mt-1">
                {formatCurrency(report.upiCollected)}
              </div>
              <span className="text-[10px] text-sky-700">Instant bank settlements</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
              📱
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-700 uppercase block">Other / Bank Transfers</span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {formatCurrency(report.otherPaymentsCollected)}
              </div>
              <span className="text-[10px] text-slate-500">Cheques &amp; corporate RTGS</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center font-bold">
              🏦
            </div>
          </div>
        </div>
      </div>

      {/* Orders Executed for the Selected Date */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">
              Orders Processed on {formatDate(selectedDate)} ({report.orders.length})
            </h3>
            <p className="text-xs text-slate-500">Audit log of all delivery transactions for the day.</p>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-100 rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-bold uppercase text-[10px] text-slate-500">
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Address</th>
                <th className="py-3 px-4 text-right">Order Value</th>
                <th className="py-3 px-4 text-right">Paid Today</th>
                <th className="py-3 px-4">Delivery Status</th>
                <th className="py-3 px-4">Assigned Driver</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {report.orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No orders recorded for {formatDate(selectedDate)}.
                  </td>
                </tr>
              ) : (
                report.orders.map(o => (
                  <tr key={o.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-mono font-bold text-ocean-900">#{o.id}</td>
                    <td className="py-2.5 px-4 font-semibold text-slate-900">{o.customerName}</td>
                    <td className="py-2.5 px-4 text-slate-600 truncate max-w-[200px]">{o.deliveryAddress}</td>
                    <td className="py-2.5 px-4 text-right font-bold text-slate-900">{formatCurrency(o.totalAmount)}</td>
                    <td className="py-2.5 px-4 text-right font-bold text-emerald-700">{formatCurrency(o.paidAmount)}</td>
                    <td className="py-2.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        o.deliveryStatus === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                        o.deliveryStatus === 'Cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {o.deliveryStatus}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-600">{o.assignedDeliveryPersonName || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
