import { useState, useEffect } from 'react';
import { QuizAnswers, LoggedActivity, Challenge } from './types';
import { calculateAnnualBaseline, generate30DayHistory } from './utils/carbonCalc';

// Import components
import OnboardingQuiz from './components/OnboardingQuiz';
import DashboardOverview from './components/DashboardOverview';
import ActivityTracker from './components/ActivityTracker';
import AiInsights from './components/AiInsights';
import WeeklyChallenges from './components/WeeklyChallenges';
import ProgressTrend from './components/ProgressTrend';

import { Leaf, RefreshCcw, LayoutDashboard, FileText, Award, Brain, BarChart3, LogOut, Swords } from 'lucide-react';
import { sfx } from './utils/audio';

const INITIAL_CHALLENGES: Challenge[] = [
  {
    id: 'ch-active-commute',
    title: 'Walk instead of drive',
    description: 'Leave the car in the garage for trips under 5 kilometers. Walk or bike instead, or substitute with collective public train/bus transit.',
    category: 'transport',
    co2Savings: 4.2,
    duration: '2 Commutes',
    isAccepted: false,
    isCompleted: false,
  },
  {
    id: 'ch-meatfree',
    title: 'Skip meat for 3 days',
    description: 'Avoid all poultry, pork, beef, and seafood for 3 full days. Replace with plant-based ingredients to nurture your soil index.',
    category: 'food',
    co2Savings: 8.5,
    duration: '3 Days',
    isAccepted: false,
    isCompleted: false,
  },
  {
    id: 'ch-cold-wash',
    title: 'Air dry laundry',
    description: 'Avoid running high-energy utility dryer machines this week. Rely on natural wind currents to dry your linens.',
    category: 'energy',
    co2Savings: 2.1,
    duration: '1 Week',
    isAccepted: false,
    isCompleted: false,
  },
];

