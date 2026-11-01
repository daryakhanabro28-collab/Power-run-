import React from 'react';
import { soundManager } from '../audio/soundManager';
import { X, ShieldCheck, Heart, Sparkles, Terminal, Code2 } from 'lucide-react';

interface AboutModalProps {
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(245,158,11,0.25)] text-center text-white">
        {/* Close Button */}
        <button
          onClick={() => {
            soundManager.playButtonClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Developer Emblem */}
        <div className="relative w-24 h-24 mx-auto mb-4">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-amber-500 to-orange-500 blur-lg opacity-40 animate-pulse" />
          <div className="relative w-full h-full rounded-3xl bg-gradient-to-tr from-slate-900 to-slate-800 border-2 border-amber-400 flex flex-col items-center justify-center shadow-xl">
            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400 tracking-tighter">
              DA
            </span>
            <span className="text-[9px] font-black tracking-widest text-amber-300 uppercase">PRO</span>
          </div>
        </div>

        {/* Developer Name & Team Header */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Lead Game Creator</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-1">
          Daryakhan ABRO
        </h2>
        <p className="text-sm font-extrabold text-amber-400 tracking-wide uppercase mb-6">
          team Mr Pro PrimeX
        </p>

        {/* Info Card */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 text-left space-y-3 mb-6">
          <div className="flex items-start gap-3">
            <Code2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Project Specification</h4>
              <p className="text-xs text-slate-300">
                POWER RUN: High-octane 2D Adventure Platformer engineered with responsive physics, handcrafted boss encounters, and custom hero roster.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 pt-2 border-t border-slate-900">
            <Terminal className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Debug APK & GitHub Workflow</h4>
              <p className="text-xs text-slate-300">
                Integrated GitHub Actions pipeline (.github/workflows/build-apk.yml) for 1-click debug APK creation directly from the repository.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 pt-2 border-t border-slate-900">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Roster Champions</h4>
              <p className="text-xs text-slate-300">
                Featuring Gul Sher Abro (Titan Elephant Stomp), Shahzad Abro (Eclipse Phantom Dash), Dary, Kamran, Ali, Farhan, Zayn, and Custom Uploaded Heroes.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Credit */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-medium mb-5">
          <span>Created with passion by</span>
          <span className="text-white font-bold">Daryakhan ABRO</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-current inline" />
          <span className="text-amber-400 font-semibold">(team Mr Pro PrimeX)</span>
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
