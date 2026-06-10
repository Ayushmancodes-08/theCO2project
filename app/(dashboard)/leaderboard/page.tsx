'use client';

import { Trophy, Medal, TrendingDown } from 'lucide-react';

const MOCK_LEADERBOARD = [
  { rank: 1, name: 'EcoWarrior', score: 92, saved: 340, badge: '🥇' },
  { rank: 2, name: 'GreenPioneer', score: 88, saved: 290, badge: '🥈' },
  { rank: 3, name: 'CarbonHero', score: 85, saved: 260, badge: '🥉' },
  { rank: 4, name: 'PlanetFriend', score: 79, saved: 220, badge: '🌱' },
  { rank: 5, name: 'EcoConscious', score: 74, saved: 195, badge: '🌿' },
  { rank: 6, name: 'SustainableSam', score: 68, saved: 170, badge: '♻️' },
  { rank: 7, name: 'GreenThumb', score: 62, saved: 145, badge: '🌳' },
  { rank: 8, name: 'EarthGuardian', score: 55, saved: 120, badge: '🌍' },
];

export default function LeaderboardPage() {
  return (
    <div className="space-y-6 pb-10">
      <header className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 border border-amber-200 rounded-full text-amber-800 text-[10px] font-display font-black uppercase tracking-wider">
          <Trophy className="w-3.5 h-3.5" aria-hidden="true" />
          Community Leaderboard
        </div>
        <h1 className="font-display text-2xl font-black text-slate-800 uppercase tracking-tight">
          Top Reducers
        </h1>
        <p className="text-xs text-slate-600 font-sans font-semibold">
          See how your carbon reduction compares with the community.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {MOCK_LEADERBOARD.slice(0, 3).map((entry) => (
          <div
            key={entry.rank}
            className="glass-panel rounded-2xl p-6 text-center shadow-md"
          >
            <span className="text-4xl block mb-2" aria-hidden="true">
              {entry.badge}
            </span>
            <p className="font-display text-lg font-black text-slate-800">
              {entry.name}
            </p>
            <p className="font-display text-3xl font-black text-emerald-500 mt-1">
              {entry.score}
              <span className="text-sm font-mono text-slate-400 ml-1">pts</span>
            </p>
            <p className="text-xs text-slate-500 mt-1">
              <TrendingDown className="w-3 h-3 inline" aria-hidden="true" />{' '}
              {entry.saved} kg saved
            </p>
          </div>
        ))}
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden shadow-md">
        <table className="w-full" role="table" aria-label="Leaderboard rankings">
          <thead>
            <tr className="border-b border-white/30 bg-slate-50/50">
              <th className="text-left px-6 py-4 text-[10px] font-display font-black text-slate-500 uppercase tracking-wider">
                Rank
              </th>
              <th className="text-left px-6 py-4 text-[10px] font-display font-black text-slate-500 uppercase tracking-wider">
                User
              </th>
              <th className="text-right px-6 py-4 text-[10px] font-display font-black text-slate-500 uppercase tracking-wider">
                Score
              </th>
              <th className="text-right px-6 py-4 text-[10px] font-display font-black text-slate-500 uppercase tracking-wider">
                CO₂ Saved
              </th>
            </tr>
          </thead>
          <tbody>
            {MOCK_LEADERBOARD.map((entry) => (
              <tr
                key={entry.rank}
                className={`border-b border-white/20 hover:bg-white/40 transition-colors ${
                  entry.rank <= 3 ? 'bg-amber-50/30' : ''
                }`}
              >
                <td className="px-6 py-4">
                  <span className="font-display text-lg font-black text-slate-700">
                    {entry.rank <= 3 ? entry.badge : `#${entry.rank}`}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="font-bold text-slate-800">{entry.name}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="font-display text-lg font-black text-emerald-600">
                    {entry.score}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="font-mono font-bold text-slate-700">
                    {entry.saved} kg
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="glass-panel rounded-2xl p-6 text-center shadow-md">
        <Medal className="w-8 h-8 text-emerald-500 mx-auto mb-3" aria-hidden="true" />
        <h3 className="font-display text-base font-black text-slate-800 mb-1">
          Your Rank: Computing...
        </h3>
        <p className="text-xs text-slate-500">
          Log more activities and complete actions to appear on the leaderboard!
        </p>
      </div>
    </div>
  );
}