export default function App() {
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswers | null>(null);
  const [activities, setActivities] = useState<LoggedActivity[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>(INITIAL_CHALLENGES);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tracker' | 'challenges' | 'insights' | 'trend'>('dashboard');
  const [loading, setLoading] = useState(true);

  // Sync state with LocalStorage on mount
  useEffect(() => {
    try {
      const storedAnswers = localStorage.getItem('ecomark_answers');
      const storedLogs = localStorage.getItem('ecomark_logs');
      const storedChallenges = localStorage.getItem('ecomark_challenges');

      if (storedAnswers) {
        setQuizAnswers(JSON.parse(storedAnswers));
      }

      if (storedLogs) {
        setActivities(JSON.parse(storedLogs));
      }

      if (storedChallenges) {
        setChallenges(JSON.parse(storedChallenges));
      }
    } catch (e) {
      console.error('LocalStorage load fault', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle quiz completed baseline initialization
  const handleQuizComplete = (answers: QuizAnswers) => {
    setQuizAnswers(answers);
    localStorage.setItem('ecomark_answers', JSON.stringify(answers));

    // Generate typical 30-day starter history matching the quiz profile
    const starterHistory = generate30DayHistory(answers);
    setActivities(starterHistory);
    localStorage.setItem('ecomark_logs', JSON.stringify(starterHistory));

    // Initialize challenges list
    setChallenges(INITIAL_CHALLENGES);
    localStorage.setItem('ecomark_challenges', JSON.stringify(INITIAL_CHALLENGES));
    setActiveTab('dashboard'); // Direct transition to overview
  };

  // Add individual logged activity
  const handleAddActivity = (newAct: Omit<LoggedActivity, 'id'>) => {
    const actWithId: LoggedActivity = {
      ...newAct,
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };

    const updated = [...activities, actWithId];
    setActivities(updated);
    localStorage.setItem('ecomark_logs', JSON.stringify(updated));
  };

  // Delete activity log
  const handleDeleteActivity = (id: string) => {
    const updated = activities.filter((act) => act.id !== id);
    setActivities(updated);
    localStorage.setItem('ecomark_logs', JSON.stringify(updated));
  };

  // Commit / Accept weekly challenge
  const handleAcceptChallenge = (id: string) => {
    const updated = challenges.map((ch) =>
      ch.id === id ? { ...ch, isAccepted: true } : ch
    );
    setChallenges(updated);
    localStorage.setItem('ecomark_challenges', JSON.stringify(updated));
  };

  // Complete challenge & earn savings CO2 reward
  const handleCompleteChallenge = (id: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const challengeObject = challenges.find((ch) => ch.id === id);

    if (!challengeObject) return;

    // Log a negative carbon activity representing offsetting savings
    const updatedLogs = [
      ...activities,
      {
        id: `reward-ch-${id}-${Date.now()}`,
        date: todayStr,
        category: challengeObject.category,
        description: `Completed Quest: ${challengeObject.title}`,
        amount: 1,
        co2Impact: -challengeObject.co2Savings,
      },
    ];

    setActivities(updatedLogs);
    localStorage.setItem('ecomark_logs', JSON.stringify(updatedLogs));

    const updatedChallenges = challenges.map((ch) =>
      ch.id === id ? { ...ch, isCompleted: true, completedAt: todayStr } : ch
    );
    setChallenges(updatedChallenges);
    localStorage.setItem('ecomark_challenges', JSON.stringify(updatedChallenges));
  };

  // Reset profile back to onboarding
  const handleResetProfile = () => {
    sfx.playDeleteSfx();
    if (window.confirm('Construct an eclipse ritual? Dynamic statistics and logged spells will be lost.')) {
      setQuizAnswers(null);
      setActivities([]);
      setChallenges(INITIAL_CHALLENGES);
      localStorage.removeItem('ecomark_answers');
      localStorage.removeItem('ecomark_logs');
      localStorage.removeItem('ecomark_challenges');
      setActiveTab('dashboard');
    }
  };

  // Compute stats
  const totalWeeklySaved = challenges
    .filter((ch) => ch.isCompleted)
    .reduce((sum, ch) => sum + ch.co2Savings, 0);

  const baselineAnnualTonnes = quizAnswers ? calculateAnnualBaseline(quizAnswers) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fefcf6] flex flex-col items-center justify-center p-4">
        <Leaf className="w-8 h-8 text-emerald-500 animate-spin" />
        <span className="text-xs font-display font-semibold text-slate-500 mt-4 tracking-widest uppercase">
          Synthesizing EcoQuest Realm...
        </span>
      </div>
    );
  }

  // Render onboarding flow state
  if (!quizAnswers) {
    return (
      <div className="min-h-screen bg-[#fefcf6] flex flex-col justify-between py-6 px-4">
        {/* Intro Logo Header */}
        <div className="text-center space-y-2.5 max-w-sm mx-auto my-6 select-none">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-full text-xs font-bold shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
            <Leaf className="w-3.5 h-3.5 fill-current animate-bounce" />
            <span className="font-display text-[9px] uppercase font-black tracking-widest">REALTIME CARBON PORTAL</span>
          </div>
          <h1 className="text-4xl font-display font-black text-slate-900 tracking-tight leading-none uppercase">ECOQUEST RPG</h1>
          <p className="text-xs text-slate-600 font-sans font-semibold leading-relaxed">
            Measure your ecological signature baseline, level up cozy forest avatars, and vanquish carbon elements!
          </p>
        </div>

        <div className="flex-grow flex items-center justify-center">
          <OnboardingQuiz onComplete={handleQuizComplete} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fefcf6] text-[#0f172a] antialiased flex flex-col relative overflow-x-hidden">
      
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 w-full z-40 bg-[#fefcf6]/90 backdrop-blur-sm border-b-2 border-brand-border h-16 flex justify-between items-center px-4 select-none">
        <span className="font-display text-lg font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5 pt-1">
          <span className="animate-float">🌱</span> ECOQUEST
        </span>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleResetProfile}
            id="mobile-reset-profile"
            className="p-1.5 text-slate-500 hover:text-red-500 hover:bg-red-50 border border-slate-200 rounded-lg cursor-pointer"
            title="Eclipse profile assessment"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
          <div className="w-8 h-8 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-white text-xs select-none font-black font-mono shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            S
          </div>
        </div>
      </header>

      {/* Main Structural Layout */}
      <div className="flex flex-1 max-w-7xl w-full mx-auto pt-16 lg:pt-0 pb-20 lg:pb-0 h-full">
        
        {/* Left Side Navigation Pane (Desktop Only) */}
        <aside className="w-64 hidden lg:flex flex-col sticky top-0 left-0 border-r-2 border-brand-border p-6 h-screen select-none justify-between bg-white z-20">
          <div className="space-y-8">
            <div className="pt-2">
              <h1 className="font-display text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2 uppercase">
                <span className="animate-float">🌱</span> EcoQuest
              </h1>
              <p className="text-emerald-600 font-display text-[9px] font-black uppercase tracking-widest mt-1 bg-emerald-50 border border-emerald-200 py-0.5 px-2 rounded-full w-fit">
                Solar Sanctuary
              </p>
            </div>

            {/* Nav Menu */}
            <nav className="flex flex-col gap-1.5">
              {[
                { id: 'dashboard', label: 'Scoreboard', icon: LayoutDashboard },
                { id: 'tracker', label: 'Quest Logger', icon: FileText },
                { id: 'challenges', label: 'Guild Quests', icon: Award },
                { id: 'insights', label: 'Sage Advice', icon: Brain },
                { id: 'trend', label: 'Leyline Trends', icon: BarChart3 },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      sfx.playLogSfx();
                      setActiveTab(item.id as any);
                    }}
                    id={`sidebar-link-${item.id}`}
                    className={`flex items-center gap-3 px-4 py-3.5 text-xs font-display font-black uppercase tracking-wider transition-all rounded-lg border-2 cursor-pointer text-left ${
                      isActive
                        ? 'bg-slate-900 border-slate-950 text-white font-black shadow-[3px_3px_0px_0px_rgba(16,185,129,1)] scale-102Translate'
                        : 'text-slate-600 border-transparent hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="space-y-4 pt-4 border-t-2 border-slate-100">
            <button
              onClick={() => {
                sfx.playLogSfx();
                setActiveTab('tracker');
              }}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white border-2 border-slate-900 font-display text-[10px] font-black py-3 uppercase tracking-wider rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] transition-all cursor-pointer text-center"
            >
              Log Quest Deed ⚔️
            </button>

            <button
              onClick={handleResetProfile}
              className="w-full border-2 border-brand-border hover:bg-red-50 text-slate-500 hover:text-red-600 font-display text-[9px] font-black py-2.5 uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span>Eclipse Reset</span>
            </button>
          </div>
        </aside>

        {/* Display Stage Container */}
        <main className="flex-grow px-4 md:px-8 pt-6 lg:pt-8 pb-10 max-w-full overflow-hidden">
          {activeTab === 'dashboard' && (
            <DashboardOverview
              activities={activities}
              baselineAnnual={baselineAnnualTonnes}
              onNavigateToTab={(tab) => {
                sfx.playLogSfx();
                setActiveTab(tab);
              }}
            />
          )}

          {activeTab === 'tracker' && (
            <ActivityTracker
              onAddActivity={handleAddActivity}
              onDeleteActivity={handleDeleteActivity}
              activities={activities}
              quizAnswers={quizAnswers}
            />
          )}

          {activeTab === 'challenges' && (
            <WeeklyChallenges
              challenges={challenges}
              onAcceptChallenge={handleAcceptChallenge}
              onCompleteChallenge={handleCompleteChallenge}
              totalSaved={totalWeeklySaved}
            />
          )}

          {activeTab === 'insights' && (
            <AiInsights quizAnswers={quizAnswers} activities={activities} />
          )}

          {activeTab === 'trend' && (
            <ProgressTrend
              activities={activities}
              onDeleteActivity={handleDeleteActivity}
            />
          )}
        </main>

      </div>

      {/* Mobile bottom persistent tab bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full z-40 flex justify-around items-center h-20 bg-[#fefcf6] border-t-2 border-brand-border px-2 select-none shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
        {[
          { id: 'dashboard', label: 'Scoreboard', icon: LayoutDashboard },
          { id: 'tracker', label: 'Log', icon: FileText },
          { id: 'challenges', label: 'Quests', icon: Award },
          { id: 'insights', label: 'Sage Advice', icon: Brain },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                sfx.playLogSfx();
                setActiveTab(item.id as any);
              }}
              id={`mobile-nav-link-${item.id}`}
              className={`flex flex-col items-center justify-center w-20 h-full cursor-pointer select-none transition-transform active:scale-95 ${
                isActive
                  ? 'text-emerald-600 border-t-4 border-emerald-500 pt-0 font-black'
                  : 'text-slate-500 hover:text-emerald-500 pt-1 font-semibold'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="font-display text-[9px] uppercase tracking-wider mt-1.5">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

    </div>
  );
}
