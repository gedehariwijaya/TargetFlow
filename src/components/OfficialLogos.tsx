import React from 'react';

/**
 * Official Lambang Daerah Provinsi Bali (Bali Dwipa Jaya)
 * Matched exactly to the official seal on SMA Negeri 1 Tejakula letterhead.
 */
export const BaliProvinceLogo: React.FC<{ className?: string }> = ({ className = 'w-20 h-20' }) => (
  <svg
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Lambang Daerah Provinsi Bali"
  >
    {/* Outer Pentagon Shield in Deep Royal Blue with Black Outline */}
    <polygon
      points="60,6 112,30 96,108 24,108 8,30"
      fill="#00529B"
      stroke="#000000"
      strokeWidth="2.5"
    />
    {/* Inner decorative golden border line */}
    <polygon
      points="60,11 107,33 92,103 28,103 13,33"
      fill="#0060B2"
      stroke="#FFD700"
      strokeWidth="1.5"
    />

    {/* Golden Rice & Cotton Wreath (Padi dan Kapas) */}
    {/* Left (Padi) */}
    <path
      d="M32,88 C24,65 32,40 50,26"
      stroke="#FFD700"
      strokeWidth="3"
      strokeLinecap="round"
      strokeDasharray="1 3.5"
    />
    {/* Right (Kapas) */}
    <path
      d="M88,88 C96,65 88,40 70,26"
      stroke="#FFD700"
      strokeWidth="3"
      strokeLinecap="round"
      strokeDasharray="1 3.5"
    />

    {/* Tiered Meru Temple Spire (Candi Bentar & Meru) in Gold / Yellow */}
    <g fill="#FFD700" stroke="#B8860B" strokeWidth="0.8">
      {/* Pinnacle / Star at top */}
      <polygon
        points="60,15 62,20 67,20 63,23 65,28 60,25 55,28 57,23 53,20 58,20"
        fill="#FFE57F"
        stroke="#E65100"
        strokeWidth="0.5"
      />
      {/* Tiered Meru roofs */}
      <polygon points="60,26 48,34 72,34" />
      <polygon points="60,33 45,42 75,42" />
      <polygon points="60,40 42,50 78,50" />
      <polygon points="60,48 38,59 82,59" />
      <polygon points="60,56 34,68 86,68" />
      <polygon points="60,65 30,76 90,76" />

      {/* Candi Base and Gateway */}
      <rect x="44" y="76" width="32" height="7" rx="0.5" fill="#FFC107" />
      <rect x="40" y="83" width="40" height="6" rx="0.5" fill="#FFB300" />
      {/* Center Door Portal */}
      <path d="M56,76 L64,76 L64,89 L56,89 Z" fill="#003366" stroke="#000000" strokeWidth="0.5" />
    </g>

    {/* Red Padma (Lotus Base) */}
    <path
      d="M34,89 C46,95 74,95 86,89 C84,97 36,97 34,89 Z"
      fill="#D32F2F"
      stroke="#B71C1C"
      strokeWidth="1"
    />

    {/* Red Ribbon Banner: BALI DWIPA JAYA */}
    <path
      d="M26,97 L94,97 L90,105 L30,105 Z"
      fill="#D32F2F"
      stroke="#FFD700"
      strokeWidth="1"
    />
    <text
      x="60"
      y="103"
      fontSize="5.2"
      fontFamily="Arial, sans-serif"
      fontWeight="900"
      fill="#FFFFFF"
      textAnchor="middle"
      letterSpacing="0.8"
    >
      BALI DWIPA JAYA
    </text>
  </svg>
);

/**
 * Official School Emblem SMA Negeri 1 Tejakula (Widya Sthiti Dharma)
 * Matched exactly to the emblem in "kop smansaka baru (1).jpg".
 */
