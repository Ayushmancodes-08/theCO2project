import { useState, useEffect, useCallback, useRef } from 'react';
import {
  QuizAnswers,
  TransportMode, DietType, HomeEnergy, PurchaseHabit,
} from '../types';
import { calculateAnnualBaseline } from '../utils/carbonCalc';
import { Footprints, Bus, Zap, Car, Check, Flame, Sun, Compass } from 'lucide-react';
import { sfx } from '../utils/audio';

// ─── Types ────────────────────────────────────────────────────────────────────

interface OnboardingQuizProps {
  onComplete: (answers: QuizAnswers) => void;
}

type Step = 1 | 2 | 3 | 4 | 5 | 6;

// ─── Constants ────────────────────────────────────────────────────────────────

const TOTAL_STEPS = 5;

const TRANSPORT_OPTIONS: {
  id: TransportMode;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  distance: number;
  bg: string;
}[] = [
  { id: 'bike_walk', label: 'Bike or Foot (Gaia Alignment +100)', icon: Footprints, distance: 5,  bg: 'hover:bg-emerald-50/50' },
  { id: 'transit',   label: 'Magical Transit (Train / Bus)',       icon: Bus,        distance: 15, bg: 'hover:bg-cyan-50/50'    },
  { id: 'car_ev',    label: 'Vortex EV (Electric Vehicle)',        icon: Zap,        distance: 25, bg: 'hover:bg-amber-50/50'   },
  { id: 'car_ice',   label: 'Smoke Generator (Gasoline Car)',      icon: Car,        distance: 25, bg: 'hover:bg-rose-50/50'    },
];

const DIET_OPTIONS: { id: DietType; label: string }[] = [
  { id: 'vegan',       label: 'Ethereal Vegan (1.5 kg CO₂/day) 🌱'           },
  { id: 'vegetarian',  label: 'Forest Druid Vegetarian (2.4 kg CO₂/day) 🧀'  },
  { id: 'meat_light',  label: 'Low Meat Omnivore (4.1 kg CO₂/day)'           },
  { id: 'meat_heavy',  label: 'High Meat Behemoth (7.2 kg CO₂/day) 🥩'       },
];

const ENERGY_OPTIONS: {
  id: HomeEnergy;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}[] = [
  { id: 'renewable', label: '100% Solarpunk Solar & Wind ☀️', icon: Sun,   color: 'text-amber-500' },
  { id: 'mix',       label: 'Hybrid Leyline Grid Mix ⚡',     icon: Zap,   color: 'text-sky-500'   },
  { id: 'coal_gas',  label: 'Fossil Smoke Combustion 🔥',     icon: Flame, color: 'text-rose-500'  },
];

const PURCHASE_OPTIONS: { id: PurchaseHabit; label: string }[] = [
  { id: 'low',      label: 'Zen Minimalist / Seldom (Low)'       },
  { id: 'moderate', label: 'Balanced Consumer / Monthly (Mid)'   },
  { id: 'high',     label: 'Shopaholic Hoarder / Weekly (High)'  },
];

// ─── Sub-components ────────────────────────────────────────────────────────────

interface StepNavProps {
  onBack?:  () => void;
  onNext:   () => void;
  nextId:   string;
  nextLabel?: string;
  showBack:  boolean;
}

