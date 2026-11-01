import React from 'react';
import { GameSettings } from '../types/game';
import { soundManager } from '../audio/soundManager';
import { X, Volume2, VolumeX, RotateCcw, Smartphone, Keyboard, Shield } from 'lucide-react';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onResetProgress: () => void;
  onOpenAbout: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onResetProgress,
  onOpenAbout,
  onClose
}) => {
  const handleMusicVol = (val: number) => {
    const updated = { ...settings, musicVolume: val };
    onUpdateSettings(updated);
    soundManager.setVolumes(updated.sfxVolume, updated.musicVolume, updated.soundMuted);
  };

  const handleSfxVol = (val: number) => {
    const updated = { ...settings, sfxVolume: val };
    onUpdateSettings(updated);
    soundManager.setVolumes(updated.sfxVolume, updated.musicVolume, updated.soundMuted);
  };

  const handleToggleMute = () => {
    const updated = { ...settings, soundMuted: !settings.soundMuted };
    onUpdateSettings(updated);
    soundManager.setVolumes(updated.sfxVolume, updated.musicVolume, updated.soundMuted);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md select-none">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-black tracking-tight">Game Settings</h2>
          </div>
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onClose();
            }}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Audio Controls */}
          <div className="space-y-4 bg-slate-950/40 border border-slate-800 p-5 rounded-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm">Audio & Sound FX</h3>
              <button
                onClick={handleToggleMute}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  settings.soundMuted
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                {settings.soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span>{settings.soundMuted ? 'Muted' : 'Sound On'}</span>
              </button>
            </div>

            {/* SFX Volume */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1.5">
                <span>Sound Effects (SFX)</span>
                <span className="tabular-nums">{Math.round(settings.sfxVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.sfxVolume}
                onChange={(e) => handleSfxVol(parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Music Volume */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1.5">
                <span>World Background Music (BGM)</span>
                <span className="tabular-nums">{Math.round(settings.musicVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.musicVolume}
                onChange={(e) => handleMusicVol(parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Mobile & Touch Controls */}
          <div className="flex items-center justify-between p-4 bg-slate-950/40 border border-slate-800 rounded-2xl">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-sky-400" />
              <div>
                <h4 className="font-bold text-white text-sm">Mobile On-Screen Controls</h4>
                <p className="text-xs text-slate-400">Show virtual D-pad and action buttons</p>
              </div>
            </div>
            <button
              onClick={() => {
                soundManager.playButtonClick();
                onUpdateSettings({ ...settings, touchControlsVisible: !settings.touchControlsVisible });
              }}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                settings.touchControlsVisible
                  ? 'bg-sky-500 text-slate-950 font-black'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {settings.touchControlsVisible ? 'Visible' : 'Hidden'}
            </button>
          </div>

          {/* Controls Guide */}
          <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
              <Keyboard className="w-4 h-4" />
              <span>Keyboard & Touch Guide</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-300">
              <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Move Left / Right</span>
                <span className="font-bold text-white">A / D or Arrows</span>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Jump / Flutter</span>
                <span className="font-bold text-white">W / Space / Up</span>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Slide Barrier</span>
                <span className="font-bold text-white">S or Down Arrow</span>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Superpower Surge</span>
                <span className="font-bold text-white">E / X / Shift</span>
              </div>
            </div>
          </div>

          {/* About Developer Section */}
          <div className="p-4 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950/40 border border-amber-500/40 rounded-2xl flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-black uppercase">Creator</span>
                <h4 className="font-bold text-white text-sm">Daryakhan ABRO</h4>
              </div>
              <p className="text-xs text-amber-400/90 font-bold uppercase tracking-wider">team Mr Pro PrimeX</p>
            </div>

            <button
              onClick={() => {
                soundManager.playButtonClick();
                onOpenAbout();
              }}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm active:scale-95"
            >
              About Dev
            </button>
          </div>

          {/* Reset Progress Only */}
          <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-2xl flex items-center justify-between gap-3">
            <div>
              <h4 className="font-bold text-white text-sm">Reset Career Progress</h4>
              <p className="text-xs text-slate-400">Clears unlocked stages and resets coins to default</p>
            </div>

            <button
              onClick={() => {
                if (window.confirm('Reset all progress, coins, and unlocks back to start?')) {
                  onResetProgress();
                }
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Progress</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
