import { describe, it, expect, vi, beforeEach } from "vitest";
import * as firestore from "firebase/firestore";
import { recordCoinTransaction } from "@/lib/services/coinService";
import { redeemReward, validateRedeemAffordability } from "@/lib/services/rewardService";

vi.mock("firebase/firestore", () => {
  return {
    collection: vi.fn((db, name) => ({ _type: "collection", name })),
    doc: vi.fn((db, coll, id) => ({ _type: "doc", coll, id: id || "generated-req-id" })),
    getDoc: vi.fn(),
    getDocs: vi.fn(),
    addDoc: vi.fn(),
    setDoc: vi.fn(),
    updateDoc: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
    increment: vi.fn((n) => ({ _type: "increment", value: n })),
    serverTimestamp: vi.fn(() => "MOCK_SERVER_TIMESTAMP"),
    runTransaction: vi.fn(),
  };
});

vi.mock("@/lib/firebase", () => ({
  db: {},
}));

vi.mock("@/lib/services/coinService", () => ({
  recordCoinTransaction: vi.fn().mockResolvedValue("mock-tx-id"),
}));

describe("Redeem Reward Service (Atomic & Integrity Guard)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("validateRedeemAffordability", () => {
    it("returns canRedeem: true when userPoints >= cost", () => {
      const res = validateRedeemAffordability(50, 20);
      expect(res.canRedeem).toBe(true);
      expect(res.remainingPoints).toBe(30);
      expect(res.error).toBeUndefined();
    });

    it("returns canRedeem: false when userPoints < cost", () => {
      const res = validateRedeemAffordability(15, 20);
      expect(res.canRedeem).toBe(false);
      expect(res.remainingPoints).toBe(15);
      expect(res.error).toMatch(/tidak mencukupi/i);
    });
  });

  describe("redeemReward", () => {
    const mockReward = {
      id: "reward-peci-01",
      name: "Peci Rajut",
      pointsRequired: 20,
    };

    it("fails early if userPoints < reward.pointsRequired without calling transaction", async () => {
      const result = await redeemReward("user-1", 10, mockReward, "Santri A");

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/tidak mencukupi/i);
      expect(firestore.runTransaction).not.toHaveBeenCalled();
    });

    it("executes atomic transaction, deducts points, and records coin ledger", async () => {
      const mockTx = {
        get: vi.fn().mockResolvedValue({
          exists: () => true,
          data: () => ({ totalPoint: 50 }),
        }),
        set: vi.fn(),
        update: vi.fn(),
      };

      vi.mocked(firestore.runTransaction).mockImplementation(async (db, cb) => {
        return cb(mockTx as any);
      });

      const result = await redeemReward("user-1", 50, mockReward, "Santri Ahmad");

      expect(result.success).toBe(true);
      expect(result.newPoints).toBe(30);
      expect(mockTx.set).toHaveBeenCalledTimes(1);
      expect(mockTx.update).toHaveBeenCalledTimes(1);
      expect(recordCoinTransaction).toHaveBeenCalledWith(
        "user-1",
        -20,
        "SPENT",
        "REWARD_REDEEM",
        expect.anything(),
        "Penukaran hadiah: Peci Rajut"
      );
    });

    it("aborts when Firestore user point balance is actually insufficient in transaction", async () => {
      const mockTx = {
        get: vi.fn().mockResolvedValue({
          exists: () => true,
          data: () => ({ totalPoint: 5 }), // actual point in db is lower
        }),
        set: vi.fn(),
        update: vi.fn(),
      };

      vi.mocked(firestore.runTransaction).mockImplementation(async (db, cb) => {
        return cb(mockTx as any);
      });

      const result = await redeemReward("user-1", 50, mockReward, "Santri Ahmad");

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/tidak mencukupi/i);
      expect(mockTx.set).not.toHaveBeenCalled();
      expect(mockTx.update).not.toHaveBeenCalled();
      expect(recordCoinTransaction).not.toHaveBeenCalled();
    });
  });
});
