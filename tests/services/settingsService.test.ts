import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  DEFAULT_SETTINGS,
  getLocalSettings,
  saveLocalSettings,
  fetchRemoteSettings,
  persistSettings,
} from "@/lib/services/settingsService";
import { getDoc, updateDoc } from "firebase/firestore";

// Mock firebase
vi.mock("@/lib/firebase", () => ({
  db: {},
}));

vi.mock("firebase/firestore", () => ({
  doc: vi.fn((_db, coll, id) => ({ coll, id })),
  getDoc: vi.fn(),
  updateDoc: vi.fn(),
}));

describe("settingsService", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("returns DEFAULT_SETTINGS if localStorage is empty", () => {
    const settings = getLocalSettings();
    expect(settings).toEqual(DEFAULT_SETTINGS);
    expect(settings.soundEnabled).toBe(true);
    expect(settings.notificationEnabled).toBe(true);
  });

  it("saves and retrieves settings from localStorage", () => {
    saveLocalSettings({ soundEnabled: false, notificationEnabled: true });
    const settings = getLocalSettings();
    expect(settings.soundEnabled).toBe(false);
    expect(settings.notificationEnabled).toBe(true);
  });

  it("fetchRemoteSettings reconciles Firestore settings into localStorage", async () => {
    (getDoc as any).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        settings: { soundEnabled: false, notificationEnabled: false },
      }),
    });

    const settings = await fetchRemoteSettings("user-123");
    expect(settings.soundEnabled).toBe(false);
    expect(settings.notificationEnabled).toBe(false);

    // Verify localStorage was updated
    const local = getLocalSettings();
    expect(local.soundEnabled).toBe(false);
  });

  it("fetchRemoteSettings falls back to localSettings on Firestore error", async () => {
    saveLocalSettings({ soundEnabled: true, notificationEnabled: false });
    (getDoc as any).mockRejectedValueOnce(new Error("Network offline"));

    const settings = await fetchRemoteSettings("user-123");
    expect(settings.soundEnabled).toBe(true);
    expect(settings.notificationEnabled).toBe(false);
  });

  it("persistSettings writes to localStorage immediately and updates Firestore if uid present", async () => {
    (updateDoc as any).mockResolvedValueOnce(undefined);

    const updated = await persistSettings("user-123", { soundEnabled: false });
    expect(updated.soundEnabled).toBe(false);
    expect(updated.notificationEnabled).toBe(true); // preserved

    const local = getLocalSettings();
    expect(local.soundEnabled).toBe(false);

    expect(updateDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        settings: { soundEnabled: false, notificationEnabled: true },
      })
    );
  });

  it("persistSettings writes to localStorage without error if uid is null", async () => {
    const updated = await persistSettings(null, { notificationEnabled: false });
    expect(updated.notificationEnabled).toBe(false);
    expect(updateDoc).not.toHaveBeenCalled();
  });
});
