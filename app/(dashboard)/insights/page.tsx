'use client';

import { useInsights, useGenerateInsights } from '@/hooks/useInsights';
import { useFootprintData } from '@/hooks/useFootprintData';
import { Brain, Sparkles, RefreshCw, CheckCircle, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import type { AIInsight } from '@/types';
import type { ApiResponse } from '@/types';

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: '#16a34a',
  medium: '#f59e0b',
  hard: '#ef4444',
};

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

export default function InsightsPage() {
  const { data: insightsData, isLoading: insightsLoading, error: insightsError } = useInsights();
  const { data: footprintData } = useFootprintData();
  const generateInsights = useGenerateInsights();

  const insights = (insightsData as ApiResponse<AIInsight[]>)?.data ?? [];
  const footprint = footprintData?.data;

  return (
    <div className="space-y-6 pb-10">
      <header className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-100 border border-indigo-200 rounded-full text-indigo-800 text-[10px] font-display font-black uppercase tracking-wider">
          <Brain className="w-3.5 h-3.5" aria-hidden="true" />
          AI-Powered Insights
        </div>
        <h1 className="font-display text-2xl font-black text-slate-800 uppercase tracking-tight">
          Personalized Recommendations
        </h1>
        <p className="text-xs text-slate-600 font-sans font-semibold">
          AI-generated actions tailored to your carbon footprint.
        </p>
      </header>

      {footprint && (
        <div className="glass-panel rounded-2xl p-6 shadow-md">
          <h2 className="font-display text-sm font-black text-slate-800 uppercase tracking-wider mb-3">
            Your Current Status
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-white/60 rounded-xl border border-white/50">
              <p className="text-[10px] font-display font-black text-slate-400 uppercase tracking-wider">
                Monthly Total
              </p>
              <p className="font-display text-xl font-black text-slate-900">
                {footprint.score.monthly.toFixed(0)} kg
              </p>
            </div>
            <div className="p-3 bg-white/60 rounded-xl border border-white/50">
              <p className="text-[10px] font-display font-black text-slate-400 uppercase tracking-wider">
                Daily Avg
              </p>
              <p className="font-display text-xl font-black text-slate-900">
                {footprint.score.daily.toFixed(1)} kg
              </p>
            </div>
            <div className="p-3 bg-white/60 rounded-xl border border-white/50">
              <p className="text-[10px] font-display font-black text-slate-400 uppercase tracking-wider">
                Goal
              </p>
              <p className="font-display text-xl font-black text-slate-900">
                {footprint.goalKg} kg
              </p>
            </div>
            <div className="p-3 bg-white/60 rounded-xl border border-white/50">
              <p className="text-[10px] font-display font-black text-slate-400 uppercase tracking-wider">
                Score
              </p>
              <p className="font-display text-xl font-black text-slate-900">
                {footprint.score.percentage}%
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="font-display text-sm font-black text-slate-800 uppercase tracking-wider">
          Recommended Actions
        </h2>
        <button
          onClick={() => generateInsights.mutate()}
          disabled={generateInsights.isPending}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          aria-label="Generate new AI insights"
        >
          <RefreshCw className={`w-4 h-4 ${generateInsights.isPending ? 'animate-spin' : ''}`} aria-hidden="true" />
          {generateInsights.isPending ? 'Generating...' : 'Generate Insights'}
        </button>
      </div>

      {insightsLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" role="status" />
        </div>
      )}

      {insightsError && (
        <div className="glass-panel rounded-2xl p-8 text-center">
          <p className="text-slate-600">Failed to load insights. Please try again.</p>
        </div>
      )}

      {!insightsLoading && !insightsError && insights.length === 0 && (
        <div className="glass-panel rounded-2xl p-12 text-center">
          <Sparkles className="w-12 h-12 text-emerald-400 mx-auto mb-4" aria-hidden="true" />
          <h3 className="font-display text-lg font-black text-slate-800 mb-2">
            No Insights Yet
          </h3>
          <p className="text-sm text-slate-500 mb-4">
            Generate personalized AI insights to get recommendations for reducing your footprint.
          </p>
          <button
            onClick={() => generateInsights.mutate()}
            disabled={generateInsights.isPending}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all disabled:opacity-50 shadow-md"
          >
            {generateInsights.isPending ? 'Generating...' : 'Generate My Insights'}
          </button>
        </div>
      )}

      {!insightsLoading && insights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {insights.map((insight: AIInsight, index: number) => (
            <motion.article
              key={insight.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={`glass-panel rounded-2xl p-6 shadow-md flex flex-col justify-between border-t-4 ${
                insight.committed ? 'border-emerald-500' : 'border-indigo-500'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className="text-[10px] font-display font-black uppercase tracking-wider px-2.5 py-1 rounded-full text-white"
                    style={{
                      backgroundColor: DIFFICULTY_COLORS[insight.difficulty] ?? '#94a3b8',
                    }}
                  >
                    {DIFFICULTY_LABELS[insight.difficulty] ?? insight.difficulty}
                  </span>
                  {insight.committed && (
                    <CheckCircle className="w-5 h-5 text-emerald-500" aria-label="Committed" />
                  )}
                </div>

                <h3 className="font-display text-base font-black text-slate-800 leading-tight">
                  {insight.action}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {insight.reasoning}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-sm">
                  <Target className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                  <span className="font-bold text-emerald-600">
                    Save ~{insight.estimatedSavingKg} kg CO₂/month
                  </span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </div>
  );
}
