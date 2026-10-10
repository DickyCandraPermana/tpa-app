import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import React from "react";
import ProfilePage from "@/app/dashboard/profile/page";
import { getSantriSetoranLogs } from "@/lib/services/halaqahService";
import { getUserTransactions } from "@/lib/services/coinService";

const mockUseAuth = {
  uid: "santri-001",
  username: "Ahmad Santri",
  email: "santri@sibaq.id",
  avatarURL: "https://res.cloudinary.com/dogolfub6/image/upload/v1/sibaq/avatars/avatar1.jpg",
  totalPoint: 120,
  completedCourse: ["course-1", "course-2"],
  role: "santri",
  setUid: vi.fn(),
};

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => mockUseAuth,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock("@/lib/auth", () => ({
  logoutUser: vi.fn(),
}));

vi.mock("@/lib/services/halaqahService", () => ({
  getSantriSetoranLogs: vi.fn().mockResolvedValue([
    {
      id: "setoran-1",
      santriId: "santri-001",
      santriName: "Ahmad Santri",
      jilid: "Jilid 3",
      page: 15,
      kelancaran: "LANCAR",
      bonusCoin: 2,
      notes: "Tajwid makhraj mantap",
      ustadzId: "ustadz-1",
      createdAt: "2026-10-10T10:00:00.000Z",
    },
  ]),
}));

vi.mock("@/lib/services/coinService", () => ({
  getUserTransactions: vi.fn().mockResolvedValue([
    {
      id: "tx-1",
      userId: "santri-001",
      amount: 5,
      type: "EARNED",
      source: "QUIZ",
      description: "Menyelesaikan Kuis Tajwid Dasar",
      createdAt: "2026-10-10T10:00:00.000Z",
    },
  ]),
}));

describe("ProfilePage Component Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders profile header, username, points, and completed courses", () => {
    render(<ProfilePage />);

    expect(screen.getByText("Ahmad Santri")).toBeDefined();
    expect(screen.getByText("santri@sibaq.id")).toBeDefined();
    expect(screen.getByText(/120/)).toBeDefined();
    expect(screen.getByText(/2 Materi ⭐/)).toBeDefined();
    expect(screen.getByText("Santri Teladan")).toBeDefined();
  });

  it("opens AvatarUploadModal when clicking avatar profile button", () => {
    render(<ProfilePage />);

    const avatarButton = screen.getByTestId("avatar-edit-button");
    expect(avatarButton).toBeDefined();

    fireEvent.click(avatarButton);

    // Modal title should now appear
    expect(screen.getByText("Ubah Foto Profil")).toBeDefined();
    expect(screen.getByText(/maksimal 5mb/i)).toBeDefined();
  });

  it("renders setoran history logs by default", async () => {
    render(<ProfilePage />);

    expect(await screen.findByText(/Jilid 3 • Hal 15/i)).toBeDefined();
    expect(screen.getByText(/Tajwid makhraj mantap/i)).toBeDefined();
    expect(screen.getByText(/\+2 🪙/)).toBeDefined();
  });

  it("switches to coin transaction history when clicking coin tab", async () => {
    render(<ProfilePage />);

    const coinTab = screen.getByRole("tab", { name: /riwayat koin/i });
    fireEvent.click(coinTab);

    expect(await screen.findByText("Menyelesaikan Kuis Tajwid Dasar")).toBeDefined();
    expect(screen.getByText(/\+5 🪙/)).toBeDefined();
  });
});
