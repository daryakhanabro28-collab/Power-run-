import React from 'react';
import { soundManager } from '../audio/soundManager';
import { X, ShoppingBag, Coins, Gem, Sparkles, ShieldCheck } from 'lucide-react';

interface ShopModalProps {
  coins: number;
  gems: number;
  lastDailyClaim: number;
  onAddCurrency: (addCoins: number, addGems: number, addFragments: number) => void;
  onSpendCoins: (amount: number) => boolean;
  onSpendGems: (amount: number) => boolean;
  onClose: () => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  coins,
  gems,
  onAddCurrency,
  onSpendCoins,
  onSpendGems,
  onClose
}) => {
  const shopItems = [
    {
      id: 'coin_pouch',
      name: 'Runner Vault Pouch',
      desc: 'Convert 15 hard-earned dungeon gems into 500 gold coins.',
      costType: 'gems' as const,
      cost: 15,
      gainCoins: 500,
      gainGems: 0,
      gainFragments: 0,
      icon: Coins,
      color: '#F59E0B'
    },
    {
      id: 'gem_cache',
      name: 'Crystal Gem Cache',
      desc: 'Trade 1,000 adventure coins for 10 rare glowing gems.',
      costType: 'coins' as const,
      cost: 1000,
      gainCoins: 0,
      gainGems: 10,
      gainFragments: 0,
      icon: Gem,
      color: '#38BDF8'
    },
    {
      id: 'fragment_chest',
      name: 'Hero Fragment Vault',
      desc: 'Contains 25 universal fragments to unlock Epic & Legendary heroes.',
      costType: 'coins' as const,
      cost: 1500,
      gainCoins: 0,
      gainGems: 0,
      gainFragments: 25,
      icon: Sparkles,
      color: '#A855F7'
    },
    {
      id: 'mega_chest',
      name: 'Imperial Fragment Vault',
      desc: 'Massive vault containing 60 Hero Fragments for high-tier unlocks.',
      costType: 'coins' as const,
      cost: 3200,
      gainCoins: 0,
      gainGems: 0,
      gainFragments: 60,
      icon: ShieldCheck,
      color: '#EC4899'
    }
  ];

  const handleBuy = (item: (typeof shopItems)[0]) => {
    if (item.costType === 'coins') {
      const ok = onSpendCoins(item.cost);
      if (ok) {
        soundManager.playChestOpen();
        onAddCurrency(item.gainCoins, item.gainGems, item.gainFragments);
      }
    } else {
      const ok = onSpendGems(item.cost);
      if (ok) {
        soundManager.playChestOpen();
        onAddCurrency(item.gainCoins, item.gainGems, item.gainFragments);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl font-black tracking-tight">Supplies & Hero Market</h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-800/80 rounded-xl px-3 py-1.5 text-xs font-bold text-amber-300">
              <Coins className="w-4 h-4 fill-amber-400" />
              <span>{coins.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-800/80 rounded-xl px-3 py-1.5 text-xs font-bold text-sky-300">
              <Gem className="w-4 h-4 fill-sky-400" />
              <span>{gems.toLocaleString()}</span>
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
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 text-center sm:text-left">
            <h3 className="font-bold text-amber-400 text-sm mb-1">Earned Through Adventure</h3>
            <p className="text-xs text-slate-300">
              All coins and gems must be earned by running stages, finding hidden chests, defeating monsters, and clearing worlds! No shortcuts.
            </p>
          </div>

          {/* Shop Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {shopItems.map((item) => {
              const canAfford = item.costType === 'coins' ? coins >= item.cost : gems >= item.cost;
              const Icon = item.icon;

              return (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-slate-950/40 border border-slate-800/80 hover:border-slate-700 flex flex-col justify-between gap-4 transition-all"
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border"
                      style={{
                        backgroundColor: `${item.color}20`,
                        borderColor: `${item.color}50`
                      }}
                    >
                      <Icon className="w-6 h-6" style={{ color: item.color }} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{item.name}</h4>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">{item.desc}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                    <div className="flex items-center gap-1.5 text-xs font-black">
                      <span className="text-slate-400 text-[11px]">Cost:</span>
                      {item.costType === 'coins' ? (
                        <span className="flex items-center gap-1 text-amber-400">
                          <Coins className="w-3.5 h-3.5 fill-current" />
                          {item.cost.toLocaleString()}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-sky-400">
                          <Gem className="w-3.5 h-3.5 fill-current" />
                          {item.cost.toLocaleString()}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleBuy(item)}
                      disabled={!canAfford}
                      className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                        canAfford
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md cursor-pointer active:scale-95'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      Exchange
                    </button>
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
