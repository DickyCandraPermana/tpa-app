import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import React from "react";
import AddRewardModal from "@/components/features/AddRewardModal";

// Mock services
vi.mock("@/lib/services/rewardService", () => ({
  createReward: vi.fn(),
}));

vi.mock("@/lib/services/imageUploadService", () => ({
  uploadImage: vi.fn(),
}));

describe("AddRewardModal Component", () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSuccess: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders modal form fields when open", () => {
    render(<AddRewardModal {...defaultProps} />);

    expect(screen.getByText("Tambah Hadiah Baru")).toBeDefined();
    expect(screen.getByLabelText(/nama hadiah/i)).toBeDefined();
    expect(screen.getByLabelText(/harga koin/i)).toBeDefined();
    expect(screen.getByLabelText(/jumlah stok/i)).toBeDefined();
  });

  it("calls onClose when Batal is clicked", () => {
    render(<AddRewardModal {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: /batal/i }));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it("submits new reward successfully with image upload", async () => {
    const { createReward } = await import("@/lib/services/rewardService");
    const { uploadImage } = await import("@/lib/services/imageUploadService");

    (uploadImage as any).mockResolvedValueOnce({
      url: "https://res.cloudinary.com/dogolfub6/image/upload/v1/reward.png",
      publicId: "sibaq/rewards/reward1",
    });

    (createReward as any).mockResolvedValueOnce({
      id: "reward-new",
      name: "Tas Al-Qur'an",
      description: "Tas kain ramah lingkungan",
      pointsRequired: 30,
      stock: 10,
      imageUrl: "https://res.cloudinary.com/dogolfub6/image/upload/v1/reward.png",
    });

    render(<AddRewardModal {...defaultProps} />);

    fireEvent.change(screen.getByLabelText(/nama hadiah/i), {
      target: { value: "Tas Al-Qur'an" },
    });
    fireEvent.change(screen.getByLabelText(/harga koin/i), {
      target: { value: "30" },
    });
    fireEvent.change(screen.getByLabelText(/jumlah stok/i), {
      target: { value: "10" },
    });

    // Simulate file input
    const fileInput = screen.getByTestId("reward-image-input");
    const dummyFile = new File(["dummy"], "bag.png", { type: "image/png" });
    fireEvent.change(fileInput, { target: { files: [dummyFile] } });

    // Submit form
    fireEvent.click(screen.getByRole("button", { name: /simpan hadiah/i }));

    await waitFor(() => {
      expect(uploadImage).toHaveBeenCalledWith(dummyFile, "sibaq/rewards");
      expect(createReward).toHaveBeenCalledWith({
        name: "Tas Al-Qur'an",
        description: "",
        pointsRequired: 30,
        stock: 10,
        imageUrl: "https://res.cloudinary.com/dogolfub6/image/upload/v1/reward.png",
      });
      expect(defaultProps.onSuccess).toHaveBeenCalled();
    });
  });
});
