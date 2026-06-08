import { useCallback, useMemo } from 'react';
import { Challenge } from '../types';
import { CheckCircle, Compass, Trophy } from 'lucide-react';
import { sfx } from '../utils/audio';

import activeCommuteImg from '../../assets/eco_commute.png';
import meatfreeDietImg from '../../assets/eco_diet.png';
import coldWashImg from '../../assets/eco_laundry.png';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChallengeDetail {
  title:      string;
  savings:    string;
  difficulty: string;
  xpBonus:    string;
  badge:      string;
  image?:     string;
}

interface WeeklyChallengesProps {
  challenges:           Challenge[];
  onAcceptChallenge:    (id: string) => void;
  onCompleteChallenge:  (id: string) => void;
  totalSaved:           number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const WEEKLY_GOAL = 25.0; // kg CO₂

const CHALLENGE_DETAILS: Readonly<Record<string, ChallengeDetail>> = {
  'ch-active-commute': {
    title:      'Walk Instead of Drive 🌲',
    savings:    'Saves 4.2 kg CO₂',
    difficulty: 'Medium Challenge',
    xpBonus:    '+20 XP accepted / +85 XP reward',
    badge:      '🚲',
    image:      activeCommuteImg,
  },
  'ch-meatfree': {
    title:      'Skip Meat for 3 Days 🥗',
    savings:    'Saves 8.5 kg CO₂',
    difficulty: 'Expert Challenge',
    xpBonus:    '+20 XP accepted / +85 XP reward',
    badge:      '🍅',
    image:      meatfreeDietImg,
  },
  'ch-cold-wash': {
    title:      'Air Dry Washing Lines 👕',
    savings:    'Saves 2.1 kg CO₂',
    difficulty: 'Light Challenge',
    xpBonus:    '+20 XP accepted / +85 XP reward',
    badge:      '💨',
    image:      coldWashImg,
  },
} as const;

function fallbackDetail(ch: Challenge): ChallengeDetail {
  return {
    title:      ch.title,
    savings:    `Saves ${ch.co2Savings} kg CO₂`,
    difficulty: 'Guild Quest',
    xpBonus:    'Earn level XP reward',
    badge:      '🏆',
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function WeeklyChallenges({
  challenges,
  onAcceptChallenge,
  onCompleteChallenge,
  totalSaved,
}: WeeklyChallengesProps) {
  const progressPercent = useMemo(
    () => Math.min(100, (totalSaved / WEEKLY_GOAL) * 100),
    [totalSaved]
  );

  const handleAcceptClick = useCallback((id: string) => {
    sfx.playLogSfx();
    onAcceptChallenge(id);
  }, [onAcceptChallenge]);

  const handleCompleteClick = useCallback((id: string) => {
    sfx.playLevelUpSfx();
    onCompleteChallenge(id);
  }, [onCompleteChallenge]);

  return (
    <div className="space-y-6 animate-fade-in pb-10">

      {/* Header */}
      <header className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 border border-amber-300 rounded-full text-amber-800 text-[10px] font-display font-black uppercase tracking-wider">
          <Trophy className="w-3.5 h-3.5" aria-hidden="true" />
          High-Rank Guild Quests
        </div>
        <h2 className="font-display text-2xl font-black text-slate-800 uppercase tracking-tight">
          Active Weekly Challenges
        </h2>
        <p className="text-xs text-slate-600 font-sans font-semibold">
          Embark on micro-quests to save carbon, earn XP, and level up your forest guardian!
        </p>
      </header>

      {/* Challenge cards */}
      <ul
        className="grid grid-cols-1 md:grid-cols-3 gap-6 list-none p-0 m-0"
        role="list"
        aria-label="Weekly challenge cards"
      >
        {challenges.map((ch) => {
          const detail = CHALLENGE_DETAILS[ch.id] ?? fallbackDetail(ch);

          let statusLabel = 'Not yet accepted';
          if (ch.isCompleted) statusLabel = 'Completed';
          else if (ch.isAccepted) statusLabel = 'In progress — ready to claim';

          return (
            <li
              key={ch.id}
              id={`challenge-card-${ch.id}`}
              aria-label={`Challenge: ${detail.title}. Status: ${statusLabel}. ${detail.savings}.`}
            >
              <article
                className={`flex flex-col justify-between p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden glass-panel shadow-md h-full ${
                  ch.isCompleted
                    ? 'bg-emerald-500/80 border-emerald-400 text-white'
                    : ch.isAccepted
                    ? 'bg-amber-50/70 border-emerald-300'
                    : 'hover:-translate-y-1 hover:shadow-lg'
                }`}
              >
                <div className="space-y-4">
                  {/* Challenge image */}
                  <div className="aspect-video w-full rounded-xl border relative overflow-hidden bg-white/40 border-white/50 shadow-inner">
                    {detail.image ? (
                      <img
                        src={detail.image}
                        alt={`Visual for challenge: ${detail.title}`}
                        loading="lazy"
                        decoding="async"
                        className={`w-full h-full object-cover transition-all duration-500 ${
                          ch.isCompleted ? 'grayscale opacity-60' : 'hover:scale-105'
                        }`}
                      />
                    ) : (
                      <div
                        className="flex flex-col items-center justify-center h-full"
                        aria-hidden="true"
                      >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.08)_0,transparent_100%)]" />
                        <span className={`text-5xl block select-none ${ch.isCompleted ? 'grayscale opacity-75' : 'animate-float'}`}>
                          {detail.badge}
                        </span>
                      </div>
                    )}
                    <span
                      className={`absolute top-2 left-2 text-[9px] font-display font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                        ch.isCompleted
                          ? 'bg-emerald-700/80 text-emerald-100 border-emerald-600'
                          : 'bg-white/90 text-slate-600 border-slate-200 shadow-sm'
                      }`}
                      aria-hidden="true"
                    >
                      {detail.difficulty}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className={`font-display text-sm font-black tracking-wide leading-tight ${ch.isCompleted ? 'text-white' : 'text-slate-800'}`}>
                      {detail.title}
                    </h3>
                    <p className={`font-sans text-[11px] font-semibold leading-relaxed ${ch.isCompleted ? 'text-emerald-100' : 'text-slate-500'}`}>
                      {ch.description}
                    </p>
                    <p className={`font-display text-[10px] font-black uppercase tracking-wider mt-2 inline-block ${ch.isCompleted ? 'text-yellow-300' : 'text-emerald-600'}`}>
                      <span aria-hidden="true">✨</span> {detail.savings}
                    </p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="pt-4 mt-4 border-t border-dashed border-slate-200/40">
                  {!ch.isAccepted ? (
                    <button
                      onClick={() => handleAcceptClick(ch.id)}
                      id={`accept-challenge-btn-${ch.id}`}
                      aria-pressed="false"
                      aria-label={`Accept challenge: ${detail.title}`}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-display text-[10px] font-black py-3 uppercase tracking-widest rounded-xl transition-all cursor-pointer text-center shadow-md"
                    >
                      Accept Quest →
                    </button>
                  ) : !ch.isCompleted ? (
                    <button
                      onClick={() => handleCompleteClick(ch.id)}
                      id={`complete-challenge-btn-${ch.id}`}
                      aria-label={`Claim reward for challenge: ${detail.title}. ${detail.xpBonus}`}
                      className="w-full bg-amber-400 hover:bg-amber-300 text-slate-900 border border-white/30 font-display text-[10px] font-black py-3 uppercase tracking-widest rounded-xl transition-all cursor-pointer text-center shadow-md animate-pulse"
                    >
                      Claim Reward <span aria-hidden="true">🏆</span>
                    </button>
                  ) : (
                    <div
                      role="status"
                      aria-label="Challenge completed"
                      className="w-full bg-emerald-600/70 text-emerald-100 py-3 rounded-xl font-display text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-default border border-emerald-500"
                    >
                      <CheckCircle className="w-4 h-4 text-yellow-300 shrink-0" aria-hidden="true" />
                      <span>Mitigation Achieved</span>
                    </div>
                  )}
                </div>
              </article>
            </li>
          );
        })}
      </ul>

      {/* Progress summary */}
      <section
        aria-labelledby="progress-heading"
        className="glass-panel p-5 rounded-2xl shadow-md flex flex-col md:flex-row justify-between items-center gap-5"
      >
        <div className="text-center md:text-left space-y-1">
          <div className="flex items-center gap-1 justify-center md:justify-start">
            <Compass className="w-4 h-4 text-emerald-500 animate-spin-slow" aria-hidden="true" />
            <p
              id="progress-heading"
              className="font-display text-[10px] font-black text-slate-400 uppercase tracking-widest"
            >
              Weekly Progress Ledger
            </p>
          </div>
          <p className="font-display text-lg font-black text-slate-800 leading-none">
            {totalSaved.toFixed(1)} / {WEEKLY_GOAL.toFixed(1)} KG CO₂ SAVED
          </p>
          <p className="text-[11px] text-slate-400 font-semibold font-sans">
            Complete all quests to reach the weekly goal!
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full md:w-1/2 space-y-2">
          <div className="flex justify-between text-[10px] font-mono font-bold text-slate-500">
            <span>{progressPercent.toFixed(0)}% complete</span>
            <span>Goal: {WEEKLY_GOAL} kg CO₂</span>
          </div>
          <div
            className="h-4 neumorph-inset rounded-full overflow-hidden p-0.5"
            role="progressbar"
            aria-valuenow={totalSaved}
            aria-valuemin={0}
            aria-valuemax={WEEKLY_GOAL}
            aria-label={`Weekly CO₂ savings progress: ${totalSaved.toFixed(1)} of ${WEEKLY_GOAL} kg`}
          >
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-amber-400 transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
