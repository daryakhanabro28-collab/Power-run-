import { Character, LevelConfig, WorldConfig } from '../types/game';
import { WORLDS } from './constants';
import { drawCharacter, CharacterRenderState } from './characterRenderer';
import { soundManager } from '../audio/soundManager';

export interface GameEngineCallbacks {
  onCoinCollected: (totalLevelCoins: number) => void;
  onGemCollected: (totalLevelGems: number) => void;
  onHealthChanged: (currentHealth: number, maxHealth: number) => void;
  onSuperpowerChanged: (ready: boolean, cooldownPercent: number, active: boolean) => void;
  onLevelComplete: (result: LevelCompleteResult) => void;
  onGameOver: () => void;
}

export interface LevelCompleteResult {
  levelId: string;
  coinsCollected: number;
  totalCoinsInLevel: number;
  gemsCollected: number;
  timeTakenSeconds: number;
  starsEarned: number;
  score: number;
  characterFragmentsFound: number;
}

// Particle
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

// Projectile
interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  isPlayer: boolean;
  damage: number;
  life: number;
}

// Platform
interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'solid' | 'grass' | 'moving_h' | 'moving_v';
  startX?: number;
  endX?: number;
  startY?: number;
  endY?: number;
  speed?: number;
  dir?: number;
}

// Hazard
interface Hazard {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'spikes' | 'saw';
  angle?: number;
}

export type MonsterType =
  // World 1
  | 'slime'
  | 'briar_beast'
  | 'wasp'
  // World 2
  | 'magma_crab'
  | 'fire_bat'
  | 'lava_golem_mini'
  // World 3
  | 'security_drone'
  | 'cyber_hound'
  | 'laser_sentry'
  // World 4
  | 'void_wisp'
  | 'astral_gargoyle'
  | 'celestial_sentinel';

// Monster
interface Monster {
  id: string;
  x: number;
  y: number;
  startY: number;
  width: number;
  height: number;
  vx: number;
  type: MonsterType;
  minX: number;
  maxX: number;
  alive: boolean;
  canBeStomped: boolean;
  facingRight: boolean;
  animTimer: number;
  isFlying: boolean;
}

// Boss
interface Boss {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  maxHp: number;
  hp: number;
  vx: number;
  attackTimer: number;
  state: 'idle' | 'telegraph' | 'slam' | 'projectile';
  invulnerableTimer: number;
  defeated: boolean;
}

// Collectibles
interface Collectible {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'coin' | 'gem' | 'chest';
  collected: boolean;
  value: number;
}

// Checkpoint
interface Checkpoint {
  x: number;
  y: number;
  activated: boolean;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private callbacks: GameEngineCallbacks;

  public character: Character;
  public level: LevelConfig;
  public world: WorldConfig;

  // Loop & timing
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private lastFrameTime: number = 0;
  private animationFrameId: number = 0;
  private gameTime: number = 0;
  private levelStartTime: number = 0;

  // Level World Bounds
  private levelWidth: number = 4200;
  private levelHeight: number = 850;
  private exitPortalX: number = 4050;
  private exitPortalY: number = 640;

  // Player state
  private playerX: number = 100;
  private playerY: number = 640;
  private prevPlayerX: number = 100;
  private prevPlayerY: number = 640;
  private playerVx: number = 0;
  private playerVy: number = 0;
  private playerWidth: number = 32;
  private playerHeight: number = 52;
  private playerGrounded: boolean = false;
  private playerFacingRight: boolean = true;
  private playerHealth: number = 3;
  private playerMaxHealth: number = 3;
  private playerInvincibleTimer: number = 0;
  private playerSquash: number = 1.0;
  private runCycle: number = 0;

  // Checkpoint
  private lastCheckpoint: { x: number; y: number } = { x: 100, y: 640 };

  // Jump / Slide dynamics
  private coyoteTimer: number = 0;
  private jumpBufferTimer: number = 0;
  private isSliding: boolean = false;
  private slideTimer: number = 0;

  // Superpower
  private superpowerReady: boolean = true;
  private superpowerActive: boolean = false;
  private superpowerActiveTimer: number = 0;
  private superpowerCooldownTimer: number = 0;
  private afterImages: Array<{ x: number; y: number; opacity: number; color: string }> = [];

  // Statistics for current run
  private coinsCollected: number = 0;
  private gemsCollected: number = 0;
  private score: number = 0;
  private enemiesDefeated: number = 0;
  private characterFragmentsFound: number = 0;

  // Camera
  private cameraX: number = 0;
  private cameraY: number = 0;
  private screenShake: number = 0;

  // Inputs
  private keys: Record<string, boolean> = {};
  public touchInputs: { left: boolean; right: boolean; jump: boolean; slide: boolean; power: boolean } = {
    left: false,
    right: false,
    jump: false,
    slide: false,
    power: false
  };

  // World entities
  private platforms: Platform[] = [];
  private hazards: Hazard[] = [];
  private monsters: Monster[] = [];
  private collectibles: Collectible[] = [];
  private checkpoints: Checkpoint[] = [];
  private particles: Particle[] = [];
  private projectiles: Projectile[] = [];
  private boss: Boss | null = null;

