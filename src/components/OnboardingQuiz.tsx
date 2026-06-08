import { useState, useEffect } from 'react';
import { QuizAnswers } from '../types';
import { calculateAnnualBaseline } from '../utils/carbonCalc';
import { Footprints, Bus, Zap, Car, Check, Flame, Plane, ShoppingBag, Sun, Compass } from 'lucide-react';
import { sfx } from '../utils/audio';

interface OnboardingQuizProps {
  onComplete: (answers: QuizAnswers) => void;
}

export default function OnboardingQuiz({ onComplete }: OnboardingQuizProps) {
  const [step, setStep] = useState<number>(1);
  const [answers, setAnswers] = useState<QuizAnswers>({
    transportMode: 'car_ice',
    commuteDistance: 20,
    dietType: 'meat_light',
    homeEnergy: 'mix',
    purchaseHabit: 'moderate',
  });

  const [calculating, setCalculating] = useState(false);
  const [progressWidth, setProgressWidth] = useState(0);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (step === 6) {
      setCalculating(true);
      sfx.playLevelUpSfx();
      const timer1 = setTimeout(() => {
        setProgressWidth(78);
      }, 300);

      const timer2 = setTimeout(() => {
        setShowResult(true);
      }, 1500);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [step]);

  const handleSelectOption = (field: keyof QuizAnswers, value: any) => {
    setAnswers((prev) => ({ ...prev, [field]: value }));
    sfx.playLogSfx();
  };

  const handleNext = () => {
    sfx.playLogSfx();
    if (step < 5) {
      setStep(step + 1);
    } else {
      setStep(6);
    }
  };

  const handleBack = () => {
    sfx.playLogSfx();
    if (step > 1 && step < 6) {
      setStep(step - 1);
    }
  };

  const handleFinish = () => {
    sfx.playLevelUpSfx();
    onComplete(answers);
  };

  const finalFootprint = calculateAnnualBaseline(answers);
  const percentBetter = Math.max(12, Math.min(88, Math.round(100 - (finalFootprint / 7.5) * 50)));

  return (
    <div className="w-full flex flex-col items-center select-none max-w-lg mx-auto">
      {/* Assessment progress header */}
      {step <= 5 && (
        <header className="h-20 flex flex-col items-center justify-center mb-6 w-full px-4">
          <div className="flex items-center gap-2 justify-center mb-2.5">
            <Compass className="w-4 h-4 text-emerald-500 animate-spin-slow" />
            <span className="font-display text-[10px] text-emerald-600 uppercase tracking-widest font-black">
              Guild Sower Exam · Step {step} of 5
            </span>
          </div>
          <div className="flex gap-2.5 w-full max-w-[280px]">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full flex-grow border border-white/50 transition-all duration-300 ${
                  s === step
                    ? 'bg-amber-400 shadow-sm'
                    : s < step
                    ? 'bg-emerald-500'
                    : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        </header>
      )}

      {/* Main Container - Glassmorphic game dialogue card */}
      <div className="w-full glass-panel rounded-2xl p-6 md:p-8 shadow-lg">
        
        {/* STEP 1: Commute Category */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <span className="text-5xl block transform hover:scale-110 transition-transform cursor-pointer">🚲✨</span>
              <h1 className="font-display text-2xl font-black text-slate-800 mt-3 mb-1.5 uppercase tracking-wide">
                1. Select Commute Mount!
              </h1>
              <p className="text-xs text-slate-500 leading-relaxed font-sans font-semibold">
                Greetings traveler! How do you journey to your daily forest outpost?
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {[
                { id: 'bike_walk', label: 'Bike or Foot (Gaia Alignment +100)', icon: Footprints, distance: 5, bg: 'hover:bg-emerald-50/50' },
                { id: 'transit', label: 'Magical Transit (Train/Bus)', icon: Bus, distance: 15, bg: 'hover:bg-cyan-50/50' },
                { id: 'car_ev', label: 'Vortex EV (Lightning Car)', icon: Zap, distance: 25, bg: 'hover:bg-amber-50/50' },
                { id: 'car_ice', label: 'Smoke Generator (Gasoline)', icon: Car, distance: 25, bg: 'hover:bg-rose-50/50' },
              ].map((opt) => {
                const Icon = opt.icon;
                const isSelected = answers.transportMode === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      handleSelectOption('transportMode', opt.id);
                      handleSelectOption('commuteDistance', opt.distance);
                    }}
                    className={`flex items-center px-4 py-3.5 border rounded-xl transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500 text-white shadow-md'
                        : `border-white/50 bg-white/40 hover:-translate-y-0.5 ${opt.bg}`
                    }`}
                  >
                    <Icon className={`w-5 h-5 mr-3 shrink-0 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                    <span className="font-sans text-xs font-bold leading-none">{opt.label}</span>
                    {isSelected && <Check className="w-4 h-4 ml-auto text-white font-bold shrink-0" />}
                  </button>
                );
              })}
            </div>

            <button
              id="onboarding-next-1"
              onClick={handleNext}
              className="mt-4 w-full bg-slate-900 hover:bg-slate-800 text-white font-display text-xs font-black py-4 uppercase tracking-wider transition-all rounded-xl shadow-md cursor-pointer"
            >
              Next Step ➔
            </button>
          </div>
        )}

        {/* STEP 2: Diet Category */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <span className="text-5xl block transform hover:scale-110 transition-transform cursor-pointer">🍎🍙</span>
              <h1 className="font-display text-2xl font-black text-slate-800 mt-3 mb-1.5 uppercase tracking-wide">
                2. Diet Alignment!
              </h1>
              <p className="text-xs text-slate-500 leading-relaxed font-sans font-semibold">
                What fuel nourishes your player core recipe?
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {[
                { id: 'vegan', label: 'Ethereal Vegan (1.5kg CO₂/day) 🌱' },
                { id: 'vegetarian', label: 'Forest Druid Vegetarian (2.4kg CO₂/day) 🧀' },
                { id: 'meat_light', label: 'Low Meat Omnivore (4.1kg CO₂/day)' },
                { id: 'meat_heavy', label: 'High Meat Behemoth (7.2kg CO₂/day) 🥩' },
              ].map((opt) => {
                const isSelected = answers.dietType === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption('dietType', opt.id)}
                    className={`flex items-center px-4 py-3.5 border rounded-xl transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500 text-white shadow-md'
                        : 'border-white/50 bg-white/40 hover:bg-white/60 hover:-translate-y-0.5'
                    }`}
                  >
                    <span className="font-sans text-xs font-bold flex-1 text-left">{opt.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-white font-bold shrink-0" />}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleBack}
                className="w-1/3 bg-white/60 border border-white/50 text-slate-600 font-display text-[10px] font-black py-4 uppercase tracking-wider hover:bg-white/80 transition-all rounded-xl cursor-pointer"
              >
                Back
              </button>
              <button
                id="onboarding-next-2"
                onClick={handleNext}
                className="w-2/3 bg-slate-900 hover:bg-slate-800 text-white font-display text-xs font-black py-4 uppercase tracking-wider transition-all rounded-xl shadow-md cursor-pointer"
              >
                Next Step ➔
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Energy Category */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <span className="text-5xl block transform hover:scale-110 transition-transform cursor-pointer">⚡🏰</span>
              <h1 className="font-display text-2xl font-black text-slate-800 mt-3 mb-1.5 uppercase tracking-wide">
                3. Manor Power Crystal!
              </h1>
              <p className="text-xs text-slate-500 leading-relaxed font-sans font-semibold">
                Choose the crystal powering your residential guild territory.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {[
                { id: 'renewable', label: '100% Solarpunk Solar & Wind ☀️', icon: Sun, color: 'text-amber-500' },
                { id: 'mix', label: 'Hybrid Leyline Grid Mix ⚡', icon: Zap, color: 'text-sky-500' },
                { id: 'coal_gas', label: 'Fossil Smoke Combustion 🔥', icon: Flame, color: 'text-rose-500' },
              ].map((opt) => {
                const Icon = opt.icon;
                const isSelected = answers.homeEnergy === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleHighlightAndSelect(opt.id)}
                    className={`flex items-center p-4 border rounded-xl transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500 text-white shadow-md'
                        : 'border-white/50 bg-white/40 hover:bg-white hover:-translate-y-0.5'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mr-3 shrink-0 ${isSelected ? 'text-white animate-bounce' : opt.color}`} />
                    <span className="font-sans text-xs font-bold flex-1 text-left">{opt.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-white font-bold shrink-0" />}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleBack}
                className="w-1/3 bg-white/60 border border-white/50 text-slate-600 font-display text-[10px] font-black py-4 uppercase tracking-wider hover:bg-white/80 transition-all rounded-xl cursor-pointer"
              >
                Back
              </button>
              <button
                id="onboarding-next-3"
                onClick={handleNext}
                className="w-2/3 bg-slate-900 hover:bg-slate-800 text-white font-display text-xs font-black py-4 uppercase tracking-wider transition-all rounded-xl shadow-md cursor-pointer"
              >
                Next Step ➔
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Flying Category */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="text-center">
              <span className="text-5xl block transform hover:scale-110 transition-transform cursor-pointer">✈️✨</span>
              <h1 className="font-display text-2xl font-black text-slate-800 mt-3 mb-1.5 uppercase tracking-wide">
                4. Sky Portals Taken!
              </h1>
              <p className="text-xs text-slate-500 leading-relaxed font-sans font-semibold">
                How many global sky flights do you board each calendar cycle?
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {[
                { id: 'rarely', label: 'Earthy Groundward Habit (0-1 Flights/yr) 🌲' },
                { id: 'occasionally', label: 'Periodic Sky Voyager (2-5 Flights/yr)' },
                { id: 'frequently', label: 'Frequent Air Teleporter (6+ Flights/yr) 💨' },
              ].map((opt) => {
                const isSelected = answers.purchaseHabit === opt.id || (answers.purchaseHabit === 'low' && opt.id === 'rarely') || (answers.purchaseHabit === 'moderate' && opt.id === 'occasionally') || (answers.purchaseHabit === 'high' && opt.id === 'frequently');
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      const mappedHabit = opt.id === 'rarely' ? 'low' : opt.id === 'occasionally' ? 'moderate' : 'high';
                      handleSelectOption('purchaseHabit', mappedHabit);
                    }}
                    className={`flex items-center p-4 border rounded-xl transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500 text-white shadow-md'
                        : 'border-white/50 bg-white/40 hover:bg-white hover:-translate-y-0.5'
                    }`}
                  >
                    <span className="font-sans text-xs font-bold flex-1 text-left">{opt.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-white font-bold shrink-0" />}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleBack}
                className="w-1/3 bg-white/60 border border-white/50 text-slate-600 font-display text-[10px] font-black py-4 uppercase tracking-wider hover:bg-white/80 transition-all rounded-xl cursor-pointer"
              >
                Back
              </button>
              <button
                id="onboarding-next-4"
                onClick={handleNext}
                className="w-2/3 bg-slate-900 hover:bg-slate-800 text-white font-display text-xs font-black py-4 uppercase tracking-wider transition-all rounded-xl shadow-md cursor-pointer"
              >
                Next Step ➔
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: Online Shopping */}
        {step === 5 && (
          <div className="space-y-6">
            <div className="text-center">
              <span className="text-5xl block transform hover:scale-110 transition-transform cursor-pointer">📦🎒</span>
              <h1 className="font-display text-2xl font-black text-slate-800 mt-3 mb-1.5 uppercase tracking-wide">
                5. Material Acquisitions!
              </h1>
              <p className="text-xs text-slate-500 leading-relaxed font-sans font-semibold">
                How often do you deploy home delivery packages for gear?
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {[
                { id: 'low', label: 'Zen Minimalist / Seldom (Low)' },
                { id: 'moderate', label: 'Balanced Consumer / Monthly (Mid)' },
                { id: 'high', label: 'Shopaholic Hoarder / Weekly (High)' },
              ].map((opt) => {
                const isSelected = answers.purchaseHabit === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption('purchaseHabit', opt.id)}
                    className={`flex items-center p-4 border rounded-xl transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500 text-white shadow-md'
                        : 'border-white/50 bg-white/40 hover:bg-white hover:-translate-y-0.5'
                    }`}
                  >
                    <span className="font-sans text-xs font-bold flex-1 text-left">{opt.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-white font-bold shrink-0" />}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleBack}
                className="w-1/3 bg-white/60 border border-white/50 text-slate-600 font-display text-[10px] font-black py-4 uppercase tracking-wider hover:bg-white/80 transition-all rounded-xl cursor-pointer"
              >
                Back
              </button>
              <button
                id="calculate-footprint-btn"
                onClick={handleNext}
                className="w-2/3 bg-emerald-500 hover:bg-emerald-600 text-white font-display text-xs font-black py-4 uppercase tracking-wider transition-all rounded-xl shadow-md cursor-pointer"
              >
                Cast Footprint Spell ✨
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: Loading Calculating Result */}
        {step === 6 && (
          <div className="space-y-6 text-center">
            <div className="mb-4">
              <span className="text-6xl block animate-bounce mb-2">🌸🏵️</span>
              <h1 className="font-display text-2xl font-black text-emerald-600 leading-tight uppercase tracking-tight">
                Summoning Nature Guardian...
              </h1>
              <p className="text-xs text-slate-500 leading-relaxed font-sans font-bold mt-1">
                Harmonizing your baseline inputs to awaken your companion seedling spirit.
              </p>
            </div>

            {/* Custom gauge indicator */}
            <div className="relative py-4 space-y-2">
              <div className="flex justify-between font-display text-[9px] text-slate-400 tracking-widest uppercase font-black px-1">
                <span>Solar-Lite</span>
                <span>Carbon Heavy</span>
              </div>
              <div className="h-5 w-full neumorph-inset rounded-full overflow-hidden p-0.5">
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
                >
                  <p className="text-[10px] font-display font-black uppercase tracking-widest text-emerald-100">ANNUAL METRIC BASELINE</p>
                  <span className="font-display text-2xl font-extrabold text-white">
                    {finalFootprint.toFixed(1)} Tonnes CO₂e
                  </span>
                </div>
              </div>
            </div>

            {showResult && (
              <div className="space-y-4 transition-all duration-500 animate-fade-in pt-4 border-t border-white/30">
                <p className="text-xs text-slate-600 leading-relaxed font-sans font-bold text-left bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                  🍃 <strong>Auspicious omens!</strong> You are starting with a solid foundation. Your initial choices align better than{' '}
                  <strong className="text-emerald-600 font-black">{percentBetter}%</strong> of human world dwellers! Let's embark on quest activities to reach absolute solar balance!
                </p>
                <button
                  id="view-dashboard-onboarding-btn"
                  onClick={handleFinish}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-display text-xs font-black py-4 uppercase tracking-widest transition-all rounded-xl shadow-md cursor-pointer"
                >
                  Enter RPG Garden Dashboard ⚔️
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Aesthetic Footer */}
      <footer className="mt-8 flex items-center justify-between w-full px-4 text-slate-400">
        <span className="font-display text-xs font-black uppercase tracking-wider text-emerald-600/80">EcoQuest · Solar Realm</span>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] font-bold">Ver 1.5</span>
        </div>
      </footer>
    </div>
  );

  function handleHighlightAndSelect(id: any) {
    handleSelectOption('homeEnergy', id);
  }
}
