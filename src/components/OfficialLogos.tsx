import React from 'react';

export const BaliProvinceLogo: React.FC<{ className?: string }> = ({ className = 'w-16 h-16' }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Lambang Provinsi Bali"
  >
    {/* Outer Pentagon Shield in Deep Royal Blue */}
    <polygon
      points="50,5 92,26 80,88 20,88 8,26"
      fill="#1A6EB4"
      stroke="#104E85"
      strokeWidth="2.5"
    />
    {/* Inner decorative golden border */}
    <polygon
      points="50,9 88,28 77,84 23,84 12,28"
      fill="#0E589B"
      stroke="#E5B22E"
      strokeWidth="1.5"
    />
    {/* Padi & Kapas Wreath (Golden Garland) */}
    <path
      d="M26,72 C22,50 30,30 46,20 M74,72 C78,50 70,30 54,20"
      stroke="#F6D142"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeDasharray="2 3"
    />
    {/* Balinese Candi Bentar / Meru Temple Tower in Golden Yellow */}
    <g fill="#FAD02C" stroke="#B8860B" strokeWidth="0.8">
      {/* Base */}
      <rect x="36" y="74" width="28" height="6" rx="1" />
      <rect x="40" y="68" width="20" height="6" rx="1" />
      {/* Tiered roofs (Meru) */}
      <polygon points="50,22 38,30 62,30" />
      <polygon points="50,28 35,37 65,37" />
      <polygon points="50,35 32,45 68,45" />
      <polygon points="50,43 29,54 71,54" />
      <polygon points="50,52 26,64 74,64" />
      <polygon points="50,62 24,70 76,70" />
      {/* Center Pinnacle */}
      <circle cx="50" cy="18" r="3" fill="#FFE57F" />
      <rect x="49" y="14" width="2" height="5" fill="#FFE57F" />
    </g>
    {/* Red Lotus Base / Padma */}
    <path
      d="M32,77 C38,81 62,81 68,77 C66,83 34,83 32,77 Z"
      fill="#D32F2F"
      stroke="#880E4F"
      strokeWidth="0.5"
    />
    {/* Slogan Banner with text placeholder */}
    <rect x="28" y="80" width="44" height="6" rx="2" fill="#F4511E" />
    <text
      x="50"
      y="84.5"
      fontSize="4"
      fill="#FFFFFF"
      fontWeight="bold"
      textAnchor="middle"
      letterSpacing="0.5"
    >
      BALI DWIPA
    </text>
  </svg>
);

export const SchoolLogo: React.FC<{ className?: string }> = ({ className = 'w-16 h-16' }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Logo SMA Negeri 1 Tejakula"
  >
    {/* Outer Rounded Shield / Oval in Cyan-Blue */}
    <ellipse cx="50" cy="50" rx="46" ry="38" fill="#1484C4" stroke="#0D5985" strokeWidth="2.5" />
    <ellipse cx="50" cy="50" rx="42" ry="34" fill="#0E6C9E" stroke="#FFD54F" strokeWidth="1.5" />

    {/* Gear / Sunburst background rays */}
    <circle cx="50" cy="46" r="24" fill="#FFC107" opacity="0.3" />
    <g stroke="#FFD54F" strokeWidth="1.2" opacity="0.8">
      <line x1="50" y1="22" x2="50" y2="70" />
      <line x1="26" y1="46" x2="74" y2="46" />
      <line x1="33" y1="29" x2="67" y2="63" />
      <line x1="67" y1="29" x2="33" y2="63" />
    </g>

    {/* Open Book of Knowledge */}
    <g fill="#FFFFFF" stroke="#003366" strokeWidth="1">
      <path d="M50,56 C44,52 32,52 26,56 L26,66 C32,62 44,62 50,66 Z" />
      <path d="M50,56 C56,52 68,52 74,56 L74,66 C68,62 56,62 50,66 Z" />
      <line x1="50" y1="56" x2="50" y2="66" stroke="#003366" strokeWidth="1.5" />
    </g>

    {/* Flaming Torch (Api Obor) */}
    <g>
      {/* Handle */}
      <polygon points="48,54 52,54 51,62 49,62" fill="#D84315" />
      {/* Flame */}
      <path
        d="M50,30 C45,36 43,42 46,48 C48,44 50,42 50,42 C50,42 52,44 54,48 C57,42 55,36 50,30 Z"
        fill="#FF3D00"
      />
      <path
        d="M50,34 C47,38 46,42 48,46 C49,43 50,41 50,41 C50,41 51,43 52,46 C54,42 53,38 50,34 Z"
        fill="#FFEA00"
      />
    </g>

    {/* Golden Slogan Ribbon: WIDIA STWITI DHARMA */}
    <path
      d="M20,24 C30,17 70,17 80,24 L77,28 C68,22 32,22 23,28 Z"
      fill="#FBC02D"
      stroke="#7F0000"
      strokeWidth="0.8"
    />
    <text
      x="50"
      y="24"
      fontSize="4"
      fontWeight="900"
      fill="#0B2046"
      textAnchor="middle"
      letterSpacing="0.8"
    >
      WIDIA STWITI DHARMA
    </text>

    {/* Bottom Ribbon */}
    <rect x="30" y="70" width="40" height="6" rx="2" fill="#FFC107" stroke="#FFA000" strokeWidth="0.5" />
    <text
      x="50"
      y="74.5"
      fontSize="3.8"
      fontWeight="bold"
      fill="#002D5A"
      textAnchor="middle"
    >
      SMAN 1 TEJAKULA
    </text>
  </svg>
);

