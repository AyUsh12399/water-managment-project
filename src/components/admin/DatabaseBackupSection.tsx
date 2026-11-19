import React, { useState } from 'react';
import { useWater } from '../../context/WaterContext';
import { formatDateTime } from '../../utils/formatters';
import { Database, Download, Upload, RefreshCw, ShieldCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const DatabaseBackupSection: React.FC = () => {
  const { exportDatabase, importDatabase, resetDatabase } = useWater();
  const [importStatus, setImportStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleDownloadBackup = () => {
    const dataStr = exportDatabase();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AquaFlow_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importDatabase(content);
      if (success) {
        setImportStatus({
          success: true,
          message: 'Database backup restored successfully! All orders, ledgers, and logs are synchronized.'
        });
      } else {
        setImportStatus({
          success: false,
          message: 'Failed to restore database. Invalid JSON format or corrupted schema.'
        });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleConfirmReset = () => {
    resetDatabase();
    setShowResetConfirm(false);
    setImportStatus({
      success: true,
      message: 'System database restored to default factory seed data.'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-ocean-600 text-xs font-bold uppercase tracking-wider">
            <Database className="w-4 h-4" />
            <span>Disaster Recovery &amp; Data Safeguards</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Database Backup &amp; Safe Restore
          </h2>
          <p className="text-xs text-slate-500">
            Export complete relational JSON snapshots including orders, customer ledgers, jar balances, price histories, and audit logs.
          </p>
        </div>
      </div>

      {importStatus && (
        <div className={`p-4 rounded-2xl border text-xs flex items-center gap-2.5 animate-in fade-in ${
          importStatus.success 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {importStatus.success ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          )}
          <span className="font-medium">{importStatus.message}</span>
        </div>
      )}

      {/* Backup Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Export Backup */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-ocean-50 text-ocean-700 flex items-center justify-center font-bold">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Export Complete Snapshot</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Downloads a full JSON archive containing all customer financial statements, 20L jar movement ledgers, product catalog snapshots, and chronological audit entries.
            </p>
          </div>

          <button
            onClick={handleDownloadBackup}
            className="w-full flex items-center justify-center gap-2 bg-ocean-700 hover:bg-ocean-800 text-white font-bold text-xs py-3 px-4 rounded-xl shadow-md transition-all active:scale-95"
          >
            <Download className="w-4 h-4 text-aqua-300" />
            <span>Download JSON Backup</span>
          </button>
        </div>

        {/* Card 2: Restore from Backup */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Restore from File</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Upload a previously exported JSON backup file to instantly restore or migrate all data onto this device or cloud backend.
            </p>
          </div>

          <label className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 px-4 rounded-xl shadow-md transition-all cursor-pointer active:scale-95">
            <Upload className="w-4 h-4" />
            <span>Select Backup File (.json)</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Card 3: Factory Reset to Seed Data */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <RefreshCw className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Reset to Factory Seeds</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Re-initializes the database to original prompt demonstration data (Rahul Sharma profile, Bisleri/Kulick initial prices, sample orders).
            </p>
          </div>

          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full flex items-center justify-center gap-2 border border-amber-300 hover:bg-amber-50 text-amber-900 font-bold text-xs py-3 px-4 rounded-xl transition-all"
          >
            <RefreshCw className="w-4 h-4 text-amber-600" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setShowResetConfirm(false)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 z-10 space-y-4">
            <div className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold text-lg text-slate-900">Confirm Reset to Default Seeds</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to reset all orders, custom products, customer ledgers, and jar movements to the factory initial configuration?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReset}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm"
              >
                Yes, Reset Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
