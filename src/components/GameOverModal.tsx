import React, { useEffect, useState } from 'react';
import { soundManager } from '../audio/soundManager';
import { RotateCcw, Home, Skull, Volume2, Flame } from 'lucide-react';

interface GameOverModalProps {
  onRetry: () => void;
  onQuitToMenu: () => void;
}

const HINDI_DEATH_LINES = [
  { text: "Arrey yaar! Gir gaya! Khel khatam!", sub: "Dhyaan se jump maaro mere bhai!" },
  { text: "Khatam! Tata bye-bye! Bach ke chalo!", sub: "Hazards se door rehna tha!" },
  { text: "Oh bhai! Dekh ke jump karo!", sub: "Thoda timing ka chakkar hai!" },
  { text: "Arey mori maiya! Ye kya ho gaya!", sub: "Monster ne dhar liya!" },
  { text: "Himmat mat haar mere sher! Dobara koshish!", sub: "Ek aur baari, abki baar jeet!" },
  { text: "Lag gaye 440 volt! Savdhaan raho!", sub: "Spikes aur traps se hoshiyaar!" }
];

export const GameOverModal: React.FC<GameOverModalProps> = ({
  onRetry,
  onQuitToMenu
}) => {
  const [selectedQuote] = useState(() => {
    return HINDI_DEATH_LINES[Math.floor(Math.random() * HINDI_DEATH_LINES.length)];
  });

  useEffect(() => {
    // Speak Hindi voice on defeat
    soundManager.speakHindi(selectedQuote.text);
  }, [selectedQuote]);

  const handleReplayVoice = () => {
    soundManager.playGameOver();
    soundManager.speakHindi(selectedQuote.text);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md select-none animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-900 to-rose-950/70 border-2 border-rose-500/60 rounded-3xl p-6 sm:p-7 shadow-[0_0_50px_rgba(244,63,94,0.35)] text-center text-white">
        
        {/* Animated Shockwave Pulsing Skull */}
        <div className="relative w-20 h-20 mx-auto mb-4">
          <div className="absolute inset-0 rounded-3xl bg-rose-500/20 animate-ping opacity-60" />
          <div className="relative w-full h-full rounded-3xl bg-rose-500/20 border-2 border-rose-500/60 flex items-center justify-center text-rose-500 shadow-lg shadow-rose-950/50">
            <Skull className="w-10 h-10 animate-bounce" />
          </div>
        </div>

        {/* Comic Style Romanized Hindi Dialogue Box */}
        <div className="relative p-4 rounded-2xl bg-gradient-to-r from-rose-950/80 via-red-900/60 to-rose-950/80 border-2 border-rose-400 shadow-xl mb-5 transform hover:scale-[1.02] transition-transform">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-rose-600 text-[10px] font-black uppercase tracking-wider text-white flex items-center gap-1 shadow-sm">
            <Flame className="w-3 h-3 text-amber-300" />
            <span>Hindi Commentary</span>
          </div>

          <p className="text-lg sm:text-xl font-black text-rose-200 uppercase tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] mt-1">
            "{selectedQuote.text}"
          </p>
          <p className="text-xs text-rose-300/80 font-semibold mt-1">
            {selectedQuote.sub}
          </p>

          <button
            onClick={handleReplayVoice}
            className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 bg-rose-800/60 hover:bg-rose-700 text-rose-200 hover:text-white rounded-lg text-[11px] font-bold border border-rose-400/40 transition-colors cursor-pointer"
            title="Suno Hindi Voice"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Suno Dialogue 🔊</span>
          </button>
        </div>

        <h2 className="text-2xl font-black mb-1 tracking-tight text-white uppercase">Stage Defeated</h2>
        <p className="text-xs text-slate-400 mb-6">Health khatam ho gayi! Himmat mat haaro.</p>

        <div className="space-y-3">
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onRetry();
            }}
            className="w-full py-3.5 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-400 hover:to-orange-400 text-white font-black text-sm uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-rose-900/40 transition-all cursor-pointer active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again (Dobara Koshish)</span>
          </button>

          <button
            onClick={() => {
              soundManager.playButtonClick();
              onQuitToMenu();
            }}
            className="w-full py-3 bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 border border-slate-700 transition-all cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Return to Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
