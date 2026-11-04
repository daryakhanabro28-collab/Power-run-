import React from 'react';
import { soundManager } from '../audio/soundManager';
import { X, Heart, Sparkles, Gamepad2, Award } from 'lucide-react';

interface AboutModalProps {
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-7 shadow-[0_0_50px_rgba(245,158,11,0.25)] text-center text-white max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={() => {
            soundManager.playButtonClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Game Logo Emblem */}
        <div className="relative w-20 h-20 mx-auto mb-3">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-amber-500 to-sky-500 blur-md opacity-50 animate-pulse" />
          <img
            src="/assets/game_logo.jpg"
            alt="POWER RUN Logo"
            className="relative w-full h-full object-cover rounded-2xl border-2 border-amber-400 shadow-xl"
          />
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Official Game Developer</span>
        </div>

        {/* Developer Name */}
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-1">
          Daryakhan ABRO
        </h2>

        {/* Team Name */}
        <p className="text-sm font-extrabold text-amber-400 tracking-wide uppercase mb-4">
          team Mr Pro PrimeX
        </p>

        {/* Clean Developer Bio Card */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 text-left space-y-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">POWER RUN</h3>
              <p className="text-xs text-slate-400">2D Adventure Platformer Mobile Game</p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-slate-900">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Lead Game Creator</h3>
              <p className="text-xs text-slate-300">Daryakhan ABRO · team Mr Pro PrimeX</p>
            </div>
          </div>
        </div>

        {/* Passion Footer */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-medium mb-5">
          <span>Developed with passion by</span>
          <span className="text-white font-bold">Daryakhan ABRO</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-current inline" />
        </div>

        <button
          onClick={() => {
            soundManager.playButtonClick();
            onClose();
          }}
          className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
        >
          Close Information
        </button>
      </div>
    </div>
  );
};
