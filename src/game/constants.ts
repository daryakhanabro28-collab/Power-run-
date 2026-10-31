import { Character, WorldConfig, LevelConfig, Mission, GameSaveData } from '../types/game';

export const STORAGE_KEY = 'POWER_RUN_SAVE_DATA_V4';

export const DEFAULT_CHARACTERS: Character[] = [
  {
    id: 'char_dary',
    name: 'Dary',
    title: 'Thunder Sovereign',
    rarity: 'Legendary',
    photoUrl: '/assets/aistudio/Picsart_26-10-18_08-20-37-747_32069357.jpg',
    avatarBgColor: '#F59E0B',
    outfitColor: '#8C5A32', // Rich camel/ochre kurta matching photograph
    accentColor: '#F59E0B',
    hairStyle: 'short_wavy',
    powerType: 'thunder',
    powerName: 'Thunder Emperor Wrath',
    powerDescription: 'Summons celestial lightning storm that vaporizes all on-screen monsters, pulverizes obstacles, and grants 7s supreme hyper-speed invulnerability!',
    unlocked: false,
    unlockCostCoins: 18000,
    unlockCostFragments: 200,
    currentFragments: 0,
    requiredFragments: 200,
    level: 1,
    upgrades: { speedLevel: 1, jumpLevel: 1, durationLevel: 1, cooldownLevel: 1 },
    baseStats: { speed: 9.6, jump: 10.2, powerCooldown: 8, powerDuration: 7.0 }
  },
  {
    id: 'char_kamran',
    name: 'Kamran',
    title: 'Chrono Sovereign',
    rarity: 'Epic',
    photoUrl: '/assets/aistudio/Picsart_26-10-18_08-18-44-825_54b8c4c7.jpg',
    avatarBgColor: '#93C5FD',
    outfitColor: '#70B5F5', // Sky blue kurta matching photograph
    accentColor: '#3B82F6',
    hairStyle: 'textured_fringe',
    powerType: 'chrono',
    powerName: 'Chrono Warp & Phantoms',
    powerDescription: 'Slows down time by 75% for all hazards and monsters while sprinting at double speed with phantom clones.',
    unlocked: false,
    unlockCostCoins: 8500,
    unlockCostFragments: 120,
    currentFragments: 0,
    requiredFragments: 120,
    level: 1,
    upgrades: { speedLevel: 1, jumpLevel: 1, durationLevel: 1, cooldownLevel: 1 },
    baseStats: { speed: 8.8, jump: 9.6, powerCooldown: 10, powerDuration: 5.5 }
  },
  {
    id: 'char_ali',
    name: 'Ali',
    title: 'Aegis Warden',
    rarity: 'Rare',
    photoUrl: '/assets/aistudio/Picsart_26-10-18_08-19-02-429_e23b0c42.jpg',
    avatarBgColor: '#C4B5FD',
    outfitColor: '#FFFFFF', // Pristine white collar matching photograph
    accentColor: '#8B5CF6',
    hairStyle: 'sleek_dark',
    powerType: 'crystal',
    powerName: 'Crystal Aegis',
    powerDescription: 'Summons an impenetrable crystal forcefield that reflects monster attacks and turns hits into bonus coins.',
    unlocked: false,
    unlockCostCoins: 4000,
    unlockCostFragments: 75,
    currentFragments: 0,
    requiredFragments: 75,
    level: 1,
    upgrades: { speedLevel: 1, jumpLevel: 1, durationLevel: 1, cooldownLevel: 1 },
    baseStats: { speed: 8.4, jump: 9.2, powerCooldown: 9.5, powerDuration: 5.0 }
  },
  {
    id: 'char_farhan',
    name: 'Farhan',
    title: 'Blaze Titan',
    rarity: 'Uncommon',
    photoUrl: '/assets/aistudio/Picsart_26-10-18_08-20-04-831_8ad4f114.jpg',
    avatarBgColor: '#FCA5A5',
    outfitColor: '#F8FAFC', // White kurta with ruby trim matching photograph
    accentColor: '#EF4444',
    hairStyle: 'wavy_styled',
    powerType: 'fire',
    powerName: 'Inferno Blast',
    powerDescription: 'Fires explosive fireballs forward that incinerate monsters, shatter heavy stone blocks, and burn traps.',
    unlocked: false,
    unlockCostCoins: 1500,
    unlockCostFragments: 40,
    currentFragments: 0,
    requiredFragments: 40,
    level: 1,
    upgrades: { speedLevel: 1, jumpLevel: 1, durationLevel: 1, cooldownLevel: 1 },
    baseStats: { speed: 8.0, jump: 8.8, powerCooldown: 8.5, powerDuration: 4.5 }
  },
  {
    id: 'char_zayn',
    name: 'Zayn',
    title: 'Aero Strider',
    rarity: 'Common',
    photoUrl: '/assets/aistudio/Picsart_26-10-18_08-19-35-005_b09a79e8.jpg',
    avatarBgColor: '#6EE7B7',
    outfitColor: '#E5E7EB', // Crisp cream shirt matching photograph
    accentColor: '#10B981',
    hairStyle: 'side_part',
    powerType: 'aero',
    powerName: 'Aero Glide & Coin Vortex',
    powerDescription: 'Empowers high flutter jumps with slow-fall glide and generates a wind vortex pulling all coins.',
    unlocked: true,
    unlockCostCoins: 0,
    unlockCostFragments: 0,
    currentFragments: 0,
    requiredFragments: 25,
    level: 1,
    upgrades: { speedLevel: 1, jumpLevel: 1, durationLevel: 1, cooldownLevel: 1 },
    baseStats: { speed: 7.8, jump: 8.6, powerCooldown: 9, powerDuration: 4.5 }
  }
];

