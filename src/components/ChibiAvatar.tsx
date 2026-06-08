import { useState, useEffect, useCallback, useMemo } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type AvatarClass = 'forest_sage' | 'solar_ranger' | 'wind_shaman';

interface ChibiAvatarProps {
  /** Current player level (1–10+) */
  level:     number;
  /** Annual carbon footprint in tonnes CO₂ — used for HP gauge and quote */
  footprint: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'ecoquest_avatar_class';

const AVATAR_META: Record<AvatarClass, { label: string; aura: string; bodyFill: string; sproutStroke: string; leafFill: string }> = {
  forest_sage:  { label: "Lil' Moss Sprout 🌿",        aura: '#10b981', bodyFill: '#a7f3d0', sproutStroke: '#10b981', leafFill: '#34d399' },
  solar_ranger: { label: 'Solar-Punk Spark ☀️',        aura: '#fbbf24', bodyFill: '#fde047', sproutStroke: '#d97706', leafFill: '#fbbf24' },
  wind_shaman:  { label: 'Wind Whispering Breeze 💨',  aura: '#06b6d4', bodyFill: '#a5f3fc', sproutStroke: '#10b981', leafFill: '#34d399' },
};

function getBadgeTitle(level: number): string {
  if (level >= 5) return 'Arch-Druid Solar Guardian';
  if (level >= 3) return 'Acolyte Warden';
  return 'Novice Sower';
}

function getQuote(footprint: number): string {
  if (footprint < 4.0) return 'Incredible! The nature spirits are dancing! We are achieving carbon harmony! 🌸';
  if (footprint > 7.5) return "Huff… the air is dusty. Let's complete some quests to clear the smog! 💨";
  return 'The air smells clean today! Keep up the good work, Summoner! 🍃';
}

/** hp ∈ [10, 100] — inverse of footprint scaled to 11 tonnes maximum */
function calcHp(footprint: number): number {
  return Math.max(10, Math.min(100, Math.round(100 - (footprint / 11) * 90)));
}

function safeReadAvatarClass(): AvatarClass {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === 'forest_sage' || raw === 'solar_ranger' || raw === 'wind_shaman') return raw;
  } catch { /* ignore */ }
  return 'forest_sage';
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ChibiAvatar({ level, footprint }: ChibiAvatarProps) {
  const [avatarClass, setAvatarClass] = useState<AvatarClass>(safeReadAvatarClass);

  // Re-read from storage on mount (in case another tab changed it)
  useEffect(() => {
    setAvatarClass(safeReadAvatarClass());
  }, []);

  const handleClassChange = useCallback((cls: AvatarClass) => {
    setAvatarClass(cls);
    try { localStorage.setItem(STORAGE_KEY, cls); } catch { /* ignore */ }
  }, []);

  const meta       = AVATAR_META[avatarClass];
  const badgeTitle = useMemo(() => getBadgeTitle(level),    [level]);
  const quote      = useMemo(() => getQuote(footprint),     [footprint]);
  const hp         = useMemo(() => calcHp(footprint),       [footprint]);

  const avatarLabel = `${meta.label}, Level ${level} ${badgeTitle}. HP: ${hp}%. ${quote}`;

  return (
    <div className="flex flex-col items-center justify-center p-6 glass-panel rounded-2xl text-center relative overflow-hidden">
      {/* Decorative sparkles (visual only) */}
      <div className="absolute top-4 left-4 w-3 h-3 bg-white/60 rounded-full animate-ping" aria-hidden="true" />
      <div className="absolute bottom-6 right-6 w-2 h-2 bg-white/40 rounded-full animate-pulse" aria-hidden="true" />

      {/* Badge */}
      <div
        className="px-4 py-1.5 border border-white/40 rounded-full text-[10px] font-display font-black uppercase tracking-widest text-white mb-5 shadow-sm"
        style={{ backgroundColor: meta.aura, textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}
        aria-hidden="true"
      >
        {badgeTitle}
      </div>

      {/* Class selector */}
      <div
        className="flex justify-center gap-1.5 mb-4 p-1 bg-white/50 border border-white/60 rounded-lg shadow-sm"
        role="group"
        aria-label="Select avatar class"
      >
        {(Object.keys(AVATAR_META) as AvatarClass[]).map((cls) => (
          <button
            key={cls}
            type="button"
            onClick={() => handleClassChange(cls)}
            aria-pressed={avatarClass === cls}
            aria-label={`Select ${AVATAR_META[cls].label} class`}
            className={`px-2 py-1 text-[9px] font-display font-black uppercase tracking-wider rounded transition-all cursor-pointer ${
              avatarClass === cls
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/50'
            }`}
          >
            {cls.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Avatar SVG — accessible image */}
      <div
        className="relative w-40 h-40 flex items-center justify-center animate-float rounded-full bg-white/30 border border-white/50 shadow-inner mb-4"
        aria-hidden="true"
      >
        {/* Aura glow */}
        <div
          className="absolute inset-4 rounded-full filter blur-xl opacity-30 animate-pulse-soft transition-colors duration-500"
          style={{ backgroundColor: meta.aura }}
        />

        <svg
          viewBox="0 0 100 100"
          className="w-32 h-32 z-10 drop-shadow-[0_8px_16px_rgba(0,0,0,0.15)]"
          role="img"
          aria-label={avatarLabel}
        >
          <title>{avatarLabel}</title>

          {/* Aura ring */}
          <circle cx="50" cy="55" r="28" fill="none" stroke={meta.aura} strokeWidth="1" strokeDasharray="3 3" className="animate-spin-slow" style={{ transformOrigin: '50px 55px' }} />
          <circle cx="50" cy="55" r="24" fill={meta.aura} fillOpacity="0.1" />

          {/* Wind Shaman wings */}
          {avatarClass === 'wind_shaman' && (
            <g className="animate-spin-slow" style={{ transformOrigin: '50px 55px' }}>
              <path d="M50 55 L50 20 A6 6 0 0 1 56 26 Z" fill="#93c5fd" stroke="#1e293b" strokeWidth="1.2" />
              <path d="M50 55 L85 55 A6 6 0 0 1 79 61 Z" fill="#93c5fd" stroke="#1e293b" strokeWidth="1.2" style={{ transform: 'rotate(120deg)', transformOrigin: '50px 55px' }} />
              <path d="M50 55 L15 55 A6 6 0 0 1 21 49 Z" fill="#93c5fd" stroke="#1e293b" strokeWidth="1.2" style={{ transform: 'rotate(240deg)', transformOrigin: '50px 55px' }} />
            </g>
          )}

          {/* Solar Ranger bow */}
          {avatarClass === 'solar_ranger' && (
            <g>
              <path d="M 22 45 Q 15 55, 22 65" fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="22" y1="45" x2="22" y2="65" stroke="#ffffff" strokeWidth="0.8" strokeDasharray="2 2" />
              <line x1="15" y1="55" x2="28" y2="55" stroke="#fbbf24" strokeWidth="1.5" />
              <polygon points="28,55 25,53 25,57" fill="#ef4444" />
            </g>
          )}

          {/* Forest Sage staff */}
          {avatarClass === 'forest_sage' && (
            <g>
              <line x1="76" y1="35" x2="84" y2="75" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="76" cy="35" r="4.5" fill="#a7f3d0" stroke="#10b981" strokeWidth="1.5" />
              <path d="M 73 32 Q 76 25, 79 32" fill="none" stroke="#10b981" strokeWidth="1" />
            </g>
          )}

          {/* Level 5+ crown */}
          {level >= 5 && (
            <g>
              <path d="M 38 42 L 44 33 L 50 38 L 56 33 L 62 42 Z" fill="#fbbf24" stroke="#78350f" strokeWidth="1" />
              <circle cx="50" cy="38" r="2.5" fill="#f43f5e" />
              <circle cx="44" cy="33" r="1.5" fill="#ffffff" />
              <circle cx="56" cy="33" r="1.5" fill="#ffffff" />
            </g>
          )}

          {/* Body */}
          <path
            d="M 28 58 C 28 40, 72 40, 72 58 C 72 72, 28 72, 28 58 Z"
            fill={meta.bodyFill}
            stroke="#0f172a"
            strokeWidth="2.2"
          />

          {/* Sprout stems */}
          <path d="M 50 42 Q 46 32, 38 34" fill="none" stroke={meta.sproutStroke} strokeWidth="2" strokeLinecap="round" />
          <path d="M 50 42 Q 54 32, 62 34" fill="none" stroke={meta.sproutStroke} strokeWidth="2" strokeLinecap="round" />

          {/* Leaves */}
          <path d="M 38 34 C 36 30, 44 28, 42 33 Z" fill={meta.leafFill} stroke="#0f172a" strokeWidth="1" />
          <path d="M 62 34 C 64 30, 56 28, 58 33 Z" fill={meta.leafFill} stroke="#0f172a" strokeWidth="1" />

          {/* Blushing cheeks */}
          <ellipse cx="38" cy="61" rx="4" ry="2.5" fill="#fca5a5" />
          <ellipse cx="62" cy="61" rx="4" ry="2.5" fill="#fca5a5" />

          {/* Eyes */}
          <circle cx="41" cy="56" r="4.5" fill="#0f172a" />
          <circle cx="39.5" cy="54.5" r="1.5" fill="#ffffff" />
          <circle cx="59" cy="56" r="4.5" fill="#0f172a" />
          <circle cx="57.5" cy="54.5" r="1.5" fill="#ffffff" />

          {/* Smile */}
          <path d="M 47 62 Q 50 65, 53 62" fill="none" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />

          {/* Shadow */}
          <ellipse cx="50" cy="74" rx="16" ry="3.5" fill="#0f172a" fillOpacity="0.12" />
        </svg>
      </div>

      {/* Name and HP */}
      <div className="mt-2 space-y-2 w-full">
        <h3 className="font-display text-sm font-black text-slate-800 tracking-wide uppercase">
          {meta.label}
        </h3>

        <div className="flex items-center gap-2 justify-center px-4">
          <span className="text-[10px] font-display font-extrabold text-slate-500 uppercase" id="hp-gauge-label">
            HP Gauge:
          </span>
          <div
            className="flex-grow neumorph-inset rounded-full h-3 overflow-hidden p-0.5"
            role="meter"
            aria-valuenow={hp}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-labelledby="hp-gauge-label"
            aria-label={`Avatar HP: ${hp}%`}
          >
            <div
              className="h-full rounded-full transition-all duration-700 bg-gradient-to-r"
              style={{
                width:           `${hp}%`,
                backgroundImage: `linear-gradient(to right, ${meta.aura}, #34d399)`,
              }}
            />
          </div>
          <span className="text-[10px] font-mono font-bold text-slate-700" aria-hidden="true">
            {hp}%
          </span>
        </div>
      </div>

      {/* Speech bubble */}
      <div
        className="mt-5 p-4 bg-white/70 border border-white/50 rounded-xl relative text-xs leading-relaxed max-w-[245px] shadow-sm"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="absolute left-1/2 -top-2 w-3.5 h-3.5 bg-white/70 border-t border-l border-white/50 transform -translate-x-1/2 rotate-45" aria-hidden="true" />
        <p className="font-sans italic font-bold relative z-10 text-slate-600">{quote}</p>
      </div>
    </div>
  );
}
