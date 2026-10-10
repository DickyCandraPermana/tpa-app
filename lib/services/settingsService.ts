import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserSettings, UserSettingsSchema } from "@/types/schema";

export const SETTINGS_STORAGE_KEY = "sibaq_user_settings";

export const DEFAULT_SETTINGS: UserSettings = {
  soundEnabled: true,
  notificationEnabled: true,
};

export const getLocalSettings = (): UserSettings => {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return UserSettingsSchema.parse(JSON.parse(raw));
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export const saveLocalSettings = (settings: UserSettings): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.warn("Failed saving settings to localStorage:", err);
  }
};

export const fetchRemoteSettings = async (uid: string): Promise<UserSettings> => {
  try {
    const snap = await getDoc(doc(db, "users", uid));
    if (snap.exists()) {
      const data = snap.data();
      if (data?.settings) {
        const parsed = UserSettingsSchema.parse(data.settings);
        saveLocalSettings(parsed);
        return parsed;
      }
    }
  } catch (error) {
    console.warn("Using local settings fallback due to Firestore read failure:", error);
  }
  return getLocalSettings();
};

export const persistSettings = async (
  uid: string | null,
  newSettings: Partial<UserSettings>
): Promise<UserSettings> => {
  const current = getLocalSettings();
  const updated: UserSettings = { ...current, ...newSettings };

  // 1. Simpan segera ke localStorage (L1 cache)
  saveLocalSettings(updated);

  // 2. Simpan ke Firestore jika user terotentikasi
  if (uid) {
    try {
      await updateDoc(doc(db, "users", uid), {
        settings: updated,
      });
    } catch (error) {
      console.warn("Firestore settings sync delayed/failed:", error);
    }
  }

  return updated;
};
