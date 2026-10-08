import { describe, it, expect } from "vitest";
import {
  UserProfileSchema,
  CoinTransactionSchema,
  QuizAttemptSchema,
  HalaqahSchema,
} from "@/types/schema";

describe("Schema Migration & Normalization", () => {
  it("normalizes legacy role 'user' to 'santri'", () => {
    const legacyUser = {
      uid: "legacy-123",
      email: "test@example.com",
      role: "user",
      totalPoint: 15,
      completedCourse: ["course-1"],
    };

    const parsed = UserProfileSchema.parse(legacyUser);
    expect(parsed.role).toBe("santri");
    expect(parsed.uid).toBe("legacy-123");
    expect(parsed.totalPoint).toBe(15);
  });

  it("handles missing role by defaulting to 'santri'", () => {
    const userWithoutRole = {
      uid: "norole-123",
      email: "norole@example.com",
    };

    const parsed = UserProfileSchema.parse(userWithoutRole);
    expect(parsed.role).toBe("santri");
    expect(parsed.username).toBe("Santri Hebat");
  });

  it("preserves valid 'ustaz' and 'admin' roles and normalizes 'ustadz'", () => {
    const ustaz = UserProfileSchema.parse({ uid: "u1", role: "ustaz" });
    const admin = UserProfileSchema.parse({ uid: "a1", role: "admin" });
    const ustadz = UserProfileSchema.parse({ uid: "u2", role: "ustadz" });

    expect(ustaz.role).toBe("ustaz");
    expect(admin.role).toBe("admin");
    expect(ustadz.role).toBe("ustaz");
  });

  it("validates CoinTransactionSchema", () => {
    const tx = {
      id: "tx-1",
      userId: "santri-1",
      amount: 10,
      type: "EARNED" as const,
      source: "QUIZ" as const,
      referenceId: "attempt-1",
      description: "Menyelesaikan Kuis Makhorijul Huruf",
      createdAt: new Date().toISOString(),
    };

    const parsed = CoinTransactionSchema.parse(tx);
    expect(parsed.amount).toBe(10);
    expect(parsed.type).toBe("EARNED");
    expect(parsed.source).toBe("QUIZ");
  });

  it("validates QuizAttemptSchema", () => {
    const attempt = {
      id: "attempt-1",
      userId: "santri-1",
      courseId: "huruf-hijaiyah",
      score: 100,
      totalQuestions: 5,
      correctAnswers: 5,
      answers: { q1: "Alif", q2: "Ba" },
      completedAt: new Date().toISOString(),
    };

    const parsed = QuizAttemptSchema.parse(attempt);
    expect(parsed.score).toBe(100);
    expect(parsed.answers["q1"]).toBe("Alif");
  });

  it("validates HalaqahSchema", () => {
    const halaqah = {
      id: "h-1",
      name: "Halaqah Tajwid Awal",
      ustadzId: "ustadz-99",
      description: "Bimbingan makhraj huruf dasar",
    };

    const parsed = HalaqahSchema.parse(halaqah);
    expect(parsed.name).toBe("Halaqah Tajwid Awal");
    expect(parsed.ustadzId).toBe("ustadz-99");
  });
});
