import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { QuizAnswers, LoggedActivity } from '../types';
import { Send, Sparkles, RefreshCw } from 'lucide-react';
import { sfx } from '../utils/audio';

// ─── Types ────────────────────────────────────────────────────────────────────

type MessageSender = 'ai' | 'user';

interface CategoryRatio {
  label:   string;
  percent: number;
  color:   string;
}

interface Message {
  id:             string;
  sender:         MessageSender;
  text:           string;
  time:           string;
  categoryRatio?: CategoryRatio;
}

interface AiInsightsProps {
  quizAnswers: QuizAnswers;
  activities:  LoggedActivity[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getCurrentTime(): string {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function generateMessageId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

/** Generate an AI response based on user message keywords. */
function generateResponse(
  text: string,
  foodRatio: number,
): Pick<Message, 'text' | 'categoryRatio'> {
  const q = text.toLowerCase();

  if (/impact|biggest/.test(q)) {
    return {
      text: `Scroll analysis complete! 🌟 Your Food & Diet is the biggest energy drain (${foodRatio}% of overall outputs). Eating plant-based meals twice this week mitigates roughly 8 kg of CO₂!`,
      categoryRatio: { label: 'Diet Factor', percent: foodRatio, color: '#fbbf24' },
    };
  }
  if (/quick win|today/.test(q)) {
    return {
      text: `A quick win manifests! 💨 Hang your wet garments outdoors to air dry instead of using the tumble dryer. This saves 2.1 kg CO₂ and awards XP immediately!`,
    };
  }
  if (/commut/.test(q)) {
    return {
      text: `Transportation scroll activated! 🚲 Switching from a petrol car to biking or walking decreases commute emissions by up to 90%!`,
    };
  }
  if (/last week|compare/.test(q)) {
    return {
      text: `📈 Over the logged timeline, your impact is trending 14.5% below initial baseline marks. The forest guardians are pleased!`,
    };
  }
  return {
    text: `An excellent inquiry! Record every transaction on your ledger to receive active feedback and nurture your guardian seedling to full maturity.`,
  };
}

const PRESET_PILLS = [
  "What's my biggest impact? 🥩",
  'Quick win today? ⚡',
  'Compare to last week 📈',
  'Tips for commuting 🚲',
] as const;

// ─── Component ────────────────────────────────────────────────────────────────

export default function AiInsights({ activities }: AiInsightsProps) {
  const [inputText, setInputText] = useState('');
  const [loading,   setLoading]   = useState(false);

  const messagesEndRef   = useRef<HTMLDivElement | null>(null);
  const inputRef         = useRef<HTMLInputElement | null>(null);
  const loadingTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up timers on unmount
  useEffect(() => () => { if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current); }, []);

  // Compute food ratio from logged activities (memoised)
  const foodRatio = useMemo(() => {
    const totals = activities.reduce(
      (acc, act) => {
        if (act.co2Impact > 0) acc[act.category] = (acc[act.category] ?? 0) + act.co2Impact;
        return acc;
      },
      { transport: 0, food: 0, energy: 0, purchases: 0 } as Record<string, number>
    );
    const sum = totals.transport + totals.food + totals.energy + totals.purchases;
    return sum > 0 ? Math.round((totals.food / sum) * 100) : 42;
  }, [activities]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id:     generateMessageId(),
      sender: 'ai',
      text:   "Greetings, Solar-Punk Summoner! 🍃 I've analyzed your consumption data. Your transport footprint has improved compared to earlier logs. Would you like personalised energy reduction tips?",
      time:   '9:41 AM',
    },
  ]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    sfx.playLogSfx();

    const userMsg: Message = {
      id:     generateMessageId(),
      sender: 'user',
      text:   trimmed,
      time:   getCurrentTime(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    loadingTimerRef.current = setTimeout(() => {
      sfx.playLevelUpSfx();
      const { text: aiText, categoryRatio } = generateResponse(trimmed, foodRatio);

      const aiMsg: Message = {
        id:            generateMessageId(),
        sender:        'ai',
        text:          aiText,
        time:          getCurrentTime(),
        categoryRatio,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setLoading(false);
      // Return focus to input after AI responds
      inputRef.current?.focus();
    }, 1300);
  }, [loading, foodRatio]);

  const handleFormSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSendMessage(inputText);
  }, [inputText, handleSendMessage]);

