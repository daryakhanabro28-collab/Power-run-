import React, { useEffect, useState } from 'react';
import { LevelCompleteResult } from '../game/engine';
import { soundManager } from '../audio/soundManager';
import { Star, Coins, Gem, Sparkles, Clock, ArrowRight, RotateCcw, Home, Volume2, Trophy } from 'lucide-react';

interface VictoryModalProps {
  result: LevelCompleteResult;
  onNextStage: () => void;
  onReplayStage: () => void;
  onQuitToMenu: () => void;
}

const HINDI_VICTORY_LINES = [
  { text: "Kya baat hai! Mauj kardi mere sher!", sub: "Ek dum zabardast performance!" },
  { text: "Shabash! Level clear ho gaya!", sub: "Agla stage tumhara intezar kar raha hai!" },
  { text: "Bawaal macha diya bhai! Aag laga di!", sub: "Raftaar aur style ka kamaal!" },
  { text: "Zabardast! Next level ki baari!", sub: "Aise hi aage badhte raho!" },
  { text: "Dhamaka kar diya! Tu toh champion hai!", sub: "Boss bhi thar-thar kaanpega!" },
  { text: "Jeet gaya re jeet gaya! Sikandar!", sub: "Saare coins aur taare loot liye!" }
];

export const VictoryModal: React.FC<VictoryModalProps> = ({
  result,
  onNextStage,
  onReplayStage,
  onQuitToMenu
}) => {
  const [selectedQuote] = useState(() => {
    return HINDI_VICTORY_LINES[Math.floor(Math.random() * HINDI_VICTORY_LINES.length)];
  });

  useEffect(() => {
    // Speak celebratory Hindi voice
    soundManager.speakHindi(selectedQuote.text);
  }, [selectedQuote]);

  const handleReplayVoice = () => {
    soundManager.playVictory();
    soundManager.speakHindi(selectedQuote.text);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md select-none animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-900 to-amber-950/60 border-2 border-amber-500/60 rounded-3xl p-6 sm:p-7 shadow-[0_0_50px_rgba(245,158,11,0.35)] text-center text-white">
        
        {/* Star Rating Animation */}
        <div className="flex items-center justify-center gap-2 mb-3">
          {[1, 2, 3].map((star) => (
            <div
              key={star}
              className={`transform transition-all duration-500 ${
                star <= result.starsEarned
                  ? 'scale-110 drop-shadow-[0_0_18px_rgba(245,158,11,0.9)] animate-pulse'
                  : 'opacity-30 scale-90'
              }`}
            >
              <Star
                className={`w-12 h-12 ${
                  star <= result.starsEarned ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
                }`}
              />
            </div>
          ))}
        </div>

        {/* Comic Style Romanized Hindi Celebratory Dialogue Box */}
        <div className="relative p-4 rounded-2xl bg-gradient-to-r from-amber-950/80 via-yellow-900/60 to-amber-950/80 border-2 border-amber-400 shadow-xl mb-4 transform hover:scale-[1.02] transition-transform">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber-500 text-[10px] font-black uppercase tracking-wider text-slate-950 flex items-center gap-1 shadow-sm">
            <Trophy className="w-3 h-3" />
            <span>Hindi Commentary</span>
          </div>

          <p className="text-lg sm:text-xl font-black text-amber-300 uppercase tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] mt-1">
            "{selectedQuote.text}"
          </p>
          <p className="text-xs text-amber-200/80 font-semibold mt-1">
            {selectedQuote.sub}
          </p>

          <button
            onClick={handleReplayVoice}
            className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-white rounded-lg text-[11px] font-bold border border-amber-400/40 transition-colors cursor-pointer"
            title="Suno Hindi Voice"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Suno Dialogue 🔊</span>
          </button>
        </div>

        <h2 className="text-2xl font-black mb-1 tracking-tight text-white uppercase">Stage Cleared!</h2>
        <p className="text-xs text-amber-400 font-bold uppercase tracking-wider mb-5">
          Score: {result.score.toLocaleString()} PTS
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5 text-left">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/50 border border-slate-800">
            <Coins className="w-5 h-5 text-amber-400 fill-amber-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">Coins Found</span>
              <span className="font-bold text-white text-sm tabular-nums">
                {result.coinsCollected} / {result.totalCoinsInLevel}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/50 border border-slate-800">
            <Gem className="w-5 h-5 text-sky-400 fill-sky-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">Rare Gems</span>
              <span className="font-bold text-white text-sm tabular-nums">+{result.gemsCollected}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/50 border border-slate-800">
            <Clock className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">Clear Time</span>
              <span className="font-bold text-white text-sm tabular-nums">{result.timeTakenSeconds}s</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/50 border border-slate-800">
            <Sparkles className="w-5 h-5 text-purple-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">Hero Fragments</span>
              <span className="font-bold text-white text-sm tabular-nums">+{result.characterFragmentsFound}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onNextStage();
            }}
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all cursor-pointer active:scale-98"
          >
            <span>Next Stage (Agla Level)</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                soundManager.playButtonClick();
                onReplayStage();
              }}
              className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Replay</span>
            </button>

            <button
              onClick={() => {
                soundManager.playButtonClick();
                onQuitToMenu();
              }}
              className="py-2.5 bg-slate-950/80 hover:bg-slate-900 text-slate-400 hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl border border-slate-800 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Menu</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
