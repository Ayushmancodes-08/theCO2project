import { Challenge } from '../types';
import { CheckCircle, Award, Compass, Sparkles, Trophy } from 'lucide-react';
import { sfx } from '../utils/audio';

interface WeeklyChallengesProps {
  challenges: Challenge[];
  onAcceptChallenge: (id: string) => void;
  onCompleteChallenge: (id: string) => void;
  totalSaved: number;
}

export default function WeeklyChallenges({
  challenges,
  onAcceptChallenge,
  onCompleteChallenge,
  totalSaved,
}: WeeklyChallengesProps) {
  const weeklyGoal = 25.0;
  const progressPercent = Math.min(100, (totalSaved / weeklyGoal) * 100);

  // Gamified details for each challenge
  const challengeDetails = {
    'ch-active-commute': {
      title: 'Walk Instead of Drive 🌲',
      savings: 'Mitigate 4.2 kg CO₂',
      difficulty: 'Medium Challenge',
      xpBonus: 'Gives +20 XP Accepted / +85 XP Reward',
      badge: '🚲',
    },
    'ch-meatfree': {
      title: 'Skip Meat for 3 Days 🥗',
      savings: 'Mitigate 8.5 kg CO₂',
      difficulty: 'Expert Challenge',
      xpBonus: 'Gives +20 XP Accepted / +85 XP Reward',
      badge: '🍅',
    },
    'ch-cold-wash': {
      title: 'Air Dry Washing Lines 👕',
      savings: 'Mitigate 2.1 kg CO₂',
      difficulty: 'Light Challenge',
      xpBonus: 'Gives +20 XP Accepted / +85 XP Reward',
      badge: '💨',
    },
  };

  const handleAcceptClick = (id: string) => {
    sfx.playLogSfx();
    onAcceptChallenge(id);
  };

  const handleCompleteClick = (id: string) => {
    sfx.playLevelUpSfx();
    onCompleteChallenge(id);
  };

  return (
    <div className="space-y-6 animate-fade-in select-none pb-10">
      
      {/* Header section */}
      <header className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 border border-amber-300 rounded-full text-amber-800 text-[10px] font-display font-black uppercase tracking-wider">
          <Trophy className="w-3.5 h-3.5" /> High-Rank Guild Quests
        </div>
        <h2 className="font-display text-2xl font-black text-slate-800 uppercase tracking-tight">Active Weekly Challenges</h2>
        <p className="text-xs text-slate-600 font-sans font-semibold">
          Embark on these micro-quests to save carbon equivalents, earn coins, and level up your forest guardian!
        </p>
      </header>

      {/* Challenges cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {challenges.map((ch) => {
          const detail = challengeDetails[ch.id as keyof typeof challengeDetails] || {
            title: ch.title,
            savings: `Saves ${ch.co2Savings} kg CO₂`,
            difficulty: 'Guild Quest',
            xpBonus: 'Earn level XP reward',
            badge: '🏆',
          };

          return (
            <article
              key={ch.id}
              id={`challenge-card-${ch.id}`}
              className={`flex flex-col justify-between p-5 border-2 rounded-xl transition-all duration-300 relative overflow-hidden ${
                ch.isCompleted
                  ? 'bg-emerald-500 border-slate-900 text-white shadow-[2px_2px_0px_0px_rgba(30,41,59,1)]'
                  : ch.isAccepted
                  ? 'bg-amber-50/50 border-emerald-500 shadow-[4px_4px_0px_0px_rgba(16,185,129,1)]'
                  : 'bg-white border-brand-border shadow-[4px_4px_0px_0px_rgba(30,41,59,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(30,41,59,1)] h-full'
              }`}
            >
              <div className="space-y-4">
                {/* Solarpunk Graphic badge instead of dry stock placeholder photos */}
                <div className={`aspect-video w-full rounded-lg border-2 border-slate-800 flex flex-col items-center justify-center relative overflow-hidden ${ch.isCompleted ? 'bg-emerald-600' : 'bg-slate-50'}`}>
                  {/* Subtle anime sunbeams background */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.08)_0,transparent_100%)]" />
                  <span className={`text-5xl block select-none ${ch.isCompleted ? 'grayscale opacity-75' : 'animate-float'}`}>{detail.badge}</span>
                  <span className={`text-[9px] font-display font-black uppercase tracking-wider mt-2.5 px-2 py-0.5 rounded border border-slate-800 ${ch.isCompleted ? 'bg-emerald-700 text-emerald-100' : 'bg-white text-slate-700'}`}>
                    {detail.difficulty}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className={`font-display text-sm font-black tracking-wide leading-tight ${ch.isCompleted ? 'text-white' : 'text-slate-800'}`}>
                    {detail.title}
                  </h3>
                  <p className={`font-sans text-[11px] font-semibold text-slate-500 leading-relaxed ${ch.isCompleted ? 'text-emerald-100' : ''}`}>
                    {ch.description}
                  </p>
                  <p className={`font-display text-[10px] font-black uppercase tracking-wider mt-1.5 inline-block ${ch.isCompleted ? 'text-yellow-300' : 'text-emerald-600'}`}>
                    ✨ {detail.savings} saved
                  </p>
                </div>
              </div>

              {/* Accept/Complete Interactive buttons */}
              <div className="pt-4 mt-4 border-t border-dashed border-slate-200">
                {!ch.isAccepted ? (
                  <button
                    onClick={() => handleAcceptClick(ch.id)}
                    id={`accept-challenge-btn-${ch.id}`}
                    className="w-full bg-white border-2 border-slate-900 text-slate-800 font-display text-[10px] font-black py-2.5 uppercase tracking-widest rounded shadow-[2px_2px_0px_0px_rgba(30,41,59,1)] active:translate-y-[1px] hover:bg-slate-50 transition-all cursor-pointer text-center"
                  >
                    Accept Quest ➔
                  </button>
                ) : !ch.isCompleted ? (
                  <button
                    onClick={() => handleCompleteClick(ch.id)}
                    id={`complete-challenge-btn-${ch.id}`}
                    className="w-full bg-amber-400 border-2 border-slate-900 text-slate-900 font-display text-[10px] font-black py-2.5 uppercase tracking-widest rounded shadow-[2px_2px_0px_0px_rgba(30,41,59,1)] active:translate-y-[1px] hover:bg-amber-350 transition-all cursor-pointer text-center"
                  >
                    Claim Reward 🏆
                  </button>
                ) : (
                  <div className="w-full bg-emerald-600/65 border-2 border-transparent text-emerald-100 py-2.5 rounded-lg font-display text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-default">
                    <CheckCircle className="w-4 h-4 text-yellow-300 shrink-0" />
                    <span>Mitigation Achieved</span>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* Progress metrics and scoreboard summary */}
      <section className="border-2 border-brand-border bg-white p-5 rounded-xl shadow-[4px_4px_0px_0px_rgba(30,41,59,1)] flex flex-col md:flex-row justify-between items-center gap-5">
        <div className="text-center md:text-left space-y-1">
          <div className="flex items-center gap-1 justify-center md:justify-start">
            <Compass className="w-4 h-4 text-emerald-500 animate-spin-slow" />
            <p className="font-display text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Weekly Progress Ledger
            </p>
          </div>
          <p className="font-display text-lg font-black text-slate-800 leading-none">
            SAVED {totalSaved.toFixed(1)} / {weeklyGoal.toFixed(1)} KG CO₂ THIS WEEK
          </p>
          <p className="text-[11px] text-slate-400 font-semibold font-sans">
            Level up your character index by completing full baseline goals!
          </p>
        </div>

        {/* Multi-tier horizontal loading bar */}
        <div className="w-full md:w-1/2 space-y-2">
          <div className="flex justify-between text-[10px] font-mono font-bold text-slate-500">
            <span>Progress: {progressPercent.toFixed(0)}%</span>
            <span>Target: {weeklyGoal} kg CO₂</span>
          </div>
          <div className="h-4 bg-slate-100 border-2 border-slate-800 rounded-full overflow-hidden p-0.5">
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