  return (
    <section
      aria-label="AI Sage advisor chat"
      className="flex flex-col h-[520px] glass-panel rounded-2xl overflow-hidden animate-fade-in shadow-md"
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/30 flex items-center justify-between bg-white/40 shrink-0">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full bg-emerald-500 border border-white/40 flex items-center justify-center text-xl shadow-xs"
            aria-hidden="true"
          >
            🧠
          </div>
          <div>
            <h2 className="font-display text-sm font-black text-slate-800 uppercase tracking-wide">
              Solar-Punk Chibi Sage
            </h2>
            <p className="text-[10px] text-emerald-600 flex items-center gap-1.5 mt-0.5 font-bold">
              <span
                className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse inline-block border border-white/50"
                aria-hidden="true"
              />
              Guild Carbon Intelligence Online
            </p>
          </div>
        </div>
        <Sparkles className="w-5 h-5 text-amber-400 animate-pulse-soft" aria-hidden="true" />
      </div>

      {/* Message feed — aria-live for screen readers */}
      <div
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
        aria-atomic="false"
        aria-relevant="additions"
        className="flex-grow p-5 overflow-y-auto space-y-4 bg-slate-50/30"
      >
        {messages.map((msg) => {
          const isAi = msg.sender === 'ai';
          return (
            <div
              key={msg.id}
              className={`flex ${isAi ? 'justify-start' : 'justify-end'} max-w-full`}
            >
              <div
                className={`p-4 rounded-2xl max-w-[85%] md:max-w-[70%] border shadow-xs text-left ${
                  isAi
                    ? 'bg-white/90 border-white/60 text-slate-700'
                    : 'bg-emerald-500 border-emerald-400 text-white shadow-md'
                }`}
                aria-label={`${isAi ? 'Sage advisor' : 'You'} at ${msg.time}: ${msg.text}`}
              >
                <p className="font-sans text-xs font-bold leading-relaxed whitespace-pre-line">
                  {msg.text}
                </p>

                {isAi && msg.categoryRatio && (
                  <div
                    className="mt-3 p-3 bg-slate-100/60 border border-slate-200 rounded-xl flex items-center gap-3"
                    aria-label={`${msg.categoryRatio.label}: ${msg.categoryRatio.percent}%`}
                  >
                    <span aria-hidden="true">🍛</span>
                    <div className="flex-grow space-y-1.5">
                      <div
                        className="h-2.5 w-full neumorph-inset rounded-full overflow-hidden p-0.5"
                        role="meter"
                        aria-valuenow={msg.categoryRatio.percent}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${msg.categoryRatio.label} ${msg.categoryRatio.percent}%`}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            width:           `${msg.categoryRatio.percent}%`,
                            backgroundColor: msg.categoryRatio.color,
                          }}
                        />
                      </div>
                    </div>
                    <span className="font-display text-xs font-black" style={{ color: msg.categoryRatio.color }}>
                      {msg.categoryRatio.percent}%
                    </span>
                  </div>
                )}

                <time
                  dateTime={new Date().toISOString().split('T')[0]}
                  className={`text-[9px] font-display font-bold block mt-1.5 ${isAi ? 'text-slate-400' : 'text-emerald-100'}`}
                  aria-hidden="true"
                >
                  {msg.time}
                </time>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex justify-start" aria-live="polite" aria-label="Sage is thinking…">
            <div className="bg-white/80 border border-white/50 p-4 rounded-2xl flex items-center gap-2.5 shadow-xs animate-pulse">
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-500" aria-hidden="true" />
              <span className="font-sans text-xs font-bold text-slate-400">
                Sage is brewing insights…
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} aria-hidden="true" />
      </div>

      {/* Input area */}
      <div className="p-4 bg-white/40 border-t border-white/30 shrink-0 space-y-3">
        {/* Preset pills with keyboard navigation */}
        <div
          className="flex gap-2 overflow-x-auto pb-1"
          role="group"
          aria-label="Quick question suggestions"
        >
          {PRESET_PILLS.map((pill) => (
            <button
              key={pill}
              type="button"
              onClick={() => handleSendMessage(pill)}
              disabled={loading}
              aria-label={`Ask: ${pill}`}
              className="whitespace-nowrap px-3.5 py-1.5 bg-white/80 border border-white/50 text-slate-600 font-display text-[9px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-xs hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {pill}
            </button>
          ))}
        </div>

        {/* Chat input form */}
        <form onSubmit={handleFormSubmit} className="relative flex items-center">
          <label htmlFor="advisor-chat-input" className="sr-only">
            Message the Solar-Punk Sage
          </label>
          <input
            ref={inputRef}
            type="text"
            id="advisor-chat-input"
            name="advisor-chat"
            placeholder="Ask your Solarpunk Sage anything…"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={loading}
            autoComplete="off"
            className="w-full neumorph-inset rounded-xl px-4 pr-12 py-3.5 text-xs font-sans font-bold outline-none focus:ring-2 focus:ring-emerald-400 text-slate-800 placeholder:text-slate-400 border-none disabled:opacity-60"
          />
          <button
            type="submit"
            id="advisor-chat-send-btn"
            disabled={!inputText.trim() || loading}
            aria-label="Send message to Sage"
            className="absolute right-2 bg-emerald-500 text-white w-8 h-8 rounded-lg border border-emerald-400 flex items-center justify-center hover:brightness-105 transition-all cursor-pointer disabled:bg-slate-200 disabled:cursor-not-allowed"
          >
            <Send className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
          </button>
        </form>

        <p className="text-[9px] text-center text-slate-400 font-sans font-black uppercase tracking-wider">
          Planetary scrolls are verified safe for ecological research.
        </p>
      </div>
    </section>
  );
}
