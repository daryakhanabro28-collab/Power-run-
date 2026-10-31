import React, { useState } from 'react';
import { WorldConfig, LevelConfig, WorldId } from '../types/game';
import { WORLDS } from '../game/constants';
import { soundManager } from '../audio/soundManager';
import { X, Star, Lock, Skull, Play, Clock, Award } from 'lucide-react';

interface WorldMapModalProps {
  levels: Record<string, LevelConfig>;
  onSelectLevel: (level: LevelConfig) => void;
  onClose: () => void;
}

export const WorldMapModal: React.FC<WorldMapModalProps> = ({
  levels,
  onSelectLevel,
  onClose
}) => {
  const [selectedWorldId, setSelectedWorldId] = useState<WorldId>(1);

  // Compute total stars earned
  const totalStars = Object.values(levels).reduce((acc, lvl) => acc + (lvl.starsEarned || 0), 0);

  const activeWorld = WORLDS.find((w) => w.id === selectedWorldId) || WORLDS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-5xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-black tracking-tight">World Map & Stages</h2>
            <div className="flex items-center gap-1.5 bg-amber-500/20 border border-amber-500/40 px-3 py-1 rounded-xl text-amber-300 font-bold text-xs">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{totalStars} Total Stars Earned</span>
            </div>
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

        {/* World Tabs */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-slate-800/60 bg-slate-900/40 overflow-x-auto">
          {WORLDS.map((world) => {
            const isUnlocked = totalStars >= world.requiredStars;
            const isSelected = world.id === selectedWorldId;

            return (
              <button
                key={world.id}
                onClick={() => {
                  soundManager.playButtonClick();
                  setSelectedWorldId(world.id);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : isUnlocked
                    ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-200'
                    : 'bg-slate-950/60 text-slate-500 border border-slate-800'
                }`}
              >
                {!isUnlocked && <Lock className="w-3.5 h-3.5 text-slate-500" />}
                <span>World {world.id}: {world.name}</span>
                {!isUnlocked && (
                  <span className="text-[10px] text-amber-500">({world.requiredStars}★)</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Stages Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* World Banner Info */}
          <div
            className="p-5 rounded-2xl border mb-6 relative overflow-hidden"
            style={{
              borderColor: activeWorld.groundAccentColor,
              background: `linear-gradient(135deg, ${activeWorld.skyColorTop}33, ${activeWorld.groundColor}44)`
            }}
          >
            <h3 className="text-xl font-black text-white mb-1">{activeWorld.name}</h3>
            <p className="text-xs text-slate-300 mb-2">{activeWorld.subtitle}</p>
            <p className="text-xs text-slate-400 max-w-xl">{activeWorld.description}</p>
          </div>

          {/* 5 Stages Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((stageNum) => {
              const levelId = `${activeWorld.id}-${stageNum}`;
              const level = levels[levelId];
              const isUnlocked = level?.unlocked || false;
              const isBoss = stageNum === 5;
              const stars = level?.starsEarned || 0;

              return (
                <div
                  key={levelId}
                  className={`flex flex-col justify-between p-4 rounded-2xl border transition-all ${
                    isUnlocked
                      ? isBoss
                        ? 'bg-gradient-to-b from-rose-950/60 to-slate-900 border-rose-500/60 hover:border-rose-400 shadow-lg'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 shadow-md'
                      : 'bg-slate-950/40 border-slate-900 opacity-60'
                  }`}
                >
                  <div>
                    {/* Stage Header */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                        Stage {levelId}
                      </span>
                      {isBoss ? (
                        <span className="flex items-center gap-1 text-[10px] font-black uppercase text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded-full border border-rose-500/40">
                          <Skull className="w-3 h-3" />
                          Boss
                        </span>
                      ) : (
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= stars ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    <h4 className="font-bold text-white text-sm mb-1">{level?.name || `Stage ${stageNum}`}</h4>

                    {/* Stage Info */}
                    {isUnlocked && (
                      <div className="text-[11px] text-slate-400 space-y-1 mb-4">
                        {level.bestTime > 0 ? (
                          <div className="flex items-center gap-1 text-sky-400">
                            <Clock className="w-3 h-3" />
                            <span>Best: {level.bestTime}s</span>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">Unplayed</span>
                        )}
                        {level.highScore > 0 && (
                          <div className="flex items-center gap-1 text-emerald-400">
                            <Award className="w-3 h-3" />
                            <span>Score: {level.highScore}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Play CTA or Locked */}
                  <div>
                    {isUnlocked ? (
                      <button
                        onClick={() => {
                          soundManager.playButtonClick();
                          onSelectLevel(level);
                        }}
                        className={`w-full py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isBoss
                            ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                            : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md'
                        }`}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Play</span>
                      </button>
                    ) : (
                      <div className="w-full py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-500 text-xs font-semibold flex items-center justify-center gap-1.5">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Locked</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
