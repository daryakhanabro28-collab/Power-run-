import React, { useState, useRef } from 'react';
import { Character, SuperpowerType } from '../types/game';
import { soundManager } from '../audio/soundManager';
import { X, Upload, Camera, Zap, Check, Sparkles, UserPlus } from 'lucide-react';

interface CustomCharacterModalProps {
  onSaveCustomCharacter: (newChar: Character) => void;
  onClose: () => void;
}

const POWER_OPTIONS: Array<{
  type: SuperpowerType;
  name: string;
  desc: string;
  accent: string;
}> = [
  {
    type: 'titan',
    name: 'Titan Elephant Stomp',
    desc: 'Earth-shattering tremor pulverizes monsters and turns spikes into coins.',
    accent: '#F97316'
  },
  {
    type: 'shadow',
    name: 'Eclipse Phantom Dash',
    desc: 'Supersonic shadow dash slicing enemies and pulling coins & gems.',
    accent: '#818CF8'
  },
  {
    type: 'thunder',
    name: 'Thunder Emperor Wrath',
    desc: 'Celestial lightning storm vaporizing all on-screen monsters.',
    accent: '#F59E0B'
  },
  {
    type: 'fire',
    name: 'Inferno Blast',
    desc: 'Fires explosive fireballs that incinerate monsters and traps.',
    accent: '#EF4444'
  },
  {
    type: 'chrono',
    name: 'Chrono Warp & Phantoms',
    desc: 'Slows down time by 75% while sprinting at double speed.',
    accent: '#3B82F6'
  },
  {
    type: 'aero',
    name: 'Aero Glide & Coin Vortex',
    desc: 'Empowers high flutter jumps and creates a wind vortex for coins.',
    accent: '#10B981'
  },
  {
    type: 'crystal',
    name: 'Crystal Aegis',
    desc: 'Impenetrable crystal shield reflecting monster attacks into coins.',
    accent: '#8B5CF6'
  }
];

const COLOR_PRESETS = [
  { label: 'Ochre Camel', outfit: '#8C5A32', accent: '#F59E0B' },
  { label: 'Midnight Black', outfit: '#18181B', accent: '#818CF8' },
  { label: 'Checked Brown', outfit: '#4A3B32', accent: '#F97316' },
  { label: 'Sky Azure', outfit: '#38BDF8', accent: '#0284C7' },
  { label: 'Emerald Green', outfit: '#059669', accent: '#10B981' },
  { label: 'Crimson Flame', outfit: '#DC2626', accent: '#EF4444' },
  { label: 'Pristine White', outfit: '#F8FAFC', accent: '#94A3B8' }
];

