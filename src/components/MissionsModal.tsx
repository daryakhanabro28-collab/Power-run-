import React, { useState } from 'react';
import { Mission } from '../types/game';
import { soundManager } from '../audio/soundManager';
import { X, Trophy, Coins, Gem, Sparkles, Check, Flame } from 'lucide-react';

interface MissionsModalProps {
  missions: Mission[];
  onClaimMission: (missionId: string) => void;
  onClose: () => void;
}

export const MissionsModal: React.FC<MissionsModalProps> = ({
  missions,
  onClaimMission,
  onClose
}) => {
  const [activeCategory, setActiveCategory] = useState<'daily' | 'adventure' | 'character' | 'legendary'>('daily');

  const filteredMissions = missions.filter((m) => m.category === activeCategory);

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'coins':
        return <Coins className="w-4 h-4 text-amber-400 fill-amber-400" />;
      case 'gems':
        return <Gem className="w-4 h-4 text-sky-400 fill-sky-400" />;
      case 'fragments':
        return <Sparkles className="w-4 h-4 text-purple-400" />;
      default:
        return <Flame className="w-4 h-4 text-rose-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl font-black tracking-tight">Mission Operations Board</h2>
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

        {/* Category Tabs */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-slate-800/60 bg-slate-900/40 overflow-x-auto">
          {[
            { id: 'daily', label: 'Daily Tasks' },
            { id: 'adventure', label: 'Adventure Milestones' },
            { id: 'character', label: 'Hero Mastery' },
            { id: 'legendary', label: 'Legendary Feats' }
          ].map((tab) => {
            const isSelected = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  soundManager.playButtonClick();
                  setActiveCategory(tab.id as typeof activeCategory);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Missions List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3.5">
          {filteredMissions.map((m) => {
            const progress = Math.min(100, (m.currentCount / m.targetCount) * 100);
            const isReadyToClaim = m.currentCount >= m.targetCount && !m.claimed;

            return (
              <div
                key={m.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950/40 border border-slate-800/80 hover:border-slate-700 transition-all"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-white text-base truncate">{m.title}</h3>
                    <span className="text-xs text-slate-400 font-semibold">
                      ({m.currentCount}/{m.targetCount})
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mb-2.5">{m.description}</p>

                  {/* Progress Bar */}
                  <div className="w-full max-w-md h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300 rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Reward & Claim */}
                <div className="flex items-center gap-3 shrink-0 justify-end">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-amber-300">
                    {getRewardIcon(m.rewardType)}
                    <span>+{m.rewardAmount} {m.rewardType.toUpperCase()}</span>
                  </div>

                  {m.claimed ? (
                    <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold px-3 py-1.5 bg-emerald-500/10 rounded-xl border border-emerald-500/30">
                      <Check className="w-4 h-4" />
                      <span>Claimed</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        if (isReadyToClaim) {
                          soundManager.playChestOpen();
                          onClaimMission(m.id);
                        }
                      }}
                      disabled={!isReadyToClaim}
                      className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md ${
                        isReadyToClaim
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer animate-bounce'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      Claim
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
