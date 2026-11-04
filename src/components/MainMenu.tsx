import React, { useState } from 'react';
import { Character, GameStats } from '../types/game';
import { soundManager } from '../audio/soundManager';
import {
  Play,
  Users,
  Map,
  Trophy,
  ArrowUpCircle,
  ShoppingBag,
  Settings,
  Coins,
  Gem,
  Zap,
  RotateCcw,
  Sparkles,
  UserPlus
} from 'lucide-react';

interface MainMenuProps {
  selectedCharacter: Character;
  coins: number;
  gems: number;
  stats: GameStats;
  onPlayClick: () => void;
  onAboutClick: () => void;
  onCreateCustomClick?: () => void;
  onNavigate: (view: 'CHARACTER_ROSTER' | 'WORLD_SELECT' | 'MISSIONS' | 'UPGRADES' | 'SHOP' | 'SETTINGS') => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  selectedCharacter,
  coins,
  gems,
  stats,
  onPlayClick,
  onAboutClick,
  onCreateCustomClick,
  onNavigate
}) => {
  const [rotateNotice, setRotateNotice] = useState(false);

  const handleToggleRotate = async () => {
    soundManager.playButtonClick();
    try {
      if (document.fullscreenElement) {
        if (screen.orientation && 'unlock' in screen.orientation) {
          screen.orientation.unlock();
        }
        await document.exitFullscreen().catch(() => {});
      } else {
        await document.documentElement.requestFullscreen().catch(() => {});
        if (screen.orientation && 'lock' in screen.orientation) {
          // Try locking to landscape or sensor
          await (screen.orientation as any).lock('landscape').catch(() => {});
        }
      }
    } catch {
      // Fallback notification
      setRotateNotice(true);
      setTimeout(() => setRotateNotice(false), 3000);
    }
  };

  return (
    <div
      className="relative w-screen h-screen flex flex-col justify-between overflow-y-auto overflow-x-hidden bg-slate-950 text-white select-none"
      style={{
        paddingLeft: 'max(0.75rem, env(safe-area-inset-left))',
        paddingRight: 'max(0.75rem, env(safe-area-inset-right))',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}
    >
      {/* Background Animated Gradient & Particle Canvas Simulation */}
      <div className="fixed inset-0 bg-gradient-to-b from-sky-950/60 via-slate-950 to-slate-950 pointer-events-none" />
      <div className="fixed -top-32 -left-32 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed -bottom-32 -right-32 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar: Compact Currency & Stats */}
      <header className="relative z-10 flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden border border-amber-400 shadow-md shrink-0">
            <img src="/assets/game_logo.jpg" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black tracking-tight text-white text-sm sm:text-base">POWER RUN</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.5 rounded-sm border border-amber-500/30">
                Lv.{stats.playerLevel}
              </span>
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-400 font-medium">2D Platformer</div>
          </div>
        </div>

        {/* Developer Attribution Pill */}
        <button
          onClick={() => {
            soundManager.playButtonClick();
            onAboutClick();
          }}
          className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1 rounded-full bg-slate-900/90 border border-amber-500/40 hover:border-amber-400 hover:bg-slate-800 transition-all cursor-pointer shadow-xs"
          title="About Developer & Team"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
          <span className="text-[10px] sm:text-[11px] text-slate-300 font-semibold truncate max-w-[120px] sm:max-w-none">
            Dev: <strong className="text-amber-400 font-extrabold">Daryakhan ABRO</strong>
          </span>
          <span className="hidden sm:inline text-[9px] text-slate-400 font-bold uppercase">(team Mr Pro PrimeX)</span>
        </button>

        {/* Right HUD: Coins, Gems, Rotate Screen & Settings */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Coins */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-amber-500/30 rounded-xl px-2.5 py-1 shadow-xs">
            <Coins className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="font-bold text-amber-300 tabular-nums text-xs sm:text-sm">{coins.toLocaleString()}</span>
          </div>

          {/* Gems */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-sky-500/30 rounded-xl px-2.5 py-1 shadow-xs">
            <Gem className="w-3.5 h-3.5 text-sky-400 fill-sky-400" />
            <span className="font-bold text-sky-300 tabular-nums text-xs sm:text-sm">{gems.toLocaleString()}</span>
          </div>

          {/* Screen Rotate / Fullscreen Helper Button */}
          <button
            onClick={handleToggleRotate}
            className="p-1.5 sm:p-2 bg-slate-900/80 border border-slate-700 hover:border-sky-400 text-sky-300 hover:text-white rounded-xl transition-colors cursor-pointer"
            title="Rotate Screen / Fullscreen Mode"
            aria-label="Rotate Screen"
          >
            <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Settings button */}
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onNavigate('SETTINGS');
            }}
            className="p-1.5 sm:p-2 bg-slate-900/80 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl transition-colors cursor-pointer"
            aria-label="Game Settings"
          >
            <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </header>

      {/* Rotate Screen Notification Toast if triggered */}
      {rotateNotice && (
        <div className="relative z-20 mx-auto mt-2 px-4 py-1.5 rounded-full bg-sky-500/20 border border-sky-400 text-sky-300 text-xs font-bold animate-in fade-in">
          📱 Auto-Rotate Enabled! Turn your phone to switch between Portrait & Landscape.
        </div>
      )}

      {/* Main Content Area: Responsive Arcade Grid (Optimized for Mobile Portrait & Landscape) */}
      <main className="relative z-10 flex-1 flex flex-col justify-center items-center px-3 sm:px-6 py-1 sm:py-2 max-w-5xl mx-auto w-full min-h-0">
        <div className="w-full flex flex-col md:grid md:grid-cols-12 gap-2 sm:gap-4 items-center my-auto">
          
          {/* Main Action Section: Logo, Giant PLAY Button & Quick Badges (Appears on top in portrait) */}
          <div className="order-1 md:order-2 md:col-span-7 w-full flex flex-col items-center justify-center text-center">
            {/* Game Logo & Title Header */}
            <div className="flex items-center justify-center gap-2.5 sm:gap-3 mb-1 sm:mb-2">
              <div className="relative w-10 h-10 sm:w-14 sm:h-14 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-md bg-slate-900 shrink-0">
                <img
                  src="/assets/game_logo.jpg"
                  alt="POWER RUN"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-left">
                <h1 className="text-xl sm:text-3xl md:text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-sky-400 drop-shadow-[0_2px_10px_rgba(245,158,11,0.5)] leading-none">
                  POWER RUN
                </h1>
                <p className="text-[9px] sm:text-[11px] font-extrabold tracking-widest text-sky-300 uppercase mt-0.5">
                  2D Adventure Platformer
                </p>
              </div>
            </div>

            {/* 🔥 PROMINENT PLAY BUTTON - ALWAYS VISIBLE IN PORTRAIT & LANDSCAPE */}
            <button
              onClick={() => {
                soundManager.playButtonClick();
                onPlayClick();
              }}
              className="group relative w-full max-w-md py-3 sm:py-4 px-6 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-base sm:text-xl uppercase tracking-wider rounded-2xl shadow-[0_0_28px_rgba(245,158,11,0.6)] hover:shadow-[0_0_38px_rgba(245,158,11,0.8)] active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2.5 my-1 sm:my-2 border border-amber-300"
            >
              <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-current transition-transform group-hover:scale-110" />
              <span>PLAY ADVENTURE / KHELO</span>
              <Sparkles className="w-4 h-4 fill-current opacity-80" />
            </button>

            {/* Quick Action Badges Under Play Button (Grid format to prevent overflowing) */}
            <div className="grid grid-cols-4 gap-1 sm:gap-2 w-full max-w-md mt-0.5 sm:mt-1">
              <button
                onClick={() => {
                  soundManager.playButtonClick();
                  onNavigate('WORLD_SELECT');
                }}
                className="py-1 px-1 rounded-xl bg-slate-900/90 border border-sky-500/40 hover:border-sky-400 text-sky-300 text-[10px] sm:text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1 transition-all cursor-pointer truncate"
              >
                <Map className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                <span className="truncate">Levels</span>
              </button>

              <button
                onClick={() => {
                  soundManager.playButtonClick();
                  onNavigate('CHARACTER_ROSTER');
                }}
                className="py-1 px-1 rounded-xl bg-slate-900/90 border border-amber-500/40 hover:border-amber-400 text-amber-300 text-[10px] sm:text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1 transition-all cursor-pointer truncate"
              >
                <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                <span className="truncate">Crew</span>
              </button>

              <button
                onClick={() => {
                  soundManager.playButtonClick();
                  onNavigate('UPGRADES');
                }}
                className="py-1 px-1 rounded-xl bg-slate-900/90 border border-emerald-500/40 hover:border-emerald-400 text-emerald-300 text-[10px] sm:text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1 transition-all cursor-pointer truncate"
              >
                <ArrowUpCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                <span className="truncate">Powers</span>
              </button>

              <button
                onClick={() => {
                  soundManager.playButtonClick();
                  onAboutClick();
                }}
                className="py-1 px-1 rounded-xl bg-slate-900/90 border border-purple-500/40 hover:border-purple-400 text-purple-300 text-[10px] sm:text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1 transition-all cursor-pointer truncate"
              >
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                <span className="truncate">Credits</span>
              </button>
            </div>
          </div>

          {/* Selected Hero Showcase (Appears below Play in portrait, left column in landscape) */}
          <div className="order-2 md:order-1 md:col-span-5 w-full bg-slate-900/80 border border-slate-800/90 rounded-2xl p-2.5 sm:p-3.5 shadow-lg backdrop-blur-xs flex items-center gap-2.5 sm:gap-3.5">
            {/* Avatar Photo Frame with Rarity Glow */}
            <div className="relative shrink-0">
              <div
                className="w-13 h-13 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 shadow-lg bg-slate-800 flex items-center justify-center relative"
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
                className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-slate-950 shadow-md whitespace-nowrap"
                style={{ backgroundColor: selectedCharacter.accentColor }}
              >
                {selectedCharacter.rarity}
              </span>
            </div>

            {/* Character Info */}
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center gap-1.5">
                <h2 className="text-xs sm:text-base font-black text-white truncate">{selectedCharacter.name}</h2>
                <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium truncate">({selectedCharacter.title})</span>
              </div>

              <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-amber-400 font-semibold my-0.5">
                <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current shrink-0" />
                <span className="truncate">{selectedCharacter.powerName}</span>
              </div>

              <p className="text-[10px] sm:text-[11px] text-slate-300 line-clamp-1 leading-tight mb-1 sm:mb-1.5">
                {selectedCharacter.powerDescription}
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    soundManager.playButtonClick();
                    onNavigate('CHARACTER_ROSTER');
                  }}
                  className="text-[11px] font-bold text-sky-400 hover:text-sky-300 underline underline-offset-2 cursor-pointer flex items-center gap-1"
                >
                  <Users className="w-3 h-3" />
                  <span>Switch</span>
                </button>

                {onCreateCustomClick && (
                  <button
                    onClick={() => {
                      soundManager.playButtonClick();
                      onCreateCustomClick();
                    }}
                    className="text-[11px] font-bold text-amber-400 hover:text-amber-300 underline underline-offset-2 cursor-pointer flex items-center gap-1"
                  >
                    <UserPlus className="w-3 h-3" />
                    <span>Upload Photo</span>
                  </button>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Bottom Navigation Grid: Compact & High Tech */}
      <nav
        className="relative z-10 grid grid-cols-5 gap-1 px-2 py-1 sm:py-1.5 bg-slate-900/95 border-t border-slate-800 backdrop-blur-md max-w-3xl mx-auto w-full rounded-t-2xl shrink-0"
        style={{ paddingBottom: 'max(0.4rem, env(safe-area-inset-bottom))' }}
      >
        <button
          onClick={() => {
            soundManager.playButtonClick();
            onNavigate('CHARACTER_ROSTER');
          }}
          className="flex flex-col items-center justify-center py-1 sm:py-1.5 px-1 text-slate-300 hover:text-amber-400 hover:bg-slate-800/60 rounded-xl transition-all cursor-pointer"
        >
          <Users className="w-4 h-4 sm:w-5 sm:h-5 mb-0.5" />
          <span className="text-[10px] sm:text-[11px] font-semibold whitespace-nowrap">Roster</span>
        </button>

        <button
          onClick={() => {
            soundManager.playButtonClick();
            onNavigate('WORLD_SELECT');
          }}
          className="flex flex-col items-center justify-center py-1 sm:py-1.5 px-1 text-slate-300 hover:text-sky-400 hover:bg-slate-800/60 rounded-xl transition-all cursor-pointer"
        >
          <Map className="w-4 h-4 sm:w-5 sm:h-5 mb-0.5" />
          <span className="text-[10px] sm:text-[11px] font-semibold whitespace-nowrap">Worlds</span>
        </button>

        <button
          onClick={() => {
            soundManager.playButtonClick();
            onNavigate('UPGRADES');
          }}
          className="flex flex-col items-center justify-center py-1 sm:py-1.5 px-1 text-slate-300 hover:text-emerald-400 hover:bg-slate-800/60 rounded-xl transition-all cursor-pointer"
        >
          <ArrowUpCircle className="w-4 h-4 sm:w-5 sm:h-5 mb-0.5" />
          <span className="text-[10px] sm:text-[11px] font-semibold whitespace-nowrap">Upgrades</span>
        </button>

        <button
          onClick={() => {
            soundManager.playButtonClick();
            onNavigate('MISSIONS');
          }}
          className="flex flex-col items-center justify-center py-1 sm:py-1.5 px-1 text-slate-300 hover:text-purple-400 hover:bg-slate-800/60 rounded-xl transition-all cursor-pointer"
        >
          <Trophy className="w-4 h-4 sm:w-5 sm:h-5 mb-0.5" />
          <span className="text-[10px] sm:text-[11px] font-semibold whitespace-nowrap">Missions</span>
        </button>

        <button
          onClick={() => {
            soundManager.playButtonClick();
            onNavigate('SHOP');
          }}
          className="flex flex-col items-center justify-center py-1 sm:py-1.5 px-1 text-slate-300 hover:text-rose-400 hover:bg-slate-800/60 rounded-xl transition-all cursor-pointer"
        >
          <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 mb-0.5" />
          <span className="text-[10px] sm:text-[11px] font-semibold whitespace-nowrap">Shop</span>
        </button>
      </nav>
    </div>
  );
};
