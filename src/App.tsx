import { useState, useEffect, useCallback, useMemo } from 'react';
import { QuizAnswers, LoggedActivity, Challenge, TabId } from './types';
import { calculateAnnualBaseline, generate30DayHistory } from './utils/carbonCalc';

// Import components
import OnboardingQuiz from './components/OnboardingQuiz';
import DashboardOverview from './components/DashboardOverview';
import ActivityTracker from './components/ActivityTracker';
import AiInsights from './components/AiInsights';
import WeeklyChallenges from './components/WeeklyChallenges';
import ProgressTrend from './components/ProgressTrend';

import {
  Leaf, RefreshCcw, LayoutDashboard, FileText,
  Award, Brain, BarChart3, LogOut,
} from 'lucide-react';
import { sfx } from './utils/audio';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Safely parse JSON from localStorage, returning null on any failure. */
function safeLocalStorageParse<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as T;
    return parsed;
  } catch {
    // Corrupted storage — clear the bad entry to prevent loops
    try { localStorage.removeItem(key); } catch { /* ignore */ }
    return null;
  }
}

/** Persist a value to localStorage, ignoring quota errors gracefully. */
function safeLocalStorageSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`[EcoQuest] Could not persist "${key}" to localStorage:`, err);
  }
}

// ─── Constants ───────────────────────────────────────────────────────────────

const STORAGE_KEYS = {
  answers:    'ecomark_answers',
  logs:       'ecomark_logs',
  challenges: 'ecomark_challenges',
} as const;

const INITIAL_CHALLENGES: Challenge[] = [
  {
    id: 'ch-active-commute',
    title: 'Walk instead of drive',
    description:
      'Leave the car in the garage for trips under 5 km. Walk, bike, or take public transit instead.',
    category: 'transport',
    co2Savings: 4.2,
    duration: '2 Commutes',
    isAccepted: false,
    isCompleted: false,
  },
  {
    id: 'ch-meatfree',
    title: 'Skip meat for 3 days',
    description:
      'Avoid all animal protein for 3 full days. Explore plant-based meals and nurture your soil index.',
    category: 'food',
    co2Savings: 8.5,
    duration: '3 Days',
    isAccepted: false,
    isCompleted: false,
  },
  {
    id: 'ch-cold-wash',
    title: 'Air dry laundry',
    description:
      'Skip the tumble dryer this week and rely on natural airflow to dry your clothes.',
    category: 'energy',
    co2Savings: 2.1,
    duration: '1 Week',
    isAccepted: false,
    isCompleted: false,
  },
  {
    id: 'ch-vegan-week',
    title: 'Ethereal Vegan Week',
    description:
      'Commit to a fully plant-based diet for 7 days to restore soil fertility indices.',
    category: 'food',
    co2Savings: 19.8,
    duration: '1 Week',
    isAccepted: false,
    isCompleted: false,
  },
  {
    id: 'ch-thermostat',
    title: 'Thermostat Eclipse',
    description:
      'Lower heating by 2°C or raise AC by 2°C for 5 days. Rely on natural garments.',
    category: 'energy',
    co2Savings: 5.5,
    duration: '5 Days',
    isAccepted: false,
    isCompleted: false,
  },
  {
    id: 'ch-plastic-free',
    title: 'Zero Packaging Crusade',
    description:
      'Avoid single-use plastic and packaging on all purchases this week.',
    category: 'purchases',
    co2Savings: 3.5,
    duration: '1 Week',
    isAccepted: false,
    isCompleted: false,
  },
  {
    id: 'ch-solar-only',
    title: 'Solar Core Charge',
    description:
      'Unplug all standby devices and use only solar/rechargeable lamps for one evening.',
    category: 'energy',
    co2Savings: 1.8,
    duration: '1 Evening',
    isAccepted: false,
    isCompleted: false,
  },
  {
    id: 'ch-local-farmers',
    title: 'Leyline Harvest Feast',
    description:
      'Source 100% of your ingredients from local farmers or organic markets.',
    category: 'food',
    co2Savings: 6.2,
    duration: '1 Day',
    isAccepted: false,
    isCompleted: false,
  },
  {
    id: 'ch-car-free',
    title: 'Wind Rider Transit',
    description:
      'Swap three car trips of any distance for public transportation or cycling.',
    category: 'transport',
    co2Savings: 12.0,
    duration: '3 Trips',
    isAccepted: false,
    isCompleted: false,
  },
];