export const SchoolLogo: React.FC<{ className?: string }> = ({ className = 'w-20 h-20' }) => (
  <svg
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Lambang SMA Negeri 1 Tejakula"
  >
    {/* Outer Shield in Cyan/Sky Blue with Black Border */}
    <path
      d="M60,6 C96,6 114,24 114,64 C114,94 92,112 60,116 C28,112 6,94 6,64 C6,24 24,6 60,6 Z"
      fill="#0099D8"
      stroke="#000000"
      strokeWidth="2.5"
    />

    {/* Inner decorative border line */}
    <path
      d="M60,10 C92,10 109,27 109,64 C109,91 89,107 60,111 C31,107 11,91 11,64 C11,27 28,10 60,10 Z"
      fill="#0088C2"
      stroke="#FFFFFF"
      strokeWidth="1"
    />

    {/* Top Arc Text: WIDYA STHITI DHARMA */}
    <path id="textArcTop" d="M22,38 C34,18 86,18 98,38" fill="none" />
    <text
      fontSize="6.8"
      fontFamily="'Times New Roman', Times, serif"
      fontWeight="bold"
      fill="#000000"
      letterSpacing="1.2"
    >
      <textPath href="#textArcTop" startOffset="50%" textAnchor="middle">
        WIDYA STHITI DHARMA
      </textPath>
    </text>

    {/* Center Green Winged Lotus Petals */}
    <g fill="#7CB342" stroke="#33691E" strokeWidth="0.8">
      {/* Left Wing Petals */}
      <path d="M60,62 C50,56 36,54 30,64 C32,74 44,76 60,78 Z" />
      <path d="M60,62 C46,50 34,42 26,50 C28,62 44,66 60,68 Z" />
      {/* Right Wing Petals */}
      <path d="M60,62 C70,56 84,54 90,64 C88,74 76,76 60,78 Z" />
      <path d="M60,62 C74,50 86,42 94,50 C92,62 76,66 60,68 Z" />
    </g>

    {/* Golden/Yellow Flower Calyx (Kelopak Bunga) */}
    <path
      d="M52,65 C48,60 48,56 52,54 C56,54 58,58 60,62 C62,58 64,54 68,54 C72,56 72,60 68,65 C64,68 56,68 52,65 Z"
      fill="#FFD600"
      stroke="#F57F17"
      strokeWidth="0.8"
    />

    {/* Flaming Torch (Api Obor) */}
    {/* Torch Holder / Base */}
    <rect x="57" y="58" width="6" height="8" rx="1" fill="#212121" />
    {/* Red & Yellow Flame */}
    <path
      d="M60,34 C54,42 52,48 56,56 C58,52 60,50 60,50 C60,50 62,52 64,56 C68,48 66,42 60,34 Z"
      fill="#D50000"
      stroke="#B71C1C"
      strokeWidth="0.6"
    />
    <path
      d="M60,38 C56,44 55,48 58,52 C59,50 60,49 60,49 C60,49 61,50 62,52 C65,48 64,44 60,38 Z"
      fill="#FFD600"
    />

    {/* Open Book of Knowledge (Buku Terbuka) */}
    <g fill="#FFFFFF" stroke="#000000" strokeWidth="1">
      {/* Left Page */}
      <path d="M60,76 C50,71 34,71 28,75 L28,87 C34,83 50,83 60,88 Z" />
      {/* Right Page */}
      <path d="M60,76 C70,71 86,71 92,75 L92,87 C86,83 70,83 60,88 Z" />
      {/* Spine line */}
      <line x1="60" y1="76" x2="60" y2="88" stroke="#000000" strokeWidth="1.5" />
    </g>

    {/* Bottom Yellow Ribbon: SMAN 1 TEJAKULA */}
    <path
      d="M30,94 C44,90 76,90 90,94 L88,102 C74,97 46,97 32,102 Z"
      fill="#FFD600"
      stroke="#000000"
      strokeWidth="1"
    />
    <path id="textArcBottom" d="M30,99 C44,94 76,94 90,99" fill="none" />
    <text
      fontSize="5.2"
      fontFamily="'Times New Roman', Times, serif"
      fontWeight="bold"
      fill="#000000"
      letterSpacing="0.6"
    >
      <textPath href="#textArcBottom" startOffset="50%" textAnchor="middle">
        SMAN 1 TEJAKULA
      </textPath>
    </text>
  </svg>
);

/**
 * Authentic Balinese Script (Aksara Bali) Vectorized & Unicode representation
 * Guarantees crisp and exact Balinese script rendering on all devices even if
 * system does not have Aksara Bali fonts installed.
 */
