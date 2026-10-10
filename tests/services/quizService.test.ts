import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  formatQuizAttemptPayload,
  recordQuizAttempt,
  getUserQuizAttempts,
} from "@/lib/services/quizService";

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

describe("Quiz Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("formatQuizAttemptPayload", () => {
    it("calculates percentage score accurately", () => {
      const payload = formatQuizAttemptPayload("user-1", "tajwid-01", 3, 4, {
        q1: "A",
        q2: "B",
        q3: "C",
        q4: "D",
      });

      expect(payload.userId).toBe("user-1");
      expect(payload.courseId).toBe("tajwid-01");
      expect(payload.correctAnswers).toBe(3);
      expect(payload.totalQuestions).toBe(4);
      expect(payload.score).toBe(75);
      expect(payload.answers).toEqual({ q1: "A", q2: "B", q3: "C", q4: "D" });
      expect(payload.completedAt).toBeDefined();
    });

    it("returns score 0 when totalQuestions is 0", () => {
      const payload = formatQuizAttemptPayload("user-1", "tajwid-01", 0, 0);
      expect(payload.score).toBe(0);
    });

    it("clamps score to maximum 100", () => {
      const payload = formatQuizAttemptPayload("user-1", "tajwid-01", 10, 5);
      expect(payload.score).toBe(100);
    });
  });

  describe("recordQuizAttempt", () => {
    it("successfully creates quiz attempt document in Firestore", async () => {
      const { addDoc } = await import("firebase/firestore");
      (addDoc as any).mockResolvedValueOnce({ id: "attempt-doc-123" });

      const result = await recordQuizAttempt(
        "user-santri-01",
        "makhraj-01",
        5,
        5,
        { q1: "A" }
      );

      expect(addDoc).toHaveBeenCalledTimes(1);
      expect(result.success).toBe(true);
      expect(result.id).toBe("attempt-doc-123");
      expect(result.score).toBe(100);
    });

    it("returns error response when addDoc throws exception", async () => {
      const { addDoc } = await import("firebase/firestore");
      (addDoc as any).mockRejectedValueOnce(new Error("Firestore write quota exceeded"));

      const result = await recordQuizAttempt(
        "user-santri-01",
        "makhraj-01",
        2,
        5
      );

      expect(result.success).toBe(false);
      expect(result.score).toBe(0);
      expect(result.error).toBe("Firestore write quota exceeded");
    });
  });

  describe("getUserQuizAttempts", () => {
    it("returns parsed attempts list for user without courseId filter", async () => {
      const { getDocs } = await import("firebase/firestore");
      const mockDocs = [
        {
          id: "attempt-1",
          data: () => ({
            userId: "user-santri-01",
            courseId: "makhraj-01",
            score: 80,
            totalQuestions: 5,
            correctAnswers: 4,
            completedAt: {
              toDate: () => new Date("2026-10-10T01:30:00Z"),
            },
          }),
        },
      ];
      (getDocs as any).mockResolvedValueOnce({ docs: mockDocs });

      const attempts = await getUserQuizAttempts("user-santri-01");

      expect(attempts).toHaveLength(1);
      expect(attempts[0].id).toBe("attempt-1");
      expect(attempts[0].score).toBe(80);
      expect(attempts[0].completedAt).toBe("2026-10-10T01:30:00.000Z");
    });

    it("returns attempts filtered with specific courseId", async () => {
      const { getDocs, where } = await import("firebase/firestore");
      const mockDocs = [
        {
          id: "attempt-2",
          data: () => ({
            userId: "user-santri-01",
            courseId: "tajwid-mad-01",
            score: 100,
            totalQuestions: 5,
            correctAnswers: 5,
            completedAt: "2026-10-10T02:00:00Z",
          }),
        },
      ];
      (getDocs as any).mockResolvedValueOnce({ docs: mockDocs });

      const attempts = await getUserQuizAttempts("user-santri-01", "tajwid-mad-01");

      expect(where).toHaveBeenCalledWith("courseId", "==", "tajwid-mad-01");
      expect(attempts).toHaveLength(1);
      expect(attempts[0].id).toBe("attempt-2");
      expect(attempts[0].courseId).toBe("tajwid-mad-01");
    });

    it("returns empty array when query fails", async () => {
      const { getDocs } = await import("firebase/firestore");
      (getDocs as any).mockRejectedValueOnce(new Error("Index building in progress"));

      const attempts = await getUserQuizAttempts("user-santri-01");
      expect(attempts).toEqual([]);
    });
  });
});
