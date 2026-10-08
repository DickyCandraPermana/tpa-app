import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import React from "react";
import LeaderboardPage from "@/app/dashboard/leaderboard/page";

const mockLeaderboardData = [
  {
    rank: 1,
    uid: "santri-1",
    username: "Muhammad Fatih",
    totalPoint: 250,
    avatarURL: null,
    completedCourseCount: 5,
    role: "santri",
  },
  {
    rank: 2,
    uid: "santri-2",
    username: "Aisyah Humaira",
    totalPoint: 210,
    avatarURL: null,
    completedCourseCount: 4,
    role: "santri",
  },
  {
    rank: 3,
    uid: "santri-3",
    username: "Salman Al-Farisi",
    totalPoint: 180,
    avatarURL: null,
    completedCourseCount: 3,
    role: "santri",
  },
  {
    rank: 4,
    uid: "santri-4",
    username: "Bilal Bin Rabah",
    totalPoint: 150,
    avatarURL: null,
    completedCourseCount: 2,
    role: "santri",
  },
];

vi.mock("@/lib/services/leaderboardService", () => ({
  getLeaderboard: vi.fn(),
}));

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    uid: "santri-2", // logged in as Aisyah (Rank 2)
    role: "santri",
  }),
}));

describe("LeaderboardPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders leaderboard podium and rank list successfully", async () => {
    const { getLeaderboard } = await import("@/lib/services/leaderboardService");
    (getLeaderboard as any).mockResolvedValueOnce(mockLeaderboardData);

    render(<LeaderboardPage />);

    // Check loading indicator or final loaded content
    await waitFor(() => {
      expect(screen.getByText("Muhammad Fatih")).toBeDefined();
      expect(screen.getByText("Aisyah Humaira")).toBeDefined();
      expect(screen.getByText("Salman Al-Farisi")).toBeDefined();
      expect(screen.getByText("Bilal Bin Rabah")).toBeDefined();
    });

    expect(screen.getByText(/Papan Peringkat Santri/i)).toBeDefined();
    expect(screen.getByText(/250/)).toBeDefined();
  });
});
