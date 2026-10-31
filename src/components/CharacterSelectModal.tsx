import React, { useState } from 'react';
import { Character, CharacterRarity } from '../types/game';
import { soundManager } from '../audio/soundManager';
import { X, Check, Lock, Zap, Edit2, Coins, Crown } from 'lucide-react';

interface CharacterSelectModalProps {
  characters: Character[];
  selectedCharacterId: string;
  coins: number;
  onSelectCharacter: (charId: string) => void;
  onUnlockCharacter: (charId: string, costCoins: number) => void;
  onRenameCharacter: (charId: string, newName: string) => void;
  onClose: () => void;
}

export const CharacterSelectModal: React.FC<CharacterSelectModalProps> = ({
  characters,
  selectedCharacterId,
  coins,
  onSelectCharacter,
  onUnlockCharacter,
  onRenameCharacter,
  onClose
}) => {
  const [editingCharId, setEditingCharId] = useState<string | null>(null);
  const [editNameValue, setEditNameValue] = useState('');

  const handleStartRename = (char: Character) => {
    setEditingCharId(char.id);
    setEditNameValue(char.name);
  };

  const handleSaveRename = (charId: string) => {
    if (editNameValue.trim()) {
      onRenameCharacter(charId, editNameValue.trim());
    }
    setEditingCharId(null);
  };

  const rarityColors: Record<CharacterRarity, string> = {
    Common: '#94A3B8',
    Uncommon: '#10B981',
    Rare: '#3B82F6',
    Epic: '#A855F7',
    Legendary: '#F59E0B'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <Crown className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl font-black tracking-tight">Hero Crew Roster</h2>
            <span className="text-xs font-semibold text-slate-400">({characters.length} Champions)</span>
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

        {/* Characters Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {characters.map((char) => {
              const isSelected = char.id === selectedCharacterId;
              const isLegendary = char.rarity === 'Legendary';
              const canUnlock = !char.unlocked && coins >= (char.unlockCostCoins || 0);

              return (
                <div
                  key={char.id}
                  className={`relative flex gap-4 p-4 rounded-2xl border transition-all ${
                    isSelected
                      ? 'bg-slate-800/90 border-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.3)] ring-1 ring-amber-400/40'
                      : isLegendary
                      ? 'bg-gradient-to-r from-amber-950/30 via-slate-900/80 to-slate-900 border-amber-500/50 hover:border-amber-400'
                      : char.unlocked
                      ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      : 'bg-slate-950/40 border-slate-800/60 opacity-80'
                  }`}
                >
                  {/* Photo Portrait */}
                  <div className="relative shrink-0">
                    <div
                      className={`w-20 h-20 rounded-xl overflow-hidden border-2 bg-slate-800 relative ${
                        isLegendary ? 'shadow-[0_0_15px_rgba(245,158,11,0.5)]' : ''
                      }`}
                      style={{ borderColor: rarityColors[char.rarity] }}
                    >
                      <img
                        src={char.photoUrl}
                        alt={char.name}
                        className={`w-full h-full object-cover object-top ${!char.unlocked ? 'grayscale' : ''}`}
                        referrerPolicy="no-referrer"
                      />
                      {!char.unlocked && (
                        <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center">
                          <Lock className="w-6 h-6 text-slate-300" />
                        </div>
                      )}
                    </div>
                    <span
                      className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase text-slate-950 shadow-md flex items-center gap-1"
                      style={{ backgroundColor: rarityColors[char.rarity] }}
                    >
                      {isLegendary && <Crown className="w-2.5 h-2.5 inline" />}
                      {char.rarity}
                    </span>
                  </div>

                  {/* Character Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      {editingCharId === char.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={editNameValue}
                            onChange={(e) => setEditNameValue(e.target.value)}
                            className="px-2 py-0.5 bg-slate-950 border border-amber-500 rounded text-sm font-bold text-white w-28 focus:outline-none"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveRename(char.id)}
                            className="p-1 bg-amber-500 text-slate-950 rounded hover:bg-amber-400 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-white text-base truncate">{char.name}</h3>
                          <button
                            onClick={() => handleStartRename(char)}
                            className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                            title="Rename Hero"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                      <span className="text-[11px] text-slate-400 font-semibold">{char.title}</span>
                    </div>

                    {/* Power Details */}
                    <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold mb-1">
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>{char.powerName}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 line-clamp-2 mb-3">
                      {char.powerDescription}
                    </p>

                    {/* Action Button */}
                    <div className="flex items-center justify-end gap-2">
                      {char.unlocked ? (
                        <button
                          onClick={() => {
                            soundManager.playButtonClick();
                            onSelectCharacter(char.id);
                          }}
                          disabled={isSelected}
                          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-amber-500 text-slate-950 cursor-default font-black'
                              : 'bg-slate-800 hover:bg-slate-700 text-white'
                          }`}
                        >
                          {isSelected ? 'Equipped' : 'Select Hero'}
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            if (canUnlock && char.unlockCostCoins) {
                              soundManager.playVictory();
                              onUnlockCharacter(char.id, char.unlockCostCoins);
                            }
                          }}
                          disabled={!canUnlock}
                          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            canUnlock
                              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md cursor-pointer'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          <Coins className="w-3.5 h-3.5" />
                          <span>Unlock ({char.unlockCostCoins} Coins)</span>
                        </button>
                      )}
                    </div>
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
