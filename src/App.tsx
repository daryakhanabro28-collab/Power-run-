import { useState, useEffect, useCallback } from 'react';
import { GameSaveData, ScreenState, LevelConfig, Character } from './types/game';
import { loadSaveData, saveGameData, getInitialSaveData } from './game/constants';
import { soundManager } from './audio/soundManager';
import { GameCanvas } from './components/GameCanvas';
import { MainMenu } from './components/MainMenu';
import { CharacterSelectModal } from './components/CharacterSelectModal';
import { WorldMapModal } from './components/WorldMapModal';
import { UpgradeModal } from './components/UpgradeModal';
import { MissionsModal } from './components/MissionsModal';
import { ShopModal } from './components/ShopModal';
import { SettingsModal } from './components/SettingsModal';
import { PauseModal } from './components/PauseModal';
import { GameOverModal } from './components/GameOverModal';
import { VictoryModal } from './components/VictoryModal';
import { AboutModal } from './components/AboutModal';
import { CustomCharacterModal } from './components/CustomCharacterModal';
import { LevelCompleteResult } from './game/engine';

export default function App() {
  const [saveData, setSaveData] = useState<GameSaveData>(() => loadSaveData());
  const [screen, setScreen] = useState<ScreenState>('TITLE_MENU');
  const [activeLevel, setActiveLevel] = useState<LevelConfig>(() => saveData.levels['1-1'] || Object.values(saveData.levels)[0]);
  const [lastVictoryResult, setLastVictoryResult] = useState<LevelCompleteResult | null>(null);
  const [showAboutModal, setShowAboutModal] = useState<boolean>(false);
  const [showCustomCharModal, setShowCustomCharModal] = useState<boolean>(false);

  // Sync Audio on mount & changes
  useEffect(() => {
    soundManager.setVolumes(
      saveData.settings.sfxVolume,
      saveData.settings.musicVolume,
      saveData.settings.soundMuted
    );
  }, [saveData.settings]);

  // Persist Save Data
  const updateSave = useCallback((updater: (prev: GameSaveData) => GameSaveData) => {
    setSaveData((prev) => {
      const updated = updater(prev);
      saveGameData(updated);
      return updated;
    });
  }, []);

  const selectedCharacter = saveData.characters.find(c => c.id === saveData.selectedCharacterId) || saveData.characters[0];

  // Actions
  const handleSelectCharacter = (charId: string) => {
    updateSave((prev) => ({ ...prev, selectedCharacterId: charId }));
  };

  const handleUnlockCharacter = (charId: string, costCoins: number) => {
    updateSave((prev) => {
      if (prev.coins < costCoins) return prev;
      return {
        ...prev,
        coins: prev.coins - costCoins,
        characters: prev.characters.map((c) => (c.id === charId ? { ...c, unlocked: true } : c)),
        selectedCharacterId: charId
      };
    });
  };

  const handleRenameCharacter = (charId: string, newName: string) => {
    updateSave((prev) => ({
      ...prev,
      characters: prev.characters.map((c) => (c.id === charId ? { ...c, name: newName } : c))
    }));
  };

  const handleSaveCustomCharacter = (newChar: Character) => {
    updateSave((prev) => ({
      ...prev,
      characters: [newChar, ...prev.characters],
      selectedCharacterId: newChar.id
    }));
  };

  const handleUpgradeStat = (
    charId: string,
    statKey: 'speedLevel' | 'jumpLevel' | 'durationLevel' | 'cooldownLevel',
    cost: number
  ) => {
    updateSave((prev) => {
      if (prev.coins < cost) return prev;
      return {
        ...prev,
        coins: prev.coins - cost,
        characters: prev.characters.map((c) => {
          if (c.id !== charId) return c;
          return {
            ...c,
            upgrades: {
              ...c.upgrades,
              [statKey]: Math.min(5, c.upgrades[statKey] + 1)
            }
          };
        })
      };
    });
  };

  const handleClaimMission = (missionId: string) => {
    updateSave((prev) => {
      const m = prev.missions.find((x) => x.id === missionId);
      if (!m || m.claimed || m.currentCount < m.targetCount) return prev;

      let newCoins = prev.coins;
      let newGems = prev.gems;
      let newXp = prev.stats.playerXp;

      if (m.rewardType === 'coins') newCoins += m.rewardAmount;
      if (m.rewardType === 'gems') newGems += m.rewardAmount;
      if (m.rewardType === 'xp') newXp += m.rewardAmount;

      return {
        ...prev,
        coins: newCoins,
        gems: newGems,
        stats: { ...prev.stats, playerXp: newXp },
        missions: prev.missions.map((x) => (x.id === missionId ? { ...x, claimed: true } : x))
      };
    });
  };

  const handleAddCurrency = (addCoins: number, addGems: number, addFragments: number) => {
    updateSave((prev) => {
      const updatedChars = prev.characters.map((c) => ({
        ...c,
        currentFragments: c.currentFragments + addFragments
      }));
      return {
        ...prev,
        coins: prev.coins + addCoins,
        gems: prev.gems + addGems,
        characters: updatedChars,
        lastDailyClaimTimestamp: Date.now()
      };
    });
  };

  const handleSpendCoins = (amount: number): boolean => {
    if (saveData.coins < amount) return false;
    updateSave((prev) => ({ ...prev, coins: prev.coins - amount }));
    return true;
  };

  const handleSpendGems = (amount: number): boolean => {
    if (saveData.gems < amount) return false;
    updateSave((prev) => ({ ...prev, gems: prev.gems - amount }));
    return true;
  };

  // Play Level
  const handleStartLevel = (level: LevelConfig) => {
    setActiveLevel(level);
    setScreen('PLAYING');
  };

  // Level Complete
  const handleLevelComplete = (result: LevelCompleteResult) => {
    setLastVictoryResult(result);
    setScreen('VICTORY');

    // Update level progression & stars
    updateSave((prev) => {
      const lvl = prev.levels[result.levelId];
      const newStars = Math.max(lvl?.starsEarned || 0, result.starsEarned);
      const newBestTime = lvl?.bestTime === 0 ? result.timeTakenSeconds : Math.min(lvl?.bestTime || 999, result.timeTakenSeconds);
      const newHighScore = Math.max(lvl?.highScore || 0, result.score);

      // Unlock next stage if this stage is beaten
      const parts = result.levelId.split('-');
      const worldNum = parseInt(parts[0], 10);
      const stageNum = parseInt(parts[1], 10);

      const nextLevels = { ...prev.levels };
      nextLevels[result.levelId] = {
        ...lvl,
        starsEarned: newStars,
        bestTime: newBestTime,
        highScore: newHighScore
      };

      if (stageNum < 5) {
        const nextId = `${worldNum}-${stageNum + 1}`;
        if (nextLevels[nextId]) {
          nextLevels[nextId] = { ...nextLevels[nextId], unlocked: true };
        }
      } else if (worldNum < 4) {
        // Unlock first stage of next world
        const nextId = `${worldNum + 1}-1`;
        if (nextLevels[nextId]) {
          nextLevels[nextId] = { ...nextLevels[nextId], unlocked: true };
        }
      }

      // Update stats and missions
      const updatedMissions = prev.missions.map((m) => {
        if (m.id === 'daily_coins_50') {
          return { ...m, currentCount: Math.min(m.targetCount, m.currentCount + result.coinsCollected) };
        }
        if (m.id === 'daily_levels_2') {
          return { ...m, currentCount: Math.min(m.targetCount, m.currentCount + 1) };
        }
        if (m.id === 'adv_stars_10') {
          const totalStars = Object.values(nextLevels).reduce((acc, l) => acc + (l.starsEarned || 0), 0);
          return { ...m, currentCount: Math.min(m.targetCount, totalStars) };
        }
        return m;
      });

      return {
        ...prev,
        coins: prev.coins + result.coinsCollected,
        gems: prev.gems + result.gemsCollected,
        levels: nextLevels,
        missions: updatedMissions,
        stats: {
          ...prev.stats,
          totalCoinsCollected: prev.stats.totalCoinsCollected + result.coinsCollected,
          totalGemsCollected: prev.stats.totalGemsCollected + result.gemsCollected,
          playerXp: prev.stats.playerXp + result.score
        }
      };
    });
  };

  const handleNextStage = () => {
    if (!lastVictoryResult) return;
    const parts = lastVictoryResult.levelId.split('-');
    const worldNum = parseInt(parts[0], 10);
    const stageNum = parseInt(parts[1], 10);

    let nextId = '';
    if (stageNum < 5) {
      nextId = `${worldNum}-${stageNum + 1}`;
    } else if (worldNum < 4) {
      nextId = `${worldNum + 1}-1`;
    }

    if (nextId && saveData.levels[nextId]) {
      setActiveLevel(saveData.levels[nextId]);
      setScreen('PLAYING');
    } else {
      setScreen('WORLD_SELECT');
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans">
      {/* Active Game Canvas Viewport */}
      {screen === 'PLAYING' && (
        <GameCanvas
          character={selectedCharacter}
          level={activeLevel}
          onLevelComplete={handleLevelComplete}
          onGameOver={() => setScreen('GAME_OVER')}
          onPause={() => setScreen('PAUSED')}
          touchControlsVisible={saveData.settings.touchControlsVisible}
        />
      )}

      {/* Main Title Menu */}
      {screen === 'TITLE_MENU' && (
        <MainMenu
          selectedCharacter={selectedCharacter}
          coins={saveData.coins}
          gems={saveData.gems}
          stats={saveData.stats}
          onPlayClick={() => setScreen('PLAYING')}
          onAboutClick={() => setShowAboutModal(true)}
          onNavigate={(view) => setScreen(view as ScreenState)}
        />
      )}

      {/* Roster Modal */}
      {screen === 'CHARACTER_ROSTER' && (
        <CharacterSelectModal
          characters={saveData.characters}
          selectedCharacterId={saveData.selectedCharacterId}
          coins={saveData.coins}
          onSelectCharacter={handleSelectCharacter}
          onUnlockCharacter={handleUnlockCharacter}
          onRenameCharacter={handleRenameCharacter}
          onCreateCustomClick={() => setShowCustomCharModal(true)}
          onClose={() => setScreen('TITLE_MENU')}
        />
      )}

      {/* World Map & Stages Modal */}
      {screen === 'WORLD_SELECT' && (
        <WorldMapModal
          levels={saveData.levels}
          onSelectLevel={handleStartLevel}
          onClose={() => setScreen('TITLE_MENU')}
        />
      )}

      {/* Upgrades Bay Modal */}
      {screen === 'UPGRADES' && (
        <UpgradeModal
          characters={saveData.characters}
          selectedCharacterId={saveData.selectedCharacterId}
          coins={saveData.coins}
          onUpgradeStat={handleUpgradeStat}
          onClose={() => setScreen('TITLE_MENU')}
        />
      )}

      {/* Missions Modal */}
      {screen === 'MISSIONS' && (
        <MissionsModal
          missions={saveData.missions}
          onClaimMission={handleClaimMission}
          onClose={() => setScreen('TITLE_MENU')}
        />
      )}

      {/* Shop Modal */}
      {screen === 'SHOP' && (
        <ShopModal
          coins={saveData.coins}
          gems={saveData.gems}
          lastDailyClaim={saveData.lastDailyClaimTimestamp}
          onAddCurrency={handleAddCurrency}
          onSpendCoins={handleSpendCoins}
          onSpendGems={handleSpendGems}
          onClose={() => setScreen('TITLE_MENU')}
        />
      )}

      {/* Settings Modal */}
      {screen === 'SETTINGS' && (
        <SettingsModal
          settings={saveData.settings}
          onUpdateSettings={(newSettings) => updateSave((prev) => ({ ...prev, settings: newSettings }))}
          onResetProgress={() => {
            const initial = getInitialSaveData();
            saveGameData(initial);
            setSaveData(initial);
            soundManager.playButtonClick();
          }}
          onOpenAbout={() => setShowAboutModal(true)}
          onClose={() => setScreen('TITLE_MENU')}
        />
      )}

      {/* Pause Modal */}
      {screen === 'PAUSED' && (
        <PauseModal
          onResume={() => setScreen('PLAYING')}
          onRestart={() => setScreen('PLAYING')}
          onQuitToMenu={() => {
            soundManager.stopBGM();
            setScreen('TITLE_MENU');
          }}
        />
      )}

      {/* Game Over Modal */}
      {screen === 'GAME_OVER' && (
        <GameOverModal
          onRetry={() => setScreen('PLAYING')}
          onQuitToMenu={() => {
            soundManager.stopBGM();
            setScreen('TITLE_MENU');
          }}
        />
      )}

      {/* Victory Modal */}
      {screen === 'VICTORY' && lastVictoryResult && (
        <VictoryModal
          result={lastVictoryResult}
          onNextStage={handleNextStage}
          onReplayStage={() => setScreen('PLAYING')}
          onQuitToMenu={() => {
            soundManager.stopBGM();
            setScreen('TITLE_MENU');
          }}
        />
      )}

      {/* About Developer Modal */}
      {showAboutModal && (
        <AboutModal onClose={() => setShowAboutModal(false)} />
      )}

      {/* Custom Character Creator Modal */}
      {showCustomCharModal && (
        <CustomCharacterModal
          onSaveCustomCharacter={handleSaveCustomCharacter}
          onClose={() => setShowCustomCharModal(false)}
        />
      )}
    </div>
  );
}
