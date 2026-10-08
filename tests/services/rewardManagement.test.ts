import { describe, it, expect, vi, beforeEach } from "vitest";
import { createReward, deleteReward, updateRewardStock } from "@/lib/services/rewardService";

// Mock firebase firestore
vi.mock("@/lib/firebase", () => ({
  db: {},
}));

vi.mock("firebase/firestore", () => {
  return {
    collection: vi.fn(),
    addDoc: vi.fn(),
    doc: vi.fn(),
    updateDoc: vi.fn(),
    deleteDoc: vi.fn(),
    getDoc: vi.fn(),
    getDocs: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
    serverTimestamp: vi.fn(() => "2026-10-08T00:00:00Z"),
    runTransaction: vi.fn(),
    increment: vi.fn((n) => ({ _increment: n })),
  };
});

describe("Reward Management Service (Ustadz)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("successfully creates a new reward in Firestore", async () => {
    const { addDoc } = await import("firebase/firestore");
    (addDoc as any).mockResolvedValueOnce({ id: "reward-new-123" });

    const newReward = await createReward({
      name: "Peci Rajut Santri",
      description: "Peci rajut putih berkualitas untuk sholat",
      pointsRequired: 20,
      stock: 15,
      imageUrl: "https://res.cloudinary.com/dogolfub6/image/upload/v1/peci.png",
    });

    expect(addDoc).toHaveBeenCalledTimes(1);
    expect(newReward.id).toBe("reward-new-123");
    expect(newReward.name).toBe("Peci Rajut Santri");
    expect(newReward.pointsRequired).toBe(20);
    expect(newReward.stock).toBe(15);
  });

  it("validates input and throws error if pointsRequired <= 0", async () => {
    await expect(
      createReward({
        name: "Hadiah Gratis",
        pointsRequired: 0,
        stock: 5,
      })
    ).rejects.toThrow();
  });

  it("successfully deletes a reward from Firestore", async () => {
    const { deleteDoc } = await import("firebase/firestore");
    (deleteDoc as any).mockResolvedValueOnce(undefined);

    await expect(deleteReward("reward-123")).resolves.not.toThrow();
    expect(deleteDoc).toHaveBeenCalledTimes(1);
  });

  it("successfully updates reward stock", async () => {
    const { updateDoc } = await import("firebase/firestore");
    (updateDoc as any).mockResolvedValueOnce(undefined);

    await expect(updateRewardStock("reward-123", 25)).resolves.not.toThrow();
    expect(updateDoc).toHaveBeenCalledTimes(1);
  });
});