  constructor(
    canvas: HTMLCanvasElement,
    character: Character,
    level: LevelConfig,
    callbacks: GameEngineCallbacks
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false })!;
    this.character = character;
    this.level = level;
    this.callbacks = callbacks;
    this.world = WORLDS.find((w) => w.id === level.worldId) || WORLDS[0];

    this.bindInputs();
    this.initLevel();
  }

  private bindInputs() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('blur', this.handleBlur);
  }

  public destroy() {
    this.stop();
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('blur', this.handleBlur);
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    this.keys[e.code] = true;
    if (e.code === 'KeyW' || e.code === 'ArrowUp' || e.code === 'Space') {
      this.jumpBufferTimer = 0.16;
    }
    if (e.code === 'KeyE' || e.code === 'KeyX' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
      this.triggerSuperpower();
    }
    if (e.code === 'KeyS' || e.code === 'ArrowDown') {
      this.startSlide();
    }
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    this.keys[e.code] = false;
  };

  private handleBlur = () => {
    this.keys = {};
    this.touchInputs = { left: false, right: false, jump: false, slide: false, power: false };
  };

  public triggerSuperpower() {
    if (!this.superpowerReady || this.superpowerActive) return;

    this.superpowerReady = false;
    this.superpowerActive = true;

    const durationMultiplier = 1 + (this.character.upgrades.durationLevel - 1) * 0.15;
    const cooldownMultiplier = 1 - (this.character.upgrades.cooldownLevel - 1) * 0.1;

    this.superpowerActiveTimer = this.character.baseStats.powerDuration * durationMultiplier;
    this.superpowerCooldownTimer = this.character.baseStats.powerCooldown * cooldownMultiplier;

    soundManager.playPower(this.character.powerType);
    this.createShockwave(this.playerX + this.playerWidth / 2, this.playerY + this.playerHeight / 2, this.character.accentColor);

    // Legendary Dary Overdrive: Celstial Lightning Overdrive
    if (this.character.id === 'char_dary' || this.character.powerType === 'thunder') {
      this.playerVx = (this.playerFacingRight ? 1 : -1) * 18;
      this.screenShake = 16;
      // Vaporize all on-screen monsters!
      this.monsters.forEach((m) => {
        if (Math.abs(m.x - this.playerX) < 700 && m.alive) {
          m.alive = false;
          this.enemiesDefeated++;
          this.score += 300;
          this.createSparks(m.x + m.width / 2, m.y + m.height / 2, '#FEF08A', 25);
        }
      });
      // Stun/damage boss if present
      if (this.boss && !this.boss.defeated) {
        this.hitBoss(2);
      }
    } else if (this.character.powerType === 'fire') {
      const dir = this.playerFacingRight ? 1 : -1;
      this.projectiles.push({
        x: this.playerX + (dir > 0 ? this.playerWidth + 10 : -10),
        y: this.playerY + this.playerHeight / 2 - 8,
        vx: dir * 15,
        vy: 0,
        radius: 14,
        color: '#EF4444',
        isPlayer: true,
        damage: 3,
        life: 2.0
      });
    }
  }

  private startSlide() {
    if (!this.playerGrounded || this.isSliding) return;
    this.isSliding = true;
    this.slideTimer = 0.52;
    soundManager.playSlide();
    this.playerVx = (this.playerFacingRight ? 1 : -1) * 12;
  }

  public initLevel() {
    this.platforms = [];
    this.hazards = [];
    this.monsters = [];
    this.collectibles = [];
    this.checkpoints = [];
    this.particles = [];
    this.projectiles = [];
    this.boss = null;

    this.playerX = 100;
    this.playerY = 640;
    this.prevPlayerX = 100;
    this.prevPlayerY = 640;
    this.playerVx = 0;
    this.playerVy = 0;
    this.playerHealth = 3;
    this.coinsCollected = 0;
    this.gemsCollected = 0;
    this.score = 0;
    this.enemiesDefeated = 0;
    this.characterFragmentsFound = 0;
    this.lastCheckpoint = { x: 100, y: 640 };

    this.superpowerReady = true;
    this.superpowerActive = false;
    this.superpowerActiveTimer = 0;
    this.superpowerCooldownTimer = 0;

    const isBossStage = this.level.isBossStage;
    const stage = this.level.stageNumber;
    const worldId = this.world.id;

    // Progressive level length: start shorter & approachable, scale up as world progresses
    if (isBossStage) {
      this.levelWidth = 2600;
    } else if (worldId === 1 && stage === 1) {
      this.levelWidth = 2500; // Easy starter level
    } else if (worldId === 1 && stage === 2) {
      this.levelWidth = 3200; // Moderate introductory level
    } else {
      this.levelWidth = 3800 + Math.min(600, stage * 100);
    }
    this.exitPortalX = this.levelWidth - 220;
    this.exitPortalY = 630;

    // Ground floor at y = 700 (Height = 150)
    this.platforms.push({
      x: 0,
      y: 700,
      width: this.levelWidth,
      height: 150,
      type: 'grass'
    });

    if (isBossStage) {
      this.buildBossStage();
    } else {
      this.buildPlatformerStage();
    }

    this.callbacks.onHealthChanged(this.playerHealth, this.playerMaxHealth);
    this.callbacks.onCoinCollected(this.coinsCollected);
    this.callbacks.onGemCollected(this.gemsCollected);
    this.callbacks.onSuperpowerChanged(true, 100, false);
  }

  /**
   * Deterministic, balanced platform generator with progressive difficulty curve
   * World 1 Stage 1: Easy, wide platforms, slow slimes, zero spikes
   * Higher Stages: Progressively adds moving platforms, spike traps, fast monsters
   */
  private buildPlatformerStage() {
    const stage = this.level.stageNumber;
    const worldId = this.world.id;
    const isEasyStage = worldId === 1 && stage <= 2;
    let curX = 260;
    let lastY = 700; // start from ground

    while (curX < this.levelWidth - 450) {
      // Step delta constrained strictly for player reachability
      const stepOptions = isEasyStage ? [-45, 0, 45] : [-75, -50, 0, 50, 75];
      const stepDelta = stepOptions[Math.floor(Math.random() * stepOptions.length)];
      let platY = Math.max(500, Math.min(630, lastY + stepDelta));

      if (Math.random() < 0.2) platY = 620;

      // Wider platforms for early stages, narrower for later worlds
      const platW = isEasyStage
        ? 240 + Math.floor(Math.random() * 2) * 60
        : 150 + Math.floor(Math.random() * 3) * 45;

      this.platforms.push({
        x: curX,
        y: platY,
        width: platW,
        height: 28,
        type: 'grass'
      });

      // Place Textured Coins on top of platform (strictly reachable!)
      const coinCount = 3 + Math.floor(Math.random() * 2);
      for (let c = 0; c < coinCount; c++) {
        this.collectibles.push({
          id: `coin_${curX}_${c}`,
          x: curX + 22 + c * 34,
          y: platY - 26,
          width: 22,
          height: 22,
          type: 'coin',
          collected: false,
          value: 1
        });
      }

      // Treasure Chest on some platforms
      if (Math.random() < 0.3 && curX > 600 && curX < this.levelWidth - 600) {
        this.collectibles.push({
          id: `chest_${curX}`,
          x: curX + platW - 40,
          y: platY - 36,
          width: 32,
          height: 32,
          type: 'chest',
          collected: false,
          value: 15
        });
      }

      // Moving platform link between wider gaps
      if (Math.random() < 0.35 && curX < this.levelWidth - 800) {
        const moveStartX = curX + platW + 30;
        const moveEndX = moveStartX + 180;
        this.platforms.push({
          x: moveStartX,
          y: platY - 30,
          width: 120,
          height: 24,
          type: 'moving_h',
          startX: moveStartX,
          endX: moveEndX,
          speed: 1.6,
          dir: 1
        });
      }

      // Ground Spikes / Hazards: None in Stage 1-1! Scales up gradually
      const allowSpikes = !(worldId === 1 && stage === 1);
      if (allowSpikes && Math.random() < (isEasyStage ? 0.2 : 0.45) && curX > 500) {
        this.hazards.push({
          x: curX + platW + 20,
          y: 678,
          width: 48,
          height: 22,
          type: 'spikes'
        });
      }

      // World-Specific Monsters spawning on platform or in air
      this.spawnWorldMonster(curX, platY, platW);

      // Checkpoint at midpoint
      if (curX > 1800 && curX < 2400 && this.checkpoints.length === 0) {
        this.checkpoints.push({
          x: curX + 50,
          y: platY - 60,
          activated: false
        });
      }

      lastY = platY;
      curX += platW + (isEasyStage ? 55 : 90) + (stage > 2 ? 30 : 0);
    }

    // Rare Gems placed on key platforms
    this.collectibles.push({
      id: 'gem_1',
      x: 1100,
      y: 530,
      width: 24,
      height: 24,
      type: 'gem',
      collected: false,
      value: 1
    });

    this.collectibles.push({
      id: 'gem_2',
      x: 2750,
      y: 510,
      width: 24,
      height: 24,
      type: 'gem',
      collected: false,
      value: 1
    });
  }

  /**
   * Spawns distinct, unique monsters based on the active world & stage difficulty
   */
  private spawnWorldMonster(platX: number, platY: number, platW: number) {
    const worldId = this.world.id;
    const stage = this.level.stageNumber;
    const rnd = Math.random();

    let mType: MonsterType = 'slime';
    let isFlying = false;
    let canBeStomped = true;
    let yPos = platY - 32;

    if (worldId === 1) {
      // Green Valley
      if (stage === 1) {
        // Stage 1-1 is easy: only friendly stompable slimes
        mType = 'slime';
        canBeStomped = true;
      } else if (stage === 2) {
        // Stage 1-2 introduces occasional wasps
        if (rnd < 0.7) {
          mType = 'slime';
        } else {
          mType = 'wasp';
          isFlying = true;
          yPos = platY - 65;
        }
      } else {
        // Stage 1-3+: Full variety with spiky briar beasts
        if (rnd < 0.35) {
          mType = 'slime';
        } else if (rnd < 0.7) {
          mType = 'briar_beast';
          canBeStomped = false;
        } else {
          mType = 'wasp';
          isFlying = true;
          yPos = platY - 70;
        }
      }
    } else if (worldId === 2) {
      // Lava Zone
      if (rnd < 0.4) {
        mType = 'magma_crab';
      } else if (rnd < 0.75) {
        mType = 'lava_golem_mini';
      } else {
        mType = 'fire_bat';
        isFlying = true;
        yPos = platY - 75;
      }
    } else if (worldId === 3) {
      // Cyber City
      if (rnd < 0.4) {
        mType = 'cyber_hound';
      } else if (rnd < 0.75) {
        mType = 'laser_sentry';
        canBeStomped = false;
      } else {
        mType = 'security_drone';
        isFlying = true;
        yPos = platY - 80;
      }
    } else {
      // Legend Realm
      if (rnd < 0.4) {
        mType = 'void_wisp';
        isFlying = true;
        yPos = platY - 65;
      } else if (rnd < 0.75) {
        mType = 'astral_gargoyle';
        isFlying = true;
        yPos = platY - 85;
      } else {
        mType = 'celestial_sentinel';
        canBeStomped = false;
      }
    }

    this.monsters.push({
      id: `monster_${platX}_${mType}`,
      x: platX + 40,
      y: yPos,
      startY: yPos,
      width: 32,
      height: 32,
      vx: isFlying ? 1.2 : 1.4,
      type: mType,
      minX: platX + 15,
      maxX: platX + platW - 40,
      alive: true,
      canBeStomped,
      facingRight: true,
      animTimer: Math.random() * 10,
      isFlying
    });
  }

  private buildBossStage() {
    this.platforms.push({ x: 350, y: 570, width: 220, height: 26, type: 'grass' });
    this.platforms.push({ x: 750, y: 490, width: 260, height: 26, type: 'grass' });
    this.platforms.push({ x: 1200, y: 570, width: 220, height: 26, type: 'grass' });
    this.platforms.push({ x: 1600, y: 490, width: 240, height: 26, type: 'grass' });

    const bossNames: Record<number, { name: string; hp: number }> = {
      1: { name: 'Woodland Golem', hp: 7 },
      2: { name: 'Magma Colossus', hp: 9 },
      3: { name: 'Cyber Mecha Overlord', hp: 11 },
      4: { name: 'Void Titan Sovereign', hp: 14 }
    };
    const bInfo = bossNames[this.level.worldId] || { name: 'Boss Titan', hp: 8 };

    this.boss = {
      name: bInfo.name,
      x: 1450,
      y: 590,
      width: 76,
      height: 110,
      maxHp: bInfo.hp,
      hp: bInfo.hp,
      vx: -1.6,
      attackTimer: 3.0,
      state: 'idle',
      invulnerableTimer: 0,
      defeated: false
    };

    this.collectibles.push({ id: 'boss_gem_1', x: 800, y: 450, width: 24, height: 24, type: 'gem', collected: false, value: 1 });
    this.collectibles.push({ id: 'boss_gem_2', x: 1650, y: 450, width: 24, height: 24, type: 'gem', collected: false, value: 1 });
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.isPaused = false;
    this.lastFrameTime = performance.now();
    this.levelStartTime = performance.now();
    soundManager.startBGM(this.world.musicTrack);
    this.loop(performance.now());
  }

  public pause() {
    this.isPaused = true;
  }

  public resume() {
    if (!this.isRunning) return;
    this.isPaused = false;
    this.lastFrameTime = performance.now();
    this.loop(performance.now());
  }

  public stop() {
    this.isRunning = false;
    soundManager.stopBGM();
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = 0;
    }
  }

  private loop = (time: number) => {
    if (!this.isRunning) return;
    if (this.isPaused) return;

    const rawDt = (time - this.lastFrameTime) / 1000;
    const dt = Math.min(rawDt, 0.04);
    this.lastFrameTime = time;
    this.gameTime += dt;

    this.update(dt);
    this.render();

    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  private update(dt: number) {
    this.prevPlayerX = this.playerX;
    this.prevPlayerY = this.playerY;

    // 1. Controls
    const moveLeft = this.keys['KeyA'] || this.keys['ArrowLeft'] || this.touchInputs.left;
    const moveRight = this.keys['KeyD'] || this.keys['ArrowRight'] || this.touchInputs.right;
    const jumpPressed = this.keys['KeyW'] || this.keys['ArrowUp'] || this.keys['Space'] || this.touchInputs.jump;
    const slidePressed = this.keys['KeyS'] || this.keys['ArrowDown'] || this.touchInputs.slide;
    const powerPressed = this.keys['KeyE'] || this.keys['KeyX'] || this.touchInputs.power;

    if (powerPressed) this.triggerSuperpower();
    if (slidePressed) this.startSlide();

    // Speed calculation
    const speedMultiplier = 1 + (this.character.upgrades.speedLevel - 1) * 0.08;
    const baseSpeed = this.character.baseStats.speed * speedMultiplier;
    const targetSpeed = this.superpowerActive && (this.character.powerType === 'chrono' || this.character.id === 'char_dary')
      ? baseSpeed * 1.55
      : baseSpeed;

    if (this.isSliding) {
      this.slideTimer -= dt;
      if (this.slideTimer <= 0) this.isSliding = false;
      this.playerVx *= 0.95;
    } else {
      if (moveLeft && !moveRight) {
        this.playerVx = -targetSpeed;
        this.playerFacingRight = false;
        this.runCycle += dt * 14;
      } else if (moveRight && !moveLeft) {
        this.playerVx = targetSpeed;
        this.playerFacingRight = true;
        this.runCycle += dt * 14;
      } else {
        this.playerVx *= 0.78;
        if (Math.abs(this.playerVx) < 0.15) this.playerVx = 0;
      }
    }

    // 2. Jumping & Coyote Time
    if (this.playerGrounded) {
      this.coyoteTimer = 0.14;
    } else {
      this.coyoteTimer -= dt;
    }

    if (jumpPressed) {
      this.jumpBufferTimer = 0.16;
    } else {
      this.jumpBufferTimer -= dt;
    }

    if (this.jumpBufferTimer > 0 && this.coyoteTimer > 0 && !this.isSliding) {
      const jumpMultiplier = 1 + (this.character.upgrades.jumpLevel - 1) * 0.08;
      const jumpImpulse = -14.6 * jumpMultiplier;
      this.playerVy = jumpImpulse;
      this.playerGrounded = false;
      this.coyoteTimer = 0;
      this.jumpBufferTimer = 0;
      this.playerSquash = 1.35;
      soundManager.playJump();
      this.createJumpPuff(this.playerX + this.playerWidth / 2, this.playerY + this.playerHeight);
    }

    // Gravity
    const isAeroGliding = this.character.powerType === 'aero' && this.superpowerActive && jumpPressed && this.playerVy > 0;
    const gravity = isAeroGliding ? 14 : 33;
    this.playerVy += gravity * dt;
    if (this.playerVy > 17) this.playerVy = 17; // Terminal velocity

    // Move player
    this.playerX += this.playerVx;
    this.playerY += this.playerVy;

    // Boundaries
    if (this.playerX < 0) this.playerX = 0;
    if (this.playerX > this.levelWidth - this.playerWidth) this.playerX = this.levelWidth - this.playerWidth;

    // Fall in abyss
    if (this.playerY > this.levelHeight + 80) {
      this.takeDamage(1, true);
    }

    // 3. Bulletproof Platform Collision Resolution
    const currentHeight = this.isSliding ? 28 : this.playerHeight;
    const wasGrounded = this.playerGrounded;
    this.playerGrounded = false;

    for (const plat of this.platforms) {
      // Update moving platforms
      if (plat.type === 'moving_h' && plat.startX && plat.endX && plat.speed && plat.dir) {
        plat.x += plat.speed * plat.dir;
        if (plat.x > plat.endX) {
          plat.x = plat.endX;
          plat.dir = -1;
        } else if (plat.x < plat.startX) {
          plat.x = plat.startX;
          plat.dir = 1;
        }
      }

      const playerLeft = this.playerX;
      const playerRight = this.playerX + this.playerWidth;
      const platLeft = plat.x;
      const platRight = plat.x + plat.width;

      // Horizontal overlap
      if (playerRight > platLeft + 3 && playerLeft < platRight - 3) {
        // Landing from above: previous feet were above or at platform top
        if (
          this.prevPlayerY + currentHeight <= plat.y + 14 &&
          this.playerY + currentHeight >= plat.y &&
          this.playerVy >= 0
        ) {
          this.playerY = plat.y - currentHeight;
          this.playerVy = 0;
          this.playerGrounded = true;

          // Platform carry
          if (plat.type === 'moving_h' && plat.speed && plat.dir) {
            this.playerX += plat.speed * plat.dir;
          }

          if (!wasGrounded) {
            this.playerSquash = 0.78;
            soundManager.playLanding();
          }
        }
        // Hitting ceiling from below
        else if (
          this.prevPlayerY >= plat.y + plat.height - 8 &&
          this.playerY <= plat.y + plat.height &&
          this.playerVy < 0
        ) {
          this.playerY = plat.y + plat.height;
          this.playerVy = 0;
        }
      }
    }

    this.playerSquash += (1.0 - this.playerSquash) * 0.18;

    // 4. Superpower Cooldowns
    if (this.superpowerActive) {
      this.superpowerActiveTimer -= dt;
      if (Math.abs(this.playerVx) > 2 || this.character.id === 'char_dary' || this.character.powerType === 'chrono') {
        this.afterImages.unshift({
          x: this.playerX,
          y: this.playerY,
          opacity: 0.85,
          color: this.character.accentColor
        });
        if (this.afterImages.length > 5) this.afterImages.pop();
      }

      // Aero coin suction
      if (this.character.powerType === 'aero') {
        for (const col of this.collectibles) {
          if (!col.collected && col.type === 'coin') {
            const dist = Math.hypot(col.x - this.playerX, col.y - this.playerY);
            if (dist < 260) {
              col.x += (this.playerX - col.x) * 0.12;
              col.y += (this.playerY - col.y) * 0.12;
            }
          }
        }
      }

      if (this.superpowerActiveTimer <= 0) {
        this.superpowerActive = false;
        this.afterImages = [];
      }
    } else if (!this.superpowerReady) {
      this.superpowerCooldownTimer -= dt;
      if (this.superpowerCooldownTimer <= 0) {
        this.superpowerReady = true;
      }
    }

    for (const ghost of this.afterImages) ghost.opacity -= dt * 3;
    this.afterImages = this.afterImages.filter((g) => g.opacity > 0);

    const cooldownPercent = this.superpowerReady
      ? 100
      : Math.max(0, 100 - (this.superpowerCooldownTimer / this.character.baseStats.powerCooldown) * 100);
    this.callbacks.onSuperpowerChanged(this.superpowerReady, cooldownPercent, this.superpowerActive);

    if (this.playerInvincibleTimer > 0) this.playerInvincibleTimer -= dt;

    // 5. Collectibles Detection
    const pBox = {
      x: this.playerX,
      y: this.playerY,
      width: this.playerWidth,
      height: currentHeight
    };

    for (const item of this.collectibles) {
      if (item.collected) continue;
      if (
        pBox.x < item.x + item.width &&
        pBox.x + pBox.width > item.x &&
        pBox.y < item.y + item.height &&
        pBox.y + pBox.height > item.y
      ) {
        item.collected = true;
        if (item.type === 'coin') {
          this.coinsCollected++;
          this.score += 100;
          soundManager.playCoin();
          this.createSparks(item.x + item.width / 2, item.y + item.height / 2, '#FBBF24', 8);
          this.callbacks.onCoinCollected(this.coinsCollected);
        } else if (item.type === 'gem') {
          this.gemsCollected++;
          this.score += 500;
          soundManager.playGem();
          this.createSparks(item.x + item.width / 2, item.y + item.height / 2, '#38BDF8', 15);
          this.callbacks.onGemCollected(this.gemsCollected);
        } else if (item.type === 'chest') {
          this.coinsCollected += item.value;
          this.characterFragmentsFound += 5;
          this.score += 1000;
          soundManager.playChestOpen();
          this.createShockwave(item.x + item.width / 2, item.y + item.height / 2, '#F59E0B');
          this.callbacks.onCoinCollected(this.coinsCollected);
        }
      }
    }

    // 6. Hazards Collision
    for (const hazard of this.hazards) {
      if (
        pBox.x < hazard.x + hazard.width &&
        pBox.x + pBox.width > hazard.x &&
        pBox.y < hazard.y + hazard.height &&
        pBox.y + pBox.height > hazard.y
      ) {
        if (this.playerInvincibleTimer <= 0) {
          if (this.superpowerActive && (this.character.powerType === 'crystal' || this.character.id === 'char_dary')) {
            if (this.character.powerType === 'crystal') {
              this.coinsCollected += 2;
              soundManager.playCoin();
              this.callbacks.onCoinCollected(this.coinsCollected);
            }
          } else {
            this.takeDamage(1, false);
          }
        }
      }
    }

    // 7. Monsters Update & Encounter Mechanics
    for (const m of this.monsters) {
      if (!m.alive) continue;

      m.animTimer += dt;
      // Movement
      if (m.isFlying) {
        m.x += m.vx;
        m.y = m.startY + Math.sin(m.animTimer * 4) * 25; // flying sine bob
      } else {
        m.x += m.vx;
      }

      if (m.x > m.maxX) {
        m.x = m.maxX;
        m.vx = -Math.abs(m.vx);
        m.facingRight = false;
      } else if (m.x < m.minX) {
        m.x = m.minX;
        m.vx = Math.abs(m.vx);
        m.facingRight = true;
      }

      // Collision with player
      if (
        pBox.x < m.x + m.width &&
        pBox.x + pBox.width > m.x &&
        pBox.y < m.y + m.height &&
        pBox.y + pBox.height > m.y
      ) {
        const isStomp = this.playerVy > 0 && pBox.y + pBox.height <= m.y + 16;

        if (this.superpowerActive && (this.character.id === 'char_dary' || this.character.powerType === 'thunder' || this.character.powerType === 'fire')) {
          // Instant pulverize
          m.alive = false;
          this.enemiesDefeated++;
          this.score += 250;
          soundManager.playEnemyStomp();
          this.createSparks(m.x + m.width / 2, m.y + m.height / 2, '#F59E0B', 15);
        } else if (isStomp && m.canBeStomped) {
          // Safe stomp on stompable monster
          m.alive = false;
          this.enemiesDefeated++;
          this.score += 250;
          this.playerVy = -11.5;
          soundManager.playEnemyStomp();
          this.createSparks(m.x + m.width / 2, m.y + m.height / 2, '#10B981', 12);
        } else {
          // Monster hits player (or spiky beast cannot be stomped!)
          this.takeDamage(1, false);
        }
      }
    }

    // 8. Projectiles Update
    for (const proj of this.projectiles) {
      proj.x += proj.vx;
      proj.y += proj.vy;
      proj.life -= dt;

      if (proj.isPlayer) {
        for (const m of this.monsters) {
          if (m.alive && Math.hypot(proj.x - (m.x + m.width / 2), proj.y - (m.y + m.height / 2)) < 26) {
            m.alive = false;
            proj.life = 0;
            this.enemiesDefeated++;
            this.score += 250;
            soundManager.playEnemyStomp();
            this.createSparks(m.x + m.width / 2, m.y + m.height / 2, '#EF4444', 15);
          }
        }
        if (this.boss && !this.boss.defeated && Math.hypot(proj.x - (this.boss.x + this.boss.width / 2), proj.y - (this.boss.y + this.boss.height / 2)) < 50) {
          this.hitBoss(proj.damage);
          proj.life = 0;
        }
      }
    }
    this.projectiles = this.projectiles.filter((p) => p.life > 0);

    // 9. Boss Update
    if (this.boss && !this.boss.defeated) {
      this.updateBoss(dt, pBox);
    }

    // 10. Checkpoints
    for (const cp of this.checkpoints) {
      if (!cp.activated && Math.abs(pBox.x - cp.x) < 32) {
        cp.activated = true;
        this.lastCheckpoint = { x: cp.x, y: cp.y };
        soundManager.playGem();
        this.createShockwave(cp.x, cp.y, '#10B981');
      }
    }

    // 11. Exit Portal Check
    if (Math.hypot(pBox.x + pBox.width / 2 - this.exitPortalX, pBox.y + pBox.height / 2 - this.exitPortalY) < 55) {
      if (!this.boss || this.boss.defeated) {
        this.completeLevel();
      }
    }

    // 12. Particles Update
    for (const p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.life += dt;
      p.alpha = Math.max(0, 1 - p.life / p.maxLife);
    }
    this.particles = this.particles.filter((p) => p.life < p.maxLife);

    // 13. Camera Lerp (Wide Landscape View)
    const targetCamX = this.playerX - this.canvas.width * 0.35;
    const targetCamY = Math.max(0, this.playerY - this.canvas.height * 0.58);
    this.cameraX += (targetCamX - this.cameraX) * 0.1;
    this.cameraY += (targetCamY - this.cameraY) * 0.08;

    this.cameraX = Math.max(0, Math.min(this.cameraX, this.levelWidth - this.canvas.width));
    this.cameraY = Math.max(0, Math.min(this.cameraY, this.levelHeight - this.canvas.height));

    if (this.screenShake > 0) {
      this.screenShake *= 0.88;
      if (this.screenShake < 0.2) this.screenShake = 0;
    }
  }

  private updateBoss(dt: number, pBox: { x: number; y: number; width: number; height: number }) {
    if (!this.boss) return;
    const b = this.boss;

    if (b.invulnerableTimer > 0) b.invulnerableTimer -= dt;

    const distToPlayer = pBox.x - b.x;
    b.vx = Math.sign(distToPlayer) * 1.5;
    b.x += b.vx;

    b.attackTimer -= dt;
    if (b.attackTimer <= 0) {
      b.attackTimer = 3.2;
      this.screenShake = 16;
      soundManager.playHit();
      this.createShockwave(b.x + b.width / 2, b.y + b.height, '#EF4444');
      if (this.playerGrounded && Math.abs(this.playerX - b.x) < 320) {
        this.takeDamage(1, false);
      }
    }

    // Collision
    if (
      pBox.x < b.x + b.width &&
      pBox.x + pBox.width > b.x &&
      pBox.y < b.y + b.height &&
      pBox.y + pBox.height > b.y
    ) {
      if (this.playerVy > 0 && pBox.y + pBox.height <= b.y + 30) {
        this.hitBoss(1);
        this.playerVy = -13;
      } else {
        this.takeDamage(1, false);
      }
    }
  }

  private hitBoss(damage: number) {
    if (!this.boss || this.boss.invulnerableTimer > 0) return;
    this.boss.hp -= damage;
    this.boss.invulnerableTimer = 0.8;
    this.screenShake = 12;
    soundManager.playEnemyStomp();
    this.createSparks(this.boss.x + this.boss.width / 2, this.boss.y + this.boss.height / 2, '#F59E0B', 20);

    if (this.boss.hp <= 0) {
      this.boss.defeated = true;
      soundManager.playVictory();
      this.createShockwave(this.boss.x + this.boss.width / 2, this.boss.y + this.boss.height / 2, '#10B981');
      this.coinsCollected += 50;
      this.characterFragmentsFound += 25;
      this.callbacks.onCoinCollected(this.coinsCollected);
    }
  }

  private takeDamage(amount: number, isPitFall: boolean) {
    if (this.playerInvincibleTimer > 0) return;

    this.playerHealth -= amount;
    this.playerInvincibleTimer = 1.6;
    this.screenShake = 14;
    soundManager.playHit();
    this.callbacks.onHealthChanged(this.playerHealth, this.playerMaxHealth);

    if (this.playerHealth <= 0) {
      this.stop();
      soundManager.playDeathWithHindiVoice();
      this.callbacks.onGameOver();
    } else if (isPitFall) {
      this.playerX = this.lastCheckpoint.x;
      this.playerY = this.lastCheckpoint.y;
      this.playerVx = 0;
      this.playerVy = 0;
    }
  }

  private completeLevel() {
    this.stop();
    soundManager.playVictoryWithHindiVoice();

    const timeTaken = Math.max(1, Math.round((performance.now() - this.levelStartTime) / 1000));
    let stars = 1;
    const totalCoins = this.level.totalCoins || 50;
    const coinPercent = (this.coinsCollected / totalCoins) * 100;
    if (coinPercent >= this.level.starsReq.requiredCoinsPercent) stars++;
    if (timeTaken <= this.level.starsReq.timeLimit) stars++;

    this.score += stars * 500 + this.coinsCollected * 10;

    const result: LevelCompleteResult = {
      levelId: this.level.id,
      coinsCollected: this.coinsCollected,
      totalCoinsInLevel: totalCoins,
      gemsCollected: this.gemsCollected,
      timeTakenSeconds: timeTaken,
      starsEarned: stars,
      score: this.score,
      characterFragmentsFound: this.characterFragmentsFound
    };

    this.callbacks.onLevelComplete(result);
  }

  // FX helpers
  private createSparks(x: number, y: number, color: string, count: number) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 6;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 3,
        color,
        alpha: 1.0,
        life: 0,
        maxLife: 0.4 + Math.random() * 0.3
      });
    }
  }

  private createShockwave(x: number, y: number, color: string) {
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      const speed = 7;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3.5,
        color,
        alpha: 1.0,
        life: 0,
        maxLife: 0.5
      });
    }
  }

  private createJumpPuff(x: number, y: number) {
    for (let i = 0; i < 6; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y - 2,
        vx: (Math.random() - 0.5) * 3,
        vy: -Math.random() * 2,
        size: 4 + Math.random() * 3,
        color: 'rgba(255, 255, 255, 0.6)',
        alpha: 0.8,
        life: 0,
        maxLife: 0.3
      });
    }
  }

  // ------------------ Canvas Rendering ------------------
  public render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.save();
    if (this.screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * this.screenShake;
      const shakeY = (Math.random() - 0.5) * this.screenShake;
      ctx.translate(shakeX, shakeY);
    }

    // 1. Parallax Landscape Background
    this.renderBackground(ctx, w, h);

    // 2. Camera Transform
    ctx.save();
    ctx.translate(-Math.round(this.cameraX), -Math.round(this.cameraY));

    // Exit Portal
    this.renderExitPortal(ctx);

    // Checkpoints
    this.renderCheckpoints(ctx);

    // Platforms
    this.renderPlatforms(ctx);

    // Hazards
    this.renderHazards(ctx);

    // Textured Coins & Collectibles
    this.renderCollectibles(ctx);

    // Monsters (World-specific)
    this.renderMonsters(ctx);

    // Boss
    if (this.boss && !this.boss.defeated) {
      this.renderBoss(ctx);
    }

    // Projectiles
    this.renderProjectiles(ctx);

    // Character
    const renderState: CharacterRenderState = {
      x: this.playerX,
      y: this.playerY,
      width: this.playerWidth,
      height: this.isSliding ? 28 : this.playerHeight,
      vx: this.playerVx,
      vy: this.playerVy,
      facingRight: this.playerFacingRight,
      isGrounded: this.playerGrounded,
      isSliding: this.isSliding,
      runCycle: this.runCycle,
      squashFactor: this.playerSquash,
      invincibleTimer: this.playerInvincibleTimer,
      superpowerActive: this.superpowerActive,
      superpowerType: this.character.powerType,
      afterImages: this.afterImages
    };
    drawCharacter(ctx, this.character, renderState, this.gameTime);

    // Particles
    this.renderParticles(ctx);

    ctx.restore();
    ctx.restore();
  }

  private renderBackground(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const world = this.world;

    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    skyGrad.addColorStop(0, world.skyColorTop);
    skyGrad.addColorStop(1, world.skyColorBottom);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // Sun / Moon Orb
    ctx.save();
    ctx.fillStyle = world.theme === 'lava_zone' ? '#F97316' : world.theme === 'cyber_city' ? '#06B6D4' : '#FEF08A';
    ctx.beginPath();
    ctx.arc(w * 0.78, h * 0.2, 45, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Distant mountain ranges
    ctx.save();
    const mountainOffset = -(this.cameraX * 0.18) % 400;
    ctx.fillStyle = world.theme === 'lava_zone' ? 'rgba(69, 10, 10, 0.45)' : world.theme === 'cyber_city' ? 'rgba(30, 27, 75, 0.5)' : 'rgba(34, 197, 94, 0.25)';
    ctx.beginPath();
    for (let x = -400; x < w + 400; x += 160) {
      const peakX = x + mountainOffset;
      ctx.lineTo(peakX, h * 0.65);
      ctx.lineTo(peakX + 80, h * 0.4 + Math.sin(x) * 30);
      ctx.lineTo(peakX + 160, h * 0.65);
    }
    ctx.lineTo(w + 400, h);
    ctx.lineTo(-400, h);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  private renderPlatforms(ctx: CanvasRenderingContext2D) {
    const groundColor = this.world.groundColor;
    const accentColor = this.world.groundAccentColor;
    const worldId = this.world.id;

    for (const plat of this.platforms) {
      if (plat.x + plat.width < this.cameraX - 100 || plat.x > this.cameraX + this.canvas.width + 100) continue;

      ctx.save();
      // 1. Platform Body with Shaded Bevel
      ctx.fillStyle = groundColor;
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(plat.x, plat.y, plat.width, plat.height, 8);
      ctx.fill();
      ctx.stroke();

      // 2. World-Specific Interior Texture
      if (worldId === 1) {
        // Green Valley: Wood/Earth striations
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.lineWidth = 1.5;
        for (let bx = plat.x + 20; bx < plat.x + plat.width - 15; bx += 38) {
          ctx.beginPath();
          ctx.moveTo(bx, plat.y + 12);
          ctx.lineTo(bx + 4, plat.y + plat.height - 4);
          ctx.stroke();
        }
      } else if (worldId === 2) {
        // Lava Zone: Glowing molten lava veins
        ctx.strokeStyle = 'rgba(249, 115, 22, 0.65)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let lx = plat.x + 15; lx < plat.x + plat.width - 15; lx += 45) {
          ctx.moveTo(lx, plat.y + 10);
          ctx.lineTo(lx + 10, plat.y + 18);
          ctx.lineTo(lx + 18, plat.y + 14);
          ctx.lineTo(lx + 24, plat.y + plat.height - 4);
        }
        ctx.stroke();
      } else if (worldId === 3) {
        // Cyber City: Neon circuit board grid traces
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.5)';
        ctx.lineWidth = 1.5;
        for (let cx = plat.x + 25; cx < plat.x + plat.width - 20; cx += 50) {
          ctx.beginPath();
          ctx.moveTo(cx, plat.y + 10);
          ctx.lineTo(cx, plat.y + plat.height - 6);
          ctx.lineTo(cx + 12, plat.y + plat.height - 6);
          ctx.stroke();
          // Circuit node dot
          ctx.fillStyle = '#38BDF8';
          ctx.beginPath();
          ctx.arc(cx, plat.y + 10, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (worldId === 4) {
        // Legend Realm: Celestial runic stars
        ctx.fillStyle = 'rgba(245, 158, 11, 0.45)';
        for (let rx = plat.x + 30; rx < plat.x + plat.width - 25; rx += 60) {
          ctx.beginPath();
          ctx.arc(rx, plat.y + plat.height / 2 + 2, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 3. Top Rim / Foliage Trim
      ctx.fillStyle = accentColor;
      ctx.beginPath();
      ctx.roundRect(plat.x, plat.y, plat.width, 10, [8, 8, 2, 2]);
      ctx.fill();

      // Green grass tufts sticking up for World 1
      if (worldId === 1) {
        ctx.fillStyle = '#4ADE80';
        for (let gx = plat.x + 8; gx < plat.x + plat.width - 8; gx += 16) {
          ctx.beginPath();
          ctx.moveTo(gx - 3, plat.y);
          ctx.lineTo(gx, plat.y - 4);
          ctx.lineTo(gx + 3, plat.y);
          ctx.closePath();
          ctx.fill();
        }
      }

      // Moving platform mechanic indicator
      if (plat.type === 'moving_h') {
        ctx.fillStyle = '#FEF08A';
        ctx.fillRect(plat.x + plat.width / 2 - 16, plat.y + 12, 32, 4);
        ctx.strokeStyle = '#0F172A';
        ctx.lineWidth = 1;
        ctx.strokeRect(plat.x + plat.width / 2 - 16, plat.y + 12, 32, 4);
      }
      ctx.restore();
    }
  }

  private renderHazards(ctx: CanvasRenderingContext2D) {
    for (const haz of this.hazards) {
      if (haz.x + haz.width < this.cameraX - 50 || haz.x > this.cameraX + this.canvas.width + 50) continue;

      ctx.save();
      if (haz.type === 'spikes') {
        ctx.fillStyle = '#EF4444';
        ctx.strokeStyle = '#7F1D1D';
        ctx.lineWidth = 1.5;
        const spikeCount = Math.floor(haz.width / 14);
        for (let i = 0; i < spikeCount; i++) {
          const sx = haz.x + i * 14;
          ctx.beginPath();
          ctx.moveTo(sx, haz.y + haz.height);
          ctx.lineTo(sx + 7, haz.y);
          ctx.lineTo(sx + 14, haz.y + haz.height);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
      }
      ctx.restore();
    }
  }

  /**
   * High-Fidelity Textured Gold Coins with 3D Bevel, Embossed Star, and Specular Shimmer
   */
  private renderCollectibles(ctx: CanvasRenderingContext2D) {
    for (const item of this.collectibles) {
      if (item.collected) continue;
      if (item.x + item.width < this.cameraX - 50 || item.x > this.cameraX + this.canvas.width + 50) continue;

      ctx.save();
      const bob = Math.sin(this.gameTime * 4 + item.x) * 4;
      ctx.translate(item.x + item.width / 2, item.y + item.height / 2 + bob);

      if (item.type === 'coin') {
        // 3D Perspective Spin
        const spin = Math.cos(this.gameTime * 5 + item.x * 0.1);
        ctx.scale(spin, 1);

        // Outer Metallic Gold Rim
        ctx.fillStyle = '#B45309';
        ctx.beginPath();
        ctx.arc(0, 0, 11, 0, Math.PI * 2);
        ctx.fill();

        // Inner Textured Gold Surface with Metallic Gradient
        const coinGrad = ctx.createLinearGradient(-10, -10, 10, 10);
        coinGrad.addColorStop(0, '#FFFBEB');
        coinGrad.addColorStop(0.3, '#F59E0B');
        coinGrad.addColorStop(0.7, '#D97706');
        coinGrad.addColorStop(1, '#92400E');
        ctx.fillStyle = coinGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 9.5, 0, Math.PI * 2);
        ctx.fill();

        // Embossed Inner Ring
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, 7, 0, Math.PI * 2);
        ctx.stroke();

        // Embossed Center Star ★
        ctx.fillStyle = '#FEF3C7';
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const outerAngle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
          const innerAngle = outerAngle + Math.PI / 5;
          if (i === 0) ctx.moveTo(Math.cos(outerAngle) * 5, Math.sin(outerAngle) * 5);
          else ctx.lineTo(Math.cos(outerAngle) * 5, Math.sin(outerAngle) * 5);
          ctx.lineTo(Math.cos(innerAngle) * 2.2, Math.sin(innerAngle) * 2.2);
        }
        ctx.closePath();
        ctx.fill();
      } else if (item.type === 'gem') {
        // Sparkling Multi-Faceted Diamond
        ctx.rotate(0.2);
        ctx.fillStyle = '#38BDF8';
        ctx.strokeStyle = '#0284C7';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -13);
        ctx.lineTo(11, 0);
        ctx.lineTo(0, 13);
        ctx.lineTo(-11, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Diamond facets
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.moveTo(0, -13);
        ctx.lineTo(6, 0);
        ctx.lineTo(0, 5);
        ctx.closePath();
        ctx.fill();
      } else if (item.type === 'chest') {
        // Treasure Chest
        ctx.fillStyle = '#92400E';
        ctx.strokeStyle = '#FBBF24';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(-16, -10, 32, 22, 4);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#FDE047';
        ctx.beginPath();
        ctx.arc(0, 1, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  /**
   * Rich procedural monster rendering for every world!
   */
  private renderMonsters(ctx: CanvasRenderingContext2D) {
    for (const m of this.monsters) {
      if (!m.alive) continue;
      if (m.x + m.width < this.cameraX - 50 || m.x > this.cameraX + this.canvas.width + 50) continue;

      ctx.save();
      ctx.translate(m.x + m.width / 2, m.y + m.height / 2);
      if (!m.facingRight) ctx.scale(-1, 1);

      // Render based on monster type
      if (m.type === 'slime') {
        // Green Squashing Forest Slime
        const squash = Math.sin(m.animTimer * 6) * 0.18;
        ctx.scale(1 + squash, 1 - squash);
        ctx.fillStyle = '#22C55E';
        ctx.strokeStyle = '#15803D';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, -2, 14, Math.PI, 0);
        ctx.lineTo(14, 12);
        ctx.quadraticCurveTo(0, 16, -14, 12);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Eyes
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(5, 2, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0F172A';
        ctx.beginPath();
        ctx.arc(6, 2, 1.8, 0, Math.PI * 2);
        ctx.fill();
      } else if (m.type === 'briar_beast') {
        // Spiky Briar Monster (Unstompable!)
        ctx.fillStyle = '#78350F';
        ctx.strokeStyle = '#451A03';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(-16, -6, 32, 20, 6);
        ctx.fill();
        ctx.stroke();

        // Red sharp spikes on back!
        ctx.fillStyle = '#DC2626';
        for (let s = -12; s <= 12; s += 8) {
          ctx.beginPath();
          ctx.moveTo(s - 4, -6);
          ctx.lineTo(s, -16);
          ctx.lineTo(s + 4, -6);
          ctx.closePath();
          ctx.fill();
        }

        // Angry red eye
        ctx.fillStyle = '#FEF08A';
        ctx.beginPath();
        ctx.arc(8, 2, 3, 0, Math.PI * 2);
        ctx.fill();
      } else if (m.type === 'wasp') {
        // Flying Forest Hornet with vibrating wings
        const wingFlap = Math.sin(m.animTimer * 25) * 6;
        // Wings
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.ellipse(-2, -12 + wingFlap, 10, 4, -0.3, 0, Math.PI * 2);
        ctx.fill();

        // Striped Body
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.ellipse(0, 0, 12, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1E293B';
        ctx.fillRect(-2, -8, 4, 16);
      } else if (m.type === 'magma_crab') {
        // Lava Crab
        ctx.fillStyle = '#DC2626';
        ctx.strokeStyle = '#7F1D1D';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, 2, 15, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Claws
        ctx.fillStyle = '#F97316';
        ctx.beginPath();
        ctx.arc(14, -2, 6, 0, Math.PI * 2);
        ctx.fill();
      } else if (m.type === 'fire_bat') {
        // Flying Fire Bat
        ctx.fillStyle = '#EF4444';
        const wing = Math.sin(m.animTimer * 15) * 8;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(16, -10 + wing);
        ctx.lineTo(8, 4);
        ctx.lineTo(-8, 4);
        ctx.lineTo(-16, -10 + wing);
        ctx.closePath();
        ctx.fill();
      } else if (m.type === 'security_drone') {
        // Cyber City Hovering Drone
        ctx.fillStyle = '#1E293B';
        ctx.strokeStyle = '#06B6D4';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(-14, -8, 28, 16, 6);
        ctx.fill();
        ctx.stroke();

        // Neon scanner lens
        ctx.fillStyle = '#EF4444';
        ctx.beginPath();
        ctx.arc(6, 0, 4, 0, Math.PI * 2);
        ctx.fill();
      } else if (m.type === 'cyber_hound') {
        // Fast Robo Hound
        ctx.fillStyle = '#334155';
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(-16, -8, 32, 18, 4);
        ctx.fill();
        ctx.stroke();
        // Neon visor line
        ctx.fillStyle = '#06B6D4';
        ctx.fillRect(4, -4, 8, 3);
      } else if (m.type === 'void_wisp') {
        // Legend Realm Void Wisp
        const pulse = Math.sin(m.animTimer * 8) * 3;
        const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, 14 + pulse);
        grad.addColorStop(0, '#FFFFFF');
        grad.addColorStop(0.5, '#A855F7');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, 14 + pulse, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // General Monster Fallback
        ctx.fillStyle = '#6366F1';
        ctx.beginPath();
        ctx.roundRect(-14, -14, 28, 28, 8);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  private renderBoss(ctx: CanvasRenderingContext2D) {
    if (!this.boss) return;
    const b = this.boss;

    ctx.save();
    ctx.translate(b.x + b.width / 2, b.y + b.height / 2);

    if (b.invulnerableTimer > 0 && Math.floor(this.gameTime * 20) % 2 === 0) {
      ctx.restore();
      return;
    }

    ctx.fillStyle = '#450A0A';
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.roundRect(-b.width / 2, -b.height / 2, b.width, b.height, 16);
    ctx.fill();
    ctx.stroke();

    // Glowing Power Core
    const corePulse = Math.sin(this.gameTime * 8) * 4;
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.arc(0, 0, 16 + corePulse, 0, Math.PI * 2);
    ctx.fill();

    // Boss HP Bar
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(-50, -b.height / 2 - 24, 100, 10);
    const hpPercent = Math.max(0, b.hp / b.maxHp);
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(-50, -b.height / 2 - 24, 100 * hpPercent, 10);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-50, -b.height / 2 - 24, 100, 10);

    ctx.restore();
  }

  private renderProjectiles(ctx: CanvasRenderingContext2D) {
    for (const proj of this.projectiles) {
      ctx.save();
      ctx.fillStyle = proj.color;
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  private renderCheckpoints(ctx: CanvasRenderingContext2D) {
    for (const cp of this.checkpoints) {
      ctx.save();
      ctx.fillStyle = '#94A3B8';
      ctx.fillRect(cp.x - 3, cp.y, 6, 70);
      ctx.fillStyle = cp.activated ? '#10B981' : '#64748B';
      ctx.beginPath();
      ctx.moveTo(cp.x + 3, cp.y + 5);
      ctx.lineTo(cp.x + 35, cp.y + 20);
      ctx.lineTo(cp.x + 3, cp.y + 35);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  private renderExitPortal(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.exitPortalX, this.exitPortalY);

    const ringAngle = this.gameTime * 3;
    ctx.rotate(ringAngle);

    const grad = ctx.createRadialGradient(0, 0, 10, 0, 0, 48);
    grad.addColorStop(0, '#FFFFFF');
    grad.addColorStop(0.4, '#38BDF8');
    grad.addColorStop(0.8, '#6366F1');
    grad.addColorStop(1, 'transparent');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(0, 0, 42, 60, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private renderParticles(ctx: CanvasRenderingContext2D) {
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}
