'use client';

import { useInsights } from '@/hooks/useInsights';
import { useFootprintData } from '@/hooks/useFootprintData';
import { Target, TrendingDown, CheckCircle, Award, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import type { AIInsight, ApiResponse } from '@/types';

export default function ActionsPage() {
  const { data: insightsData, isLoading } = useInsights();
  const { data: footprintData } = useFootprintData();

  const insights = (insightsData as ApiResponse<AIInsight[]>)?.data ?? [];
  const footprint = footprintData?.data;
  const totalSavings = insights.reduce((sum: number, i: AIInsight) => sum + i.estimatedSavingKg, 0);
  const committedCount = insights.filter((i: AIInsight) => i.committed).length;

  return (
    <div className="space-y-6 pb-10">
      <header className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 border border-amber-200 rounded-full text-amber-800 text-[10px] font-display font-black uppercase tracking-wider">
          <Target className="w-3.5 h-3.5" aria-hidden="true" />
          Action Plan
        </div>
        <h1 className="font-display text-2xl font-black text-slate-800 uppercase tracking-tight">
          Your Reduction Plan
        </h1>
        <p className="text-xs text-slate-600 font-sans font-semibold">
          Commit to actions and track your progress toward a lower carbon footprint.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel rounded-2xl p-6 shadow-md text-center">
          <TrendingDown className="w-8 h-8 text-emerald-500 mx-auto mb-3" aria-hidden="true" />
          <p className="text-[10px] font-display font-black text-slate-400 uppercase tracking-wider">
            Potential Monthly Savings
          </p>
          <p className="font-display text-3xl font-black text-emerald-600 mt-1">
            {totalSavings.toFixed(0)}
            <span className="text-sm font-mono text-slate-500 ml-1">kg</span>
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-6 shadow-md text-center">
          <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-3" aria-hidden="true" />
          <p className="text-[10px] font-display font-black text-slate-400 uppercase tracking-wider">
            Committed Actions
          </p>
          <p className="font-display text-3xl font-black text-emerald-600 mt-1">
            {committedCount}
            <span className="text-sm font-mono text-slate-500 ml-1">
              / {insights.length}
            </span>
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-6 shadow-md text-center">
          <Award className="w-8 h-8 text-amber-500 mx-auto mb-3" aria-hidden="true" />
          <p className="text-[10px] font-display font-black text-slate-400 uppercase tracking-wider">
            Carbon Score
          </p>
          <p className="font-display text-3xl font-black text-amber-500 mt-1">
            {footprint?.score.percentage ?? 0}
            <span className="text-sm font-mono text-slate-500 ml-1">/ 100</span>
          </p>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div
            className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"
            role="status"
          />
        </div>
      )}

      {!isLoading && insights.length === 0 && (
        <div className="glass-panel rounded-2xl p-12 text-center">
          <Sparkles className="w-12 h-12 text-emerald-400 mx-auto mb-4" aria-hidden="true" />
          <h3 className="font-display text-lg font-black text-slate-800 mb-2">
            No Actions Yet
          </h3>
          <p className="text-sm text-slate-500">
            Visit the Insights page to generate personalized action recommendations.
          </p>
        </div>
      )}

      {insights.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-display text-sm font-black text-slate-800 uppercase tracking-wider">
            Recommended Actions
          </h2>
          {insights.map((insight: AIInsight, index: number) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`glass-panel rounded-2xl p-6 shadow-md border-l-4 ${
                insight.committed ? 'border-emerald-500' : 'border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 flex-grow">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-base font-black text-slate-800">
                      {insight.action}
                    </h3>
                    {insight.committed && (
                      <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" aria-label="Committed" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600">{insight.reasoning}</p>
                  <div className="flex items-center gap-3 text-xs">
                    <span
                      className="font-display font-black uppercase tracking-wider px-2.5 py-1 rounded-full text-white"
                      style={{
                        backgroundColor:
                          insight.difficulty === 'easy'
                            ? '#16a34a'
                            : insight.difficulty === 'medium'
                            ? '#f59e0b'
                            : '#ef4444',
                      }}
                    >
                      {insight.difficulty}
                    </span>
                    <span className="font-bold text-emerald-600">
                      Save ~{insight.estimatedSavingKg} kg/month
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="glass-panel rounded-2xl p-6 shadow-md">
        <h2 className="font-display text-sm font-black text-slate-800 uppercase tracking-wider mb-3">
          Progress Tracker
        </h2>
        <div
          role="progressbar"
          aria-valuenow={footprint?.score.percentage ?? 0}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Overall carbon score: ${footprint?.score.percentage ?? 0}%`}
        >
          <div className="flex justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>Overall Score</span>
            <span>{footprint?.score.percentage ?? 0}%</span>
          </div>
          <div className="h-4 neumorph-inset rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 rounded-full transition-all duration-1000"
              style={{ width: `${footprint?.score.percentage ?? 0}%` }}
            />
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>Monthly Goal</span>
            <span>
              {footprint?.score.monthly.toFixed(0)} / {footprint?.goalKg} kg
            </span>
          </div>
          <div className="h-4 neumorph-inset rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-1000"
              style={{
                width: `${Math.min(100, ((footprint?.score.monthly ?? 0) / (footprint?.goalKg ?? 200)) * 100)}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
