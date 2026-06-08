import { useState, useEffect } from 'react';

interface ChibiAvatarProps {
  level: number;
  footprint: number; // to scale visual background healthiness
}

export default function ChibiAvatar({ level, footprint }: ChibiAvatarProps) {
  // Determine pet class
  let petName = 'Lil\' moss sprout 🌱';
  let badgeTitle = 'Novice Sower';
  let themeColor = '#10b981'; // green

  if (level >= 3 && level < 5) {
    petName = 'Wind Whisperer 🌿';
    badgeTitle = 'Acolyte Forester';
    themeColor = '#3b82f6'; // blue
  } else if (level >= 5) {
    petName = 'Solar-Punk Guardian 👑🌸';
    badgeTitle = 'Arch-Druid Warden';
    themeColor = '#ec4899'; // pink
  }

  // Calculate pet happiness quote based on actual logged carbon metric footprint!
  let quote = 'Ah, the air smells clean today! Keep up the good work, Summoner!';
  if (footprint > 7.5) {
    quote = 'Huff... the air is a bit dusty. Let\'s complete some weekly quests to clear the smog!';
  } else if (footprint < 4.0) {
    quote = 'Incredible! The nature spirits are dancing! We are achieving absolute carbon harmony!';
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white border-2 border-brand-border rounded-lg shadow-[4px_4px_0px_0px_rgba(30,41,59,1)] text-center relative overflow-hidden select-none">
      {/* Dynamic Solar Ray background rotate effect */}
      <div className="absolute -top-12 -left-12 w-32 h-32 bg-primary/5 rounded-full blur-xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-brand-accent/5 rounded-full blur-xl pointer-events-none" />

      {/* Top Banner Tag */}
      <div 
        className="px-3 py-1 border border-brand-border rounded-full text-[9px] font-display font-medium uppercase tracking-widest text-white mb-4"
        style={{ backgroundColor: themeColor }}
      >
        {badgeTitle}
      </div>

      {/* Interactive responsive SVG avatar representation */}
      <div className="relative w-36 h-36 flex items-center justify-center animate-float">
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.15)]">
          {/* Glowing Aura */}
          <circle cx="50" cy="55" r="32" fill={themeColor} fillOpacity="0.12" className="animate-pulse" />
          <circle cx="50" cy="55" r="24" fill={themeColor} fillOpacity="0.15" />

          {/* Leaf Wings or Pinwheels based on Level */}
          {level >= 3 && (
            <g className="animate-spin-slow" style={{ transformOrigin: '50px 55px' }}>
              {/* Back wind turbine blades or wings */}
              <path d="M50 55 L50 20 A6 6 0 0 1 56 26 Z" fill="#93c5fd" stroke="#1e293b" strokeWidth="1.5" />
              <path d="M50 55 L85 55 A6 6 0 0 1 79 61 Z" fill="#93c5fd" stroke="#1e293b" strokeWidth="1.5" style={{ transform: 'rotate(120deg)', transformOrigin: '50px 55px' }} />
              <path d="M50 55 L15 55 A6 6 0 0 1 21 49 Z" fill="#93c5fd" stroke="#1e293b" strokeWidth="1.5" style={{ transform: 'rotate(240deg)', transformOrigin: '50px 55px' }} />
            </g>
          )}

          {/* Golden Magical Blossom Crown for Grand Guardians */}
          {level >= 5 && (
            <g>
              <circle cx="50" cy="30" r="4" fill="#fbbf24" stroke="#1e293b" strokeWidth="1.5" />
              <circle cx="38" cy="34" r="3" fill="#f43f5e" stroke="#1e293b" strokeWidth="1" />
              <circle cx="62" cy="34" r="3" fill="#f43f5e" stroke="#1e293b" strokeWidth="1" />
              <line x1="38" y1="34" x2="50" y2="42" stroke="#1e293b" strokeWidth="1.5" />
              <line x1="62" y1="34" x2="50" y2="42" stroke="#1e293b" strokeWidth="1.5" />
              <line x1="50" y1="30" x2="50" y2="42" stroke="#1e293b" strokeWidth="1.5" />
            </g>
          )}

          {/* Core Body - Friendly Forest Slime/Spurt shape */}
          <path
            d="M 28 58 C 28 40, 72 40, 72 58 C 72 72, 28 72, 28 58 Z"
            fill="#a7f3d0"
            stroke="#1e293b"
            strokeWidth="2"
          />

          {/* Sprout on head */}
          <path
            d="M 50 42 Q 46 32, 38 34"
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M 50 42 Q 54 32, 62 34"
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
            strokeLinecap="round"
          />
          
          {/* Little green leaves on sprout stem */}
          <path d="M 38 34 C 36 30, 44 28, 42 33 Z" fill="#34d399" stroke="#1e293b" strokeWidth="1" />
          <path d="M 62 34 C 64 30, 56 28, 58 33 Z" fill="#34d399" stroke="#1e293b" strokeWidth="1" />

          {/* Chibi kawaii blushing cheeks */}
          <ellipse cx="38" cy="61" rx="4" ry="2.5" fill="#fca5a5" />
          <ellipse cx="62" cy="61" rx="4" ry="2.5" fill="#fca5a5" />

          {/* Big anime glossy happy eyes */}
          <g>
            <circle cx="41" cy="56" r="4.5" fill="#1e293b" />
            <circle cx="39.5" cy="54.5" r="1.5" fill="#ffffff" /> {/* Eye light shine */}
            <circle cx="59" cy="56" r="4.5" fill="#1e293b" />
            <circle cx="57.5" cy="54.5" r="1.5" fill="#ffffff" />
          </g>

          {/* Cute smiley tiny mouth */}
          <path
            d="M 47 62 Q 50 65, 53 62"
            fill="none"
            stroke="#1e293b"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Little body shadows/accents */}
          <ellipse cx="50" cy="74" rx="16" ry="3.5" fill="#1e293b" fillOpacity="0.15" />
        </svg>
      </div>

      {/* Pet attributes and Name tag */}
      <div className="mt-2 space-y-1">
        <h4 className="font-display text-sm font-black text-[#064e3b] tracking-wide">{petName}</h4>
        <div className="flex items-center gap-1.5 justify-center">
          <span className="text-[10px] font-display font-medium text-slate-500 uppercase">HP Gauge:</span>
          <div className="w-20 bg-slate-100 border border-brand-border rounded-full h-2.5 overflow-hidden">
            {/* HP represents the health of the planet based on user footprint index */}
            <div 
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${Math.max(10, Math.min(100, 100 - (footprint / 11) * 90))}%` }}
            />
          </div>
          <span className="text-[9px] font-mono font-bold text-primary">
            {Math.max(10, Math.min(100, Math.round(100 - (footprint / 11) * 90)))}%
          </span>
        </div>
      </div>

      {/* SVG Speech Bubble */}
      <div className="mt-4 p-3 bg-[#f3f4f6] text-slate-800 border-2 border-brand-border rounded relative text-xs leading-relaxed max-w-[240px]">
        {/* Chat bubble tail arrow */}
        <div className="absolute left-1/2 -top-2 w-3.5 h-3.5 bg-[#f3f4f6] border-t-2 border-l-2 border-brand-border transform -translate-x-1/2 rotate-45" />
        <p className="font-sans italic font-medium relative z-10 text-slate-700">{quote}</p>
      </div>

    </div>
  );
}
