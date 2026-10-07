import { describe, it, expect } from "vitest";
import { UserProfileSchema } from "../types/schema";

describe("SibaQ Auth & Profile Realtime Synchronization", () => {
  it("normalizes firebase auth user and firestore profile data", () => {
    const rawFirestoreDoc = {
      uid: "user-abc",
      email: "santri@tpa.id",
      username: "Faris",
      role: "santri",
      totalPoint: 50,
      completedCourse: ["course-1"],
    };

    const profile = UserProfileSchema.parse(rawFirestoreDoc);
    expect(profile.uid).toBe("user-abc");
    expect(profile.totalPoint).toBe(50);
    expect(profile.completedCourse).toContain("course-1");
  });

  it("handles profile with zero points and empty completed courses correctly", () => {
    const freshUser = {
      uid: "user-new",
      email: "new@tpa.id",
    };

    const profile = UserProfileSchema.parse(freshUser);
    expect(profile.totalPoint).toBe(0);
    expect(profile.completedCourse).toHaveLength(0);
  });
});
