import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import RewardCard from "@/components/features/RewardCard";
import { Reward } from "@/types/schema";

const mockReward: Reward = {
  id: "r1",
  name: "Buku Kisah Nabi",
  pointsRequired: 20,
};

describe("RewardCard Component", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders reward details and enables redemption when user has more points", () => {
    const handleRedeem = vi.fn();
    render(<RewardCard reward={mockReward} userPoints={25} onRedeem={handleRedeem} />);
    expect(screen.getByText("Buku Kisah Nabi")).toBeDefined();
    const btn = screen.getByRole("button", { name: /Tukar Hadiah/i });
    expect(btn.hasAttribute("disabled")).toBe(false);
    fireEvent.click(btn);
    expect(handleRedeem).toHaveBeenCalledWith(mockReward);
  });

  // Review Focus #1: Exact point balance equality
  it("enables redemption when userPoints is exactly equal to pointsRequired", () => {
    const handleRedeem = vi.fn();
    render(<RewardCard reward={mockReward} userPoints={20} onRedeem={handleRedeem} />);
    const btn = screen.getByRole("button", { name: /Tukar Hadiah/i });
    expect(btn.hasAttribute("disabled")).toBe(false);
    fireEvent.click(btn);
    expect(handleRedeem).toHaveBeenCalledWith(mockReward);
  });

  it("disables redemption and shows missing coins when user points are insufficient", () => {
    const handleRedeem = vi.fn();
    render(<RewardCard reward={mockReward} userPoints={15} onRedeem={handleRedeem} />);
    expect(screen.getByText(/Kurang 5 Poin/i)).toBeDefined();
    const btn = screen.getByRole("button", { name: /Kurang 5 Poin/i });
    expect(btn.hasAttribute("disabled")).toBe(true);
    fireEvent.click(btn);
    expect(handleRedeem).not.toHaveBeenCalled();
  });
});
