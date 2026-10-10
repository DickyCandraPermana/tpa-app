import { getLocalSettings } from "@/lib/services/settingsService";

export type SoundEffectType = "CORRECT" | "INCORRECT" | "COIN" | "STAR" | "CLICK";

let audioCtx: AudioContext | null = null;
let isExplicitlyMuted = false;

export const setSoundMuted = (muted: boolean): void => {
  isExplicitlyMuted = muted;
};

export const resetAudioContext = (): void => {
  audioCtx = null;
};

export const isSoundMuted = (): boolean => {
  if (isExplicitlyMuted) return true;
  const settings = getLocalSettings();
  return !settings.soundEnabled;
};

export const initAudioContext = async (): Promise<AudioContext | null> => {
  if (typeof window === "undefined") return null;

  try {
    const AudioContextClass =
      window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return null;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === "suspended") {
      await audioCtx.resume();
    }

    return audioCtx;
  } catch (err) {
    console.warn("Unable to initialize AudioContext:", err);
    return null;
  }
};

export const playSound = async (type: SoundEffectType): Promise<void> => {
  if (isSoundMuted()) return;

  const ctx = await initAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  switch (type) {
    case "CORRECT": {
      // Ascending pentatonic notes: C5 (523.25), E5 (659.25), G5 (783.99), C6 (1046.50)
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.001, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.2, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.26);
      });
      break;
    }

    case "INCORRECT": {
      // Warm gentle dual tone (D4 -> A3)
      const freqs = [293.66, 220.0];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);

        gain.gain.setValueAtTime(0.001, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.18, now + idx * 0.12 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.22);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.24);
      });
      break;
    }

    case "COIN": {
      // Crisp high chimes: B5 (987.77), E6 (1318.51)
      const freqs = [987.77, 1318.51];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        gain.gain.setValueAtTime(0.001, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.25, now + idx * 0.06 + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.18);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.19);
      });
      break;
    }

    case "STAR": {
      // Shimmer arpeggio: G5 (783.99), B5 (987.77), D6 (1174.66), G6 (1567.98)
      const freqs = [783.99, 987.77, 1174.66, 1567.98];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);

        gain.gain.setValueAtTime(0.001, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.18, now + idx * 0.07 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.36);
      });
      break;
    }

    case "CLICK": {
      // Short 10ms click
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(800, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.08, now + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.012);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.015);
      break;
    }
  }
};
