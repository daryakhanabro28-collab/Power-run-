import React from 'react';
import { soundManager } from '../audio/soundManager';
import { Play, RotateCcw, Home } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onQuitToMenu: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onQuitToMenu
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-center text-white">
        <h2 className="text-2xl font-black mb-1 tracking-tight">Mission Paused</h2>
        <p className="text-xs text-slate-400 mb-6">Take a breath, runner!</p>

        <div className="space-y-3">
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onResume();
            }}
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Resume Run</span>
          </button>

          <button
            onClick={() => {
              soundManager.playButtonClick();
              onRestart();
            }}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restart Stage</span>
          </button>

          <button
            onClick={() => {
              soundManager.playButtonClick();
              onQuitToMenu();
            }}
            className="w-full py-3 bg-slate-950/60 hover:bg-slate-900 text-slate-400 hover:text-white font-bold text-xs uppercase tracking-wider rounded-2xl border border-slate-800 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Main Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
