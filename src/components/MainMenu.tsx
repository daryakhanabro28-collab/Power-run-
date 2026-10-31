import React from 'react';
import { Character, GameStats } from '../types/game';
import { soundManager } from '../audio/soundManager';
import { Play, Users, Map, Trophy, ArrowUpCircle, ShoppingBag, Settings, Coins, Gem, Zap } from 'lucide-react';

interface MainMenuProps {
  selectedCharacter: Character;
  coins: number;
  gems: number;
  stats: GameStats;
  onPlayClick: () => void;
  onNavigate: (view: 'CHARACTER_ROSTER' | 'WORLD_SELECT' | 'MISSIONS' | 'UPGRADES' | 'SHOP' | 'SETTINGS') => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  selectedCharacter,
  coins,
  gems,
  stats,
  onPlayClick,
  onNavigate
}) => {
  return (
    <div className="relative w-screen h-screen flex flex-col justify-between overflow-hidden bg-slate-950 text-white select-none">
      {/* Background Animated Gradient & Particle Canvas Simulation */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-950/60 via-slate-950 to-slate-950 pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar: Currency & Stats */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 border-b border-slate-800/80 bg-slate-950/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center font-black text-slate-950 shadow-md">
            PR
          </div>
          <div>
            <span className="font-extrabold tracking-tight text-white text-base">POWER RUN</span>
            <div className="text-[11px] text-slate-400 font-medium">Level {stats.playerLevel} Runner</div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Coins */}
          <div className="flex items-center gap-2 bg-slate-900/90 border border-amber-500/30 rounded-xl px-3.5 py-1.5 shadow-xs">
            <Coins className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="font-bold text-amber-300 tabular-nums text-sm">{coins.toLocaleString()}</span>
          </div>

          {/* Gems */}
          <div className="flex items-center gap-2 bg-slate-900/90 border border-sky-500/30 rounded-xl px-3.5 py-1.5 shadow-xs">
            <Gem className="w-4 h-4 text-sky-400 fill-sky-400" />
            <span className="font-bold text-sky-300 tabular-nums text-sm">{gems.toLocaleString()}</span>
          </div>

          {/* Settings button */}
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onNavigate('SETTINGS');
            }}
            className="p-2 bg-slate-900/80 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl transition-colors cursor-pointer"
            aria-label="Game Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Centerpiece: Bespoke Title Lockup & Hero Character Showcase */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-4 max-w-5xl mx-auto w-full text-center">
        {/* Bespoke Inline SVG Logo */}
        <div className="mb-6 transform hover:scale-102 transition-transform duration-300">
          <svg viewBox="0 0 540 110" className="w-72 sm:w-96 md:w-110 h-auto drop-shadow-[0_0_35px_rgba(56,189,248,0.35)]">
            <defs>
              <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="50%" stopColor="#EF4444" />
                <stop offset="100%" stopColor="#38BDF8" />
              </linearGradient>
            </defs>
            <text
              x="50%"
              y="75"
              textAnchor="middle"
              className="font-black italic tracking-tighter"
              fill="url(#logoGrad)"
              fontSize="74"
              stroke="#0F172A"
              strokeWidth="6"
              paintOrder="stroke fill"
            >
              POWER RUN
            </text>
          </svg>
          <p className="text-xs sm:text-sm font-semibold tracking-widest text-sky-300/80 uppercase">
            2D Adventure Platformer
          </p>
        </div>

        {/* Selected Character Centerpiece Card */}
        <div className="flex flex-col sm:flex-row items-center gap-6 bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 sm:p-6 mb-7 shadow-2xl backdrop-blur-xs max-w-xl w-full">
          {/* Avatar Photo Frame with Rarity Glow */}
          <div className="relative group shrink-0">
            <div
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-3 shadow-xl bg-slate-800 flex items-center justify-center relative"
              style={{ borderColor: selectedCharacter.accentColor }}
            >
              <img
                src={selectedCharacter.photoUrl}
                alt={selectedCharacter.name}
                className="w-full h-full object-cover object-top"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
            </div>
            <span
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-slate-950 shadow-md"
              style={{ backgroundColor: selectedCharacter.accentColor }}
            >
              {selectedCharacter.rarity}
            </span>
          </div>

          {/* Character Details & Superpower */}
          <div className="text-center sm:text-left flex-1 min-w-0">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
              <h2 className="text-xl sm:text-2xl font-black text-white truncate">{selectedCharacter.name}</h2>
              <span className="text-xs text-slate-400 font-medium">({selectedCharacter.title})</span>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-amber-400 font-semibold mb-2">
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>{selectedCharacter.powerName}</span>
            </div>

            <p className="text-xs text-slate-300 line-clamp-2 mb-3">
              {selectedCharacter.powerDescription}
            </p>

            <button
              onClick={() => {
                soundManager.playButtonClick();
                onNavigate('CHARACTER_ROSTER');
              }}
              className="text-xs font-semibold text-sky-400 hover:text-sky-300 underline underline-offset-4 cursor-pointer"
            >
              Select Hero Crew →
            </button>
          </div>
        </div>

        {/* Primary Start CTA Button */}
        <button
          onClick={() => {
            soundManager.playButtonClick();
            onPlayClick();
          }}
          className="group relative inline-flex items-center justify-center gap-3 px-10 py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-lg uppercase tracking-wider rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.4)] hover:shadow-[0_0_40px_rgba(245,158,11,0.6)] transform hover:-translate-y-0.5 active:translate-y-0 active:scale-98 transition-all cursor-pointer"
        >
          <Play className="w-6 h-6 fill-current transition-transform group-hover:scale-115" />
          <span>Play Adventure</span>
        </button>

        {/* Flat Control Hints */}
        <p className="mt-4 text-xs text-slate-400 font-medium">
          A/D or Arrows to Run · W / Space to Jump · S to Slide · E for Superpower
        </p>
      </main>

      {/* Bottom Navigation Grid */}
      <nav className="relative z-10 grid grid-cols-5 gap-2 px-4 py-3 bg-slate-900/90 border-t border-slate-800 backdrop-blur-md max-w-4xl mx-auto w-full rounded-t-2xl">
        <button
          onClick={() => {
            soundManager.playButtonClick();
            onNavigate('CHARACTER_ROSTER');
          }}
          className="flex flex-col items-center justify-center py-2 px-1 text-slate-300 hover:text-amber-400 hover:bg-slate-800/60 rounded-xl transition-all cursor-pointer"
        >
          <Users className="w-5 h-5 mb-1" />
          <span className="text-[11px] font-semibold whitespace-nowrap">Roster</span>
        </button>

        <button
          onClick={() => {
            soundManager.playButtonClick();
            onNavigate('WORLD_SELECT');
          }}
          className="flex flex-col items-center justify-center py-2 px-1 text-slate-300 hover:text-sky-400 hover:bg-slate-800/60 rounded-xl transition-all cursor-pointer"
        >
          <Map className="w-5 h-5 mb-1" />
          <span className="text-[11px] font-semibold whitespace-nowrap">Worlds</span>
        </button>

        <button
          onClick={() => {
            soundManager.playButtonClick();
            onNavigate('UPGRADES');
          }}
          className="flex flex-col items-center justify-center py-2 px-1 text-slate-300 hover:text-emerald-400 hover:bg-slate-800/60 rounded-xl transition-all cursor-pointer"
        >
          <ArrowUpCircle className="w-5 h-5 mb-1" />
          <span className="text-[11px] font-semibold whitespace-nowrap">Upgrades</span>
        </button>

        <button
          onClick={() => {
            soundManager.playButtonClick();
            onNavigate('MISSIONS');
          }}
          className="flex flex-col items-center justify-center py-2 px-1 text-slate-300 hover:text-purple-400 hover:bg-slate-800/60 rounded-xl transition-all cursor-pointer"
        >
          <Trophy className="w-5 h-5 mb-1" />
          <span className="text-[11px] font-semibold whitespace-nowrap">Missions</span>
        </button>

        <button
          onClick={() => {
            soundManager.playButtonClick();
            onNavigate('SHOP');
          }}
          className="flex flex-col items-center justify-center py-2 px-1 text-slate-300 hover:text-rose-400 hover:bg-slate-800/60 rounded-xl transition-all cursor-pointer"
        >
          <ShoppingBag className="w-5 h-5 mb-1" />
          <span className="text-[11px] font-semibold whitespace-nowrap">Shop</span>
        </button>
      </nav>
    </div>
  );
};
