import React from 'react';

interface ProductImageProps {
  imageType: string;
  className?: string;
  alt?: string;
}

export const ProductImage: React.FC<ProductImageProps> = ({ imageType, className = "w-full h-48", alt = "Water Product" }) => {
  // Realistic SVG water product illustrations
  switch (imageType) {
    case 'kulick_20l':
      return (
        <div className={`relative flex items-center justify-center bg-gradient-to-b from-ocean-50 to-blue-100 rounded-xl overflow-hidden p-4 ${className}`}>
          <svg viewBox="0 0 160 200" className="h-full w-auto max-h-40 drop-shadow-md transition-transform duration-300 hover:scale-105">
            {/* 20L Water Jar Body */}
            <defs>
              <linearGradient id="kulickJarGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.85" />
                <stop offset="30%" stopColor="#3b82f6" stopOpacity="0.9" />
                <stop offset="70%" stopColor="#60a5fa" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.95" />
              </linearGradient>
              <linearGradient id="waterLevel" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#2563eb" stopOpacity="0.95" />
              </linearGradient>
            </defs>
            {/* Cap */}
            <rect x="68" y="10" width="24" height="12" rx="3" fill="#1e40af" stroke="#1e3a8a" strokeWidth="1" />
            <rect x="65" y="20" width="30" height="6" rx="2" fill="#2563eb" />
            {/* Neck */}
            <path d="M68,26 L68,36 C68,44 45,52 40,65 L36,165 C36,176 46,186 60,188 L100,188 C114,186 124,176 124,165 L120,65 C115,52 92,44 92,36 L92,26 Z" fill="url(#kulickJarGrad)" stroke="#1d4ed8" strokeWidth="2" />
            {/* Ribs for jar structure */}
            <rect x="42" y="75" width="76" height="5" rx="2.5" fill="#ffffff" fillOpacity="0.25" />
            <rect x="40" y="105" width="80" height="5" rx="2.5" fill="#ffffff" fillOpacity="0.25" />
            <rect x="38" y="135" width="84" height="5" rx="2.5" fill="#ffffff" fillOpacity="0.25" />
            {/* Branded Label */}
            <rect x="42" y="90" width="76" height="35" rx="3" fill="#ffffff" stroke="#0284c7" strokeWidth="1" />
            <text x="80" y="102" fontSize="9" fontWeight="bold" fill="#0369a1" textAnchor="middle" fontFamily="sans-serif">KULICK FRESH</text>
            <text x="80" y="112" fontSize="7" fontWeight="bold" fill="#0284c7" textAnchor="middle" fontFamily="sans-serif">PURE 20 LITRE</text>
            <rect x="52" y="115" width="56" height="6" rx="2" fill="#0284c7" />
            <text x="80" y="120" fontSize="5" fontWeight="bold" fill="#ffffff" textAnchor="middle" fontFamily="sans-serif">OZONIZED &amp; UV</text>
            {/* Handle */}
            <path d="M40,95 C30,95 28,125 40,130" fill="none" stroke="#1e40af" strokeWidth="4" strokeLinecap="round" />
            {/* Water shine overlay */}
            <path d="M52,65 Q50,110 50,165" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.4" fill="none" />
          </svg>
          <span className="absolute bottom-2 left-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-ocean-800 text-white">20L Jar</span>
        </div>
      );

    case 'bisleri_20l':
      return (
        <div className={`relative flex items-center justify-center bg-gradient-to-b from-teal-50 to-emerald-100 rounded-xl overflow-hidden p-4 ${className}`}>
          <svg viewBox="0 0 160 200" className="h-full w-auto max-h-40 drop-shadow-md transition-transform duration-300 hover:scale-105">
            <defs>
              <linearGradient id="bisleriJarGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0d9488" stopOpacity="0.85" />
                <stop offset="35%" stopColor="#14b8a6" stopOpacity="0.9" />
                <stop offset="70%" stopColor="#5eead4" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#0f766e" stopOpacity="0.95" />
              </linearGradient>
            </defs>
            {/* Cap with tamper seal */}
            <rect x="68" y="10" width="24" height="12" rx="3" fill="#047857" stroke="#065f46" strokeWidth="1" />
            <rect x="65" y="20" width="30" height="6" rx="2" fill="#10b981" />
            {/* Jar Body */}
            <path d="M68,26 L68,36 C68,44 45,52 40,65 L36,165 C36,176 46,186 60,188 L100,188 C114,186 124,176 124,165 L120,65 C115,52 92,44 92,36 L92,26 Z" fill="url(#bisleriJarGrad)" stroke="#0f766e" strokeWidth="2" />
            {/* Bisleri Ribbed pattern */}
            <rect x="42" y="70" width="76" height="4" rx="2" fill="#ffffff" fillOpacity="0.3" />
            <rect x="40" y="80" width="80" height="4" rx="2" fill="#ffffff" fillOpacity="0.3" />
            <rect x="40" y="125" width="80" height="4" rx="2" fill="#ffffff" fillOpacity="0.3" />
            <rect x="38" y="140" width="84" height="4" rx="2" fill="#ffffff" fillOpacity="0.3" />
            {/* Bisleri Signature Green Label */}
            <rect x="42" y="90" width="76" height="30" rx="3" fill="#047857" stroke="#ffffff" strokeWidth="1" />
            <text x="80" y="104" fontSize="11" fontWeight="bold" fontStyle="italic" fill="#ffffff" textAnchor="middle" fontFamily="sans-serif">Bisleri.</text>
            <text x="80" y="113" fontSize="6" fontWeight="bold" fill="#a7f3d0" textAnchor="middle" fontFamily="sans-serif">with added minerals</text>
            {/* Handle */}
            <path d="M40,95 C30,95 28,125 40,130" fill="none" stroke="#065f46" strokeWidth="4" strokeLinecap="round" />
            {/* Shine */}
            <path d="M52,65 Q50,110 50,165" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.4" fill="none" />
          </svg>
          <span className="absolute bottom-2 left-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-teal-800 text-white">20L Jar</span>
        </div>
      );

    case 'savelife_20l':
      return (
        <div className={`relative flex items-center justify-center bg-gradient-to-b from-cyan-50 to-sky-100 rounded-xl overflow-hidden p-4 ${className}`}>
          <svg viewBox="0 0 160 200" className="h-full w-auto max-h-40 drop-shadow-md transition-transform duration-300 hover:scale-105">
            <defs>
              <linearGradient id="saveLifeJar" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.85" />
                <stop offset="40%" stopColor="#38bdf8" stopOpacity="0.9" />
                <stop offset="80%" stopColor="#7dd3fc" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#0369a1" stopOpacity="0.95" />
              </linearGradient>
            </defs>
            <rect x="68" y="10" width="24" height="12" rx="3" fill="#0369a1" stroke="#075985" strokeWidth="1" />
            <rect x="65" y="20" width="30" height="6" rx="2" fill="#0284c7" />
            <path d="M68,26 L68,36 C68,44 45,52 40,65 L36,165 C36,176 46,186 60,188 L100,188 C114,186 124,176 124,165 L120,65 C115,52 92,44 92,36 L92,26 Z" fill="url(#saveLifeJar)" stroke="#0284c7" strokeWidth="2" />
            <rect x="42" y="75" width="76" height="5" rx="2.5" fill="#ffffff" fillOpacity="0.3" />
            <rect x="40" y="135" width="80" height="5" rx="2.5" fill="#ffffff" fillOpacity="0.3" />
            {/* Save Life Label */}
            <rect x="42" y="90" width="76" height="32" rx="3" fill="#ffffff" stroke="#0891b2" strokeWidth="1" />
            <text x="80" y="102" fontSize="9" fontWeight="bold" fill="#0891b2" textAnchor="middle" fontFamily="sans-serif">SAVE LIFE</text>
            <text x="80" y="112" fontSize="6.5" fontWeight="bold" fill="#0284c7" textAnchor="middle" fontFamily="sans-serif">NATURAL SPRING 20L</text>
            <path d="M60,116 Q80,119 100,116" stroke="#06b6d4" strokeWidth="1.5" fill="none" />
            <path d="M40,95 C30,95 28,125 40,130" fill="none" stroke="#0369a1" strokeWidth="4" strokeLinecap="round" />
            <path d="M52,65 Q50,110 50,165" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.4" fill="none" />
          </svg>
          <span className="absolute bottom-2 left-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-cyan-800 text-white">20L Jar</span>
        </div>
      );

    case 'bisleri_1l_case':
      return (
        <div className={`relative flex items-center justify-center bg-gradient-to-b from-emerald-50 to-teal-100 rounded-xl overflow-hidden p-4 ${className}`}>
          <svg viewBox="0 0 180 180" className="h-full w-auto max-h-40 drop-shadow-md transition-transform duration-300 hover:scale-105">
            {/* Corrugated Box Carton */}
            <polygon points="30,80 90,50 150,80 90,110" fill="#fed7aa" stroke="#c2410c" strokeWidth="1.5" />
            <polygon points="30,80 90,110 90,160 30,130" fill="#fdba74" stroke="#c2410c" strokeWidth="1.5" />
            <polygon points="90,110 150,80 150,130 90,160" fill="#fb923c" stroke="#c2410c" strokeWidth="1.5" />
            {/* Bisleri 1L bottles visible standing inside top */}
            <g transform="translate(60, 20)">
              <rect x="5" y="0" width="8" height="6" fill="#047857" rx="1" />
              <path d="M5,6 L3,14 L1,22 L1,50 L17,50 L17,22 L15,14 L13,6 Z" fill="#2dd4bf" stroke="#0f766e" strokeWidth="1" />
              <rect x="2" y="24" width="14" height="12" fill="#047857" />
              <text x="9" y="32" fontSize="5" fill="#fff" fontStyle="italic" textAnchor="middle" fontWeight="bold">B</text>
            </g>
            <g transform="translate(80, 25)">
              <rect x="5" y="0" width="8" height="6" fill="#047857" rx="1" />
              <path d="M5,6 L3,14 L1,22 L1,50 L17,50 L17,22 L15,14 L13,6 Z" fill="#2dd4bf" stroke="#0f766e" strokeWidth="1" />
              <rect x="2" y="24" width="14" height="12" fill="#047857" />
              <text x="9" y="32" fontSize="5" fill="#fff" fontStyle="italic" textAnchor="middle" fontWeight="bold">B</text>
            </g>
            <g transform="translate(100, 30)">
              <rect x="5" y="0" width="8" height="6" fill="#047857" rx="1" />
              <path d="M5,6 L3,14 L1,22 L1,50 L17,50 L17,22 L15,14 L13,6 Z" fill="#2dd4bf" stroke="#0f766e" strokeWidth="1" />
              <rect x="2" y="24" width="14" height="12" fill="#047857" />
              <text x="9" y="32" fontSize="5" fill="#fff" fontStyle="italic" textAnchor="middle" fontWeight="bold">B</text>
            </g>
            {/* Box Front Label */}
            <rect x="36" y="98" width="48" height="22" rx="2" fill="#047857" transform="skewY(18)" />
            <text x="56" y="98" fontSize="6" fontWeight="bold" fill="#fff" fontStyle="italic" textAnchor="middle" transform="skewY(18)">Bisleri 1L</text>
            <text x="56" y="106" fontSize="4.5" fill="#a7f3d0" textAnchor="middle" transform="skewY(18)">CASE OF 12</text>
          </svg>
          <span className="absolute bottom-2 left-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-emerald-800 text-white">12 x 1L Pack</span>
        </div>
      );

    case 'bisleri_2l_case':
      return (
        <div className={`relative flex items-center justify-center bg-gradient-to-b from-blue-50 to-indigo-100 rounded-xl overflow-hidden p-4 ${className}`}>
          <svg viewBox="0 0 180 180" className="h-full w-auto max-h-40 drop-shadow-md transition-transform duration-300 hover:scale-105">
            {/* Heavy-duty Carton for 2L Bottles */}
            <polygon points="25,85 90,50 155,85 90,120" fill="#fed7aa" stroke="#c2410c" strokeWidth="1.5" />
            <polygon points="25,85 90,120 90,165 25,130" fill="#fdba74" stroke="#c2410c" strokeWidth="1.5" />
            <polygon points="90,120 155,85 155,130 90,165" fill="#fb923c" stroke="#c2410c" strokeWidth="1.5" />
            {/* 2L Jumbo bottles */}
            <g transform="translate(68, 15)">
              <rect x="6" y="0" width="10" height="7" fill="#047857" rx="1" />
              <path d="M6,7 L3,16 L1,26 L1,58 L21,58 L21,26 L19,16 L16,7 Z" fill="#5eead4" stroke="#0f766e" strokeWidth="1" />
              <rect x="2" y="30" width="18" height="14" fill="#047857" />
              <text x="11" y="39" fontSize="6" fill="#fff" fontStyle="italic" textAnchor="middle" fontWeight="bold">2L</text>
            </g>
            <g transform="translate(95, 22)">
              <rect x="6" y="0" width="10" height="7" fill="#047857" rx="1" />
              <path d="M6,7 L3,16 L1,26 L1,58 L21,58 L21,26 L19,16 L16,7 Z" fill="#5eead4" stroke="#0f766e" strokeWidth="1" />
              <rect x="2" y="30" width="18" height="14" fill="#047857" />
              <text x="11" y="39" fontSize="6" fill="#fff" fontStyle="italic" textAnchor="middle" fontWeight="bold">2L</text>
            </g>
            {/* Box Front Label */}
            <rect x="34" y="104" width="48" height="24" rx="2" fill="#0f766e" transform="skewY(18)" />
            <text x="54" y="103" fontSize="6" fontWeight="bold" fill="#fff" fontStyle="italic" textAnchor="middle" transform="skewY(18)">Bisleri 2L</text>
            <text x="54" y="112" fontSize="4.5" fill="#a7f3d0" textAnchor="middle" transform="skewY(18)">CASE OF 9</text>
          </svg>
          <span className="absolute bottom-2 left-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-indigo-900 text-white">9 x 2L Pack</span>
        </div>
      );

    default:
      return (
        <div className={`relative flex items-center justify-center bg-ocean-50 rounded-xl p-4 ${className}`}>
          <div className="w-16 h-28 bg-ocean-400/30 rounded-lg flex items-center justify-center border-2 border-ocean-500">
            <span className="text-ocean-700 font-bold text-xs">{alt}</span>
          </div>
        </div>
      );
  }
};
