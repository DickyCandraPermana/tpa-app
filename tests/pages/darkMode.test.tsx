import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import React from "react";
import SettingsPage from "@/app/dashboard/settings/page";

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    uid: "test-user-123",
    email: "santri@sibaq.com",
    role: "santri",
  }),
}));

vi.mock("@/lib/auth", () => ({
  changeUserPassword: vi.fn(),
}));

const mockPersistSettings = vi.fn(async (_uid, updates) => ({
  soundEnabled: updates.soundEnabled ?? true,
  notificationEnabled: updates.notificationEnabled ?? true,
  darkMode: updates.darkMode ?? false,
  theme: updates.theme ?? "light",
}));

vi.mock("@/lib/services/settingsService", () => ({
  getLocalSettings: vi.fn(() => ({
    soundEnabled: true,
    notificationEnabled: true,
    darkMode: false,
    theme: "light",
  })),
  fetchRemoteSettings: vi.fn(async () => ({
    soundEnabled: true,
    notificationEnabled: true,
    darkMode: false,
    theme: "light",
  })),
  persistSettings: (...args: any[]) => mockPersistSettings(args[0], args[1]),
  applyThemeToDOM: vi.fn((isDark: boolean | string) => {
    if (isDark === true || isDark === "oled") {
      document.documentElement.setAttribute("data-theme", "oled");
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
      document.documentElement.classList.remove("dark");
    }
  }),
}));

describe("DarkMode & True OLED Settings Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.classList.remove("dark");
  });

  afterEach(() => {
    cleanup();
  });

  it("renders True OLED dark mode toggle in preferences section", () => {
    render(<SettingsPage />);
    expect(screen.getByLabelText(/Toggle Mode True OLED/i)).toBeDefined();
    expect(screen.getByText(/Mode Layar True OLED/i)).toBeDefined();
  });

  it("toggling True OLED mode calls persistSettings and applies theme to DOM", async () => {
    const { applyThemeToDOM } = await import("@/lib/services/settingsService");

    render(<SettingsPage />);

    const oledToggle = screen.getByLabelText(/Toggle Mode True OLED/i);
    fireEvent.click(oledToggle);

    await waitFor(() => {
      expect(mockPersistSettings).toHaveBeenCalledWith(
        "test-user-123",
        expect.objectContaining({
          darkMode: true,
          theme: "oled",
        })
      );
      expect(applyThemeToDOM).toHaveBeenCalledWith(true);
      expect(document.documentElement.getAttribute("data-theme")).toBe("oled");
      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });
  });

  it("renders responsive 2-column layout on tablet and desktop (grid-cols-1 md:grid-cols-2)", () => {
    const { container } = render(<SettingsPage />);
    const gridContainer = container.querySelector(".grid-cols-1.md\\:grid-cols-2");
    expect(gridContainer).not.toBeNull();
  });
});
