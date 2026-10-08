import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ExchangePage from "@/app/dashboard/exchange/page";
import * as rewardService from "@/lib/services/rewardService";

// Mock AuthContext
const mockUseAuth = vi.fn();
vi.mock("@/context/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock rewardService
vi.mock("@/lib/services/rewardService", () => ({
  getRewards: vi.fn(),
  getAllRedeemRequests: vi.fn(),
  getUserRedeemRequests: vi.fn(),
  approveRedeemRequest: vi.fn(),
  rejectRedeemRequest: vi.fn(),
  redeemReward: vi.fn(),
}));

describe("ExchangePage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders ustadz view with claim approval tab and handles approval", async () => {
    mockUseAuth.mockReturnValue({
      uid: "ustadz-123",
      role: "ustaz",
      totalPoint: 100,
      setTotalPoint: vi.fn(),
    });

    vi.mocked(rewardService.getRewards).mockResolvedValue([
      { id: "r1", name: "Buku Tulis", pointsRequired: 5 },
    ]);

    vi.mocked(rewardService.getAllRedeemRequests).mockResolvedValue([
      {
        id: "req-1",
        userId: "santri-1",
        userName: "Ahmad Santri",
        rewardId: "r1",
        rewardName: "Buku Tulis",
        pointsRequired: 5,
        status: "PENDING",
        createdAt: "2026-10-08T10:00:00Z",
      },
    ]);

    vi.mocked(rewardService.approveRedeemRequest).mockResolvedValue({ success: true });

    render(<ExchangePage />);

    // Check Ustadz tab is available
    await waitFor(() => {
      expect(screen.getByText(/Klaim Santri/i)).toBeDefined();
    });

    // Check claim card rendered
    expect(screen.getByText("Ahmad Santri")).toBeDefined();
    expect(screen.getByText("Buku Tulis")).toBeDefined();

    // Click Setujui
    const approveBtn = screen.getByRole("button", { name: /^Setujui$/i });
    fireEvent.click(approveBtn);

    await waitFor(() => {
      expect(rewardService.approveRedeemRequest).toHaveBeenCalledWith("req-1", "ustadz-123");
    });
  });

  it("handles rejection flow with reason input and invokes rejectRedeemRequest", async () => {
    mockUseAuth.mockReturnValue({
      uid: "ustadz-123",
      role: "ustaz",
      totalPoint: 100,
      setTotalPoint: vi.fn(),
    });

    vi.mocked(rewardService.getRewards).mockResolvedValue([]);
    vi.mocked(rewardService.getAllRedeemRequests).mockResolvedValue([
      {
        id: "req-1",
        userId: "santri-1",
        userName: "Ahmad Santri",
        rewardId: "r1",
        rewardName: "Buku Tulis",
        pointsRequired: 5,
        status: "PENDING",
        createdAt: "2026-10-08T10:00:00Z",
      },
    ]);

    vi.mocked(rewardService.rejectRedeemRequest).mockResolvedValue({ success: true });

    render(<ExchangePage />);

    await waitFor(() => {
      expect(screen.getByText("Ahmad Santri")).toBeDefined();
    });

    const rejectBtn = screen.getByRole("button", { name: /^Tolak$/i });
    fireEvent.click(rejectBtn);

    const chipStok = screen.getByText(/Stok Habis di Lemari TPA/i);
    fireEvent.click(chipStok);

    const confirmRejectBtn = screen.getByRole("button", { name: /Konfirmasi Tolak/i });
    fireEvent.click(confirmRejectBtn);

    await waitFor(() => {
      expect(rewardService.rejectRedeemRequest).toHaveBeenCalledWith(
        "req-1",
        "ustadz-123",
        expect.stringContaining("Stok Habis")
      );
    });
  });

  it("renders santri view with catalog and personal claim history", async () => {
    mockUseAuth.mockReturnValue({
      uid: "santri-1",
      role: "santri",
      totalPoint: 50,
      setTotalPoint: vi.fn(),
    });

    vi.mocked(rewardService.getRewards).mockResolvedValue([
      { id: "r1", name: "Buku Tulis", pointsRequired: 5 },
    ]);

    vi.mocked(rewardService.getUserRedeemRequests).mockResolvedValue([
      {
        id: "req-2",
        userId: "santri-1",
        userName: "Santri",
        rewardId: "r1",
        rewardName: "Buku Tulis",
        pointsRequired: 5,
        status: "APPROVED",
        createdAt: "2026-10-08T09:00:00Z",
      },
    ]);

    render(<ExchangePage />);

    await waitFor(() => {
      expect(screen.getAllByText("Buku Tulis").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/Tukar Koin Berkah/i)).toBeDefined();
    });
  });
});