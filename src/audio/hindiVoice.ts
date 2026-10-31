/**
 * Hindi Commentary & Dialogue Audio Engine
 * Provides Romanized Hindi spoken dialogues and animated text banners on Death and Victory.
 */

export interface HindiDialogue {
  headline: string;
  subline: string;
  emoji: string;
  color: string;
}

export const DEATH_DIALOGUES: HindiDialogue[] = [
  {
    headline: "Arrey Yaar! Gir Gaya! Khel Khatam!",
    subline: "Savdhaan raho, aage khatre aur kaante hain!",
    emoji: "💀💥",
    color: "#EF4444"
  },
  {
    headline: "Khatam! Tata, Bye-Bye! Good Bye!",
    subline: "Himmat mat haar mere sher, dobara koshish kar!",
    emoji: "👋😵",
    color: "#F97316"
  },
  {
    headline: "Arey Mori Maiya! Ye Kya Ho Gaya!",
    subline: "Zor ka jhatka dheere se laga bhai!",
    emoji: "⚡😱",
    color: "#E11D48"
  },
  {
    headline: "Oh Bhai! Bach Ke Chal Na!",
    subline: "Jump aur slide ka sahi timing pakdo!",
    emoji: "🛑🔥",
    color: "#DC2626"
  },
  {
    headline: "Lag Gaye 440 Volt Ke Jhatke!",
    subline: "Monster se takra gaya! Superpower use karo!",
    emoji: "⚡☠️",
    color: "#F59E0B"
  },
  {
    headline: "Sher Kabhi Haar Nahi Maanta!",
    subline: "Uth khada ho, agla run record tod dega!",
    emoji: "🦁💪",
    color: "#EA580C"
  }
];

export const VICTORY_DIALOGUES: HindiDialogue[] = [
  {
    headline: "Kya Baat Hai! Mauj Kardi Mere Sher!",
    subline: "Asli champion ki tarah stage dhoo daala!",
    emoji: "🏆✨",
    color: "#F59E0B"
  },
  {
    headline: "Shabash! Level Clear Ho Gaya!",
    subline: "Taabadtod speed aur perfect jumping!",
    emoji: "⭐🎉",
    color: "#10B981"
  },
  {
    headline: "Bawaal Macha Diya Bhai! Aag Laga Di!",
    subline: "Monsters ki bolti band kar di tune!",
    emoji: "🔥🚀",
    color: "#EC4899"
  },
  {
    headline: "Zabardast! Koi Nahi Rok Sakta Tujhe!",
    subline: "Agle level mein aur bhi maza aane wala hai!",
    emoji: "⚡👑",
    color: "#3B82F6"
  },
  {
    headline: "Dhamaka Kar Diya! Tu Toh Champion Hai!",
    subline: "Saare coins loot liye aur portal paar kiya!",
    emoji: "🪙🌟",
    color: "#8B5CF6"
  },
  {
    headline: "Jeet Gaya Re Jeet Gaya! Sikandar!",
    subline: "Top-tier platformer gameplay dikha diya!",
    emoji: "🎊🥇",
    color: "#06B6D4"
  }
];

export function getRandomDeathDialogue(): HindiDialogue {
  const idx = Math.floor(Math.random() * DEATH_DIALOGUES.length);
  return DEATH_DIALOGUES[idx];
}

export function getRandomVictoryDialogue(): HindiDialogue {
  const idx = Math.floor(Math.random() * VICTORY_DIALOGUES.length);
  return VICTORY_DIALOGUES[idx];
}

/**
 * Spoken voice playback using SpeechSynthesis with energetic arcade pitch
 */
export function speakHindiVoice(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  try {
    window.speechSynthesis.cancel(); // Stop prior speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.15;
    utterance.volume = 0.95;

    // Pick best Hindi / Indian voice if available
    const voices = window.speechSynthesis.getVoices();
    const hindiVoice = voices.find(v => v.lang.startsWith('hi') || v.lang === 'hi_IN') ||
                       voices.find(v => v.lang === 'en_IN' || v.lang.includes('India')) ||
                       voices[0];

    if (hindiVoice) {
      utterance.voice = hindiVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis error:', err);
  }
}
