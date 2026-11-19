import React, { useState } from 'react';
import { useWater } from '../../context/WaterContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatters';
import { OrderManagementTable } from './OrderManagementTable';
import { CustomerLedger } from './CustomerLedger';
import { JarManagementSection } from './JarManagementSection';
import { ProductPricingSection } from './ProductPricingSection';
import { DailyClosingReport } from './DailyClosingReport';
import { AdminActivityLog } from './AdminActivityLog';
import { DatabaseBackupSection } from './DatabaseBackupSection';
import { 
  ShieldCheck, 
  ShoppingCart, 
  Clock, 
  CheckCircle, 
  Truck, 
  Users, 
  DollarSign, 
  RotateCcw, 
  Tag, 
  FileText, 
  History, 
  Database,
  Lock,
  ArrowRight
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { role, loginAs, allUsers } = useAuth();
  const { orders, customers, financialTransactions } = useWater();

  const [activeTab, setActiveTab] = useState<
    'orders' | 'customers' | 'jars' | 'pricing' | 'closing' | 'audit' | 'backup'
  >('orders');

  // Security Check: Unauthorized Role Protection
  if (role !== 'owner') {
    const ownerUser = allUsers.find(u => u.role === 'owner');
    return (
      <div className="max-w-2xl mx-auto my-12 bg-white rounded-3xl p-8 border border-red-200 shadow-xl text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-black text-slate-900">Access Restricted</h3>
        <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
          The Owner Admin Dashboard contains sensitive monetary ledger summaries, price controls, and audit trails. Your current profile role (<strong className="capitalize">{role}</strong>) does not have access permissions.
        </p>
        <div className="pt-2">
          {ownerUser && (
            <button
              onClick={() => loginAs(ownerUser.id)}
              className="inline-flex items-center gap-2 bg-ocean-700 hover:bg-ocean-800 text-white font-bold text-xs py-3 px-6 rounded-xl shadow-md transition-all active:scale-95"
            >
              <span>Switch to Owner Admin Profile</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // 1. Calculate Top 8 KPI Metrics (Part 2 Requirements)
  const todayDateStr = new Date().toISOString().split('T')[0];

  const todaysOrders = orders.filter(o => o.createdAt.split('T')[0] === todayDateStr).length;
  const newOrdersCount = orders.filter(o => o.deliveryStatus === 'New').length;
  const pendingDeliveriesCount = orders.filter(o => 
    ['Confirmed', 'Out for Delivery'].includes(o.deliveryStatus)
  ).length;
  const completedDeliveriesCount = orders.filter(o => o.deliveryStatus === 'Delivered').length;

  const totalCustomersCount = customers.length;
  
  // Total Revenue Collected: actual payments recorded in financial transactions
  const totalRevenueCollected = financialTransactions
    .filter(t => t.type === 'payment')
    .reduce((sum, t) => sum + t.credit, 0);

  // Outstanding Customer Dues: sum of customer balances
  const outstandingCustomerDues = customers.reduce((sum, c) => sum + c.outstandingDue, 0);

  // Outstanding Jar Count: total 20L jars currently with customers
  const outstandingJarCount = customers.reduce((sum, c) => sum + c.outstandingJars, 0);

  return (
    <div className="space-y-8 py-4">
      {/* Top Welcome & KPI Header */}
      <div className="bg-gradient-to-r from-ocean-950 via-ocean-900 to-ocean-850 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-aqua-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Owner Operations Command Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              AquaFlow Central Executive Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Live oversight of customer order dispatching, monetary ledgers, 20L reusable jars, and price management.
            </p>
          </div>
          <div className="text-right hidden sm:block">
            <span className="text-xs text-slate-400 block font-mono">
              System Active • {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
            </span>
          </div>
        </div>

        {/* 8 Metric Cards Grid (Part 2 Requirements) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-2">
          {/* 1. Today's Orders */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-300 tracking-wider flex items-center gap-1.5">
              <ShoppingCart className="w-3.5 h-3.5 text-aqua-400" />
              <span>Today's Orders</span>
            </span>
            <div className="text-2xl font-black text-white">{todaysOrders}</div>
            <span className="text-[10px] text-slate-300">Placed today</span>
          </div>

          {/* 2. New Orders */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-300 tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              <span>New Orders</span>
            </span>
            <div className="text-2xl font-black text-amber-300">{newOrdersCount}</div>
            <span className="text-[10px] text-slate-300">Awaiting confirmation</span>
          </div>

          {/* 3. Pending Deliveries */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-300 tracking-wider flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-sky-400" />
              <span>Pending Deliveries</span>
            </span>
            <div className="text-2xl font-black text-sky-300">{pendingDeliveriesCount}</div>
            <span className="text-[10px] text-slate-300">En route / Confirmed</span>
          </div>

          {/* 4. Completed Deliveries */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-300 tracking-wider flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Completed Deliveries</span>
            </span>
            <div className="text-2xl font-black text-emerald-300">{completedDeliveriesCount}</div>
            <span className="text-[10px] text-slate-300">Lifetime fulfilled</span>
          </div>

          {/* 5. Total Customers */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-300 tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-purple-300" />
              <span>Total Customers</span>
            </span>
            <div className="text-2xl font-black text-white">{totalCustomersCount}</div>
            <span className="text-[10px] text-slate-300">Active accounts</span>
          </div>

          {/* 6. Total Revenue Collected */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-300 tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>Revenue Collected</span>
            </span>
            <div className="text-2xl font-black text-emerald-300">{formatCurrency(totalRevenueCollected)}</div>
            <span className="text-[10px] text-slate-300">Cash &amp; UPI received</span>
          </div>

          {/* 7. Outstanding Customer Dues */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-300 tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-rose-400" />
              <span>Outstanding Dues</span>
            </span>
            <div className="text-2xl font-black text-rose-300">{formatCurrency(outstandingCustomerDues)}</div>
            <span className="text-[10px] text-slate-300">Total customer balance</span>
          </div>

          {/* 8. Outstanding Jar Count */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-300 tracking-wider flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5 text-aqua-400" />
              <span>Outstanding Jars</span>
            </span>
            <div className="text-2xl font-black text-aqua-300">{outstandingJarCount} Jars</div>
            <span className="text-[10px] text-slate-300">In customer custody</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-1.5">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'orders'
              ? 'bg-ocean-700 text-white shadow-md'
              : 'text-slate-600 hover:text-ocean-700 hover:bg-slate-50'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Order Management ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('customers')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'customers'
              ? 'bg-ocean-700 text-white shadow-md'
              : 'text-slate-600 hover:text-ocean-700 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Customer Ledger ({customers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('jars')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'jars'
              ? 'bg-ocean-700 text-white shadow-md'
              : 'text-slate-600 hover:text-ocean-700 hover:bg-slate-50'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>Jar Management</span>
        </button>

        <button
          onClick={() => setActiveTab('pricing')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'pricing'
              ? 'bg-ocean-700 text-white shadow-md'
              : 'text-slate-600 hover:text-ocean-700 hover:bg-slate-50'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Dynamic Pricing</span>
        </button>

        <button
          onClick={() => setActiveTab('closing')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'closing'
              ? 'bg-ocean-700 text-white shadow-md'
              : 'text-slate-600 hover:text-ocean-700 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Daily Closing Report</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'audit'
              ? 'bg-ocean-700 text-white shadow-md'
              : 'text-slate-600 hover:text-ocean-700 hover:bg-slate-50'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Activity Audit Log</span>
        </button>

        <button
          onClick={() => setActiveTab('backup')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'backup'
              ? 'bg-ocean-700 text-white shadow-md'
              : 'text-slate-600 hover:text-ocean-700 hover:bg-slate-50'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Backup &amp; Recovery</span>
        </button>
      </div>

      {/* Sub-Tab View Rendering */}
      <div>
        {activeTab === 'orders' && <OrderManagementTable />}
        {activeTab === 'customers' && <CustomerLedger />}
        {activeTab === 'jars' && <JarManagementSection />}
        {activeTab === 'pricing' && <ProductPricingSection />}
        {activeTab === 'closing' && <DailyClosingReport />}
        {activeTab === 'audit' && <AdminActivityLog />}
        {activeTab === 'backup' && <DatabaseBackupSection />}
      </div>
    </div>
  );
};
