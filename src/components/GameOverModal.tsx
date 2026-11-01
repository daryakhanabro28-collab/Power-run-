import React, { useState } from 'react';
import { soundManager } from '../audio/soundManager';
import { RotateCcw, Home, Skull, Flame } from 'lucide-react';

interface GameOverModalProps {
  onRetry: () => void;
  onQuitToMenu: () => void;
}

const HINDI_DEATH_LINES = [
  "KHEL KHATAM! ARREY YAAR GIR GAYA!",
  "KHATAM! TATA BYE-BYE! SAVDHAAN RAHO!",
  "AREY MORI MAIYA! YE KYA HO GAYA!",
  "OH BHAI! DEKH KE JUMP KARO!",
  "HIMMAT MAT HAAR MERE SHER! DOBARA KOSHISH!",
  "LAG GAYE 440 VOLT! DEKH KE CHALO!"
];

export const GameOverModal: React.FC<GameOverModalProps> = ({
  onRetry,
  onQuitToMenu
}) => {
  const [selectedQuote] = useState(() => {
    return HINDI_DEATH_LINES[Math.floor(Math.random() * HINDI_DEATH_LINES.length)];
  });

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

        {/* Clean Comic Romanized Hindi Banner (No spoken dialogues) */}
        <div className="relative p-4 rounded-2xl bg-gradient-to-r from-rose-950/90 via-red-900/70 to-rose-950/90 border-2 border-rose-400 shadow-xl mb-5">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-rose-600 text-[10px] font-black uppercase tracking-wider text-white flex items-center gap-1 shadow-sm">
            <Flame className="w-3 h-3 text-amber-300" />
            <span>ALERT</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-rose-100 uppercase tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] mt-1 animate-pulse">
            "{selectedQuote}"
          </h3>
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
