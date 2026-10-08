import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DashboardPage from "@/app/dashboard/page";
import * as halaqahService from "@/lib/services/halaqahService";
import * as rewardService from "@/lib/services/rewardService";
import * as coursesModule from "@/lib/courses";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

// Mock AuthContext
const mockUseAuth = vi.fn();
vi.mock("@/context/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock("@/lib/services/halaqahService", () => ({
  getHalaqahSantriList: vi.fn(),
  recordSantriSetoran: vi.fn(),
}));

vi.mock("@/lib/services/rewardService", () => ({
  getPendingRedeemRequests: vi.fn(),
}));

vi.mock("@/lib/courses", () => ({
  getCourses: vi.fn(),
}));

describe("DashboardPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders ustadz halaqah monitoring and allows recording setoran", async () => {
    mockUseAuth.mockReturnValue({
      uid: "ustadz-123",
      username: "Ustadz Ahmad",
      role: "ustaz",
      totalPoint: 0,
      completedCourse: [],
    });

    vi.mocked(halaqahService.getHalaqahSantriList).mockResolvedValue([
      {
        id: "s-1",
        name: "Muhammad Faris",
        jilid: "Jilid 2",
        page: 18,
        totalPages: 30,
        completed: 18,
      },
    ]);

    vi.mocked(rewardService.getPendingRedeemRequests).mockResolvedValue([
      {
        id: "req-1",
        userId: "s-1",
        userName: "Muhammad Faris",
        rewardId: "r-1",
        rewardName: "Buku Tulis",
        pointsRequired: 10,
        status: "PENDING",
      },
    ]);

    vi.mocked(halaqahService.recordSantriSetoran).mockResolvedValue({
      success: true,
      logId: "setoran-new",
    });

    vi.mocked(coursesModule.getCourses).mockResolvedValue([]);

    render(<DashboardPage />);

    // Verify ustadz header and santri loaded
    await waitFor(() => {
      expect(screen.getByText(/Halaqah Abu Bakar Ash-Shiddiq/i)).toBeDefined();
      expect(screen.getByText("Muhammad Faris")).toBeDefined();
      expect(screen.getByText(/1 Hadiah/i)).toBeDefined();
    });

    // Click Update Setoran
    const updateBtn = screen.getByRole("button", { name: /Update Setoran/i });
    fireEvent.click(updateBtn);

    // Modal should appear
    expect(screen.getByText(/Catat Setoran Mengaji/i)).toBeDefined();

    // Submit setoran
    const submitBtn = screen.getByRole("button", { name: /Simpan Setoran/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(halaqahService.recordSantriSetoran).toHaveBeenCalledWith(
        expect.objectContaining({
          santriId: "s-1",
          ustadzId: "ustadz-123",
        })
      );
      expect(screen.getByText(/berhasil dicatat/i)).toBeDefined();
    });
  });

  it("renders santri learning map view when role is santri", async () => {
    mockUseAuth.mockReturnValue({
      uid: "santri-123",
      username: "Faris",
      role: "santri",
      totalPoint: 45,
      completedCourse: ["hijaiyah-dasar"],
    });

    vi.mocked(coursesModule.getCourses).mockResolvedValue([
      {
        id: "huruf-hijaiyah",
        title: "Huruf Hijaiyah",
        description: "Dasar",
        category: "tahsin",
        level: "beginner",
        totalQuestions: 10,
        order: 1,
      },
    ]);

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText(/Peta Petualangan Mengaji/i)).toBeDefined();
      expect(screen.getByText(/45 🪙/i)).toBeDefined();
    });
  });
});