export const WORLDS: WorldConfig[] = [
  {
    id: 1,
    name: 'Green Valley',
    subtitle: 'Rolling Emerald Hills & Ancient Ruins',
    theme: 'green_valley',
    description: 'Brisk mountain breezes, wooden bridges, floating grass islands, slimes, wasps, and briar beasts.',
    unlocked: true,
    requiredStars: 0,
    skyColorTop: '#38BDF8',
    skyColorBottom: '#BAE6FD',
    groundColor: '#16A34A',
    groundAccentColor: '#84CC16',
    musicTrack: 'valley'
  },
  {
    id: 2,
    name: 'Lava Zone',
    subtitle: 'Molten Crags & Infernal Caverns',
    theme: 'lava_zone',
    description: 'Volcanic vents, bubbling magma pools, magma crabs, fire bats, and falling cinders.',
    unlocked: false,
    requiredStars: 6,
    skyColorTop: '#7F1D1D',
    skyColorBottom: '#F97316',
    groundColor: '#78350F',
    groundAccentColor: '#DC2626',
    musicTrack: 'lava'
  },
  {
    id: 3,
    name: 'Cyber City',
    subtitle: 'Neon Skyline & High-Speed Grids',
    theme: 'cyber_city',
    description: 'Holographic skyways, laser barriers, security drones, cyber hounds, and sentry turrets.',
    unlocked: false,
    requiredStars: 16,
    skyColorTop: '#0F172A',
    skyColorBottom: '#3B0764',
    groundColor: '#1E293B',
    groundAccentColor: '#06B6D4',
    musicTrack: 'cyber'
  },
  {
    id: 4,
    name: 'Legend Realm',
    subtitle: 'Celestial Citadel of the Ancients',
    theme: 'legend_realm',
    description: 'Floating enchanted islands, cosmic vortexes, void wisps, astral gargoyles, and the Void Titan.',
    unlocked: false,
    requiredStars: 28,
    skyColorTop: '#1E1B4B',
    skyColorBottom: '#6B21A8',
    groundColor: '#312E81',
    groundAccentColor: '#A855F7',
    musicTrack: 'legend'
  }
];

export function generateDefaultLevels(): Record<string, LevelConfig> {
  const levels: Record<string, LevelConfig> = {};

  WORLDS.forEach((world) => {
    for (let stage = 1; stage <= 5; stage++) {
      const levelId = `${world.id}-${stage}`;
      const isBoss = stage === 5;
      const stageNames: Record<number, string[]> = {
        1: ['Breeze Path', 'Wooden Crossings', 'Highland Platforms', 'Hidden Grotto', 'Boss: Forest Golem'],
        2: ['Basalt Trail', 'Magma Ridge', 'Volcanic Geysers', 'Crumbling Spire', 'Boss: Magma Colossus'],
        3: ['Neon Highway', 'Grid Pulse', 'Skyscraper Roofs', 'Overdrive Run', 'Boss: Cyber Mecha'],
        4: ['Astral Gateway', 'Gravity Ruins', 'Starfall Bridge', 'Celestial Nexus', 'Boss: Void Titan']
      };

      levels[levelId] = {
        id: levelId,
        worldId: world.id,
        stageNumber: stage,
        name: stageNames[world.id]?.[stage - 1] || `Stage ${stage}`,
        isBossStage: isBoss,
        unlocked: world.id === 1 && stage === 1,
        starsEarned: 0,
        highScore: 0,
        bestTime: 0,
        starsReq: {
          timeLimit: isBoss ? 90 : 60 + stage * 10,
          requiredCoinsPercent: 70
        },
        totalCoins: isBoss ? 50 : 50 + stage * 12,
        totalGems: isBoss ? 3 : 2
      };
    }
  });

  return levels;
}

