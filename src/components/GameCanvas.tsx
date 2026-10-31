import React, { useEffect, useRef, useState } from 'react';
import { Character, LevelConfig } from '../types/game';
import { GameEngine, LevelCompleteResult } from '../game/engine';
import { soundManager } from '../audio/soundManager';
import { Heart, Coins, Gem, Zap, Pause, ArrowLeft, ArrowRight, ArrowUp, ArrowDown } from 'lucide-react';

interface GameCanvasProps {
  character: Character;
  level: LevelConfig;
  onLevelComplete: (result: LevelCompleteResult) => void;
  onGameOver: () => void;
  onPause: () => void;
  touchControlsVisible: boolean;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  character,
  level,
  onLevelComplete,
  onGameOver,
  onPause,
  touchControlsVisible
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [health, setHealth] = useState(3);
  const [maxHealth] = useState(3);
  const [coins, setCoins] = useState(0);
  const [gems, setGems] = useState(0);
  const [powerReady, setPowerReady] = useState(true);
  const [powerCooldownPercent, setPowerCooldownPercent] = useState(100);
  const [powerActive, setPowerActive] = useState(false);
  const [isPortrait, setIsPortrait] = useState(() => window.innerHeight > window.innerWidth);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Responsive canvas dimensions
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      setIsPortrait(window.innerHeight > window.innerWidth);
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const engine = new GameEngine(canvas, character, level, {
      onCoinCollected: (c) => setCoins(c),
      onGemCollected: (g) => setGems(g),
      onHealthChanged: (h) => setHealth(h),
      onSuperpowerChanged: (ready, percent, active) => {
        setPowerReady(ready);
        setPowerCooldownPercent(percent);
        setPowerActive(active);
      },
      onLevelComplete: (result) => onLevelComplete(result),
      onGameOver: () => onGameOver()
    });