function StepNav({ onBack, onNext, nextId, nextLabel = 'Next Step →', showBack }: StepNavProps) {
  return (
    <div className="flex gap-3 pt-2">
      {showBack && onBack && (
        <button
          type="button"
          onClick={onBack}
          className="w-1/3 bg-white/60 border border-white/50 text-slate-600 font-display text-[10px] font-black py-4 uppercase tracking-wider hover:bg-white/80 transition-all rounded-xl cursor-pointer"
          aria-label="Go back to previous step"
        >
          Back
        </button>
      )}
      <button
        type="button"
        id={nextId}
        onClick={onNext}
        className={`${showBack ? 'w-2/3' : 'w-full'} bg-slate-900 hover:bg-slate-800 text-white font-display text-xs font-black py-4 uppercase tracking-wider transition-all rounded-xl shadow-md cursor-pointer`}
        aria-label={nextLabel}
      >
        {nextLabel}
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function OnboardingQuiz({ onComplete }: OnboardingQuizProps) {
  const [step, setStep]               = useState<Step>(1);
  const [answers, setAnswers]         = useState<QuizAnswers>({
    transportMode:   'car_ice',
    commuteDistance: 20,
    dietType:        'meat_light',
    homeEnergy:      'mix',
    purchaseHabit:   'moderate',
  });
  const [calculating,   setCalculating]   = useState(false);
  const [progressWidth, setProgressWidth] = useState(0);
  const [showResult,    setShowResult]    = useState(false);

  const stepHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const timer1Ref = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timer2Ref = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Move focus to heading when step changes (WCAG 2.4.3 focus order)
  useEffect(() => {
    stepHeadingRef.current?.focus();
  }, [step]);

  // Trigger calculation animation on step 6
  useEffect(() => {
    if (step !== 6) return;
    setCalculating(true);
    sfx.playLevelUpSfx();
    timer1Ref.current = setTimeout(() => setProgressWidth(78),    300);
    timer2Ref.current = setTimeout(() => setShowResult(true), 1500);
    return () => {
      if (timer1Ref.current) clearTimeout(timer1Ref.current);
      if (timer2Ref.current) clearTimeout(timer2Ref.current);
    };
  }, [step]);

  const setField = useCallback(<K extends keyof QuizAnswers>(field: K, value: QuizAnswers[K]) => {
    setAnswers((prev) => ({ ...prev, [field]: value }));
    sfx.playLogSfx();
  }, []);

  const handleNext = useCallback(() => {
    sfx.playLogSfx();
    setStep((s) => (s < 5 ? (s + 1) as Step : 6));
  }, []);

  const handleBack = useCallback(() => {
    sfx.playLogSfx();
    setStep((s) => (s > 1 && s < 6 ? (s - 1) as Step : s));
  }, []);

  const handleFinish = useCallback(() => {
    sfx.playLevelUpSfx();
    onComplete(answers);
  }, [answers, onComplete]);

  const finalFootprint  = calculateAnnualBaseline(answers);
  const percentBetter   = Math.max(12, Math.min(88, Math.round(100 - (finalFootprint / 7.5) * 50)));

  // Progress indicator stepper
  const stepIndicator = step <= 5 && (
    <header className="h-20 flex flex-col items-center justify-center mb-6 w-full px-4">
      <div className="flex items-center gap-2 justify-center mb-2.5">
        <Compass className="w-4 h-4 text-emerald-500 animate-spin-slow" aria-hidden="true" />
        <span
          className="font-display text-[10px] text-emerald-600 uppercase tracking-widest font-black"
          aria-live="polite"
          aria-atomic="true"
        >
          Guild Sower Exam · Step {step} of {TOTAL_STEPS}
        </span>
      </div>

      {/* Step dots — purely visual, no interactive role needed */}
      <div
        className="flex gap-2.5 w-full max-w-[280px]"
        role="progressbar"
        aria-valuenow={step}
        aria-valuemin={1}
        aria-valuemax={TOTAL_STEPS}
        aria-label={`Quiz progress: step ${step} of ${TOTAL_STEPS}`}
      >
        {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((s) => (
          <div
            key={s}
            aria-hidden="true"
            className={`h-2 rounded-full flex-grow border border-white/50 transition-all duration-300 ${
              s === step   ? 'bg-amber-400 shadow-sm' :
              s <  step   ? 'bg-emerald-500'          :
                             'bg-white/40'
            }`}
          />
        ))}
      </div>
    </header>
  );

  return (
    <div className="w-full flex flex-col items-center max-w-lg mx-auto">
      {stepIndicator}

      {/* Main card */}
      <div
        className="w-full glass-panel rounded-2xl p-6 md:p-8 shadow-lg"
        role="form"
        aria-label={`Onboarding quiz, step ${step} of ${TOTAL_STEPS}`}
      >

        {/* ── STEP 1: Transport ─────────────────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <span className="text-5xl block" aria-hidden="true">🚲✨</span>
              <h2
                ref={stepHeadingRef}
                tabIndex={-1}
                className="font-display text-2xl font-black text-slate-800 mt-3 mb-1.5 uppercase tracking-wide outline-none"
              >
                1. Select Commute Mode
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed font-sans font-semibold">
                How do you travel to your daily destination?
              </p>
            </div>

            <fieldset>
              <legend className="sr-only">Select your primary transport mode</legend>
              <div className="grid grid-cols-1 gap-3" role="radiogroup" aria-required="true">
                {TRANSPORT_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = answers.transportMode === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      id={`transport-opt-${opt.id}`}
                      onClick={() => {
                        setField('transportMode',   opt.id);
                        setField('commuteDistance', opt.distance);
                      }}
                      className={`flex items-center px-4 py-3.5 border rounded-xl transition-all duration-150 cursor-pointer text-left w-full ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500 text-white shadow-md'
                          : `border-white/50 bg-white/40 hover:-translate-y-0.5 ${opt.bg}`
                      }`}
                    >
                      <Icon className={`w-5 h-5 mr-3 shrink-0 ${isSelected ? 'text-white' : 'text-slate-500'}`} aria-hidden="true" />
                      <span className="font-sans text-xs font-bold leading-none">{opt.label}</span>
                      {isSelected && <Check className="w-4 h-4 ml-auto text-white font-bold shrink-0" aria-hidden="true" />}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <StepNav onNext={handleNext} nextId="onboarding-next-1" showBack={false} />
          </div>
        )}

        {/* ── STEP 2: Diet ──────────────────────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <span className="text-5xl block" aria-hidden="true">🍎🍙</span>
              <h2
                ref={stepHeadingRef}
                tabIndex={-1}
                className="font-display text-2xl font-black text-slate-800 mt-3 mb-1.5 uppercase tracking-wide outline-none"
              >
                2. Diet Alignment
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed font-sans font-semibold">
                What best describes your daily eating habits?
              </p>
            </div>

            <fieldset>
              <legend className="sr-only">Select your dietary pattern</legend>
              <div className="grid grid-cols-1 gap-3" role="radiogroup" aria-required="true">
                {DIET_OPTIONS.map((opt) => {
                  const isSelected = answers.dietType === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      id={`diet-opt-${opt.id}`}
                      onClick={() => setField('dietType', opt.id)}
                      className={`flex items-center px-4 py-3.5 border rounded-xl transition-all duration-150 cursor-pointer text-left w-full ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500 text-white shadow-md'
                          : 'border-white/50 bg-white/40 hover:bg-white/60 hover:-translate-y-0.5'
                      }`}
                    >
                      <span className={`font-sans text-xs font-bold flex-1 ${isSelected ? 'text-white' : 'text-slate-700'}`}>{opt.label}</span>
                      {isSelected && <Check className="w-4 h-4 text-white font-bold shrink-0" aria-hidden="true" />}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <StepNav onBack={handleBack} onNext={handleNext} nextId="onboarding-next-2" showBack />
          </div>
        )}

        {/* ── STEP 3: Home Energy ───────────────────────────────────────────── */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <span className="text-5xl block" aria-hidden="true">⚡🏰</span>
              <h2
                ref={stepHeadingRef}
                tabIndex={-1}
                className="font-display text-2xl font-black text-slate-800 mt-3 mb-1.5 uppercase tracking-wide outline-none"
              >
                3. Home Energy Source
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed font-sans font-semibold">
                What powers your home electricity and heating?
              </p>
            </div>

            <fieldset>
              <legend className="sr-only">Select your home energy source</legend>
              <div className="grid grid-cols-1 gap-3" role="radiogroup" aria-required="true">
                {ENERGY_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = answers.homeEnergy === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      id={`energy-opt-${opt.id}`}
                      onClick={() => setField('homeEnergy', opt.id)}
                      className={`flex items-center p-4 border rounded-xl transition-all duration-150 cursor-pointer text-left w-full ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500 text-white shadow-md'
                          : 'border-white/50 bg-white/40 hover:bg-white hover:-translate-y-0.5'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mr-3 shrink-0 ${isSelected ? 'text-white' : opt.color}`} aria-hidden="true" />
                      <span className={`font-sans text-xs font-bold flex-1 ${isSelected ? 'text-white' : 'text-slate-700'}`}>{opt.label}</span>
                      {isSelected && <Check className="w-4 h-4 text-white font-bold shrink-0" aria-hidden="true" />}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <StepNav onBack={handleBack} onNext={handleNext} nextId="onboarding-next-3" showBack />
          </div>
        )}

        {/* ── STEP 4: Flight frequency ──────────────────────────────────────── */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="text-center">
              <span className="text-5xl block" aria-hidden="true">✈️✨</span>
              <h2
                ref={stepHeadingRef}
                tabIndex={-1}
                className="font-display text-2xl font-black text-slate-800 mt-3 mb-1.5 uppercase tracking-wide outline-none"
              >
                4. Annual Flight Frequency
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed font-sans font-semibold">
                How many flights do you take per year?
              </p>
            </div>

            <fieldset>
              <legend className="sr-only">Select your annual flight frequency</legend>
              <div className="grid grid-cols-1 gap-3" role="radiogroup" aria-required="true">
                {[
                  { id: 'low'      as PurchaseHabit, label: 'Earthy Groundward Habit (0–1 flights/yr) 🌲' },
                  { id: 'moderate' as PurchaseHabit, label: 'Periodic Sky Voyager (2–5 flights/yr)'       },
                  { id: 'high'     as PurchaseHabit, label: 'Frequent Air Teleporter (6+ flights/yr) 💨'  },
                ].map((opt) => {
                  const isSelected = answers.purchaseHabit === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      id={`flight-opt-${opt.id}`}
                      onClick={() => setField('purchaseHabit', opt.id)}
                      className={`flex items-center p-4 border rounded-xl transition-all duration-150 cursor-pointer text-left w-full ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500 text-white shadow-md'
                          : 'border-white/50 bg-white/40 hover:bg-white hover:-translate-y-0.5'
                      }`}
                    >
                      <span className={`font-sans text-xs font-bold flex-1 ${isSelected ? 'text-white' : 'text-slate-700'}`}>{opt.label}</span>
                      {isSelected && <Check className="w-4 h-4 text-white font-bold shrink-0" aria-hidden="true" />}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <StepNav onBack={handleBack} onNext={handleNext} nextId="onboarding-next-4" showBack />
          </div>
        )}

        {/* ── STEP 5: Shopping habits ───────────────────────────────────────── */}
        {step === 5 && (
          <div className="space-y-6">
            <div className="text-center">
              <span className="text-5xl block" aria-hidden="true">📦🎒</span>
              <h2
                ref={stepHeadingRef}
                tabIndex={-1}
                className="font-display text-2xl font-black text-slate-800 mt-3 mb-1.5 uppercase tracking-wide outline-none"
              >
                5. Online Shopping Habits
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed font-sans font-semibold">
                How often do you order goods for home delivery?
              </p>
            </div>

            <fieldset>
              <legend className="sr-only">Select your purchasing frequency</legend>
              <div className="grid grid-cols-1 gap-3" role="radiogroup" aria-required="true">
                {PURCHASE_OPTIONS.map((opt) => {
                  const isSelected = answers.purchaseHabit === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      id={`purchase-opt-${opt.id}`}
                      onClick={() => setField('purchaseHabit', opt.id)}
                      className={`flex items-center p-4 border rounded-xl transition-all duration-150 cursor-pointer text-left w-full ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500 text-white shadow-md'
                          : 'border-white/50 bg-white/40 hover:bg-white hover:-translate-y-0.5'
                      }`}
                    >
                      <span className={`font-sans text-xs font-bold flex-1 ${isSelected ? 'text-white' : 'text-slate-700'}`}>{opt.label}</span>
                      {isSelected && <Check className="w-4 h-4 text-white font-bold shrink-0" aria-hidden="true" />}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleBack}
                className="w-1/3 bg-white/60 border border-white/50 text-slate-600 font-display text-[10px] font-black py-4 uppercase tracking-wider hover:bg-white/80 transition-all rounded-xl cursor-pointer"
                aria-label="Go back to previous step"
              >
                Back
              </button>
              <button
                type="button"
                id="calculate-footprint-btn"
                onClick={handleNext}
                className="w-2/3 bg-emerald-500 hover:bg-emerald-600 text-white font-display text-xs font-black py-4 uppercase tracking-wider transition-all rounded-xl shadow-md cursor-pointer"
                aria-label="Calculate my carbon footprint"
              >
                Calculate Footprint <span aria-hidden="true">✨</span>
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 6: Results ───────────────────────────────────────────────── */}
        {step === 6 && (
          <div className="space-y-6 text-center">
            <div className="mb-4">
              <span className="text-6xl block animate-bounce mb-2" aria-hidden="true">🌸🏵️</span>
              <h2
                ref={stepHeadingRef}
                tabIndex={-1}
                className="font-display text-2xl font-black text-emerald-600 leading-tight uppercase tracking-tight outline-none"
                aria-live="polite"
              >
                {showResult ? 'Your Baseline Is Ready!' : 'Calculating Your Footprint…'}
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed font-sans font-bold mt-1">
                Harmonizing your inputs to calculate your guardian profile.
              </p>
            </div>

            {/* Progress meter */}
            <div className="relative py-4 space-y-2">
              <div className="flex justify-between font-display text-[9px] text-slate-400 tracking-widest uppercase font-black px-1" aria-hidden="true">
                <span>Solar-Lite</span>
                <span>Carbon Heavy</span>
              </div>
              <div
                className="h-5 w-full neumorph-inset rounded-full overflow-hidden p-0.5"
                role="meter"
                aria-valuenow={progressWidth}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Carbon footprint: ${calculating ? 'calculating…' : `${finalFootprint.toFixed(1)} tonnes CO₂`}`}
              >
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-amber-400 transition-all duration-[1200ms] ease-out rounded-full"
                  style={{ width: `${progressWidth}%` }}
                />
              </div>

              <div className="mt-8 min-h-[50px] flex justify-center items-center">
                <div
                  className={`bg-emerald-500 text-white py-2 px-6 border border-emerald-400 rounded-xl shadow-md transition-all duration-700 ${
                    showResult ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                  }`}
                  aria-live="polite"
                  aria-atomic="true"
                >
                  <p className="text-[10px] font-display font-black uppercase tracking-widest text-emerald-100">
                    Annual Baseline
                  </p>
                  <span className="font-display text-2xl font-extrabold text-white">
                    {finalFootprint.toFixed(1)} Tonnes CO₂e
                  </span>
                </div>
              </div>
            </div>

            {showResult && (
              <div className="space-y-4 transition-all duration-500 animate-fade-in pt-4 border-t border-white/30">
                <p className="text-xs text-slate-600 leading-relaxed font-sans font-bold text-left bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                  <span aria-hidden="true">🍃</span>{' '}
                  <strong>Auspicious omens!</strong> Your choices align better than{' '}
                  <strong className="text-emerald-600 font-black">{percentBetter}%</strong> of surveyed world dwellers!
                  Let's embark on quests to reach absolute solar balance!
                </p>
                <button
                  type="button"
                  id="view-dashboard-onboarding-btn"
                  onClick={handleFinish}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-display text-xs font-black py-4 uppercase tracking-widest transition-all rounded-xl shadow-md cursor-pointer"
                  aria-label="Enter EcoQuest RPG Dashboard"
                >
                  Enter RPG Garden Dashboard <span aria-hidden="true">⚔️</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-8 flex items-center justify-between w-full px-4 text-slate-400">
        <span className="font-display text-xs font-black uppercase tracking-wider text-emerald-600/80">EcoQuest · Solar Realm</span>
        <span className="font-mono text-[10px] font-bold">Ver 1.5</span>
      </footer>
    </div>
  );
}
