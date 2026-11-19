import React from 'react';
import { Droplets, Shield, Clock, Phone, MapPin, Award } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-ocean-950 text-slate-300 pt-14 pb-10 border-t border-ocean-900 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-ocean-800">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-ocean-600 to-aqua-400 flex items-center justify-center text-white">
                <Droplets className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">AquaFlow Distribution</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Certified bulk drinking water distribution partner for households, housing societies, corporate offices, and event caterers across Kolkata.
            </p>
            <div className="flex items-center gap-2 text-xs text-aqua-400">
              <Award className="w-4 h-4" />
              <span>BIS Certified • 100% Tamper Proof Sealed</span>
            </div>
          </div>

          {/* Quick Contacts */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Express Order Desk</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-aqua-400 mt-0.5 shrink-0" />
                <span>Hotline: +91 98765 43210 / 033-2357-8900</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-aqua-400 mt-0.5 shrink-0" />
                <span>Daily Dispatch: 6:00 AM – 9:00 PM (All 7 Days)</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-aqua-400 mt-0.5 shrink-0" />
                <span>Distribution Hub: Salt Lake Sector V, Kolkata 700091</span>
              </li>
            </ul>
          </div>

          {/* Products & Assortment */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Official Product Lines</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>• Kulick Fresh – 20 Litre Natural Jar (₹40)</li>
              <li>• Bisleri Mineral – 20 Litre Jar (₹95)</li>
              <li>• Save Life – 20 Litre RO Jar</li>
              <li>• Bisleri 1 Litre Case (12 Pack Box)</li>
              <li>• Bisleri 2 Litre Case (9 Pack Box)</li>
            </ul>
          </div>

          {/* Business Safeguards */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Distribution Ethics</h4>
            <div className="space-y-2.5 text-xs text-slate-400 leading-relaxed">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Automated reusable jar ledger tracking</span>
              </div>
              <p>
                Strict sanitization of all incoming 20L jars before refilling. Transparent digital customer statement downloads with live due reconciliations.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 AquaFlow Distribution Systems. All Rights Reserved.</p>
          <div className="flex gap-4">
            <span>Water Distribution Management System v2.0 (Production Stable)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
