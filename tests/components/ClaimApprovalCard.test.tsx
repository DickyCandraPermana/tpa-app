import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import ClaimApprovalCard from "@/components/features/ClaimApprovalCard";
import { RedeemRequest } from "@/types/schema";

const mockPendingRequest: RedeemRequest = {
  id: "req-1",
  userId: "santri-1",
  userName: "Muhammad Faris",
  rewardId: "r-1",
  rewardName: "Set Stiker Doa Harian",
  pointsRequired: 25,
  cost: 25,
  status: "PENDING",
  createdAt: "2026-10-08T10:00:00Z",
};

describe("ClaimApprovalCard Component", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders pending claim details correctly", () => {
    const handleApprove = vi.fn();
    const handleReject = vi.fn();

    render(
      <ClaimApprovalCard
        request={mockPendingRequest}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    );

    expect(screen.getByText("Muhammad Faris")).toBeDefined();
    expect(screen.getByText("Set Stiker Doa Harian")).toBeDefined();
    expect(screen.getByText(/25 Poin/i)).toBeDefined();
    expect(screen.getByText(/Menunggu/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /Setujui/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /Tolak/i })).toBeDefined();
  });

  it("triggers onApprove callback with request id when Setujui is clicked", () => {
    const handleApprove = vi.fn();
    const handleReject = vi.fn();

    render(
      <ClaimApprovalCard
        request={mockPendingRequest}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    );

    const approveBtn = screen.getByRole("button", { name: /Setujui/i });
    fireEvent.click(approveBtn);

    expect(handleApprove).toHaveBeenCalledWith("req-1");
  });

  it("opens rejection drawer and allows submitting rejection with reason chip", () => {
    const handleApprove = vi.fn();
    const handleReject = vi.fn();

    render(
      <ClaimApprovalCard
        request={mockPendingRequest}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    );

    const rejectBtn = screen.getByRole("button", { name: /Tolak/i });
    fireEvent.click(rejectBtn);

    // Form inputs and chip options should appear
    expect(screen.getByPlaceholderText(/Alasan penolakan/i)).toBeDefined();
    const chipStok = screen.getByText(/Stok Habis/i);
    expect(chipStok).toBeDefined();

    // Click chip
    fireEvent.click(chipStok);

    const confirmRejectBtn = screen.getByRole("button", { name: /Konfirmasi Tolak/i });
    fireEvent.click(confirmRejectBtn);

    expect(handleReject).toHaveBeenCalledWith("req-1", expect.stringContaining("Stok Habis"));
  });

  it("renders approved state badge with no action buttons", () => {
    const approvedRequest: RedeemRequest = {
      ...mockPendingRequest,
      status: "APPROVED",
    };

    render(
      <ClaimApprovalCard
        request={approvedRequest}
        onApprove={vi.fn()}
        onReject={vi.fn()}
      />
    );

    expect(screen.getByText(/Disetujui/i)).toBeDefined();
    expect(screen.queryByRole("button", { name: /Setujui/i })).toBeNull();
  });

  it("renders rejected state badge and reason alert", () => {
    const rejectedRequest: RedeemRequest = {
      ...mockPendingRequest,
      status: "REJECTED",
      rejectionReason: "Barang sedang tidak tersedia di TPA",
    };

    render(
      <ClaimApprovalCard
        request={rejectedRequest}
        onApprove={vi.fn()}
        onReject={vi.fn()}
      />
    );

    expect(screen.getByText(/Ditolak/i)).toBeDefined();
    expect(screen.getByText(/Barang sedang tidak tersedia di TPA/i)).toBeDefined();
  });
});