import React, { useState, useEffect } from 'react';
import { soundManager } from '../audio/soundManager';
import { Sparkles, Play, Cpu } from 'lucide-react';
import gameLogo from '../assets/images/game_logo.jpg';

interface LoadingSplashScreenProps {
  onComplete: () => void;
}

export const LoadingSplashScreen: React.FC<LoadingSplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Powering up Game Engine...');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const statuses = [
      { at: 15, text: 'Loading Hero Champions...' },
      { at: 40, text: 'Syncing Special Abilities...' },
      { at: 65, text: 'Generating Adventure Worlds...' },
      { at: 85, text: 'Calibrating Physics & Touch Controls...' },
      { at: 100, text: 'Ready! Tap to Start!' }
    ];

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(100, prev + Math.floor(Math.random() * 8) + 3);
        const match = statuses.find((s) => next >= s.at && prev < s.at);
        if (match) {
          setStatusText(match.text);
        }
        if (next >= 100) {
          clearInterval(interval);
          setIsReady(true);
          try {
            if (typeof soundManager.playPowerup === 'function') {
              soundManager.playPowerup();
            } else if (typeof soundManager.playPower === 'function') {
              soundManager.playPower('general');
            }
          } catch {
            // Audio context not initialized or locked before user gesture
          }
        }
        return next;
      });
    }, 90);

    return () => clearInterval(interval);
  }, []);

  const handleStart = () => {
    soundManager.playButtonClick();
    onComplete();
  };

  return (
    <div
      onClick={isReady ? handleStart : undefined}
      className="fixed inset-0 z-50 flex flex-col items-center justify-between px-4 py-2 sm:p-6 bg-slate-950 text-white select-none overflow-y-auto cursor-pointer"
      style={{
        paddingTop: 'max(0.75rem, env(safe-area-inset-top))',
        paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
        paddingLeft: 'max(0.75rem, env(safe-area-inset-left))',
        paddingRight: 'max(0.75rem, env(safe-area-inset-right))',
        minHeight: '100dvh'
      }}
    >
      {/* Background Animated Energy Aura */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/15 via-sky-950/40 to-slate-950 pointer-events-none" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-sky-500/10 rounded-full blur-3xl animate-pulse pointer-events-none" />

      {/* Top Banner: Team Presentation */}
      <header className="relative z-10 flex flex-col items-center text-center shrink-0 pt-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.25)]">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
          <span className="text-[11px] sm:text-xs font-black tracking-widest text-amber-300 uppercase">
            team Mr Pro PrimeX
          </span>
        </div>
        <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mt-0.5">
          Presents
        </span>
      </header>

      {/* Centerpiece: Responsive Game Logo & Developer Attribution */}
      <main className="relative z-10 flex flex-col items-center justify-center my-auto py-2 text-center max-w-sm w-full shrink-0">
        {/* Animated Glow Logo Container (Scaled to fit compact portrait viewports) */}
        <div className="relative group mb-2 sm:mb-4">
          <div className="absolute -inset-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-sky-400 blur-lg opacity-60 group-hover:opacity-90 animate-pulse transition duration-700" />
          <div className="relative w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-2xl overflow-hidden border-2 sm:border-3 border-amber-400 shadow-xl bg-slate-900 mx-auto">
            <img
              src={gameLogo}
              alt="POWER RUN Official Game Logo"
              onError={(e) => {
                e.currentTarget.src = '/assets/game_logo.jpg';
              }}
              className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>

        {/* Game Title */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-sky-400 drop-shadow-[0_2px_12px_rgba(245,158,11,0.5)] leading-tight">
          POWER RUN
        </h1>
        <p className="text-[10px] sm:text-xs font-extrabold tracking-widest text-sky-300 uppercase mb-2">
          2D Adventure Platformer
        </p>

        {/* Developer Attribution Box */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md max-w-xs">
          <Cpu className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <div className="text-left">
            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Game Developer</div>
            <div className="text-xs font-black text-white leading-tight">
              Daryakhan ABRO <span className="text-amber-400 text-[10px] font-bold block sm:inline">(team Mr Pro PrimeX)</span>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Loading Progress Bar & Ready CTA (Optimized for zero-cutoff in vertical mode) */}
      <footer className="relative z-10 w-full max-w-sm flex flex-col items-center text-center shrink-0 pb-1">
        {!isReady ? (
          <div className="w-full bg-slate-900/80 p-2.5 rounded-2xl border border-slate-800/80 backdrop-blur-xs">
            <div className="flex items-center justify-between w-full text-[11px] font-bold text-slate-300 mb-1.5">
              <span className="flex items-center gap-1.5 truncate max-w-[220px]">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
                <span className="truncate">{statusText}</span>
              </span>
              <span className="text-amber-400 tabular-nums font-mono">{progress}%</span>
            </div>

            {/* Neon Progress Bar */}
            <div className="w-full h-2.5 bg-slate-950 rounded-full p-0.5 border border-slate-800 shadow-inner overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-sky-400 rounded-full transition-all duration-150 shadow-[0_0_12px_rgba(245,158,11,0.8)]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center gap-1.5">
            <button
              onClick={handleStart}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm sm:text-base uppercase tracking-wider rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.7)] active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer border border-amber-300"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>KHELO / TAP TO START</span>
            </button>
            <span className="text-[10px] text-amber-300/80 font-bold uppercase tracking-wider animate-pulse">
              Screen par kahin bhi tap karein
            </span>
          </div>
        )}
      </footer>
    </div>
  );
};
