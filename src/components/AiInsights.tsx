import { useState, useRef, useEffect } from 'react';
import { QuizAnswers, LoggedActivity } from '../types';
import { Send, Sparkles, RefreshCw } from 'lucide-react';
import { sfx } from '../utils/audio';

interface AiInsightsProps {
  quizAnswers: QuizAnswers;
  activities: LoggedActivity[];
}

interface Message {
  sender: 'ai' | 'user';
  text: string;
  time: string;
  categoryRatio?: {
    label: string;
    percent: number;
    color: string;
  };
}

export default function AiInsights({ quizAnswers, activities }: AiInsightsProps) {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Group emissions by categories to calculate dynamic breakdown
  const totals = activities.reduce(
    (acc, act) => {
      if (act.co2Impact > 0) {
        acc[act.category] = (acc[act.category] || 0) + act.co2Impact;
      }
      return acc;
    },
    { transport: 0, food: 0, energy: 0, purchases: 0 }
  );
  const totalSum = totals.transport + totals.food + totals.energy + totals.purchases;
  const foodRatio = totalSum > 0 ? Math.round((totals.food / totalSum) * 100) : 42;

  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: "Greetings, Solar-Punk Summoner! 🍃 I've analyzed your consumption energies. You've successfully reduced your transport footprint compared to your historical raw logs. Would you like to consult the forest scrolls for customized energy reduction spells next?",
      time: '9:41 AM',
    },
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const presetPills = [
    "What's my biggest impact? 🥩",
    "Quick win today? ⚡",
    "Compare to last week 📈",
    "Tips for commuting 🚲",
  ];

  const handleSendMessage = (text: string) => {
    if (!text.trim() || loading) return;

    sfx.playLogSfx();

    const userTime = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const newMessages = [
      ...messages,
      {
        sender: 'user' as const,
        text,
        time: userTime,
      },
    ];
    setMessages(newMessages);
    setInputText('');
    setLoading(true);

    setTimeout(() => {
      sfx.playLevelUpSfx();
      const aiTime = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });

      let responseText = `I am consulting the ancient planetary leylines. Your current daily eco habits look favorable! Continue adding positive log spells to level up your garden.`;
      let ratioData;

      const normText = text.toLowerCase();
      if (normText.includes('impact') || normText.includes('biggest')) {
        responseText = `Scroll analysis complete! 🌟 Your Food and Diet is the biggest energy drain (${foodRatio}% of overall outputs). This is heavily shaped by animal products tracked in your ledger spells. Eating plant ingredients for code recipes twice this week mitigates roughly 8 kg of CO₂!`;
        ratioData = {
          label: 'Diet Factor',
          percent: foodRatio,
          color: '#fbbf24',
        };
      } else if (normText.includes('win') || normText.includes('today')) {
        responseText = `A magical quick win manifests! 💨 Hang your wet garments outdoors to air dry instead of using the mechanical lightning heat dryer. This saves 2.1 kg of carbon and instantly awards high XP metrics on your board!`;
      } else if (normText.includes('commuting') || normText.includes('commute')) {
        responseText = `Transportation scroll activated! 🚲 Transitioning from fossil vehicles directly to standard active human energy (biking or walking) decreases commute impact quotients by up to 90%!`;
      } else if (normText.includes('last week') || normText.includes('compare')) {
        responseText = `Splendid comparisons! 📈 Over this logged timeline, your active carbon impact is trending 14.5% below initial baseline marks. The forest guardians are extremely satisfied!`;
      } else {
        responseText = `An excellent scroll inquiry indeed! Record every minor transaction on your ledger to receive active feedback and nurture your guardian seedling spirit to absolute maturity.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: responseText,
          time: aiTime,
          categoryRatio: ratioData,
        },
      ]);
      setLoading(false);
    }, 1300);
  };

  return (
    <div className="flex flex-col h-[520px] glass-panel rounded-2xl overflow-hidden animate-fade-in shadow-md select-none">
      
      {/* Advisor Header */}
      <div className="px-6 py-4 border-b border-white/30 flex items-center justify-between bg-white/40 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500 border border-white/40 flex items-center justify-center text-xl shadow-xs">
            🧠
          </div>
          <div>
            <h1 className="font-display text-sm font-black text-slate-800 uppercase tracking-wide">Solar-Punk Chibi Sage</h1>
            <p className="text-[10px] text-emerald-600 flex items-center gap-1.5 mt-0.5 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse inline-block border border-white/50" />
              Guild Carbon Intelligence Online
            </p>
          </div>
        </div>
      </div>

      {/* Messages Feed Area */}
      <div className="flex-grow p-5 overflow-y-auto space-y-4 bg-slate-50/30">
        {messages.map((msg, idx) => {
          const isAi = msg.sender === 'ai';
          return (
            <div
              key={idx}
              className={`flex ${isAi ? 'justify-start' : 'justify-end'} max-w-full`}
            >
              <div
                className={`p-4 rounded-2xl max-w-[85%] md:max-w-[70%] border shadow-xs text-left ${
                  isAi
                    ? 'bg-white/90 border-white/60 text-slate-700'
                    : 'bg-emerald-500 border-emerald-400 text-white shadow-md'
                }`}
              >
                <p className="font-sans text-xs font-bold leading-relaxed whitespace-pre-line">
                  {msg.text}
                </p>

                {isAi && msg.categoryRatio && (
                  <div className="mt-3 p-3 bg-slate-100/60 border border-slate-200 rounded-xl flex items-center gap-3">
                    <span className="text-sm">🍛</span>
                    <div className="flex-grow space-y-1.5">
                      <div className="h-2.5 w-full neumorph-inset rounded-full overflow-hidden p-0.5">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${msg.categoryRatio.percent}%`,
                            backgroundColor: msg.categoryRatio.color,
                          }}
                        />
                      </div>
                    </div>
                    <span 
                      className="font-display text-xs font-black" 
                      style={{ color: msg.categoryRatio.color }}
                    >
                      {msg.categoryRatio.percent}%
                    </span>
                  </div>
                )}

                <span
                  className={`text-[9px] font-display font-bold block mt-1.5 ${
                    isAi ? 'text-slate-400' : 'text-emerald-100'
                  }`}
                >
                  {msg.time}
                </span>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/80 border border-white/50 p-4 rounded-2xl flex items-center gap-2.5 shadow-xs animate-pulse">
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-500" />
              <span className="font-sans text-xs font-bold text-slate-400">
                Sage is brewing solar scroll insights...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Inputs */}
      <div className="p-4 bg-white/40 border-t border-white/30 shrink-0 space-y-3">
        {/* Preset Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar select-none">
          {presetPills.map((pill, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(pill)}
              className="whitespace-nowrap px-3.5 py-1.5 bg-white/80 border border-white/50 text-slate-600 font-display text-[9px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-xs hover:bg-slate-100"
            >
              {pill}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (inputText.trim()) {
              handleSendMessage(inputText);
            }
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            id="advisor-chat-input"
            placeholder="Ask your Solarpunk Sage anything..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full neumorph-inset rounded-xl px-4 pr-12 py-3.5 text-xs font-sans font-bold outline-none focus:ring-1 focus:ring-emerald-400/50 text-slate-800 placeholder:text-slate-400 border-none"
          />
          <button
            type="submit"
            id="advisor-chat-send-btn"
            disabled={!inputText.trim() || loading}
            className="absolute right-2 bg-emerald-500 text-white w-8 h-8 rounded-lg border border-emerald-400 flex items-center justify-center hover:brightness-105 transition-all cursor-pointer disabled:bg-slate-200 disabled:cursor-not-allowed select-none"
          >
            <Send className="w-3.5 h-3.5 text-white fill-current" />
          </button>
        </form>

        <p className="text-[9px] text-center text-slate-400 font-sans font-black uppercase tracking-wider">
          Planetary scrolls are verified safe for ecological research.
        </p>
      </div>

    </div>
  );
}