export const ElectronicSignatureSeal: React.FC<{
  principalName: string;
  nip: string;
  date: string;
  place: string;
}> = ({ principalName, nip, date, place }) => (
  <div className="flex flex-col items-center p-3 border-2 border-dashed border-sky-400/80 bg-sky-50/70 dark:bg-sky-950/30 rounded-lg max-w-xs shadow-sm">
    <div className="flex items-center gap-2 mb-1.5">
      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
        BSrE
      </div>
      <div className="text-left">
        <span className="text-[10px] font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider block">
          Balai Sertifikasi Elektronik
        </span>
        <span className="text-[9px] text-slate-500 dark:text-slate-400 block font-mono">
          ID Dokumen: {nip.slice(0, 8)}-{place.slice(0, 3).toUpperCase()}-2026
        </span>
      </div>
    </div>
    
    <div className="w-full flex items-center justify-center my-1">
      {/* QR Code representation */}
      <svg className="w-16 h-16" viewBox="0 0 100 100" fill="currentColor">
        <rect width="100" height="100" fill="#FFFFFF" rx="4" />
        <g fill="#0F172A">
          {/* Corner Finder 1 */}
          <rect x="8" y="8" width="28" height="28" />
          <rect x="12" y="12" width="20" height="20" fill="#FFFFFF" />
          <rect x="16" y="16" width="12" height="12" />

          {/* Corner Finder 2 */}
          <rect x="64" y="8" width="28" height="28" />
          <rect x="68" y="12" width="20" height="20" fill="#FFFFFF" />
          <rect x="72" y="16" width="12" height="12" />

          {/* Corner Finder 3 */}
          <rect x="8" y="64" width="28" height="28" />
          <rect x="12" y="68" width="20" height="20" fill="#FFFFFF" />
          <rect x="16" y="72" width="12" height="12" />

          {/* Data Modules */}
          <rect x="42" y="10" width="6" height="6" />
          <rect x="52" y="10" width="6" height="6" />
          <rect x="42" y="24" width="6" height="6" />
          <rect x="48" y="32" width="8" height="6" />
          <rect x="16" y="44" width="8" height="6" />
          <rect x="30" y="44" width="6" height="6" />
          <rect x="44" y="44" width="12" height="12" />
          <rect x="64" y="44" width="8" height="6" />
          <rect x="78" y="44" width="8" height="6" />
          <rect x="42" y="64" width="6" height="6" />
          <rect x="52" y="68" width="6" height="6" />
          <rect x="64" y="64" width="12" height="6" />
          <rect x="80" y="72" width="6" height="12" />
          <rect x="64" y="80" width="12" height="6" />
        </g>
      </svg>
    </div>

    <div className="text-[10px] text-center text-slate-600 dark:text-slate-300 font-serif leading-tight">
      Terverifikasi secara digital sah oleh Dinas Pendidikan Prov. Bali
    </div>
  </div>
);
