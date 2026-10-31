import { Character } from '../types/game';

// Image cache for character photo textures
const imageCache: Record<string, HTMLImageElement> = {};

export function preloadCharacterImage(url: string): HTMLImageElement {
  if (imageCache[url]) return imageCache[url];
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = url;
  imageCache[url] = img;
  return img;
}

export interface CharacterRenderState {
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  facingRight: boolean;
  isGrounded: boolean;
  isSliding: boolean;
  runCycle: number;
  squashFactor: number; // 1.0 = normal, < 1.0 = squashed landing, > 1.0 = stretched jumping
  invincibleTimer: number;
  superpowerActive: boolean;
  superpowerType: string;
  afterImages?: Array<{ x: number; y: number; opacity: number; color: string }>;
}

export function drawCharacter(
  ctx: CanvasRenderingContext2D,
  char: Character,
  state: CharacterRenderState,
  gameTime: number
) {
  // Preload photo if needed
  if (!imageCache[char.photoUrl]) {
    preloadCharacterImage(char.photoUrl);
  }
  const photo = imageCache[char.photoUrl];
  const hasPhoto = photo && photo.complete && photo.naturalWidth > 0;

  // Invincibility blink
  if (state.invincibleTimer > 0 && Math.floor(gameTime * 20) % 2 === 0) {
    return;
  }

  // Draw phantom clones / after-images if chrono power or fast dash
  if (state.afterImages && state.afterImages.length > 0) {
    for (const ghost of state.afterImages) {
      ctx.save();
      ctx.globalAlpha = ghost.opacity * 0.45;
      ctx.translate(ghost.x + state.width / 2, ghost.y + state.height / 2);
      if (!state.facingRight) ctx.scale(-1, 1);
      ctx.fillStyle = ghost.color;
      ctx.beginPath();
      ctx.roundRect(-state.width / 2, -state.height / 2, state.width, state.height, 12);
      ctx.fill();
      ctx.restore();
    }
  }

  ctx.save();
  const centerX = state.x + state.width / 2;
  const centerY = state.y + state.height / 2;

  ctx.translate(centerX, centerY);

  // Direction flip
  if (!state.facingRight) {
    ctx.scale(-1, 1);
  }

  // Squash & Stretch
  const sy = state.squashFactor;
  const sx = 1 / Math.sqrt(Math.max(0.2, sy));
  ctx.scale(sx, sy);

  // Superpower Aura Glow
  if (state.superpowerActive) {
    drawSuperpowerAura(ctx, char, state, gameTime);
  }

  // Draw Shadow under feet when close to ground
  if (state.isGrounded) {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(0, state.height / 2 + 2, state.width * 0.45, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Animation parameters
  const isMoving = Math.abs(state.vx) > 0.5 && state.isGrounded && !state.isSliding;
  const legAngle = isMoving ? Math.sin(state.runCycle) * 0.55 : 0;
  const armAngle = isMoving ? -Math.sin(state.runCycle) * 0.55 : 0;

  if (state.isSliding) {
    // Sliding pose: lean back, lower torso
    ctx.rotate(-0.35);
    drawSlidingBody(ctx, char, state, hasPhoto, photo, gameTime);
  } else {
    // Normal standing/running/jumping pose
    drawStandingBody(ctx, char, state, hasPhoto, photo, legAngle, armAngle, gameTime);
  }

  ctx.restore();
}

function drawSuperpowerAura(
  ctx: CanvasRenderingContext2D,
  char: Character,
  state: CharacterRenderState,
  gameTime: number
) {
  ctx.save();
  const auraColors: Record<string, string> = {
    thunder: '#FBBF24',
    aero: '#34D399',
    fire: '#F87171',
    crystal: '#C084FC',
    chrono: '#60A5FA',
    shadow: '#818CF8'
  };
  const color = auraColors[char.powerType] || '#F59E0B';

  const pulse = Math.sin(gameTime * 12) * 6;
  const radius = Math.max(state.width, state.height) * 0.75 + pulse;

  const grad = ctx.createRadialGradient(0, 0, radius * 0.2, 0, 0, radius);
  grad.addColorStop(0, `${color}66`);
  grad.addColorStop(0.7, `${color}33`);
  grad.addColorStop(1, 'transparent');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();

  // Sparks or energy bolts
  if (char.powerType === 'thunder') {
    ctx.strokeStyle = '#FEF08A';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2 + gameTime * 8;
      const r1 = radius * 0.4;
      const r2 = radius * 0.9;
      const mx = Math.cos(angle) * (r1 + r2) * 0.5 + (Math.random() - 0.5) * 10;
      const my = Math.sin(angle) * (r1 + r2) * 0.5 + (Math.random() - 0.5) * 10;
      ctx.moveTo(Math.cos(angle) * r1, Math.sin(angle) * r1);
      ctx.lineTo(mx, my);
      ctx.lineTo(Math.cos(angle) * r2, Math.sin(angle) * r2);
    }
    ctx.stroke();
  } else if (char.powerType === 'fire') {
    ctx.fillStyle = '#F87171';
    for (let i = 0; i < 5; i++) {
      const flameX = (Math.sin(gameTime * 10 + i) * state.width) / 2;
      const flameY = -state.height / 2 - Math.sin(gameTime * 15 + i * 2) * 15;
      ctx.beginPath();
      ctx.arc(flameX, flameY, 4 + Math.sin(gameTime * 20 + i) * 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

function drawStandingBody(
  ctx: CanvasRenderingContext2D,
  char: Character,
  state: CharacterRenderState,
  hasPhoto: boolean,
  photo: HTMLImageElement,
  legAngle: number,
  armAngle: number,
  gameTime: number
) {
  const outfitColor = char.outfitColor;
  const accentColor = char.accentColor;

  // 1. Back Arm
  ctx.save();
  ctx.translate(-4, -6);
  ctx.rotate(-armAngle - 0.2);
  ctx.fillStyle = outfitColor;
  ctx.strokeStyle = '#1E293B';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(-4, 0, 7, 18, 4);
  ctx.fill();
  ctx.stroke();
  // Hand
  ctx.fillStyle = '#E2B18A';
  ctx.beginPath();
  ctx.arc(-0.5, 18, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // 2. Back Leg
  ctx.save();
  ctx.translate(-5, 12);
  ctx.rotate(-legAngle);
  ctx.fillStyle = outfitColor;
  ctx.strokeStyle = '#0F172A';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(-4, 0, 8, 20, 3);
  ctx.fill();
  ctx.stroke();
  // Shoe / foot
  ctx.fillStyle = '#1E293B';
  ctx.beginPath();
  ctx.roundRect(-4, 18, 11, 6, 3);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // 3. Front Leg
  ctx.save();
  ctx.translate(5, 12);
  ctx.rotate(legAngle);
  ctx.fillStyle = outfitColor;
  ctx.strokeStyle = '#0F172A';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(-4, 0, 8, 20, 3);
  ctx.fill();
  ctx.stroke();
  // Shoe
  ctx.fillStyle = '#1E293B';
  ctx.beginPath();
  ctx.roundRect(-4, 18, 12, 6, 3);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // 4. Torso (Traditional Kurta / Tunic with front buttons & collar)
  ctx.save();
  ctx.fillStyle = outfitColor;
  ctx.strokeStyle = '#1E293B';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  // Slight flared kurta cut
  ctx.moveTo(-12, -10);
  ctx.lineTo(12, -10);
  ctx.lineTo(14, 14);
  ctx.lineTo(-14, 14);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Kurta Collar & Placket
  ctx.fillStyle = accentColor;
  ctx.fillRect(-2, -10, 4, 16);
  // Buttons
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(0, -6, 1.5, 0, Math.PI * 2);
  ctx.arc(0, -1, 1.5, 0, Math.PI * 2);
  ctx.arc(0, 4, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 5. Scarf / Hero Trim Banner
  ctx.save();
  ctx.fillStyle = accentColor;
  ctx.beginPath();
  ctx.moveTo(-11, -9);
  ctx.lineTo(11, -9);
  ctx.lineTo(8, -6);
  ctx.lineTo(-8, -6);
  ctx.closePath();
  ctx.fill();
  // Flowing scarf tail if running
  if (Math.abs(state.vx) > 1) {
    const wave = Math.sin(gameTime * 14) * 4;
    ctx.beginPath();
    ctx.moveTo(-10, -8);
    ctx.quadraticCurveTo(-22, -12 + wave, -30, -8 + wave);
    ctx.lineTo(-28, -4 + wave);
    ctx.quadraticCurveTo(-18, -6 + wave, -10, -5);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // 6. Front Arm
  ctx.save();
  ctx.translate(6, -6);
  ctx.rotate(armAngle + 0.2);
  ctx.fillStyle = outfitColor;
  ctx.strokeStyle = '#1E293B';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(-4, 0, 7, 18, 4);
  ctx.fill();
  ctx.stroke();
  // Hand
  ctx.fillStyle = '#E2B18A';
  ctx.beginPath();
  ctx.arc(-0.5, 18, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // 7. Head (Cartoon Head with Photo Integration)
  drawCartoonHead(ctx, char, hasPhoto, photo, 0, -26, 18, gameTime);
}

function drawSlidingBody(
  ctx: CanvasRenderingContext2D,
  char: Character,
  state: CharacterRenderState,
  hasPhoto: boolean,
  photo: HTMLImageElement,
  gameTime: number
) {
  const outfitColor = char.outfitColor;
  const accentColor = char.accentColor;

  // Slide sparks
  ctx.save();
  ctx.fillStyle = '#FDE047';
  for (let i = 0; i < 3; i++) {
    const sx = -20 - Math.random() * 15;
    const sy = 12 + (Math.random() - 0.5) * 6;
    ctx.beginPath();
    ctx.arc(sx, sy, 2 + Math.random() * 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Horizontal Torso
  ctx.save();
  ctx.fillStyle = outfitColor;
  ctx.strokeStyle = '#1E293B';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(-16, 2, 32, 16, 6);
  ctx.fill();
  ctx.stroke();
  // Accent belt
  ctx.fillStyle = accentColor;
  ctx.fillRect(-6, 2, 4, 16);
  ctx.restore();

  // Outstretched legs
  ctx.save();
  ctx.fillStyle = outfitColor;
  ctx.strokeStyle = '#0F172A';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(10, 6, 22, 9, 4);
  ctx.fill();
  ctx.stroke();
  // Shoes
  ctx.fillStyle = '#1E293B';
  ctx.beginPath();
  ctx.roundRect(28, 4, 10, 12, 3);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Arm braced back
  ctx.save();
  ctx.fillStyle = outfitColor;
  ctx.strokeStyle = '#1E293B';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(-22, 10, 12, 6, 3);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Head tilted forward
  drawCartoonHead(ctx, char, hasPhoto, photo, -14, -8, 16, gameTime);
}

function drawCartoonHead(
  ctx: CanvasRenderingContext2D,
  char: Character,
  hasPhoto: boolean,
  photo: HTMLImageElement,
  headX: number,
  headY: number,
  headRadius: number,
  gameTime: number
) {
  ctx.save();
  ctx.translate(headX, headY);

  // Outer bold cartoon outline circle / badge
  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, headRadius + 2.5, 0, Math.PI * 2);
  ctx.fillStyle = '#1E293B';
  ctx.fill();

  // Rarity ring border
  const rarityColors: Record<string, string> = {
    Common: '#94A3B8',
    Uncommon: '#10B981',
    Rare: '#3B82F6',
    Epic: '#A855F7',
    Legendary: '#F59E0B'
  };
  ctx.strokeStyle = rarityColors[char.rarity] || '#F59E0B';
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.restore();

  // Clipped portrait area
  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, headRadius, 0, Math.PI * 2);
  ctx.clip();

  if (hasPhoto) {
    // Draw cropped photo centered on face/head
    const size = headRadius * 2.4;
    // Offset slightly upwards to capture face & hairstyle
    ctx.drawImage(photo, -size / 2, -size / 2 + 1, size, size);
  } else {
    // High-fidelity cartoon face fallback
    ctx.fillStyle = '#E2B18A'; // Warm skin tone
    ctx.fillRect(-headRadius, -headRadius, headRadius * 2, headRadius * 2);

    // Hairstyle based on character
    ctx.fillStyle = '#1C1917'; // Dark hair
    ctx.beginPath();
    if (char.hairStyle === 'short_wavy') {
      ctx.arc(0, -headRadius * 0.4, headRadius * 0.95, Math.PI, Math.PI * 2);
      ctx.fill();
    } else if (char.hairStyle === 'side_part') {
      ctx.moveTo(-headRadius, -2);
      ctx.quadraticCurveTo(-headRadius * 0.5, -headRadius * 1.2, headRadius * 0.8, -headRadius * 0.4);
      ctx.lineTo(headRadius, 4);
      ctx.lineTo(-headRadius, 4);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.arc(0, -headRadius * 0.3, headRadius, Math.PI * 0.9, Math.PI * 2.1);
      ctx.fill();
    }

    // Eyes
    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.arc(-headRadius * 0.35, headRadius * 0.1, 2.5, 0, Math.PI * 2);
    ctx.arc(headRadius * 0.35, headRadius * 0.1, 2.5, 0, Math.PI * 2);
    ctx.fill();
    // Catchlight
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-headRadius * 0.35 - 0.7, headRadius * 0.1 - 0.7, 1, 0, Math.PI * 2);
    ctx.arc(headRadius * 0.35 - 0.7, headRadius * 0.1 - 0.7, 1, 0, Math.PI * 2);
    ctx.fill();

    // Smile
    ctx.strokeStyle = '#854D0E';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, headRadius * 0.3, 4, 0.2, Math.PI - 0.2);
    ctx.stroke();
  }
  ctx.restore();

  // Hero Headband / Crown with Power Gem
  ctx.save();
  const isLegendary = char.rarity === 'Legendary' || char.id === 'char_dary';

  if (isLegendary) {
    // Supreme Golden Crown for Dary
    ctx.fillStyle = '#F59E0B';
    ctx.strokeStyle = '#78350F';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-12, -headRadius - 2);
    ctx.lineTo(-14, -headRadius - 12);
    ctx.lineTo(-6, -headRadius - 7);
    ctx.lineTo(0, -headRadius - 15); // Center apex
    ctx.lineTo(6, -headRadius - 7);
    ctx.lineTo(14, -headRadius - 12);
    ctx.lineTo(12, -headRadius - 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Crown Jewels (Ruby & Diamonds)
    ctx.fillStyle = '#EF4444'; // Red ruby center
    ctx.beginPath();
    ctx.arc(0, -headRadius - 8, 2.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#38BDF8'; // Blue sapphires on sides
    ctx.beginPath();
    ctx.arc(-7, -headRadius - 5, 1.6, 0, Math.PI * 2);
    ctx.arc(7, -headRadius - 5, 1.6, 0, Math.PI * 2);
    ctx.fill();

    // Golden Sparkle glint
    const glint = (Math.sin(gameTime * 6) + 1) * 0.5;
    if (glint > 0.7) {
      ctx.fillStyle = '#FEF08A';
      ctx.beginPath();
      ctx.arc(0, -headRadius - 15, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    // Heroic Athletic Headband with Power Gem
    ctx.fillStyle = char.accentColor;
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.rect(-headRadius - 1, -headRadius * 0.6, (headRadius + 1) * 2, 5);
    ctx.fill();
    ctx.stroke();

    // Center power emblem
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(0, -headRadius * 0.6 + 2.5, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Gem glint
    const shine = (Math.sin(gameTime * 5) + 1) * 0.5;
    ctx.fillStyle = shine > 0.6 ? '#FEF08A' : char.accentColor;
    ctx.beginPath();
    ctx.arc(0, -headRadius * 0.6 + 2.5, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  ctx.restore();
}
