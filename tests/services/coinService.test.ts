import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  formatCoinTransactionPayload,
  recordCoinTransaction,
  getUserTransactions,
} from "@/lib/services/coinService";

vi.mock("@/lib/firebase", () => ({
  db: {},
}));

vi.mock("firebase/firestore", () => {
  return {
    collection: vi.fn(),
    addDoc: vi.fn(),
    getDocs: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
    serverTimestamp: vi.fn(() => "2026-10-10T00:00:00Z"),
  };
});

describe("Coin Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("formatCoinTransactionPayload", () => {
    it("correctly formats transaction payload with all fields", () => {
      const payload = formatCoinTransactionPayload(
        "user-123",
        50,
        "EARNED",
        "QUIZ",
        "quiz-456",
        "Completed Quran Quiz"
      );

      expect(payload.userId).toBe("user-123");
      expect(payload.amount).toBe(50);
      expect(payload.type).toBe("EARNED");
      expect(payload.source).toBe("QUIZ");
      expect(payload.referenceId).toBe("quiz-456");
      expect(payload.description).toBe("Completed Quran Quiz");
      expect(payload.createdAt).toBeDefined();
    });

    it("handles default description when omitted", () => {
      const payload = formatCoinTransactionPayload(
        "user-999",
        10,
        "SPENT",
        "REWARD_REDEEM"
      );

      expect(payload.description).toBe("");
      expect(payload.referenceId).toBeUndefined();
    });
  });

  describe("recordCoinTransaction", () => {
    it("successfully creates a new transaction document in Firestore", async () => {
      const { addDoc } = await import("firebase/firestore");
      (addDoc as any).mockResolvedValueOnce({ id: "tx-doc-789" });

      const result = await recordCoinTransaction(
        "user-123",
        25,
        "EARNED",
        "DAILY_BONUS",
        undefined,
        "Daily streak bonus"
      );

      expect(addDoc).toHaveBeenCalledTimes(1);
      expect(result.success).toBe(true);
      expect(result.id).toBe("tx-doc-789");
    });

    it("returns error object when Firestore addDoc fails", async () => {
      const { addDoc } = await import("firebase/firestore");
      (addDoc as any).mockRejectedValueOnce(new Error("Permission denied"));

      const result = await recordCoinTransaction(
        "user-123",
        25,
        "EARNED",
        "DAILY_BONUS"
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Permission denied");
    });
  });

  describe("getUserTransactions", () => {
    it("returns parsed transactions from Firestore query snapshot", async () => {
      const { getDocs } = await import("firebase/firestore");
      const mockDocs = [
        {
          id: "tx-1",
          data: () => ({
            userId: "user-123",
            amount: 100,
            type: "EARNED",
            source: "QUIZ",
            createdAt: "2026-10-10T02:00:00Z",
            description: "Halaqah subuh",
          }),
        },
      ];
      (getDocs as any).mockResolvedValueOnce({ docs: mockDocs });

      const txs = await getUserTransactions("user-123", 5);

      expect(txs).toHaveLength(1);
      expect(txs[0].id).toBe("tx-1");
      expect(txs[0].amount).toBe(100);
      expect(txs[0].type).toBe("EARNED");
    });

    it("returns empty array when query throws error", async () => {
      const { getDocs } = await import("firebase/firestore");
      (getDocs as any).mockRejectedValueOnce(new Error("Network timeout"));

      const txs = await getUserTransactions("user-123");
      expect(txs).toEqual([]);
    });
  });
});