// ─── Navigation Config ────────────────────────────────────────────────────────

const NAV_ITEMS: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'dashboard',  label: 'Scoreboard',     icon: LayoutDashboard },
  { id: 'tracker',   label: 'Quest Logger',    icon: FileText },
  { id: 'challenges',label: 'Guild Quests',    icon: Award },
  { id: 'insights',  label: 'Sage Advice',     icon: Brain },
  { id: 'trend',     label: 'Leyline Trends',  icon: BarChart3 },
];

const MOBILE_NAV_ITEMS = NAV_ITEMS.slice(0, 4);

// ─── Component ────────────────────────────────────────────────────────────────

export default function App() {
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswers | null>(null);
  const [activities,  setActivities]  = useState<LoggedActivity[]>([]);
  const [challenges,  setChallenges]  = useState<Challenge[]>(INITIAL_CHALLENGES);
  const [activeTab,   setActiveTab]   = useState<TabId>('dashboard');
  const [loading,     setLoading]     = useState(true);

  // ── Load persisted state on mount ──────────────────────────────────────────
  useEffect(() => {
    const storedAnswers    = safeLocalStorageParse<QuizAnswers>(STORAGE_KEYS.answers);
    const storedLogs       = safeLocalStorageParse<LoggedActivity[]>(STORAGE_KEYS.logs);
    const storedChallenges = safeLocalStorageParse<Challenge[]>(STORAGE_KEYS.challenges);

    if (storedAnswers)    setQuizAnswers(storedAnswers);
    if (storedLogs)       setActivities(storedLogs);
    if (storedChallenges) setChallenges(storedChallenges);

    setLoading(false);
  }, []);

  // ── Handlers (stable references via useCallback) ──────────────────────────

  const handleQuizComplete = useCallback((answers: QuizAnswers) => {
    const starterHistory = generate30DayHistory(answers);

    setQuizAnswers(answers);
    setActivities(starterHistory);
    setChallenges(INITIAL_CHALLENGES);

    safeLocalStorageSet(STORAGE_KEYS.answers,    answers);
    safeLocalStorageSet(STORAGE_KEYS.logs,       starterHistory);
    safeLocalStorageSet(STORAGE_KEYS.challenges, INITIAL_CHALLENGES);

    setActiveTab('dashboard');
  }, []);

  const handleAddActivity = useCallback((newAct: Omit<LoggedActivity, 'id'>) => {
    const actWithId: LoggedActivity = {
      ...newAct,
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    };

    setActivities((prev) => {
      const updated = [...prev, actWithId];
      safeLocalStorageSet(STORAGE_KEYS.logs, updated);
      return updated;
    });
  }, []);

  const handleDeleteActivity = useCallback((id: string) => {
    setActivities((prev) => {
      const updated = prev.filter((act) => act.id !== id);
      safeLocalStorageSet(STORAGE_KEYS.logs, updated);
      return updated;
    });
  }, []);

  const handleAcceptChallenge = useCallback((id: string) => {
    setChallenges((prev) => {
      const updated = prev.map((ch) =>
        ch.id === id ? { ...ch, isAccepted: true } : ch
      );
      safeLocalStorageSet(STORAGE_KEYS.challenges, updated);
      return updated;
    });
  }, []);

  const handleCompleteChallenge = useCallback((id: string) => {
    const todayStr = new Date().toISOString().split('T')[0];

    setChallenges((prev) => {
      const challenge = prev.find((ch) => ch.id === id);
      if (!challenge) return prev;

      // Log a negative-impact (offset) activity for the completed challenge
      setActivities((prevActs) => {
        const updatedActs = [
          ...prevActs,
          {
            id:          `reward-ch-${id}-${Date.now()}`,
            date:        todayStr,
            category:    challenge.category,
            description: `Completed Quest: ${challenge.title}`,
            amount:      1,
            co2Impact:   -challenge.co2Savings,
          } satisfies LoggedActivity,
        ];
        safeLocalStorageSet(STORAGE_KEYS.logs, updatedActs);
        return updatedActs;
      });

      const updated = prev.map((ch) =>
        ch.id === id ? { ...ch, isCompleted: true, completedAt: todayStr } : ch
      );
      safeLocalStorageSet(STORAGE_KEYS.challenges, updated);
      return updated;
    });
  }, []);

  const handleResetProfile = useCallback(() => {
    sfx.playDeleteSfx();
    if (window.confirm('Reset your EcoQuest profile? All logged activities and progress will be lost.')) {
      setQuizAnswers(null);
      setActivities([]);
      setChallenges(INITIAL_CHALLENGES);
      try {
        localStorage.removeItem(STORAGE_KEYS.answers);
        localStorage.removeItem(STORAGE_KEYS.logs);
        localStorage.removeItem(STORAGE_KEYS.challenges);
      } catch { /* ignore */ }
      setActiveTab('dashboard');
    }
  }, []);

  const handleNavigateToTab = useCallback((tab: TabId) => {
    sfx.playLogSfx();
    setActiveTab(tab);
  }, []);

  // ── Derived stats (memoised) ──────────────────────────────────────────────

  const totalWeeklySaved = useMemo(() =>
    challenges
      .filter((ch) => ch.isCompleted)
      .reduce((sum, ch) => sum + ch.co2Savings, 0),
    [challenges]
  );

  const baselineAnnualTonnes = useMemo(() =>
    quizAnswers ? calculateAnnualBaseline(quizAnswers) : 0,
    [quizAnswers]
  );

  // ── Loading screen ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-4"
        role="status"
        aria-label="Loading EcoQuest RPG"
        aria-live="polite"
      >
        <Leaf className="w-8 h-8 text-emerald-500 animate-spin" aria-hidden="true" />
        <span className="text-xs font-display font-semibold text-slate-500 mt-4 tracking-widest uppercase">
          Synthesizing EcoQuest Realm…
        </span>
      </div>
    );
  }

  // ── Onboarding ─────────────────────────────────────────────────────────────

  if (!quizAnswers) {
    return (
      <div className="min-h-screen flex flex-col justify-between py-6 px-4">
        <div className="text-center space-y-2.5 max-w-sm mx-auto my-6 select-none">
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-500 text-white border border-emerald-400 rounded-full text-xs font-bold shadow-sm"
            role="presentation"
          >
            <Leaf className="w-3.5 h-3.5 fill-current animate-bounce" aria-hidden="true" />
            <span className="font-display text-[9px] uppercase font-black tracking-widest">REALTIME CARBON PORTAL</span>
          </div>

          <h1 className="text-4xl font-display font-black text-slate-900 tracking-tight leading-none uppercase">
            ECOQUEST RPG
          </h1>

          <p className="text-xs text-slate-600 font-sans font-semibold leading-relaxed">
            Measure your ecological baseline, level up your solarpunk guardian, and vanquish the Smog Lord!
          </p>
        </div>

        <div className="flex-grow flex items-center justify-center">
          <OnboardingQuiz onComplete={handleQuizComplete} />
        </div>
      </div>
    );
  }

  // ── Main app ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen text-[#0f172a] antialiased flex flex-col relative overflow-x-hidden">

      {/* Mobile header */}
      <header
        className="lg:hidden fixed top-0 w-full z-40 bg-white/70 backdrop-blur-md border-b border-white/30 h-16 flex justify-between items-center px-4 select-none"
        role="banner"
      >
        <span
          className="font-display text-lg font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5 pt-1"
          aria-label="EcoQuest RPG"
        >
          <span aria-hidden="true" className="animate-float">🌱</span> ECOQUEST
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleResetProfile}
            id="mobile-reset-profile"
            className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50/50 border border-white/40 rounded-xl cursor-pointer"
            aria-label="Reset profile — clears all data"
            title="Reset your EcoQuest profile"
          >
            <RefreshCcw className="w-4 h-4" aria-hidden="true" />
          </button>
          <div
            className="w-8 h-8 rounded-full bg-emerald-500 border border-emerald-400 flex items-center justify-center text-white text-xs select-none font-black font-mono shadow-sm"
            aria-hidden="true"
          >
            S
          </div>
        </div>
      </header>

      {/* Layout: sidebar + main content */}
      <div className="flex flex-1 max-w-7xl w-full mx-auto pt-16 lg:pt-0 pb-20 lg:pb-0 h-full">

        {/* Desktop sidebar */}
        <aside
          className="w-64 hidden lg:flex flex-col sticky top-0 left-0 border-r border-white/30 p-6 h-screen select-none justify-between bg-white/45 backdrop-blur-md z-20"
          aria-label="Site navigation"
        >
          <div className="space-y-8">
            <div className="pt-2">
              <h1 className="font-display text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2 uppercase">
                <span className="animate-float" aria-hidden="true">🌱</span> EcoQuest
              </h1>
              <p className="text-emerald-700 font-display text-[9px] font-black uppercase tracking-widest mt-1 bg-emerald-50/70 border border-emerald-200/50 py-1 px-2.5 rounded-full w-fit">
                Solar Sanctuary
              </p>
            </div>

            <nav aria-label="Main navigation">
              <ul className="flex flex-col gap-2 list-none p-0 m-0">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => handleNavigateToTab(item.id)}
                        id={`sidebar-link-${item.id}`}
                        aria-current={isActive ? 'page' : undefined}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-display font-black uppercase tracking-wider transition-all rounded-xl border cursor-pointer text-left ${
                          isActive
                            ? 'bg-slate-900 border-slate-950 text-white shadow-md'
                            : 'text-slate-600 border-transparent hover:bg-white/50 hover:text-slate-900'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                        <span>{item.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          <div className="space-y-4 pt-4 border-t border-white/20">
            <button
              onClick={() => handleNavigateToTab('tracker')}
              id="sidebar-log-quest"
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white border border-emerald-400 font-display text-[10px] font-black py-3.5 uppercase tracking-wider rounded-xl shadow-md cursor-pointer text-center transition-colors"
              aria-label="Navigate to Quest Logger to log a new activity"
            >
              Log Quest Deed ⚔️
            </button>

            <button
              onClick={handleResetProfile}
              id="sidebar-reset-profile"
              className="w-full border border-white/30 hover:bg-red-50/50 text-slate-500 hover:text-red-600 font-display text-[9px] font-black py-2.5 uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              aria-label="Reset EcoQuest profile — all data will be cleared"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>Eclipse Reset</span>
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main
          id="main-content"
          className="flex-grow px-4 md:px-8 pt-6 lg:pt-8 pb-10 max-w-full overflow-hidden"
          tabIndex={-1}
        >
          {activeTab === 'dashboard' && (
            <DashboardOverview
              activities={activities}
              baselineAnnual={baselineAnnualTonnes}
              onNavigateToTab={handleNavigateToTab}
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

      {/* Mobile bottom nav */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 w-full z-40 flex justify-around items-center h-20 bg-white/70 backdrop-blur-md border-t border-white/30 px-2 select-none shadow-lg"
        aria-label="Mobile navigation"
      >
        {MOBILE_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavigateToTab(item.id)}
              id={`mobile-nav-link-${item.id}`}
              aria-current={isActive ? 'page' : undefined}
              aria-label={item.label}
              className={`flex flex-col items-center justify-center w-20 h-full cursor-pointer select-none transition-transform active:scale-95 ${
                isActive
                  ? 'text-emerald-600 border-t-4 border-emerald-500 font-black'
                  : 'text-slate-500 hover:text-emerald-500 pt-1 font-semibold'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
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