export const CustomCharacterModal: React.FC<CustomCharacterModalProps> = ({
  onSaveCustomCharacter,
  onClose
}) => {
  const [photoDataUrl, setPhotoDataUrl] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [title, setTitle] = useState<string>('Custom Champion');
  const [selectedPowerIdx, setSelectedPowerIdx] = useState<number>(0);
  const [selectedColorIdx, setSelectedColorIdx] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotoDataUrl(reader.result);
        soundManager.playCoin();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const trimmedName = name.trim() || 'My Hero';
    const trimmedTitle = title.trim() || 'Custom Champion';
    const chosenPower = POWER_OPTIONS[selectedPowerIdx];
    const chosenColor = COLOR_PRESETS[selectedColorIdx];

    const newChar: Character = {
      id: `char_custom_${Date.now()}`,
      name: trimmedName,
      title: trimmedTitle,
      rarity: 'Legendary',
      photoUrl: photoDataUrl || '/assets/aistudio/Picsart_26-10-18_08-20-37-747_32069357.jpg',
      avatarBgColor: chosenColor.accent,
      outfitColor: chosenColor.outfit,
      accentColor: chosenColor.accent,
      hairStyle: 'custom',
      powerType: chosenPower.type,
      powerName: chosenPower.name,
      powerDescription: chosenPower.desc,
      unlocked: true,
      unlockCostCoins: 0,
      unlockCostFragments: 0,
      currentFragments: 0,
      requiredFragments: 100,
      level: 1,
      upgrades: {
        speedLevel: 2,
        jumpLevel: 2,
        durationLevel: 2,
        cooldownLevel: 2
      },
      baseStats: {
        speed: 9.0,
        jump: 9.8,
        powerCooldown: 8.5,
        powerDuration: 6.0
      }
    };

    soundManager.playVictory();
    onSaveCustomCharacter(newChar);
    onClose();
  };

  const activeColor = COLOR_PRESETS[selectedColorIdx];
  const activePower = POWER_OPTIONS[selectedPowerIdx];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-slate-900 border-2 border-amber-500/50 rounded-3xl shadow-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <UserPlus className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg sm:text-xl font-black tracking-tight">Create Custom Hero (Photo Upload)</h2>
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
          {/* Photo Upload Section */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            {/* Live Preview Avatar */}
            <div className="relative group shrink-0">
              <div
                className="w-28 h-28 rounded-2xl overflow-hidden border-3 bg-slate-800 flex items-center justify-center relative shadow-xl"
                style={{ borderColor: activeColor.accent }}
              >
                {photoDataUrl ? (
                  <img
                    src={photoDataUrl}
                    alt="Custom Hero Preview"
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 p-2 text-center">
                    <Camera className="w-8 h-8 mb-1 text-amber-400" />
                    <span className="text-[10px] font-bold">No Photo</span>
                  </div>
                )}
              </div>
              <span
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase text-slate-950 shadow-md whitespace-nowrap"
                style={{ backgroundColor: activeColor.accent }}
              >
                Custom Hero
              </span>
            </div>

            {/* Upload Button */}
            <div className="flex-1 text-center sm:text-left space-y-2">
              <h3 className="text-sm font-bold text-white">Upload Your Photo or Selfie</h3>
              <p className="text-xs text-slate-400">
                Choose any photo from your phone or device. Your custom face texture will appear on your playable hero in game!
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md"
              >
                <Upload className="w-4 h-4" />
                <span>{photoDataUrl ? 'Change Photo' : 'Select Photo from Device'}</span>
              </button>
            </div>
          </div>

          {/* Name & Title Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Hero Name
              </label>
              <input
                type="text"
                placeholder="e.g. Daryakhan, Sheru, Sultan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={24}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl text-sm font-bold text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Hero Title
              </label>
              <input
                type="text"
                placeholder="e.g. Master Runner, Thunder King"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={28}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl text-sm font-bold text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Outfit Color Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Outfit Color Palette
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {COLOR_PRESETS.map((color, idx) => (
                <button
                  key={color.label}
                  type="button"
                  onClick={() => {
                    soundManager.playButtonClick();
                    setSelectedColorIdx(idx);
                  }}
                  className={`flex items-center gap-2 p-2 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                    selectedColorIdx === idx
                      ? 'border-amber-400 bg-slate-800 text-white shadow-sm ring-1 ring-amber-400'
                      : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full border border-white/40 shrink-0"
                    style={{ backgroundColor: color.outfit }}
                  />
                  <span className="truncate">{color.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Superpower Choice */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Select Superpower Ability
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {POWER_OPTIONS.map((power, idx) => (
                <button
                  key={power.type}
                  type="button"
                  onClick={() => {
                    soundManager.playButtonClick();
                    setSelectedPowerIdx(idx);
                  }}
                  className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedPowerIdx === idx
                      ? 'border-amber-400 bg-slate-800/90 shadow-md ring-1 ring-amber-400'
                      : 'border-slate-800 bg-slate-950/40 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <Zap
                    className="w-4 h-4 mt-0.5 shrink-0"
                    style={{ color: power.accent }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{power.name}</span>
                      {selectedPowerIdx === idx && (
                        <Check className="w-3.5 h-3.5 text-amber-400" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                      {power.desc}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between gap-4">
          <div className="text-xs text-slate-400 font-medium">
            Power: <span className="text-white font-bold">{activePower.name}</span>
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Create & Equip Hero</span>
          </button>
        </div>
      </div>
    </div>
  );
};
