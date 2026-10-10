import { describe, it, expect, vi, beforeEach } from "vitest";
import { getUserProfile, addPoints, markCourseCompleted } from "@/lib/services/userService";

vi.mock("@/lib/firebase", () => ({
  db: {},
}));

vi.mock("firebase/firestore", () => {
  return {
    doc: vi.fn(),
    getDoc: vi.fn(),
    updateDoc: vi.fn(),
    increment: vi.fn((n) => ({ _increment: n })),
    arrayUnion: vi.fn((val) => ({ _arrayUnion: val })),
  };
});

describe("User Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getUserProfile", () => {
    it("returns parsed user profile when document exists in Firestore", async () => {
      const { getDoc } = await import("firebase/firestore");
      (getDoc as any).mockResolvedValueOnce({
        exists: () => true,
        id: "user-santri-01",
        data: () => ({
          username: "Ahmad Santri",
          email: "ahmad@example.com",
          role: "santri",
          totalPoint: 45,
          completedCourse: ["course-1"],
          createdAt: "2026-10-08T00:00:00Z",
        }),
      });

      const profile = await getUserProfile("user-santri-01");

      expect(profile).not.toBeNull();
      expect(profile?.uid).toBe("user-santri-01");
      expect(profile?.username).toBe("Ahmad Santri");
      expect(profile?.role).toBe("santri");
      expect(profile?.totalPoint).toBe(45);
      expect(profile?.completedCourse).toEqual(["course-1"]);
    });

    it("returns null when user document does not exist", async () => {
      const { getDoc } = await import("firebase/firestore");
      (getDoc as any).mockResolvedValueOnce({
        exists: () => false,
      });

      const profile = await getUserProfile("user-nonexistent");
      expect(profile).toBeNull();
    });

    it("returns null and handles error when getDoc throws", async () => {
      const { getDoc } = await import("firebase/firestore");
      (getDoc as any).mockRejectedValueOnce(new Error("Network connection lost"));

      const profile = await getUserProfile("user-error");
      expect(profile).toBeNull();
    });
  });

  describe("addPoints", () => {
    it("updates document with incremented points when valid arguments provided", async () => {
      const { updateDoc, increment } = await import("firebase/firestore");
      (updateDoc as any).mockResolvedValueOnce(undefined);

      await addPoints("user-santri-01", 15);

      expect(updateDoc).toHaveBeenCalledTimes(1);
      expect(increment).toHaveBeenCalledWith(15);
    });

    it("does nothing when points are zero or negative", async () => {
      const { updateDoc } = await import("firebase/firestore");

      await addPoints("user-santri-01", 0);
      await addPoints("user-santri-01", -10);

      expect(updateDoc).not.toHaveBeenCalled();
    });

    it("does nothing when uid is empty", async () => {
      const { updateDoc } = await import("firebase/firestore");

      await addPoints("", 20);

      expect(updateDoc).not.toHaveBeenCalled();
    });

    it("propagates error when updateDoc fails", async () => {
      const { updateDoc } = await import("firebase/firestore");
      (updateDoc as any).mockRejectedValueOnce(new Error("Permission denied"));

      await expect(addPoints("user-santri-01", 10)).rejects.toThrow("Permission denied");
    });
  });

  describe("markCourseCompleted", () => {
    it("updates document with arrayUnion of completed course ID", async () => {
      const { updateDoc, arrayUnion } = await import("firebase/firestore");
      (updateDoc as any).mockResolvedValueOnce(undefined);

      await markCourseCompleted("user-santri-01", "course-tajwid-01");

      expect(updateDoc).toHaveBeenCalledTimes(1);
      expect(arrayUnion).toHaveBeenCalledWith("course-tajwid-01");
    });

    it("does nothing when uid or courseId is empty", async () => {
      const { updateDoc } = await import("firebase/firestore");

      await markCourseCompleted("", "course-1");
      await markCourseCompleted("user-1", "");

      expect(updateDoc).not.toHaveBeenCalled();
    });

    it("propagates error when updateDoc fails", async () => {
      const { updateDoc } = await import("firebase/firestore");
      (updateDoc as any).mockRejectedValueOnce(new Error("Firestore write failed"));

      await expect(markCourseCompleted("user-santri-01", "course-1")).rejects.toThrow("Firestore write failed");
    });
  });
});
