import { describe, it, expect, vi, beforeEach } from "vitest";
import { getLeaderboard, LeaderboardEntry } from "@/lib/services/leaderboardService";

vi.mock("@/lib/firebase", () => ({
  db: {},
}));

vi.mock("firebase/firestore", () => {
  return {
    collection: vi.fn(),
    getDocs: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
  };
});

describe("Leaderboard Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches top santri and sorts them with ranks", async () => {
    const { getDocs } = await import("firebase/firestore");
    const mockDocs = [
      {
        id: "santri-1",
        data: () => ({
          username: "Ahmad",
          totalPoint: 150,
          role: "santri",
          avatarURL: "https://example.com/ahmad.png",
          completedCourse: ["c1", "c2"],
        }),
      },
      {
        id: "santri-2",
        data: () => ({
          username: "Fatimah",
          totalPoint: 120,
          role: "santri",
          avatarURL: null,
          completedCourse: ["c1"],
        }),
      },
      {
        id: "santri-3",
        data: () => ({
          username: "Zaid",
          totalPoint: 90,
          role: "santri",
          avatarURL: null,
          completedCourse: [],
        }),
      },
    ];

    (getDocs as any).mockResolvedValueOnce({
      empty: false,
      docs: mockDocs,
    });

    const leaderboard = await getLeaderboard(10);

    expect(leaderboard.length).toBe(3);
    expect(leaderboard[0].rank).toBe(1);
    expect(leaderboard[0].username).toBe("Ahmad");
    expect(leaderboard[0].totalPoint).toBe(150);

    expect(leaderboard[1].rank).toBe(2);
    expect(leaderboard[1].username).toBe("Fatimah");

    expect(leaderboard[2].rank).toBe(3);
    expect(leaderboard[2].username).toBe("Zaid");
  });

  it("filters out ustadz/admin accounts from leaderboard", async () => {
    const { getDocs } = await import("firebase/firestore");
    const mockDocs = [
      {
        id: "ustadz-1",
        data: () => ({
          username: "Ustadz Abdullah",
          totalPoint: 500,
          role: "ustadz",
        }),
      },
      {
        id: "santri-1",
        data: () => ({
          username: "Aisyah",
          totalPoint: 100,
          role: "santri",
        }),
      },
    ];

    (getDocs as any).mockResolvedValueOnce({
      empty: false,
      docs: mockDocs,
    });

    const leaderboard = await getLeaderboard();
    expect(leaderboard.length).toBe(1);
    expect(leaderboard[0].username).toBe("Aisyah");
    expect(leaderboard[0].rank).toBe(1);
  });
});