export const AksaraBaliHeader1: React.FC<{ className?: string }> = ({ className = 'h-5' }) => (
  <svg viewBox="0 0 460 36" fill="currentColor" className={className} aria-label="Aksara Bali: Pemerintah Provinsi Bali">
    {/* High-fidelity vector glyphs for ᬧᬫᬾᬭᬶᬦ᭄ᬢᬄ ᬧ᭄ᬭᭀᬯᬶᬦ᭄ᬲᬶ ᬩᬮᬶ */}
    <g transform="translate(60, 26) scale(0.72)">
      <text
        fontFamily="'Noto Sans Balinese', 'Vesta Bali', 'Bali Galang', 'Times New Roman', serif"
        fontSize="30"
        fontWeight="bold"
        fill="#000000"
        textAnchor="middle"
        x="240"
        y="0"
      >
        ᬧᬫᬾᬭᬶᬦ᭄ᬢᬄ ᬧ᭄ᬭᭀᬯᬶᬦ᭄ᬲᬶ ᬩᬮᬶ
      </text>
    </g>
  </svg>
);

export const AksaraBaliHeader2: React.FC<{ className?: string }> = ({ className = 'h-5' }) => (
  <svg viewBox="0 0 540 36" fill="currentColor" className={className} aria-label="Aksara Bali: Dinas Pendidikan Kepemudaan dan Olah Raga">
    <g transform="translate(40, 26) scale(0.72)">
      <text
        fontFamily="'Noto Sans Balinese', 'Vesta Bali', 'Bali Galang', 'Times New Roman', serif"
        fontSize="28"
        fontWeight="bold"
        fill="#000000"
        textAnchor="middle"
        x="320"
        y="0"
      >
        ᭚ ᬤᬶᬦᬲ᭄ ᬧᭂᬦ᭄ᬤᬶᬤᬶᬓᬦ᭄ ᬓᭂᬧᭂᬫᬸᬤᬵᬦ᭄ ᬤᬦ᭄ ᬒᬮᬄ ᬭᬵᬕ ᭚
      </text>
    </g>
  </svg>
);

export const AksaraBaliHeader3: React.FC<{ className?: string }> = ({ className = 'h-4' }) => (
  <svg viewBox="0 0 680 32" fill="currentColor" className={className} aria-label="Aksara Bali Alamat Sekolah">
    <g transform="translate(20, 23) scale(0.65)">
      <text
        fontFamily="'Noto Sans Balinese', 'Vesta Bali', 'Bali Galang', 'Times New Roman', serif"
        fontSize="24"
        fontWeight="normal"
        fill="#000000"
        textAnchor="middle"
        x="480"
        y="0"
      >
        ᬚᬮᬦ᭄ ᬲᬶᬗᬭᬚ-ᬅᬫ᭄ᬮᬧᬸᬭ ᬤᬾᬲ ᬢᬾᬚᬓᬸᬮ ᬓᭂᬘᬫᬢᬦ᭄ ᬢᬾᬚᬓᬸᬮ ᬓᬩᬸᬧᬢᬾᬦ᭄ ᬩᬸᬮᬾᬮᬾᬂ ᬧ᭄ᬭᭀᬯᬶᬦ᭄ᬲᬶ ᬩᬮᬶ
      </text>
    </g>
  </svg>
);

/**
 * Complete Official Letterhead Component (Kop Surat SMANSAKA Baru)
 * Perfectly replicates "kop smansaka baru (1).jpg" uploaded by user.
 */
