import { describe, it, expect } from "vitest";
import {
  UserProfileSchema,
  CourseSchema,
  QuestionSchema,
  RewardSchema,
  RedeemRequestSchema,
  CoinTransactionSchema,
  SetoranLogSchema,
} from "../types/schema";

describe("SibaQ Zod Schemas Validation", () => {
  it("parses valid user profile with defaults for missing optional fields", () => {
    const rawData = {
      uid: "user-123",
      email: "santri@example.com",
      username: "Ahmad",
      // missing role, totalPoint, completedCourse
    };

    const parsed = UserProfileSchema.parse(rawData);
    expect(parsed.uid).toBe("user-123");
    expect(parsed.username).toBe("Ahmad");
    expect(parsed.totalPoint).toBe(0);
    expect(parsed.completedCourse).toEqual([]);
    expect(parsed.role).toBe("santri");
  });

  it("parses course schema with fallback values", () => {
    const rawCourse = {
      id: "course-hijaiyah-1",
      title: "Mengenal Huruf Hijaiyah",
      category: "Tahsin",
    };

    const parsed = CourseSchema.parse(rawCourse);
    expect(parsed.id).toBe("course-hijaiyah-1");
    expect(parsed.title).toBe("Mengenal Huruf Hijaiyah");
    expect(parsed.level).toBe("Dasar");
    expect(parsed.totalQuestions).toBe(5);
  });

  it("parses question schema and handles prompt vs question aliases", () => {
    const rawQuestion = {
      id: "q-1",
      courseId: "course-1",
      prompt: "Manakah huruf Jim?",
      options: ["ج", "ح", "خ"],
      correctAnswer: "ج",
    };

    const parsed = QuestionSchema.parse(rawQuestion);
    expect(parsed.id).toBe("q-1");
    expect(parsed.prompt).toBe("Manakah huruf Jim?");
    expect(parsed.points).toBe(1);
    expect(parsed.options).toHaveLength(3);
  });

  it("validates reward schema and ensures pointsRequired is positive", () => {
    const validReward = {
      id: "r-1",
      name: "Buku Cerita Nabi",
      pointsRequired: 20,
    };

    expect(() => RewardSchema.parse(validReward)).not.toThrow();

    const invalidReward = {
      id: "r-2",
      name: "Mainan Rusak",
      pointsRequired: -5,
    };

    expect(() => RewardSchema.parse(invalidReward)).toThrow();
  });

  it("validates redeem request schema and normalizes status, cost, pointsRequired", () => {
    const validRequest = {
      userId: "u-1",
      rewardId: "r-1",
      cost: 15,
      status: "pending",
      timestamp: new Date().toISOString(),
    };

    const parsed = RedeemRequestSchema.parse(validRequest);
    expect(parsed.status).toBe("PENDING");
    expect(parsed.cost).toBe(15);
    expect(parsed.pointsRequired).toBe(15);
    expect(parsed.userName).toBe("Santri");
    expect(parsed.rewardName).toBe("Hadiah Santri");
  });

  it("normalizes uppercase and lowercase status for RedeemRequestSchema", () => {
    const p1 = RedeemRequestSchema.parse({ userId: "u-1", rewardId: "r-1", pointsRequired: 20, status: "APPROVED" });
    const p2 = RedeemRequestSchema.parse({ userId: "u-1", rewardId: "r-1", cost: 10, status: "rejected" });

    expect(p1.status).toBe("APPROVED");
    expect(p1.pointsRequired).toBe(20);
    expect(p2.status).toBe("REJECTED");
    expect(p2.pointsRequired).toBe(10);
  });

  it("validates CoinTransactionSchema with 'REWARD_REFUND' source", () => {
    const refundTx = {
      id: "tx-ref-1",
      userId: "santri-123",
      amount: 25,
      type: "EARNED" as const,
      source: "REWARD_REFUND" as const,
      referenceId: "req-99",
      description: "Pengembalian koin: Hadiah ditolak",
    };
    const parsed = CoinTransactionSchema.parse(refundTx);
    expect(parsed.source).toBe("REWARD_REFUND");
    expect(parsed.type).toBe("EARNED");
    expect(parsed.amount).toBe(25);
  });

  it("validates SetoranLogSchema with default kelancaran and bonusCoin", () => {
    const logData = {
      santriId: "s-1",
      santriName: "Faris",
      jilid: "Jilid 2",
      page: 15,
      ustadzId: "u-1",
    };
    const parsed = SetoranLogSchema.parse(logData);
    expect(parsed.kelancaran).toBe("LANCAR");
    expect(parsed.bonusCoin).toBe(1);
    expect(parsed.page).toBe(15);
  });
});
