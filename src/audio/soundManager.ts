/**
 * Pure Web Audio API Sound Synthesizer & Dynamic BGM Player
 * Works 100% offline with zero external audio assets.
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private bgmIntervalId: number | null = null;
  private currentBgmTrack: string | null = null;
  private isMuted: boolean = false;
  private sfxVol: number = 0.8;
  private musicVol: number = 0.5;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxVol, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.musicVol, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolumes(sfx: number, music: number, muted: boolean) {
    this.sfxVol = sfx;
    this.musicVol = music;
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 1, this.ctx.currentTime);
    }
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(sfx, this.ctx.currentTime);
    }
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(music, this.ctx.currentTime);
    }
  }

  public playJump() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(450, now + 0.15);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  public playLanding() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.08);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  public playSlide() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    // Noise-like whoosh for sliding
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(80, now + 0.25);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.26);
  }

  public playCoin() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';

    osc1.frequency.setValueAtTime(987.77, now); // B5
    osc1.frequency.setValueAtTime(1318.51, now + 0.07); // E6

    osc2.frequency.setValueAtTime(1975.53, now); // B6
    osc2.frequency.setValueAtTime(2637.02, now + 0.07); // E7

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.2);
    osc2.stop(now + 0.2);
  }

  public playGem() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const notes = [1046.5, 1318.51, 1567.98, 2093.0]; // C6, E6, G6, C7
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      gain.gain.setValueAtTime(0.2, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.05 + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.26);
    });
  }

  public playEnemyStomp() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.15);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  public playHit() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.2);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.21);
  }

  public playPower(powerType: string) {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    if (powerType === 'thunder') {
      // Thunder crackle and surge
      for (let i = 0; i < 3; i++) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200 + i * 150, now + i * 0.06);
        osc.frequency.exponentialRampToValueAtTime(50, now + i * 0.06 + 0.3);

        gain.gain.setValueAtTime(0.3, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.06 + 0.3);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.31);
      }
    } else if (powerType === 'fire') {
      // Roaring whoosh
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(80, now);
      osc.frequency.linearRampToValueAtTime(260, now + 0.15);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.4);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.41);
    } else if (powerType === 'chrono') {
      // Cosmic clock slow warp
      const notes = [659.25, 587.33, 523.25, 440];
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.25, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.3);

        osc.connect(gain);
        gain.connect(this.sfxGain!);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.31);
      });
    } else {
      // General heroic power surge
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.35);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.36);
    }
  }

  public playChestOpen() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const chords = [
      [523.25, 659.25], // C5, E5
      [587.33, 698.46], // D5, F5
      [659.25, 783.99], // E5, G5
      [783.99, 1046.5]  // G5, C6
    ];

    chords.forEach((chord, idx) => {
      chord.forEach((freq) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);

        gain.gain.setValueAtTime(0.2, now + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.1 + 0.28);

        osc.connect(gain);
        gain.connect(this.sfxGain!);
        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.29);
      });
    });
  }

  public playVictory() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const notes = [
      { f: 523.25, d: 0.15 }, // C5
      { f: 659.25, d: 0.15 }, // E5
      { f: 783.99, d: 0.15 }, // G5
      { f: 1046.5, d: 0.4 }   // C6
    ];

    let t = now;
    notes.forEach((n) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, t);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + n.d);

      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(t);
      osc.stop(t + n.d + 0.01);
      t += n.d;
    });
  }

  public playGameOver() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    // Comedic bass crunch / fail impact
    const crunch = this.ctx.createOscillator();
    const crunchGain = this.ctx.createGain();
    crunch.type = 'sawtooth';
    crunch.frequency.setValueAtTime(140, now);
    crunch.frequency.exponentialRampToValueAtTime(35, now + 0.35);
    crunchGain.gain.setValueAtTime(0.4, now);
    crunchGain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
    crunch.connect(crunchGain);
    crunchGain.connect(this.sfxGain);
    crunch.start(now);
    crunch.stop(now + 0.36);

    // Descending fail melody
    const notes = [440, 415.3, 392, 311.1, 220];
    notes.forEach((f, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f, now + 0.1 + idx * 0.18);

      gain.gain.setValueAtTime(0.25, now + 0.1 + idx * 0.18);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1 + idx * 0.18 + 0.22);

      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(now + 0.1 + idx * 0.18);
      osc.stop(now + 0.1 + idx * 0.18 + 0.23);
    });
  }

  public speakHindi(text: string) {
    if (this.isMuted) return;
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();
        const hindiVoice = voices.find(
          (v) =>
            v.lang.startsWith('hi') ||
            v.lang.includes('IN') ||
            v.name.toLowerCase().includes('hindi') ||
            v.name.toLowerCase().includes('india')
        );
        if (hindiVoice) {
          utterance.voice = hindiVoice;
        }
        utterance.rate = 1.05;
        utterance.pitch = 1.1;
        utterance.volume = Math.min(1.0, this.sfxVol * 1.2);
        window.speechSynthesis.speak(utterance);
      }
    } catch {
      // Ignore if speech synthesis unavailable
    }
  }

  public playDeathWithHindiVoice(customLine?: string): string {
    this.playGameOver();
    const deathLines = [
      "Arrey yaar! Gir gaya! Khel khatam!",
      "Khatam! Tata bye-bye! Bach ke chalo!",
      "Arey mori maiya! Ye kya ho gaya!",
      "Oh bhai! Dekh ke jump karo!",
      "Himmat mat haar mere sher! Dobara koshish kar!",
      "Lag gaye 440 volt! Savdhaan raho!"
    ];
    const line = customLine || deathLines[Math.floor(Math.random() * deathLines.length)];
    this.speakHindi(line);
    return line;
  }

  public playVictoryWithHindiVoice(customLine?: string): string {
    this.playVictory();
    const victoryLines = [
      "Kya baat hai! Mauj kardi mere sher!",
      "Shabash! Level clear ho gaya!",
      "Bawaal macha diya bhai! Aag laga di!",
      "Zabardast! Next level ki baari!",
      "Dhamaka kar diya! Tu toh champion hai!",
      "Jeet gaya re jeet gaya! Kamaal kar diya!"
    ];
    const line = customLine || victoryLines[Math.floor(Math.random() * victoryLines.length)];
    this.speakHindi(line);
    return line;
  }

  public playButtonClick() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  /**
   * Procedural Background Music Generator
   * Loops rhythmic arpeggios tailored to the active world.
   */
  public startBGM(track: 'valley' | 'lava' | 'cyber' | 'legend') {
    if (this.currentBgmTrack === track && this.bgmIntervalId !== null) return;
    this.stopBGM();
    this.initContext();
    this.currentBgmTrack = track;

    let step = 0;
    // Scales for each world
    const scales: Record<string, number[]> = {
      valley: [261.63, 293.66, 329.63, 392.0, 440.0, 523.25], // C major pentatonic
      lava: [196.0, 220.0, 233.08, 261.63, 293.66, 311.13, 349.23], // G minor driving
      cyber: [220.0, 261.63, 293.66, 311.13, 329.63, 392.0, 440.0], // Cyber A dorian
      legend: [293.66, 329.63, 369.99, 440.0, 493.88, 587.33] // D lydian celestial
    };

    const scale = scales[track] || scales.valley;
    const tempo = track === 'lava' ? 140 : track === 'cyber' ? 128 : track === 'valley' ? 132 : 110;
    const stepIntervalMs = (60 / tempo) * 250; // 16th-note ticks

    this.bgmIntervalId = window.setInterval(() => {
      if (!this.ctx || !this.musicGain || this.isMuted) return;

      const now = this.ctx.currentTime;
      // Bass line on 1st and 3rd beats
      if (step % 4 === 0) {
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = track === 'cyber' ? 'sawtooth' : 'triangle';
        bassOsc.frequency.setValueAtTime(scale[0] / 2, now);

        bassGain.gain.setValueAtTime(0.18, now);
        bassGain.gain.exponentialRampToValueAtTime(0.01, now + (stepIntervalMs / 1000) * 1.5);

        bassOsc.connect(bassGain);
        bassGain.connect(this.musicGain);
        bassOsc.start(now);
        bassOsc.stop(now + (stepIntervalMs / 1000) * 1.6);
      }

      // Melodic arpeggio
      const pattern = [0, 2, 4, 3, 1, 4, 2, 5, 0, 3, 2, 4, 1, 3, 5, 4];
      const noteIdx = pattern[step % pattern.length] % scale.length;
      const freq = scale[noteIdx];

      const leadOsc = this.ctx.createOscillator();
      const leadGain = this.ctx.createGain();
      leadOsc.type = track === 'cyber' ? 'sawtooth' : track === 'legend' ? 'sine' : 'triangle';
      leadOsc.frequency.setValueAtTime(freq, now);

      leadGain.gain.setValueAtTime(0.1, now);
      leadGain.gain.exponentialRampToValueAtTime(0.005, now + (stepIntervalMs / 1000) * 0.9);

      leadOsc.connect(leadGain);
      leadGain.connect(this.musicGain);
      leadOsc.start(now);
      leadOsc.stop(now + (stepIntervalMs / 1000));

      step++;
    }, stepIntervalMs);
  }

  public stopBGM() {
    if (this.bgmIntervalId !== null) {
      clearInterval(this.bgmIntervalId);
      this.bgmIntervalId = null;
    }
    this.currentBgmTrack = null;
  }
}

export const soundManager = new SoundManager();
