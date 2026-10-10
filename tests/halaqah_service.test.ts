import { describe, it, expect, vi, beforeEach } from "vitest";
import * as firestore from "firebase/firestore";
import { recordCoinTransaction } from "@/lib/services/coinService";
import {
  getHalaqahSantriList,
  recordSantriSetoran,
  getSantriSetoranLogs,
} from "@/lib/services/halaqahService";

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
  };
});

vi.mock("@/lib/firebase", () => ({
  db: {},
}));

vi.mock("@/lib/services/coinService", () => ({
  recordCoinTransaction: vi.fn().mockResolvedValue("mock-tx-id"),
}));

describe("Halaqah Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns santri list from firestore or fallback when collection empty", async () => {
    vi.mocked(firestore.getDocs).mockResolvedValueOnce({
      empty: true,
      docs: [],
    } as any);

    const list = await getHalaqahSantriList("halaqah-abu-bakar");
    expect(list.length).toBeGreaterThanOrEqual(1);
    expect(list[0].name).toBeDefined();
  });

  it("records santri setoran, updates user progress, and rewards coins", async () => {
    vi.mocked(firestore.addDoc).mockResolvedValueOnce({ id: "setoran-123" } as any);
    vi.mocked(firestore.updateDoc).mockResolvedValueOnce(undefined as any);

    const payload = {
      santriId: "santri-001",
      santriName: "Ahmad Dahlan",
      jilid: "Jilid 3",
      page: 15,
      kelancaran: "LANCAR" as const,
      bonusCoin: 2,
      notes: "Bacaan tajwid makhraj sangat baik",
      ustadzId: "ustadz-123",
    };

    const result = await recordSantriSetoran(payload);
    expect(result.success).toBe(true);
    expect(result.logId).toBe("setoran-123");

    // Check user document was updated
    expect(firestore.updateDoc).toHaveBeenCalled();

    // Check coin reward was recorded
    expect(recordCoinTransaction).toHaveBeenCalledWith(
      "santri-001",
      2,
      "EARNED",
      "MANUAL_ADJUSTMENT",
      "setoran-123",
      expect.stringContaining("Jilid 3")
    );
  });

  describe("getSantriSetoranLogs", () => {
    it("fetches ordered setoran logs for a santri", async () => {
      vi.mocked(firestore.getDocs).mockResolvedValueOnce({
        empty: false,
        docs: [
          {
            id: "log-1",
            data: () => ({
              santriId: "santri-001",
              santriName: "Ahmad Dahlan",
              jilid: "Jilid 3",
              page: 15,
              kelancaran: "LANCAR",
              bonusCoin: 2,
              notes: "Bagus",
              ustadzId: "ustadz-123",
            }),
          },
        ],
      } as any);

      const logs = await getSantriSetoranLogs("santri-001", 10);
      expect(logs).toHaveLength(1);
      expect(logs[0].id).toBe("log-1");
      expect(logs[0].jilid).toBe("Jilid 3");
      expect(logs[0].page).toBe(15);
      expect(logs[0].bonusCoin).toBe(2);
    });

    it("falls back to unindexed query if indexed query fails", async () => {
      // First call (with orderBy) fails
      vi.mocked(firestore.getDocs).mockRejectedValueOnce(
        new Error("The query requires an index")
      );
      // Fallback call (without orderBy) succeeds
      vi.mocked(firestore.getDocs).mockResolvedValueOnce({
        empty: false,
        docs: [
          {
            id: "log-fallback",
            data: () => ({
              santriId: "santri-001",
              santriName: "Ahmad Dahlan",
              jilid: "Jilid 2",
              page: 20,
              kelancaran: "CUKUP",
              bonusCoin: 1,
              ustadzId: "ustadz-123",
            }),
          },
        ],
      } as any);

      const logs = await getSantriSetoranLogs("santri-001", 5);
      expect(logs).toHaveLength(1);
      expect(logs[0].id).toBe("log-fallback");
      expect(logs[0].kelancaran).toBe("CUKUP");
    });

    it("returns empty array when both indexed and fallback queries fail", async () => {
      vi.mocked(firestore.getDocs).mockRejectedValueOnce(new Error("Index error"));
      vi.mocked(firestore.getDocs).mockRejectedValueOnce(new Error("Network error"));

      const logs = await getSantriSetoranLogs("santri-001");
      expect(logs).toEqual([]);
    });
  });
});