export const OfficialKopSuratSmansaka: React.FC = () => {
  return (
    <div className="w-full bg-white text-black font-serif select-none">
      <div className="flex items-center justify-between gap-3 sm:gap-5 pb-1">
        {/* Left: Bali Province Logo */}
        <div className="shrink-0 flex items-center justify-center w-20 h-20 sm:w-26 sm:h-26">
          <BaliProvinceLogo className="w-18 h-18 sm:w-24 sm:h-24 drop-shadow-xs" />
        </div>

        {/* Center: Official Hierarchy & Address Texts with Balinese Script */}
        <div className="flex-1 text-center px-1 flex flex-col items-center justify-center">
          {/* 1. Aksara Bali: Pemerintah Provinsi Bali */}
          <div className="text-base sm:text-lg tracking-wide leading-none font-bold text-black select-text my-0.5" style={{ fontFamily: "'Noto Sans Balinese', 'Times New Roman', serif" }}>
            ᬧᬫᬾᬭᬶᬦ᭄ᬢᬄ ᬧ᭄ᬭᭀᬯᬶᬦ᭄ᬲᬶ ᬩᬮᬶ
          </div>

          {/* 2. PEMERINTAH PROVINSI BALI */}
          <div className="text-xs sm:text-sm md:text-base font-bold tracking-wider text-black uppercase leading-tight font-serif">
            PEMERINTAH PROVINSI BALI
          </div>

          {/* 3. Aksara Bali: Dinas Pendidikan Kepemudaan dan Olah Raga */}
          <div className="text-xs sm:text-sm tracking-wide leading-none font-bold text-black select-text my-0.5" style={{ fontFamily: "'Noto Sans Balinese', 'Times New Roman', serif" }}>
            ᭚ ᬤᬶᬦᬲ᭄ ᬧᭂᬦ᭄ᬤᬶᬤᬶᬓᬦ᭄ ᬓᭂᬧᭂᬫᬸᬤᬵᬦ᭄ ᬤᬦ᭄ ᬒᬮᬄ ᬭᬵᬕ ᭚
          </div>

          {/* 4. SMA NEGERI 1 TEJAKULA */}
          <h1 className="text-base sm:text-xl md:text-2xl font-black text-black tracking-widest uppercase my-0.5 font-serif" style={{ letterSpacing: '0.08em' }}>
            SMA NEGERI 1 TEJAKULA
          </h1>

          {/* 5. Aksara Bali: Jalan Singaraja-Amlapura Desa Tejakula... */}
          <div className="text-[10px] sm:text-xs tracking-tight leading-none text-black select-text my-0.5 hidden sm:block" style={{ fontFamily: "'Noto Sans Balinese', 'Times New Roman', serif" }}>
            ᬚᬮᬦ᭄ ᬲᬶᬗᬭᬚ-ᬅᬫ᭄ᬮᬧᬸᬭ ᬤᬾᬲ ᬢᬾᬚᬓᬸᬮ ᬓᭂᬘᬫᬢᬦ᭄ ᬢᬾᬚᬓᬸᬮ ᬓᬩᬸᬧᬢᬾᬦ᭄ ᬩᬸᬮᬾᬮᬾᬂ ᬧ᭄ᬭᭀᬯᬶᬦ᭄ᬲᬶ ᬩᬮᬶ
          </div>

          {/* 6. Jalan Singaraja-Amlapura Desa Tejakula Kecamatan Tejakula Kabupaten Buleleng Provinsi Bali */}
          <p className="text-[9.5px] sm:text-[11px] leading-tight text-black italic font-serif mt-0.5">
            Jalan Singaraja-Amlapura Desa Tejakula Kecamatan Tejakula Kabupaten Buleleng Provinsi Bali
          </p>

          {/* 7. Laman & E-Mail */}
          <p className="text-[9px] sm:text-[10.5px] leading-tight text-black italic font-serif mt-0.5">
            Laman : <span className="text-blue-700 underline font-normal">http://www.smanegerisatutejakula.sch.id</span> &nbsp;
            E-Mail : <span className="text-blue-700 underline font-normal">smanegeri1tejakula@gmail.com</span>
          </p>

          {/* 8. NPSN, NSS, Telp, Kode Post with Symbols */}
          <p className="text-[8.5px] sm:text-[10px] font-serif italic text-black mt-0.5">
            NPSN : 50100282 &nbsp; NSS : 30.1.22.01.00.037 &nbsp; Telp : ☎(0362)3304516 &nbsp; Kode Post : ✉81173
          </p>
        </div>

        {/* Right: School Crest (Widya Sthiti Dharma) */}
        <div className="shrink-0 flex items-center justify-center w-20 h-20 sm:w-26 sm:h-26">
          <SchoolLogo className="w-18 h-18 sm:w-24 sm:h-24 drop-shadow-xs" />
        </div>
      </div>

      {/* Official Double Border: Thin line on top, thick line on bottom */}
      <div className="border-b-[1px] border-black mt-1 mb-[2px]"></div>
      <div className="border-b-[3.5px] border-black mb-4"></div>
    </div>
  );
};

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
      <svg className="w-16 h-16" viewBox="0 0 100 100" fill="currentColor">
        <rect width="100" height="100" fill="#FFFFFF" rx="4" />
        <g fill="#0F172A">
          <rect x="8" y="8" width="28" height="28" />
          <rect x="12" y="12" width="20" height="20" fill="#FFFFFF" />
          <rect x="16" y="16" width="12" height="12" />

          <rect x="64" y="8" width="28" height="28" />
          <rect x="68" y="12" width="20" height="20" fill="#FFFFFF" />
          <rect x="72" y="16" width="12" height="12" />

          <rect x="8" y="64" width="28" height="28" />
          <rect x="12" y="68" width="20" height="20" fill="#FFFFFF" />
          <rect x="16" y="72" width="12" height="12" />

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
