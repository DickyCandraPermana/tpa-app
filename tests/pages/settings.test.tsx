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

vi.mock("@/lib/services/settingsService", () => ({
  getLocalSettings: vi.fn(() => ({ soundEnabled: true, notificationEnabled: true })),
  fetchRemoteSettings: vi.fn(async () => ({ soundEnabled: true, notificationEnabled: true })),
  persistSettings: vi.fn(async (_uid, updates) => ({
    soundEnabled: updates.soundEnabled ?? true,
    notificationEnabled: updates.notificationEnabled ?? true,
  })),
}));

describe("SettingsPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders settings header, change password section, and preferences", () => {
    render(<SettingsPage />);

    expect(screen.getByText(/Pengaturan Akun/i)).toBeDefined();
    expect(screen.getByText(/Ganti Kata Sandi/i)).toBeDefined();
    expect(screen.getByLabelText(/Kata Sandi Baru/i)).toBeDefined();
    expect(screen.getByLabelText(/Konfirmasi Kata Sandi/i)).toBeDefined();
  });

  it("validates password length and matching passwords", async () => {
    render(<SettingsPage />);

    const newPasswordInput = screen.getByLabelText(/Kata Sandi Baru/i);
    const confirmPasswordInput = screen.getByLabelText(/Konfirmasi Kata Sandi/i);
    const submitBtn = screen.getByRole("button", { name: /Simpan Kata Sandi/i });

    // Try too short password
    fireEvent.change(newPasswordInput, { target: { value: "123" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "123" } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/minimal 6 karakter/i)).toBeDefined();
    });

    // Try mismatched passwords
    fireEvent.change(newPasswordInput, { target: { value: "password123" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "password456" } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/tidak cocok/i)).toBeDefined();
    });
  });

  it("calls changeUserPassword when form is valid", async () => {
    const { changeUserPassword } = await import("@/lib/auth");
    (changeUserPassword as any).mockResolvedValueOnce({ success: true });

    render(<SettingsPage />);

    const newPasswordInput = screen.getByLabelText(/Kata Sandi Baru/i);
    const confirmPasswordInput = screen.getByLabelText(/Konfirmasi Kata Sandi/i);
    const submitBtn = screen.getByRole("button", { name: /Simpan Kata Sandi/i });

    fireEvent.change(newPasswordInput, { target: { value: "secret123" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "secret123" } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(changeUserPassword).toHaveBeenCalledWith("secret123");
      expect(screen.getByText(/berhasil diperbarui/i)).toBeDefined();
    });
  });

  it("loads settings on mount and persists when toggled", async () => {
    const { persistSettings } = await import("@/lib/services/settingsService");

    render(<SettingsPage />);

    // Toggle sound
    const soundToggle = screen.getByLabelText(/Toggle Efek Suara/i);
    fireEvent.click(soundToggle);

    await waitFor(() => {
      expect(persistSettings).toHaveBeenCalledWith("test-user-123", {
        soundEnabled: false,
      });
    });
  });
});
