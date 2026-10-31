import React, { useState } from 'react';
import { Character } from '../types/game';
import { soundManager } from '../audio/soundManager';
import { X, Zap, Wind, ArrowUp, Clock, Coins, CheckCircle } from 'lucide-react';

interface UpgradeModalProps {
  characters: Character[];
  selectedCharacterId: string;
  coins: number;
  onUpgradeStat: (charId: string, statKey: 'speedLevel' | 'jumpLevel' | 'durationLevel' | 'cooldownLevel', cost: number) => void;
  onClose: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  characters,
  selectedCharacterId,
  coins,
  onUpgradeStat,
  onClose
}) => {
  const [activeCharId, setActiveCharId] = useState(selectedCharacterId);

  const activeChar = characters.find((c) => c.id === activeCharId) || characters[0];

  const getUpgradeCost = (currentLevel: number) => {
    const costs = [0, 100, 250, 500, 1000];
    return costs[currentLevel] || 1500;
  };

  const statConfigs = [
    {
      key: 'speedLevel' as const,
      name: 'Sprint Velocity',
      icon: Wind,
      color: '#38BDF8',
      desc: 'Increases ground running and air acceleration by +8% per rank.',
      level: activeChar.upgrades.speedLevel
    },
    {
      key: 'jumpLevel' as const,
      name: 'Leap Impulse',
      icon: ArrowUp,
      color: '#34D399',
      desc: 'Elevates maximum jump height and platform clearance by +8% per rank.',
      level: activeChar.upgrades.jumpLevel
    },
    {
      key: 'durationLevel' as const,
      name: 'Power Duration',
      icon: Zap,
      color: '#F59E0B',
      desc: 'Extends active duration of character superpower by +15% per rank.',
      level: activeChar.upgrades.durationLevel
    },
    {
      key: 'cooldownLevel' as const,
      name: 'Recharge Rate',
      icon: Clock,
      color: '#A855F7',
      desc: 'Reduces recharge cooldown timer of character superpower by -10% per rank.',
      level: activeChar.upgrades.cooldownLevel
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-black tracking-tight">Hero Upgrades Bay</h2>
            <div className="flex items-center gap-1.5 bg-amber-500/20 border border-amber-500/40 px-3 py-1 rounded-xl text-amber-300 font-bold text-xs">
              <Coins className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="tabular-nums">{coins.toLocaleString()} Coins Available</span>
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

        {/* Character Switcher Bar */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-slate-800/60 bg-slate-900/40 overflow-x-auto">
          {characters.filter(c => c.unlocked).map((char) => (
            <button
              key={char.id}
              onClick={() => {
                soundManager.playButtonClick();
                setActiveCharId(char.id);
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeCharId === char.id
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
              }`}
            >
              <div className="w-5 h-5 rounded-full overflow-hidden border border-white/40">
                <img src={char.photoUrl} alt={char.name} className="w-full h-full object-cover object-top" />
              </div>
              <span>{char.name}</span>
            </button>
          ))}
        </div>

        {/* Upgrades List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {statConfigs.map((stat) => {
            const isMax = stat.level >= 5;
            const cost = getUpgradeCost(stat.level);
            const canAfford = coins >= cost;
            const Icon = stat.icon;

            return (
              <div
                key={stat.key}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950/40 border border-slate-800/80 hover:border-slate-700 transition-all"
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border shadow-md"
                    style={{ borderColor: stat.color, backgroundColor: `${stat.color}15` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: stat.color }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-white text-base">{stat.name}</h3>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((lvl) => (
                          <div
                            key={lvl}
                            className={`w-3.5 h-1.5 rounded-full ${
                              lvl <= stat.level ? 'bg-amber-400' : 'bg-slate-800'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-slate-400 font-semibold">Rank {stat.level}/5</span>
                    </div>
                    <p className="text-xs text-slate-300 max-w-md">{stat.desc}</p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center justify-end">
                  {isMax ? (
                    <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold">
                      <CheckCircle className="w-4 h-4" />
                      <span>Max Rank</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        if (canAfford) {
                          soundManager.playVictory();
                          onUpgradeStat(activeChar.id, stat.key, cost);
                        }
                      }}
                      disabled={!canAfford}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md ${
                        canAfford
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer active:scale-95'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <Coins className="w-4 h-4" />
                      <span>Upgrade ({cost} Coins)</span>
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
