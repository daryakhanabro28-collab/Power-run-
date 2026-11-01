/**
 * Core type definitions for POWER RUN: 2D Adventure Platformer
 */

export type CharacterRarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';

export type SuperpowerType =
  | 'thunder'
  | 'aero'
  | 'fire'
  | 'crystal'
  | 'chrono'
  | 'shadow'
  | 'titan';

export interface Character {
  id: string;
  name: string;
  title: string;
  rarity: CharacterRarity;
  photoUrl: string; // Path or base64 data url
  avatarBgColor: string;
  outfitColor: string;
  accentColor: string;
  hairStyle: 'short_wavy' | 'side_part' | 'wavy_styled' | 'sleek_dark' | 'textured_fringe' | 'fedora_hat' | 'custom';
  powerType: SuperpowerType;
  powerName: string;
  powerDescription: string;
  unlocked: boolean;
  unlockCostCoins?: number;
  unlockCostFragments?: number;
  currentFragments: number;
  requiredFragments: number;
  level: number;
  upgrades: {
    speedLevel: number;
    jumpLevel: number;
    durationLevel: number;
    cooldownLevel: number;
  };
  baseStats: {
    speed: number;
    jump: number;
    powerCooldown: number; // in seconds
    powerDuration: number; // in seconds
  };
}

export type WorldId = 1 | 2 | 3 | 4;

export interface WorldConfig {
  id: WorldId;
  name: string;
  subtitle: string;
  theme: 'green_valley' | 'lava_zone' | 'cyber_city' | 'legend_realm';
  description: string;
  unlocked: boolean;
  requiredStars: number;
  skyColorTop: string;
  skyColorBottom: string;
  groundColor: string;
  groundAccentColor: string;
  musicTrack: 'valley' | 'lava' | 'cyber' | 'legend';
}

export interface LevelStarRequirements {
  timeLimit: number; // in seconds
  requiredCoinsPercent: number; // e.g. 80
}

export interface LevelConfig {
  id: string; // e.g. '1-1', '1-5'
  worldId: WorldId;
  stageNumber: number;
  name: string;
  isBossStage: boolean;
  unlocked: boolean;
  starsEarned: number; // 0 to 3
  highScore: number;
  bestTime: number; // 0 means not completed yet
  starsReq: LevelStarRequirements;
  totalCoins: number;
  totalGems: number;
}

export interface Mission {
  id: string;
  category: 'daily' | 'adventure' | 'character' | 'legendary';
  title: string;
  description: string;
  targetCount: number;
  currentCount: number;
  completed: boolean;
  claimed: boolean;
  rewardType: 'coins' | 'gems' | 'fragments' | 'xp';
  rewardAmount: number;
  characterIdReq?: string;
}

export interface GameStats {
  totalCoinsCollected: number;
  totalGemsCollected: number;
  totalDistanceMeters: number;
  totalEnemiesDefeated: number;
  totalSuperpowersUsed: number;
  totalBossesDefeated: number;
  playerXp: number;
  playerLevel: number;
}

export interface GameSettings {
  musicVolume: number; // 0.0 to 1.0
  sfxVolume: number; // 0.0 to 1.0
  soundMuted: boolean;
  musicMuted: boolean;
  graphicsQuality: 'high' | 'medium';
  touchControlsVisible: boolean;
  touchSensitivity: number;
}

export interface GameSaveData {
  coins: number;
  gems: number;
  selectedCharacterId: string;
  characters: Character[];
  levels: Record<string, LevelConfig>;
  missions: Mission[];
  stats: GameStats;
  settings: GameSettings;
  lastDailyClaimTimestamp: number;
}

export type ScreenState =
  | 'TITLE_MENU'
  | 'CHARACTER_ROSTER'
  | 'WORLD_SELECT'
  | 'LEVEL_SELECT'
  | 'UPGRADES'
  | 'MISSIONS'
  | 'SHOP'
  | 'SETTINGS'
  | 'PLAYING'
  | 'PAUSED'
  | 'VICTORY'
  | 'GAME_OVER';
