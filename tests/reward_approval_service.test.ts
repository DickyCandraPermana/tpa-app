import { describe, it, expect, vi, beforeEach } from "vitest";
import * as firestore from "firebase/firestore";
import { recordCoinTransaction } from "@/lib/services/coinService";
import {
  approveRedeemRequest,
  rejectRedeemRequest,
  getPendingRedeemRequests,
} from "@/lib/services/rewardService";

vi.mock("firebase/firestore", () => {
  return {
    collection: vi.fn((db, name) => ({ _type: "collection", name })),
    doc: vi.fn((db, coll, id) => ({ _type: "doc", coll, id })),
    getDoc: vi.fn(),
    getDocs: vi.fn(),
    addDoc: vi.fn(),
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

describe("Reward Claim Approval & Rejection Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("approveRedeemRequest", () => {
    it("successfully approves a pending request without mutating points", async () => {
      const mockDocSnap = {
        exists: () => true,
        data: () => ({
          userId: "santri-1",
          rewardId: "r-1",
          pointsRequired: 25,
          status: "PENDING",
        }),
      };
      vi.mocked(firestore.getDoc).mockResolvedValue(mockDocSnap as any);
      vi.mocked(firestore.updateDoc).mockResolvedValue(undefined as any);

      const result = await approveRedeemRequest("req-123", "ustadz-ahmad");

      expect(result.success).toBe(true);
      expect(firestore.updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          status: "APPROVED",
          ustadzId: "ustadz-ahmad",
        })
      );
      expect(firestore.increment).not.toHaveBeenCalled();
    });

    it("rejects approval if request is already APPROVED or REJECTED (Idempotency Guard)", async () => {
      const mockDocSnap = {
        exists: () => true,
        data: () => ({
          userId: "santri-1",
          rewardId: "r-1",
          pointsRequired: 25,
          status: "APPROVED",
        }),
      };
      vi.mocked(firestore.getDoc).mockResolvedValue(mockDocSnap as any);

      const result = await approveRedeemRequest("req-123", "ustadz-ahmad");

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/sudah diproses/i);
      expect(firestore.updateDoc).not.toHaveBeenCalled();
    });

    it("returns error if request does not exist", async () => {
      const mockDocSnap = {
        exists: () => false,
      };
      vi.mocked(firestore.getDoc).mockResolvedValue(mockDocSnap as any);

      const result = await approveRedeemRequest("missing-req", "ustadz-ahmad");

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/tidak ditemukan/i);
    });
  });

  describe("rejectRedeemRequest (Atomic Refund Guarantee)", () => {
    it("successfully rejects pending request, refunds points to user, and writes coin ledger", async () => {
      const mockRequestData = {
        userId: "santri-42",
        userName: "Faris",
        rewardId: "r-99",
        rewardName: "Buku Cerita Nabi",
        pointsRequired: 30,
        status: "PENDING",
      };

      const mockTx = {
        get: vi.fn().mockResolvedValue({
          exists: () => true,
          data: () => mockRequestData,
        }),
        update: vi.fn(),
      };

      vi.mocked(firestore.runTransaction).mockImplementation(async (db, cb) => {
        return cb(mockTx as any);
      });

      const result = await rejectRedeemRequest("req-456", "ustadz-ahmad", "Stok barang habis");

      expect(result.success).toBe(true);
      expect(mockTx.update).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          status: "REJECTED",
          ustadzId: "ustadz-ahmad",
          rejectionReason: "Stok barang habis",
        })
      );
      expect(mockTx.update).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          totalPoint: expect.anything(),
        })
      );
      expect(recordCoinTransaction).toHaveBeenCalledWith(
        "santri-42",
        30,
        "EARNED",
        "REWARD_REFUND",
        "req-456",
        expect.stringContaining("Stok barang habis")
      );
    });

    it("prevents double refund if request is already REJECTED", async () => {
      const mockRequestData = {
        userId: "santri-42",
        status: "REJECTED",
      };

      const mockTx = {
        get: vi.fn().mockResolvedValue({
          exists: () => true,
          data: () => mockRequestData,
        }),
        update: vi.fn(),
      };

      vi.mocked(firestore.runTransaction).mockImplementation(async (db, cb) => {
        return cb(mockTx as any);
      });

      const result = await rejectRedeemRequest("req-456", "ustadz-ahmad", "Coba lagi");

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/sudah diproses/i);
      expect(mockTx.update).not.toHaveBeenCalled();
      expect(recordCoinTransaction).not.toHaveBeenCalled();
    });
  });

  describe("getPendingRedeemRequests", () => {
    it("fetches and parses pending requests correctly", async () => {
      const mockDocs = [
        {
          id: "req-1",
          data: () => ({
            userId: "s-1",
            userName: "Aisyah",
            rewardId: "r-1",
            rewardName: "Pensil Warna",
            pointsRequired: 10,
            status: "PENDING",
            createdAt: { toMillis: () => 2000 },
          }),
        },
      ];
      vi.mocked(firestore.getDocs).mockResolvedValue({
        empty: false,
        docs: mockDocs,
      } as any);

      const requests = await getPendingRedeemRequests();

      expect(requests).toHaveLength(1);
      expect(requests[0].id).toBe("req-1");
      expect(requests[0].status).toBe("PENDING");
      expect(requests[0].userName).toBe("Aisyah");
    });
  });
});