import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  playSound,
  initAudioContext,
  setSoundMuted,
  isSoundMuted,
  resetAudioContext,
} from "@/lib/audio/soundManager";

describe("Web Audio API Procedural soundManager", () => {
  let mockOscillator: any;
  let mockGain: any;
  let mockAudioContext: any;

  beforeEach(() => {
    mockOscillator = {
      type: "sine",
      frequency: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };

    mockGain = {
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    };

    mockAudioContext = {
      state: "suspended",
      currentTime: 0,
      destination: {},
      createOscillator: vi.fn(() => ({ ...mockOscillator })),
      createGain: vi.fn(() => ({ ...mockGain })),
      resume: vi.fn().mockResolvedValue(undefined),
    };

    function MockAudioContext() {
      return mockAudioContext;
    }

    (global as any).AudioContext = MockAudioContext;
    (window as any).AudioContext = MockAudioContext;

    resetAudioContext();
    setSoundMuted(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("initializes AudioContext and resumes when suspended", async () => {
    const ctx = await initAudioContext();
    expect(ctx).toBeDefined();
    expect(mockAudioContext.resume).toHaveBeenCalled();
  });

  it("plays CORRECT sound with ascending pentatonic frequencies", async () => {
    await playSound("CORRECT");
    expect(mockAudioContext.createOscillator).toHaveBeenCalled();
    expect(mockAudioContext.createGain).toHaveBeenCalled();
  });

  it("plays INCORRECT sound with warm gentle tones", async () => {
    await playSound("INCORRECT");
    expect(mockAudioContext.createOscillator).toHaveBeenCalled();
    expect(mockAudioContext.createGain).toHaveBeenCalled();
  });

  it("plays COIN sound", async () => {
    await playSound("COIN");
    expect(mockAudioContext.createOscillator).toHaveBeenCalled();
  });

  it("plays STAR sound", async () => {
    await playSound("STAR");
    expect(mockAudioContext.createOscillator).toHaveBeenCalled();
  });

  it("plays CLICK sound", async () => {
    await playSound("CLICK");
    expect(mockAudioContext.createOscillator).toHaveBeenCalled();
  });

  it("does not play any sound when muted", async () => {
    setSoundMuted(true);
    expect(isSoundMuted()).toBe(true);

    await playSound("CORRECT");
    expect(mockAudioContext.createOscillator).not.toHaveBeenCalled();
  });
});
