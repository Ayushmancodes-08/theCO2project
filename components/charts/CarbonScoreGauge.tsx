'use client';

interface CarbonScoreGaugeProps {
  score: number;
  total: number;
  goal: number;
}

export function CarbonScoreGauge({ score, total, goal }: CarbonScoreGaugeProps) {
  const percentage = Math.min(100, Math.max(0, score));
  const circumference = 2 * Math.PI * 90;
  const offset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (percentage >= 80) return '#16a34a';
    if (percentage >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const getLabel = () => {
    if (percentage >= 80) return 'Excellent';
    if (percentage >= 50) return 'Good';
    if (percentage >= 25) return 'Needs Improvement';
    return 'High Impact';
  };

  return (
    <div
      className="glass-panel rounded-2xl p-6 shadow-md flex flex-col items-center"
      role="meter"
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Carbon score: ${percentage}%. ${getLabel()}. Monthly total: ${total.toFixed(1)} kg of ${goal} kg goal.`}
    >
      <h3 className="font-display text-sm font-black text-slate-800 uppercase tracking-wider self-start mb-4">
        Carbon Score
      </h3>

      <div className="relative w-56 h-56">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="12"
          />
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke={getColor()}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-5xl font-black text-slate-900" aria-hidden="true">
            {percentage}
          </span>
          <span className="font-display text-sm font-black text-slate-500" aria-hidden="true">
            / 100
          </span>
          <span
            className="font-display text-[10px] font-black uppercase tracking-wider mt-2"
            style={{ color: getColor() }}
            aria-hidden="true"
          >
            {getLabel()}
          </span>
        </div>
      </div>

      <p className="text-xs text-slate-500 text-center mt-4 font-semibold">
        {total.toFixed(1)} kg of {goal} kg monthly goal
      </p>
    </div>
  );
}
