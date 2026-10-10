import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import ConfirmModal from "@/components/ui/ConfirmModal";

describe("ConfirmModal Component", () => {
  afterEach(() => {
    cleanup();
  });

  const mockReward = {
    id: "r-1",
    name: "Al-Qur'an Terjemahan",
    pointsRequired: 50,
  };

  it("renders nothing when isOpen is false or reward is null", () => {
    const { container: c1 } = render(
      <ConfirmModal
        isOpen={false}
        reward={mockReward}
        userPoints={100}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(c1.firstChild).toBeNull();

    const { container: c2 } = render(
      <ConfirmModal
        isOpen={true}
        reward={null}
        userPoints={100}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(c2.firstChild).toBeNull();
  });

  it("renders modal details and allows confirmation when points are sufficient", () => {
    const handleConfirm = vi.fn();
    render(
      <ConfirmModal
        isOpen={true}
        reward={mockReward}
        userPoints={80}
        onConfirm={handleConfirm}
        onCancel={vi.fn()}
      />
    );

    expect(screen.getByText("Al-Qur'an Terjemahan")).toBeDefined();
    expect(screen.getByText("-50 Poin")).toBeDefined();
    expect(screen.getByText("30 Poin")).toBeDefined();

    const confirmBtn = screen.getByText("Ya, Tukar!");
    fireEvent.click(confirmBtn);

    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });

  it("disables confirm button and shows warning when points are insufficient", () => {
    const handleConfirm = vi.fn();
    render(
      <ConfirmModal
        isOpen={true}
        reward={mockReward}
        userPoints={20}
        onConfirm={handleConfirm}
        onCancel={vi.fn()}
      />
    );

    expect(
      screen.getByText("Poinmu belum cukup nih, kumpulkan poin lagi lewat kuis ya!")
    ).toBeDefined();

    const confirmBtn = screen.getByText("Ya, Tukar!").closest("button");
    expect(confirmBtn?.hasAttribute("disabled")).toBe(true);

    fireEvent.click(confirmBtn!);
    expect(handleConfirm).not.toHaveBeenCalled();
  });
});