    engineRef.current = engine;
    engine.start();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      engine.destroy();
    };
  }, [character, level, onLevelComplete, onGameOver]);

  // Touch handlers
  const handleTouchStart = (control: 'left' | 'right' | 'jump' | 'slide' | 'power') => {
    if (engineRef.current) {
      engineRef.current.touchInputs[control] = true;
      if (control === 'power') {
        engineRef.current.triggerSuperpower();
      }
    }
  };

  const handleTouchEnd = (control: 'left' | 'right' | 'jump' | 'slide' | 'power') => {
    if (engineRef.current) {
      engineRef.current.touchInputs[control] = false;
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 select-none">
      {/* 60fps Game Viewport Canvas */}
      <canvas ref={canvasRef} className="w-full h-full block cursor-crosshair" />

      {/* Low-Occlusion HUD Overlay */}
      <div className="absolute top-0 left-0 right-0 p-4 md:p-6 pointer-events-none flex items-center justify-between z-20">
        {/* Left: Health & Hero Profile */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-700/60 rounded-xl px-3 py-1.5 backdrop-blur-xs">
            {Array.from({ length: maxHealth }).map((_, i) => (
              <Heart
                key={i}
                className={`w-6 h-6 transition-all ${
                  i < health
                    ? 'text-rose-500 fill-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]'
                    : 'text-slate-600 fill-slate-800'
                }`}
              />
            ))}
          </div>

          <div className="hidden sm:flex items-center gap-2 bg-slate-900/80 border border-slate-700/60 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-200">
            <span className="text-amber-400">{character.name}</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-400">Level {level.id}</span>
          </div>
        </div>

        {/* Right: Currency Counters & Pause Button */}
        <div className="flex items-center gap-3">
          {/* Coins */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 border border-amber-500/40 rounded-xl px-3 py-1.5 text-amber-400 font-bold tabular-nums text-sm">
            <Coins className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>{coins}</span>
          </div>

          {/* Gems */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 border border-sky-500/40 rounded-xl px-3 py-1.5 text-sky-400 font-bold tabular-nums text-sm">
            <Gem className="w-4 h-4 text-sky-400 fill-sky-400" />
            <span>{gems}</span>
          </div>

          {/* Pause Button */}
          <button
            onClick={() => {
              soundManager.playButtonClick();
              if (engineRef.current) engineRef.current.pause();
              onPause();
            }}
            className="pointer-events-auto p-2 bg-slate-900/90 border border-slate-700/80 hover:bg-slate-800 rounded-xl text-slate-300 hover:text-white transition-all active:scale-95 shadow-md"
            aria-label="Pause Game"
          >
            <Pause className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Landscape Orientation Advisory for Mobile */}
      {isPortrait && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 px-4 py-2 bg-slate-900/90 border border-sky-400 text-sky-200 text-xs font-bold rounded-2xl shadow-xl flex items-center gap-2 pointer-events-none animate-pulse">
          <span>🔄</span>
          <span>Rotate phone to Landscape for wide arcade view</span>
        </div>
      )}

      {/* Superpower Active Banner */}
      {powerActive && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-amber-500/90 border border-amber-300 text-slate-950 font-black tracking-wide text-xs uppercase rounded-full shadow-[0_0_20px_rgba(245,158,11,0.6)] animate-pulse pointer-events-none">
          ⚡ {character.powerName} Active!
        </div>
      )}

      {/* Mobile Touch Controls Overlay */}
      {touchControlsVisible && (
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-end p-4 md:p-8 z-30">
          <div className="flex items-end justify-between w-full">
            {/* Left Hand: D-Pad (Left / Right) */}
            <div className="flex items-center gap-2 pointer-events-auto">
              <button
                onTouchStart={() => handleTouchStart('left')}
                onTouchEnd={() => handleTouchEnd('left')}
                onMouseDown={() => handleTouchStart('left')}
                onMouseUp={() => handleTouchEnd('left')}
                className="w-16 h-16 rounded-2xl bg-slate-900/75 border-2 border-slate-700 text-white flex items-center justify-center active:bg-slate-700 active:scale-90 transition-all shadow-xl backdrop-blur-xs select-none touch-none"
              >
                <ArrowLeft className="w-8 h-8" />
              </button>
              <button
                onTouchStart={() => handleTouchStart('right')}
                onTouchEnd={() => handleTouchEnd('right')}
                onMouseDown={() => handleTouchStart('right')}
                onMouseUp={() => handleTouchEnd('right')}
                className="w-16 h-16 rounded-2xl bg-slate-900/75 border-2 border-slate-700 text-white flex items-center justify-center active:bg-slate-700 active:scale-90 transition-all shadow-xl backdrop-blur-xs select-none touch-none"
              >
                <ArrowRight className="w-8 h-8" />
              </button>
            </div>

            {/* Right Hand: Action Buttons (Slide, Power, Jump) */}
            <div className="flex items-center gap-3 pointer-events-auto">
              {/* Slide Button */}
              <button
                onTouchStart={() => handleTouchStart('slide')}
                onTouchEnd={() => handleTouchEnd('slide')}
                onMouseDown={() => handleTouchStart('slide')}
                onMouseUp={() => handleTouchEnd('slide')}
                className="w-15 h-15 rounded-2xl bg-slate-900/80 border-2 border-emerald-600/70 text-emerald-400 flex flex-col items-center justify-center active:bg-emerald-800/40 active:scale-90 transition-all shadow-xl backdrop-blur-xs select-none touch-none"
              >
                <ArrowDown className="w-6 h-6" />
                <span className="text-[10px] font-black uppercase tracking-tighter">Slide</span>
              </button>

              {/* Superpower Button */}
              <button
                onTouchStart={() => handleTouchStart('power')}
                onTouchEnd={() => handleTouchEnd('power')}
                onMouseDown={() => handleTouchStart('power')}
                onMouseUp={() => handleTouchEnd('power')}
                disabled={!powerReady && !powerActive}
                className={`relative w-16 h-16 rounded-2xl border-2 flex flex-col items-center justify-center active:scale-90 transition-all shadow-xl select-none touch-none ${
                  powerActive
                    ? 'bg-amber-500 border-yellow-200 text-slate-950 animate-pulse'
                    : powerReady
                    ? 'bg-amber-600/80 border-amber-400 text-amber-100 hover:bg-amber-500'
                    : 'bg-slate-900/60 border-slate-800 text-slate-500'
                }`}
              >
                <Zap className="w-7 h-7 fill-current" />
                <span className="text-[9px] font-black uppercase tracking-tighter">Power</span>
                {!powerReady && (
                  <div
                    className="absolute inset-0 bg-slate-950/70 rounded-2xl flex items-center justify-center text-xs font-bold text-amber-400"
                    style={{ clipPath: `inset(${100 - powerCooldownPercent}% 0 0 0)` }}
                  />
                )}
              </button>

              {/* Jump Button (Largest) */}
              <button
                onTouchStart={() => handleTouchStart('jump')}
                onTouchEnd={() => handleTouchEnd('jump')}
                onMouseDown={() => handleTouchStart('jump')}
                onMouseUp={() => handleTouchEnd('jump')}
                className="w-18 h-18 rounded-2xl bg-blue-600/90 border-2 border-blue-400 text-white flex flex-col items-center justify-center active:bg-blue-700 active:scale-90 transition-all shadow-2xl backdrop-blur-xs select-none touch-none"
              >
                <ArrowUp className="w-8 h-8 stroke-[3]" />
                <span className="text-[10px] font-black uppercase tracking-wider">Jump</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