export const DEFAULT_MISSIONS: Mission[] = [
  // Daily
  {
    id: 'daily_coins_50',
    category: 'daily',
    title: 'Daily Coin Collector',
    description: 'Collect 60 textured gold coins in any level.',
    targetCount: 60,
    currentCount: 0,
    completed: false,
    claimed: false,
    rewardType: 'coins',
    rewardAmount: 200
  },
  {
    id: 'daily_levels_2',
    category: 'daily',
    title: 'Stage Sprinter',
    description: 'Complete 2 platformer levels successfully.',
    targetCount: 2,
    currentCount: 0,
    completed: false,
    claimed: false,
    rewardType: 'gems',
    rewardAmount: 15
  },
  {
    id: 'daily_powers_3',
    category: 'daily',
    title: 'Super Surge',
    description: 'Activate character superpowers 3 times.',
    targetCount: 3,
    currentCount: 0,
    completed: false,
    claimed: false,
    rewardType: 'xp',
    rewardAmount: 250
  },

  // Adventure
  {
    id: 'adv_world1_clear',
    category: 'adventure',
    title: 'Valley Champion',
    description: 'Defeat the Forest Golem and clear World 1.',
    targetCount: 1,
    currentCount: 0,
    completed: false,
    claimed: false,
    rewardType: 'coins',
    rewardAmount: 500
  },
  {
    id: 'adv_stars_10',
    category: 'adventure',
    title: 'Star Seeker',
    description: 'Earn 8 stars across completed levels.',
    targetCount: 8,
    currentCount: 0,
    completed: false,
    claimed: false,
    rewardType: 'fragments',
    rewardAmount: 25
  },
  {
    id: 'adv_chests_3',
    category: 'adventure',
    title: 'Treasure Hunter',
    description: 'Open 3 hidden treasure chests in stages.',
    targetCount: 3,
    currentCount: 0,
    completed: false,
    claimed: false,
    rewardType: 'gems',
    rewardAmount: 30
  },

  // Character
  {
    id: 'char_dary_slides',
    category: 'character',
    title: 'Slide Master',
    description: 'Perform 10 slide maneuvers under obstacles.',
    targetCount: 10,
    currentCount: 0,
    completed: false,
    claimed: false,
    rewardType: 'fragments',
    rewardAmount: 20
  },
  {
    id: 'char_upgrade_any',
    category: 'character',
    title: 'Hero Awakening',
    description: 'Upgrade any character stat in the Upgrades Bay.',
    targetCount: 1,
    currentCount: 0,
    completed: false,
    claimed: false,
    rewardType: 'xp',
    rewardAmount: 350
  },

  // Legendary
  {
    id: 'leg_boss_triumph',
    category: 'legendary',
    title: 'Titan Slayer',
    description: 'Defeat any World Boss without taking more than 1 damage.',
    targetCount: 1,
    currentCount: 0,
    completed: false,
    claimed: false,
    rewardType: 'fragments',
    rewardAmount: 50
  },
  {
    id: 'leg_unlock_character',
    category: 'legendary',
    title: 'Legend Mastery',
    description: 'Master Dary the Thunder Sovereign in battle.',
    targetCount: 1,
    currentCount: 1,
    completed: true,
    claimed: false,
    rewardType: 'gems',
    rewardAmount: 50
  }
];

export function getInitialSaveData(): GameSaveData {
  return {
    coins: 0, // No free coins - earned through playing
    gems: 0,
    selectedCharacterId: 'char_zayn', // Zayn is the starter hero
    characters: DEFAULT_CHARACTERS,
    levels: generateDefaultLevels(),
    missions: DEFAULT_MISSIONS,
    stats: {
      totalCoinsCollected: 0,
      totalGemsCollected: 0,
      totalDistanceMeters: 0,
      totalEnemiesDefeated: 0,
      totalSuperpowersUsed: 0,
      totalBossesDefeated: 0,
      playerXp: 0,
      playerLevel: 1
    },
    settings: {
      musicVolume: 0.5,
      sfxVolume: 0.8,
      soundMuted: false,
      musicMuted: false,
      graphicsQuality: 'high',
      touchControlsVisible: true,
      touchSensitivity: 1.0
    },
    lastDailyClaimTimestamp: 0
  };
}

export function loadSaveData(): GameSaveData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getInitialSaveData();
    const data = JSON.parse(raw) as GameSaveData;
    const defaultData = getInitialSaveData();
    return {
      ...defaultData,
      ...data,
      characters: DEFAULT_CHARACTERS.map(dc => {
        const existing = data.characters?.find(c => c.id === dc.id);
        return existing ? { ...dc, ...existing, rarity: dc.rarity, powerName: dc.powerName, powerDescription: dc.powerDescription } : dc;
      }),
      stats: { ...defaultData.stats, ...(data.stats || {}) },
      settings: { ...defaultData.settings, ...(data.settings || {}) }
    };
  } catch {
    return getInitialSaveData();
  }
}

export function saveGameData(data: GameSaveData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save game data:', err);
  }
}
